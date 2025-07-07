// components/AddFoodItemForm.tsx
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
import { Loader2 } from "lucide-react";
import { Restaurant } from "../../types/types";
import { MenuItemFormData, menuItemSchema, RestaurantFormData, restaurantSchema } from "@/utils/schema";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import { createAsyncRestaurant, listAsyncRestaurants } from "@/state/restaurantSlice";
import toast from "react-hot-toast";
import { createAsyncMenuItem } from "@/state/menuSlice";


const AddFoodItemForm = () => {
  const [activeTab, setActiveTab] = useState<"restaurant" | "menu-item">(
    "restaurant"
  );
  const [restaurantLoading, setRestaurantLoading] = useState(false);
  const [menuItemLoading, setMenuItemLoading] = useState(false);
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
      },
    mode:"onChange"
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
    mode:"onChange"
  });
    
  // Handle Restaurant Form Submission
    const onRestaurantSubmit = async (data:RestaurantFormData) => {
      setRestaurantLoading(true);
      try {
        await dispatch(
          createAsyncRestaurant(restaurantForm.getValues())
        ).unwrap();
        restaurantForm.reset();
      } catch (error) {
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

    useEffect(() => {
    async function getRestaurant() {
       await dispatch(listAsyncRestaurants());
        
        };
        getRestaurant();
    }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "restaurant" | "menu-item")
          }
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="restaurant">Add Restaurant</TabsTrigger>
            <TabsTrigger value="menu-item">Add Menu Item</TabsTrigger>
          </TabsList>

          {/* Restaurant Form */}
          <TabsContent value="restaurant">
            <Card>
              <CardHeader>
                <CardTitle>Add a New Restaurant</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                 onSubmit={restaurantForm.handleSubmit(onRestaurantSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" {...restaurantForm.register("name")} />
                    {restaurantForm.formState.errors.name && (
                      <p className="text-sm text-red-500">
                        {restaurantForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                
                  <div className="space-y-2">
                    <Label htmlFor="logo">Logo</Label>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      {...restaurantForm.register("logo")}
                    />
                    {restaurantForm.formState.errors.logo && (
                      <p className="text-sm text-red-500">
                        {restaurantForm.formState.errors.logo.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (0-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      {...restaurantForm.register("rating", {
                        valueAsNumber: true,
                      })}
                    />
                    {restaurantForm.formState.errors.rating && (
                      <p className="text-sm text-red-500">
                        {restaurantForm.formState.errors.rating.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deliveryTime">
                      Delivery Time (e.g., 20-30 mins)
                    </Label>
                    <Input
                      id="deliveryTime"
                      {...restaurantForm.register("deliveryTime")}
                    />
                    {restaurantForm.formState.errors.deliveryTime && (
                      <p className="text-sm text-red-500">
                        {restaurantForm.formState.errors.deliveryTime.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      {...restaurantForm.register("category")}
                    />
                    {restaurantForm.formState.errors.category && (
                      <p className="text-sm text-red-500">
                        {restaurantForm.formState.errors.category.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance (e.g., 2.5 km)</Label>
                    <Input
                      id="distance"
                      {...restaurantForm.register("distance")}
                    />
                    {restaurantForm.formState.errors.distance && (
                      <p className="text-sm text-red-500">
                        {restaurantForm.formState.errors.distance.message}
                      </p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={restaurantLoading}
                    className="w-full"
                  >
                    {restaurantLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Add Restaurant
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Menu Item Form */}
          <TabsContent value="menu-item">
            <Card>
              <CardHeader>
                <CardTitle>Add a New Menu Item</CardTitle>
              </CardHeader>
              <CardContent>
                <form
                onSubmit={menuItemForm.handleSubmit(onMenuItemSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" {...menuItemForm.register("name")} />
                    {menuItemForm.formState.errors.name && (
                      <p className="text-sm text-red-500">
                        {menuItemForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      {...menuItemForm.register("description")}
                    />
                    {menuItemForm.formState.errors.description && (
                      <p className="text-sm text-red-500">
                        {menuItemForm.formState.errors.description.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (e.g., ₦8500)</Label>
                    <Input id="price" {...menuItemForm.register("price")} />
                    {menuItemForm.formState.errors.price && (
                      <p className="text-sm text-red-500">
                        {menuItemForm.formState.errors.price.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">
                      Original Price (e.g., ₦10500)
                    </Label>
                    <Input
                      id="originalPrice"
                      {...menuItemForm.register("originalPrice")}
                    />
                    {menuItemForm.formState.errors.originalPrice && (
                      <p className="text-sm text-red-500">
                        {menuItemForm.formState.errors.originalPrice.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="image">Image</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      {...menuItemForm.register("image")}
                    />
                    {menuItemForm.formState.errors.image && (
                      <p className="text-sm text-red-500">
                        {menuItemForm.formState.errors.image.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rating">Rating (0-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      step="0.1"
                      {...menuItemForm.register("rating", {
                        valueAsNumber: true,
                      })}
                    />
                    {menuItemForm.formState.errors.rating && (
                      <p className="text-sm text-red-500">
                        {menuItemForm.formState.errors.rating.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cookTime">
                      Cook Time (e.g., 20-25 mins)
                    </Label>
                    <Input
                      id="cookTime"
                      {...menuItemForm.register("cookTime")}
                    />
                    {menuItemForm.formState.errors.cookTime && (
                      <p className="text-sm text-red-500">
                        {menuItemForm.formState.errors.cookTime.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      onValueChange={(value) =>
                        menuItemForm.setValue(
                          "category",
                          value as "veg" | "non-veg"
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="veg">Vegetarian</SelectItem>
                        <SelectItem value="non-veg">Non-Vegetarian</SelectItem>
                      </SelectContent>
                    </Select>
                    {menuItemForm.formState.errors.category && (
                      <p className="text-sm text-red-500">
                        {menuItemForm.formState.errors.category.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="restaurantId">Restaurant</Label>
                    <Select
                      onValueChange={(value) =>
                        menuItemForm.setValue("restaurantId", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select restaurant" />
                      </SelectTrigger>
                      <SelectContent>
                        {restaurants.map((restaurant) => (
                          <SelectItem key={restaurant.id} value={restaurant.id as string}>
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
                  <Button
                    type="submit"
                    disabled={menuItemLoading}
                    className="w-full"
                  >
                    {menuItemLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    Add Menu Item
                  </Button>
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
