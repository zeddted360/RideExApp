"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/state/store";
import {
  fetchBookedOrderById,
  cancelBookedOrder,
  updateBookedOrderAsync,
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
  Clock,
  Package,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  AlertCircle,
  Phone,
  Copy,
  Check,
  Star,
} from "lucide-react";
import Image from "next/image";
import { client, validateEnv, fileUrl } from "@/utils/appwrite";
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
import toast from "react-hot-toast";
import { useAuth } from "@/context/authContext";
import { Textarea } from "@/components/ui/textarea";

const statusSteps = [
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "preparing", label: "Preparing", icon: Package },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
];

function getStatusIndex(status: string) {
  return statusSteps.findIndex((s) => s.key === status) !== -1
    ? statusSteps.findIndex((s) => s.key === status)
    : 0;
}

interface OrderFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, comment: string) => Promise<void>;
}

const OrderFeedbackModal: React.FC<OrderFeedbackModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please provide a rating");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(rating, comment);
      toast.success("Thank you for your feedback!");
      onClose();
    } catch (error) {
      toast.error("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto dark:bg-gray-800 rounded-2xl">
        <DialogHeader className="space-y-3">
          <div className="w-14 h-14 mx-auto bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
            <Star className="w-8 h-8 text-orange-500" />
          </div>
          <DialogTitle className="dark:text-gray-100 text-xl font-bold text-center">
            How was your experience?
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="dark:text-gray-300 text-sm text-center leading-relaxed space-y-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRating(star)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= rating
                      ? "fill-orange-500 text-orange-500"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                />
              </motion.button>
            ))}
          </div>
          <Textarea
            placeholder="Share your thoughts (optional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </DialogDescription>
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 mt-4">
          <DialogClose asChild>
            <Button variant="outline" className="w-full sm:w-auto h-11 font-medium">
              Skip
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            className="w-full sm:w-auto h-11 font-medium bg-orange-500 hover:bg-orange-600"
            disabled={submitting || rating === 0}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

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
  const [cancelling, setCancelling] = React.useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const {user} = useAuth();
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [prevStatus, setPrevStatus] = useState<string | null>(null);


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

  // Detect status change to delivered
  useEffect(() => {
    if (currentOrder?.status === "delivered" && prevStatus !== "delivered") {
      // Assuming no existing feedback field; you can add check if feedback exists
      setShowFeedbackModal(true);
    }
    if (currentOrder?.status) {
      setPrevStatus(currentOrder.status);
    }
  }, [currentOrder?.status, prevStatus]);

  const branch = currentOrder
    ? branches.find((b) => b.id === currentOrder.selectedBranchId)
    : null;
  const statusIdx = currentOrder ? getStatusIndex(currentOrder.status) : 0;

  const riderCode = currentOrder?.riderCode || currentOrder?.orderId?.slice(-4).toUpperCase() || '';

  const canCancel =
    currentOrder &&
    ["pending", "confirmed", "preparing"].includes(currentOrder.status);

  const handleCopyCode = async () => {
    if (riderCode) {
      try {
        await navigator.clipboard.writeText(riderCode);
        setIsCopied(true);
        toast.success("Code copied to clipboard!");
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        toast.error("Failed to copy code");
      }
    }
  };

  const handleCancelOrder = async () => {
    if (currentOrder) {
      setCancelling(true);
      try {
        await dispatch(cancelBookedOrder(currentOrder.$id));
        toast.success("Order cancelled successfully!");
        router.push("/myorders");
      } catch (error) {
        toast.error("Failed to cancel order");
        console.error("Error cancelling order:", error);
      } finally {
        setCancelling(false);
        setCancelDialogOpen(false);
      }
    }
  };


  const handlePayNow = () => {
    if (!currentOrder) return;
    payWithPaystack({
      email:
        user?.email || "user@example.com",
      amount: currentOrder.total,
      reference: currentOrder.orderId || currentOrder.$id,
      orderId: currentOrder.$id,
      onSuccess: () => {
        router.push("/myorders");
      },
      onClose: () => {},
    });
  };

  const handleFeedbackSubmit = async (rating: number, comment: string) => {
    if (!currentOrder) return;
    await dispatch(
      updateBookedOrderAsync({
        orderId: currentOrder.$id,
        orderData: {
          feedbackRating: rating,
          feedbackComment: comment,
        },
      })
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
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
            Loading order details...
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
          className="text-center space-y-6 max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
        >
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Order</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{error}</p>
          </div>
          <Button onClick={() => router.push("/myorders")} className="w-full bg-orange-500 hover:bg-orange-600">
            Back to Orders
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!currentOrder || !branch) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6 max-w-sm bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl"
        >
          <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <Package className="w-10 h-10 text-gray-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Order Not Found</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">The order you're looking for doesn't exist</p>
          </div>
          <Button onClick={() => router.push("/myorders")} className="w-full bg-orange-500 hover:bg-orange-600">
            View All Orders
          </Button>
        </motion.div>
      </div>
    );
  }

  if (currentOrder.status === "cancelled") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4 py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 text-center border border-red-200 dark:border-red-900/40"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center"
          >
            <XCircle className="w-16 h-16 text-red-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Order Cancelled
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            This order has been cancelled. For more details or assistance, please contact our support team.
          </p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push("/menu")}
              className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl"
            >
              Place New Order
            </Button>
            <Button
              onClick={() => router.push("/myorders")}
              variant="outline"
              className="w-full h-12 border-2 border-orange-500 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 dark:hover:bg-orange-900/20"
            >
              View My Orders
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  const itemIds: string[] = (currentOrder as any).itemIds || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => router.push("/myorders")}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-orange-500"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </Button>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700"
        >
          {/* Order Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg opacity-90 mb-1 font-bold">Hi {user?.username},</h3>
                <p className="text-xl">Your order will be ready in {currentOrder.deliveryDuration}.</p>
              </div>
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full">
                <Phone className="w-8 h-8 text-white/80" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-2 gap-x-4 bg-white/20 backdrop-blur-sm px-4 py-3 rounded-md border border-white/30">
              <div className="">
              <p className="text-white/80 font-medium text-xs tracking-wide">Delivery confirmation code</p>
              <p className="text-white/80 text-sm font-bold mt-1 tracking-wide">Show this code to your rider</p>
              </div>
              
              <div className="relative flex items-center gap-2">
                <div className="relative group">
                  <div className="flex gap-1">
                    {riderCode.toUpperCase().split('').map((digit, index) => (
                      <div
                        key={index}
                        className="w-10 h-10 bg-white/50 dark:bg-white/30 rounded-lg flex items-center justify-center text-xl font-extrabold text-gray-900 dark:text-white shadow-md"
                      >
                        {digit}
                      </div>
                    ))}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopyCode}
                    className="absolute -top-2 -right-2 bg-white/80 dark:bg-gray-800/80 rounded-full p-1.5 shadow-lg border border-white/50 dark:border-gray-700/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    aria-label="Copy code"
                  >
                    {isCopied ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3 text-gray-700 dark:text-gray-300" />
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </div>

          {/* Status Progress */}
          <div className="px-6 py-8 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              {statusSteps.map((step, idx) => {
                const StepIcon = step.icon;
                return (
                  <React.Fragment key={step.key}>
                    <div className="flex flex-col items-center flex-1">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all duration-300 mb-2 ${
                          idx <= statusIdx
                            ? "bg-orange-500 border-orange-500 shadow-lg shadow-orange-200 dark:shadow-orange-900/50"
                            : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        {idx < statusIdx ? (
                          <CheckCircle className="w-6 h-6 text-white" strokeWidth={2.5} />
                        ) : idx === statusIdx ? (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <StepIcon className="w-6 h-6 text-white" />
                          </motion.div>
                        ) : (
                          <StepIcon className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                        )}
                      </motion.div>
                      <p
                        className={`text-xs font-medium text-center leading-tight ${
                          idx <= statusIdx
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-gray-400 dark:text-gray-500"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                    {idx < statusSteps.length - 1 && (
                      <div className="flex-1 h-1 -mt-8 mx-2">
                        <div
                          className={`h-full rounded transition-all duration-500 ${
                            idx < statusIdx
                              ? "bg-orange-500"
                              : "bg-gray-200 dark:bg-gray-700"
                          }`}
                        />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          {/* Order Details */}
          <div className="px-6 py-6 space-y-4">
            {/* Branch Info */}
            <div className="p-5 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-6 h-6 text-orange-500" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-1">
                    {branch.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {branch.address}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-full text-xs font-medium text-orange-600 border border-orange-200 dark:border-orange-900/40">
                    <Truck className="w-3.5 h-3.5" />
                    Delivery
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                {currentOrder.paymentMethod === "card" ? (
                  <CreditCard className="w-5 h-5 text-orange-500" />
                ) : (
                  <Landmark className="w-5 h-5 text-orange-500" />
                )}
                <span className="font-medium text-gray-600 dark:text-gray-400">Payment Method</span>
              </div>
              <span className="font-bold text-gray-900 dark:text-white capitalize">
                {currentOrder.paymentMethod.replace(/_/g, " ")}
              </span>
            </div>

            {/* Order Summary */}
            <div className="p-5 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10 rounded-2xl border border-orange-200 dark:border-orange-900/30">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ₦{currentOrder.deliveryFee?.toLocaleString()}
                  </span>
                </div>
                <div className="pt-3 border-t border-orange-200 dark:border-orange-900/30 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-2xl font-bold text-orange-600">
                    ₦{currentOrder.total?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Required Alert */}
            <AnimatePresence>
              {!currentOrder.paid && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-xl"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-1">
                        Payment Required
                      </p>
                      <p className="text-xs text-amber-700 dark:text-amber-300">
                        Please complete payment to process your order
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Items */}
          {itemIds.length > 0 && (
            <div className="px-6 py-6 border-t border-gray-100 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Order Items ({itemIds.length})
                </h3>
                {!showItems && (
                  <Button
                    onClick={() => setShowItems(true)}
                    variant="ghost"
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20"
                  >
                    View Items
                    <ChevronDown className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>

              <AnimatePresence>
                {showItems && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3"
                  >
                    {itemIds.slice(0, visibleCount).map((id) => {
                      const item = findItemById(id);
                      return (
                        <motion.div
                          key={id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-900/40 transition-colors"
                        >
                          {item && item.image ? (
                            <Image
                              src={
                                fileUrl(validateEnv().featuredBucketId, item.image) ||
                                fileUrl(validateEnv().popularBucketId, item.image) ||
                                fileUrl(validateEnv().menuBucketId, item.image)
                              }
                              alt={item.name}
                              width={60}
                              height={60}
                              className="rounded-lg object-cover w-15 h-15"
                              quality={100}
                            />
                          ) : (
                            <div className="w-15 h-15 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                              {item ? item.name : `Item ${id}`}
                            </h4>
                            {item && (
                              <>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                                  {item.description || "No description available"}
                                </p>
                                <div className="flex items-center gap-2">
                                  {item.category && (
                                    <span className="text-xs px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-full">
                                      {item.category}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}

                    <div className="flex gap-3 pt-2">
                      {visibleCount < itemIds.length && (
                        <Button
                          onClick={() => setVisibleCount((c) => c + 4)}
                          variant="outline"
                          className="flex-1 h-10 text-sm"
                        >
                          Show More ({itemIds.length - visibleCount} remaining)
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          setShowItems(false);
                          setVisibleCount(4);
                        }}
                        variant="outline"
                        className="flex-1 h-10 text-sm"
                      >
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Hide Items
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Action Buttons */}
          <div className="px-6 py-6 bg-gray-50 dark:bg-gray-900/30 space-y-3">
            {currentOrder.paymentMethod !== "cash" && !currentOrder.paid && (
              <Button
                className="w-full h-14 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl text-base shadow-lg hover:shadow-xl transition-all"
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
                    Pay ₦{currentOrder.total?.toLocaleString()} Now
                  </>
                )}
              </Button>
            )}

            {canCancel && (
              <Button
                onClick={() => setCancelDialogOpen(true)}
                variant="outline"
                className="w-full h-12 border-2 border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold rounded-xl"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancel Order
              </Button>
            )}

            {paymentError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400 text-center">
                  {paymentError}
                </p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6"
        >
          Thank you for choosing <span className="font-bold text-orange-600">RideEx</span>
        </motion.p>
      </div>

      {/* Cancel Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="max-w-md mx-auto dark:bg-gray-800 rounded-2xl">
          <DialogHeader className="space-y-3">
            <div className="w-14 h-14 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
            <DialogTitle className="text-xl font-bold text-center dark:text-white">
              Cancel Order?
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center space-y-3">
            {currentOrder?.status === "preparing" && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-900/30">
                <p className="text-xs font-medium text-orange-700 dark:text-orange-300">
                  ⚠️ Your order may already be in preparation
                </p>
              </div>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to cancel order <span className="font-semibold">{currentOrder?.riderCode?.toUpperCase()}</span>? This action cannot be undone.
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

      {/* Feedback Modal */}
      <OrderFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
}