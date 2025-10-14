"use client";
import React, { ChangeEvent, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlusCircle, Percent, DollarSign, Calendar, Upload, X, Info, Sparkles } from "lucide-react";
import FileInput from "@/components/FileInput";
import { DiscountFormData } from "@/utils/schema";

interface DiscountFormProps {
  form: UseFormReturn<DiscountFormData>;
  targetOptions: { label: string; value: string }[];
  onSubmit: (data: DiscountFormData) => void;
  loading: boolean;
}

const DiscountForm = ({ form, targetOptions, onSubmit, loading }: DiscountFormProps) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const clearImage = () => {
    setImagePreview(null);
    form.setValue("image", undefined as any);
  };

  const getFieldError = (fieldName: keyof DiscountFormData) => {
    return form.formState.errors[fieldName];
  };

  const isFieldTouched = (fieldName: keyof DiscountFormData) => {
    return form.formState.touchedFields[fieldName];
  };

  const discountType = form.watch("discountType");

  return (
    <Card className="w-full bg-white/80 dark:bg-gray-900/80 shadow-2xl rounded-2xl border-0 py-4">
      <CardHeader className="flex flex-row items-center gap-3 pb-2">
        <span className="bg-gradient-to-br from-orange-100 to-yellow-100 dark:from-orange-900 dark:to-yellow-900 p-2 rounded-full">
          <Percent className="w-6 h-6 text-orange-500 fill-orange-500" />
        </span>
        <div className="flex-1">
          <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            Add Discount
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </CardTitle>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create compelling discounts to drive more orders and customer loyalty
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" aria-busy={loading}>
          {/* Basic Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Basic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title Field */}
              <div className="md:col-span-2">
                <Label htmlFor="title" className="flex items-center gap-1">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="e.g. 20% Off Biryani"
                  className={`h-12 mt-1.5 transition-all ${
                    getFieldError("title")
                      ? "border-red-500 focus:ring-red-500"
                      : isFieldTouched("title")
                      ? "border-green-500 focus:ring-green-500"
                      : "focus:ring-orange-500"
                  }`}
                  disabled={loading}
                />
                {getFieldError("title") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("title")?.message as string}
                  </p>
                )}
              </div>

              {/* Description Field */}
              <div className="md:col-span-2">
                <Label htmlFor="description" className="flex items-center gap-1">
                  Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  placeholder="Provide details about this discount offer..."
                  className={`min-h-[100px] mt-1.5 transition-all ${
                    getFieldError("description")
                      ? "border-red-500 focus:ring-red-500"
                      : isFieldTouched("description")
                      ? "border-green-500 focus:ring-green-500"
                      : "focus:ring-orange-500"
                  }`}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Explain the terms and what customers can expect
                </p>
                {getFieldError("description") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("description")?.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Discount Details Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <Percent className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Discount Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Discount Type */}
              <div>
                <Label htmlFor="discountType" className="flex items-center gap-1">
                  Discount Type <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => form.setValue("discountType", value as "percentage" | "fixed")}>
                  <SelectTrigger
                    className={`h-12 mt-1.5 transition-all border ${
                      getFieldError("discountType")
                        ? "border-red-500 focus:ring-red-500"
                        : isFieldTouched("discountType")
                        ? "border-green-500 focus:ring-green-500"
                        : "border-gray-300 dark:border-gray-700 focus:ring-orange-500"
                    } bg-white dark:bg-gray-800`}
                    disabled={loading}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₦)</SelectItem>
                  </SelectContent>
                </Select>
                {getFieldError("discountType") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("discountType")?.message as string}
                  </p>
                )}
              </div>

              {/* Discount Value */}
              <div>
                <Label htmlFor="discountValue" className="flex items-center gap-1">
                  Discount Value <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="discountValue"
                    type="number"
                    step="0.01"
                    {...form.register("discountValue", { valueAsNumber: true })}
                    placeholder={discountType === "percentage" ? "20" : "200"}
                    className={`h-12 pr-8 transition-all ${
                      getFieldError("discountValue")
                        ? "border-red-500 focus:ring-red-500"
                        : isFieldTouched("discountValue")
                        ? "border-green-500 focus:ring-green-500"
                        : "focus:ring-orange-500"
                    }`}
                    disabled={loading}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                    {discountType === "percentage" ? "%" : "₦"}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {discountType === "percentage" ? "Percentage off" : "Fixed amount off"}
                </p>
                {getFieldError("discountValue") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("discountValue")?.message as string}
                  </p>
                )}
              </div>

              {/* Original Price */}
              <div>
                <Label htmlFor="originalPrice" className="flex items-center gap-1">
                  Original Price <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    {...form.register("originalPrice", { valueAsNumber: true })}
                    placeholder="1000"
                    className={`h-12 pl-8 transition-all ${
                      getFieldError("originalPrice")
                        ? "border-red-500 focus:ring-red-500"
                        : isFieldTouched("originalPrice")
                        ? "border-green-500 focus:ring-green-500"
                        : "focus:ring-orange-500"
                    }`}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Full price before discount</p>
                {getFieldError("originalPrice") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("originalPrice")?.message as string}
                  </p>
                )}
              </div>

              {/* Discounted Price */}
              <div>
                <Label htmlFor="discountedPrice" className="flex items-center gap-1">
                  Discounted Price <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="discountedPrice"
                    type="number"
                    step="0.01"
                    {...form.register("discountedPrice", { valueAsNumber: true })}
                    placeholder="800"
                    className={`h-12 pl-8 transition-all ${
                      getFieldError("discountedPrice")
                        ? "border-red-500 focus:ring-red-500"
                        : isFieldTouched("discountedPrice")
                        ? "border-green-500 focus:ring-green-500"
                        : "focus:ring-orange-500"
                    }`}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Final price after discount</p>
                {getFieldError("discountedPrice") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("discountedPrice")?.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Validity & Limits Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Validity & Limits
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Valid From */}
              <div>
                <Label htmlFor="validFrom" className="flex items-center gap-1">
                  Valid From <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="validFrom"
                    type="date"
                    {...form.register("validFrom")}
                    className={`h-12 transition-all ${
                      getFieldError("validFrom")
                        ? "border-red-500 focus:ring-red-500"
                        : isFieldTouched("validFrom")
                        ? "border-green-500 focus:ring-green-500"
                        : "focus:ring-orange-500"
                    }`}
                    disabled={loading}
                  />
                </div>
                {getFieldError("validFrom") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("validFrom")?.message as string}
                  </p>
                )}
              </div>

              {/* Valid To */}
              <div>
                <Label htmlFor="validTo" className="flex items-center gap-1">
                  Valid To <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="validTo"
                    type="date"
                    {...form.register("validTo")}
                    className={`h-12 transition-all ${
                      getFieldError("validTo")
                        ? "border-red-500 focus:ring-red-500"
                        : isFieldTouched("validTo")
                        ? "border-green-500 focus:ring-green-500"
                        : "focus:ring-orange-500"
                    }`}
                    disabled={loading}
                  />
                </div>
                {getFieldError("validTo") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("validTo")?.message as string}
                  </p>
                )}
              </div>

              {/* Min Order Value */}
              <div>
                <Label htmlFor="minOrderValue" className="flex items-center gap-1">
                  Min Order Value <span className="text-red-500">*</span>
                </Label>
                <div className="relative mt-1.5">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <Input
                    id="minOrderValue"
                    type="number"
                    step="0.01"
                    {...form.register("minOrderValue", { valueAsNumber: true })}
                    placeholder="1000"
                    className={`h-12 pl-8 transition-all ${
                      getFieldError("minOrderValue")
                        ? "border-red-500 focus:ring-red-500"
                        : isFieldTouched("minOrderValue")
                        ? "border-green-500 focus:ring-green-500"
                        : "focus:ring-orange-500"
                    }`}
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Minimum order amount required</p>
                {getFieldError("minOrderValue") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("minOrderValue")?.message as string}
                  </p>
                )}
              </div>

              {/* Max Uses */}
              <div>
                <Label htmlFor="maxUses" className="flex items-center gap-1">
                  Max Uses <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="maxUses"
                  type="number"
                  min="0"
                  {...form.register("maxUses", { valueAsNumber: true })}
                  placeholder="100"
                  className={`h-12 mt-1.5 transition-all ${
                    getFieldError("maxUses")
                      ? "border-red-500 focus:ring-red-500"
                      : isFieldTouched("maxUses")
                      ? "border-green-500 focus:ring-green-500"
                      : "focus:ring-orange-500"
                  }`}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Maximum number of times this discount can be used</p>
                {getFieldError("maxUses") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("maxUses")?.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Targeting Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Targeting
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Applies To */}
              <div>
                <Label htmlFor="appliesTo" className="flex items-center gap-1">
                  Applies To <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => form.setValue("appliesTo", value as "all" | "restaurant" | "category" | "item")}>
                  <SelectTrigger
                    className={`h-12 mt-1.5 transition-all border ${
                      getFieldError("appliesTo")
                        ? "border-red-500 focus:ring-red-500"
                        : isFieldTouched("appliesTo")
                        ? "border-green-500 focus:ring-green-500"
                        : "border-gray-300 dark:border-gray-700 focus:ring-orange-500"
                    } bg-white dark:bg-gray-800`}
                    disabled={loading}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Orders</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="item">Specific Item</SelectItem>
                  </SelectContent>
                </Select>
                {getFieldError("appliesTo") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("appliesTo")?.message as string}
                  </p>
                )}
              </div>

              {/* Target ID */}
              <div>
                <Label htmlFor="targetId" className="flex items-center gap-1">
                  Target {form.watch("appliesTo") || "Selection"} ID <span className="text-red-500">*</span>
                </Label>
                <Select onValueChange={(value) => form.setValue("targetId", value)}>
                  <SelectTrigger
                    className={`h-12 mt-1.5 transition-all border ${
                      getFieldError("targetId")
                        ? "border-red-500 focus:ring-red-500"
                        : isFieldTouched("targetId")
                        ? "border-green-500 focus:ring-green-500"
                        : "border-gray-300 dark:border-gray-700 focus:ring-orange-500"
                    } bg-white dark:bg-gray-800`}
                    disabled={loading}
                  >
                    <SelectValue placeholder={`Select ${form.watch("appliesTo") === "restaurant" ? "restaurant" : form.watch("appliesTo") === "category" ? "category" : "item"}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {targetOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {getFieldError("targetId") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("targetId")?.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Promo Code Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Promo Code (Optional)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="code" className="flex items-center gap-1">
                  Promo Code
                </Label>
                <Input
                  id="code"
                  {...form.register("code")}
                  placeholder="e.g. BIRYANI20"
                  className={`h-12 mt-1.5 transition-all ${
                    getFieldError("code")
                      ? "border-red-500 focus:ring-red-500"
                      : isFieldTouched("code")
                      ? "border-green-500 focus:ring-green-500"
                      : "focus:ring-orange-500"
                  }`}
                  disabled={loading}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Leave blank for auto-generated or no code required
                </p>
                {getFieldError("code") && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    {getFieldError("code")?.message as string}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              <Upload className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                Discount Image (Optional)
              </h3>
            </div>

            <div>
              <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-3 mb-3">
                <div className="flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-800 dark:text-orange-300">
                    <strong>Pro tip:</strong> Add an eye-catching image to make your discount stand out in promotions!
                  </p>
                </div>
              </div>

              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-56 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-md"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-white/90 hover:bg-white shadow-lg"
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
                    Recommended: High-resolution JPG or PNG, max 5MB, landscape format for banners
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
              }}
              disabled={loading}
              className="sm:w-auto"
            >
              Clear Form
            </Button>
            <Button
              type="submit"
              className="flex items-center justify-center gap-2 px-8 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 sm:w-auto"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <PlusCircle className="w-5 h-5" />
                  Add Discount
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DiscountForm;