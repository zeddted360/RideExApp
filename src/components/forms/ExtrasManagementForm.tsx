"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit2, Loader2, PlusCircle, Trash2, ChevronDown, ChevronUp, X, Image as ImageIcon } from "lucide-react";
import FileInput from "@/components/FileInput";
import { AppDispatch, RootState } from "@/state/store";
import { createAsyncExtra, listAsyncExtras, updateAsyncExtra, deleteAsyncExtra } from "@/state/extraSlice";
import toast from "react-hot-toast";
import { IFetchedExtras } from "../../../types/types";
import { useAuth } from "@/context/authContext";
import Image from "next/image";
import { fileUrl, validateEnv } from "@/utils/appwrite";

const extraSchema = z.object({
  name: z.string().min(1, "Extra name is required"),
  price: z.string().min(1, "Extra price is required"),
  description: z.string(),
  image: z.any().optional(),
  vendorId: z.string(),
});

type ExtraFormData = z.infer<typeof extraSchema>;

const ITEMS_PER_PAGE = 4;

const ExtrasManagementForm = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { extras, loading, error } = useSelector((state: RootState) => state.extra);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isFormCollapsed, setIsFormCollapsed] = useState(false);
  const { userId: vendorId } = useAuth();

  const form = useForm<ExtraFormData>({
    resolver: zodResolver(extraSchema),
    defaultValues: {
      name: "",
      price: "",
      description: "",
      image: undefined,
      vendorId: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (vendorId) {
      dispatch(listAsyncExtras(vendorId));
    }
  }, [dispatch, vendorId]);

  const handleSubmit = async (data: ExtraFormData) => {
    setIsSubmitting(true);
    try {
      if (!vendorId || typeof vendorId !== "string") {
        toast.error("Vendor ID is missing. Please log in again.");
        setIsSubmitting(false);
        return;
      }
      const imageFile = data.image && (data.image as FileList).length > 0 ? (data.image as FileList)[0] : undefined;
      if (editingId) {
        await dispatch(
          updateAsyncExtra({
            extraId: editingId,
            data: { name: data.name, price: data.price, description: data.description, vendorId },
            newImage: imageFile,
          })
        ).unwrap();
        toast.success("Extra updated successfully!");
        setEditingId(null);
        setIsFormCollapsed(true);
      } else {
        await dispatch(
          createAsyncExtra({
            name: data.name,
            price: data.price,
            description: data.description,
            vendorId,
            image: imageFile,
          })
        ).unwrap();
        toast.success("Extra added successfully!");
        setIsFormCollapsed(true);
      }
      form.reset();
    } catch (err) {
      toast.error("Failed to save extra");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (extra: IFetchedExtras) => {
    setEditingId(extra.$id);
    setIsFormCollapsed(false);
    form.setValue("name", extra.name);
    form.setValue("price", extra.price);
    form.setValue("description", extra.description || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (extraId: string, imageId?: string) => {
    if (!confirm("Are you sure you want to delete this extra?")) return;
    
    try {
      await dispatch(deleteAsyncExtra({ extraId, imageId })).unwrap();
      toast.success("Extra deleted successfully!");
    } catch (err) {
      toast.error("Failed to delete extra");
    }
  };

  const handleCancel = () => {
    form.reset();
    setEditingId(null);
    if (extras.length > 0) {
      setIsFormCollapsed(true);
    }
  };

  const handleShowMore = () => {
    setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, extras.length));
  };

  const handleShowLess = () => {
    setVisibleCount(ITEMS_PER_PAGE);
    document.getElementById("extras-list")?.scrollIntoView({ behavior: "smooth" });
  };

  const visibleExtras = extras.slice(0, visibleCount);
  const hasMore = visibleCount < extras.length;
  const canShowLess = visibleCount > ITEMS_PER_PAGE;

  return (
    <div className="space-y-6">
      <Card className="w-full bg-white dark:bg-gray-900 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300">
        <CardHeader 
          className="flex flex-row items-center justify-between pb-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          onClick={() => setIsFormCollapsed(!isFormCollapsed)}
        >
          <div className="flex items-center gap-3">
            <span className="bg-orange-100 dark:bg-orange-900/30 p-2.5 rounded-xl">
              <PlusCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </span>
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {editingId ? "Edit Extra" : "Add New Extra"}
            </CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            type="button"
          >
            {isFormCollapsed ? (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            )}
          </Button>
        </CardHeader>
        
        {!isFormCollapsed && (
          <CardContent className="pt-0 pb-6">
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">Extra Name *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="e.g. Plastic Container"
                    className="h-11 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
                  />
                  {form.formState.errors.name?.message && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">Price (₦) *</Label>
                  <Input
                    id="price"
                    type="number"
                    {...form.register("price")}
                    placeholder="e.g. 50"
                    className="h-11 focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400"
                  />
                  {form.formState.errors.price?.message && (
                    <p className="text-red-500 text-xs mt-1">{form.formState.errors.price.message}</p>
                  )}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                  <Textarea
                    id="description"
                    {...form.register("description")}
                    placeholder="e.g. Disposable plastic container"
                    className="min-h-[90px] focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 resize-none"
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <FileInput field={form.register("image")} label="Image (Optional)" />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="h-11"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="h-11 bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600 min-w-[140px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <PlusCircle className="w-4 h-4 mr-2" />
                  )}
                  {editingId ? "Update" : "Add Extra"}
                </Button>
              </div>
            </form>
          </CardContent>
        )}
      </Card>

      <Card id="extras-list" className="w-full bg-white dark:bg-gray-900 shadow-lg rounded-2xl border border-gray-200 dark:border-gray-800">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Your Extras {extras.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                  ({extras.length})
                </span>
              )}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {loading === "pending" ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Loading extras...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 mb-3">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-red-500 dark:text-red-400">{error}</p>
              <Button className="m-2" variant={"destructive"} onClick={()=>dispatch(listAsyncExtras(vendorId as string))}>Ok</Button>
            </div>
          ) : extras.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-900 dark:text-gray-100 font-medium mb-1">No extras yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Add your first extra to get started
              </p>
              <Button
                onClick={() => setIsFormCollapsed(false)}
                variant="outline"
                className="h-10"
              >
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Extra
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4">
                {visibleExtras.map((extra: IFetchedExtras) => (
                  <div
                    key={extra.$id}
                    className="group flex items-start gap-4 border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-md transition-all duration-200"
                  >
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {extra.image ? (
                        <Image
                          src={fileUrl(validateEnv().extrasBucketId, extra.image)}
                          fill
                          alt={extra.name}
                          className="object-cover"
                          sizes="(max-width: 762px) 33vh, 50vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">
                        {extra.name}
                      </h4>
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-2">
                        ₦{parseFloat(extra.price).toLocaleString()}
                      </p>
                      {extra.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {extra.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(extra)}
                        className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20"
                        title="Edit extra"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(extra.$id, extra.image)}
                        className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        title="Delete extra"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {(hasMore || canShowLess) && (
                <div className="flex justify-center gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {hasMore && (
                    <Button
                      variant="outline"
                      onClick={handleShowMore}
                      className="h-10 min-w-[140px]"
                    >
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Show More ({extras.length - visibleCount})
                    </Button>
                  )}
                  {canShowLess && (
                    <Button
                      variant="outline"
                      onClick={handleShowLess}
                      className="h-10 min-w-[140px]"
                    >
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Show Less
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExtrasManagementForm;