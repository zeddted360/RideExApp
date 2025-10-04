// components/PromotionalImageManager.tsx
"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { fileUrl, storage, validateEnv } from "@/utils/appwrite";
import { ID, Models, Query } from "appwrite";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Upload, X, Image as ImageIcon, Plus } from "lucide-react";
import { z } from "zod";
import Image from "next/image";
import { useAuth } from "@/context/authContext"; 

// Schema for updating/creating image
const imageSchema = z.object({
  image: z.custom<FileList>((val) => val instanceof FileList && val.length > 0, "Image is required"),
});

type ImageFormData = z.infer<typeof imageSchema>;

const PromotionalImageManager: React.FC = () => {
  const [images, setImages] = useState<Models.File[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const form = useForm<ImageFormData>({
    resolver: zodResolver(imageSchema),
    defaultValues: { image: undefined },
  });
  
  const bucketId = validateEnv().promoImagesBucketId;

  // Fetch images from storage
  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        const response = await storage.listFiles(bucketId, [
          Query.limit(2), 
          Query.orderDesc("$createdAt"),
        ]);
        setImages(response.files);
      } catch (error) {
        toast.error("Failed to fetch promotional images");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchImages();
  }, [bucketId]);

  // Handle creating a new image
  const handleCreateImage = async (data: ImageFormData) => {
    try {
      if (images.length >= 2) {
        toast.error("Cannot add more than 2 images");
        return;
      }
      const file = data.image[0];
      await storage.createFile(bucketId, ID.unique(), file);
      toast.success("New image added successfully");
      form.reset();
      setCreating(false);
      const response = await storage.listFiles(bucketId, [Query.limit(2), Query.orderDesc("$createdAt")]);
      setImages(response.files);
    } catch (error) {
      toast.error("Failed to add new image");
      console.error(error);
    }
  };

  // Handle updating an existing image
  const handleUpdateImage = async (data: ImageFormData, fileId: string) => {
    try {
      const file = data.image[0];
      await storage.deleteFile(bucketId, fileId);
      await storage.createFile(bucketId, ID.unique(), file);
      toast.success("Image updated successfully");
      form.reset();
      setUpdatingId(null);
      const response = await storage.listFiles(bucketId, [Query.limit(2), Query.orderDesc("$createdAt")]);
      setImages(response.files);
    } catch (error) {
      toast.error("Failed to update image");
      console.error(error);
    }
  };

  // Handle deleting an image
  const handleDeleteImage = async (fileId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      await storage.deleteFile(bucketId, fileId);
      toast.success("Image deleted successfully");
      const response = await storage.listFiles(bucketId, [Query.limit(2), Query.orderDesc("$createdAt")]);
      setImages(response.files);
    } catch (error) {
      toast.error("Failed to delete image");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading promotional images...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Section */}
      {isAdmin && images.length < 2 && (
        <div className="flex justify-end pb-4">
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-md">
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">Add New Promotional Image</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleCreateImage)} className="mt-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image" className="text-sm font-medium">
                      Select Image
                    </Label>
                    <Input 
                      id="image" 
                      type="file" 
                      accept="image/*" 
                      {...form.register("image")}
                      className="mt-2 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    />
                    {form.formState.errors.image && (
                      <p className="text-red-500 text-sm mt-2">{form.formState.errors.image.message}</p>
                    )}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting || images.length >= 2}
                      className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      {form.formState.isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-2" />
                          Upload
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCreating(false)}
                      disabled={form.formState.isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Images Grid */}
      <div className="space-y-4">
        {images.length === 0 ? (
          <div className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center">
            <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No promotional images yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {isAdmin ? "Upload your first promotional image to get started" : "Check back later for promotional content"}
            </p>
          </div>
        ) : (
          images.map((image, index) => (
            <div 
              key={image.$id} 
              className="w-full group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
            >
              {/* Image Container - Full Width */}
              <div className="relative w-full aspect-[21/9] bg-gray-100 dark:bg-gray-800">
                <Image
                  src={fileUrl(validateEnv().promoImagesBucketId, image.$id)}
                  alt={image.name || `Promotional Image ${index + 1}`}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="100vw"
                  quality={90}
                  priority={index === 0}
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Image Info Badge */}
                <div className="absolute top-3 left-3 bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md">
                  Promo {index + 1}
                </div>

                {/* Admin Controls */}
                {isAdmin && (
                  <div className="absolute bottom-4 right-4 flex gap-2 transition-all duration-300">
                    <Dialog 
                      open={updatingId === image.$id} 
                      onOpenChange={(open) => open ? setUpdatingId(image.$id) : setUpdatingId(null)}
                    >
                      <DialogTrigger asChild>
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="bg-white hover:bg-gray-100 text-gray-900 shadow-lg"
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          Update
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-xl font-semibold">Update Promotional Image</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={form.handleSubmit((data) => handleUpdateImage(data, image.$id))} className="mt-4">
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor={`update-image-${image.$id}`} className="text-sm font-medium">
                                Select New Image
                              </Label>
                              <Input 
                                id={`update-image-${image.$id}`}
                                type="file" 
                                accept="image/*" 
                                {...form.register("image")}
                                className="mt-2 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                              />
                              {form.formState.errors.image && (
                                <p className="text-red-500 text-sm mt-2">{form.formState.errors.image.message}</p>
                              )}
                            </div>
                            <div className="flex gap-3 pt-2">
                              <Button 
                                type="submit" 
                                disabled={form.formState.isSubmitting} 
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
                              >
                                {form.formState.isSubmitting ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    Updating...
                                  </>
                                ) : (
                                  <>
                                    <Upload className="w-4 h-4 mr-2" />
                                    Update
                                  </>
                                )}
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setUpdatingId(null)}
                                disabled={form.formState.isSubmitting}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                    
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteImage(image.$id)}
                      className="bg-red-600 hover:bg-red-700 text-white shadow-lg"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default PromotionalImageManager;