"use client";
import {
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { IPopularItemFetched } from "../../types/types";
import { useShowCart } from "@/context/showCart";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import toast from "react-hot-toast";
import { listAsyncPopularItems } from "@/state/popularSlice";

interface IPopularItemProps {
  toggleFavorite: (id: string) => void;
  favorites: Set<string>;
}

const PopularItem = ({ toggleFavorite, favorites }: IPopularItemProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;
  const dispatch = useDispatch<AppDispatch>();
  const { popularItems, loading, error } = useSelector(
    (state: RootState) => state.popularItem
  );
  const { setIsOpen, setItem } = useShowCart();

  // Fetch popular items on mount
  useEffect(() => {
    if (loading === "idle") {
      dispatch(listAsyncPopularItems())
        .unwrap()
        .catch((err) => {
          toast.error(
            `Failed to fetch popular items: ${
              err instanceof Error ? err.message : "Unknown error"
            }`
          );
        });
    }
  }, [dispatch, loading]);

  // Calculate the items to display based on the current page
  const startIndex = currentPage * itemsPerPage;
  const displayedItems = popularItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Navigation handlers
  const handleNext = () => {
    if (startIndex + itemsPerPage < popularItems.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Handle loading and error states
  if (loading === "pending") {
    return (
      <div className="text-center py-12">
        <p>Loading popular items...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div>
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              Popular Items
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-base">
              Discover our trending dishes
            </p>
          </div>

          {/* Navigation Buttons and Grid Container */}
          <div className="relative">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full shadow-md transition-colors duration-200 z-10 ${
                currentPage === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white dark:hover:bg-gray-700"
              }`}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={startIndex + itemsPerPage >= popularItems.length}
              className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full shadow-md transition-colors duration-200 z-10 ${
                startIndex + itemsPerPage >= popularItems.length
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white dark:hover:bg-gray-700"
              }`}
            >
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {displayedItems.map((item: IPopularItemFetched) => (
                <div
                  key={item.$id}
                  className="group bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative">
                    <div className="w-full h-28 sm:h-32 overflow-hidden">
                      <Image
                        src={fileUrl(validateEnv().popularBucketId, item.image)}
                        alt={item.name}
                        width={200}
                        height={150}
                        className="object-cover w-full h-full"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      />
                    </div>
                    <button
                      onClick={() => toggleFavorite(item.$id)}
                      className="absolute top-2 right-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          favorites.has(item.$id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600 dark:text-gray-300"
                        }`}
                      />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium">
                      <div className="flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-current" />
                        {item.rating}
                      </div>
                    </div>
                  </div>

                  <div className="p-2 sm:p-3">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 line-clamp-1">
                      {item.category}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base font-bold text-orange-600 dark:text-orange-400">
                        ₦{item.price}
                      </span>
                      <button
                        onClick={() => {
                          setItem({
                            userId: "zedd",
                            itemId: item.$id,
                            name: item.name,
                            image: item.image,
                            price: item.price,
                            restaurantId: item.restaurantId,
                            quantity: 1,
                            category: item.category,
                            source: "popular",
                          });
                          setIsOpen(true);
                        }}
                        aria-label={`Add ${item.name} to cart`}
                        className="flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-semibold text-xs hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50"
                      >
                        <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1" />
                        <span className="hidden sm:inline">Add to Cart</span>
                        <span className="sm:hidden">Add</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PopularItem; 