// utils/appwrite.ts
import { Account, Client, Databases, ID, Storage } from "appwrite";

// Interface to define the structure of environment variables
interface EnvConfig {
  endpoint: string;
  projectId: string;
  databaseId: string;
  restaurantsCollectionId: string;
  menuItemsCollectionId: string;
  restaurantBucketId: string;
  menuBucketId: string;
  orderId: string;
}

// Validate environment variables
export function validateEnv(): EnvConfig {
  const requiredEnvVars = {
    endpoint: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
    projectId: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_FOODIEHUB_DB_ID,
    restaurantsCollectionId:
      process.env.NEXT_PUBLIC_APPWRITE_FOODIEHUB_RESTAURANTS_COLLECTION_ID,
    menuItemsCollectionId:
      process.env.NEXT_PUBLIC_APPWRITE_FOODIEHUB_MENU_ITEMS_COLLECTION_ID,
    restaurantBucketId: process.env.NEXT_PUBLIC_APPWRITE_RESTAURANT_BUCKET_ID,
    menuBucketId: process.env.NEXT_PUBLIC_APPWRITE_MENU_BUCKET_ID,
    orderId: process.env.NEXT_PUBLIC_APPWRITE_ORDER_ID,
  };

  // Check for undefined environment variables
  const missingVars = Object.entries(requiredEnvVars)
    .filter(([_, value]) => value === undefined)
    .map(([key]) => key);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }

  // Return validated environment variables
  return {
    endpoint: requiredEnvVars.endpoint!,
    projectId: requiredEnvVars.projectId!,
    databaseId: requiredEnvVars.databaseId!,
    restaurantsCollectionId: requiredEnvVars.restaurantsCollectionId!,
    menuItemsCollectionId: requiredEnvVars.menuItemsCollectionId!,
    restaurantBucketId: requiredEnvVars.restaurantBucketId!,
    menuBucketId: requiredEnvVars.menuBucketId!,
    orderId: requiredEnvVars.orderId!,
  };
}

// Initialize Appwrite client with validated environment variables
const env = validateEnv();

const client = new Client().setEndpoint(env.endpoint).setProject(env.projectId);

const databases = new Databases(client);
const storage = new Storage(client);
const account = new Account(client);

// Export configuration object using validated environment variables
export const config = {
  databaseId: env.databaseId,
  restaurantsCollectionId: env.restaurantsCollectionId,
  menuItemsCollectionId: env.menuItemsCollectionId,
  restaurantBucketId: env.restaurantBucketId,
  menuBucketId: env.menuBucketId,
  orderId: env.orderId,
};

const fileUrl = (bucketId: string, fileId: string) =>
  `https://fra.cloud.appwrite.io/v1/storage/buckets/${bucketId}/files/${fileId}/view?project=${
    validateEnv().projectId
  }&mode=admin`;

export { databases, storage, account, fileUrl };