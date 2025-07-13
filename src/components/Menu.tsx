"use client";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import React, { useEffect, useRef, Suspense } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { listAsyncRestaurants } from "@/state/restaurantSlice";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { IRestaurantFetched } from "../../types/types";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

const RestaurantCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-auto animate-pulse">
    <Skeleton className="w-full h-28 sm:h-32 md:h-36 rounded-t-xl" />
    <div className="p-3 sm:p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex items-center gap-3">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-12" />
      </div>
    </div>
  </div>
);

const RestaurantCard = ({
  restaurant,
  router,
}: {
  restaurant: IRestaurantFetched;
  router: AppRouterInstance;
}) => (
  <div
    onClick={() => router.push(`/menu`)}
    className="group bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex-shrink-0 w-[160px] sm:w-[180px] md:w-[200px] lg:w-auto hover:scale-105 cursor-pointer"
  >
    <div className="relative">
      <div className="w-full h-28 sm:h-32 md:h-36 overflow-hidden rounded-t-xl">
        <Image
          src={fileUrl(validateEnv().restaurantBucketId, restaurant.logo)}
          alt={restaurant.name}
          width={200}
          height={150}
          quality={100}
          priority
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 640px) 160px, (max-width: 768px) 180px, (max-width: 1024px) 200px, 25vw"
        />
      </div>
      <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-opacity duration-200 group-hover:opacity-90">
        <Star className="w-3 h-3 fill-current" />
        {restaurant.rating}
      </div>
    </div>
    <div className="p-3 sm:p-4">
      <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-gray-100 mb-1 sm:mb-2 line-clamp-1">
        {restaurant.name}
      </h3>
      <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 sm:space-y-2">
        <p className="line-clamp-1 font-medium">{restaurant.category}</p>
        <div className="flex items-center gap-2 sm:gap-4 text-gray-500 dark:text-gray-400 text-xs">
          <span className="truncate">{restaurant.deliveryTime}</span>
          <span className="truncate">{restaurant.distance}</span>
        </div>
      </div>
    </div>
  </div>
);

const Menu = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading, restaurants } = useSelector(
    (state: RootState) => state.restaurant
  );
  const router = useRouter();
  // Scroll functions
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (loading === "idle") {
      dispatch(listAsyncRestaurants());
    }
  }, [dispatch, loading]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
              Our Menu
            </h2>
            <Button
              variant="outline"
              className="bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-800/30 hover:text-orange-700 dark:hover:text-orange-300 transition-colors duration-200"
            >
              View All
            </Button>
          </div>

          <div className="relative">
            {/* Navigation Arrows */}
            <Button
              onClick={scrollLeft}
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md hover:bg-white dark:hover:bg-gray-700 z-10 hidden sm:flex"
            >
              <ChevronLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </Button>
            <Button
              onClick={scrollRight}
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-md hover:bg-white dark:hover:bg-gray-700 z-10 hidden sm:flex"
            >
              <ChevronRight className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </Button>

            {/* Scrollable/grid container */}
            <Suspense
              fallback={
                <div className="flex overflow-x-auto space-x-3 sm:space-x-4 pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:gap-6 sm:overflow-visible scrollbar-hide">
                  {[...Array(4)].map((_, index) => (
                    <RestaurantCardSkeleton key={index} />
                  ))}
                </div>
              }
            >
              <div
                ref={scrollRef}
                className="flex overflow-x-auto space-x-3 sm:space-x-4 pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:gap-6 sm:overflow-visible scrollbar-hide snap-x snap-mandatory"
              >
                {loading === "idle" || loading === "pending" ? (
                  [...Array(4)].map((_, index) => (
                    <RestaurantCardSkeleton key={index} />
                  ))
                ) : loading === "failed" ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-red-500 text-lg">
                      Error loading restaurants: {error}
                    </p>
                  </div>
                ) : restaurants.length > 0 ? (
                  restaurants.map((restaurant, index) => (
                    <RestaurantCard
                      key={`${restaurant.$id}-${index}`}
                      restaurant={restaurant}
                      router={router}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg">
                      No restaurants available
                    </p>
                  </div>
                )}
              </div>
            </Suspense>
          </div>
        </div>
      </section>

      {/* CSS for smooth scrolling and snap */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .snap-x {
          scroll-snap-type: x mandatory;
        }
        .snap-mandatory > div {
          scroll-snap-align: start;
        }
      `}</style>
    </div>
  );
};

export default Menu;
