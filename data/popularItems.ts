import { IPopularItem } from "../types/types";


export const popularItems: IPopularItem[] = [
  {
    id: 1,
    name: "Earlz Smoky Jollof Rice",
    description:
      "Indulge in our smoky Jollof Rice, available every day! A taste that brings back memories of home.",
    price: "₦2,800",
    originalPrice: "₦3,200",
    rating: 4.8,
    reviewCount: 324,
    image: "/Earlz_Smoky_Jollof_Rice.webp",
    category: "Nigerian Cuisine",
    cookingTime: "20-25 min",
    isPopular: true,
    discount: "13% OFF",
  },
  {
    id: 2,
    name: "Spicy Pepper Chicken",
    description:
      "Tender chicken marinated in our signature spice blend, grilled to perfection with bell peppers.",
    price: "₦3,500",
    originalPrice: "₦4,000",
    rating: 4.9,
    reviewCount: 256,
    image: "/Spicy_Pepper_Chicken.webp",
    category: "Grilled Items",
    cookingTime: "15-20 min",
    isPopular: true,
    discount: "12% OFF",
  },
  {
    id: 3,
    name: "Seafood Okra Deluxe",
    description:
      "Fresh seafood medley in rich okra sauce, served with your choice of rice or pounded yam.",
    price: "₦4,200",
    originalPrice: "₦4,800",
    rating: 4.7,
    reviewCount: 189,
    image: "/Seafood_Okra_Deluxe.webp",
    category: "Seafood",
    cookingTime: "25-30 min",
    isPopular: true,
    discount: "15% OFF",
  },
];
