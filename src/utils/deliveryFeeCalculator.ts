import { validateEnv } from "./appwrite";

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
    address: "Obinze, Owerri, Imo State, Nigeria",
  },
  {
    id: 2,
    name: "FavGrab FUTO (OWERRI)",
    lat: 5.3846,
    lng: 6.996,
    address: "Federal University of Technology, Owerri, Imo State, Nigeria",
  },
];

// === CONSTANTS ===
const BASE_DURATION_MINUTES = 15;
const TIME_SURCHARGE_PER_MINUTE = 100;
const PRICE_PER_KM = 333; // Based on table
const MAX_TABLE_DISTANCE_KM = 25; // Table goes up to 25km
const CLOSER_THRESHOLD_METERS = 10000; // 10km

// === HELPERS ===
function cleanAddress(address: string): string {
  let cleaned = address.trim().replace(/\s+/g, " ");
  if (!cleaned.toLowerCase().includes("nigeria")) {
    cleaned += ", Nigeria";
  }
  return cleaned;
}

// === MAIN DELIVERY FEE CALCULATION ===
export async function calculateDeliveryFee(
  deliveryAddress: string,
  selectedBranch: Branch,
  restaurantAddresses: string[]
): Promise<DeliveryFeeResult> {
  try {

    if (!selectedBranch) {
      throw new Error("Selected branch not found");
    }

    const cleanDestination = cleanAddress(deliveryAddress);

    if (!restaurantAddresses.length) {
      // Fallback to branch-to-user
      const cleanOrigin = cleanAddress(selectedBranch.address);
      const response = await fetch(
        `/api/distance-matrix?origins=${encodeURIComponent(
          cleanOrigin
        )}&destinations=${encodeURIComponent(cleanDestination)}`
      );
      const data = await response.json();
      if (data.status !== "OK") throw new Error("Fallback failed");
      const element = data.rows[0].elements[0];
      if (element.status !== "OK") throw new Error("Fallback element failed");
      const distanceValue = element.distance.value;
      const durationValue = element.duration.value;
      const distanceKm = distanceValue / 1000;
      let fee = Math.round(PRICE_PER_KM * distanceKm);
      const durationMinutes = durationValue / 60;
      if (durationMinutes > BASE_DURATION_MINUTES) {
        const additionalMinutes = Math.ceil(
          durationMinutes - BASE_DURATION_MINUTES
        );
        fee += additionalMinutes * TIME_SURCHARGE_PER_MINUTE;
      }
      return {
        fee,
        distance: element.distance.text,
        duration: element.duration.text,
        distanceValue,
        durationValue,
      };
    }

    const cleanBranch = cleanAddress(selectedBranch.address);
    const cleanRestos = restaurantAddresses.map(cleanAddress).filter(Boolean);

    // Filter closer restaurants
    const filterResponse = await fetch(
      `/api/distance-matrix?origins=${encodeURIComponent(
        cleanBranch
      )}&destinations=${cleanRestos.map(encodeURIComponent).join("|")}`
    );
    const filterData = await filterResponse.json();
    if (filterData.status !== "OK") throw new Error("Filter failed");

    const filterElements = filterData.rows[0].elements;
    let closerRestos: string[] = [];
    filterElements.forEach((el: any, i: number) => {
      if (el.status === "OK" && el.distance.value < CLOSER_THRESHOLD_METERS) {
        closerRestos.push(cleanRestos[i]);
      }
    });

    if (!closerRestos.length) {
      closerRestos = cleanRestos; // Fallback to all
    }

    // Calculate user distances
    const userResponse = await fetch(
      `/api/distance-matrix?origins=${closerRestos
        .map(encodeURIComponent)
        .join("|")}&destinations=${encodeURIComponent(cleanDestination)}`
    );
    const userData = await userResponse.json();
    if (userData.status !== "OK") throw new Error("User distance failed");

    const userElements = userData.rows.map((row: any) => row.elements[0]);
    let maxDistanceValue = 0;
    let maxDurationValue = 0;
    let maxDistanceText = "";
    let maxDurationText = "";
    userElements.forEach((el: any) => {
      if (el.status === "OK" && el.distance.value > maxDistanceValue) {
        maxDistanceValue = el.distance.value;
        maxDurationValue = el.duration.value;
        maxDistanceText = el.distance.text;
        maxDurationText = el.duration.text;
      }
    });

    if (maxDistanceValue === 0) {
      throw new Error("No valid distances");
    }

    const distanceKm = maxDistanceValue / 1000;
    let fee = Math.round(PRICE_PER_KM * distanceKm);
    const durationMinutes = maxDurationValue / 60;
    if (durationMinutes > BASE_DURATION_MINUTES) {
      const additionalMinutes = Math.ceil(
        durationMinutes - BASE_DURATION_MINUTES
      );
      fee += additionalMinutes * TIME_SURCHARGE_PER_MINUTE;
    }

    return {
      fee,
      distance: maxDistanceText,
      duration: maxDurationText,
      distanceValue: maxDistanceValue,
      durationValue: maxDurationValue,
    };
  } catch (error) {
    console.error("Error calculating delivery fee:", error);

    return {
      fee: PRICE_PER_KM * 5, // fallback = 5km fee
      distance: "Unknown",
      duration: "Unknown",
      distanceValue: 0,
      durationValue: 0,
    };
  }
}

// === BRANCH HELPERS ===
export function getBranchById(branchId: number): Branch | undefined {
  return branches.find((b) => b.id === branchId);
}

export function getAllBranches(): Branch[] {
  return branches;
}

// === QUICK FEE ESTIMATE (without API) ===
export function estimateDeliveryFee(distanceKm: number): number {
  return Math.round(PRICE_PER_KM * distanceKm);
}
