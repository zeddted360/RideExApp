// lib/schemas.ts
import { z } from "zod";

// Custom refinement to validate FileList and extract the first File
const fileListSchema = z
  .custom<FileList>((value) => {
    // Check if we're in a browser environment and if the value is a FileList
    if (typeof window !== "undefined" && value instanceof FileList) {
      return value.length > 0;
    }
    return true; // Allow during SSR
  }, "At least one file is required")
  .refine((value) => {
    if (typeof window !== "undefined" && value instanceof FileList) {
      return Array.from(value).every((file) => file.size <= 5 * 1024 * 1024);
    }
    return true; // Allow during SSR
  }, "File must be less than 5MB")
  .refine((value) => {
    if (typeof window !== "undefined" && value instanceof FileList) {
      return Array.from(value).every((file) =>
        ["image/jpeg", "image/png", "image/webp", "image/jpg"].includes(
          file.type
        )
      );
    }
    return true; // Allow during SSR
  }, "File must be JPEG, PNG, JPG, or WebP");

export const restaurantSchema = z.object({
  name: z
    .string()
    .min(1, "Restaurant name is required")
    .max(255, "Name is too long"),
  logo: fileListSchema,
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
  category: z.enum(["veg", "non-veg"], {
    required_error: "Category is required",
  }),
});

export const popularItemSchema = z.object({
  name: z
    .string()
    .min(1, "Popular item name is required")
    .max(255, "Name is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(1000, "Description is too long"),
  price: z.string().min(1, "Price is required").max(50, "Price is too long"),
  originalPrice: z
    .string()
    .min(1, "Original price is required")
    .max(50, "Original price is too long"),
  image: fileListSchema,
  rating: z
    .number()
    .min(0, "Rating must be between 0 and 5")
    .max(5, "Rating must be between 0 and 5"),
  reviewCount: z.number().min(0, "Review count must be 0 or more"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category is too long"),
  cookingTime: z
    .string()
    .min(1, "Cooking time is required")
    .max(50, "Cooking time is too long"),
  isPopular: z.boolean(),
  discount: z.string().max(50, "Discount is too long"),
  restaurantId: z
    .string()
    .min(1, "Restaurant is required")
    .max(36, "Restaurant ID is too long"),
});


export const vendorRegistrationSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    phoneNumber: z
      .string()
      .min(10, "Phone number must be at least 10 digits")
      .regex(/^(\+234|0)[789]\d{9}$/, "Please enter a valid Nigerian phone number"),
    email: z.string().email("Please enter a valid email address"),
    catchmentArea: z.string().min(1, "Please select a catchment area"),
    location: z.string().min(3, "Location must be at least 3 characters"),
    businessName: z.string().min(2, "Business name must be at least 2 characters"),
    category: z.string().min(1, "Please select a category"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    agreeTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
    whatsappUpdates: z.boolean().optional(), // Optional field for WhatsApp toggle
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });


export type VendorRegistrationFormData = z.infer<typeof vendorRegistrationSchema>;
export type FeaturedItemFormData = z.infer<typeof featuredItemSchema>;
export type RestaurantFormData = z.infer<typeof restaurantSchema>;
export type MenuItemFormData = z.infer<typeof menuItemSchema>;
export type PopularItemFormData = z.infer<typeof popularItemSchema>;
