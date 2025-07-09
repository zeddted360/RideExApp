import { Models } from "appwrite";

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

export interface IFeaturedItemFetched extends Models.Document {
  name: string;
  price: string;
  image: string;
  description: string;
  rating: number;
  restaurant: string;
};

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