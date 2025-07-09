// lib/schemas.ts
import { z } from "zod";

// Custom refinement to validate FileList and extract the first File
const fileListSchema = z
  .instanceof(FileList)
  .refine((fileList) => fileList.length > 0, "At least one file is required")
  .refine(
    (fileList) =>
      Array.from(fileList).every((file) => file.size <= 5 * 1024 * 1024),
    "File must be less than 5MB"
  )
  .refine(
    (fileList) =>
      Array.from(fileList).every((file) =>
        ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(file.type)
      ),
    "File must be JPEG, PNG, JPG, or WebP"
  );

export const restaurantSchema = z.object({
  name: z
    .string()
    .min(1, "Restaurant name is required")
    .max(255, "Name is too long"),
  logo:fileListSchema,
  rating: z
    .number()
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5"),
  deliveryTime: z
    .string()
    .min(1, "Delivery time is required")
    .max(50, "Delivery time is too long"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category is too long"),
  distance: z
    .string()
    .min(1, "Distance is required")
    .max(100, "Distance is too long"),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, "Item name is required").max(255, "Name is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description is too long"),
  price: z.string().min(1, "Price is required").max(50, "Price is too long"),
  originalPrice: z
    .string()
    .min(1, "Original price is required")
    .max(50, "Original price is too long"),
  image:fileListSchema,
  rating: z
    .number()
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5"),
  cookTime: z
    .string()
    .min(1, "Cook time is required")
    .max(50, "Cook time is too long"),
  category: z.enum(["veg", "non-veg"], {
    required_error: "Category is required",
  }),
  restaurantId: z
    .string()
    .min(1, "Restaurant is required")
    .max(36, "Restaurant ID is too long"),
});

export const featuredItemSchema = z.object({
  name: z
    .string()
    .min(1, "Featured name is required")
    .max(255, "Name is too long"),
  price: z.string().min(1, "Price is required").max(50, "Price is too long"),
  image: fileListSchema,
  rating: z
    .number()
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5"),
  restaurantId: z
    .string()
    .min(1, "Restaurant is required")
    .max(36, "Restaurant ID is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description is too long"),
});

export type FeaturedItemFormData = z.infer<typeof featuredItemSchema>;
export type RestaurantFormData = z.infer<typeof restaurantSchema>;
export type MenuItemFormData = z.infer<typeof menuItemSchema>;
