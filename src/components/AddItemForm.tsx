"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  Star,
  Clock,
  MapPin,
  ChefHat,
  Image as ImageIcon,
} from "lucide-react";
import {
  FeaturedItemFormData,
  featuredItemSchema,
  MenuItemFormData,
  menuItemSchema,
  RestaurantFormData,
  restaurantSchema,
  PopularItemFormData,
  popularItemSchema,
} from "@/utils/schema";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import {
  createAsyncRestaurant,
  listAsyncRestaurants,
} from "@/state/restaurantSlice";
import { createAsyncMenuItem } from "@/state/menuSlice";
import toast from "react-hot-toast";
import {
  createAsyncFeaturedItem,
  listAsyncFeaturedItems,
} from "@/state/featuredSlice";
import {
  createAsyncPopularItem,
  listAsyncPopularItems,
} from "@/state/popularSlice";
import { IRestaurant } from "../../types/types";

const AddFoodItemForm = () => {
  const [activeTab, setActiveTab] = useState<
    "restaurant" | "menu-item" | "featured-item" | "popular-item"
  >("restaurant");
  const [restaurantLoading, setRestaurantLoading] = useState(false);
  const [menuItemLoading, setMenuItemLoading] = useState(false);
  const [featuredItemLoading, setFeaturedItemLoading] =
    useState<boolean>(false);
  const [popularItemLoading, setPopularItemLoading] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const { restaurants } = useSelector((state: RootState) => state.restaurant);
  const { featuredItems } = useSelector(
    (state: RootState) => state.featuredItem
  );
  const { popularItems } = useSelector((state: RootState) => state.popularItem);

  // Restaurant Form
  const restaurantForm = useForm<RestaurantFormData>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: "",
      rating: 0,
      deliveryTime: "",
      category: "",
      distance: "",
    },
    mode: "onChange",
  });

  // Menu Item Form
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

  // Featured Item Form
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

  // Popular Item Form
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

  // Handle Restaurant Form Submission
  const onRestaurantSubmit = async (data: RestaurantFormData) => {
    setRestaurantLoading(true);
    try {
      // Type assertion to match IRestaurant interface
      const restaurantData: IRestaurant = {
        name: data.name,
        logo: data.logo as FileList,
        rating: data.rating,
        deliveryTime: data.deliveryTime,
        category: data.category,
        distance: data.distance,
      };
      await dispatch(createAsyncRestaurant(restaurantData)).unwrap();
      restaurantForm.reset();
      await dispatch(listAsyncRestaurants());
      toast.success("Restaurant added successfully!");
    } catch (error) {
      toast.error("Failed to add restaurant");
      console.error(error);
    } finally {
      setRestaurantLoading(false);
    }
  };

  // Handle Menu Item Form Submission
  const onMenuItemSubmit = async (data: MenuItemFormData) => {
    if (!restaurants.length) {
      toast.error("Please add a restaurant first!");
      return;
    }
    setMenuItemLoading(true);
    try {
      await dispatch(createAsyncMenuItem(data)).unwrap();
      menuItemForm.reset();
      toast.success("Menu item added successfully!");
    } catch (error) {
      toast.error("Failed to add menu item");
    } finally {
      setMenuItemLoading(false);
    }
  };

  // Handle Featured Item Form Submission
  const onFeaturedSubmit = async (data: FeaturedItemFormData) => {
    if (!restaurants.length) {
      toast.error("Please add a restaurant first!");
      return;
    }
    setFeaturedItemLoading(true);
    try {
      await dispatch(createAsyncFeaturedItem(data)).unwrap();
      featuredItemForm.reset();
      await dispatch(listAsyncFeaturedItems());
      toast.success("Featured item added successfully!");
    } catch (error) {
      toast.error("Failed to add featured item");
      console.error(error);
    } finally {
      setFeaturedItemLoading(false);
    }
  };

  // Handle Popular Item Form Submission
  const onPopularSubmit = async (data: PopularItemFormData) => {
    if (!restaurants.length) {
      toast.error("Please add a restaurant first!");
      return;
    }
    setPopularItemLoading(true);
    try {
      await dispatch(createAsyncPopularItem(data)).unwrap();
      popularItemForm.reset();
      await dispatch(listAsyncPopularItems());
      toast.success("Popular item added successfully!");
    } catch (error) {
      toast.error("Failed to add popular item");
    } finally {
      setPopularItemLoading(false);
    }
  };

  // Load restaurants, featured items, and popular items on component mount
  useEffect(() => {
    async function loadData() {
      await Promise.all([
        dispatch(listAsyncRestaurants()),
        dispatch(listAsyncFeaturedItems()),
        dispatch(listAsyncPopularItems()),
      ]);
    }
    loadData();
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Add New Item
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Fill in the details below to add a new item to your menu.
          </p>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
            <TabsTrigger
              value="basic"
              className="text-gray-700 dark:text-gray-300"
            >
              Basic Info
            </TabsTrigger>
            <TabsTrigger
              value="details"
              className="text-gray-700 dark:text-gray-300"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="pricing"
              className="text-gray-700 dark:text-gray-300"
            >
              Pricing
            </TabsTrigger>
            <TabsTrigger
              value="media"
              className="text-gray-700 dark:text-gray-300"
            >
              Media
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Item Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter item name"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="category"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Category
                </Label>
                <Select>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appetizer">Appetizer</SelectItem>
                    <SelectItem value="main">Main Course</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="beverage">Beverage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </Label>
              <div className="relative">
                <Textarea
                  id="description"
                  placeholder="Describe your item..."
                  className="min-h-[120px] resize-none"
                />
                <ImageIcon className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute right-3 top-3" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="cookTime"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Cook Time
                </Label>
                <div className="relative">
                  <Input
                    id="cookTime"
                    type="number"
                    placeholder="Enter cook time in minutes"
                    className="h-12 pl-10"
                  />
                  <Clock className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="location"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Location
                </Label>
                <div className="relative">
                  <Input
                    id="location"
                    placeholder="Enter location"
                    className="h-12 pl-10"
                  />
                  <MapPin className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-3" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="spiceLevel"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Spice Level
                </Label>
                <Select>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select spice level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hot">Hot</SelectItem>
                    <SelectItem value="extra-hot">Extra Hot</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="dietary"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Dietary Info
                </Label>
                <Select>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select dietary info" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vegetarian">Vegetarian</SelectItem>
                    <SelectItem value="vegan">Vegan</SelectItem>
                    <SelectItem value="gluten-free">Gluten Free</SelectItem>
                    <SelectItem value="halal">Halal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="price"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Price (₦)
                </Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="Enter price"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="originalPrice"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Original Price (₦)
                </Label>
                <Input
                  id="originalPrice"
                  type="number"
                  placeholder="Enter original price"
                  className="h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="discount"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Discount (%)
                </Label>
                <Input
                  id="discount"
                  type="number"
                  placeholder="Enter discount percentage"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="currency"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Currency
                </Label>
                <Select>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NGN">NGN (₦)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <div className="space-y-2">
              <Label
                htmlFor="image"
                className="text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Item Image
              </Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop your image here, or click to browse
                </p>
                <Button variant="outline" className="mt-2">
                  Choose File
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label
                  htmlFor="video"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Video URL (Optional)
                </Label>
                <Input
                  id="video"
                  type="url"
                  placeholder="Enter video URL"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="gallery"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Gallery Images
                </Label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
                  <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Add multiple images
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" className="px-8">
            Cancel
          </Button>
          <Button className="px-8">Add Item</Button>
        </div>
      </div>
    </div>
  );
};

export default AddFoodItemForm;
