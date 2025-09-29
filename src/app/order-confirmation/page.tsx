"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Truck, MapPin, CreditCard, X, Loader2, Clock, Package } from "lucide-react";
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
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function OrderConfirmation() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.bookedOrders
  );
  const { payWithPaystack, paying, paymentError } = usePayment();
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);

  useEffect(() => {
    if (user?.userId) {
      dispatch(fetchBookedOrdersByUserId(user.userId));
    }
  }, [user?.userId, dispatch]);

  const latestOrder = orders && orders.length > 0 ? orders[0] : null;
  const branch = latestOrder
    ? branches.find((b) => b.id === latestOrder.selectedBranchId)
    : null;

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
        router.push(`/myorders/${latestOrder.orderId}`);
      },
      onClose: () => {},
    });
  };

  const handleCancelOrder = async () => {
    if (!latestOrder) return;
    setCancelling(true);
    try {
      await dispatch(cancelBookedOrder(latestOrder.$id));
      toast.success("Order cancelled successfully!");
      router.push(`/myorders/${latestOrder.orderId}`);
    } catch (error) {
      toast.error("Failed to cancel order");
      console.error("Error cancelling order:", error);
    } finally {
      setCancelling(false);
      setCancelDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-4"
        >
          <div className="relative w-20 h-20 mx-auto">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 rounded-full border-4 border-orange-200 dark:border-orange-800 border-t-orange-500"
            />
          </div>
          <div className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Loading your order...
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
        >
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <X className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          </div>
          <Button onClick={() => router.push("/myorders")} className="w-full bg-orange-500 hover:bg-orange-600">
            View All Orders
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!latestOrder || !branch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-6 max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
        >
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Recent Order</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Start by browsing our delicious menu</p>
          </div>
          <Button onClick={() => router.push("/menu")} className="w-full bg-orange-500 hover:bg-orange-600">
            Browse Menu
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl mx-auto w-full"
      >
        {/* Close Button */}
        <div className="flex justify-end mb-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2.5 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all text-gray-600 dark:text-gray-400 hover:text-orange-500 border border-gray-200 dark:border-gray-700"
            aria-label="Close"
            onClick={() => router.push("/")}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Success Card */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          {/* Header Section with Icon */}
          <div className="relative bg-gradient-to-br from-orange-500 to-orange-600 px-6 py-8 sm:px-8 sm:py-10 text-center overflow-hidden">
            <motion.div
              className="absolute inset-0 opacity-10"
              animate={{ 
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
              style={{
                backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                backgroundSize: "30px 30px"
              }}
            />
            
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 150, delay: 0.2 }}
              className="relative mx-auto mb-4 w-20 h-20"
            >
              <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-20" />
              <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <CheckCircle className="w-12 h-12 text-orange-500" strokeWidth={2.5} />
              </div>
            </motion.div>

            <motion.h2
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="text-2xl sm:text-3xl font-extrabold text-white mb-2"
            >
              Order Confirmed!
            </motion.h2>

            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30"
            >
              <p className="text-white font-bold text-lg">
                #{latestOrder.orderId}
              </p>
            </motion.div>
          </div>

          {/* Content Section */}
          <div className="px-6 py-8 sm:px-8 space-y-6">
            {/* Delivery Time Info */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="flex items-center justify-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-2xl border border-orange-100 dark:border-orange-900/30"
            >
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                  Estimated Delivery
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {latestOrder.deliveryDuration || "40 min"}
                </p>
              </div>
            </motion.div>

            {/* Branch Info Card */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 }}
              className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 dark:text-white text-base mb-1">
                    {branch.name}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {branch.address}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-orange-600 border border-orange-200 dark:border-orange-900/40">
                    <Truck className="w-3.5 h-3.5" />
                    Delivery
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Payment Info */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
              className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Payment Method
              </span>
              <span className="text-sm font-bold text-gray-900 dark:text-white capitalize">
                {latestOrder.paymentMethod}
              </span>
            </motion.div>

            {/* Payment Status Alert */}
            <AnimatePresence>
              {latestOrder.paymentMethod !== "cash" && !latestOrder.paid && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">
                        Payment Required
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Complete payment to confirm your order
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <motion.div
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              className="space-y-3 pt-2"
            >
              {latestOrder.paymentMethod !== "cash" && !latestOrder.paid && (
                <Button
                  className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-base shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={handlePayNow}
                  disabled={paying}
                >
                  {paying ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pay ₦{latestOrder.total?.toLocaleString()} Now
                    </>
                  )}
                </Button>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link
                  href={`/myorders/${latestOrder.orderId}`}
                  className="h-12 flex items-center justify-center bg-white dark:bg-gray-900 border-2 border-orange-500 text-orange-600 dark:text-orange-400 font-semibold rounded-xl text-sm transition-all duration-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 shadow-md hover:shadow-lg"
                >
                  <Truck className="w-4 h-4 mr-2" />
                  Track Order
                </Link>

                {canCancel && (
                  <Button
                    onClick={() => setCancelDialogOpen(true)}
                    variant="outline"
                    className="h-12 border-2 border-red-500 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold rounded-xl text-sm shadow-md hover:shadow-lg"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </div>
            </motion.div>

            {/* Payment Error */}
            <AnimatePresence>
              {paymentError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                >
                  <p className="text-sm text-red-600 dark:text-red-400 text-center">
                    {paymentError}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Help Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6"
        >
          Need help? Contact support or view your order history
        </motion.p>
      </motion.div>

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-md mx-auto dark:bg-gray-800 rounded-2xl">
          <DialogHeader className="space-y-3">
            <div className="w-14 h-14 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="dark:text-gray-100 text-xl font-bold text-center">
              Cancel Order?
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="dark:text-gray-300 text-sm text-center leading-relaxed space-y-3">
            {latestOrder?.status === "preparing" && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-900/30">
                <p className="text-orange-700 dark:text-orange-300 font-medium text-xs">
                  ⚠️ Your order may already be in preparation
                </p>
              </div>
            )}
            <p className="text-gray-600 dark:text-gray-400">
              Are you sure you want to cancel order <span className="font-semibold">#{latestOrder?.orderId}</span>? This action cannot be undone.
            </p>
          </DialogDescription>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto h-11 font-medium">
                Keep Order
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleCancelOrder}
              className="w-full sm:w-auto h-11 font-medium bg-red-500 hover:bg-red-600"
              disabled={cancelling}
            >
              {cancelling ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Confirm Cancel"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}