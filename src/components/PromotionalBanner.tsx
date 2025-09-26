"use client";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/state/store";
import { listAsyncPopularItems } from "@/state/popularSlice";
import { useEffect, useState } from "react";
import { databases, fileUrl, validateEnv } from "@/utils/appwrite";
import { Query } from "appwrite";
import { ShoppingCart, Heart, Star, Clock, Info, Award, Loader2 } from "lucide-react";
import Image from "next/image";
import { useShowCart } from "@/context/showCart";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { IPromoOfferFetched } from "../../types/types";


export default function PromotionalBanner() {
  const [favorites, setFavorites] = useState(new Set());
  const [offers, setOffers] = useState<IPromoOfferFetched[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const dispatch = useDispatch<AppDispatch>();
  const { popularItems } = useSelector((state: RootState) => state.popularItem);
  const { setIsOpen, setItem } = useShowCart();
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    dispatch(listAsyncPopularItems());
    fetchOffers();
  }, [dispatch]);

  const fetchOffers = async () => {
    try {
      setLoadingOffers(true);
      const response = await databases.listDocuments(
        validateEnv().databaseId,
        validateEnv().promoOfferCollectionId, // Ensure this env var exists
        [Query.orderDesc('$createdAt')] // Latest first
      );
      setOffers(response.documents as IPromoOfferFetched[]);
    } catch (err) {
      console.error('Failed to fetch offers:', err);
      // Optional: Handle error with toast or state
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

  if (loadingOffers) {
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
                      {/* Main Food Image - Use fetched image if available, fallback to emoji */}
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
                          {offer.image || '🍔'} {/* Fallback emoji if no image */}
                        </div>
                      )}

                      {/* Decorative Elements */}
                      {decorativeElements.slice(0, 3).map((element:any, idx:number) => (
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

      {/* Most Popular Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Most Popular Items
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
        </div>

        <div className="grid gap-8 lg:gap-12">
          {popularItems.map((item, index) => (
            <div
              key={item.$id}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } bg-white dark:bg-gray-800 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group`}
            >
              {/* Image Section */}
              <div className="relative lg:w-2/5">
                <div className="h-64 lg:h-80 relative overflow-hidden">
                  <Image
                    src={fileUrl(validateEnv().popularBucketId, item.image)}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    quality={100}
                    priority
                  />
                  {/* Discount Badge */}
                  <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {item.discount}
                  </div>

                  {/* Popular Badge */}
                  {item.isPopular && (
                    <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      Popular
                    </div>
                  )}

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(item.$id)}
                    className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full hover:bg-white transition-all duration-200 transform hover:scale-110"
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        favorites.has(item.$id)
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
                  {/* Category & Rating */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-medium">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{item.rating}</span>
                      <span className="text-gray-500">
                        ({item.reviewCount} reviews)
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="flex items-start gap-3">
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 flex-1">
                      {item.name}
                    </h3>
                    <button className="bg-orange-100 text-orange-600 p-2 rounded-full hover:bg-orange-200 transition-colors">
                      <Info className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-lg leading-relaxed">
                    {item.description}
                  </p>

                  {/* Price & Actions */}
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-orange-600">
                          {item.price}
                        </span>
                        <span className="text-lg text-gray-400 line-through">
                          {item.originalPrice}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{item.cookingTime}</span>
                      </div>
                    </div>

                    <button
                      aria-label={`Add ${item.name} to cart`}
                      onClick={() => {
                        if (user) {
                          setItem({
                            userId: user.userId as string,
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
                        } else {
                          router.push("/login");
                        }
                      }}
                      className="flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2.5 rounded-full font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-opacity-50"
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}