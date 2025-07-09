import {
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import React, { useState } from "react";
import Image from "next/image";
import { featuredItems } from "../../data/featuredItems";
import { IFeaturedItem } from "../../types/types";
import { useShowCart } from "@/context/showCart";

interface IFeaturedItemProps {
  toggleFavorite: (id: string) => void;
  favorites: Set<unknown>;
}

const FeaturedItem = ({ toggleFavorite, favorites }: IFeaturedItemProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 8;

  // Calculate the items to display based on the current page
  const startIndex = currentPage * itemsPerPage;
  const displayedItems = featuredItems.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Navigation handlers
  const handleNext = () => {
    if (startIndex + itemsPerPage < featuredItems.length) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const { setIsOpen, setItem } = useShowCart();

  return (
    <div>
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              Featured Items
            </h2>
            <p className="text-gray-600 text-base">
              Discover our most popular dishes
            </p>
          </div>

          {/* Navigation Buttons and Grid Container */}
          <div className="relative">
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={currentPage === 0}
              className={`absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md transition-colors duration-200 z-10 ${
                currentPage === 0
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white"
              }`}
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={startIndex + itemsPerPage >= featuredItems.length}
              className={`absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-md transition-colors duration-200 z-10 ${
                startIndex + itemsPerPage >= featuredItems.length
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-white"
              }`}
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>

            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {displayedItems.map((item: IFeaturedItem, index) => (
                <div
                  key={index}
                  className="group bg-gradient-to-br from-orange-50 to-red-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative">
                    <div className="w-full h-32 overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={200}
                        height={150}
                        className="object-cover w-full h-full"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <button
                      // onClick={() => toggleFavorite(`item-${item.id}`)}
                      className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full hover:bg-white transition-colors duration-200"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 ${
                          favorites.has(`item-${index}`)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600"
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

                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 text-sm mb-1 line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                      {item.restaurant}
                    </p>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-orange-600">
                        {item.price}
                      </span>
                      <button
                        onClick={() => {
                          setItem({
                            userId: "zedd",
                            itemId: item.rating.toString(),
                            name: item.name,
                            image: item.image,
                            price: item.price,
                            restaurantId: item.restaurant,
                            quantity: 1,
                            category: item.category,
                          });
                          setIsOpen(true);
                        }}
                        aria-label={`Add ${item.name} to cart`}
                        className="flex items-center bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 py-1.5 rounded-full font-semibold text-xs hover:from-orange-600 hover:to-orange-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                        Add to Cart
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

export default FeaturedItem;
