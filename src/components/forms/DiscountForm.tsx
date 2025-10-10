"use client";
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, PlusCircle, Percent } from "lucide-react";
import FileInput from "@/components/FileInput";
import { DiscountFormData } from "@/utils/schema";

interface DiscountFormProps {
  form: UseFormReturn<DiscountFormData>;
  targetOptions: { label: string; value: string }[];
  onSubmit: (data: DiscountFormData) => void;
  loading: boolean;
}

const DiscountForm = ({ form, targetOptions, onSubmit, loading }: DiscountFormProps) => (
  <Card className="w-full bg-white/80 dark:bg-gray-900/80 shadow-2xl rounded-2xl border-0 py-4">
    <CardHeader className="flex flex-row items-center gap-3 pb-2">
      <span className="bg-orange-100 dark:bg-orange-900 p-2 rounded-full">
        <Percent className="w-6 h-6 text-orange-500" />
      </span>
      <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
        Add Discount
      </CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" aria-busy={loading}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-6">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="e.g. 20% Off Biryani"
              className="h-12 focus:ring-2 focus:ring-orange-500"
            />
            {form.formState.errors.title && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Discount details..."
              className="min-h-[80px] focus:ring-2 focus:ring-orange-500"
            />
            {form.formState.errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="discountType">Discount Type</Label>
            <Select onValueChange={(value) => form.setValue("discountType", value as "percentage" | "fixed")}>
              <SelectTrigger className="h-12 focus:ring-2 focus:ring-orange-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percentage">Percentage (%)</SelectItem>
                <SelectItem value="fixed">Fixed Amount (₦)</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.discountType && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.discountType.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="discountValue">Discount Value</Label>
            <Input
              id="discountValue"
              type="number"
              {...form.register("discountValue", { valueAsNumber: true })}
              placeholder="e.g. 20"
              className="h-12 focus:ring-2 focus:ring-orange-500"
            />
            {form.formState.errors.discountValue && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.discountValue.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="validFrom">Valid From</Label>
            <Input
              id="validFrom"
              type="date"
              {...form.register("validFrom")}
              className="h-12 focus:ring-2 focus:ring-orange-500"
            />
            {form.formState.errors.validFrom && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.validFrom.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="validTo">Valid To</Label>
            <Input
              id="validTo"
              type="date"
              {...form.register("validTo")}
              className="h-12 focus:ring-2 focus:ring-orange-500"
            />
            {form.formState.errors.validTo && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.validTo.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="minOrderValue">Min Order Value (₦)</Label>
            <Input
              id="minOrderValue"
              type="number"
              {...form.register("minOrderValue", { valueAsNumber: true })}
              placeholder="e.g. 1000"
              className="h-12 focus:ring-2 focus:ring-orange-500"
            />
            {form.formState.errors.minOrderValue && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.minOrderValue.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="maxUses">Max Uses</Label>
            <Input
              id="maxUses"
              type="number"
              {...form.register("maxUses", { valueAsNumber: true })}
              placeholder="e.g. 100"
              className="h-12 focus:ring-2 focus:ring-orange-500"
            />
            {form.formState.errors.maxUses && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.maxUses.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="code">Promo Code (Optional)</Label>
            <Input
              id="code"
              {...form.register("code")}
              placeholder="e.g. BIRYANI20"
              className="h-12 focus:ring-2 focus:ring-orange-500"
            />
            {form.formState.errors.code && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.code.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="appliesTo">Applies To</Label>
            <Select onValueChange={(value) => form.setValue("appliesTo", value as "all" | "restaurant" | "category" | "item")}>
              <SelectTrigger className="h-12 focus:ring-2 focus:ring-orange-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="restaurant">Restaurant</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="item">Specific Item</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.appliesTo && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.appliesTo.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="targetId">Target {form.watch("appliesTo")} ID</Label>
            <Select onValueChange={(value) => form.setValue("targetId", value)}>
              <SelectTrigger className="h-12 focus:ring-2 focus:ring-orange-500">
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
            {form.formState.errors.targetId && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.targetId.message}
              </p>
            )}
          </div>
          <div className="md:col-span-2">
            <FileInput field={form.register("image")} label="Discount Image (Optional)" />
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
            Add Discount
          </Button>
        </div>
      </form>
    </CardContent>
  </Card>
);

export default DiscountForm;