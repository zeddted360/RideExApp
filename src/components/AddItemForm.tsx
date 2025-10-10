"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FeaturedItemFormData,
  featuredItemSchema,
  MenuItemFormData,
  menuItemSchema,
  PopularItemFormData,
  popularItemSchema,
  DiscountFormData,
  discountSchema,
} from "@/utils/schema";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import {
  listAsyncRestaurants,
  getAsyncRestaurantById,
} from "@/state/restaurantSlice";
import { createAsyncMenuItem, listAsyncMenusItem, updateAsyncMenuItem, deleteAsyncMenuItem } from "@/state/menuSlice";
import { createAsyncDiscount, listAsyncDiscounts, updateAsyncDiscount, deleteAsyncDiscount } from "@/state/discountSlice";
import toast from "react-hot-toast";
import { createAsyncFeaturedItem, listAsyncFeaturedItems, updateAsyncFeaturedItem, deleteAsyncFeaturedItem } from "@/state/featuredSlice";
import { createAsyncPopularItem, listAsyncPopularItems, updateAsyncPopularItem, deleteAsyncPopularItem } from "@/state/popularSlice";
import {  IDiscount, IRestaurantFetched, IMenuItemFetched, IFeaturedItemFetched, IPopularItemFetched, IExtras, IFetchedExtras } from "../../types/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import AddItemSidebar from "./AddItemSidebar";
import MenuItemForm from "./forms/MenuItemForm";
import FeaturedItemForm from "./forms/FeaturedItemForm";
import PopularItemForm from "./forms/PopularItemForm";
import DiscountForm from "./forms/DiscountForm";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import Image from "next/image";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { Loader2, XCircle } from "lucide-react";
import EditItemModal from "./vendor/EditItemModal";
import ExtrasManagementForm from "./forms/ExtrasManagementForm";
import AddExtrasModal from "./AddExtrasModal";

const AddFoodItemForm = () => {
  const [activeTab, setActiveTab] = useState<
     "account" | "menu-item" | "featured-item" | "popular-item" | "discount" | "edit-menu" | "extras"
  >("account");
  const [subActiveTab, setSubActiveTab] = useState<"menu" | "featured" | "popular">("menu");
  const [loading, setLoading] = useState(false);
  const [searchCategory, setSearchCategory] = useState("");

  // Edit state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IMenuItemFetched | IFeaturedItemFetched | IPopularItemFetched | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [newImage, setNewImage] = useState<File | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [restaurantName, setRestaurantName] = useState<string>("");

  // Extras state for menu items
  const [menuSelectedExtras, setMenuSelectedExtras] = useState<IFetchedExtras[]>([]);
  // Extras state for featured items
  const [featuredSelectedExtras, setFeaturedSelectedExtras] = useState<IFetchedExtras[]>([]);
  // Extras state for popular items
  const [popularSelectedExtras, setPopularSelectedExtras] = useState<IFetchedExtras[]>([]);

  const dispatch = useDispatch<AppDispatch>();
  const { restaurants } = useSelector((state: RootState) => state.restaurant);
  const { featuredItems } = useSelector((state: RootState) => state.featuredItem);
  const { popularItems } = useSelector((state: RootState) => state.popularItem);
  const { menuItems } = useSelector((state: RootState) => state.menuItem);

  // const {extras} = useSelector((state:RootState)=>state.extra);

  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  const userId = user?.userId;
  const role = user?.role;


  const getRestaurantName = async (restaurantId: string, dispatch: AppDispatch): Promise<string> => {
    try {
      const response = await dispatch(getAsyncRestaurantById(restaurantId)).unwrap();
      return response.name || "Unknown restaurant";  
    } catch (error) {
      console.error(error instanceof Error ? error.message : "Could not fetch restaurant");
      return "Unknown restaurant";  
    }
  };
  
  useEffect(() => {
    if (editFormData.restaurantId && showEditModal) {
      const fetchName = async () => {
        const name = await getRestaurantName(editFormData.restaurantId, dispatch);
        setRestaurantName(name);
      };
      fetchName();
    }
  }, [editFormData.restaurantId, showEditModal, dispatch]);
  

  // Vendor's restaurants
  const vendorRestaurants = useMemo(() => 
    restaurants.filter((r: IRestaurantFetched) => r.vendorId === userId),
  [restaurants, userId]);

  // Filtered restaurants based on search
  const filteredRestaurants = useMemo(() => {
    if (!searchCategory.trim()) {
      return vendorRestaurants;
    }
    return vendorRestaurants.filter((restaurant) =>
      restaurant.category.toLowerCase().includes(searchCategory.toLowerCase())
    );
  }, [searchCategory, vendorRestaurants]);

  // Filtered items for edit menu
  const filteredMenuItems = useMemo(() => 
    menuItems.filter((item: IMenuItemFetched) => 
      vendorRestaurants.some((r: IRestaurantFetched) => r.$id === item.restaurantId)
    ),
  [menuItems, vendorRestaurants]);

  const filteredFeaturedItems = useMemo(() => 
    featuredItems.filter((item: IFeaturedItemFetched) => 
      vendorRestaurants.some((r: IRestaurantFetched) => r.$id === item.restaurantId)
    ),
  [featuredItems, vendorRestaurants]);

  const filteredPopularItems = useMemo(() => 
    popularItems.filter((item: IPopularItemFetched) => 
      vendorRestaurants.some((r: IRestaurantFetched) => r.$id === item.restaurantId)
    ),
  [popularItems, vendorRestaurants]);

  // Initialize forms

  const menuItemForm = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      rating: 0,
      cookTime: "",
      category: "veg",
      restaurantId: "",
    },
    mode: "onChange",
  });

  const featuredItemForm = useForm<FeaturedItemFormData>({
    resolver: zodResolver(featuredItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      rating: 0,
      restaurantId: "",
      category: "non-veg",
    },
    mode: "onChange",
  });

  const popularItemForm = useForm<PopularItemFormData>({
    resolver: zodResolver(popularItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      originalPrice: "",
      rating: 0,
      reviewCount: 0,
      image: undefined,
      category: "",
      cookingTime: "",
      isPopular: true,
      discount: "",
      restaurantId: "",
    },
    mode: "onChange",
  });

  const discountForm = useForm<DiscountFormData>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      title: "",
      description: "",
      discountType: "percentage",
      discountValue: 0,
      validFrom: "",
      validTo: "",
      minOrderValue: 0,
      maxUses: 0,
      code: "",
      appliesTo: "all",
      targetId: "",
      image: undefined,
      isActive: true,
    },
    mode: "onChange",
  });

  // Dynamic target options for DiscountForm
  const [targetOptions, setTargetOptions] = useState<{ label: string; value: string }[]>([]);
  const appliesTo = discountForm.watch("appliesTo");

  useEffect(() => {
    let options: { label: string; value: string }[] = [];
    switch (appliesTo) {
      case "restaurant":
        options = vendorRestaurants.map((r) => ({ label: r.name, value: r.$id }));
        break;
      case "item":
        options = [];
        break;
      case "category":
        options = [
          { label: "Veg", value: "veg" },
          { label: "Non-Veg", value: "non-veg" },
        ];
        break;
      default:
        options = [];
    }
    setTargetOptions(options);
  }, [appliesTo, vendorRestaurants]);

  // Load data
  useEffect(() => {
    dispatch(listAsyncRestaurants());
    dispatch(listAsyncDiscounts());
    dispatch(listAsyncFeaturedItems());
    dispatch(listAsyncPopularItems());
    dispatch(listAsyncMenusItem());
  }, [dispatch]);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated || user?.role === "user") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  // Handlers for create
  const handleMenuItemSubmit = async (data: MenuItemFormData) => {
    if (user?.role === "user") {
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        ...data,
        extras: menuSelectedExtras.map((extra) => extra.$id),
      };
      await dispatch(createAsyncMenuItem(payload)).unwrap();
      menuItemForm.reset();
      setMenuSelectedExtras([]);
      toast.success("Menu item added successfully!");
    } catch (error) {
      toast.error("Failed to add menu item");
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturedItemSubmit = async (data: FeaturedItemFormData) => {
    if (user?.role === "user") {
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        ...data,
        extras: featuredSelectedExtras.map((extra) => extra.$id),
      };
      await dispatch(createAsyncFeaturedItem(payload)).unwrap();
      featuredItemForm.reset();
      setFeaturedSelectedExtras([]);
      toast.success("Featured item added successfully!");
    } catch (error) {
      toast.error("Failed to add featured item");
    } finally {
      setLoading(false);
    }
  };

  const handlePopularItemSubmit = async (data: PopularItemFormData) => {
    if (user?.role === "user") {
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        ...data,
        extras: popularSelectedExtras.map((extra) => extra.$id),
      };
      await dispatch(createAsyncPopularItem(payload)).unwrap();
      popularItemForm.reset();
      setPopularSelectedExtras([]);
      toast.success("Popular item added successfully!");
    } catch (error) {
      toast.error("Failed to add popular item");
    } finally {
      setLoading(false);
    }
  };

  const handleDiscountSubmit = async (data: DiscountFormData) => {
    if (user?.role === "user") {
      return;
    }
    setLoading(true);
    try {
      const discountData: Partial<IDiscount> = {
        title: data.title,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        validFrom: data.validFrom,
        validTo: data.validTo,
        minOrderValue: data.minOrderValue,
        maxUses: data.maxUses,
        code: data.code,
        appliesTo: data.appliesTo,
        targetId: data.targetId,
        image: data.image,
        isActive: data.isActive,
      };
      await dispatch(createAsyncDiscount(discountData)).unwrap();
      discountForm.reset();
      toast.success("Discount added successfully!");
    } catch (error) {
      toast.error("Failed to add discount");
    } finally {
      setLoading(false);
    }
  };

  // Edit handlers
  const handleEdit = (item: IMenuItemFetched | IFeaturedItemFetched | IPopularItemFetched, type: "menu" | "featured" | "popular") => {
    setSelectedItem(item);
    const commonData = {
      name: item.name,
      description: item.description || "",
      price: item.price,
      rating: item.rating,
      category: item.category,
      restaurantId: item.restaurantId,
      isApproved: item.isApproved,
    };
    let formData: any = { ...commonData };
    switch (type) {
      case "menu":
        formData = {
          ...formData,
          originalPrice: (item as IMenuItemFetched).originalPrice || "",
          cookTime: (item as IMenuItemFetched).cookTime || "",
        };
        break;
      case "popular":
        formData = {
          ...formData,
          originalPrice: (item as IPopularItemFetched).originalPrice || "",
          cookingTime: (item as IPopularItemFetched).cookingTime || "",
          reviewCount: (item as IPopularItemFetched).reviewCount || 0,
          isPopular: (item as IPopularItemFetched).isPopular || false,
          discount: (item as IPopularItemFetched).discount || "",
        };
        break;
      case "featured":
        // Only common fields for featured
        break;
      default:
        break;
    }
    setEditFormData(formData);
    setNewImage(null);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedItem) return;
    try {
      setIsUpdating(true);
      const itemId = selectedItem.$id;
      let updateData: any;
      let action;
      const subType = subActiveTab;
      switch (subType) {
        case "menu":
          updateData = {
            name: editFormData.name,
            description: editFormData.description,
            price: editFormData.price,
            originalPrice: editFormData.originalPrice,
            rating: parseFloat(editFormData.rating),
            cookTime: editFormData.cookTime,
            category: editFormData.category,
            restaurantId: editFormData.restaurantId,
            isApproved: editFormData.isApproved,
          };
          action = updateAsyncMenuItem({ itemId, data: updateData, newImage });
          break;
        case "featured":
          updateData = {
            name: editFormData.name,
            description: editFormData.description,
            price: editFormData.price,
            rating: parseFloat(editFormData.rating),
            category: editFormData.category,
            restaurantId: editFormData.restaurantId,
            isApproved: editFormData.isApproved,
          };
          action = updateAsyncFeaturedItem({ itemId, data: updateData, newImage });
          break;
        case "popular":
          updateData = {
            name: editFormData.name,
            description: editFormData.description,
            price: editFormData.price,
            originalPrice: editFormData.originalPrice,
            rating: parseFloat(editFormData.rating),
            reviewCount: parseInt(editFormData.reviewCount?.toString() || "0", 10),
            category: editFormData.category,
            cookingTime: editFormData.cookingTime,
            isPopular: editFormData.isPopular,
            discount: editFormData.discount,
            restaurantId: editFormData.restaurantId,
            isApproved: editFormData.isApproved,
          };
          action = updateAsyncPopularItem({ itemId, data: updateData, newImage });
          break;
      }

      if (action) {
        await dispatch(action as any).unwrap();
        toast.success("Item updated successfully");
        setShowEditModal(false);
        // Refetch based on sub tab
        switch (subType) {
          case "menu":
            dispatch(listAsyncMenusItem());
            break;
          case "featured":
            dispatch(listAsyncFeaturedItems());
            break;
          case "popular":
            dispatch(listAsyncPopularItems());
            break;
        }
      }
    } catch (error) {
      toast.error("Failed to update item");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (item: IMenuItemFetched | IFeaturedItemFetched | IPopularItemFetched) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      setIsDeleting(true);
      let action;
      const subType = subActiveTab;
      switch (subType) {
        case "menu":
          action = deleteAsyncMenuItem({ itemId: selectedItem.$id, imageId: (selectedItem as IMenuItemFetched).image });
          break;
        case "featured":
          action = deleteAsyncFeaturedItem({ itemId: selectedItem.$id, imageId: (selectedItem as IFeaturedItemFetched).image });
          break;
        case "popular":
          action = deleteAsyncPopularItem({ itemId: selectedItem.$id, imageId: (selectedItem as IPopularItemFetched).image });
          break;
      }

      if (action) {
        await dispatch(action).unwrap();
        toast.success("Item deleted successfully");
        setShowDeleteModal(false);
        // Refetch based on sub tab
        switch (subType) {
          case "menu":
            dispatch(listAsyncMenusItem());
            break;
          case "featured":
            dispatch(listAsyncFeaturedItems());
            break;
          case "popular":
            dispatch(listAsyncPopularItems());
            break;
        }
      }
    } catch (error) {
      toast.error("Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  const getTitle = () => {
    if (activeTab === "account") {
      return "My Restaurants";
    }
    if (activeTab === "edit-menu") {
      return "Edit Menu";
    }
    return `Add New ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}`;
  };

  const { menuBucketId, popularBucketId, featuredBucketId } = validateEnv();

  const getBucketId = (type: "menu" | "featured" | "popular"): string => {
    return type === "menu" ? menuBucketId : type === "featured" ? featuredBucketId : popularBucketId;
  };

  const renderItemCard = (item: IMenuItemFetched | IPopularItemFetched | IFeaturedItemFetched, type: "menu" | "featured" | "popular") => (
    <div className="group flex bg-white dark:bg-gray-800 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 w-full h-[240px] border border-gray-200 dark:border-gray-700">
      {/* Image on the left */}
      <div className="relative w-64 h-full overflow-hidden flex-shrink-0">
        <Image
          src={fileUrl(getBucketId(type), item.image)}
          alt={`${type} item image`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          sizes="250px"
        />
      </div>

      {/* Content on the right */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div className="space-y-2">
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg line-clamp-1">
            {item.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
            {item.description || 'No description available.'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {item.category}
          </p>
          {type === "menu" && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cook Time: {item.cookTime}
            </p>
          )}
          {type === "featured" && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Rating: {item.rating || 0}/5
            </p>
          )}
          {type === "popular" && (
            <>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Rating: {item.rating || 0}/5
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Reviews: {item.reviewCount}
              </p>
            </>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
            ₦{item.price}
          </span>
          <Button
            onClick={() => handleEdit(item, type)}
            aria-label={`Edit ${item.name}`}
            className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-semibold text-sm hover:from-blue-600 hover:to-blue-700 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50 min-w-[80px]"
          >
            Edit
          </Button>
        </div>
      </div>
    </div>
  );

  if (!isAuthenticated || role === "user" || role === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md text-center border border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Access Restricted</h2>
          <p className="text-gray-600 dark:text-gray-400">This page is only accessible to vendors</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <AddItemSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 text-center lg:text-left">
          {getTitle()}
        </h1>
        {activeTab === "account" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="text"
                placeholder="Search restaurants by category..."
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            {filteredRestaurants.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRestaurants.map((restaurant: IRestaurantFetched) => (
                  <div
                    key={restaurant.$id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-200"
                  >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                      {restaurant.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      <span className="font-medium">Category:</span> {restaurant.category}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      <span className="font-medium">Rating:</span> {restaurant.rating || 0}/5
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-1">
                      <span className="font-medium">Delivery Time:</span> {restaurant.deliveryTime}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Distance:</span> {restaurant.distance}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                {searchCategory.trim() ? "No restaurants found matching the category." : "No restaurants available."}
              </div>
            )}
          </div>
        )}
        {activeTab === "edit-menu" && (
          <div className="space-y-6">
            <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700 pb-2">
              {[
                { id: "menu", label: "Menu Items" },
                { id: "featured", label: "Featured Items" },
                { id: "popular", label: "Popular Items" },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setSubActiveTab(tab.id as "menu" | "featured" | "popular")}
                  className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${
                    subActiveTab === tab.id
                      ? "bg-orange-500 text-white border-b-2 border-orange-500"
                      : "text-gray-600 dark:text-gray-300 hover:text-orange-500"
                  }`}
                >
                  {tab.label}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-6">
              {subActiveTab === "menu" && filteredMenuItems.length > 0 ? (
                filteredMenuItems.map((item: IMenuItemFetched) => renderItemCard(item, "menu"))
              ) : subActiveTab === "menu" ? (
                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                  No menu items available.
                </div>
              ) : null}
              {subActiveTab === "featured" && filteredFeaturedItems.length > 0 ? (
                filteredFeaturedItems.map((item: IFeaturedItemFetched) => renderItemCard(item, "featured"))
              ) : subActiveTab === "featured" ? (
                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                  No featured items available.
                </div>
              ) : null}
              {subActiveTab === "popular" && filteredPopularItems.length > 0 ? (
                filteredPopularItems.map((item: IPopularItemFetched) => renderItemCard(item, "popular"))
              ) : subActiveTab === "popular" ? (
                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                  No popular items available.
                </div>
              ) : null}
            </div>
          </div>
        )}
       {activeTab === "menu-item" && (
        <div className="space-y-6">
          <MenuItemForm form={menuItemForm} restaurants={vendorRestaurants} onSubmit={handleMenuItemSubmit} loading={loading} />
          <AddExtrasModal 
            onAddExtras={(selectedExtras) => {
              setMenuSelectedExtras(selectedExtras);
              console.log("Selected extras for menu item:", selectedExtras);
              toast.success(`${selectedExtras.length} extras added!`);
            }} 
          />
        </div>
      )}
       {activeTab === "featured-item" && (
        <div className="space-y-6">
          <FeaturedItemForm form={featuredItemForm} restaurants={vendorRestaurants} onSubmit={handleFeaturedItemSubmit} loading={loading} />
          <AddExtrasModal 
            onAddExtras={(selectedExtras) => {
              setFeaturedSelectedExtras(selectedExtras);
              console.log("Selected extras for featured item:", selectedExtras);
              toast.success(`${selectedExtras.length} extras added!`);
            }} 
          />
        </div>
      )}
        {activeTab === "popular-item" && (
          <div className="space-y-6">
          <PopularItemForm form={popularItemForm} restaurants={vendorRestaurants} onSubmit={handlePopularItemSubmit} loading={loading} />
          <AddExtrasModal 
            onAddExtras={(selectedExtras) => {
              setPopularSelectedExtras(selectedExtras);
              console.log("Selected extras for popular item:", selectedExtras);
              toast.success(`${selectedExtras.length} extras added!`);
            }} 
          />

          </div>
        )}
        {activeTab === "discount" && (
          <div className="space-y-6">
          <DiscountForm form={discountForm} targetOptions={targetOptions} onSubmit={handleDiscountSubmit} loading={loading} />
          <AddExtrasModal 
            onAddExtras={(selectedExtras) => {
              console.log("Selected extras for discount:", selectedExtras);
              toast.success(`${selectedExtras.length} extras added!`);
            }} 
          />
          </div>
        )}
        {
          activeTab === "extras" && <ExtrasManagementForm/>
        }
      </main>

      {/* Edit Modal */}
      {showEditModal && selectedItem && (
        <EditItemModal
          item={selectedItem}
          type={subActiveTab}
          dispatch={dispatch}
          onClose={() => setShowEditModal(false)}
          editFormData={editFormData}
          setEditFormData={setEditFormData}
          newImage={newImage}
          setNewImage={setNewImage}
          isUpdating={isUpdating}
          setIsUpdating={setIsUpdating}
          restaurantName={restaurantName}
          setRestaurantName={setRestaurantName}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Confirm Delete
                </h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <p className="text-gray-700 dark:text-gray-300">
                  Are you sure you want to delete "{selectedItem.name}"? This action cannot be undone.
                </p>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddFoodItemForm;