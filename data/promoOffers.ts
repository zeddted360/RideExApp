import { IPromoOffer } from "../types/types";

 export const promoOffers: IPromoOffer[] = [
    {
      id: 1,
      title: "Savory and Satisfying",
      subtitle: "Flat 5% off on Veg & Non-veg Burgers",
      buttonText: "Order Now",
      bgColor: "from-orange-100 to-yellow-100",
      textColor: "text-orange-600",
      image: "🍔",
      decorativeElements: ["🍟", "🥤", "🍕"],
    },
    {
      id: 2,
      title: "Uplifting anytime",
      subtitle: "Flat 7% off on Beef items",
      buttonText: "Order Now",
      bgColor: "from-green-100 to-emerald-100",
      textColor: "text-green-600",
      image: "🥩",
      decorativeElements: ["🌿", "🍽️", "🔥"],
    },
  ];
