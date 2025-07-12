import { Models } from "appwrite";


export interface IUser {
  userId: string;
  username: string;
  email: string;
  role: "admin" | "user";
  phoneNumber?: string;
  phoneVerified?: boolean;
}

export interface AuthState {
  user: IUser | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}

//Post menu items
export interface IMenuItem {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  image: string;
  category: "veg" | "non-veg";
  rating: number;
  cookTime: string;
}

//fetched menu items
export interface IMenuItemFetched extends Models.Document {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  image: string;
  category: string;
  rating: number;
  cookTime: string;
}

// post Restaurant
export interface IRestaurant {
  name: string;
  logo: FileList;
  rating: number;
  deliveryTime: string;
  category: string;
  distance: string;
}
// fetched IRestaurant
export interface IRestaurantFetched extends Models.Document {
  name: string;
  logo: string;
  rating: number;
  deliveryTime: string;
  category: string;
  distance: string;
}

export interface IFeaturedItem {
  name: string;
  price: string;
  image: string;
  rating: number;
  restaurant: string;
  description: string;
  category: string;
}

export interface IFeaturedItemFetched extends IFeaturedItem, Models.Document {}

// inital cart item
export interface ICartItem {
  userId: string;
  itemId: string;
  name: string;
  image: string;
  price: string;
  restaurantId: string;
  quantity: number;
  category: string;
  source: "menu" | "featured" | "popular";
}

//  cart item order processed
export interface ICartItemOrder extends ICartItem {
  specialInstructions?: string;
  totalPrice: number;
  status: "pending" | "processing" | "success";
}

export interface ICartItemFetched extends ICartItemOrder, Models.Document {}

export interface IPromoOffer {
  id: number;
  title: string;
  subtitle: string;
  buttonText: string;
  bgColor: string;
  textColor: string;
  image: string;
  decorativeElements: string[];
}

export interface IPopularItem {
  id: number;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  rating: number;
  reviewCount: number;
  image: string;
  category: string;
  cookingTime: string;
  isPopular: boolean;
  discount: string;
}

// Fetched popular item (from DB)
export interface IPopularItemFetched extends IPopularItem, Models.Document {}

// Form data for popular item (for react-hook-form)
export interface PopularItemFormData {
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  rating: number;
  reviewCount: number;
  image: FileList;
  category: string;
  cookingTime: string;
  isPopular: boolean;
  discount: string;
  restaurantId: string;
}