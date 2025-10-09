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
import { Minus, Plus, Info, ShoppingCart } from "lucide-react";
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

  // Get user and guestUser from Redux
  const user = useSelector((state: RootState) => state.auth.user);
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
        source: item.source, // Ensure source is included
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
          "sm:max-w-md md:max-w-lg lg:max-w-xl bg-orange-50 dark:bg-gray-900 border-orange-200 dark:border-gray-700 p-0 overflow-hidden rounded-2xl shadow-lg",
          "animate-in fade-in-50 slide-in-from-bottom-10 duration-300"
        )}
        aria-describedby="dialog-description"
      >
        <DialogHeader className="relative bg-gradient-to-r from-orange-500 to-red-500 p-4 sm:p-6 pb-4">
          <DialogTitle className="sr-only">Add {item.name} to Cart</DialogTitle>
          <DialogDescription id="dialog-description" className="sr-only">
            Customize your order for {item.name}. Adjust quantity and add
            special instructions.
          </DialogDescription>
          <div className="flex items-start space-x-3 sm:space-x-4">
            {/* Larger Image for Mobile */}
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-orange-200 dark:bg-orange-800 rounded-xl overflow-hidden flex-shrink-0 group">
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
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                width={96}
                height={96}
                sizes="(max-width: 640px) 80px, 96px"
                quality={100}
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg sm:text-2xl font-bold text-white mb-2 tracking-tight line-clamp-2">
                {item.name === "Jollof" ? "African Jollof" : item.name}
              </DialogTitle>
              <p className="text-orange-100 text-sm leading-relaxed line-clamp-2 mb-3">
                {item.description || "Delicious and freshly prepared item."}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-2xl font-semibold text-white">
                  ₦{itemPrice.toLocaleString()}
                </span>
                <Info className="w-4 h-4 text-orange-200" aria-hidden="true" />
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Customize your order and add it to your cart
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Quantity
              </h3>
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-orange-200 dark:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors touch-manipulation"
                >
                  <Minus className="w-5 h-5 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400" />
                </button>
                <span className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100 min-w-[3rem] sm:min-w-[2.5rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-12 h-12 sm:w-10 sm:h-10 flex items-center justify-center rounded-full border-2 border-orange-200 dark:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors touch-manipulation"
                >
                  <Plus className="w-5 h-5 sm:w-4 sm:h-4 text-orange-600 dark:text-orange-400" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
                Special Instructions
              </h3>
              <div className="relative">
                <textarea
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Any special requests? (optional)"
                  maxLength={maxInstructionsLength}
                  className="min-h-[100px] sm:min-h-[120px] resize-none bg-white dark:bg-gray-700 border-orange-200 dark:border-orange-600 focus:border-orange-400 dark:focus:border-orange-500 focus:ring-orange-400 dark:focus:ring-orange-500 placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-xl p-3 w-full text-gray-900 dark:text-gray-100 text-sm"
                />
                <span className="absolute bottom-2 right-2 text-xs text-gray-400 dark:text-gray-500">
                  {specialInstructions.length}/{maxInstructionsLength}
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            <span className="absolute inset-0 bg-white/20 dark:bg-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <Button
              onClick={handleAddToCart}
              className={cn(
                "w-full py-3 sm:py-4 text-base sm:text-lg font-semibold rounded-xl transition-all duration-300 relative overflow-hidden group touch-manipulation",
                item.category === "veg"
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              )}
              aria-label={`Add ${item.name} to cart`}
            >
              <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Add to Cart - ₦{totalPrice.toLocaleString()}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCartModal;