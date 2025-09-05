import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  ShoppingBag, 
  Cross, 
  Coffee,
  Utensils,
  IceCream,
  ShoppingCart,
  Shirt,
  MapPin,
  X,
  Clock,
  type LucideIcon
} from 'lucide-react';

interface CategoryItem {
  id: string;
  title: string;
  icon: LucideIcon;
  href: string;
  available: boolean;
}

const MiniNavigation = () => {
  const [isClient, setIsClient] = useState(false);
  const [showComingSoon, setShowComingSoon] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CategoryItem | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const mainCategories: CategoryItem[] = [
    {
      id: 'restaurant',
      title: 'Restaurant',
      icon: Building2,
      href: '/menu',
      available: true
    },
    {
      id: 'shops',
      title: 'Shops', 
      icon: ShoppingBag,
      href: '/shops',
      available: false
    },
    {
      id: 'pharmacy',
      title: 'Pharmacy',
      icon: Cross,
      href: '/pharmacy',
      available: false
    }
  ];

  const exploreItems: CategoryItem[] = [
    {
      id: 'cafe',
      title: 'Cafe',
      icon: Coffee,
      href: '/explore/cafe',
      available: false
    },
    {
      id: 'salons',
      title: 'Salons',
      icon: Shirt,
      href: '/explore/salons',
      available: false
    },
    {
      id: 'icecream',
      title: 'Ice Cream',
      icon: IceCream,
      href: '/explore/icecream',
      available: false
    },
    {
      id: 'fastfood',
      title: 'Fast Food',
      icon: Utensils,
      href: '/explore/fastfood',
      available: false
    },
    {
      id: 'retail',
      title: 'Retail',
      icon: ShoppingCart,
      href: '/explore/retail',
      available: false
    },
    {
      id: 'shopping',
      title: 'Shopping',
      icon: MapPin,
      href: '/explore/shopping',
      available: false
    }
  ];

  const handleItemClick = (item: CategoryItem, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSelectedItem(item);
    setShowComingSoon(true);
  };

  const closeModal = () => {
    setShowComingSoon(false);
    setSelectedItem(null);
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showComingSoon) {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showComingSoon]);

  const renderCategoryItem = (category: CategoryItem, isExploreItem: boolean = false) => {
    if (category.available) {
      return (
        <Link
          key={category.id}
          href={category.href}
          className="group flex flex-col items-center min-w-[60px] sm:min-w-[70px]"
        >
          <div className={`p-2 ${isExploreItem ? 'sm:p-2.5' : 'sm:p-3'} ${
            isExploreItem ? 'rounded-full aspect-square flex items-center justify-center' : 'rounded-xl'
          } bg-gray-100/80 dark:bg-gray-800/80 group-hover:bg-orange-100/80 dark:group-hover:bg-orange-900/30 transition-colors duration-300`}>
            <category.icon 
              className={`${isExploreItem ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5 sm:w-6 sm:h-6'} text-gray-600 dark:text-gray-300 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300`} 
            />
          </div>
          <span className="mt-1 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300 text-center">
            {category.title}
          </span>
        </Link>
      );
    } else {
      return (
        <button
          key={category.id}
          onClick={(e) => handleItemClick(category, e)}
          type="button"
          aria-label={`${category.title} - Coming Soon`}
          className="group flex flex-col items-center min-w-[60px] sm:min-w-[70px] cursor-pointer"
        >
          <div className={`p-2 ${isExploreItem ? 'sm:p-2.5' : 'sm:p-3'} ${
            isExploreItem ? 'rounded-full aspect-square flex items-center justify-center' : 'rounded-xl'
          } bg-gray-100/80 dark:bg-gray-800/80 group-hover:bg-orange-100/80 dark:group-hover:bg-orange-900/30 transition-colors duration-300 relative`}>
            <category.icon 
              className={`${isExploreItem ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-5 h-5 sm:w-6 sm:h-6'} text-gray-600 dark:text-gray-300 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300 opacity-70`} 
            />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
              <Clock className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
          <span className="mt-1 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors duration-300 text-center opacity-70">
            {category.title}
          </span>
        </button>
      );
    }
  };

  // Coming Soon Modal
  const ComingSoonModal = () => {
    if (!showComingSoon || !selectedItem) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={closeModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="coming-soon-title"
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl transform transition-all"
          onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <selectedItem.icon className="w-5 h-5 text-orange-500 dark:text-orange-400" />
              </div>
              <h2 id="coming-soon-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {selectedItem.title}
              </h2>
            </div>
            <button
              onClick={closeModal}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Coming Soon!
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {`We're working hard to bring you ${selectedItem.title.toLowerCase()} services. Stay tuned for updates!`}
            </p>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={closeModal}
              className="flex-1 py-3 px-4 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Got it
            </button>
            <button
              onClick={closeModal}
              className="flex-1 py-3 px-4 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
            >
              Notify Me
            </button>
          </div>
        </div>
      </div>
    );
  };

  const content = (
    <>
      <section className="mb-5 -mt-15 md:-mt-20 bg-white dark:bg-gray-900 border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="space-y-3 sm:space-y-4">
            {/* Main Categories Row */}
            <div className="flex items-center justify-around overflow-x-auto space-x-4 scrollbar-hide">
              {mainCategories.map((category) => renderCategoryItem(category))}
            </div>

            {/* Explore Row */}
            <div className="flex items-center justify-around overflow-x-auto space-x-4 scrollbar-hide">
              <span className="flex-shrink-0 text-sm sm:text-base font-semibold text-gray-800 dark:text-gray-100 min-w-[60px] sm:min-w-[70px] text-center">
                Explore
              </span>
              {exploreItems.map((item) => renderCategoryItem(item, true))}
            </div>
          </div>
        </div>
      </section>
      
      <ComingSoonModal />
    </>
  );

  if (!isClient) {
    return content;
  }

  return content;
};

export default MiniNavigation;