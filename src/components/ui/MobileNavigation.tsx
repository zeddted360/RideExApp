"use client";
import { useState, useEffect } from "react";
import { Home, Menu, ShoppingBag, User } from "lucide-react";
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

  useEffect(() => {
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

  if (!isMobile) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-50">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={handleHomeClick}
            className="flex flex-col items-center py-2 px-4 text-orange-500 hover:text-orange-600 transition-colors"
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={handleMenuClick}
            className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-orange-500 transition-colors"
          >
            <Menu className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">Menu</span>
          </button>

          <button
            onClick={handleCartClick}
            className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-orange-500 transition-colors relative"
          >
            <div className="relative">
              <ShoppingBag className="w-6 h-6 mb-1" />
              {Array.isArray(orders) && orders.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {orders.length}
                </span>
              )}
            </div>
            <span className="text-xs font-medium">Cart</span>
          </button>

          {isAuthenticated ? (
            <div className="md:hidden">
              <ProfileDropdown>
                <button className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-orange-500 transition-colors">
                  <User className="w-6 h-6 mb-1" />
                  <span className="text-xs font-medium">Profile</span>
                </button>
              </ProfileDropdown>
            </div>
          ) : (
            <button
              onClick={handleProfileClick}
              className="flex flex-col items-center py-2 px-4 text-gray-500 hover:text-orange-500 transition-colors"
            >
              <User className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">Profile</span>
            </button>
          )}
        </div>
      </div>


    </>
  );
};

export default MobileNavigation; 