import { Models } from "appwrite";


export interface IfeaturedRestaurant {
  id: string;
  name: string;
  logo: string; 
  rating: number;
  deliveryTime: string;
  category: string;
  distance: string;
  vegetables: { id: number; name: string; description: string; price: string; originalPrice: string; image: string; rating: number; cookTime: string }[];
  nonVegetables: { id: number; name: string; description: string; price: string; originalPrice: string; image: string; rating: number; cookTime: string }[];
}

export interface IMenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  image: string;
  category: string;
  rating: number;
  cookTime: string;
}

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


export interface Restaurant {
  id: string;
  name: string;
  logo: string; 
  rating: number;
  deliveryTime: string;
  category: string;
  distance: string;
}
// fetched IRestaurant
export interface IRestaurantFetched extends Models.Document {
  id: string;
  name: string;
  logo: string; 
  rating: number;
  deliveryTime: string;
  category: string;
  distance: string;
}


export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
  originalPrice: string;
  image: string; // File ID
  rating: number;
  cookTime: string;
  category: "veg" | "non-veg";
  restaurantId: string;
}

export interface IFeaturedItem {
  id: string;
  name: string;
  price: string;
    image: string;
    description: string;
  rating: number;
  restaurant: string;
}


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