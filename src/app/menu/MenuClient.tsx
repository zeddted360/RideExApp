"use client";
import React, { useState } from "react";
import { Star, Plus, Heart, Square, Grid } from "lucide-react";
import { featuredRestaurants } from "../../../data/featuredRestaurants";
import Image from "next/image";

const FoodDeliveryUI = () => {
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("dtoms");
  const [activeFilter, setActiveFilter] = useState<"veg" | "non-veg">(
    "non-veg"
  );
  const [cartCount, setCartCount] = useState(0);
  const [viewMode, setViewMode] = useState<"single" | "grid">("grid"); 

  // Find the selected restaurant
  const restaurant =
    featuredRestaurants.find((r) => r.id === selectedRestaurant) ||
    featuredRestaurants[0];

  // Filter items based on activeFilter
  const filteredItems =
    activeFilter === "veg" ? restaurant.vegetables : restaurant.nonVegetables;

  const addToCart = (item: any) => {
    setCartCount(cartCount + 1);
  };

  // Toggle view mode
  const toggleViewMode = (mode: "single" | "grid") => {
    setViewMode(mode);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Restaurant Tabs */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto py-4 space-x-6 scrollbar-hide">
            {featuredRestaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                onClick={() => setSelectedRestaurant(restaurant.id)}
                className={`flex-shrink-0 flex flex-col items-center space-y-2 p-3 rounded-xl transition-all duration-200 ${
                  selectedRestaurant === restaurant.id
                    ? "bg-orange-50 border-2 border-orange-500"
                    : "hover:bg-gray-50 border-2 border-transparent"
                }`}
              >
                <div
                  className={`w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden ${
                    selectedRestaurant === restaurant.id
                      ? "bg-orange-500"
                      : "bg-gray-100"
                  }`}
                >
                  <Image
                    src={restaurant.logo}
                    alt={`${restaurant.name} logo`}
                    width={64}
                    height={64}
                    className="object-contain"
                  />
                </div>
                <div className="text-center">
                  <p
                    className={`text-sm font-medium ${
                      selectedRestaurant === restaurant.id
                        ? "text-orange-500"
                        : "text-gray-700"
                    }`}
                  >
                    {restaurant.name}
                  </p>
                  <p className="text-xs text-gray-500">{restaurant.category}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 py-4">
            <button
              onClick={() => setActiveFilter("non-veg")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                activeFilter === "non-veg"
                  ? "bg-orange-100 text-orange-600 border border-orange-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className="text-lg">🍖</span>
              <span className="font-medium">Non-Veg</span>
              {activeFilter === "non-veg" && (
                <span className="text-orange-500">×</span>
              )}
            </button>
            <button
              onClick={() => setActiveFilter("veg")}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 ${
                activeFilter === "veg"
                  ? "bg-green-100 text-green-600 border border-green-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <span className="text-lg">🥬</span>
              <span className="font-medium">Veg</span>
            </button>
          </div>
        </div>
      </div>

      {/* Restaurant Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-orange-500">
              {restaurant.name}
            </h1>
            <div className="flex space-x-2">
              <button
                onClick={() => toggleViewMode("single")}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === "single"
                    ? "bg-orange-100 text-orange-600 border border-orange-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Single Column View"
              >
                <Square className="w-6 h-6" />
              </button>
              <button
                onClick={() => toggleViewMode("grid")}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  viewMode === "grid"
                    ? "bg-orange-100 text-orange-600 border border-orange-300"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
                title="Grid View"
              >
                <Grid className="w-6 h-6" />
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span>⭐ {restaurant.rating}</span>
            <span>{restaurant.deliveryTime}</span>
            <span>{restaurant.distance}</span>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredItems.length === 0 ? (
          <p className="text-gray-500 text-center">
            No {activeFilter === "veg" ? "vegetarian" : "non-vegetarian"} items
            available for {restaurant.name}.
          </p>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === "single"
                ? "grid-cols-1"
                : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            }`}
          >
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                <div className="relative h-48">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover rounded-t-xl"
                    quality={75}
                    priority={filteredItems.indexOf(item) < 3}
                    placeholder="blur"
                    blurDataURL="/images/placeholder.webp"
                    onError={(e) => {
                      e.currentTarget.src = "/images/fallback-food.webp";
                    }}
                  />
                  <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors">
                    <Heart className="h-5 w-5 text-gray-400" />
                  </button>
                  <div className="absolute top-3 left-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                    {item.cookTime}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {item.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Star className="h-4 w-4 fill-orange-400 text-orange-400" />
                      <span>{item.rating}</span>
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl font-bold text-gray-900">
                        {item.price}
                      </span>
                      <span className="text-sm text-gray-500 line-through">
                        {item.originalPrice}
                      </span>
                    </div>
                    <button
                      onClick={() => addToCart(item)}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FoodDeliveryUI;
