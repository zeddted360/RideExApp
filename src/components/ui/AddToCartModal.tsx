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
import { Textarea } from "@/components/ui/textarea";
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

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

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
        userId: item.userId,
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
          "sm:max-w-md md:max-w-lg bg-orange-50 border-orange-200 p-0 overflow-hidden rounded-2xl shadow-lg",
          "animate-in fade-in-50 slide-in-from-bottom-10 duration-300"
        )}
        aria-describedby="dialog-description"
      >
        <DialogHeader className="relative bg-gradient-to-r from-orange-500 to-red-500 p-6 pb-4">
          <DialogTitle className="sr-only">Add {item.name} to Cart</DialogTitle>
          <DialogDescription id="dialog-description" className="sr-only">
            Customize your order for {item.name}. Adjust quantity and add
            special instructions.
          </DialogDescription>
          <div className="flex items-start space-x-4">
            <div className="relative w-24 h-24 bg-orange-200 rounded-xl overflow-hidden flex-shrink-0 group">
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
                sizes="96px"
                quality={100}
                loading="lazy"
              />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-white mb-2 tracking-tight">
                {item.name === "Jollof" ? "African Jollof" : item.name}
              </DialogTitle>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-semibold text-white">
                  ₦{itemPrice.toLocaleString()}
                </span>
                <Info className="w-4 h-4 text-orange-200" aria-hidden="true" />
              </div>
            </div>
          </div>
        </DialogHeader>
        <div className="px-6 py-6 space-y-6 bg-white/90 backdrop-blur-sm">
          {item.name === "Jollof" && (
            <p className="text-sm text-gray-600 leading-relaxed">
              A vibrant West African rice dish cooked in a spicy tomato-based
              sauce with onions, peppers, and spices like thyme and chili.
            </p>
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Quantity
            </h3>
            <div className="flex items-center space-x-4">
              <Button
                onClick={decreaseQuantity}
                variant="outline"
                size="icon"
                className={cn(
                  "w-12 h-12 rounded-full border-2 border-orange-300 hover:bg-orange-100 transition-all duration-200",
                  quantity <= 1
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105"
                )}
                disabled={quantity <= 1}
                aria-label="Decrease quantity"
              >
                <Minus className="w-6 h-6 text-orange-600" />
              </Button>
              <span className="text-2xl font-semibold text-gray-900 min-w-[2.5rem] text-center">
                {quantity}
              </span>
              <Button
                onClick={increaseQuantity}
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full border-2 border-orange-300 hover:bg-orange-100 hover:scale-105 transition-all duration-200"
                aria-label="Increase quantity"
              >
                <Plus className="w-6 h-6 text-orange-600" />
              </Button>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Special Instructions
            </h3>
            <div className="relative">
              <Textarea
                placeholder="Add note (e.g., extra spice, no onions)"
                value={specialInstructions}
                onChange={(e) =>
                  setSpecialInstructions(
                    e.target.value.slice(0, maxInstructionsLength)
                  )
                }
                className="min-h-[120px] resize-none bg-white border-orange-200 focus:border-orange-400 focus:ring-orange-400 placeholder:text-gray-400 rounded-xl"
                aria-label="Special instructions"
              />
              <span className="absolute bottom-2 right-2 text-xs text-gray-400">
                {specialInstructions.length}/{maxInstructionsLength}
              </span>
            </div>
          </div>
          {error && (
            <p className="text-red-500 text-sm text-center" role="alert">
              {error}
            </p>
          )}
          <Button
            onClick={handleAddToCart}
            className={cn(
              "w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 relative overflow-hidden group",
              item.category === "veg"
                ? "bg-green-500 hover:bg-green-600 text-white"
                : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            )}
            aria-label={`Add ${item.name} to cart`}
          >
            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <ShoppingCart className="w-5 h-5 mr-2" />
            Add to Cart - ₦{totalPrice.toLocaleString()}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCartModal;
