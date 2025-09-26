// components/OffersClient.tsx ('use client')
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/authContext';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Loader2,} from 'lucide-react';
import { Query } from 'appwrite';
import { IPromoOffer, IPromoOfferFetched } from '../../../types/types';
import { databases, fileUrl, validateEnv } from '@/utils/appwrite';
import AddOfferForm from '@/components/AddOfferForm';


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
    fetchOffers(); // Refetch for real-time update
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-600" />
          <p className="text-gray-600 dark:text-gray-300">Loading offers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-orange-600 dark:text-orange-400 text-left">
            All Offers
          </h1>
          {isAdmin && isAuthenticated && (
            <AddOfferForm onSuccess={handleOfferAdded} />
          )}
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-200">
            {error}
          </div>
        )}

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

        {/* Dynamic Offers */}
        <div className="space-y-6 sm:space-y-8">
          {offers.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300 text-lg">No offers available at the moment.</p>
              {isAdmin && (
                <p className="text-sm text-gray-500 mt-2">Create the first offer below!</p>
              )}
            </div>
          ) : (
            offers.map((offer) => (
              <OfferCard key={offer.$id} offer={offer} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// OfferCard Component (inline for simplicity, can extract if needed)
function OfferCard({ offer }: { offer: IPromoOfferFetched }) {
  const offerImage = offer.image ? fileUrl(validateEnv().promoOfferBucketId, offer.image) : '/placeholder-offer.webp';
  const decorativeElements = typeof offer.decorativeElements === 'string' ? JSON.parse(offer.decorativeElements) : offer.decorativeElements;

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 sm:p-8 shadow-md border border-orange-200/50 ${offer.bgColor}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h2 className={`text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 ${offer.textColor}`}>
            {offer.title}
          </h2>
          <p className={`text-lg sm:text-xl mb-4 sm:mb-6 ${offer.textColor}`}>
            {offer.subtitle}
          </p>
          <Link
            href="/menu"
            className={`px-6 sm:px-8 py-2 sm:py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 shadow-md flex items-center gap-2 ${
              offer.textColor.includes('orange') 
                ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {offer.buttonText}
          </Link>
          {/* Decorative Elements */}
          {decorativeElements.slice(0, 2).map((el: string, idx: number) => (
            <span key={idx} className={`absolute bottom-2 ${idx === 0 ? 'left-2' : 'right-2'} text-2xl sm:text-3xl`}>
              {el}
            </span>
          ))}
        </div>
        <div className="flex-1 flex justify-center relative">
          <div className="relative w-48 h-36 sm:w-56 sm:h-44">
            <Image
              src={offerImage}
              alt={offer.title}
              fill
              sizes="(max-width: 640px) 192px, 224px"
              className="object-cover rounded-xl shadow-inner"
              quality={90}
            />
            {/* Decorative overlay */}
            <div className="absolute -top-3 -right-3 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <span className="text-lg">{decorativeElements[0] || '🍽'}</span>
            </div>
          </div>
          <div className="absolute top-4 right-4 text-2xl animate-bounce">
            {decorativeElements[1] || '🔥'}
          </div>
        </div>
      </div>
    </div>
  );
}