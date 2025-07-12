"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ProfileDropdown from "@/components/ui/ProfileDropdown";
import { useShowCart } from "@/context/showCart";
import { useTheme } from "next-themes";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/state/store";
import { addOrder } from "@/state/orderSlice";
import { createOrderAsync } from "@/state/orderSlice";
import toast from "react-hot-toast";
import {
  Search,
  ShoppingCart,
  Menu,
  Sun,
  Moon,
  Monitor,
  Globe,
  ChevronDown,
  Utensils,
  Star,
  MapPin,
  Clock,
  X,
  UserCircle,
  Plus,
} from "lucide-react";
import Image from "next/image";
import { fileUrl, validateEnv } from "@/utils/appwrite";

interface SearchResult {
  id: string;
  name: string;
  type: "restaurant" | "menu" | "popular" | "featured";
  image?: string;
  price?: string;
  description?: string;
  restaurantName?: string;
  category?: string;
  rating?: number;
  deliveryTime?: string;
  distance?: string;
}

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch<AppDispatch>();
  const { theme, setTheme } = useTheme();
  const { activeCart, setActiveCart } = useShowCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isAddingToCart, setIsAddingToCart] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get data from Redux store
  const { restaurants } = useSelector((state: RootState) => state.restaurant);
  const { menuItems } = useSelector((state: RootState) => state.menuItem);
  const { popularItems } = useSelector((state: RootState) => state.popularItem);
  const { featuredItems } = useSelector(
    (state: RootState) => state.featuredItem
  );
  const { orders } = useSelector((state: RootState) => state.orders);

  // Use destructured arrays directly
  const cartItems = orders || [];

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Handle search functionality
  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const query = searchQuery.toLowerCase().trim();
    const results: SearchResult[] = [];

    console.log("Search query:", query);
    console.log("Available data:", {
      restaurants: restaurants.length,
      menuItems: menuItems.length,
      popularItems: popularItems.length,
      featuredItems: featuredItems.length,
    });

    // Search restaurants
    restaurants.forEach((restaurant: any) => {
      if (
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.description?.toLowerCase().includes(query) ||
        restaurant.category?.toLowerCase().includes(query)
      ) {
        results.push({
          id: restaurant.$id,
          name: restaurant.name,
          type: "restaurant",
          image: restaurant.image,
          description: restaurant.description,
          category: restaurant.category,
          rating: restaurant.rating,
          deliveryTime: restaurant.deliveryTime,
          distance: restaurant.distance,
        });
      }
    });

    // Search menu items
    menuItems.forEach((item: any) => {
      if (
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      ) {
        results.push({
          id: item.$id,
          name: item.name,
          type: "menu",
          image: item.image,
          price: item.price,
          description: item.description,
          category: item.category,
          restaurantName: item.restaurantName,
        });
      }
    });

    // Search popular items
    popularItems.forEach((item: any) => {
      if (
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      ) {
        results.push({
          id: item.$id,
          name: item.name,
          type: "popular",
          image: item.image,
          price: item.price,
          description: item.description,
          category: item.category,
        });
      }
    });

    // Search featured items
    featuredItems.forEach((item: any) => {
      if (
        item.name.toLowerCase().includes(query) ||
        item.description?.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
      ) {
        results.push({
          id: item.$id,
          name: item.name,
          type: "featured",
          image: item.image,
          price: item.price,
          description: item.description,
          category: item.category,
        });
      }
    });

    console.log("Search results:", results);

    // Sort results by relevance (exact matches first, then partial matches)
    const sortedResults = results.sort((a, b) => {
      const aExact = a.name.toLowerCase() === query;
      const bExact = b.name.toLowerCase() === query;
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.name.localeCompare(b.name);
    });

    setSearchResults(sortedResults);
    setIsSearchOpen(true);
  }, [searchQuery, restaurants, menuItems, popularItems, featuredItems]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isSearchOpen || searchResults.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < searchResults.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : searchResults.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
            handleResultClick(searchResults[selectedIndex]);
          }
          break;
        case "Escape":
          setIsSearchOpen(false);
          setSelectedIndex(-1);
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, searchResults, selectedIndex]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchToggle = () => {
    setIsSearchVisible(!isSearchVisible);
    if (!isSearchVisible) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery("");
      setIsSearchOpen(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    console.log("Result clicked:", result);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSelectedIndex(-1);

    // Navigate based on result type
    switch (result.type) {
      case "restaurant":
        router.push(`/menu?restaurant=${result.id}`);
        break;
      case "menu":
      case "popular":
      case "featured":
        // For menu items, we could navigate to a detail page or add to cart
        router.push(`/menu?item=${result.id}`);
        break;
    }
  };

  const handleAddToCart = async (result: SearchResult) => {
    console.log("Adding to cart:", result);
    if (result.type === "restaurant") return;

    setIsAddingToCart(result.id);
    try {
      const orderData = {
        id: result.id,
        name: result.name,
        price: result.price || "0",
        quantity: 1,
        totalPrice: parseFloat(result.price || "0"),
        image: result.image || "",
        restaurantName: result.restaurantName || "Unknown Restaurant",
        category: result.category || "General",
        type: result.type,
        // Required properties for ICartItemOrder
        userId: "guest_user", // This should come from auth context
        itemId: result.id,
        restaurantId: "default_restaurant", // This should come from context or be dynamic
        source: result.type as "menu" | "featured" | "popular",
        status: "pending" as const,
        specialInstructions: "",
      };

      await dispatch(createOrderAsync(orderData));
      toast.success(`${result.name} added to cart!`);
      setActiveCart(true);
      setIsSearchOpen(false);
      setSearchQuery("");
      setSelectedIndex(-1);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add item to cart");
    } finally {
      setIsAddingToCart(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "restaurant":
        return <MapPin className="w-4 h-4" />;
      case "menu":
        return <Utensils className="w-4 h-4" />;
      case "popular":
        return <Star className="w-4 h-4" />;
      case "featured":
        return <Star className="w-4 h-4" />;
      default:
        return <Utensils className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "restaurant":
        return "Restaurant";
      case "menu":
        return "Menu Item";
      case "popular":
        return "Popular";
      case "featured":
        return "Featured";
      default:
        return "Item";
    }
  };

  const getImageUrl = (result: SearchResult) => {
    if (result.image) {
      // Determine the correct bucket ID based on the result type
      let bucketId: string;
      switch (result.type) {
        case "restaurant":
          bucketId = validateEnv().restaurantBucketId;
          break;
        case "menu":
          bucketId = validateEnv().menuBucketId;
          break;
        case "popular":
          bucketId = validateEnv().popularBucketId;
          break;
        case "featured":
          bucketId = validateEnv().featuredBucketId;
          break;
        default:
          bucketId = validateEnv().menuBucketId; // fallback
      }
      return fileUrl(bucketId, result.image);
    }
    return "/images/fallback-food.webp";
  };

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                href="/"
                className="text-2xl font-bold text-orange-600 dark:text-orange-400"
              >
                RideEx
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link
                href="/"
                className="text-sm font-medium text-gray-700 dark:text-gray-200"
              >
                Home
              </Link>
              <Link
                href="/menu"
                className="text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                Menu
              </Link>
              <Link
                href="/offers"
                className="text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                Offers
              </Link>
              <Link
                href="/myorders"
                className="text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                My Orders
              </Link>
              <Link
                href="/address"
                className="text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                Address
              </Link>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm shadow-lg"
              >
                <Search className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm shadow-lg"
              >
                <Sun className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm shadow-lg"
              >
                <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm shadow-lg"
              >
                <ShoppingCart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm shadow-lg"
              >
                <UserCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </Button>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-xl"
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg"
      } border-b border-gray-200 dark:border-gray-700`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="text-2xl lg:text-3xl font-bold text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 transition-colors"
            >
              RideEx
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === "/"
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              Home
            </Link>
            <Link
              href="/menu"
              className={`text-sm font-medium transition-colors ${
                pathname === "/menu"
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              Menu
            </Link>
            <Link
              href="/offers"
              className={`text-sm font-medium transition-colors ${
                pathname === "/offers"
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              Offers
            </Link>
            <Link
              href="/myorders"
              className={`text-sm font-medium transition-colors ${
                pathname === "/myorders"
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              My Orders
            </Link>
            <Link
              href="/address"
              className={`text-sm font-medium transition-colors ${
                pathname === "/address"
                  ? "text-orange-600 dark:text-orange-400"
                  : "text-gray-600 dark:text-gray-300 hover:text-orange-600 dark:hover:text-orange-400"
              }`}
            >
              Address
            </Link>
          </nav>

          {/* Search Bar - Desktop */}
          <div
            className="hidden lg:block flex-1 max-w-md mx-8 relative"
            ref={searchRef}
          >
            <div className="relative">
              {/* Search Icon Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSearchToggle}
                className={`group relative rounded-full transition-all duration-300 hover:scale-105 p-0 ${
                  isSearchVisible
                    ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/25"
                    : "bg-white/10 dark:bg-gray-800/10 backdrop-blur-sm border border-white/20 dark:border-gray-700/20 hover:bg-white/20 dark:hover:bg-gray-800/20"
                }`}
              >
                <div className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300 ${
                  isSearchVisible ? "bg-orange-500" : ""
                }`}>
                  <Search className={`w-5 h-5 transition-all duration-300 ${
                    isSearchVisible 
                      ? "text-white transform scale-110" 
                      : "text-orange-600 dark:text-orange-400 group-hover:text-orange-700 dark:group-hover:text-orange-300"
                  }`} />
                  {!isSearchVisible && (
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </div>
                {!isSearchVisible && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
                    Search
                  </div>
                )}
              </Button>

              {/* Search Input */}
              <div
                className={`absolute top-full left-0 right-0 mt-3 transition-all duration-500 ease-out ${
                  isSearchVisible
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 -translate-y-4 scale-95 pointer-events-none"
                }`}
              >
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-2xl blur-sm" />
                  <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-orange-200/50 dark:border-orange-700/50 rounded-2xl shadow-2xl">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-orange-500 dark:text-orange-400" />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search restaurants, menu items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        if (searchQuery.trim().length > 0) {
                          setIsSearchOpen(true);
                        }
                      }}
                      className="w-full pl-12 pr-12 py-4 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 rounded-2xl focus:ring-0"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setIsSearchOpen(false);
                          inputRef.current?.focus();
                        }}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Search Results Dropdown */}
                {isSearchOpen && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-h-96 overflow-y-auto z-50">
                    <div className="p-3">
                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                        {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                      </div>
                      {searchResults.map((result, index) => (
                        <div
                          key={`${result.type}-${result.id}`}
                          className={`w-full p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                            index === selectedIndex
                              ? "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700"
                              : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-700">
                              <Image
                                src={getImageUrl(result)}
                                alt={result.name}
                                width={48}
                                height={48}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                  {result.name}
                                </h4>
                                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                  {getTypeLabel(result.type)}
                                </Badge>
                              </div>
                              {result.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                  {result.description}
                                </p>
                              )}
                              <div className="flex items-center gap-4 mt-2">
                                {result.price && (
                                  <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                    ₦{result.price}
                                  </span>
                                )}
                                {result.restaurantName && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {result.restaurantName}
                                  </span>
                                )}
                                {result.deliveryTime && (
                                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {result.deliveryTime}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-gray-400 dark:text-gray-500">
                                {getTypeIcon(result.type)}
                              </div>
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleResultClick(result);
                                  }}
                                  className="px-3 py-1.5 text-xs bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all duration-200 flex items-center gap-1 font-medium shadow-sm"
                                >
                                  <MapPin className="w-3 h-3" />
                                  View
                                </button>
                                {result.type !== "restaurant" && (
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleAddToCart(result);
                                    }}
                                    disabled={isAddingToCart === result.id}
                                    className="px-3 py-1.5 text-xs bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 flex items-center gap-1 font-medium shadow-sm"
                                  >
                                    {isAddingToCart === result.id ? (
                                      <>
                                        <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                        Adding...
                                      </>
                                    ) : (
                                      <>
                                        <Plus className="w-3 h-3" />
                                        Add
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`rounded-full bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm shadow-lg ring-2 ring-green-500 transition-all duration-300 hover:scale-105 p-0`}
                >
                  {theme === "light" ? (
                    <Sun className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  ) : theme === "dark" ? (
                    <Moon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  ) : (
                    <Monitor className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/30 dark:border-gray-700/30 shadow-2xl"
              >
                <DropdownMenuItem
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    theme === "light"
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Light</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    theme === "dark"
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme("system")}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    theme === "system"
                      ? "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                      : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  <span>System</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105 p-0`}
            >
              <Globe className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </Button>

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveCart(true)}
              className={`rounded-full bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105 p-0 relative`}
            >
              <ShoppingCart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              {cartItems.length > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  {cartItems.length}
                </Badge>
              )}
            </Button>

            {/* Profile */}
            <ProfileDropdown>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105 p-0"
              >
                <UserCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </Button>
            </ProfileDropdown>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden rounded-full bg-white/20 dark:bg-gray-900/20 backdrop-blur-sm shadow-lg transition-all duration-300 hover:scale-105 p-0"
            >
              <Menu className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </Button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden mb-4 relative" ref={searchRef}>
          <div className="relative">
            {/* Mobile Search Toggle Button */}
            {!isSearchVisible && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSearchToggle}
                className="w-full justify-start rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition-all duration-300 shadow-lg"
              >
                <Search className="w-5 h-5 mr-3 text-orange-500 dark:text-orange-400" />
                <span className="text-gray-600 dark:text-gray-300 font-medium">
                  Search restaurants, menu items...
                </span>
              </Button>
            )}

            {/* Mobile Search Input */}
            {isSearchVisible && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-orange-600/10 rounded-2xl blur-sm" />
                <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-orange-200/50 dark:border-orange-700/50 rounded-2xl shadow-2xl">
                  <div className="flex items-center px-4 py-3">
                    <Search className="w-5 h-5 mr-3 text-orange-500 dark:text-orange-400" />
                    <input
                      ref={inputRef}
                      type="text"
                      placeholder="Search restaurants, menu items..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        if (searchQuery.trim().length > 0) {
                          setIsSearchOpen(true);
                        }
                      }}
                      className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 font-medium"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        onClick={() => {
                          setSearchQuery("");
                          setIsSearchOpen(false);
                          inputRef.current?.focus();
                        }}
                        className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setIsSearchVisible(false);
                        setSearchQuery("");
                        setIsSearchOpen(false);
                      }}
                      className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Search Results */}
          {isSearchVisible && isSearchOpen && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 max-h-96 overflow-y-auto z-50">
              <div className="p-3">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                  {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                </div>
                {searchResults.map((result, index) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                      index === selectedIndex
                        ? "bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-700"
                        : "hover:bg-gray-50 dark:hover:bg-gray-700/50 border border-transparent"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-gray-100 dark:ring-gray-700">
                      <Image
                        src={getImageUrl(result)}
                        alt={result.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {result.name}
                        </h4>
                        <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                          {getTypeLabel(result.type)}
                        </Badge>
                      </div>
                      {result.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {result.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        {result.price && (
                          <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                            ₦{result.price}
                          </span>
                        )}
                        {result.restaurantName && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {result.restaurantName}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-gray-400 dark:text-gray-500">
                        {getTypeIcon(result.type)}
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleResultClick(result);
                          }}
                          className="px-3 py-1.5 text-xs bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg transition-all duration-200 flex items-center gap-1 font-medium shadow-sm"
                        >
                          <MapPin className="w-3 h-3" />
                          View
                        </button>
                        {result.type !== "restaurant" && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddToCart(result);
                            }}
                            disabled={isAddingToCart === result.id}
                            className="px-3 py-1.5 text-xs bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-lg transition-all duration-200 flex items-center gap-1 font-medium shadow-sm"
                          >
                            {isAddingToCart === result.id ? (
                              <>
                                <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                                Adding...
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                Add
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/30 dark:border-gray-700/30 shadow-2xl">
            <nav className="px-4 py-6 space-y-4">
              <Link
                href="/"
                className="block px-6 py-4 text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all duration-300 font-semibold"
              >
                Home
              </Link>
              <Link
                href="/menu"
                className="block px-6 py-4 text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all duration-300 font-semibold"
              >
                Menu
              </Link>
              <Link
                href="/offers"
                className="block px-6 py-4 text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all duration-300 font-semibold"
              >
                Offers
              </Link>
              <Link
                href="/myorders"
                className="block px-6 py-4 text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all duration-300 font-semibold"
              >
                My Orders
              </Link>
              <Link
                href="/address"
                className="block px-6 py-4 text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-all duration-300 font-semibold"
              >
                Address
              </Link>
            </nav>
            <div className="pt-6 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl">
                <span className="text-gray-700 dark:text-gray-200 font-semibold">
                  Cart Items
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {cartItems.length} items
                </span>
              </div>
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-xl mt-3">
                <span className="text-gray-700 dark:text-gray-200 font-semibold">
                  Total
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ₦
                  {cartItems
                    .reduce(
                      (sum: number, item: any) => sum + item.totalPrice,
                      0
                    )
                    .toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
