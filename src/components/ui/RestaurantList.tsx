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
import { useShowCart } from "@/context/showCart";

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
  const { setIsOpen, setItem } = useShowCart();

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

  // Loading state
  if (loading === "pending") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading restaurants...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (loading === "failed" && error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // No restaurants state
  if (loading === "succeeded" && restaurants.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Utensils className="w-12 h-12 text-gray-500 dark:text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              No Restaurants
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              No restaurants available at the moment.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state with restaurants
  if (loading === "succeeded" && restaurants.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 sm:py-12">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue={restaurants[0].$id} className="w-full">
            {/* Restaurant Selection Header */}
            <div className="sticky top-0 z-10 bg-gray-50/80 dark:bg-gray-900/80 backdrop-blur-lg py-6 border-b border-gray-200 dark:border-gray-700">
              <div className="mb-4">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Choose Your Restaurant
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
                  Select a restaurant to explore their menu
                </p>
              </div>

              {/* Desktop: Horizontal scroll with arrows */}
              <div className="hidden lg:block">
                <div className="relative">
                  {restaurants.length > 6 && (
                    <>
                      <Button
                        onClick={scrollLeft}
                        variant="outline"
                        size="icon"
                        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 rounded-full z-20 border-0"
                        aria-label="Scroll left"
                      >
                        <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </Button>
                      <Button
                        onClick={scrollRight}
                        variant="outline"
                        size="icon"
                        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-700 rounded-full z-20 border-0"
                        aria-label="Scroll right"
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
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
                          "flex flex-col items-center gap-3 p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300 flex-shrink-0",
                          "min-w-[160px] max-w-[200px]",
                          "data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105"
                        )}
                      >
                        <div className="relative w-16 h-16">
                          <Image
                            src={fileUrl(
                              validateEnv().restaurantBucketId,
                              restaurant.logo
                            )}
                            alt={restaurant.name}
                            className="rounded-full object-cover ring-4 ring-white/50 shadow-lg"
                            fill
                            sizes="64px"
                            priority
                            quality={90}
                          />
                        </div>
                        <div className="text-center w-full">
                          <h3 className="font-bold text-base truncate mb-1">
                            {restaurant.name}
                          </h3>
                          <p className="text-xs opacity-75 truncate">
                            {restaurant.category}
                          </p>
                        </div>
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
              </div>

              {/* Mobile: Grid layout */}
              <div className="lg:hidden">
                <TabsList className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-0 bg-transparent">
                  {restaurants.map((restaurant) => (
                    <TabsTrigger
                      key={restaurant.$id}
                      value={restaurant.$id}
                      className={cn(
                        "flex flex-col items-center gap-3 p-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 hover:shadow-xl transition-all duration-300",
                        "data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:scale-105"
                      )}
                    >
                      <div className="relative w-14 h-14">
                        <Image
                          src={fileUrl(
                            validateEnv().restaurantBucketId,
                            restaurant.logo
                          )}
                          alt={restaurant.name}
                          className="rounded-full object-cover ring-4 ring-white/50 shadow-lg"
                          fill
                          sizes="56px"
                          priority
                          quality={90}
                        />
                      </div>
                      <div className="text-center w-full">
                        <h3 className="font-bold text-sm truncate mb-1">
                          {restaurant.name}
                        </h3>
                        <p className="text-xs opacity-75 truncate">
                          {restaurant.category}
                        </p>
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
                  className="mt-8"
                >
                  {/* Restaurant Header */}
                  <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-200/50 dark:border-gray-700/50 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16 sm:w-20 sm:h-20">
                          <Image
                            src={fileUrl(
                              validateEnv().restaurantBucketId,
                              restaurant.logo
                            )}
                            alt={restaurant.name}
                            className="rounded-full object-cover ring-4 ring-white/50 shadow-lg"
                            fill
                            sizes="(max-width: 640px) 64px, 80px"
                            priority
                            quality={90}
                          />
                        </div>
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            {restaurant.name}
                          </h2>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              {restaurant.deliveryTime}
                            </span>
                            <span className="flex items-center gap-1">
                              <Utensils className="w-4 h-4" />
                              {restaurant.category}
                            </span>
                            <span className="flex items-center gap-1">
                              <ChefHat className="w-4 h-4" />
                              {restaurant.distance}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* View Mode Toggle */}
                      <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-2xl p-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewMode("grid")}
                          className={cn(
                            "rounded-xl transition-all duration-200",
                            viewMode === "grid"
                              ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                          )}
                          aria-label="Switch to grid view"
                        >
                          <Grid className="w-4 h-4 mr-2" />
                          Grid
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setViewMode("list")}
                          className={cn(
                            "rounded-xl transition-all duration-200",
                            viewMode === "list"
                              ? "bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm"
                              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                          )}
                          aria-label="Switch to list view"
                        >
                          <List className="w-4 h-4 mr-2" />
                          List
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Food Category Tabs */}
                  <Tabs defaultValue="all" className="w-full">
                    {/* Desktop: Centered tabs */}
                    <div className="hidden sm:block mb-8">
                      <TabsList className="flex justify-center gap-3 p-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                        <TabsTrigger
                          value="all"
                          className="flex items-center gap-3 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          All Items
                        </TabsTrigger>
                        <TabsTrigger
                          value="veg"
                          className="flex items-center gap-3 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          Vegetarian
                        </TabsTrigger>
                        <TabsTrigger
                          value="non-veg"
                          className="flex items-center gap-3 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          Non-Vegetarian
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Mobile: Compact tabs */}
                    <div className="sm:hidden mb-6">
                      <TabsList className="flex gap-2 p-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg">
                        <TabsTrigger
                          value="all"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          All
                        </TabsTrigger>
                        <TabsTrigger
                          value="veg"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          Veg
                        </TabsTrigger>
                        <TabsTrigger
                          value="non-veg"
                          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-500 data-[state=active]:to-red-600 data-[state=active]:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          Non-Veg
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* All Items */}
                    <TabsContent value="all">
                      <div
                        className={cn(
                          viewMode === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                            : "flex flex-col gap-6"
                        )}
                      >
                        {items.length === 0 ? (
                          <div
                            className={cn(
                              "bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl border border-gray-200/50 dark:border-gray-700/50",
                              viewMode === "grid" && "col-span-full"
                            )}
                          >
                            <ChefHat className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                              No Menu Items
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                              No menu items available for this restaurant.
                            </p>
                          </div>
                        ) : (
                          items.map((item) => (
                            <div
                              key={item.$id}
                              className={cn(
                                "bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 group overflow-hidden",
                                viewMode === "list" &&
                                  "flex flex-col sm:flex-row items-start gap-6"
                              )}
                            >
                              <div
                                className={cn(
                                  "relative overflow-hidden",
                                  viewMode === "grid"
                                    ? "h-48 w-full"
                                    : "h-64 w-full sm:w-80"
                                )}
                              >
                                <Image
                                  src={fileUrl(
                                    validateEnv().menuBucketId,
                                    item.image
                                  )}
                                  alt={item.name}
                                  className={cn(
                                    "object-cover w-full h-full group-hover:scale-110 transition-transform duration-500",
                                    viewMode === "grid"
                                      ? "rounded-t-3xl"
                                      : "rounded-3xl"
                                  )}
                                  fill
                                  sizes={
                                    viewMode === "grid"
                                      ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                      : "(max-width: 640px) 100vw, 320px"
                                  }
                                  quality={90}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                              </div>
                              <div
                                className={cn(
                                  "p-6",
                                  viewMode === "list" && "sm:flex-1"
                                )}
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                                      {item.name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                                      {item.description}
                                    </p>
                                  </div>
                                  <Badge
                                    variant="secondary"
                                    className={cn(
                                      "ml-2 text-xs font-semibold",
                                      item.category === "veg"
                                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                    )}
                                  >
                                    {item.category === "veg" ? "Veg" : "Non-Veg"}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center justify-between mb-6">
                                  <div className="flex items-center gap-4">
                                    <span className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                      ₦{item.price}
                                    </span>
                                    {item.originalPrice && (
                                      <span className="text-lg text-gray-400 dark:text-gray-500 line-through">
                                        ₦{item.originalPrice}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Clock className="w-4 h-4" />
                                    {item.cookTime}
                                  </div>
                                </div>
                                
                                <Button
                                  className={cn(
                                    "w-full font-semibold rounded-2xl py-3 transition-all duration-300 shadow-lg hover:shadow-xl",
                                    item.category === "veg"
                                      ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                                      : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
                                  )}
                                  aria-label={`Add ${item.name} to cart`}
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
                                      source: "menu",
                                    });
                                    setIsOpen(true);
                                  }}
                                >
                                  <ShoppingCart className="w-5 h-5 mr-2" />
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
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                            : "flex flex-col gap-6"
                        )}
                      >
                        {items.filter((item) => item.category === "veg")
                          .length === 0 ? (
                          <div
                            className={cn(
                              "bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl border border-gray-200/50 dark:border-gray-700/50",
                              viewMode === "grid" && "col-span-full"
                            )}
                          >
                            <ChefHat className="w-16 h-16 text-green-500 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                              No Vegetarian Items
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
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
                                  "bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 group overflow-hidden",
                                  viewMode === "list" &&
                                    "flex flex-col sm:flex-row items-start gap-6"
                                )}
                              >
                                <div
                                  className={cn(
                                    "relative overflow-hidden",
                                    viewMode === "grid"
                                      ? "h-48 w-full"
                                      : "h-64 w-full sm:w-80"
                                  )}
                                >
                                  <Image
                                    src={fileUrl(
                                      validateEnv().menuBucketId,
                                      item.image
                                    )}
                                    alt={item.name}
                                    className={cn(
                                      "object-cover w-full h-full group-hover:scale-110 transition-transform duration-500",
                                      viewMode === "grid"
                                        ? "rounded-t-3xl"
                                        : "rounded-3xl"
                                    )}
                                    fill
                                    sizes={
                                      viewMode === "grid"
                                        ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        : "(max-width: 640px) 100vw, 320px"
                                    }
                                    quality={90}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                                <div
                                  className={cn(
                                    "p-6",
                                    viewMode === "list" && "sm:flex-1"
                                  )}
                                >
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                                        {item.name}
                                      </h3>
                                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                                        {item.description}
                                      </p>
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="ml-2 text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                                    >
                                      Veg
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                                        ₦{item.price}
                                      </span>
                                      {item.originalPrice && (
                                        <span className="text-lg text-gray-400 dark:text-gray-500 line-through">
                                          ₦{item.originalPrice}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                      <Clock className="w-4 h-4" />
                                      {item.cookTime}
                                    </div>
                                  </div>
                                  
                                  <Button
                                    className="w-full font-semibold rounded-2xl py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                                    aria-label={`Add ${item.name} to cart`}
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
                                        source: "menu",
                                      });
                                      setIsOpen(true);
                                    }}
                                  >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
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
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                            : "flex flex-col gap-6"
                        )}
                      >
                        {items.filter((item) => item.category === "non-veg")
                          .length === 0 ? (
                          <div
                            className={cn(
                              "bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl p-8 text-center shadow-xl border border-gray-200/50 dark:border-gray-700/50",
                              viewMode === "grid" && "col-span-full"
                            )}
                          >
                            <ChefHat className="w-16 h-16 text-red-500 mx-auto mb-6" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                              No Non-Vegetarian Items
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
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
                                  "bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-2xl transition-all duration-300 group overflow-hidden",
                                  viewMode === "list" &&
                                    "flex flex-col sm:flex-row items-start gap-6"
                                )}
                              >
                                <div
                                  className={cn(
                                    "relative overflow-hidden",
                                    viewMode === "grid"
                                      ? "h-48 w-full"
                                      : "h-64 w-full sm:w-80"
                                  )}
                                >
                                  <Image
                                    src={fileUrl(
                                      validateEnv().menuBucketId,
                                      item.image
                                    )}
                                    alt={item.name}
                                    className={cn(
                                      "object-cover w-full h-full group-hover:scale-110 transition-transform duration-500",
                                      viewMode === "grid"
                                        ? "rounded-t-3xl"
                                        : "rounded-3xl"
                                    )}
                                    fill
                                    sizes={
                                      viewMode === "grid"
                                        ? "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                        : "(max-width: 640px) 100vw, 320px"
                                    }
                                    quality={90}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                                <div
                                  className={cn(
                                    "p-6",
                                    viewMode === "list" && "sm:flex-1"
                                  )}
                                >
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
                                        {item.name}
                                      </h3>
                                      <p className="text-gray-600 dark:text-gray-400 line-clamp-3 mb-4">
                                        {item.description}
                                      </p>
                                    </div>
                                    <Badge
                                      variant="secondary"
                                      className="ml-2 text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                                    >
                                      Non-Veg
                                    </Badge>
                                  </div>
                                  
                                  <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                      <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                                        ₦{item.price}
                                      </span>
                                      {item.originalPrice && (
                                        <span className="text-lg text-gray-400 dark:text-gray-500 line-through">
                                          ₦{item.originalPrice}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                      <Clock className="w-4 h-4" />
                                      {item.cookTime}
                                    </div>
                                  </div>
                                  
                                  <Button
                                    className="w-full font-semibold rounded-2xl py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                                    aria-label={`Add ${item.name} to cart`}
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
                                        source: "menu",
                                      });
                                      setIsOpen(true);
                                    }}
                                  >
                                    <ShoppingCart className="w-5 h-5 mr-2" />
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

  return null;
};

export default RestaurantList;
