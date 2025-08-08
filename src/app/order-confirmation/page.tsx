"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/state/store";
import { fetchBookedOrdersByUserId } from "@/state/bookedOrdersSlice";
import { branches } from "../../../data/branches";
import { useRouter } from "next/navigation";
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
import { cancelBookedOrder } from "@/state/bookedOrdersSlice";
import {
  sendOrderCancellationSMS,
  sendOrderCancellationAdminSMS,
} from "@/utils/smsService";
import toast from "react-hot-toast";

export default function OrderConfirmation() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.bookedOrders
  );
  const { payWithPaystack, paying, paymentError } = usePayment();
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);

  // Fetch booked orders for the current user on mount
  useEffect(() => {
    if (user?.userId) {
      dispatch(fetchBookedOrdersByUserId(user.userId));
    }
  }, [user?.userId, dispatch]);

  // Get the latest order (assuming orders are sorted by createdAt desc)
  const latestOrder = orders && orders.length > 0 ? orders[0] : null;
  const branch = latestOrder
    ? branches.find((b) => b.id === latestOrder.selectedBranchId)
    : null;

  // Only show cancel if status is pending, confirmed, or preparing
  const canCancel =
    latestOrder &&
    ["pending", "confirmed", "preparing"].includes(latestOrder.status);

  const handlePayNow = () => {
    if (!latestOrder) return;
    payWithPaystack({
      email:
        latestOrder.customerEmail ||
        latestOrder.email ||
        user?.email ||
        "user@example.com",
      amount: latestOrder.total,
      reference: latestOrder.orderId || latestOrder.$id,
      orderId: latestOrder.$id,
      onSuccess: () => {
        // Optionally redirect or show a toast
        router.push(`/myorders/${latestOrder.orderId}`);
      },
      onClose: () => {},
    });
  };

  const handleCancelOrder = async () => {
    if (!latestOrder) return;
    try {
      // Cancel the order
      await dispatch(cancelBookedOrder(latestOrder.$id));

      // Send SMS notifications
      console.log("sending cancelation sms")
      const userSmsPromise = sendOrderCancellationSMS(
        latestOrder.orderId,
        latestOrder.phone
      );

      const adminSmsPromise = sendOrderCancellationAdminSMS(
        latestOrder.orderId,
        latestOrder.customerId, // Using customerId as userName for now
        latestOrder.phone
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

      router.push(`/myorders/${latestOrder.orderId}`);
    } catch (error) {
      toast.error("Failed to cancel order");
      console.error("Error cancelling order:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg font-semibold text-orange-600">
          Loading your order...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg font-semibold text-red-600">{error}</div>
      </div>
    );
  }

  if (!latestOrder || !branch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">
          No recent order found.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-2">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl text-center max-w-md w-full relative animate-fade-in">
        <button
          className="absolute top-4 right-4 text-orange-500 hover:text-orange-700 text-2xl font-bold focus:outline-none"
          aria-label="Close"
          onClick={() => router.push("/")}
        >
          ×
        </button>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-2 mt-2">
          Thank You For Your Order!
        </h2>
        <div className="flex justify-center my-6">
          <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900 animate-bounce">
            <CheckCircle className="w-16 h-16 text-orange-500" />
          </span>
        </div>
        <h3 className="text-xl font-bold text-orange-600 mb-2">
          Order Confirmed
        </h3>
        <p className="mb-4 text-gray-700 dark:text-gray-200">
          Your order is currently confirmed as{" "}
          <span className="font-semibold">{latestOrder.paymentMethod}</span>.
          <br />
          You can pay now by choosing one of our payment options.
        </p>
        <div className="bg-orange-50 dark:bg-orange-900/30 rounded-xl p-4 mb-6">
          <div className="font-bold text-gray-900 dark:text-white text-lg mb-1">
            {branch.name}
          </div>
          <div className="text-gray-600 dark:text-gray-300 text-sm">
            Delivery
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-2">
          <Link
            href={`/myorders/${latestOrder.orderId}`}
            className="w-full sm:flex-1 h-14 flex items-center justify-center border-2 border-orange-500 text-orange-600 font-bold rounded-xl text-lg transition hover:bg-orange-50 dark:hover:bg-orange-900/30 text-center"
          >
            Go to Details
          </Link>
          <Button
          style={{display:latestOrder.paid ? "none" : "block"}}
            className="w-full sm:flex-1 h-14 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-lg transition text-center"
            onClick={handlePayNow}
            disabled={paying}
          >
            {paying ? "Processing Payment..." : "Pay Now"}
          </Button>
          {canCancel && (
            <Button
              onClick={() => setCancelDialogOpen(true)}
              className="w-full sm:flex-1 h-14 flex items-center justify-center border-2 border-orange-500 text-orange-600 font-bold rounded-xl text-lg transition hover:bg-orange-50 dark:hover:bg-orange-900/30 text-center"
              variant="outline"
            >
              Cancel Order
            </Button>
          )}
        </div>
        {/* Cancel Confirmation Dialog */}
        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="dark:bg-gray-900">
            <DialogHeader>
              <DialogTitle className="dark:text-gray-100">
                Cancel Order
              </DialogTitle>
            </DialogHeader>
            <DialogDescription className="dark:text-gray-300">
              {latestOrder?.status === "preparing" ? (
                <span className="text-orange-600 dark:text-orange-300 font-medium">
                  The restaurant may have already started preparing your food.
                  Cancelling now may not always be possible or may incur a fee.
                  Are you sure you want to cancel?
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
        {paymentError && (
          <div className="mt-4 text-red-500 text-sm">{paymentError}</div>
        )}
      </div>
    </div>
  );
}
