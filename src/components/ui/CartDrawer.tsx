"use client"
import React, { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, ShoppingCart, Loader2 } from "lucide-react";
import Image from "next/image";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(false); // Local loading state for async actions
  const [error, setError] = useState<string | null>(null); // Local error state
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Amala, Gbegiri And Ewedu & Assorted",
      price: 8000,
      quantity: 1,
      image: "/api/placeholder/60/60",
      instruction: "Good one at that",
    },
    {
      id: 2,
      name: "Fayrouz",
      price: 1200,
      quantity: 2,
      image: "/api/placeholder/60/60",
    },
  ]);

  const updateQuantity = async (id: number, change: number) => {
    setLoading(true);
    setError(null);
    try {
      setCartItems((items) =>
        items
          .map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(0, item.quantity + change) }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
      const item = cartItems.find((item) => item.id === id);
      toast.success(`${item?.name} ${change > 0 ? "added" : "removed"}`, {
        duration: 3000,
        position: "top-right",
      });
    } catch (err) {
      setError("Failed to update quantity");
      toast.error("Failed to update quantity", {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      // Simulate async checkout (replace with your API call)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCartItems([]);
      toast.success("Checkout successful!", {
        duration: 3000,
        position: "top-right",
      });
      setIsOpen(false);
    } catch (err) {
      setError("Failed to checkout");
      toast.error("Checkout failed", {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="p-4">
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
        disabled={loading}
        aria-label={`View cart with ${cartItems.length} items`}
      >
        <ShoppingCart size={20} />
        View Cart ({cartItems.length})
      </Button>

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <DrawerContent className="bg-gray-50 rounded-t-3xl max-w-md mx-auto h-[80vh] flex flex-col">
          <DrawerHeader className="border-b bg-white p-4">
            <DrawerTitle className="text-2xl font-bold text-gray-800">
              My Cart
            </DrawerTitle>
            <DrawerDescription className="sr-only">
              View and manage items in your cart
            </DrawerDescription>
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 w-8 h-8 bg-orange-500 rounded-full text-white hover:bg-orange-600"
                aria-label="Close cart"
              >
                <X size={18} />
              </Button>
            </DrawerClose>
          </DrawerHeader>

          <div className="px-4 py-3 bg-white border-b">
            <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-center font-medium inline-block">
              Delivery
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading && !cartItems.length && (
              <div className="text-center">
                <Loader2 className="animate-spin h-8 w-8 text-orange-500 mx-auto" />
                <p className="text-gray-600 mt-2">Loading cart...</p>
              </div>
            )}
            {error && (
              <p
                className="text-red-500 text-center animate-shake"
                role="alert"
              >
                {error}
              </p>
            )}
            {!loading && cartItems.length === 0 && (
              <p className="text-gray-600 text-center">Your cart is empty</p>
            )}
            {cartItems.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "bg-white rounded-lg p-4 shadow-sm transition-all duration-200",
                  loading && "opacity-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      width={64}
                      height={64}
                      sizes="64px"
                      quality={85}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800 mb-1">
                      {item.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900">
                      ₦{item.price.toLocaleString()}
                    </p>
                    {item.instruction && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Instruction:</span>{" "}
                        {item.instruction}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-8 h-8 bg-gray-100 rounded-full hover:bg-gray-200"
                      disabled={loading || item.quantity <= 0}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <Minus size={16} className="text-gray-600" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-8 h-8 bg-orange-500 rounded-full text-white hover:bg-orange-600"
                      disabled={loading}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <Plus size={16} className="text-white" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <DrawerFooter className="p-4 bg-white border-t">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-gray-700">
                Subtotal
              </span>
              <span className="text-xl font-bold text-green-600">
                ₦{subtotal.toLocaleString()}
              </span>
            </div>
            <Button
              onClick={handleCheckout}
              className={cn(
                "w-full py-4 text-lg font-medium rounded-lg transition-all duration-200",
                "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white",
                loading && "opacity-50 cursor-not-allowed"
              )}
              disabled={loading || cartItems.length === 0}
              aria-label="Proceed to checkout"
            >
              {loading ? (
                <span className="flex items-center">
                  <Loader2 className="animate-spin mr-2 h-5 w-5 text-white" />
                  Processing...
                </span>
              ) : (
                "Proceed To Checkout"
              )}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default CartDrawer;
