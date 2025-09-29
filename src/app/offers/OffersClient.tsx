'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Loader2, Tag, Sparkles, ArrowRight } from 'lucide-react';
import { Query } from 'appwrite';
import { IPromoOffer, IPromoOfferFetched } from '../../../types/types';
import { databases, fileUrl, validateEnv } from '@/utils/appwrite';
import AddOfferForm from '@/components/AddOfferForm';
import { motion, AnimatePresence } from 'framer-motion';

export function OffersClient() {
  const { user, isAuthenticated } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [offers, setOffers] = useState<IPromoOfferFetched[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await databases.listDocuments(
        validateEnv().databaseId,
        validateEnv().promoOfferCollectionId, 
        [Query.orderDesc('$createdAt')]
      );
      setOffers(response.documents as IPromoOfferFetched[]);
    } catch (err) {
      console.error('Failed to fetch offers:', err);
      setError('Failed to load offers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOfferAdded = () => {
    fetchOffers();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4"
        >
          <div className="relative w-20 h-20 mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full border-4 border-orange-200 dark:border-orange-800 border-t-orange-500"
            />
          </div>
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Loading amazing offers...
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 sm:mb-12"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                <Tag className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">
                Special Offers
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400 ml-15">
              Exclusive deals and promotions just for you
            </p>
          </div>
          {isAdmin && isAuthenticated && (
            <AddOfferForm onSuccess={handleOfferAdded} />
          )}
        </motion.div>

        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-200"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Featured App Section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 p-8 sm:p-10 mb-8 sm:mb-12 shadow-2xl"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <motion.div
            className="absolute inset-0 opacity-20"
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
            style={{
              backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "30px 30px"
            }}
          />
          
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 sm:gap-6 flex-1">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="relative"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-xl">
                  <ShoppingCart className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-orange-800" />
                </div>
              </motion.div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2">
                  RideEx CloudMart
                </h2>
                <p className="text-orange-50 text-sm sm:text-base">
                  Your daily essentials just a click away
                </p>
              </div>
            </div>
            <Link href="/menu">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-orange-600 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold hover:bg-orange-50 transition-all duration-300 shadow-xl hover:shadow-2xl flex items-center gap-2 group"
              >
                Order Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-6 right-6 w-16 h-16 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute bottom-6 left-6 w-12 h-12 bg-amber-400/20 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-orange-300/10 rounded-full blur-3xl"></div>
        </motion.div>

        {/* Dynamic Offers */}
        <div className="space-y-6 sm:space-y-8">
          {offers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 py-16 sm:py-20"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                  className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Tag className="w-10 h-10 text-orange-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No Offers Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Check back soon for exciting deals and promotions
                </p>
                {isAdmin && (
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">
                    Create the first offer to get started
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <AnimatePresence>
              {offers.map((offer, idx) => (
                <motion.div
                  key={offer.$id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.1 }}
                  layout
                >
                  <OfferCard offer={offer} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}

function OfferCard({ offer }: { offer: IPromoOfferFetched }) {
  const offerImage = offer.image ? fileUrl(validateEnv().promoOfferBucketId, offer.image) : '/placeholder-offer.webp';
  const decorativeElements = typeof offer.decorativeElements === 'string' ? JSON.parse(offer.decorativeElements) : offer.decorativeElements;

  return (
    <div className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 shadow-xl border-2 hover:shadow-2xl transition-all duration-300 ${offer.bgColor} border-orange-200/50 dark:border-orange-900/30`}>
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-8">
        {/* Content Side */}
        <div className="flex-1 space-y-4 sm:space-y-6 text-center lg:text-left w-full">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-3 ${offer.textColor}`}
            >
              {offer.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className={`text-base sm:text-lg lg:text-xl ${offer.textColor} opacity-90`}
            >
              {offer.subtitle}
            </motion.p>
          </div>
          
          <Link href="/menu" className="inline-block">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-6 sm:px-8 py-3 sm:py-4 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2 ${
                offer.textColor.includes('orange') 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {offer.buttonText}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>

          {/* Decorative Elements - Bottom */}
          <div className="flex gap-3 justify-center lg:justify-start">
            {decorativeElements.slice(0, 3).map((el: string, idx: number) => (
              <motion.span
                key={idx}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2 + idx * 0.1, type: "spring" }}
                className="text-3xl sm:text-4xl"
              >
                {el}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Image Side */}
        <div className="flex-1 flex justify-center relative w-full max-w-md lg:max-w-none">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="relative w-full aspect-[4/3] sm:w-80 sm:h-60 lg:w-96 lg:h-72"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-2xl blur-2xl"></div>
            <Image
              src={offerImage}
              alt={offer.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 320px, 384px"
              className="object-cover rounded-2xl shadow-2xl relative z-10"
              quality={90}
            />
            
            {/* Floating Decorative Elements */}
            {decorativeElements[0] && (
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, 0]
                }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-white/30 dark:bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-xl border border-white/40"
              >
                <span className="text-2xl sm:text-3xl">{decorativeElements[0]}</span>
              </motion.div>
            )}
            
            {decorativeElements[1] && (
              <motion.div
                animate={{ 
                  y: [0, 10, 0],
                  rotate: [0, -5, 0]
                }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                className="absolute -bottom-4 -left-4 text-4xl sm:text-5xl drop-shadow-lg"
              >
                {decorativeElements[1]}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "20px 20px"
        }} />
      </div>
    </div>
  );
}