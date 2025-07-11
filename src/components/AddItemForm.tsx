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
      await dispatch(
        createAsyncRestaurant(restaurantForm.getValues())
      ).unwrap();
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Food Management System
          </h1>
          <p className="text-gray-600">
            Add restaurants, menu items, and featured items
          </p>
        </div>

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
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-white shadow-sm border">
            <TabsTrigger
              value="restaurant"
              className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
            >
              <MapPin className="w-4 h-4" />
              Restaurant
            </TabsTrigger>
            <TabsTrigger
              value="menu-item"
              className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
            >
              <ChefHat className="w-4 h-4" />
              Menu Item
            </TabsTrigger>
            <TabsTrigger
              value="featured-item"
              className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
            >
              <Star className="w-4 h-4" />
              Featured Item
            </TabsTrigger>
            <TabsTrigger
              value="popular-item"
              className="flex items-center gap-2 data-[state=active]:bg-orange-50 data-[state=active]:text-orange-700"
            >
              <Star className="w-4 h-4" />
              Popular Item
            </TabsTrigger>
          </TabsList>

          {/* Restaurant Form */}
          <TabsContent value="restaurant">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Add a New Restaurant
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form
                  onSubmit={restaurantForm.handleSubmit(onRestaurantSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="restaurant-name"
                        className="text-sm font-medium text-gray-700"
                      >
                        Restaurant Name
                      </Label>
                      <Input
                        id="restaurant-name"
                        {...restaurantForm.register("name")}
                        className="h-11"
                        placeholder="Enter restaurant name"
                      />
                      {restaurantForm.formState.errors.name && (
                        <p className="text-sm text-red-500">
                          {restaurantForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="restaurant-category"
                        className="text-sm font-medium text-gray-700"
                      >
                        Category
                      </Label>
                      <Input
                        id="restaurant-category"
                        {...restaurantForm.register("category")}
                        className="h-11"
                        placeholder="e.g., Italian, Chinese, Indian"
                      />
                      {restaurantForm.formState.errors.category && (
                        <p className="text-sm text-red-500">
                          {restaurantForm.formState.errors.category.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="restaurant-logo"
                      className="text-sm font-medium text-gray-700"
                    >
                      Restaurant Logo
                    </Label>
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                      <Input
                        id="restaurant-logo"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        {...restaurantForm.register("logo")}
                        className="h-11"
                      />
                    </div>
                    {restaurantForm.formState.errors.logo && (
                      <p className="text-sm text-red-500">
                        {restaurantForm.formState.errors.logo.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="restaurant-rating"
                        className="text-sm font-medium text-gray-700"
                      >
                        Rating (0-5)
                      </Label>
                      <div className="relative">
                        <Star className="w-5 h-5 text-yellow-400 absolute left-3 top-3" />
                        <Input
                          id="restaurant-rating"
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          {...restaurantForm.register("rating", {
                            valueAsNumber: true,
                          })}
                          className="h-11 pl-10"
                          placeholder="4.5"
                        />
                      </div>
                      {restaurantForm.formState.errors.rating && (
                        <p className="text-sm text-red-500">
                          {restaurantForm.formState.errors.rating.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="restaurant-delivery-time"
                        className="text-sm font-medium text-gray-700"
                      >
                        Delivery Time
                      </Label>
                      <div className="relative">
                        <Clock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                        <Input
                          id="restaurant-delivery-time"
                          {...restaurantForm.register("deliveryTime")}
                          className="h-11 pl-10"
                          placeholder="20-30 mins"
                        />
                      </div>
                      {restaurantForm.formState.errors.deliveryTime && (
                        <p className="text-sm text-red-500">
                          {restaurantForm.formState.errors.deliveryTime.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="restaurant-distance"
                        className="text-sm font-medium text-gray-700"
                      >
                        Distance
                      </Label>
                      <div className="relative">
                        <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                        <Input
                          id="restaurant-distance"
                          {...restaurantForm.register("distance")}
                          className="h-11 pl-10"
                          placeholder="2.5 km"
                        />
                      </div>
                      {restaurantForm.formState.errors.distance && (
                        <p className="text-sm text-red-500">
                          {restaurantForm.formState.errors.distance.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={restaurantLoading}
                    className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors"
                  >
                    {restaurantLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <MapPin className="mr-2 h-5 w-5" />
                    )}
                    Add Restaurant
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Item Form */}
          <TabsContent value="menu-item">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <ChefHat className="w-5 h-5" />
                  Add a New Menu Item
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form
                  onSubmit={menuItemForm.handleSubmit(onMenuItemSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="menu-name"
                        className="text-sm font-medium text-gray-700"
                      >
                        Item Name
                      </Label>
                      <Input
                        id="menu-name"
                        {...menuItemForm.register("name")}
                        className="h-11"
                        placeholder="Enter menu item name"
                      />
                      {menuItemForm.formState.errors.name && (
                        <p className="text-sm text-red-500">
                          {menuItemForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="menu-category"
                        className="text-sm font-medium text-gray-700"
                      >
                        Category
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          menuItemForm.setValue(
                            "category",
                            value as "veg" | "non-veg"
                          )
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="veg">🥬 Vegetarian</SelectItem>
                          <SelectItem value="non-veg">
                            🍖 Non-Vegetarian
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {menuItemForm.formState.errors.category && (
                        <p className="text-sm text-red-500">
                          {menuItemForm.formState.errors.category.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="menu-description"
                      className="text-sm font-medium text-gray-700"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="menu-description"
                      {...menuItemForm.register("description")}
                      className="min-h-[100px]"
                      placeholder="Describe the menu item..."
                    />
                    {menuItemForm.formState.errors.description && (
                      <p className="text-sm text-red-500">
                        {menuItemForm.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="menu-price"
                        className="text-sm font-medium text-gray-700"
                      >
                        Current Price
                      </Label>
                      <Input
                        id="menu-price"
                        {...menuItemForm.register("price")}
                        className="h-11"
                        placeholder="8500"
                      />
                      {menuItemForm.formState.errors.price && (
                        <p className="text-sm text-red-500">
                          {menuItemForm.formState.errors.price.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="menu-original-price"
                        className="text-sm font-medium text-gray-700"
                      >
                        Original Price
                      </Label>
                      <Input
                        id="menu-original-price"
                        {...menuItemForm.register("originalPrice")}
                        className="h-11"
                        placeholder="10500"
                      />
                      {menuItemForm.formState.errors.originalPrice && (
                        <p className="text-sm text-red-500">
                          {menuItemForm.formState.errors.originalPrice.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="menu-image"
                      className="text-sm font-medium text-gray-700"
                    >
                      Item Image
                    </Label>
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                      <Input
                        id="menu-image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        {...menuItemForm.register("image")}
                        className="h-11"
                      />
                    </div>
                    {menuItemForm.formState.errors.image && (
                      <p className="text-sm text-red-500">
                        {menuItemForm.formState.errors.image.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="menu-rating"
                        className="text-sm font-medium text-gray-700"
                      >
                        Rating (0-5)
                      </Label>
                      <div className="relative">
                        <Star className="w-5 h-5 text-yellow-400 absolute left-3 top-3" />
                        <Input
                          id="menu-rating"
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          {...menuItemForm.register("rating", {
                            valueAsNumber: true,
                          })}
                          className="h-11 pl-10"
                          placeholder="4.5"
                        />
                      </div>
                      {menuItemForm.formState.errors.rating && (
                        <p className="text-sm text-red-500">
                          {menuItemForm.formState.errors.rating.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="menu-cook-time"
                        className="text-sm font-medium text-gray-700"
                      >
                        Cook Time
                      </Label>
                      <div className="relative">
                        <Clock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                        <Input
                          id="menu-cook-time"
                          {...menuItemForm.register("cookTime")}
                          className="h-11 pl-10"
                          placeholder="20-25 mins"
                        />
                      </div>
                      {menuItemForm.formState.errors.cookTime && (
                        <p className="text-sm text-red-500">
                          {menuItemForm.formState.errors.cookTime.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="menu-restaurant"
                        className="text-sm font-medium text-gray-700"
                      >
                        Restaurant
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          menuItemForm.setValue("restaurantId", value)
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select restaurant" />
                        </SelectTrigger>
                        <SelectContent>
                          {restaurants.map((restaurant) => (
                            <SelectItem
                              key={restaurant.$id}
                              value={restaurant.$id}
                            >
                              {restaurant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {menuItemForm.formState.errors.restaurantId && (
                        <p className="text-sm text-red-500">
                          {menuItemForm.formState.errors.restaurantId.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={menuItemLoading || !restaurants.length}
                    className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors"
                  >
                    {menuItemLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <ChefHat className="mr-2 h-5 w-5" />
                    )}
                    Add Menu Item
                  </Button>

                  {!restaurants.length && (
                    <p className="text-sm text-amber-600 text-center bg-amber-50 p-3 rounded-md">
                      Please add a restaurant first before creating menu items
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Featured Item Form */}
          <TabsContent value="featured-item">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Add a New Featured Item
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form
                  onSubmit={featuredItemForm.handleSubmit(onFeaturedSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="featured-name"
                        className="text-sm font-medium text-gray-700"
                      >
                        Featured Item Name
                      </Label>
                      <Input
                        id="featured-name"
                        {...featuredItemForm.register("name")}
                        className="h-11"
                        placeholder="Enter featured item name"
                      />
                      {featuredItemForm.formState.errors.name && (
                        <p className="text-sm text-red-500">
                          {featuredItemForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="featured-category"
                        className="text-sm font-medium text-gray-700"
                      >
                        Category
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          featuredItemForm.setValue(
                            "category",
                            value as "veg" | "non-veg"
                          )
                        }
                        value={featuredItemForm.watch("category")}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="veg">🥬 Vegetarian</SelectItem>
                          <SelectItem value="non-veg">
                            🍖 Non-Vegetarian
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {featuredItemForm.formState.errors.category && (
                        <p className="text-sm text-red-500">
                          {featuredItemForm.formState.errors.category.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="featured-description"
                      className="text-sm font-medium text-gray-700"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="featured-description"
                      {...featuredItemForm.register("description")}
                      className="min-h-[100px]"
                      placeholder="Describe why this item is featured..."
                    />
                    {featuredItemForm.formState.errors.description && (
                      <p className="text-sm text-red-500">
                        {featuredItemForm.formState.errors.description.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="featured-price"
                        className="text-sm font-medium text-gray-700"
                      >
                        Price
                      </Label>
                      <Input
                        id="featured-price"
                        {...featuredItemForm.register("price")}
                        className="h-11"
                        placeholder="8500"
                      />
                      {featuredItemForm.formState.errors.price && (
                        <p className="text-sm text-red-500">
                          {featuredItemForm.formState.errors.price.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="featured-rating"
                        className="text-sm font-medium text-gray-700"
                      >
                        Rating (0-5)
                      </Label>
                      <div className="relative">
                        <Star className="w-5 h-5 text-yellow-400 absolute left-3 top-3" />
                        <Input
                          id="featured-rating"
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          {...featuredItemForm.register("rating", {
                            valueAsNumber: true,
                          })}
                          className="h-11 pl-10"
                          placeholder="4.5"
                        />
                      </div>
                      {featuredItemForm.formState.errors.rating && (
                        <p className="text-sm text-red-500">
                          {featuredItemForm.formState.errors.rating.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="featured-image"
                      className="text-sm font-medium text-gray-700"
                    >
                      Featured Image
                    </Label>
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                      <Input
                        id="featured-image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        {...featuredItemForm.register("image")}
                        className="h-11"
                      />
                    </div>
                    {featuredItemForm.formState.errors.image && (
                      <p className="text-sm text-red-500">
                        {featuredItemForm.formState.errors.image.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="featured-restaurant"
                      className="text-sm font-medium text-gray-700"
                    >
                      Restaurant
                    </Label>
                    <Select
                      onValueChange={(value) =>
                        featuredItemForm.setValue("restaurantId", value)
                      }
                    >
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select restaurant" />
                      </SelectTrigger>
                      <SelectContent>
                        {restaurants.map((restaurant) => (
                          <SelectItem
                            key={restaurant.$id}
                            value={restaurant.$id}
                          >
                            {restaurant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {featuredItemForm.formState.errors.restaurantId && (
                      <p className="text-sm text-red-500">
                        {featuredItemForm.formState.errors.restaurantId.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={featuredItemLoading || !restaurants.length}
                    className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors"
                  >
                    {featuredItemLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Star className="mr-2 h-5 w-5" />
                    )}
                    Add Featured Item
                  </Button>

                  {!restaurants.length && (
                    <p className="text-sm text-amber-600 text-center bg-amber-50 p-3 rounded-md">
                      Please add a restaurant first before creating featured
                      items
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Popular Item Form */}
          <TabsContent value="popular-item">
            <Card className="shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5" />
                  Add a New Popular Item
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form
                  onSubmit={popularItemForm.handleSubmit(onPopularSubmit)}
                  className="space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="popular-name"
                        className="text-sm font-medium text-gray-700"
                      >
                        Popular Item Name
                      </Label>
                      <Input
                        id="popular-name"
                        {...popularItemForm.register("name")}
                        className="h-11"
                        placeholder="Enter popular item name"
                      />
                      {popularItemForm.formState.errors.name && (
                        <p className="text-sm text-red-500">
                          {popularItemForm.formState.errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="popular-category"
                        className="text-sm font-medium text-gray-700"
                      >
                        Category
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          popularItemForm.setValue(
                            "category",
                            value as "veg" | "non-veg"
                          )
                        }
                        value={popularItemForm.watch("category")}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="veg">🥬 Vegetarian</SelectItem>
                          <SelectItem value="non-veg">
                            🍖 Non-Vegetarian
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      {popularItemForm.formState.errors.category && (
                        <p className="text-sm text-red-500">
                          {popularItemForm.formState.errors.category.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="popular-description"
                      className="text-sm font-medium text-gray-700"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="popular-description"
                      {...popularItemForm.register("description")}
                      className="min-h-[100px]"
                      placeholder="Describe the popular item..."
                    />
                    {popularItemForm.formState.errors.description && (
                      <p className="text-sm text-red-500">
                        {popularItemForm.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="popular-price"
                        className="text-sm font-medium text-gray-700"
                      >
                        Price
                      </Label>
                      <Input
                        id="popular-price"
                        {...popularItemForm.register("price")}
                        className="h-11"
                        placeholder="8500"
                      />
                      {popularItemForm.formState.errors.price && (
                        <p className="text-sm text-red-500">
                          {popularItemForm.formState.errors.price.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="popular-original-price"
                        className="text-sm font-medium text-gray-700"
                      >
                        Original Price
                      </Label>
                      <Input
                        id="popular-original-price"
                        {...popularItemForm.register("originalPrice")}
                        className="h-11"
                        placeholder="10500"
                      />
                      {popularItemForm.formState.errors.originalPrice && (
                        <p className="text-sm text-red-500">
                          {
                            popularItemForm.formState.errors.originalPrice
                              .message
                          }
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label
                      htmlFor="popular-image"
                      className="text-sm font-medium text-gray-700"
                    >
                      Item Image
                    </Label>
                    <div className="flex items-center space-x-2">
                      <ImageIcon className="w-5 h-5 text-gray-400" />
                      <Input
                        id="popular-image"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        {...popularItemForm.register("image")}
                        className="h-11"
                      />
                    </div>
                    {popularItemForm.formState.errors.image && (
                      <p className="text-sm text-red-500">
                        {popularItemForm.formState.errors.image.message}
                      </p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="popular-rating"
                        className="text-sm font-medium text-gray-700"
                      >
                        Rating (0-5)
                      </Label>
                      <div className="relative">
                        <Star className="w-5 h-5 text-yellow-400 absolute left-3 top-3" />
                        <Input
                          id="popular-rating"
                          type="number"
                          step="0.1"
                          min="0"
                          max="5"
                          {...popularItemForm.register("rating", {
                            valueAsNumber: true,
                          })}
                          className="h-11 pl-10"
                          placeholder="4.5"
                        />
                      </div>
                      {popularItemForm.formState.errors.rating && (
                        <p className="text-sm text-red-500">
                          {popularItemForm.formState.errors.rating.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="popular-review-count"
                        className="text-sm font-medium text-gray-700"
                      >
                        Review Count
                      </Label>
                      <Input
                        id="popular-review-count"
                        type="number"
                        min="0"
                        {...popularItemForm.register("reviewCount", {
                          valueAsNumber: true,
                        })}
                        className="h-11"
                        placeholder="100"
                      />
                      {popularItemForm.formState.errors.reviewCount && (
                        <p className="text-sm text-red-500">
                          {popularItemForm.formState.errors.reviewCount.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="popular-cooking-time"
                        className="text-sm font-medium text-gray-700"
                      >
                        Cooking Time
                      </Label>
                      <div className="relative">
                        <Clock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                        <Input
                          id="popular-cooking-time"
                          {...popularItemForm.register("cookingTime")}
                          className="h-11 pl-10"
                          placeholder="20-25 mins"
                        />
                      </div>
                      {popularItemForm.formState.errors.cookingTime && (
                        <p className="text-sm text-red-500">
                          {popularItemForm.formState.errors.cookingTime.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="popular-discount"
                        className="text-sm font-medium text-gray-700"
                      >
                        Discount
                      </Label>
                      <Input
                        id="popular-discount"
                        {...popularItemForm.register("discount")}
                        className="h-11"
                        placeholder="10%"
                      />
                      {popularItemForm.formState.errors.discount && (
                        <p className="text-sm text-red-500">
                          {popularItemForm.formState.errors.discount.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="popular-restaurant"
                        className="text-sm font-medium text-gray-700"
                      >
                        Restaurant
                      </Label>
                      <Select
                        onValueChange={(value) =>
                          popularItemForm.setValue("restaurantId", value)
                        }
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Select restaurant" />
                        </SelectTrigger>
                        <SelectContent>
                          {restaurants.map((restaurant) => (
                            <SelectItem
                              key={restaurant.$id}
                              value={restaurant.$id}
                            >
                              {restaurant.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {popularItemForm.formState.errors.restaurantId && (
                        <p className="text-sm text-red-500">
                          {
                            popularItemForm.formState.errors.restaurantId
                              .message
                          }
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    disabled={popularItemLoading || !restaurants.length}
                    className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors"
                  >
                    {popularItemLoading ? (
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                      <Star className="mr-2 h-5 w-5" />
                    )}
                    Add Popular Item
                  </Button>
                  {!restaurants.length && (
                    <p className="text-sm text-amber-600 text-center bg-amber-50 p-3 rounded-md">
                      Please add a restaurant first before creating popular
                      items
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AddFoodItemForm;
