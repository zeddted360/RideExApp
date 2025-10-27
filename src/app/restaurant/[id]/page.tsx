"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Query } from "appwrite";
import { databases, fileUrl, validateEnv } from "@/utils/appwrite";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Star,
  Clock,
  MapPin,
  ShoppingCart,
  Loader2,
  ArrowLeft,
  Badge,
  Users,
  Clock1,
  Timer,
  TimerOff,
} from "lucide-react";
import { IMenuItemFetched, IRestaurantFetched } from "../../../../types/types";
import { RestaurantMenuItem } from "./RestaurantMenu";
import { getRestaurantTimesWithCountdown } from "@/utils/getRestaurantTimesWithCountdown";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/state/store";
import { getAsyncRestaurantById } from "@/state/restaurantSlice";

interface RestaurantPageProps {}

export default function RestaurantPage({}: RestaurantPageProps) {
  const { id } = useParams();
  const decodedId = decodeURIComponent(id as string);
  const [restaurant, setRestaurant] = useState<IRestaurantFetched | null>(null);
  const [menuItems, setMenuItems] = useState<IMenuItemFetched[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!decodedId) {
      setError("Invalid restaurant ID");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch restaurant via Redux thunk
        const result = await dispatch(
          getAsyncRestaurantById(decodedId)
        ).unwrap();
        setRestaurant(result);

        // Fetch menu items for this restaurant (only approved ones)
        const menuResponse = await databases.listDocuments(
          validateEnv().databaseId,
          validateEnv().menuItemsCollectionId,
          [Query.equal("restaurantId", result.$id)]
        );
        setMenuItems(
          menuResponse.documents.filter(
            (item) => item.isApproved === true
          ) as IMenuItemFetched[]
        );
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load restaurant data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [decodedId, dispatch]);

  // Update countdown timer every second when restaurant is within 1 hour of opening
  useEffect(() => {
    if (!restaurant) return;

    const updateCountdown = () => {
      const { isOpen, countdownToOpen } =
        getRestaurantTimesWithCountdown(restaurant);
      if (!isOpen && countdownToOpen) {
        setCountdown(countdownToOpen);
      } else {
        setCountdown(null);
      }
    };

    updateCountdown(); // Initial call
    const interval = setInterval(updateCountdown, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, [restaurant]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl">
          <div className="relative mb-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
            <div className="absolute inset-0 w-16 h-16 mx-auto bg-gradient-to-r from-orange-500 to-orange-600 rounded-full animate-ping opacity-20"></div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Loading Restaurant
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Please wait while we fetch the details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl max-w-md mx-4">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">!</span>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Oops! Something went wrong
          </h3>
          <p className="text-red-600 dark:text-red-400 mb-6">
            {error || "Restaurant not found"}
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold px-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const {
    isOpen: restaurantIsOpen,
    openTime,
    closeTime,
  } = getRestaurantTimesWithCountdown(restaurant);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Restaurant Header */}
      <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-black/10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
                              radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center text-orange-100 hover:text-white transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to restaurants
          </Link>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
            {/* Restaurant Logo */}
            <div className="relative">
              <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl ring-4 ring-white/20">
                <Image
                  src={fileUrl(
                    validateEnv().restaurantBucketId,
                    restaurant.logo as string
                  )}
                  alt={restaurant.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-lg">
                <Badge className="w-5 h-5 text-orange-600" />
              </div>
            </div>

            {/* Restaurant Info */}
            <div className="flex-1">
              <div className="mb-4">
                <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-white to-orange-100 bg-clip-text text-transparent">
                  {restaurant.name}
                </h1>
                <div className="inline-flex items-center bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                  <span className="text-orange-100 text-sm font-medium">
                    {restaurant.category}
                  </span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Star className="w-5 h-5 fill-current text-yellow-300" />
                  </div>
                  <div className="text-lg font-bold">{restaurant.rating}</div>
                  <div className="text-xs text-orange-100">Rating</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="w-5 h-5 text-orange-200" />
                  </div>
                  <div className="text-lg font-bold">
                    {restaurant.deliveryTime}
                  </div>
                  <div className="text-xs text-orange-100">Delivery</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock1 className="w-5 h-5 text-orange-200" />
                  </div>
                  <div className="flex flex-col items-center space-y-1">
                    {restaurantIsOpen ? (
                      <div className="flex items-center space-x-1">
                        <div className="relative">
                          <Timer className="w-4 h-4 text-green-400" />
                          <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75"></div>
                        </div>
                        <span className="text-sm font-bold text-green-300">
                          Open Now
                        </span>
                        <span className="text-xs text-orange-200">
                          until {closeTime}
                        </span>
                      </div>
                    ) : countdown ? (
                      <div className="flex items-center space-x-1">
                        <div className="relative">
                          <Timer className="w-4 h-4 text-yellow-400" />
                          <div className="absolute inset-0 bg-yellow-400 rounded-full animate-pulse opacity-75"></div>
                        </div>
                        <span className="text-sm font-bold text-yellow-300">
                          Opens in
                        </span>
                        <span className="text-base font-mono text-yellow-200 bg-yellow-900/20 px-2 py-1 rounded-full">
                          {countdown}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1">
                        <TimerOff className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-bold text-red-300">
                          Closed
                        </span>
                        { openTime && <span className="text-xs text-orange-200">
                          until {openTime}
                        </span>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cart Button */}
            <div className="flex flex-col gap-3">
              <Button
                asChild
                size="lg"
                className="bg-white hover:bg-gray-50 text-orange-600 font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                <Link href="/cart">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  View Cart
                </Link>
              </Button>
              <div className="text-center">
                <div className="flex items-center text-orange-100 text-sm">
                  <Users className="w-4 h-4 mr-1" />
                  <span>{menuItems.length} items available</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Our Menu
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Discover our delicious offerings
            </p>
          </div>
          {menuItems.length > 0 && (
            <div className="text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-4 py-2 rounded-full shadow-sm">
              {menuItems.length} {menuItems.length === 1 ? "item" : "items"}
            </div>
          )}
        </div>

        {menuItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Menu Items Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              This restaurant hasn't added any menu items yet. Please check back
              later or contact them directly.
            </p>
            <Link href="/">
              <Button
                variant="outline"
                className="border-orange-200 text-orange-600 hover:bg-orange-50 dark:border-orange-800 dark:text-orange-400 dark:hover:bg-orange-950"
              >
                Browse Other Restaurants
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {menuItems.map((item) => (
              <RestaurantMenuItem
                key={item.$id}
                item={item}
                restaurantId={restaurant.$id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
