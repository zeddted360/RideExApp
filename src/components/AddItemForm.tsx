"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Image as ImageIcon,
  PlusCircle,
  Star,
  Utensils,
  Flame,
  Building2,
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
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { restaurants } = useSelector((state: RootState) => state.restaurant);

  // Restaurant Form
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

  // Load restaurants for select fields
  useEffect(() => {
    dispatch(listAsyncRestaurants());
  }, [dispatch]);

  // Handlers
  const handleRestaurantSubmit = async (data: RestaurantFormData) => {
    setLoading(true);
    try {
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
      toast.success("Restaurant added successfully!");
    } catch (error) {
      toast.error("Failed to add restaurant");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuItemSubmit = async (data: MenuItemFormData) => {
    if (!restaurants.length) {
      toast.error("Please add a restaurant first!");
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
    if (!restaurants.length) {
      toast.error("Please add a restaurant first!");
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
    if (!restaurants.length) {
      toast.error("Please add a restaurant first!");
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

  // Modern Card Wrapper
  const CardWrap = ({
    icon,
    title,
    children,
  }: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
  }) => (
    <Card className="w-full max-w-xl mx-auto bg-white/80 dark:bg-gray-900/80 shadow-2xl rounded-2xl border-0 py-4">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <span className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
          {icon}
        </span>
        <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );

  // File input with drag-and-drop (for images) and preview
  const FileInput = ({ field, label }: { field: any; label: string }) => {
    const [preview, setPreview] = React.useState<string | null>(null);
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Label>
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all">
          <ImageIcon className="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Drag & drop or click to upload
          </span>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            {...field}
            onChange={(e) => {
              field.onChange(e);
              if (e.target.files && e.target.files[0]) {
                const reader = new FileReader();
                reader.onload = (ev) => setPreview(ev.target?.result as string);
                reader.readAsDataURL(e.target.files[0]);
              } else {
                setPreview(null);
              }
            }}
          />
        </label>
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="mt-2 rounded-lg w-24 h-24 object-cover border border-gray-200 dark:border-gray-700 mx-auto"
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 py-8 px-2 flex justify-center items-start">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 mb-6 text-center tracking-tight">
            Add New Item
          </h1>
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(
              value as
                | "restaurant"
                | "menu-item"
                | "featured-item"
                | "popular-item"
            )
          }
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 mb-8 bg-white/80 dark:bg-gray-900/80 shadow border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden w-full">
            <TabsTrigger
              value="restaurant"
              className="flex items-center gap-2 text-base font-semibold w-full data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-colors"
            >
              <Building2 className="w-5 h-5" />
              Restaurant
            </TabsTrigger>
            <TabsTrigger
              value="menu-item"
              className="flex items-center gap-2 text-base font-semibold w-full data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-colors"
            >
              <Utensils className="w-5 h-5" />
              Menu Item
            </TabsTrigger>
            <TabsTrigger
              value="featured-item"
              className="flex items-center gap-2 text-base font-semibold w-full data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-colors"
            >
              <Star className="w-5 h-5" />
              Featured
            </TabsTrigger>
            <TabsTrigger
              value="popular-item"
              className="flex items-center gap-2 text-base font-semibold w-full data-[state=active]:bg-orange-500 data-[state=active]:text-white transition-colors"
            >
              <Flame className="w-5 h-5" />
              Popular
            </TabsTrigger>
          </TabsList>

          {/* Restaurant Form */}
          <TabsContent value="restaurant">
            <CardWrap
              icon={<Building2 className="w-6 h-6 text-orange-500" />}
              title="Add Restaurant"
            >
              <form
                onSubmit={restaurantForm.handleSubmit(handleRestaurantSubmit)}
                className="space-y-5"
                aria-busy={loading}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
                  <div>
                    <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                      {...restaurantForm.register("name")}
                      placeholder="e.g. Mama's Kitchen"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {restaurantForm.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {restaurantForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      {...restaurantForm.register("category")}
                      placeholder="e.g. African"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {restaurantForm.formState.errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {restaurantForm.formState.errors.category.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      {...restaurantForm.register("rating", {
                        valueAsNumber: true,
                      })}
                      placeholder="4.5"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {restaurantForm.formState.errors.rating && (
                      <p className="text-red-500 text-sm mt-1">
                        {restaurantForm.formState.errors.rating.message}
                      </p>
                    )}
              </div>
                  <div>
                    <Label htmlFor="deliveryTime">Delivery Time</Label>
                    <Input
                      id="deliveryTime"
                      {...restaurantForm.register("deliveryTime")}
                      placeholder="30-40 min"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {restaurantForm.formState.errors.deliveryTime && (
                      <p className="text-red-500 text-sm mt-1">
                        {restaurantForm.formState.errors.deliveryTime.message}
                      </p>
                    )}
              </div>
                  <div>
                    <Label htmlFor="distance">Distance (km)</Label>
                    <Input
                      id="distance"
                      {...restaurantForm.register("distance")}
                      placeholder="2.5"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {restaurantForm.formState.errors.distance && (
                      <p className="text-red-500 text-sm mt-1">
                        {restaurantForm.formState.errors.distance.message}
                      </p>
                    )}
            </div>
                  <div>
                    <FileInput
                      field={restaurantForm.register("logo")}
                      label="Logo"
                    />
              </div>
            </div>
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-2">
                  <Button
                    type="reset"
                    variant="outline"
                    onClick={() => restaurantForm.reset()}
                    disabled={loading}
                    aria-disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex items-center gap-2 px-8 w-full sm:w-auto"
                    disabled={loading}
                    aria-disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <PlusCircle className="w-5 h-5" />
                    )}
                    Add Restaurant
                  </Button>
                </div>
              </form>
            </CardWrap>
          </TabsContent>

          {/* Menu Item Form */}
          <TabsContent value="menu-item">
            <CardWrap
              icon={<Utensils className="w-6 h-6 text-orange-500" />}
              title="Add Menu Item"
            >
              <form
                onSubmit={menuItemForm.handleSubmit(handleMenuItemSubmit)}
                className="space-y-5"
                aria-busy={loading}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      {...menuItemForm.register("name")}
                      placeholder="e.g. Jollof Rice"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {menuItemForm.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {menuItemForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      {...menuItemForm.register("category")}
                      className="h-12 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="veg">Veg</option>
                      <option value="non-veg">Non-Veg</option>
                    </select>
                    {menuItemForm.formState.errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {menuItemForm.formState.errors.category.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="price">Price (₦)</Label>
                    <Input
                      id="price"
                      type="number"
                      {...menuItemForm.register("price")}
                      placeholder="e.g. 2500"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {menuItemForm.formState.errors.price && (
                      <p className="text-red-500 text-sm mt-1">
                        {menuItemForm.formState.errors.price.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="originalPrice">Original Price (₦)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      {...menuItemForm.register("originalPrice")}
                      placeholder="e.g. 3000"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {menuItemForm.formState.errors.originalPrice && (
                      <p className="text-red-500 text-sm mt-1">
                        {menuItemForm.formState.errors.originalPrice.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      {...menuItemForm.register("rating", {
                        valueAsNumber: true,
                      })}
                      placeholder="4.5"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {menuItemForm.formState.errors.rating && (
                      <p className="text-red-500 text-sm mt-1">
                        {menuItemForm.formState.errors.rating.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="cookTime">Cook Time (min)</Label>
                  <Input
                    id="cookTime"
                    type="number"
                      {...menuItemForm.register("cookTime")}
                      placeholder="e.g. 20"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {menuItemForm.formState.errors.cookTime && (
                      <p className="text-red-500 text-sm mt-1">
                        {menuItemForm.formState.errors.cookTime.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="restaurantId">Restaurant</Label>
                    <select
                      id="restaurantId"
                      {...menuItemForm.register("restaurantId")}
                      className="h-12 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Restaurant</option>
                      {restaurants.map((r) => (
                        <option key={r.$id} value={r.$id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    {menuItemForm.formState.errors.restaurantId && (
                      <p className="text-red-500 text-sm mt-1">
                        {menuItemForm.formState.errors.restaurantId.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...menuItemForm.register("description")}
                      placeholder="Describe the item..."
                      className="min-h-[80px] focus:ring-2 focus:ring-orange-500"
                    />
                    {menuItemForm.formState.errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {menuItemForm.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <FileInput
                      field={menuItemForm.register("image")}
                      label="Image"
                    />
                    {menuItemForm.formState.errors.image && (
                      <p className="text-red-500 text-sm mt-1">
                        {menuItemForm.formState.errors.image.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-2">
                  <Button
                    type="reset"
                    variant="outline"
                    onClick={() => menuItemForm.reset()}
                    disabled={loading}
                    aria-disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex items-center gap-2 px-8 w-full sm:w-auto"
                    disabled={loading}
                    aria-disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <PlusCircle className="w-5 h-5" />
                    )}
                    Add Menu Item
                  </Button>
                </div>
              </form>
            </CardWrap>
          </TabsContent>

          {/* Featured Item Form */}
          <TabsContent value="featured-item">
            <CardWrap
              icon={<Star className="w-6 h-6 text-orange-500" />}
              title="Add Featured Item"
            >
              <form
                onSubmit={featuredItemForm.handleSubmit(
                  handleFeaturedItemSubmit
                )}
                className="space-y-5"
                aria-busy={loading}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      {...featuredItemForm.register("name")}
                      placeholder="e.g. Suya Platter"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {featuredItemForm.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {featuredItemForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      {...featuredItemForm.register("category")}
                      className="h-12 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="veg">Veg</option>
                      <option value="non-veg">Non-Veg</option>
                    </select>
                    {featuredItemForm.formState.errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {featuredItemForm.formState.errors.category.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="price">Price (₦)</Label>
                    <Input
                      id="price"
                      type="number"
                      {...featuredItemForm.register("price")}
                      placeholder="e.g. 4000"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {featuredItemForm.formState.errors.price && (
                      <p className="text-red-500 text-sm mt-1">
                        {featuredItemForm.formState.errors.price.message}
                      </p>
                    )}
              </div>
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      {...featuredItemForm.register("rating", {
                        valueAsNumber: true,
                      })}
                      placeholder="4.7"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {featuredItemForm.formState.errors.rating && (
                      <p className="text-red-500 text-sm mt-1">
                        {featuredItemForm.formState.errors.rating.message}
                      </p>
                    )}
            </div>
                  <div>
                    <Label htmlFor="restaurantId">Restaurant</Label>
                    <select
                      id="restaurantId"
                      {...featuredItemForm.register("restaurantId")}
                      className="h-12 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Restaurant</option>
                      {restaurants.map((r) => (
                        <option key={r.$id} value={r.$id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    {featuredItemForm.formState.errors.restaurantId && (
                      <p className="text-red-500 text-sm mt-1">
                        {featuredItemForm.formState.errors.restaurantId.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...featuredItemForm.register("description")}
                      placeholder="Describe the item..."
                      className="min-h-[80px] focus:ring-2 focus:ring-orange-500"
                    />
                    {featuredItemForm.formState.errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {featuredItemForm.formState.errors.description.message}
                      </p>
                    )}
              </div>
                  <div>
                    <FileInput
                      field={featuredItemForm.register("image")}
                      label="Image"
                    />
                    {featuredItemForm.formState.errors.image && (
                      <p className="text-red-500 text-sm mt-1">
                        {featuredItemForm.formState.errors.image.message}
                      </p>
                    )}
              </div>
            </div>
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-2">
                  <Button
                    type="reset"
                    variant="outline"
                    onClick={() => featuredItemForm.reset()}
                    disabled={loading}
                    aria-disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex items-center gap-2 px-8 w-full sm:w-auto"
                    disabled={loading}
                    aria-disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <PlusCircle className="w-5 h-5" />
                    )}
                    Add Featured Item
                  </Button>
                </div>
              </form>
            </CardWrap>
          </TabsContent>

          {/* Popular Item Form */}
          <TabsContent value="popular-item">
            <CardWrap
              icon={<Flame className="w-6 h-6 text-orange-500" />}
              title="Add Popular Item"
            >
              <form
                onSubmit={popularItemForm.handleSubmit(handlePopularItemSubmit)}
                className="space-y-5"
                aria-busy={loading}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      {...popularItemForm.register("name")}
                      placeholder="e.g. Shawarma"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {popularItemForm.formState.errors.name && (
                      <p className="text-red-500 text-sm mt-1">
                        {popularItemForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <select
                      id="category"
                      {...popularItemForm.register("category")}
                      className="h-12 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="veg">Veg</option>
                      <option value="non-veg">Non-Veg</option>
                    </select>
                    {popularItemForm.formState.errors.category && (
                      <p className="text-red-500 text-sm mt-1">
                        {popularItemForm.formState.errors.category.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="price">Price (₦)</Label>
                <Input
                  id="price"
                  type="number"
                      {...popularItemForm.register("price")}
                      placeholder="e.g. 2000"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                />
                    {popularItemForm.formState.errors.price && (
                      <p className="text-red-500 text-sm mt-1">
                        {popularItemForm.formState.errors.price.message}
                      </p>
                    )}
              </div>
                  <div>
                    <Label htmlFor="originalPrice">Original Price (₦)</Label>
                <Input
                  id="originalPrice"
                  type="number"
                      {...popularItemForm.register("originalPrice")}
                      placeholder="e.g. 2500"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {popularItemForm.formState.errors.originalPrice && (
                      <p className="text-red-500 text-sm mt-1">
                        {popularItemForm.formState.errors.originalPrice.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="rating">Rating</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      {...popularItemForm.register("rating", {
                        valueAsNumber: true,
                      })}
                      placeholder="4.8"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {popularItemForm.formState.errors.rating && (
                      <p className="text-red-500 text-sm mt-1">
                        {popularItemForm.formState.errors.rating.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="reviewCount">Review Count</Label>
                    <Input
                      id="reviewCount"
                      type="number"
                      {...popularItemForm.register("reviewCount", {
                        valueAsNumber: true,
                      })}
                      placeholder="e.g. 120"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {popularItemForm.formState.errors.reviewCount && (
                      <p className="text-red-500 text-sm mt-1">
                        {popularItemForm.formState.errors.reviewCount.message}
                      </p>
                    )}
              </div>
                  <div>
                    <Label htmlFor="cookingTime">Cooking Time (min)</Label>
                    <Input
                      id="cookingTime"
                      type="number"
                      {...popularItemForm.register("cookingTime")}
                      placeholder="e.g. 15"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                    />
                    {popularItemForm.formState.errors.cookingTime && (
                      <p className="text-red-500 text-sm mt-1">
                        {popularItemForm.formState.errors.cookingTime.message}
                      </p>
                    )}
            </div>
                  <div>
                    <Label htmlFor="discount">Discount (%)</Label>
                <Input
                  id="discount"
                  type="number"
                      {...popularItemForm.register("discount")}
                      placeholder="e.g. 10"
                      className="h-12 focus:ring-2 focus:ring-orange-500"
                />
                    {popularItemForm.formState.errors.discount && (
                      <p className="text-red-500 text-sm mt-1">
                        {popularItemForm.formState.errors.discount.message}
                      </p>
                    )}
              </div>
                  <div>
                    <Label htmlFor="restaurantId">Restaurant</Label>
                    <select
                      id="restaurantId"
                      {...popularItemForm.register("restaurantId")}
                      className="h-12 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">Select Restaurant</option>
                      {restaurants.map((r) => (
                        <option key={r.$id} value={r.$id}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                    {popularItemForm.formState.errors.restaurantId && (
                      <p className="text-red-500 text-sm mt-1">
                        {popularItemForm.formState.errors.restaurantId.message}
                      </p>
                    )}
              </div>
                  <div>
                    <FileInput
                      field={popularItemForm.register("image")}
                      label="Image"
                    />
            </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...popularItemForm.register("description")}
                      placeholder="Describe the item..."
                      className="min-h-[80px] focus:ring-2 focus:ring-orange-500"
                    />
                    {popularItemForm.formState.errors.description && (
                      <p className="text-red-500 text-sm mt-1">
                        {popularItemForm.formState.errors.description.message}
                      </p>
                    )}
              </div>
            </div>
                <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-2">
                  <Button
                    type="reset"
                    variant="outline"
                    onClick={() => popularItemForm.reset()}
                    disabled={loading}
                    aria-disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex items-center gap-2 px-8 w-full sm:w-auto"
                    disabled={loading}
                    aria-disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <PlusCircle className="w-5 h-5" />
                    )}
                    Add Popular Item
                  </Button>
                </div>
              </form>
            </CardWrap>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AddFoodItemForm;
