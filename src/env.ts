// // env.ts
// import { z } from "zod";

// const envSchema = z.object({
//   NEXT_PUBLIC_APPWRITE_ENDPOINT: z.string().url("Invalid Appwrite endpoint"),
//   NEXT_PUBLIC_APPWRITE_PROJECT_ID: z
//     .string()
//     .min(15, "Invalid Appwrite project ID"),
//   NEXT_PUBLIC_APPWRITE_FOODIEHUB_DB_ID: z
//     .string()
//     .min(15, "Invalid Appwrite database ID"),
//   NEXT_PUBLIC_APPWRITE_FOODIEHUB_RESTAURANTS_COLLECTION_ID: z
//     .string()
//     .min(15, "Invalid restaurants collection ID"),
//   NEXT_PUBLIC_APPWRITE_FOODIEHUB_MENU_ITEMS_COLLECTION_ID: z
//     .string()
//     .min(15, "Invalid menu items collection ID"),
//   NEXT_PUBLIC_APPWRITE_RESTAURANT_BUCKET_ID: z
//     .string()
//     .min(15, "Invalid restaurant bucket ID"),
//   NEXT_PUBLIC_APPWRITE_MENU_BUCKET_ID: z
//     .string()
//     .min(15, "Invalid menu bucket ID"),
//   // Server-side only (for migrations, remove NEXT_PUBLIC_)
//   APPWRITE_API_KEY: z
//     .string()
//     .min(1, "Appwrite API key required for server-side operations")
//     .optional(),
// });

// export type EnvType = z.infer<typeof envSchema>;

// export const env: EnvType = envSchema.parse(process.env);
