'use client';
import FeaturedItem from '@/components/FeaturedItem';
import Menu from '@/components/Menu';
import PromotionalBanner from '@/components/PromotionalBanner';
import PopularItem from '@/components/PopularItem';
import { useState, useEffect } from 'react';
import MiniNavigation from '@/components/Hero';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '@/state/store';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { listAllAsyncExtras } from '@/state/extraSlice';
import { usePathname } from 'next/navigation';
import OfferCard from './offers/OfferCard';
import SkeletonOfferCard from './offers/SkeletonOfferCard';
import DiscountsList from './DiscountList';
import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

export default function HomeClient() {
  const dispatch = useDispatch<AppDispatch>();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const { offersItem: offers, listLoading, error } = useSelector((state: RootState) => state.promoOffer);
  const pathname = usePathname();
  const router = useRouter();
  useEffect(() => {
    dispatch(listAllAsyncExtras()); // Fetch extras for badge rendering
  }, [dispatch]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  const renderSkeletonCards = () => {
    const skeletons = Array.from({ length: 3 }).map((_, index) => (
      <motion.div
        key={`skeleton-${index}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <SkeletonOfferCard viewMode="grid" />
      </motion.div>
    ));
    return (
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {skeletons}
      </div>
    );
  };

  const renderOffers = () => {
    if (listLoading === 'pending') {
      return (
        <div className="my-8">
          <Skeleton className="h-8 w-48 mb-4" />
          {renderSkeletonCards()}
        </div>
      );
    }

    if (error) {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="my-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-200"
          role="alert"
        >
          {error}
        </motion.div>
      );
    }

    if (offers.length === 0) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="my-8 text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
        >
          <p className="text-gray-500 dark:text-gray-400 text-lg">No promotional offers available at the moment.</p>
        </motion.div>
      );
    }

    return (
      <div className="my-8">
        <div className='flex justify-between items-center mb-4'>
          <h2 className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400 mb-4">
          Special Offers
         </h2>
        <Button  className="cursor-pointer" onClick={()=>router.push("/offers")} variant={"link"}>View All</Button>
        </div>
       
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {offers.slice(0,4).map((offer, index) => (
            <motion.div
              key={offer.$id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <OfferCard
                offer={offer}
                viewMode="grid"
                onEdit={() => {}}
                onDetails={() => {}}
                showActions={pathname === '/offers'} 
              />
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 pt-20">
      <MiniNavigation />
      <Menu />
      <FeaturedItem toggleFavorite={toggleFavorite} favorites={favorites} />
      <PromotionalBanner />
      {renderOffers()}
      <PopularItem toggleFavorite={toggleFavorite} favorites={favorites} />
      <DiscountsList />
    </div>
  );
}