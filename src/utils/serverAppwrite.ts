import { Client, Databases, ID, Messaging, Storage } from 'node-appwrite'; 

// Validate server env vars
export function validateServerEnv() {
  const required = {
    endpoint: process.env.APPWRITE_ENDPOINT,
    projectId: process.env.APPWRITE_PROJECT_ID,
    apiKey: process.env.APPWRITE_API_KEY,
    databaseId: process.env.NEXT_PUBLIC_APPWRITE_FOODIEHUB_DB_ID!, // Reuse public for consistency
    bookedOrdersCollectionId: process.env.NEXT_PUBLIC_APPWRITE_BOOKED_ORDERS_COLLECTION_ID,
    userCollectionId:process.env.APPWRITE_USER_COLLECTION_ID!,
    // Add others as needed, e.g., notificationCollectionId
  };

  const missing = Object.entries(required)
    .filter(([_, v]) => !v)
    .map(([k]) => k);

  if (missing.length > 0) {
    throw new Error(`Missing server env vars: ${missing.join(', ')}`);
  }

  return required;
}

// Init server client
const env = validateServerEnv();
const client = new Client()
  .setEndpoint(env.endpoint!)
  .setProject(env.projectId!)
  .setKey(env.apiKey!); // Server-only: API key

export const databases = new Databases(client);
export const storage = new Storage(client);
export const messaging = new Messaging(client);

export { ID };

// Export config for reuse
export const serverConfig = {
  databaseId: env.databaseId!,
  bookedOrdersCollectionId: env.bookedOrdersCollectionId!,
  // Add more as needed
};