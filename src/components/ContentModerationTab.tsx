import React, { useState, useEffect } from "react";
import { 
  IMenuItemFetched, 
  IPopularItemFetched, 
  IFeaturedItemFetched 
} from "../../types/types";
import { databases, fileUrl, validateEnv } from "@/utils/appwrite";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  ChevronDown,
  CheckCircle,
  XCircle,
  Star,
  Clock,
  Image as ImageIcon,
  Package,
  TrendingUp,
  Award,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { listAsyncFeaturedItems } from "@/state/featuredSlice";
import { listAsyncPopularItems } from "@/state/popularSlice";
import { listAsyncMenusItem } from "@/state/menuSlice";
import Image from "next/image";

type ContentType = "menu" | "popular" | "featured";
type ContentItem = IMenuItemFetched | IPopularItemFetched | IFeaturedItemFetched;

export default function ContentModerationTab() {
  // State management
  const [activeContentTab, setActiveContentTab] = useState<ContentType>("menu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [approvalFilter, setApprovalFilter] = useState<"all" | "approved" | "pending">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const dispatch = useDispatch<AppDispatch>();
  const { featuredItems } = useSelector((state: RootState) => state.featuredItem);
  const { menuItems } = useSelector((state: RootState) => state.menuItem);
  const { popularItems } = useSelector((state: RootState) => state.popularItem);

  // Effect to fetch data when tab changes
  useEffect(() => {
    setCurrentPage(1);
    setError(null);
    setLoading(true);

    let action:any;
    switch (activeContentTab) {
      case "menu":
        action = listAsyncMenusItem();
        break;
      case "popular":
        action = listAsyncPopularItems();
        break;
      case "featured":
        action = listAsyncFeaturedItems();
        break;
      default:
        setLoading(false);
        return;
    }

    dispatch(action)
      .then(() => setLoading(false))
      .catch((err:any) => {
        setError(err.message || "Failed to fetch items");
        setLoading(false);
      });
  }, [activeContentTab, dispatch]);

  // Approval handler
  const handleApproval = async (itemId: string, isApproved: boolean) => {
    try {
      let collectionId: string;
      const { databaseId } = validateEnv();

      switch (activeContentTab) {
        case "menu":
          collectionId = validateEnv().menuItemsCollectionId;
          break;
        case "popular":
          collectionId = validateEnv().popularItemsCollectionId;
          break;
        case "featured":
          collectionId = validateEnv().featuredId; // Assuming this is correct; might be featuredItemsCollectionId
          break;
        default:
          return;
      }

      await databases.updateDocument(databaseId, collectionId, itemId, {
        isApproved,
      });

      // Refetch items to update Redux state
      let action:any;
      switch (activeContentTab) {
        case "menu":
          action = listAsyncMenusItem();
          break;
        case "popular":
          action = listAsyncPopularItems();
          break;
        case "featured":
          action = listAsyncFeaturedItems();
          break;
      }
      if (action) {
        await dispatch(action);
      }

      toast.success(
        `Item ${isApproved ? "approved" : "rejected"} successfully`
      );
    } catch (error) {
      console.error("Error updating approval status:", error);
      toast.error("Failed to update approval status");
    }
  };

  // Get current items based on active tab
  const getCurrentItems = (): ContentItem[] => {
    switch (activeContentTab) {
      case "menu":
        return menuItems;
      case "popular":
        return popularItems;
      case "featured":
        return featuredItems;
      default:
        return [];
    }
  };

  // Filter items
  const filteredItems = getCurrentItems().filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesApproval = 
      approvalFilter === "all" ||
      (approvalFilter === "approved" && item.isApproved) ||
      (approvalFilter === "pending" && !item.isApproved);

    return matchesSearch && matchesApproval;
  });

  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getApprovalBadge = (isApproved: boolean | undefined) => {
    if (isApproved) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
        <Clock className="w-3 h-3 mr-1" />
        Pending
      </span>
    );
  };

  const getTabIcon = (type: ContentType) => {
    switch (type) {
      case "menu":
        return <Package className="w-4 h-4" />;
      case "popular":
        return <TrendingUp className="w-4 h-4" />;
      case "featured":
        return <Award className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };
const {popularBucketId,menuBucketId,featuredBucketId} = validateEnv();

 // Get bucket ID based on active tab
 const getBucketId = (): string => {
  switch (activeContentTab) {
    case "menu":
      return validateEnv().menuBucketId;
    case "popular":
      return validateEnv().popularBucketId;
    case "featured":
      return validateEnv().featuredBucketId;
    default:
      return "";
  }
};

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Content Moderation
        </h2>

        {/* Content Type Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-6">
          {(["menu", "popular", "featured"] as ContentType[]).map((type) => (
            <button
              key={type}
              onClick={() => setActiveContentTab(type)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                activeContentTab === type
                  ? "bg-white dark:bg-gray-700 text-orange-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-orange-600"
              }`}
            >
              {getTabIcon(type)}
              {type.charAt(0).toUpperCase() + type.slice(1)} Items
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1 sm:flex-none">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="relative flex-1 sm:flex-none">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value as "all" | "approved" | "pending")}
              className="w-full pl-10 pr-8 py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 appearance-none"
            >
              <option value="all">All Items</option>
              <option value="pending">Pending Approval</option>
              <option value="approved">Approved</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
            >
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600 font-semibold p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
          {error}
        </div>
      ) : (
        <>
          {/* Desktop View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <thead className="bg-orange-100 dark:bg-orange-900/30">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Item
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Details
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Price
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Rating
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.length > 0 ? (
                  paginatedItems.map((item) => (
                    <tr
                      key={item.$id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                            {item.image ? (
                              <Image
                                src={fileUrl(getBucketId(),item.image)}
                                alt={item.name}
                                className="w-full h-full object-cover hidden "
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  target.nextElementSibling?.classList.remove('hidden');
                                }}
                                width={50}
                                height={50}
                              />
                            ) : null}
                            <div className={`w-full h-full flex items-center justify-center text-gray-400 absolute top-0 left-0 ${item.image ? 'hidden' : ''}`}>
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {item.name}
                            </p>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-500">
                          <p className="flex items-center gap-1 mb-1">
                            <span className="font-medium">Category:</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              item.category === 'veg' || item.category === 'Vegetarian'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {item.category}
                            </span>
                          </p>
                          {('cookTime' in item) && (
                            <p className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.cookTime}
                            </p>
                          )}
                          {('cookingTime' in item) && (
                            <p className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {item.cookingTime}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold text-orange-600">
                            ₦{item.price}
                          </p>
                          {item.originalPrice && item.originalPrice !== item.price && (
                            <p className="text-sm text-gray-500 line-through">
                              ₦{item.originalPrice}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {item.rating}
                          </span>
                          {('reviewCount' in item) && (
                            <span className="text-xs text-gray-500">
                              ({item.reviewCount})
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getApprovalBadge(item.isApproved)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproval(item.$id, true)}
                            disabled={item.isApproved}
                            className={`p-2 rounded-lg transition ${
                              item.isApproved
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                            title="Approve"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleApproval(item.$id, false)}
                            disabled={!item.isApproved && item.isApproved !== undefined}
                            className={`p-2 rounded-lg transition ${
                              !item.isApproved && item.isApproved !== undefined
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      No items found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="lg:hidden space-y-4">
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item) => (
                <div
                  key={item.$id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
                >
                  <div className="flex gap-3 mb-3">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0 relative">
                      {item.image ? (
                        <Image
                          src={fileUrl(getBucketId(),item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                          width={50}
                          height={50}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center text-gray-400 absolute top-0 left-0 ${item.image ? 'hidden' : ''}`}>
                        <ImageIcon className="w-6 h-6" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-orange-600">
                            ₦{item.price}
                          </span>
                          {item.originalPrice && item.originalPrice !== item.price && (
                            <span className="text-sm text-gray-500 line-through">
                              ₦{item.originalPrice}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{item.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        item.category === 'veg' || item.category === 'Vegetarian'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {item.category}
                      </span>
                      {getApprovalBadge(item.isApproved)}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproval(item.$id, true)}
                        disabled={item.isApproved}
                        className={`flex-1 p-2 rounded-lg transition ${
                          item.isApproved
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4 mx-auto" />
                        <span className="text-xs mt-1 block">Approve</span>
                      </button>
                      <button
                        onClick={() => handleApproval(item.$id, false)}
                        disabled={!item.isApproved && item.isApproved !== undefined}
                        className={`flex-1 p-2 rounded-lg transition ${
                          !item.isApproved && item.isApproved !== undefined
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-red-600 text-white hover:bg-red-700'
                        }`}
                      >
                        <XCircle className="w-4 h-4 mx-auto" />
                        <span className="text-xs mt-1 block">Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                No items found.
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredItems.length > itemsPerPage && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700 transition text-sm"
              >
                Previous
              </button>
              <span className="text-gray-600 dark:text-gray-300 text-sm text-center">
                Page {currentPage} of{" "}
                {Math.ceil(filteredItems.length / itemsPerPage)}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(filteredItems.length / itemsPerPage)
                    )
                  )
                }
                disabled={
                  currentPage === Math.ceil(filteredItems.length / itemsPerPage)
                }
                className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700 transition text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}