"use client";
import { listAsyncRestaurants } from "@/state/restaurantSlice";
import { AppDispatch, RootState } from "@/state/store";
import {
  Clock,
  ShoppingCart,
  Utensils,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import RestaurantCardSkeleton from "./restaurantCardSkeleton";
import MenuItemCardSkeleton from "./MenuItemCardSkeleton"; 
import { Alert, AlertDescription, AlertTitle } from "./alert";
import { Button } from "./button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";
import { Badge } from "./badge";
import Image from "next/image";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { cn } from "@/lib/utils";
import { listAsyncMenusItem } from "@/state/menuSlice";

const RestaurantList = () => {
  const dispatch = useDispatch<AppDispatch>();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { error, loading, restaurants } = useSelector(
    (state: RootState) => state.restaurant
  );
  const {
    menuItems,
    loading: menuLoading,
    error: menuError,
  } = useSelector((state: RootState) => state.menuItem);

  // State for view mode (grid or list)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    if (loading === "idle") {
      dispatch(listAsyncRestaurants());
    }
    if (menuLoading === "idle") {
      dispatch(listAsyncMenusItem());
    }
  }, [dispatch, loading, menuLoading]);

  // Scroll functions for restaurant cards
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

  // Error state for menu items
  if (menuError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Utensils className="w-12 h-12 text-red-500" />
          </div>
          <Alert
            variant="destructive"
            className="max-w-md bg-white/90 backdrop-blur-sm border-red-100 shadow-sm"
          >
            <AlertTitle className="text-xl font-semibold text-red-800">
              Failed to Load Menu
            </AlertTitle>
            <AlertDescription className="text-red-600 mt-2">
              {menuError || "Failed to load menu items. Please try again."}
            </AlertDescription>
            <Button
              className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg py-2 transition-all duration-300"
              onClick={() => dispatch(listAsyncMenusItem())}
              aria-label="Retry loading menu items"
            >
              Try Again
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading === "pending" || menuLoading === "pending") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col items-center justify-center py-20">
          {loading === "pending" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-7xl px-4">
              {[...Array(4)].map((_, index) => (
                <RestaurantCardSkeleton key={index} />
              ))}
            </div>
          ) : (
            <MenuItemCardSkeleton /> 
          )}
        </div>
      </div>
    );
  }

  // Success state with restaurants
  if (loading === "succeeded" && restaurants.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue={restaurants[0].$id} className="w-full">
            {/* Restaurant Cards */}
            <div className="sticky top-0 z-10 bg-gray-50 py-4">
              <div className="relative flex items-center">
                {restaurants.length > 6 && (
                  <>
                    <Button
                      onClick={scrollLeft}
                      variant="outline"
                      size="icon"
                      className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white rounded-full z-20 hidden sm:flex"
                      aria-label="Scroll left"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </Button>
                    <Button
                      onClick={scrollRight}
                      variant="outline"
                      size="icon"
                      className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm shadow-sm hover:bg-white rounded-full z-20 hidden sm:flex"
                      aria-label="Scroll right"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </Button>
                  </>
                )}
                <TabsList
                  ref={scrollRef}
                  className={cn(
                    "flex flex-row flex-nowrap gap-4 p-0 bg-transparent w-full h-fit mx-4",
                    restaurants.length > 6 &&
                      "overflow-x-auto scrollbar-hide snap-x snap-mandatory"
                  )}
                >
                  {restaurants.map((restaurant) => (
                    <TabsTrigger
                      key={restaurant.$id}
                      value={restaurant.$id}
                      className={cn(
                        "flex flex-col items-center h-fit w-fit gap-2 p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 flex-shrink-0",
                        "min-w-[100px] max-w-[120px] sm:min-w-[140px] sm:max-w-[180px]",
                        "data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg"
                      )}
                    >
                      <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                        <Image
                          src={fileUrl(
                            validateEnv().restaurantBucketId,
                            restaurant.logo
                          )}
                          alt={restaurant.name}
                          className="rounded-full object-cover ring-2 ring-white/50"
                          fill
                          sizes="(max-width: 640px) 32px, 40px"
                          priority
                          quality={90}
                        />
                      </div>
                      <div className="text-center flex-1">
                        <span className="font-semibold text-xs sm:text-sm truncate">
                          {restaurant.name.length > 12
                            ? restaurant.name.slice(0, 12) + "..."
                            : restaurant.name}
                        </span>
                      </div>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
            </div>

            {restaurants.map((restaurant) => {
              const items = menuItems.filter(
                (item) => item.restaurantId === restaurant.$id
              );
              return (
                <TabsContent
                  key={restaurant.$id}
                  value={restaurant.$id}
                  className="mt-6"
                >
                  {/* Restaurant Header */}
                  <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-gray-100 mb-8">
                    <div className="">
                      <div className="flex-1 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {restaurant.name}
                        </h2>
                        <div className="flex items-center justify-between">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewMode("grid")}
                            className={cn(
                              "p-1",
                              viewMode === "grid" && "bg-gray-100"
                            )}
                            aria-label="Switch to grid view"
                          >
                            <Grid className="w-5 h-5 text-gray-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewMode("list")}
                            className={cn(
                              "p-1",
                              viewMode === "list" && "bg-gray-100"
                            )}
                            aria-label="Switch to list view"
                          >
                            <List className="w-5 h-5 text-gray-600" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Food Category Tabs */}
                  <Tabs defaultValue="all" className="w-full">
                    <TabsList className="flex justify-center gap-2 p-2 bg-white/90 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm mb-6">
                      <TabsTrigger
                        value="all"
                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 data-[state=active]:bg-blue-500 data-[state=active]:text-white hover:bg-gray-100"
                      >
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        All
                      </TabsTrigger>
                      <TabsTrigger
                        value="veg"
                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 data-[state=active]:bg-green-500 data-[state=active]:text-white hover:bg-gray-100"
                      >
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Vegetarian
                      </TabsTrigger>
                      <TabsTrigger
                        value="non-veg"
                        className="flex items-center gap-2 px-6 py-2 text-sm font-medium rounded-lg transition-all duration-300 data-[state=active]:bg-red-500 data-[state=active]:text-white hover:bg-gray-100"
                      >
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Non-Vegetarian
                      </TabsTrigger>
                    </TabsList>

                    {/* All Items */}
                    <TabsContent value="all">
                      <div
                        className={cn(
                          viewMode === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                            : "flex flex-col gap-4"
                        )}
                      >
                        {items.length === 0 ? (
                          <div
                            className={cn(
                              "bg-white/90 backdrop-blur-sm rounded-xl p-8 text-center shadow-sm border border-gray-100",
                              viewMode === "grid" && "col-span-full"
                            )}
                          >
                            <ChefHat className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              No Menu Items
                            </h3>
                            <p className="text-gray-600">
                              No menu items available for this restaurant.
                            </p>
                          </div>
                        ) : (
                          items.map((item) => (
                            <div
                              key={item.$id}
                              className={cn(
                                "bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group",
                                viewMode === "list" &&
                                  "flex flex-col sm:flex-row items-start gap-4"
                              )}
                            >
                              <div
                                className={cn(
                                  "relative overflow-hidden",
                                  viewMode === "grid"
                                    ? "h-40 w-full"
                                    : "h-60 w-full sm:w-1/3"
                                )}
                              >
                                <Image
                                  src={fileUrl(
                                    validateEnv().menuBucketId,
                                    item.image
                                  )}
                                  alt={item.name}
                                  className={cn(
                                    "object-cover w-full h-full group-hover:scale-105 transition-transform duration-300",
                                    viewMode === "grid"
                                      ? "rounded-t-xl"
                                      : "rounded-xl"
                                  )}
                                  fill
                                  sizes={
                                    viewMode === "grid"
                                      ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                      : "(max-width: 640px) 100vw, 33vw"
                                  }
                                  quality={80}
                                />
                              </div>
                              <div
                                className={cn(
                                  "p-4",
                                  viewMode === "list" && "sm:w-2/3"
                                )}
                              >
                                <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                  {item.name}
                                </h3>
                                <p
                                  className={cn(
                                    "text-sm text-gray-600 mb-3",
                                    viewMode === "grid"
                                      ? "line-clamp-2"
                                      : "line-clamp-3"
                                  )}
                                >
                                  {item.description}
                                </p>
                                <div className="flex items-center justify-between mb-3">
                                  <span
                                    className={cn(
                                      "text-lg font-bold",
                                      item.category === "veg"
                                        ? "text-green-600"
                                        : "text-red-600"
                                    )}
                                  >
                                    ₦{item.price}
                                  </span>
                                  {item.originalPrice && (
                                    <span className="text-sm text-gray-400 line-through">
                                      ₦{item.originalPrice}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                  <Clock className="w-4 h-4" />
                                  {item.cookTime}
                                </div>
                                <Button
                                  className={cn(
                                    "w-full font-medium rounded-lg py-2 transition-all duration-300",
                                    item.category === "veg"
                                      ? "bg-green-500 hover:bg-green-600 text-white"
                                      : "bg-red-500 hover:bg-red-600 text-white"
                                  )}
                                  aria-label={`Add ${item.name} to cart`}
                                >
                                  <ShoppingCart className="w-4 h-4 mr-2" />
                                  Add to Cart
                                </Button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>

                    {/* Vegetarian Items */}
                    <TabsContent value="veg">
                      <div
                        className={cn(
                          viewMode === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                            : "flex flex-col gap-4"
                        )}
                      >
                        {items.filter((item) => item.category === "veg")
                          .length === 0 ? (
                          <div
                            className={cn(
                              "bg-white/90 backdrop-blur-sm rounded-xl p-8 text-center shadow-sm border border-gray-100",
                              viewMode === "grid" && "col-span-full"
                            )}
                          >
                            <ChefHat className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              No Vegetarian Items
                            </h3>
                            <p className="text-gray-600">
                              No vegetarian options available right now.
                            </p>
                          </div>
                        ) : (
                          items
                            .filter((item) => item.category === "veg")
                            .map((item) => (
                              <div
                                key={item.$id}
                                className={cn(
                                  "bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group",
                                  viewMode === "list" &&
                                    "flex flex-col sm:flex-row items-start gap-4"
                                )}
                              >
                                <div
                                  className={cn(
                                    "relative overflow-hidden",
                                    viewMode === "grid"
                                      ? "h-40 w-full"
                                      : "h-60 w-full sm:w-1/3"
                                  )}
                                >
                                  <Image
                                    src={fileUrl(
                                      validateEnv().menuBucketId,
                                      item.image
                                    )}
                                    alt={item.name}
                                    className={cn(
                                      "object-cover w-full h-full group-hover:scale-105 transition-transform duration-300",
                                      viewMode === "grid"
                                        ? "rounded-t-xl"
                                        : "rounded-xl"
                                    )}
                                    fill
                                    sizes={
                                      viewMode === "grid"
                                        ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        : "(max-width: 640px) 100vw, 33vw"
                                    }
                                    quality={80}
                                  />
                                </div>
                                <div
                                  className={cn(
                                    "p-4",
                                    viewMode === "list" && "sm:w-2/3"
                                  )}
                                >
                                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                    {item.name}
                                  </h3>
                                  <p
                                    className={cn(
                                      "text-sm text-gray-600 mb-3",
                                      viewMode === "grid"
                                        ? "line-clamp-2"
                                        : "line-clamp-3"
                                    )}
                                  >
                                    {item.description}
                                  </p>
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-lg font-bold text-green-600">
                                      ₦{item.price}
                                    </span>
                                    {item.originalPrice && (
                                      <span className="text-sm text-gray-400 line-through">
                                        ₦{item.originalPrice}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                    <Clock className="w-4 h-4" />
                                    {item.cookTime}
                                  </div>
                                  <Button
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg py-2 transition-all duration-300"
                                    aria-label={`Add ${item.name} to cart`}
                                  >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Add to Cart
                                  </Button>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </TabsContent>

                    {/* Non-Vegetarian Items */}
                    <TabsContent value="non-veg">
                      <div
                        className={cn(
                          viewMode === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                            : "flex flex-col gap-4"
                        )}
                      >
                        {items.filter((item) => item.category === "non-veg")
                          .length === 0 ? (
                          <div
                            className={cn(
                              "bg-white/90 backdrop-blur-sm rounded-xl p-8 text-center shadow-sm border border-gray-100",
                              viewMode === "grid" && "col-span-full"
                            )}
                          >
                            <ChefHat className="w-12 h-12 text-red-500 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900">
                              No Non-Vegetarian Items
                            </h3>
                            <p className="text-gray-600">
                              No non-vegetarian options available right now.
                            </p>
                          </div>
                        ) : (
                          items
                            .filter((item) => item.category === "non-veg")
                            .map((item) => (
                              <div
                                key={item.$id}
                                className={cn(
                                  "bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 group",
                                  viewMode === "list" &&
                                    "flex flex-col sm:flex-row items-start gap-4"
                                )}
                              >
                                <div
                                  className={cn(
                                    "relative overflow-hidden",
                                    viewMode === "grid"
                                      ? "h-40 w-full"
                                      : "h-60 w-full sm:w-1/3"
                                  )}
                                >
                                  <Image
                                    src={fileUrl(
                                      validateEnv().menuBucketId,
                                      item.image
                                    )}
                                    alt={item.name}
                                    className={cn(
                                      "object-cover w-full h-full group-hover:scale-105 transition-transform duration-300",
                                      viewMode === "grid"
                                        ? "rounded-t-xl"
                                        : "rounded-xl"
                                    )}
                                    fill
                                    sizes={
                                      viewMode === "grid"
                                        ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        : "(max-width: 640px) 100vw, 33vw"
                                    }
                                    quality={80}
                                  />
                                </div>
                                <div
                                  className={cn(
                                    "p-4",
                                    viewMode === "list" && "sm:w-2/3"
                                  )}
                                >
                                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                                    {item.name}
                                  </h3>
                                  <p
                                    className={cn(
                                      "text-sm text-gray-600 mb-3",
                                      viewMode === "grid"
                                        ? "line-clamp-2"
                                        : "line-clamp-3"
                                    )}
                                  >
                                    {item.description}
                                  </p>
                                  <div className="flex items-center justify-between mb-3">
                                    <span className="text-lg font-bold text-red-600">
                                      ₦{item.price}
                                    </span>
                                    {item.originalPrice && (
                                      <span className="text-sm text-gray-400 line-through">
                                        ₦{item.originalPrice}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                                    <Clock className="w-4 h-4" />
                                    {item.cookTime}
                                  </div>
                                  <Button
                                    className="w-full bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg py-2 transition-all duration-300"
                                    aria-label={`Add ${item.name} to cart`}
                                  >
                                    <ShoppingCart className="w-4 h-4 mr-2" />
                                    Add to Cart
                                  </Button>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              );
            })}
          </Tabs>
        </div>
      </div>
    );
  }

  // No restaurants found
  if (loading === "succeeded" && restaurants.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Utensils className="w-12 h-12 text-orange-500" />
          </div>
          <Alert
            variant="default"
            className="max-w-md bg-white/90 backdrop-blur-sm border-gray-100 shadow-sm"
          >
            <AlertTitle className="text-xl font-semibold text-gray-900">
              No Restaurants Found
            </AlertTitle>
            <AlertDescription className="text-gray-600 mt-2">
              No restaurants are available at the moment. Try again later or
              check a different location.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Error state for restaurants
  if (loading === "failed") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Utensils className="w-12 h-12 text-red-500" />
          </div>
          <Alert
            variant="destructive"
            className="max-w-md bg-white/90 backdrop-blur-sm border-red-100 shadow-sm"
          >
            <AlertTitle className="text-xl font-semibold text-red-800">
              Error Loading Restaurants
            </AlertTitle>
            <AlertDescription className="text-red-600 mt-2">
              {error || "Failed to load restaurants. Please try again."}
            </AlertDescription>
            <Button
              className="w-full mt-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg py-2 transition-all duration-300"
              onClick={() => dispatch(listAsyncRestaurants())}
              aria-label="Retry loading restaurants"
            >
              Try Again
            </Button>
          </Alert>
        </div>
      </div>
    );
  }

  return null;
};

export default RestaurantList;