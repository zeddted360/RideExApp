"use client";
import { useEffect, useState } from "react";
import { databases, fileUrl, validateEnv } from "@/utils/appwrite";
import { Query } from "appwrite";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import { IPromoOfferFetched } from "../../types/types";
import PromotionalImageManager from "./PromotionalImageManager";

export default function PromotionalBanner() {
  const [offers, setOffers] = useState<IPromoOfferFetched[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);

  const fetchOffers = async () => {
    try {
      setLoadingOffers(true);
      const response = await databases.listDocuments(
        validateEnv().databaseId,
        validateEnv().promoOfferCollectionId,
        [Query.orderDesc("$createdAt")]
      );
      setOffers(response.documents as IPromoOfferFetched[]);
    } catch (err) {
      console.error("Failed to fetch offers:", err);
    } finally {
      setLoadingOffers(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

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
            <PromotionalImageManager />
      {/* Promotional Banners */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="space-y-6">
          {offers.map((offer) => {
            const decorativeElements =
              typeof offer.decorativeElements === "string"
                ? JSON.parse(offer.decorativeElements)
                : offer.decorativeElements || [];
            return (
              <div
                key={offer.$id}
                className={`w-[100%] relative overflow-hidden mt-4 rounded-3xl bg-gradient-to-r ${offer.bgColor} shadow-lg hover:shadow-xl transition-all duration-300 transform`}
              >
                <div className="flex items-center justify-between p-8 lg:p-12">
                  {/* Left Content */}
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <h3 className={`text-2xl lg:text-3xl font-bold ${offer.textColor}`}>
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
                          className={`absolute text-2xl lg:text-3xl animate-bounce `}
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
                <div className="absolute inset-0 opacity-10 hidden">
                  <div className="absolute top-4 right-4 w-8 h-8 bg-orange-300 rounded-full"></div>
                  <div className="absolute bottom-8 left-8 w-6 h-6 bg-red-300 rounded-full"></div>
                  <div className="absolute top-1/2 left-1/4 w-4 h-4 bg-yellow-300 rounded-full"></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}