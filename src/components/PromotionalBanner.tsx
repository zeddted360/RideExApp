"use client";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/state/store";
import { listAsyncDiscounts } from "@/state/discountSlice"; 
import { useEffect, useState } from "react";
import { databases, fileUrl, validateEnv } from "@/utils/appwrite";
import { Query } from "appwrite";
import { ShoppingCart, Heart, Star, Clock, Info, Award, Loader2, Clock as ClockIcon, Check } from "lucide-react";
import Image from "next/image";
import { useShowCart } from "@/context/showCart";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { IPromoOfferFetched, IDiscountFetched } from "../../types/types"; 
import PromotionalImageManager from "./PromotionalImageManager";
import { Button } from "./ui/button";

export default function PromotionalBanner() {
  const [favorites, setFavorites] = useState(new Set());
  const [offers, setOffers] = useState<IPromoOfferFetched[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [discounts, setDiscounts] = useState<IDiscountFetched[]>([]);
  const [loadingDiscounts, setLoadingDiscounts] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { discounts: reduxDiscounts } = useSelector((state: RootState) => state.discounts); 
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    dispatch(listAsyncDiscounts());
    fetchOffers();
  }, [dispatch]);

  // Fetch active discounts (filter in backend or here)
  useEffect(() => {
    if (reduxDiscounts) {
      const now = new Date().toISOString();
      const activeDiscounts = reduxDiscounts.filter(
        (d: IDiscountFetched) => d.isActive && new Date(d.validFrom) <= new Date(now) && new Date(now) <= new Date(d.validTo)
      );
      setDiscounts(activeDiscounts);
    }
    setLoadingDiscounts(false);
  }, [reduxDiscounts]);

  const fetchOffers = async () => {
    try {
      setLoadingOffers(true);
      const response = await databases.listDocuments(
        validateEnv().databaseId,
        validateEnv().promoOfferCollectionId,
        [Query.orderDesc('$createdAt')]
      );
      setOffers(response.documents as IPromoOfferFetched[]);
    } catch (err) {
      console.error('Failed to fetch offers:', err);
    } finally {
      setLoadingOffers(false);
    }
  };

  const toggleFavorite = (id: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(id)) {
      newFavorites.delete(id);
    } else {
      newFavorites.add(id);
    }
    setFavorites(newFavorites);
  };

  const getTimeLeft = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    if (diff < 0) return "Expired";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h left`;
  };

  if (loadingOffers || loadingDiscounts) {
    return (
      <div className="py-12 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-600 mr-2" />
        <span>Loading promotions...</span>
      </div>
    );
  }

  return (
    <div className="py-12 bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      {/* Promotional Banners */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="space-y-6">
          {offers.map((offer) => {
            const decorativeElements = typeof offer.decorativeElements === 'string' 
              ? JSON.parse(offer.decorativeElements) 
              : offer.decorativeElements || [];
            return (
              <div
                key={offer.$id}
                className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${offer.bgColor} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
              >
                <div className="flex items-center justify-between p-8 lg:p-12">
                  {/* Left Content */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <h3
                        className={`text-2xl lg:text-3xl font-bold ${offer.textColor}`}
                      >
                        {offer.title}
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-lg lg:text-xl">
                        {offer.subtitle}
                      </p>
                    </div>

                    <button className="bg-white text-orange-600 px-8 py-3 rounded-full font-semibold hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-md">
                      {offer.buttonText}
                    </button>
                  </div>

                  {/* Right Image Area */}
                  <div className="relative flex-shrink-0 ml-8">
                    <div className="relative">
                      {/* Main Food Image */}
                      {offer.image ? (
                        <div className="w-32 h-32 lg:w-48 lg:h-48 relative overflow-hidden rounded-full shadow-lg">
                          <Image
                            src={fileUrl(validateEnv().promoOfferBucketId, offer.image)}
                            alt={offer.title}
                            fill
                            className="object-cover"
                            quality={90}
                          />
                        </div>
                      ) : (
                        <div className="w-32 h-32 lg:w-48 lg:h-48 bg-gradient-to-br from-orange-200 to-red-200 rounded-full flex items-center justify-center text-6xl lg:text-8xl shadow-lg">
                          🍔
                        </div>
                      )}

                      {/* Decorative Elements */}
                      {decorativeElements.slice(0, 3).map((element: string, idx: number) => (
                        <div
                          key={idx}
                          className={`absolute text-2xl lg:text-3xl animate-bounce`}
                          style={{
                            top: `${20 + idx * 20}%`,
                            right: `${-10 + idx * 15}%`,
                            animationDelay: `${idx * 0.5}s`,
                            animationDuration: "2s",
                          }}
                        >
                          {element}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 right-4 w-8 h-8 bg-orange-300 rounded-full"></div>
                  <div className="absolute bottom-8 left-8 w-6 h-6 bg-red-300 rounded-full"></div>
                  <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-yellow-300 rounded-full"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Discounts Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Today's Deals & Discounts
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
        </div>

        {discounts.length > 0 ? (
          <div className="grid gap-8 lg:gap-12">
            <PromotionalImageManager/>
            {discounts.map((discount, index) => (
              <div
                key={discount.$id}
                className={`flex flex-col ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                } bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group`}
              >
                {/* Image Section - Use target item image if appliesTo === "item" */}
                <div className="relative lg:w-2/5">
                  <div className="h-64 lg:h-80 relative overflow-hidden">
                    {discount.image ? (
                      <Image
                        src={fileUrl(validateEnv().discountBucketId || validateEnv().popularBucketId, discount.image as string)}
                        alt={discount.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 40vw"
                        quality={100}
                        priority
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-200 to-red-200 flex items-center justify-center text-6xl lg:text-8xl">
                        💸
                      </div>
                    )}
                    {/* Discount Badge */}
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {discount.discountType === "percentage" ? `${discount.discountValue}%` : `₦${discount.discountValue}`}
                    </div>

                    {/* Active Badge */}
                    {discount.isActive && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                        <Check className="w-4 h-4" />
                        Active
                      </div>
                    )}

                    {/* Favorite Button */}
                    <button
                      onClick={() => toggleFavorite(discount.$id)}
                      className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all duration-200 transform hover:scale-110"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          favorites.has(discount.$id)
                            ? "fill-red-500 text-red-500"
                            : "text-gray-600"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="lg:w-3/5 p-8 lg:p-12 flex flex-col justify-center">
                  <div className="space-y-6">
                    {/* Scope & Validity */}
                    <div className="flex items-center gap-4 text-sm">
                      <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-medium">
                        {discount.appliesTo}
                      </span>
                      <div className="flex items-center gap-1">
                        <ClockIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{getTimeLeft(discount.validTo)}</span>
                      </div>
                    </div>

                    {/* Title */}
                    <div className="flex items-start gap-3">
                      <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 flex-1">
                        {discount.title}
                      </h3>
                      <button className="bg-orange-100 text-orange-600 p-2 rounded-full hover:bg-orange-200 transition-colors">
                        <Info className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {discount.description}
                    </p>

                    {/* Price & Conditions */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        {discount.originalPrice && (
                          <div className="flex items-center gap-3">
                            <span className="text-3xl font-bold text-orange-600">
                              {discount.discountedPrice || `Save ${discount.discountValue}${discount.discountType === "percentage" ? "%" : ""}`}
                            </span>
                            <span className="text-lg text-gray-400 line-through">
                              {discount.originalPrice}
                            </span>
                          </div>
                        )}
                        {discount.minOrderValue && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Min order: ₦{discount.minOrderValue}</span>
                          </div>
                        )}
                        {discount.code && (
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>Code: {discount.code}</span>
                          </div>
                        )}
                      </div>

                      <Button
                        aria-label={`Apply ${discount.title}`}
                        onClick={() => {
                          // Handle discount application (e.g., add to cart with code, or navigate to items)
                          if (user) {
                            // Example: Navigate to cart or apply code
                            router.push("/cart");
                          } else {
                            router.push("/login");
                          }
                        }}
                        className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2.5 rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Apply Deal
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4 mx-auto">
              <Award className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No Active Discounts</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Check back soon for amazing deals!</p>
          </div>
        )}
      </div>
    </div>
  );
}