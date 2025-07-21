"use client";
import { useState, useEffect } from "react";
import { Home, Menu, ShoppingBag, User, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { useShowCart } from "@/context/showCart";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { useAuth } from "@/context/authContext";
import ProfileDropdown from "./ProfileDropdown";

const MobileNavigation = () => {
  const router = useRouter();
  const { setActiveCart } = useShowCart();
  const { orders } = useSelector((state: RootState) => state.orders);
  const { isAuthenticated, user } = useAuth();

  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Navigation handlers
  const handleHomeClick = () => {
    router.push("/");
  };

  const handleMenuClick = () => {
    router.push("/menu");
  };

  const handleCartClick = () => {
    setActiveCart(true);
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      // If user is not logged in, navigate to login
      router.push("/login");
    }
  };

  // Don't render until client-side hydration is complete
  if (!isClient || !isMobile) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200 dark:border-gray-700 z-50 md:hidden">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={handleHomeClick}
            className="flex flex-col items-center py-2 px-4 text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
          >
            <Home className="w-5 h-5 mb-1" color="#f97316" />
            <span className="text-xs">Home</span>
          </button>

          <button
            onClick={handleMenuClick}
            className="flex flex-col items-center py-2 px-4 text-gray-500 dark:text-gray-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors relative"
          >
            <Menu className="w-5 h-5 mb-1" color="#f97316" />
            <span className="text-xs">Menu</span>
            {Array.isArray(orders) && orders.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={handleCartClick}
            className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-orange-500 transition-colors relative"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6 mb-1" color="#f97316" />
              {Array.isArray(orders) && orders.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {orders.length}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">Cart</span>
          </button>

          {/* Admin Dashboard button for admin users only */}
          {isAuthenticated && user?.isAdmin && (
            <button
              onClick={() => router.push("/admin/orders")}
              className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-orange-500 transition-colors"
            >
              <Shield className="w-6 h-6 mb-1" color="#f97316" />
              <span className="text-xs font-medium">Admin</span>
            </button>
          )}

          {isAuthenticated ? (
            <div className="md:hidden">
              <ProfileDropdown>
                <button className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-orange-500 transition-colors">
                  <User className="w-6 h-6 mb-1" color="#f97316" />
                  <span className="text-xs font-medium">Profile</span>
                </button>
              </ProfileDropdown>
            </div>
          ) : (
            <button
              onClick={handleProfileClick}
              className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-orange-500 transition-colors"
            >
              <User className="w-6 h-6 mb-1" color="#f97316" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileNavigation; 