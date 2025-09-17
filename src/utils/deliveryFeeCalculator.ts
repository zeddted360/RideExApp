import { validateEnv } from './appwrite';
export interface DeliveryFeeResult {
  fee: number;
  distance: string;
  duration: string;
  distanceValue: number; // in meters
  durationValue: number; // in seconds
}

export interface Branch {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
}

const branches: Branch[] = [
  { 
    id: 1, 
    name: "FAVGRAB OWERRI-1 (main)", 
    lat: 5.4862, 
    lng: 7.0256,
    address: "Obinze, Owerri, Imo State, Nigeria"
  },
  { 
    id: 2, 
    name: "FavGrab FUTO (OWERRI)", 
    lat: 5.3846, 
    lng: 6.996,
    address: "Federal University of Technology, Owerri, Imo State, Nigeria"
  },
];

// === CONSTANTS ===
const BASE_DURATION_MINUTES = 15;
const TIME_SURCHARGE_PER_MINUTE = 100;
const PRICE_PER_KM = 333; // Based on table
const MAX_TABLE_DISTANCE_KM = 25; // Table goes up to 25km

// === HELPERS ===
function cleanAddress(address: string): string {
  let cleaned = address.trim().replace(/\s+/g, ' ');
  if (!cleaned.toLowerCase().includes('nigeria')) {
    cleaned += ', Nigeria';
  }
  return cleaned;
}

// === MAIN DELIVERY FEE CALCULATION ===
export async function calculateDeliveryFee(
  deliveryAddress: string,
  selectedBranchId: number,
  branchData?: { id: number; name: string; lat: number; lng: number; address?: string }
): Promise<DeliveryFeeResult> {
  try {
    const { googleMapsApiKey } = validateEnv();

    let selectedBranch: Branch | undefined;
    if (branchData) {
      selectedBranch = {
        id: branchData.id,
        name: branchData.name,
        lat: branchData.lat,
        lng: branchData.lng,
        address: branchData.address || `${branchData.name}, Owerri, Imo State, Nigeria`
      };
    } else {
      selectedBranch = branches.find(b => b.id === selectedBranchId);
    }

    if (!selectedBranch) {
      throw new Error('Selected branch not found');
    }

    const cleanOrigin = cleanAddress(selectedBranch.address);
    const cleanDestination = cleanAddress(deliveryAddress);

    const response = await fetch(
      `/api/distance-matrix?origins=${encodeURIComponent(cleanOrigin)}&destinations=${encodeURIComponent(cleanDestination)}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch distance data');
    }

    const data = await response.json();

    if (data.status !== 'OK' || !data.rows[0]?.elements[0]) {
      throw new Error('Invalid response from Google Maps API');
    }

    const element = data.rows[0].elements[0];

    if (element.status !== 'OK') {
      console.warn(`Distance calculation failed: ${element.status} for ${selectedBranch.address} to ${deliveryAddress}`);

      if (element.status === 'ZERO_RESULTS') {
        return {
          fee: PRICE_PER_KM * MAX_TABLE_DISTANCE_KM, // fallback to 25km fee
          distance: 'Distance unavailable',
          duration: 'Duration unavailable',
          distanceValue: MAX_TABLE_DISTANCE_KM * 1000,
          durationValue: 1800 // 30 minutes fallback
        };
      }

      throw new Error(`Distance calculation failed: ${element.status}`);
    }

    const distanceValue = element.distance.value; // in meters
    const durationValue = element.duration.value; // in seconds
    const distance = element.distance.text;
    const duration = element.duration.text;

    // Convert meters → km
    const distanceKm = distanceValue / 1000;

    // === Delivery fee calculation ===
    let fee = Math.round(PRICE_PER_KM * distanceKm);

    // Add time-based surcharge if duration > base
    const durationMinutes = durationValue / 60;
    if (durationMinutes > BASE_DURATION_MINUTES) {
      const additionalMinutes = Math.ceil(durationMinutes - BASE_DURATION_MINUTES);
      const timeSurcharge = additionalMinutes * TIME_SURCHARGE_PER_MINUTE;
      fee += timeSurcharge;
    }

    return {
      fee,
      distance,
      duration,
      distanceValue,
      durationValue
    };

  } catch (error) {
    console.error('Error calculating delivery fee:', error);

    return {
      fee: PRICE_PER_KM * 5, // fallback = 5km fee
      distance: 'Unknown',
      duration: 'Unknown',
      distanceValue: 0,
      durationValue: 0
    };
  }
}

// === BRANCH HELPERS ===
export function getBranchById(branchId: number): Branch | undefined {
  return branches.find(b => b.id === branchId);
}

export function getAllBranches(): Branch[] {
  return branches;
}

// === QUICK FEE ESTIMATE (without API) ===
export function estimateDeliveryFee(distanceKm: number): number {
  return Math.round(PRICE_PER_KM * distanceKm);
}
