import { Skeleton } from "./skeleton";

// Skeleton component for loading state
const RestaurantCardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-md overflow-hidden flex-shrink-0 w-[200px] sm:w-auto animate-pulse">
    <Skeleton className="w-full h-36 rounded-t-xl bg-gray-200" />
    <div className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4 bg-gray-200" />
      <Skeleton className="h-4 w-1/2 bg-gray-200" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-12 bg-gray-200" />
        <Skeleton className="h-4 w-12 bg-gray-200" />
      </div>
    </div>
  </div>
);
export default RestaurantCardSkeleton;