"use client";
import React, { useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/state/store";
import {
  fetchBookedOrderById,
  cancelBookedOrder,
} from "@/state/bookedOrdersSlice";
import { branches } from "../../../../data/branches";
import {
  CheckCircle,
  MapPin,
  CreditCard,
  Landmark,
  Truck,
  XCircle,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { client, validateEnv, fileUrl } from "@/utils/appwrite";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { usePayment } from "@/context/paymentContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { listAsyncFeaturedItems } from "@/state/featuredSlice";
import { listAsyncMenusItem } from "@/state/menuSlice";
import { listAsyncPopularItems } from "@/state/popularSlice";
import { motion, AnimatePresence } from "framer-motion";
import {
  sendOrderCancellationSMS,
  sendOrderCancellationAdminSMS,
} from "@/utils/smsService";
import toast from "react-hot-toast";

const rideExLogo = "/images/ridex_logo.jpg";

const statusSteps = [
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
];

function getStatusIndex(status: string) {
  return statusSteps.findIndex((s) => s.key === status) !== -1
    ? statusSteps.findIndex((s) => s.key === status)
    : 0;
}

export default function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { currentOrder, loading, error } = useSelector(
    (state: RootState) => state.bookedOrders
  );

  const menuItems = useSelector((state: RootState) => state.menuItem.menuItems);
  const featuredItems = useSelector(
    (state: RootState) => state.featuredItem.featuredItems
  );
  const popularItems = useSelector(
    (state: RootState) => state.popularItem.popularItems
  );

  const { payWithPaystack, paying, paymentError } = usePayment();
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [showItems, setShowItems] = React.useState(false);
  const [visibleCount, setVisibleCount] = React.useState(4);

  // Helper to find item by id
  const findItemById = (id: string) => {
    return (
      menuItems.find((item) => item.$id === id) ||
      featuredItems.find((item) => item.$id === id) ||
      popularItems.find((item) => item.$id === id)
    );
  };

  useEffect(() => {
    if (orderId) {
      dispatch(fetchBookedOrderById(orderId));
      dispatch(listAsyncFeaturedItems());
      dispatch(listAsyncMenusItem());
      dispatch(listAsyncPopularItems());
    }
  }, [orderId, dispatch]);

  // Real-time listener for order updates
  useEffect(() => {
    if (!orderId) return;
    const { bookedOrdersCollectionId, databaseId } = validateEnv();
    const channel = `databases.${databaseId}.collections.${bookedOrdersCollectionId}.documents.${orderId}`;
    const unsubscribe = client.subscribe(channel, (response: any) => {
      if (
        response.events.includes("databases.*.collections.*.documents.*.update")
      ) {
        dispatch(fetchBookedOrderById(orderId));
      }
    });
    return () => {
      unsubscribe();
    };
  }, [orderId, dispatch]);

  const branch = currentOrder
    ? branches.find((b) => b.id === currentOrder.selectedBranchId)
    : null;
  const statusIdx = currentOrder ? getStatusIndex(currentOrder.status) : 0;

  // Only show cancel if status is pending, confirmed, or preparing
  const canCancel =
    currentOrder &&
    ["pending", "confirmed", "preparing"].includes(currentOrder.status);

  const handleCancelOrder = async () => {
    if (currentOrder) {
      try {
        // Cancel the order
        await dispatch(cancelBookedOrder(currentOrder.$id));

        // Send SMS notifications
        const userSmsPromise = sendOrderCancellationSMS(
          currentOrder.orderId,
          currentOrder.phone
        );

        const adminSmsPromise = sendOrderCancellationAdminSMS(
          currentOrder.orderId,
          currentOrder.customerId, // Using customerId as userName for now
          currentOrder.phone
        );

        // Send both SMS notifications
        const [userSmsSent, adminSmsSent] = await Promise.all([
          userSmsPromise,
          adminSmsPromise,
        ]);

        if (userSmsSent && adminSmsSent) {
          toast.success("Order cancelled successfully and notifications sent");
        } else if (userSmsSent) {
          toast.success("Order cancelled successfully");
          toast.error("Failed to send admin notification");
        } else {
          toast.success("Order cancelled successfully");
          toast.error("Failed to send SMS notifications");
        }

        router.push("/myorders");
      } catch (error) {
        toast.error("Failed to cancel order");
        console.error("Error cancelling order:", error);
      }
    }
  };

  const handlePayNow = () => {
    if (!currentOrder) return;
    payWithPaystack({
      email:
        currentOrder.customerEmail || currentOrder.email || "user@example.com",
      amount: currentOrder.total,
      reference: currentOrder.orderId || currentOrder.$id,
      orderId: currentOrder.$id,
      onSuccess: () => {
        // Optionally redirect or show a toast
        router.push("/myorders");
      },
      onClose: () => {},
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <span className="ml-3 text-lg font-semibold text-orange-600">
          Loading order details...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <XCircle className="w-8 h-8 text-red-500" />
        <span className="ml-3 text-lg font-semibold text-red-600">{error}</span>
      </div>
    );
  }

  if (!currentOrder || !branch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <XCircle className="w-8 h-8 text-gray-400" />
        <span className="ml-3 text-lg font-semibold text-gray-700 dark:text-gray-200">
          Order not found.
        </span>
      </div>
    );
  }

  if (currentOrder.status === "cancelled") {
    return (
      <div className="min-h-screen  flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4 py-6">
        <div className="max-w-md w-full mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 text-center border border-red-200 dark:border-red-900/40">
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900">
              <XCircle className="w-16 h-16 text-red-500" />
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">
            Order Cancelled
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            We're sorry, this order has been cancelled. This might be due to
            delivery distance or other issues. For more details, please contact
            support.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => router.push("/menu")}
              className="w-full sm:flex-1 h-14 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-lg transition"
            >
              Place a New Order
            </Button>
            <Button
              onClick={() => router.push("/myorders")}
              variant="outline"
              className="w-full sm:flex-1 h-14 border-2 border-orange-500 text-orange-600 font-bold rounded-xl text-lg transition hover:bg-orange-50 dark:hover:bg-orange-900/30"
            >
              View My Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Get itemIds from currentOrder (fallback to empty array if not present)
  const itemIds: string[] = (currentOrder as any).itemIds || [];


  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-2 py-6">
      <div className="max-w-md w-full mx-auto relative">
        {/* RideEx Logo Watermark */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-10 opacity-80">
          <Image
            src={rideExLogo}
            alt="RideEx Logo"
            width={60}
            height={60}
            className="rounded-full shadow-md"
          />
        </div>
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mb-6 border border-orange-100 dark:border-orange-900/40 relative overflow-hidden">
          {/* Status Progress Bar */}
          <div className="flex items-start justify-between mb-8 px-2">
            {statusSteps.map((step, idx) => (
              <React.Fragment key={step.key}>
                <div className="flex flex-col items-center text-center w-[60px]">
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      idx <= statusIdx
                        ? "bg-orange-500 border-orange-500 text-white"
                        : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
                    }`}
                  >
                    {idx < statusIdx ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : idx === statusIdx ? (
                      <motion.div
                        className="w-4 h-4 rounded-full bg-orange-500 dark:bg-orange-400"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-600" />
                    )}
                  </div>
                  <p
                    className={`mt-2 text-xs font-semibold ${
                      idx <= statusIdx
                        ? "text-orange-600 dark:text-orange-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {step.label}
                  </p>
                </div>
                {idx < statusSteps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mt-5 ${
                      idx < statusIdx
                        ? "bg-orange-500"
                        : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  ></div>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Order Info Section */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Order ID:</span>
              <span className="text-lg font-bold text-blue-600">
                #{currentOrder.orderId}
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-1">
              {new Date(currentOrder.createdAt).toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-gray-800 dark:text-gray-100">
                Delivery
              </span>
            </div>
          </div>
          {/* Delivery Estimate */}
          <div className="mb-4 flex flex-col items-center">
            <span className="block text-gray-500 text-sm mb-1">
              Estimated delivery time
            </span>
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
              {currentOrder.deliveryDuration || "40 min"}
            </span>
          </div>
          {/* Confirmation Icon */}
          <div className="flex justify-center my-6">
            <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900">
              <CheckCircle className="w-16 h-16 text-orange-500" />
            </span>
          </div>
          {/* Branch & Payment Info */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-gray-900 dark:text-white">
                {branch.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {currentOrder.paymentMethod === "card" ? (
                <CreditCard className="w-4 h-4 text-orange-500" />
              ) : (
                <Landmark className="w-4 h-4 text-orange-500" />
              )}
              <span className="font-semibold text-orange-600 capitalize">
                {currentOrder.paymentMethod.replace(/_/g, " ")}
              </span>
            </div>
            <div className="text-xs text-gray-500 ml-6">{branch.address}</div>
          </div>
          {/* Order Summary (if available) */}
          {/* You can expand this with items, total, etc. if you have that data */}
          <div className="flex flex-col gap-1 mb-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">
                Delivery Fee
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                ₦{currentOrder.deliveryFee?.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>₦{currentOrder.total?.toLocaleString()}</span>
            </div>
          </div>
          {/* Thank you message */}
          <div className="text-center text-gray-700 dark:text-gray-200 mb-4">
            Got your order! Thank you for choosing{" "}
            <span className="font-bold text-orange-600">RideEx</span>.
          </div>
          {/* Order Items Accordion */}
          {itemIds.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2 text-orange-600">
                Order Items
              </h3>
              {!showItems ? (
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-lg transition text-center mb-2"
                  onClick={() => setShowItems(true)}
                >
                  View Items
                </Button>
              ) : (
                <>
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Accordion type="multiple">
                        {itemIds.slice(0, visibleCount).map((id, idx) => {
                          const item = findItemById(id);
                          return (
                            <AccordionItem
                              key={id}
                              value={id}
                              className="border-b border-orange-100 dark:border-orange-900/40"
                            >
                              <AccordionTrigger>
                                <div className="flex items-center gap-3">
                                  {item && item.image ? (
                                    <Image
                                      src={
                                        fileUrl(
                                          validateEnv().featuredBucketId,
                                          item.image
                                        ) ||
                                        fileUrl(
                                          validateEnv().popularBucketId,
                                          item.image
                                        ) ||
                                        fileUrl(
                                          validateEnv().menuBucketId,
                                          item.image
                                        )
                                      }
                                      alt={item.name}
                                      width={50}
                                      height={50}
                                      className="rounded object-cover w-10 h-10"
                                      quality={100}
                                      loading="lazy"
                                    />
                                  ) : (
                                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400">
                                      ?
                                    </div>
                                  )}
                                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                                    {item ? item.name : `Item ${id}`}
                                  </span>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent>
                                {item ? (
                                  <div className="p-2">
                                    <div className="text-sm text-gray-700 dark:text-gray-200 mb-1">
                                      {item.description ||
                                        "No description available."}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="font-bold text-orange-600">
                                        ₦{item.price}
                                      </span>
                                      {item.category && (
                                        <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-2 py-0.5 rounded text-xs">
                                          {item.category}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <div className="p-2 text-gray-400">
                                    Item details not found.
                                  </div>
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          );
                        })}
                      </Accordion>
                      <div className="flex gap-2 mt-4">
                        {visibleCount < itemIds.length && (
                          <Button
                            size="sm"
                            className="flex-1"
                            variant="outline"
                            onClick={() => setVisibleCount((c) => c + 4)}
                          >
                            Show More
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="flex-1"
                          variant="outline"
                          onClick={() => {
                            setShowItems(false);
                            setVisibleCount(4);
                          }}
                        >
                          Close Items
                        </Button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </>
              )}
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-6">
            {currentOrder && currentOrder.paymentMethod !== "cash" && (
              <Button
              style={{display:currentOrder.paid ? "none" : "block"}}
                className="w-full sm:flex-1 h-14 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-lg transition text-center"
                onClick={handlePayNow}
                disabled={paying}
              >
                {paying ? "Processing Payment..." : "Pay Now"}
              </Button>
            )}
            {currentOrder && canCancel && (
              <Button
                onClick={() => setCancelDialogOpen(true)}
                className="w-full sm:flex-1 h-14 flex items-center justify-center border-2 border-orange-500 text-orange-600 font-bold rounded-xl text-lg transition hover:bg-orange-50 dark:hover:bg-orange-900/30 text-center"
                variant="outline"
              >
                Cancel Order
              </Button>
            )}
          </div>
          {paymentError && (
            <div className="mt-4 text-red-500 text-sm">{paymentError}</div>
          )}
        </div>
        {/* Cancel Confirmation Dialog */}
        {currentOrder && (
          <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogContent className="dark:bg-gray-900">
              <DialogHeader>
                <DialogTitle className="dark:text-gray-100">
                  Cancel Order
                </DialogTitle>
              </DialogHeader>
              <DialogDescription className="dark:text-gray-300">
                {currentOrder.status === "preparing" ? (
                  <span className="text-orange-600 dark:text-orange-300 font-medium">
                    The restaurant may have already started preparing your food.
                    Cancelling now may not always be possible or may incur a
                    fee. Are you sure you want to cancel?
                  </span>
                ) : (
                  "Are you sure you want to cancel this order?"
                )}
              </DialogDescription>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">No, Go Back</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleCancelOrder}>
                  Yes, Cancel Order
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
} 