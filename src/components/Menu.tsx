import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import React, { useRef } from "react";
import Image from "next/image";
import { IfeaturedRestaurant } from "../../types/types";

interface IMenuProps {
  featuredRestaurants: IfeaturedRestaurant[];
  favorites: any;
}

const Menu = ({ featuredRestaurants }: IMenuProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Function to scroll left
  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" });
    }
  };

  // Function to scroll right
  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" });
    }
  };

  return (
    <div>
      {/* Our Menu Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Our Menu
            </h2>
            <button className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full font-semibold hover:bg-orange-200 transition-colors duration-200 text-sm">
              View All
            </button>
          </div>

          {/* Responsive container with navigation arrows */}
          <div className="relative">
            {/* Left Arrow */}
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors duration-200 sm:hidden z-10"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors duration-200 sm:hidden z-10"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>

            {/* Scrollable/grid container */}
            <div
              ref={scrollRef}
              className="flex overflow-x-auto space-x-4 pb-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 sm:overflow-visible scrollbar-hide"
            >
              {featuredRestaurants.map((restaurant) => (
                <div
                  key={restaurant.id}
                  className="group bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden flex-shrink-0 w-[200px] sm:w-auto"
                >
                  <div className="relative">
                    <div className="w-full h-36 overflow-hidden rounded-t-xl">
                      <Image
                        src={restaurant.image}
                        alt={restaurant.name}
                        width={200}
                        height={150}
                        quality={100}
                        priority
                        className="object-cover w-full h-full"
                        sizes="(max-width: 768px) 50vw, 25vw"
                      />
                    </div>
                    <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-1.5 py-0.5 rounded-full text-xs font-medium flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-current" />
                      {restaurant.rating}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-1">
                      {restaurant.name}
                    </h3>
                    <div className="text-xs text-gray-600 mb-3 space-y-1">
                      <p className="line-clamp-1">{restaurant.category}</p>
                      <div className="flex items-center gap-3">
                        <span>{restaurant.deliveryTime}</span>
                        <span>{restaurant.distance}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CSS to hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Menu;
