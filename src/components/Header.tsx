"use client";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import Link from "next/link";
import {
  Menu,
  Search,
  Sun,
  Moon,
  ChefHat,
  X,
  ShoppingBag,
  Bell,
  Globe,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useShowCart } from "@/context/showCart";
import { useAuth } from "@/context/authContext";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { useRouter } from "next/navigation";
import ProfileDropdown from "./ui/ProfileDropdown";

export default function Header() {
  const { setActiveCart } = useShowCart();
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const { username, email, role, isLoading, isAuthenticated } = useAuth();

  const { orders } = useSelector((state: RootState) => state.orders);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { title: "home", path: "/" },
    { title: "menu", path: "/menu" },
    { title: "offers", path: "/offers" },
    { title: "contact", path: "/contact" },
    { title: "add-item", path: "/add-item" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300   ${
        scrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg border-b border-gray-200/20"
          : "bg-gradient-to-r from-orange-500 via-red-500 to-pink-500"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <ChefHat
                className={`h-8 w-8 transition-all duration-300 ${
                  scrolled ? "text-orange-500" : "text-white"
                } group-hover:rotate-12`}
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <h1
              className={`text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text ${
                scrolled ? "text-transparent" : "text-white"
              } transition-all duration-300`}
            >
              RideEx
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item, index) => (
              <Link
                key={item.title}
                href={item.path}
                className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 group ${
                  scrolled
                    ? "text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.title}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-orange-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className={`relative rounded-lg transition-all duration-300 hover:scale-105 ${
                scrolled
                  ? "text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-bounce"></span>
            </Button>

            {/* Cart with Order Count */}
            <Button
              variant="ghost"
              onClick={() => setActiveCart((prev) => !prev)}
              size="icon"
              className={`relative rounded-lg transition-all duration-300 hover:scale-105 ${
                scrolled
                  ? "text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <ShoppingBag className="h-5 w-5" />
              {Array.isArray(orders) && orders.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {orders.length}
                </span>
              )}
            </Button>

            {/* Search */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className={`rounded-lg transition-all duration-300 hover:scale-105 ${
                scrolled
                  ? "text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Language Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-lg transition-all duration-300 hover:scale-105 ${
                    scrolled
                      ? "text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <Globe className="h-5 w-5" />
                  <span className="sr-only">english</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>english</DropdownMenuItem>
                <DropdownMenuItem>igbo</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-lg transition-all duration-300 hover:scale-105 ${
                    scrolled
                      ? "text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                      : "text-white/90 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {theme === "light" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  system
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Authentication Section */}
            {isLoading ? (
              // Loading state
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : isAuthenticated ? (
              // User is logged in - show profile dropdown (desktop only)
              <div className="hidden md:block">
                <ProfileDropdown>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`rounded-full bg-white dark:bg-gray-900 shadow-md ring-2 ring-green-500 transition-all duration-300 hover:scale-105 p-0`}
                    >
                      <User className="h-6 w-6 text-green-600" />
                    </Button>
                    {/* Status dot */}
                    <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                  </div>
                </ProfileDropdown>
              </div>
            ) : (
              // User is not logged in - show login/signup buttons
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className={`text-sm font-medium transition-all duration-300 hover:scale-105 ${
                      scrolled
                        ? "text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    className={`text-sm font-medium transition-all duration-300 hover:scale-105 ${
                      scrolled
                        ? "bg-orange-500 hover:bg-orange-600 text-white"
                        : "bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                    }`}
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden rounded-lg transition-all duration-300 hover:scale-105 ${
                scrolled
                  ? "text-gray-600 dark:text-gray-300 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  : "text-white/90 hover:text-white hover:bg-white/10"
              }`}
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && (
          <div className="pb-4 animate-in slide-in-from-top-2 duration-300">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-300" />
              <input
                type="text"
                placeholder={t("header.searchPlaceholder")}
                className="w-full pl-10 pr-4 py-3 bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 rounded-xl text-white dark:text-gray-200 placeholder-white/70 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                autoFocus
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-t border-gray-200/20 dark:border-gray-700/20">
          <nav className="px-4 py-4 space-y-2">
            {navItems.map((item, index) => (
              <Link
                key={item.title}
                href={item.path}
                className="block px-4 py-3 text-gray-700 dark:text-gray-200 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-all duration-300 font-medium"
                style={{
                  animation: `fadeInUp 0.3s ease-out ${index * 100}ms both`,
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.title}
              </Link>
            ))}

            {/* Mobile Actions */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  notifications
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    newNotifications
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-gray-700 dark:text-gray-200 font-medium">
                  cartItems
                </span>
                <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-sm font-bold">
                  0 {/* Placeholder for order count */}
                </span>
              </div>
            </div>
          </nav>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
}
