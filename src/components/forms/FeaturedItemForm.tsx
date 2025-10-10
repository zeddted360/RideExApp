"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlusCircle, Star } from "lucide-react";
import FileInput from "@/components/FileInput";
import { FeaturedItemFormData } from "@/utils/schema";
import { IRestaurant, IRestaurantFetched } from "../../../types/types";

interface FeaturedItemFormProps {
  form: UseFormReturn<FeaturedItemFormData>;
  restaurants: IRestaurantFetched[];
  onSubmit: (data: FeaturedItemFormData) => void;
  loading: boolean;
}

const FeaturedItemForm = ({ form, restaurants, onSubmit, loading }: FeaturedItemFormProps) => (
  <Card className="w-full bg-white/80 dark:bg-gray-900/80 shadow-2xl rounded-2xl border-0 py-4">
    <CardHeader className="flex flex-row items-center gap-3 pb-2">
      <span className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
        <Star className="w-6 h-6 text-orange-500" />
      </span>
      <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Add Featured Item
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" aria-busy={loading}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...form.register("name")}
              placeholder="e.g. Suya Platter"
              className="h-12 focus:ring-2 focus:ring-orange-500"
            />
            {form.formState.errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              {...form.register("category")}
              className="h-12 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 focus:ring-2 focus:ring-orange-500"
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
            </select>
            {form.formState.errors.category && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.category.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="price">Price (₦)</Label>
            <Input
              id="price"
              type="number"
              {...form.register("price")}
              placeholder="e.g. 4000"
              className="h-12 focus:ring-2 focus:ring-orange-500"
            />
            {form.formState.errors.price && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.price.message}
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
              {...form.register("rating", { valueAsNumber: true })}
              placeholder="4.7"
              className="h-12 focus:ring-2 focus:ring-orange-500"
            />
            {form.formState.errors.rating && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.rating.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="restaurantId">Restaurant</Label>
            <select
              id="restaurantId"
              {...form.register("restaurantId")}
              className="h-12 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 focus:ring-2 focus:ring-orange-500"
            >
              <option value="">Select Restaurant</option>
              {restaurants.map((r) => (
                <option key={r.$id} value={r.$id}>
                  {r.name}
                </option>
              ))}
            </select>
            {form.formState.errors.restaurantId && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.restaurantId.message}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Describe the item..."
              className="min-h-[80px] focus:ring-2 focus:ring-orange-500"
            />
            {form.formState.errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <FileInput field={form.register("image")} label="Image" />
            {form.formState.errors.image && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.image.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 pt-2">
          <Button
            type="reset"
            variant="outline"
            onClick={() => form.reset()}
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
    </CardContent>
  </Card>
);

export default FeaturedItemForm;