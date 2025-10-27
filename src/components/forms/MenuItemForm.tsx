"use client";
import React, { ChangeEvent, useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  PlusCircle,
  Utensils,
  Info,
  Upload,
  X,
  DollarSign,
  Clock,
  AlertCircle,
} from "lucide-react";
import FileInput from "@/components/FileInput";
import { MenuItemFormData } from "@/utils/schema";
import { IRestaurantFetched, IFetchedExtras } from "../../../types/types";
import toast from "react-hot-toast";
import AddExtrasModal from "../vendor/AddExtrasModal";
import Link from "next/link";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { useAuth } from "@/context/authContext";

interface MenuItemFormProps {
  form: UseFormReturn<MenuItemFormData>;
  restaurants: IRestaurantFetched[];
  onSubmit: (data: MenuItemFormData) => void;
  loading: boolean;
  onAddExtras: (selectedExtras: IFetchedExtras[]) => void;
  onSelectExtra: (extraId: string | undefined) => void;
  excludeTypes: string[];
}

const MenuItemForm = ({
  form,
  restaurants,
  onSubmit,
  loading,
  onAddExtras,
  onSelectExtra,
  excludeTypes,
}: MenuItemFormProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedExtraId, setSelectedExtraId] = useState<string | undefined>(
    undefined
  );
  const { user } = useAuth();
  const { extras } = useSelector((state: RootState) => state.extra);
  const needsTakeawayContainer = form.watch("needsTakeawayContainer");
  const extraPortion = form.watch("extraPortion");

  // Filter extras for "pack" or "plastic container"
  const filteredExtras = extras.filter(
    (extra: IFetchedExtras) =>
      extra.vendorId === user?.userId &&
      (extra.name.toLowerCase().includes("pack") ||
        extra.name.toLowerCase().includes("plastic container"))
  );

  // Regex for validation
  const mediumOrSmallRegex = /(medium|small)\s*(pack|plastic container)/i;
  const bigRegex = /big\s*(pack|plastic container)/i;

  // Find the selected extra's name
  const selectedExtra = filteredExtras.find(
    (extra) => extra.$id === selectedExtraId
  );
  const isInvalidSizeSelected =
    selectedExtra &&
    extraPortion &&
    mediumOrSmallRegex.test(selectedExtra.name);

  // Auto-select medium or small container when extraPortion is false
  const autoSelectedContainer = filteredExtras.find(
    (extra) =>
      mediumOrSmallRegex.test(extra.name) &&
      !bigRegex.test(extra.name) &&
      extra.vendorId === user?.userId
  );
  const autoSelectedContainerId = autoSelectedContainer?.$id;

  // Set or clear form error for size selection
  useEffect(() => {
    if (
      needsTakeawayContainer &&
      extraPortion &&
      selectedExtraId &&
      isInvalidSizeSelected
    ) {
      form.setError("needsTakeawayContainer", {
        type: "manual",
        message:
          "Extra portions require a large pack or container. Please select a large option.",
      });
    } else if (
      needsTakeawayContainer &&
      !extraPortion &&
      !autoSelectedContainerId
    ) {
      form.setError("needsTakeawayContainer", {
        type: "manual",
        message:
          "No small or medium containers available. Please add one in Manage Extras.",
      });
    } else {
      form.clearErrors("needsTakeawayContainer");
    }
    // Pass selectedExtraId or autoSelectedContainerId to parent
    onSelectExtra(extraPortion ? selectedExtraId : autoSelectedContainerId);
  }, [
    needsTakeawayContainer,
    extraPortion,
    selectedExtraId,
    isInvalidSizeSelected,
    autoSelectedContainerId,
    form,
    onSelectExtra,
  ]);

  // Handle image change for preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Clear image
  const clearImage = () => {
    setImagePreview(null);
    form.setValue("image", undefined as any);
  };

  // Get field error
  const getFieldError = (fieldName: keyof MenuItemFormData) => {
    return form.formState.errors[fieldName];
  };

  // Check if field is touched
  const isFieldTouched = (fieldName: keyof MenuItemFormData) => {
    return form.formState.touchedFields[fieldName];
  };

  // Show warning if extra portion is selected but no extra is chosen
  const showNoExtraWarning =
    needsTakeawayContainer && extraPortion && !selectedExtraId;

  return (
    <Card className="w-full bg-white/80 dark:bg-gray-900/80 shadow-2xl rounded-2xl border-0 py-4">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <span className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
          <Utensils className="w-6 h-6 text-orange-500" />
        </span>
        <div className="flex-1">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Add Menu Item
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Fill in the details to add a new item to your menu
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
          aria-busy={loading}
        >
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Basic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name Field */}
              <div className="md:col-span-2">
                <Label htmlFor="name" className="flex items-center gap-1">
                  Item Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="e.g., Jollof Rice"
                  className={`h-12 mt-1.5 transition-all ${
                    getFieldError("name")
                      ? "border-red-500 focus:ring-red-500"
                      : isFieldTouched("name")
                      ? "border-green-500 focus:ring-green-500"
                      : "focus:ring-orange-500"
                  }`}
                  disabled={loading}
                />
                {getFieldError("name") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("name")?.message as string}
                  </p>
                )}
              </div>

              {/* Category Field */}
              <div>
                <Label htmlFor="category" className="flex items-center gap-1">
                  Category <span className="text-red-500">*</span>
                </Label>
                <select
                  id="category"
                  {...form.register("category")}
                  className={`h-12 w-full rounded-md border mt-1.5 transition-all ${
                    getFieldError("category")
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  } bg-white dark:bg-gray-800 px-3 focus:ring-2 focus:ring-orange-500 focus:outline-none`}
                  disabled={loading}
                >
                  <option value="">Select Category</option>
                  <option value="veg">🥗 Vegetarian</option>
                  <option value="non-veg">🍖 Non-Vegetarian</option>
                </select>
                {getFieldError("category") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("category")?.message as string}
                  </p>
                )}
              </div>

              {/* Restaurant Field */}
              <div>
                <Label
                  htmlFor="restaurantId"
                  className="flex items-center gap-1"
                >
                  Restaurant <span className="text-red-500">*</span>
                </Label>
                <select
                  id="restaurantId"
                  {...form.register("restaurantId")}
                  className={`h-12 w-full rounded-md border mt-1.5 transition-all ${
                    getFieldError("restaurantId")
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-700"
                  } bg-white dark:bg-gray-800 px-3 focus:ring-2 focus:ring-orange-500 focus:outline-none`}
                  disabled={loading}
                >
                  <option value="">Select Restaurant</option>
                  {restaurants.length === 0 ? (
                    <option disabled>No restaurants available</option>
                  ) : (
                    restaurants.map((r) => (
                      <option key={r.$id} value={r.$id}>
                        {r.name}
                      </option>
                    ))
                  )}
                </select>
                {getFieldError("restaurantId") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("restaurantId")?.message as string}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div className="md:col-span-2">
                <Label
                  htmlFor="description"
                  className="flex items-center gap-1"
                >
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Describe the dish, including ingredients and highlights..."
                  className={`min-h-[100px] mt-1.5 transition-all ${
                    getFieldError("description")
                      ? "border-red-500 focus:ring-red-500"
                      : isFieldTouched("description")
                      ? "border-green-500 focus:ring-green-500"
                      : "focus:ring-orange-500"
                  }`}
                  disabled={loading}
                />
                {getFieldError("description") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("description")?.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Pricing
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price Field */}
              <div>
                <Label htmlFor="price" className="flex items-center gap-1">
                  Sale Price <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    ₦
                  </span>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...form.register("price")}
                    placeholder="2500"
                    className={`h-12 pl-8 transition-all ${
                      getFieldError("price")
                        ? "border-red-500 focus:ring-red-500"
                        : isFieldTouched("price")
                        ? "border-green-500 focus:ring-green-500"
                        : "focus:ring-orange-500"
                    }`}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter the current selling price
                </p>
                {getFieldError("price") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("price")?.message as string}
                  </p>
                )}
              </div>

              {/* Original Price Field */}
              <div>
                <Label
                  htmlFor="originalPrice"
                  className="flex items-center gap-1"
                >
                  Original Price
                  <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                </Label>
                <div className="relative mt-1.5">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    ₦
                  </span>
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    {...form.register("originalPrice")}
                    placeholder="3000"
                    className="h-12 pl-8 focus:ring-2 focus:ring-orange-500"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Enter the original price to display a discount
                </p>
                {getFieldError("originalPrice") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("originalPrice")?.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Packaging Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <Clock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Packaging & Preparation
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cook Time Field */}
              <div>
                <Label htmlFor="cookTime" className="flex items-center gap-1">
                  Preparation Time
                  <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="cookTime"
                    type="number"
                    {...form.register("cookTime")}
                    placeholder="20"
                    className="h-12 focus:ring-2 focus:ring-orange-500"
                    disabled={loading}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                    minutes
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Estimated time to prepare the item
                </p>
                {getFieldError("cookTime") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("cookTime")?.message as string}
                  </p>
                )}
              </div>

              {/* Takeaway Container Field */}
              <div>
                <Label
                  htmlFor="needsTakeawayContainer"
                  className="flex items-center gap-1"
                >
                  Requires Takeaway Packaging?
                  <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                </Label>
                <Select
                  onValueChange={(value) => {
                    form.setValue("needsTakeawayContainer", value === "yes");
                    if (value === "no") {
                      form.setValue("extraPortion", false);
                      setSelectedExtraId(undefined);
                    }
                  }}
                  defaultValue={needsTakeawayContainer ? "yes" : "no"}
                  disabled={loading}
                >
                  <SelectTrigger className="h-12 mt-1.5">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
                {getFieldError("needsTakeawayContainer") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("needsTakeawayContainer")?.message as string}
                  </p>
                )}
              </div>

              {/* Conditional Extra Portion Field */}
              {needsTakeawayContainer && (
                <div className="md:col-span-2">
                  <Label
                    htmlFor="extraPortion"
                    className="flex items-center gap-1"
                  >
                    Includes Extra Portion?
                    <span className="text-gray-400 text-xs ml-1">
                      (Optional)
                    </span>
                  </Label>
                  <Select
                    onValueChange={(value) => {
                      form.setValue("extraPortion", value === "yes");
                      if (value === "no") {
                        setSelectedExtraId(undefined);
                        toast(
                          "A medium or small container will be included for standard packaging.",
                          { icon: "ℹ️" }
                        );
                      }
                    }}
                    defaultValue={extraPortion ? "yes" : "no"}
                    disabled={loading}
                  >
                    <SelectTrigger className="h-12 mt-1.5">
                      <SelectValue placeholder="Select option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                  {extraPortion && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Select a large pack or container for extra portions.
                    </p>
                  )}
                  {!extraPortion && needsTakeawayContainer && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      A medium or small container will be automatically
                      included.
                    </p>
                  )}
                </div>
              )}

              {/* Conditional Packaging Selection */}
              {needsTakeawayContainer && (
                <div className="md:col-span-2">
                  <Label className="flex items-center gap-1">
                    Packaging Selection
                    <span className="text-gray-400 text-xs ml-1">
                      (Auto-assigned or select)
                    </span>
                  </Label>
                  {extraPortion ? (
                    // Dropdown for large containers when extraPortion is true
                    filteredExtras.length > 0 ? (
                      <Select
                        onValueChange={(value) => setSelectedExtraId(value)}
                        value={selectedExtraId}
                        disabled={loading}
                      >
                        <SelectTrigger
                          className={`h-12 mt-1.5 ${
                            getFieldError("needsTakeawayContainer")
                              ? "border-red-500 focus:ring-red-500"
                              : "border-gray-300 dark:border-gray-700 focus:ring-orange-500"
                          }`}
                        >
                          <SelectValue placeholder="Select a large container" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredExtras
                            .filter((extra: IFetchedExtras) =>
                              bigRegex.test(extra.name)
                            )
                            .map((extra: IFetchedExtras) => (
                              <SelectItem key={extra.$id} value={extra.$id}>
                                {extra.name} (₦{extra.price})
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="mt-1.5">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No large containers available.{" "}
                          <Link
                            href="/vendor/extras"
                            className="text-orange-500 hover:underline"
                          >
                            Add a large pack or container in Manage Extras
                          </Link>
                          .
                        </p>
                      </div>
                    )
                  ) : (
                    // Display auto-selected container when extraPortion is false
                    <div className="mt-1.5">
                      {autoSelectedContainer ? (
                        <Input
                          value={`${autoSelectedContainer.name} (₦${autoSelectedContainer.price})`}
                          disabled
                          className="h-12 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
                        />
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No small or medium containers available.{" "}
                          <Link
                            href="/vendor/extras"
                            className="text-orange-500 hover:underline"
                          >
                            Add a container in Manage Extras
                          </Link>
                          .
                        </p>
                      )}
                    </div>
                  )}
                  {showNoExtraWarning && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Action Required</AlertTitle>
                      <AlertDescription>
                        Please select a large pack or container for the extra
                        portion.
                      </AlertDescription>
                    </Alert>
                  )}
                  {isInvalidSizeSelected && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>
                        Extra portions require a large pack or container. Please
                        select a large option.
                      </AlertDescription>
                    </Alert>
                  )}
                  {needsTakeawayContainer &&
                    !extraPortion &&
                    !autoSelectedContainer && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                          No small or medium containers available. Please add
                          one in Manage Extras.
                        </AlertDescription>
                      </Alert>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Extras Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <PlusCircle className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Additional Extras
              </h3>
            </div>
            <div>
              <AddExtrasModal
                onAddExtras={onAddExtras}
                loading={loading}
                excludeTypes={excludeTypes}
              />
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Image
              </h3>
            </div>

            <div>
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                    disabled={loading}
                  >
                    <X className="w-4 h-4 mr-1" />
                    Remove
                  </Button>
                </div>
              ) : (
                <div>
                  <FileInput
                    field={{
                      ...form.register("image"),
                      onChange: (e: ChangeEvent<HTMLInputElement>) => {
                        form.register("image").onChange(e);
                        handleImageChange(e);
                      },
                    }}
                    label="Upload Image"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Recommended: JPG or PNG, max 5MB, square format
                  </p>
                </div>
              )}
              {getFieldError("image") && (
                <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  {getFieldError("image")?.message as string}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                form.reset();
                setImagePreview(null);
                setSelectedExtraId(undefined);
              }}
              disabled={loading}
              className="sm:w-auto"
            >
              Reset Form
            </Button>
            <Button
              type="submit"
              className="flex items-center justify-center gap-2 px-8 bg-orange-500 hover:bg-orange-600 sm:w-auto"
              disabled={
                loading ||
                isInvalidSizeSelected ||
                (!extraPortion &&
                  needsTakeawayContainer &&
                  !autoSelectedContainer)
              }
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  Add Menu Item
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default MenuItemForm;
