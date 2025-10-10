"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, XCircle, CheckCircle, Image as ImageIcon, Edit2 } from "lucide-react";
import toast from "react-hot-toast";
import { AppDispatch } from "@/state/store";
import { updateAsyncMenuItem } from "@/state/menuSlice";
import { updateAsyncPopularItem } from "@/state/popularSlice";
import { updateAsyncFeaturedItem } from "@/state/featuredSlice";
import { listAsyncMenusItem } from "@/state/menuSlice";
import { listAsyncPopularItems } from "@/state/popularSlice";
import { listAsyncFeaturedItems } from "@/state/featuredSlice";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { IFeaturedItemFetched, IMenuItemFetched, IPopularItemFetched } from "../../../types/types";

type ContentType = "menu" | "popular" | "featured";
type ContentItem = IMenuItemFetched | IPopularItemFetched | IFeaturedItemFetched;

interface EditItemModalProps {
  item: ContentItem;
  type: ContentType;
  dispatch: AppDispatch;
  onClose: () => void;
  editFormData: any;
  setEditFormData: React.Dispatch<React.SetStateAction<any>>;
  newImage: File | null;
  setNewImage: React.Dispatch<React.SetStateAction<File | null>>;
  isUpdating: boolean;
  setIsUpdating: React.Dispatch<React.SetStateAction<boolean>>;
  restaurantName: string;
  setRestaurantName: React.Dispatch<React.SetStateAction<string>>;
}

export default function EditItemModal({
  item,
  type,
  dispatch,
  onClose,
  editFormData,
  setEditFormData,
  newImage,
  setNewImage,
  isUpdating,
  setIsUpdating,
  restaurantName,
  setRestaurantName
}: EditItemModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    if (newImage) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(newImage);
    } else {
      setPreviewImage(null);
    }
  }, [newImage]);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setNewImage(e.target.files[0]);
    }
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const itemId = item.$id;
      let updateData: any;
      let action;
      switch (type) {
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
        onClose();
        // Refetch based on type
        switch (type) {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-orange-200 dark:border-orange-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-orange-100 dark:border-orange-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Edit2 className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Edit {type.charAt(0).toUpperCase() + type.slice(1)} Item
            </h3>
          </div>
          <Button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <XCircle className="w-5 h-5 text-gray-500" />
          </Button>
        </div>

        <form className="space-y-5">
          {/* Basic Information Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Basic Information</h4>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Item Name
              </Label>
              <Input
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                placeholder="Enter item name"
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              />
            </div>

            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </Label>
              <textarea
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                placeholder="Enter item description"
                rows={3}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category
                </Label>
                <select
                  name="category"
                  value={editFormData.category}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="">Select category</option>
                  <option value="veg">Vegetarian</option>
                  <option value="non-veg">Non-Vegetarian</option>
                </select>
              </div>

              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Rating
                </Label>
                <Input
                  name="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={editFormData.rating}
                  onChange={handleEditChange}
                  placeholder="0.0"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>

          {/* Pricing Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Pricing</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (₦)
                </Label>
                <Input
                  name="price"
                  type="number"
                  value={editFormData.price}
                  onChange={handleEditChange}
                  placeholder="0.00"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>

              {("originalPrice" in editFormData && editFormData.originalPrice !== undefined) && (
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Original Price (₦)
                  </Label>
                  <Input
                    name="originalPrice"
                    type="number"
                    value={editFormData.originalPrice}
                    onChange={handleEditChange}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              )}

              {("discount" in editFormData && editFormData.discount !== undefined) && (
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Discount
                  </Label>
                  <Input
                    name="discount"
                    value={editFormData.discount}
                    onChange={handleEditChange}
                    placeholder="e.g., 20% OFF"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Additional Details Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Additional Details</h4>
            
            <div className="grid grid-cols-2 gap-4">
              {("cookTime" in editFormData || "cookingTime" in editFormData) && (
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cooking Time
                  </Label>
                  <Input
                    name={"cookTime" in editFormData ? "cookTime" : "cookingTime"}
                    value={editFormData.cookTime || editFormData.cookingTime || ""}
                    onChange={handleEditChange}
                    placeholder="e.g., 20-25 mins"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              )}

              {("reviewCount" in editFormData && editFormData.reviewCount !== undefined) && (
                <div>
                  <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Review Count
                  </Label>
                  <Input
                    name="reviewCount"
                    type="number"
                    min="0"
                    value={editFormData.reviewCount}
                    onChange={handleEditChange}
                    placeholder="0"
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-400 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              )}

              <div>
                <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Restaurant
                </Label>
                <Input
                  name="restaurantId"
                  disabled
                  value={restaurantName || editFormData.restaurantId}
                  onChange={handleEditChange}
                  placeholder="Enter restaurant ID"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-orange-600 uppercase tracking-wide">Image</h4>
            
            <div>
              <Label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload New Image (Optional)
              </Label>
              <div className="flex items-center gap-4">
                <label className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-orange-400 transition">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <ImageIcon className="w-5 h-5" />
                      <span className="text-sm">
                        {newImage ? newImage.name : 'Choose an image'}
                      </span>
                    </div>
                  </div>
                  <Input
                    type="file" 
                    onChange={handleEditFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                </label>
              </div>
              {newImage && (
                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  New image selected
                </p>
              )}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleUpdate}
              disabled={isUpdating}
              className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-lg transition font-medium flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Update Item
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}