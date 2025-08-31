import { Models } from "appwrite";


export interface IUser {
  userId: string;
  username: string;
  email: string;
  role: "admin" | "user" | "vendor";
  phoneNumber?: string;
  phoneVerified?: boolean;
  isAdmin?: boolean;
}

export interface IUserFectched extends IUser, Models.Document {
  isVendor:boolean;
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
  isApproved?:boolean;
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
  isApproved?:boolean;

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
  source: "menu" | "featured" | "popular" | "";
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
  isApproved?:boolean;

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

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "out_for_delivery"
  | "delivered"
  | "completed"
  | "cancelled"
  | "failed";

// Notification types
export interface INotification {
  type:
    | "admin_new_order"
    | "user_order_confirmation"
    | "order_status_update"
    | "delivery_update";
  recipient: string;
  userId?: string;
  orderId: string;
  address: string;
  customerAddress?: string;
  phone?: string;
  deliveryTime?: string;
  totalAmount?: number;
  items?: string[];
  deliveryDistance?: string;
  deliveryDuration?: string;
  deliveryFee?: number;
  selectedBranchId?: number;
  status: "unread" | "read";
  createdAt: string;
  label?: "Home" | "Work" | "Other"; // Added label for address type
}

export interface INotificationFetched extends INotification, Models.Document {}

// State interface
export interface INotificationState {
  notifications: INotificationFetched[];
  adminNotifications: INotificationFetched[];
  userNotifications: INotificationFetched[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
}

export interface IBookedOrderFetched extends Models.Document {
  orderId: string;
  customerId: string;
  address: string;
  label?: "Home" | "Work" | "Other";
  paymentMethod: string;
  deliveryTime: string;
  createdAt: string;
  total: number;
  status: OrderStatus;
  phone: string;
  deliveryFee: number;
  deliveryDistance?: string;
  deliveryDuration?: string;
  selectedBranchId: number;
  apartmentFlat?: string;
  paid?: boolean; // Added paid attribute
}

export interface ISearchResult {
  id: string;
  name: string;
  type: "restaurant" | "menu" | "popular" | "featured";
  image?: string;
  price?: string;
  description?: string;
  restaurantName?: string;
  category?: string;
  rating?: number;
  deliveryTime?: string;
  distance?: string;
}

// newly added
export interface IVendor {
  fullName:string;
  phoneNumber: string;
  email: string;
  catchmentArea: string;
  location: string;
  businessName: string
  category: string;
  password: string;
  deliveryDays: string | null | undefined;
  instantDelivery: boolean | undefined;
  agreeTerms: boolean;
  status: 'pending' | "approved" |"rejected";
}

export interface IVendorFetched extends IVendor, Models.Document {};