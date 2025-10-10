"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, X } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useShowCart } from "@/context/showCart";
import { ICartItemOrder, ICartItemFetched } from "../../../types/types";
import {
  createOrderAsync,
  resetOrders,
  addOrder,
  deleteOrder,
  updateOrderAsync,
} from "@/state/orderSlice";
import { AppDispatch, RootState } from "@/state/store";
import { fileUrl, validateEnv } from "@/utils/appwrite";

const AddToCartModal = () => {
  const { isOpen, setIsOpen, item } = useShowCart();

  const dispatch = useDispatch<AppDispatch>();
  const { error, orders } = useSelector((state: RootState) => state.orders);
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [specialInstructions, setSpecialInstructions] = useState("");
  const maxInstructionsLength = 200;

  // Get user from Redux
  const {user} = useSelector((state: RootState) => state.auth);
  const userId = user?.userId;

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuantity(item.quantity || 1);
      setSpecialInstructions("");
      if (error) {
        dispatch(resetOrders());
      }
    }
  }, [isOpen, item.quantity, dispatch, error]);

  const parsePrice = (priceString: string | number): number => {
    return typeof priceString === "string"
      ? Number(priceString.replace(/[₦,]/g, ""))
      : priceString;
  };

  const itemPrice = parsePrice(item.price);
  const totalPrice = itemPrice * quantity;

  const handleAddToCart = async () => {
    // Check if the item already exists in the cart
    const existingOrder = orders?.find(
      (order) => order.itemId === item.itemId && order.userId === item.userId
    );

    if (existingOrder) {
      // Update existing order
      const newQuantity = existingOrder.quantity + quantity;
      const newTotalPrice = itemPrice * newQuantity;

      // Optimistic update
      dispatch(
        addOrder({
          ...existingOrder,
          quantity: newQuantity,
          totalPrice: newTotalPrice,
          specialInstructions:
            specialInstructions || existingOrder.specialInstructions,
        })
      );
      toast.success(`${item.name} quantity updated in cart!`, {
        duration: 3000,
        position: "top-right",
      });

      try {
        await dispatch(
          updateOrderAsync({
            orderId: existingOrder.$id,
            orderData: {
              quantity: newQuantity,
              totalPrice: newTotalPrice,
              specialInstructions:
                specialInstructions || existingOrder.specialInstructions,
            },
          })
        ).unwrap();
        setIsOpen(false);
      } catch (err) {
        toast.error(`Failed to update ${item.name} in cart`, {
          duration: 4000,
          position: "top-right",
        });
        // Revert optimistic update
        dispatch(
          addOrder({
            ...existingOrder,
            quantity: existingOrder.quantity,
            totalPrice: existingOrder.totalPrice,
            specialInstructions: existingOrder.specialInstructions,
          })
        );
      }
    } else {
      // Add new order
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const newItem: ICartItemFetched = {
        $id: tempId,
        userId: userId,
        itemId: item.itemId,
        image: item.image,
        name: item.name,
        category: item.category,
        price: item.price,
        quantity,
        totalPrice,
        restaurantId: item.restaurantId,
        specialInstructions,
        status: "pending",
        source: item.source,
      } as unknown as ICartItemFetched;

      // Optimistic update
      dispatch(addOrder(newItem));
      toast.success(`${newItem.name} added to cart!`, {
        duration: 3000,
        position: "top-right",
      });

      try {
        // Exclude $id from the payload sent to Appwrite
        const { $id, ...orderData } = newItem;
        await dispatch(
          createOrderAsync({
            ...orderData,
            $id: tempId,
            source: item.source,
          } as ICartItemOrder)
        ).unwrap();
        setIsOpen(false);
      } catch (err) {
        toast.error(`Failed to add ${newItem.name} to cart`, {
          duration: 4000,
          position: "top-right",
        });
        dispatch(deleteOrder(tempId));
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className={cn(
          "sm:max-w-md md:max-w-lg lg:max-w-2xl max-h-[95vh] bg-white dark:bg-gray-900 border-0 p-0 overflow-y-auto rounded-3xl shadow-2xl",
          "animate-in fade-in-0 zoom-in-95 duration-300",
          "scrollbar-hide [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        )}
        aria-describedby="dialog-description"
      >
        {/* Close Button */}
        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 group"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
        </button>

        <DialogHeader className="sr-only">
          <DialogTitle>Add {item.name} to Cart</DialogTitle>
          <DialogDescription id="dialog-description">
            Customize your order for {item.name}. Adjust quantity and add
            special instructions.
          </DialogDescription>
        </DialogHeader>

        {/* Hero Image Section */}
        <div className="relative w-full h-48 sm:h-64 bg-gradient-to-br from-orange-100 via-orange-50 to-red-50 dark:from-gray-800 dark:via-gray-850 dark:to-gray-900 overflow-hidden flex-shrink-0">
          <Image
            src={fileUrl(
              item.source === "featured"
                ? validateEnv().featuredBucketId
                : item.source === "popular"
                ? validateEnv().popularBucketId
                : validateEnv().menuBucketId,
              item.image
            )}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
            quality={90}
            priority
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Category Badge */}
          <div className="absolute top-3 left-3 z-10">
            <span className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm border",
              item.category === "veg"
                ? "bg-green-500/90 text-white border-green-400"
                : "bg-orange-500/90 text-white border-orange-400"
            )}>
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              {item.category === "veg" ? "Vegetarian" : "Non-Veg"}
            </span>
          </div>

          {/* Item Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h2 className="text-xl sm:text-2xl font-bold mb-1 drop-shadow-lg line-clamp-1">
              {item.name === "Jollof" ? "African Jollof" : item.name}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 line-clamp-2 mb-2 drop-shadow">
              {item.description || "Delicious and freshly prepared item."}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold">
                  ₦{itemPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
          {/* Quantity Selector */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                Quantity
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Select amount
              </span>
            </div>
            <div className="flex items-center justify-center gap-4 bg-gray-50 dark:bg-gray-800 rounded-2xl p-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
                className={cn(
                  "w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-200 touch-manipulation",
                  quantity <= 1
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl active:scale-95"
                )}
              >
                <Minus className="w-5 h-5" />
              </button>
              
              <div className="flex flex-col items-center min-w-[60px]">
                <span className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {quantity}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {quantity === 1 ? "item" : "items"}
                </span>
              </div>
              
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 touch-manipulation"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Special Instructions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                Special Instructions
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                Optional
              </span>
            </div>
            <div className="relative">
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                placeholder="E.g., Extra spicy, no onions, well done..."
                maxLength={maxInstructionsLength}
                className="w-full min-h-[80px] resize-none bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-orange-500 dark:focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl p-3 text-gray-900 dark:text-gray-100 text-sm transition-all duration-200"
              />
              <div className="absolute bottom-2 right-2">
                <span className={cn(
                  "text-xs font-medium px-2 py-1 rounded-full transition-colors",
                  specialInstructions.length > maxInstructionsLength * 0.8
                    ? "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                )}>
                  {specialInstructions.length}/{maxInstructionsLength}
                </span>
              </div>
            </div>
          </div>

          {/* Price Summary */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-3 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Item Price
              </span>
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                ₦{itemPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Quantity
              </span>
              <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                × {quantity}
              </span>
            </div>
            <div className="border-t border-orange-200 dark:border-orange-800 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Total
                </span>
                <span className="text-xl font-bold text-orange-600 dark:text-orange-400">
                  ₦{totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            className={cn(
              "w-full py-4 text-base font-bold rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl active:scale-95 touch-manipulation group",
              item.category === "veg"
                ? "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                : "bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 hover:from-orange-600 hover:via-orange-700 hover:to-red-600 text-white"
            )}
            aria-label={`Add ${item.name} to cart`}
          >
            <span className="flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5 group-hover:animate-bounce" />
              <span>Add to Cart</span>
              <span className="opacity-75">•</span>
              <span className="font-extrabold">₦{totalPrice.toLocaleString()}</span>
            </span>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCartModal;










