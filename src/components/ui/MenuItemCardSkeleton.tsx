import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton"; // Shadcn Skeleton component

const MenuItemSkeleton = ({ viewMode }: { viewMode: "grid" | "list" }) => {
  return (
    <div
      className={cn(
        "bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100",
        viewMode === "list" && "flex flex-col sm:flex-row items-start gap-4 p-4"
      )}
    >
      {/* Image Skeleton */}
      <div
        className={cn(
          "relative overflow-hidden",
          viewMode === "grid" ? "h-40 w-full" : "h-60 w-full sm:w-1/3",
          viewMode === "grid" ? "rounded-t-xl" : "rounded-xl"
        )}
      >
        <Skeleton className="w-full h-full bg-gray-200" />
        {/* Category Badge Skeleton */}
        <Skeleton className="absolute top-3 left-3 h-6 w-16 bg-gray-200 rounded" />
      </div>

      {/* Content Skeleton */}
      <div className={cn("p-4", viewMode === "list" && "sm:w-2/3")}>
        {/* Name Skeleton */}
        <Skeleton className="h-6 w-3/4 bg-gray-200 rounded mb-3" />
        {/* Description Skeleton */}
        <div
          className={cn(
            "space-y-2 mb-3",
            viewMode === "grid" ? "h-12" : "h-16"
          )}
        >
          <Skeleton className="h-4 w-full bg-gray-200 rounded" />
          <Skeleton className="h-4 w-5/6 bg-gray-200 rounded" />
          {viewMode === "list" && (
            <Skeleton className="h-4 w-4/5 bg-gray-200 rounded" />
          )}
        </div>
        {/* Price Skeleton */}
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-6 w-1/4 bg-gray-200 rounded" />
          <Skeleton className="h-4 w-1/5 bg-gray-200 rounded" />
        </div>
        {/* Cook Time Skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-4 bg-gray-200 rounded-full" />
          <Skeleton className="h-4 w-1/3 bg-gray-200 rounded" />
        </div>
        {/* Button Skeleton */}
        <Skeleton className="h-10 w-full bg-gray-200 rounded-lg" />
      </div>
    </div>
  );
};

const MenuItemCardSkeleton = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Restaurant Header Skeleton */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-1/3 bg-gray-200 rounded" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 bg-gray-200 rounded" />
            <Skeleton className="h-8 w-8 bg-gray-200 rounded" />
          </div>
        </div>
      </div>

      {/* Food Category Tabs Skeleton */}
      <div className="flex justify-center gap-2 p-2 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center gap-2 px-6 py-2">
          <Skeleton className="h-2 w-2 bg-gray-200 rounded-full" />
          <Skeleton className="h-5 w-12 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-2 px-6 py-2">
          <Skeleton className="h-2 w-2 bg-gray-200 rounded-full" />
          <Skeleton className="h-5 w-20 bg-gray-200 rounded" />
        </div>
        <div className="flex items-center gap-2 px-6 py-2">
          <Skeleton className="h-2 w-2 bg-gray-200 rounded-full" />
          <Skeleton className="h-5 w-24 bg-gray-200 rounded" />
        </div>
      </div>

      {/* Menu Items Skeleton - Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, index) => (
          <MenuItemSkeleton key={`grid-${index}`} viewMode="grid" />
        ))}
      </div>

      {/* Menu Items Skeleton - List View */}
      <div className="flex flex-col gap-4">
        {[...Array(2)].map((_, index) => (
          <MenuItemSkeleton key={`list-${index}`} viewMode="list" />
        ))}
      </div>
    </div>
  );
};

export default MenuItemCardSkeleton;
