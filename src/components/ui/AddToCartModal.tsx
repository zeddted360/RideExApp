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
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { cn } from "@/lib/utils";
import { useShowCart } from "@/context/showCart";
import { ICartItemOrder } from "../../../types/types";
import { createOrderAsync, resetOrders } from "@/state/orderSlice";
import { AppDispatch, RootState } from "@/state/store";

const AddToCartModal = () => {
  const { isOpen, setIsOpen, item } = useShowCart();
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error } = useSelector((state: RootState) => state.orders);
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
    const newItem: ICartItemOrder = {
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
    };

    try {
      await dispatch(createOrderAsync(newItem)).unwrap();
      toast.success(`${newItem.name} added to cart!`, {
        duration: 3000,
        position: "top-right",
      });
      setIsOpen(false);
    } catch (err) {
      toast.error(`Failed to add ${newItem.name} to cart`, {
        duration: 4000,
        position: "top-right",
      });
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
                src={item.image} 
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                width={96}
                height={96}
                sizes="96px"
                quality={85}
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
                disabled={quantity <= 1 || loading}
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
                disabled={loading}
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
                disabled={loading}
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
                : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white",
              loading && "opacity-50 cursor-not-allowed"
            )}
            disabled={loading}
            aria-label={`Add ${item.name} to cart`}
          >
            <span className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            {loading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Adding...
              </span>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart - ₦{totalPrice.toLocaleString()}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToCartModal;
