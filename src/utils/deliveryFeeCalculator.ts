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

// Base delivery fee for 15-minute ride (500 NGN)
const BASE_DELIVERY_FEE = 500;
const BASE_DURATION_MINUTES = 15;

// Distance thresholds (in meters)
const DISTANCE_THRESHOLDS = {
  SHORT: 5000,    // 5km - base fee
  MEDIUM: 10000,  // 10km - 1.5x base fee
  LONG: 15000,    // 15km - 2x base fee
  EXTREME: 20000  // 20km+ - 2.5x base fee
};

// Helper function to clean and validate addresses
function cleanAddress(address: string): string {
  // Remove extra spaces and normalize
  let cleaned = address.trim().replace(/\s+/g, ' ');
  
  // Add "Nigeria" if not present for better geocoding
  if (!cleaned.toLowerCase().includes('nigeria')) {
    cleaned += ', Nigeria';
  }
  
  return cleaned;
}

export async function calculateDeliveryFee(
  deliveryAddress: string,
  selectedBranchId: number,
  branchData?: { id: number; name: string; lat: number; lng: number; address?: string }
): Promise<DeliveryFeeResult> {
  try {
    const { googleMapsApiKey } = validateEnv();
    
    // Use provided branch data or fall back to hardcoded branches
    let selectedBranch: Branch | undefined;
    
    if (branchData) {
      // Use the provided branch data
      selectedBranch = {
        id: branchData.id,
        name: branchData.name,
        lat: branchData.lat,
        lng: branchData.lng,
        address: branchData.address || `${branchData.name}, Owerri, Imo State, Nigeria`
      };
    } else {
      // Fall back to hardcoded branches
      selectedBranch = branches.find(b => b.id === selectedBranchId);
    }
    
    if (!selectedBranch) {
      throw new Error('Selected branch not found');
    }

    // Clean addresses for better API results
    const cleanOrigin = cleanAddress(selectedBranch.address);
    const cleanDestination = cleanAddress(deliveryAddress);
    
    console.log('Calculating delivery fee:', {
      origin: cleanOrigin,
      destination: cleanDestination
    });

    // Use our API route to proxy Google Maps Distance Matrix API
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
      
      // For ZERO_RESULTS, try to provide a reasonable fallback
      if (element.status === 'ZERO_RESULTS') {
        console.log('No route found, using fallback calculation');
        // Return fallback with estimated values
        return {
          fee: BASE_DELIVERY_FEE * 2, // Higher fee for unknown distance
          distance: 'Distance unavailable',
          duration: 'Duration unavailable',
          distanceValue: 15000, // Assume 15km as fallback
          durationValue: 1800 // Assume 30 minutes as fallback
        };
      }
      
      throw new Error(`Distance calculation failed: ${element.status}`);
    }

    const distanceValue = element.distance.value; // in meters
    const durationValue = element.duration.value; // in seconds
    const distance = element.distance.text;
    const duration = element.duration.text;

    // Calculate delivery fee based on distance
    let fee = BASE_DELIVERY_FEE;

    if (distanceValue <= DISTANCE_THRESHOLDS.SHORT) {
      fee = BASE_DELIVERY_FEE;
    } else if (distanceValue <= DISTANCE_THRESHOLDS.MEDIUM) {
      fee = Math.round(BASE_DELIVERY_FEE * 1.5);
    } else if (distanceValue <= DISTANCE_THRESHOLDS.LONG) {
      fee = Math.round(BASE_DELIVERY_FEE * 2);
    } else if (distanceValue <= DISTANCE_THRESHOLDS.EXTREME) {
      fee = Math.round(BASE_DELIVERY_FEE * 2.5);
    } else {
      // For distances beyond 20km, add 500 NGN per additional 5km
      const additionalKm = Math.ceil((distanceValue - DISTANCE_THRESHOLDS.EXTREME) / 5000);
      fee = Math.round(BASE_DELIVERY_FEE * 2.5) + (additionalKm * 500);
    }

    // Add time-based surcharge for longer durations
    const durationMinutes = durationValue / 60;
    if (durationMinutes > BASE_DURATION_MINUTES) {
      const additionalMinutes = Math.ceil(durationMinutes - BASE_DURATION_MINUTES);
      const timeSurcharge = additionalMinutes * 100; // 100 NGN per additional minute
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
    
    // Fallback to base fee if calculation fails
    return {
      fee: BASE_DELIVERY_FEE,
      distance: 'Unknown',
      duration: 'Unknown',
      distanceValue: 0,
      durationValue: 0
    };
  }
}

// Get branch by ID
export function getBranchById(branchId: number): Branch | undefined {
  return branches.find(b => b.id === branchId);
}

// Get all branches
export function getAllBranches(): Branch[] {
  return branches;
}

// Calculate estimated delivery fee without API call (for preview)
export function estimateDeliveryFee(distanceKm: number): number {
  const distanceMeters = distanceKm * 1000;
  let fee = BASE_DELIVERY_FEE;

  if (distanceMeters <= DISTANCE_THRESHOLDS.SHORT) {
    fee = BASE_DELIVERY_FEE;
  } else if (distanceMeters <= DISTANCE_THRESHOLDS.MEDIUM) {
    fee = Math.round(BASE_DELIVERY_FEE * 1.5);
  } else if (distanceMeters <= DISTANCE_THRESHOLDS.LONG) {
    fee = Math.round(BASE_DELIVERY_FEE * 2);
  } else if (distanceMeters <= DISTANCE_THRESHOLDS.EXTREME) {
    fee = Math.round(BASE_DELIVERY_FEE * 2.5);
  } else {
    const additionalKm = Math.ceil((distanceMeters - DISTANCE_THRESHOLDS.EXTREME) / 5000);
    fee = Math.round(BASE_DELIVERY_FEE * 2.5) + (additionalKm * 500);
  }

  return fee;
} 