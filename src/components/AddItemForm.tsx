// components/AddFoodItemForm.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FeaturedItemFormData,
  featuredItemSchema,
  MenuItemFormData,
  menuItemSchema,
  RestaurantFormData,
  restaurantSchema,
  PopularItemFormData,
  popularItemSchema,
  DiscountFormData,
  discountSchema,
} from "@/utils/schema";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import {
  createAsyncRestaurant,
  listAsyncRestaurants,
} from "@/state/restaurantSlice";
import { createAsyncMenuItem } from "@/state/menuSlice";
import { createAsyncDiscount, listAsyncDiscounts } from "@/state/discountSlice";
import toast from "react-hot-toast";
import { createAsyncFeaturedItem, listAsyncFeaturedItems } from "@/state/featuredSlice";
import { createAsyncPopularItem, listAsyncPopularItems } from "@/state/popularSlice";
import { IRestaurant, IDiscount } from "../../types/types";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/authContext";
import AddItemSidebar from "./AddItemSidebar";
import MenuItemForm from "./forms/MenuItemForm";
import FeaturedItemForm from "./forms/FeaturedItemForm";
import PopularItemForm from "./forms/PopularItemForm";
import DiscountForm from "./forms/DiscountForm";

const AddFoodItemForm = () => {
  const [activeTab, setActiveTab] = useState<
     "menu-item" | "featured-item" | "popular-item" | "discount"
  >("menu-item");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { restaurants } = useSelector((state: RootState) => state.restaurant);
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Initialize forms
  const restaurantForm = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      rating: 0,
      deliveryTime: "",
      category: "",
      distance: "",
      logo: undefined,
    },
    mode: "onChange",
  });

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
        options = restaurants.map((r) => ({ label: r.name, value: r.$id }));
        break;
      case "item":
        options = []; // Placeholder: fetch menu items if available
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
  }, [appliesTo, restaurants]);

  // Load data
  useEffect(() => {
    dispatch(listAsyncRestaurants());
    dispatch(listAsyncDiscounts());
    dispatch(listAsyncFeaturedItems());
    dispatch(listAsyncPopularItems());
  }, [dispatch]);

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated || user?.role === "user") {
      router.push("/");
    }
  }, [isAuthenticated, user, router]);

  // Handlers
  const handleMenuItemSubmit = async (data: MenuItemFormData) => {
    if (user?.role === "user") {
      return;
    }
    setLoading(true);
    try {
      await dispatch(createAsyncMenuItem(data)).unwrap();
      menuItemForm.reset();
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
      await dispatch(createAsyncFeaturedItem(data)).unwrap();
      featuredItemForm.reset();
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
      await dispatch(createAsyncPopularItem(data)).unwrap();
      popularItemForm.reset();
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
      const discountData: IDiscount = {
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

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <AddItemSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-8 text-center lg:text-left">
          Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' ')}
        </h1>
        {activeTab === "menu-item" && (
          <MenuItemForm form={menuItemForm} restaurants={restaurants} onSubmit={handleMenuItemSubmit} loading={loading} />
        )}
        {activeTab === "featured-item" && (
          <FeaturedItemForm form={featuredItemForm} restaurants={restaurants} onSubmit={handleFeaturedItemSubmit} loading={loading} />
        )}
        {activeTab === "popular-item" && (
          <PopularItemForm form={popularItemForm} restaurants={restaurants} onSubmit={handlePopularItemSubmit} loading={loading} />
        )}
        {activeTab === "discount" && (
          <DiscountForm form={discountForm} targetOptions={targetOptions} onSubmit={handleDiscountSubmit} loading={loading} />
        )}
      </main>
    </div>
  );
};

export default AddFoodItemForm;