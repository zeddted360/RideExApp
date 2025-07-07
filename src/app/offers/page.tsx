import React from "react";
import { ShoppingCart, Download, Smartphone } from "lucide-react";
import Link from "next/link";

export default function OffersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <h1 className="text-5xl font-bold text-orange-600 mb-8 text-left">
          All Offers
        </h1>

        {/* App Download Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 p-8 mb-8 shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 lg:mb-0">
              <div className="relative">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <ShoppingCart className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-orange-800">📱</span>
                </div>
              </div>
              <Link href="/">
                <h2 className="text-3xl font-bold text-white mb-2">
                  FoodieHub CloudMart
                </h2>
                <p className="text-orange-100 text-lg">
                  Download our app to start shopping and get special offers.
                </p>
              </Link>
            </div>
            <div className="text-right">
              <h3 className="text-2xl font-bold text-white mb-4">
                Shopping Groceries From Your Phone
              </h3>
              <button className="bg-white text-orange-600 px-6 py-3 rounded-full font-semibold hover:bg-orange-50 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Download Now</span>
              </button>
            </div>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 bg-amber-400/20 rounded-full blur-lg"></div>
        </div>

        {/* Burger Offer */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-100 to-amber-100 p-8 mb-8 shadow-xl border border-orange-200">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex-1 mb-6 lg:mb-0">
              <h2 className="text-3xl font-bold text-orange-600 mb-4">
                Savory and Satisfying
              </h2>
              <p className="text-2xl text-orange-800 mb-6">
                Flat <span className="font-bold text-orange-600">5% off</span>{" "}
                on Veg & Non-veg Burgers
              </p>
              <button className="bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Order Now
              </button>
              <div className="absolute bottom-4 left-4 text-4xl">🍃</div>
            </div>
            <div className="flex-1 flex justify-center relative">
              <div className="relative">
                <div className="w-64 h-48 bg-gradient-to-br from-orange-200 to-amber-200 rounded-2xl flex items-center justify-center shadow-inner">
                  <div className="text-8xl">🍔</div>
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🥤</span>
                </div>
              </div>
              <div className="absolute top-8 right-8 text-3xl animate-bounce">
                🦋
              </div>
            </div>
          </div>
        </div>

        {/* Beef Offer */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-200 to-amber-200 p-8 shadow-xl border border-orange-300">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="flex-1 mb-6 lg:mb-0">
              <h2 className="text-3xl font-bold text-orange-700 mb-4">
                Uplifting anytime
              </h2>
              <p className="text-2xl text-orange-900 mb-6">
                Flat <span className="font-bold text-orange-700">7% off</span>{" "}
                on Beef items
              </p>
              <button className="bg-orange-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg">
                Order Now
              </button>
              <div className="absolute bottom-4 left-4 text-4xl">🌿</div>
            </div>
            <div className="flex-1 flex justify-center relative">
              <div className="relative">
                <div className="w-64 h-48 bg-gradient-to-br from-orange-300 to-amber-300 rounded-2xl flex items-center justify-center shadow-inner">
                  <div className="text-8xl">🥩</div>
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">🍽</span>
                </div>
              </div>
              <div className="absolute top-8 right-8 text-3xl animate-pulse">
                🔥
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
