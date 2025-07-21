import React from "react";
import Image from "next/image";
import { IMenuItemFetched } from "@/../types/types";
import { Button } from "./button";
import { useShowCart } from "@/context/showCart";
import { useAuth } from "@/context/authContext";
import { useRouter } from "next/navigation";
import { fileUrl, validateEnv } from "@/utils/appwrite";

interface MenuItemCardProps {
  item: IMenuItemFetched;
}

const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { setIsOpen, setItem } = useShowCart();
  const { user } = useAuth();
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300 group">
      <div className="relative w-full h-40">
        <Image
          src={fileUrl(validateEnv().menuBucketId, item.image)}
          alt={item.name}
          fill
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          quality={100}
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="font-bold text-lg mb-1 truncate">{item.name}</div>
        <div className="text-gray-500 text-sm mb-2 line-clamp-2 flex-1">{item.description}</div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-orange-600 font-bold text-xl">₦{item.price}</span>
          <Button
            className="bg-orange-500 text-white rounded-full px-4 py-2"
            aria-label={`Add ${item.name} to cart`}
            onClick={() => {
              if (user) {
                setItem({
                  userId: user.userId as string,
                  itemId: item.$id,
                  name: item.name,
                  image: item.image,
                  price: item.price,
                  restaurantId: item.restaurantId,
                  quantity: 1,
                  category: item.category,
                  source: "menu",
                });
                setIsOpen(true);
              } else {
                router.push("/login");
              }
            }}
          >
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard; 