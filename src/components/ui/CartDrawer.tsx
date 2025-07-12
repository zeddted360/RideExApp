"use client";
import React, { useEffect, useCallback, useMemo, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Plus, Minus, ShoppingCart, Loader2, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { debounce } from "lodash";
import { cn } from "@/lib/utils";
import { useShowCart } from "@/context/showCart";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/state/store";
import {
  fetchOrdersByUserIdAsync,
  updateOrderAsync,
  deleteOrderAsync,
  updateQuantity,
  deleteOrder,
  addOrder,
} from "@/state/orderSlice";
import { ICartItemFetched } from "../../../types/types";
import { fileUrl, validateEnv } from "@/utils/appwrite";

const CartDrawer = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading, orders } = useSelector(
    (state: RootState) => state.orders
  );
  const { activeCart, setActiveCart } = useShowCart();
  const userId = "zedd"; // Replace with actual logged-in user ID
  const [showEmptyCartDialog, setShowEmptyCartDialog] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  // Fetch orders on mount or when userId changes
  useEffect(() => {
    if (userId && !orders && !loading) {
      dispatch(fetchOrdersByUserIdAsync(userId))
        .unwrap()
        .catch((err) => {
          toast.error(err || "Failed to fetch orders", {
            duration: 4000,
            position: "top-right",
          });
        });
    }
  }, [dispatch, userId, orders, loading]);

  // Show dialog when cart is empty after fetching
  useEffect(() => {
    if (!loading && (!orders || orders.length === 0) && activeCart) {
      setShowEmptyCartDialog(true);
    } else {
      setShowEmptyCartDialog(false);
    }
  }, [orders, loading, activeCart]);

  // Memoized update quantity handler with debounced optimistic update
  const handleUpdateQuantity = useCallback(
    debounce(async (order: ICartItemFetched, change: number) => {
      const newQuantity = Math.max(0, order.quantity + change);
      const newTotalPrice =
        (typeof order.price === "string"
          ? Number(order.price.replace(/[₦,]/g, ""))
          : order.price) * newQuantity;

      // Optimistic update
      dispatch(updateQuantity({ orderId: order.$id, change }));

      if (newQuantity === 0) {
        // Delete order if quantity reaches 0
        try {
          await dispatch(deleteOrderAsync(order.$id)).unwrap();
        } catch (err) {
          toast.error("Failed to remove item", {
            duration: 4000,
            position: "top-right",
          });
          // Revert optimistic update
          dispatch(updateQuantity({ orderId: order.$id, change: -change }));
        }
      } else {
        // Update order quantity and totalPrice
        try {
          await dispatch(
            updateOrderAsync({
              orderId: order.$id,
              orderData: { quantity: newQuantity, totalPrice: newTotalPrice },
            })
          ).unwrap();
        } catch (err) {
          toast.error("Failed to update quantity", {
            duration: 4000,
            position: "top-right",
          });
          // Revert optimistic update
          dispatch(updateQuantity({ orderId: order.$id, change: -change }));
        }
      }
    }, 300),
    [dispatch]
  );

  // Memoized delete handler with debounced optimistic update
  const handleDeleteOrder = useCallback(
    debounce(async (order: ICartItemFetched) => {
      // Optimistic delete
      dispatch(deleteOrder(order.$id));

      try {
        await dispatch(deleteOrderAsync(order.$id)).unwrap();
      } catch (err) {
        toast.error("Failed to delete item", {
          duration: 4000,
          position: "top-right",
        });
        // Revert optimistic delete
        dispatch(addOrder(order));
      }
    }, 300),
    [dispatch]
  );

  // Memoized checkout handler
  const handleCheckout = useCallback(async () => {
    setIsCheckingOut(true);
    try {
      // Placeholder: Simulate async checkout
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // Clear orders
      await Promise.all(
        orders?.map((order) =>
          dispatch(deleteOrderAsync(order.$id)).unwrap()
        ) || []
      );
      toast.success("Checkout successful!", {
        duration: 3000,
        position: "top-right",
      });
      setActiveCart(false);
      // Refetch orders to ensure state is in sync
      await dispatch(fetchOrdersByUserIdAsync(userId)).unwrap();
    } catch (err) {
      toast.error("Checkout failed", {
        duration: 4000,
        position: "top-right",
      });
    } finally {
      setIsCheckingOut(false);
    }
  }, [dispatch, orders, setActiveCart, userId]);

  // Memoized subtotal calculation using totalPrice
  const subtotal = useMemo(
    () => orders?.reduce((sum, item) => sum + (item.totalPrice || 0), 0) || 0,
    [orders]
  );

  return (
    <div className="p-4">
      <Button
        onClick={() => setActiveCart(true)}
        className="bg-orange-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-orange-600 transition-colors"
        disabled={loading}
        aria-label={`View cart with ${orders?.length || 0} items`}
      >
        <ShoppingCart size={20} />
        View Cart ({orders?.length || 0})
      </Button>

      <Drawer open={activeCart} onOpenChange={setActiveCart}>
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
            {loading && !orders?.length && (
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
            {orders?.map((item) => (
              <div
                key={item.$id}
                className={cn(
                  "bg-white rounded-lg p-4 shadow-sm transition-all duration-200",
                  loading && "opacity-50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center overflow-hidden">
                    <Image
                      src={fileUrl(
                        item.source === "featured"
                          ? validateEnv().featuredBucketId
                          : item.source === "popular"
                          ? validateEnv().popularBucketId
                          : validateEnv().menuBucketId,
                        item.image
                      )}
                      alt={item.name || "Item"}
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
                      {item.name || "Unknown Item"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Price:</span> ₦
                      {(typeof item.price === "string"
                        ? Number(item.price.replace(/[₦,]/g, ""))
                        : item.price
                      ).toLocaleString()}{" "}
                      x {item.quantity}
                    </p>
                    <p className="text-lg font-bold text-gray-900 mt-1">
                      Total: ₦{item.totalPrice.toLocaleString()}
                    </p>
                    {item.specialInstructions && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Instruction:</span>{" "}
                        {item.specialInstructions}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleUpdateQuantity(item, -1)}
                      className="w-8 h-8 bg-gray-100 rounded-full hover:bg-gray-200"
                      disabled={loading || item.quantity <= 0}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <Minus size={16} className="text-gray-600" />
                    </Button>
                    <span className="w-8 text-center font-medium">
                      {item.quantity || 0}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleUpdateQuantity(item, 1)}
                      className="w-8 h-8 bg-orange-500 rounded-full text-white hover:bg-orange-600"
                      disabled={loading}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <Plus size={16} className="text-white" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteOrder(item)}
                      className="w-8 h-8 bg-red-500 rounded-full text-white hover:bg-red-600"
                      disabled={loading}
                      aria-label={`Delete ${item.name} from cart`}
                    >
                      <Trash2 size={16} className="text-white" />
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
              onClick={() => {
                setActiveCart(false);
                router.push("/checkout");
              }}
              className={cn(
                "w-full py-4 text-lg font-medium rounded-lg transition-all duration-200",
                "bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white",
                isCheckingOut && "opacity-50 cursor-not-allowed"
              )}
              disabled={!orders || orders.length === 0}
              aria-label="Proceed to checkout"
            >
              Proceed To Checkout
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <Dialog open={showEmptyCartDialog} onOpenChange={setShowEmptyCartDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Cart is Empty</DialogTitle>
            <DialogDescription>
              It looks like you haven't added any items to your cart yet. Add
              some delicious items to proceed!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setShowEmptyCartDialog(false);
                setActiveCart(!activeCart);
                router.push("/menu");
              }}
              className="bg-orange-500 text-white hover:bg-orange-600"
            >
              Browse Items
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CartDrawer;
