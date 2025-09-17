import React from 'react';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { fileUrl, validateEnv } from '@/utils/appwrite';

export const metadata = {
  title: 'Offers',
  description:
    'Discover the latest food offers and discounts on RideEx Food Ordering App. Save more on your favorite meals!',
  openGraph: {
    title: 'Offers | RideEx Food Ordering App',
    description:
      'Discover the latest food offers and discounts on RideEx Food Ordering App. Save more on your favorite meals!',
    url: '/offers',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Offers | RideEx Food Ordering App',
    description:
      'Discover the latest food offers and discounts on RideEx Food Ordering App. Save more on your favorite meals!',
  },
};

export default function OffersPage() {
  const { restaurantBucketId } = validateEnv();

  // Replace these with actual Appwrite file IDs for your offer images
  const savoryOfferImage = '/burger.webp'; // or fileUrl(restaurantBucketId, 'savory-file-id')
  const upliftingOfferImage = '/uplifting-beef.webp'; // or fileUrl(restaurantBucketId, 'beef-file-id')

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl sm:text-5xl font-bold text-orange-600 dark:text-orange-400 mb-6 sm:mb-8 text-left">
          All Offers
        </h1>

        {/* App Download Section */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 p-6 sm:p-8 mb-6 sm:mb-8 shadow-lg">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <ShoppingCart className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-800">📱</span>
                </div>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  RideEx CloudMart
                </h2>
                <p className="text-orange-100 text-sm sm:text-base">
                  Your daily essentials just a click away
                </p>
              </div>
            </div>
            <button className="bg-white text-orange-600 px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-md flex items-center">
              <Link href="/menu">Order Now</Link>
            </button>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-12 h-12 bg-white/10 rounded-full blur-lg"></div>
          <div className="absolute bottom-4 left-4 w-8 h-8 bg-amber-400/20 rounded-full blur-md"></div>
        </div>

        {/* Burger Offer */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-100 to-amber-100 p-6 sm:p-8 mb-6 sm:mb-8 shadow-md border border-orange-200/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-orange-600 mb-2 sm:mb-3">
                Savory and Satisfying
              </h2>
              <p className="text-lg sm:text-xl text-orange-800 mb-4 sm:mb-6">
                Flat <span className="font-bold text-orange-600">5% off</span> on Veg & Non-veg Burgers
              </p>
              <Link
                href="/menu"
                className="bg-orange-500 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                Order Now
              </Link>
              <div className="absolute bottom-2 left-2 text-2xl sm:text-3xl">🍃</div>
            </div>
            <div className="flex-1 flex justify-center relative">
              <div className="relative w-48 h-36 sm:w-56 sm:h-44">
                <Image
                  src={savoryOfferImage}
                  alt="Savory Burger Offer"
                  fill
                  sizes="(max-width: 640px) 192px, 224px"
                  className="object-cover rounded-xl shadow-inner"
                  quality={90}
                />
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-lg">🥤</span>
                </div>
              </div>
              <div className="absolute top-4 right-4 text-2xl animate-bounce">🦋</div>
            </div>
          </div>
        </div>

        {/* Beef Offer */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-100 to-amber-100 p-6 sm:p-8 shadow-md border border-orange-200/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-orange-700 mb-2 sm:mb-3">
                Uplifting Anytime
              </h2>
              <p className="text-lg sm:text-xl text-orange-900 mb-4 sm:mb-6">
                Flat <span className="font-bold text-orange-700">7% off</span> on Beef Items
              </p>
              <Link
                href="/menu"
                className="bg-orange-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 shadow-md"
              >
                Order Now
              </Link>
              <div className="absolute bottom-2 left-2 text-2xl sm:text-3xl">🌿</div>
            </div>
            <div className="flex-1 flex justify-center relative">
              <div className="relative w-48 h-36 sm:w-56 sm:h-44">
                <Image
                  src={upliftingOfferImage}
                  alt="Uplifting Beef Offer"
                  fill
                  sizes="(max-width: 640px) 192px, 224px"
                  className="object-cover rounded-xl shadow-inner"
                  quality={90}
                />
                <div className="absolute -top-3 -right-3 w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center shadow-md">
                  <span className="text-lg">🍽</span>
                </div>
              </div>
              <div className="absolute top-4 right-4 text-2xl animate-pulse">🔥</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}