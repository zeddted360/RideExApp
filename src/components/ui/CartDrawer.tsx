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
import {
  X,
  Plus,
  Minus,
  ShoppingCart,
  Loader2,
  Trash2,
  Eye,
} from "lucide-react";
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

  // Check if there are items in cart
  const hasCartItems = orders && orders.length > 0;

  return (
    <div className="p-4">
      {/* Floating View Cart Button - Show on all devices when there are items */}
      {/* Temporarily show button for testing */}
      <div className="fixed bottom-6 right-6 z-40">
        <Button
          onClick={() => setActiveCart(true)}
          className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white rounded-full px-4 py-3 lg:px-6 shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
          aria-label="View cart items"
        >
          <Eye className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="font-medium hidden sm:inline">View Cart Items</span>
          <span className="bg-white/20 rounded-full px-2 py-1 text-xs font-bold">
            {orders?.length || 0}
          </span>
        </Button>
      </div>

      <Drawer open={activeCart} onOpenChange={setActiveCart}>
        <DrawerContent className="bg-gray-50 dark:bg-gray-900 rounded-t-3xl max-w-md mx-auto h-[80vh] flex flex-col">
          <DrawerHeader className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <DrawerTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
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

          <div className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <span className="bg-blue-500 text-white px-4 py-2 rounded-full text-center font-medium inline-block">
              Delivery
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loading && !orders?.length && (
              <div className="text-center">
                <Loader2 className="animate-spin h-8 w-8 text-orange-500 mx-auto" />
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Loading cart...
                </p>
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
                  "bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm transition-all duration-200 border border-gray-200 dark:border-gray-700",
                  loading && "opacity-50"
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Larger Image Container */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
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
                      width={96}
                      height={96}
                      sizes="(max-width: 640px) 80px, 96px"
                      quality={85}
                      loading="lazy"
                    />
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-800 dark:text-gray-100 mb-1 text-sm sm:text-base">
                      {item.name || "Unknown Item"}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                      <span className="font-medium">Price:</span> ₦
                      {(typeof item.price === "string"
                        ? Number(item.price.replace(/[₦,]/g, ""))
                        : item.price
                      ).toLocaleString()}{" "}
                      x {item.quantity}
                    </p>
                    <p className="text-base sm:text-lg font-bold text-gray-900 dark:text-gray-100">
                      Total: ₦{item.totalPrice.toLocaleString()}
                    </p>
                    {item.specialInstructions && (
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">
                        <span className="font-medium">Instruction:</span>{" "}
                        {item.specialInstructions}
                      </p>
                    )}
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleUpdateQuantity(item, -1)}
                      className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600"
                      disabled={loading || item.quantity <= 0}
                      aria-label={`Decrease quantity of ${item.name}`}
                    >
                      <Minus
                        size={16}
                        className="text-gray-600 dark:text-gray-300"
                      />
                    </Button>
                    <span className="w-8 text-center font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {item.quantity || 0}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleUpdateQuantity(item, 1)}
                      className="w-8 h-8 bg-orange-500 rounded-full text-white hover:bg-orange-600 border-orange-500"
                      disabled={loading}
                      aria-label={`Increase quantity of ${item.name}`}
                    >
                      <Plus size={16} className="text-white" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDeleteOrder(item)}
                      className="w-8 h-8 bg-red-500 rounded-full text-white hover:bg-red-600 border-red-500"
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

          <DrawerFooter className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Subtotal
              </span>
              <span className="text-xl font-bold text-green-600 dark:text-green-400">
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
