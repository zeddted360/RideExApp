import Image from "next/image";
import { IRestaurantFetched } from "../../../types/types";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { Star } from "lucide-react";

// Restaurant card component
const RestaurantCard = ({ restaurant }: { restaurant: IRestaurantFetched }) => (
  <div className="group bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex-shrink-0 w-[200px] sm:w-auto hover:scale-105 focus-within:ring-2 focus-within:ring-orange-500">
    <div className="relative">
      <div className="w-full h-36 overflow-hidden rounded-t-xl">
        <Image
          src={fileUrl(validateEnv().restaurantBucketId, restaurant.logo)}
          alt={restaurant.name}
          width={200}
          height={150}
          quality={100}
          priority
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </div>
      <div className="absolute bottom-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-opacity duration-200 group-hover:opacity-90">
        <Star className="w-3 h-3 fill-current" />
        <span>{restaurant.rating}</span>
      </div>
    </div>
    <div className="p-4">
      <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-1">
        {restaurant.name}
      </h3>
      <div className="text-xs text-gray-600 space-y-2">
        <p className="line-clamp-1 font-medium">{restaurant.category}</p>
        <div className="flex items-center gap-4 text-gray-500">
          <span>{restaurant.deliveryTime}</span>
          <span>{restaurant.distance}</span>
        </div>
      </div>
    </div>
  </div>
);

export default RestaurantCard;