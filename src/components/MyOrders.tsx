"use client";
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Package, XCircle, MapPin, Loader2, CreditCard, Clock, Truck, AlertCircle, CheckCircle, Filter, User } from "lucide-react";
import { AppDispatch, RootState } from "@/state/store";
import {
  fetchBookedOrdersByUserId,
  cancelBookedOrder,
  updateBookedOrderAsync,
} from "@/state/bookedOrdersSlice";
import { branches } from "../../data/branches";
import { IBookedOrderFetched, OrderStatus } from "../../types/types";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/authContext";
import { client, validateEnv } from "@/utils/appwrite";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { usePayment } from "@/context/paymentContext";
import { motion, AnimatePresence } from "framer-motion";

const ORDER_STATUS_TABS: {
  key: OrderStatus | "completed" | "all";
  label: string;
  icon: any;
}[] = [
  { key: "all", label: "All", icon: Package },
  { key: "pending", label: "Pending", icon: Clock },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle },
  { key: "preparing", label: "Preparing", icon: Package },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle },
  { key: "cancelled", label: "Cancelled", icon: XCircle },
  { key: "completed", label: "Completed", icon: CheckCircle },
];

const MyOrders = () => {
  const { userId, isAuthenticated } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.bookedOrders
  );
  const [activeTab, setActiveTab] = useState<OrderStatus | "completed" | "all">("all");

  useEffect(() => {
    if (isAuthenticated && userId) {
      dispatch(fetchBookedOrdersByUserId(userId));
      const { bookedOrdersCollectionId, databaseId } = validateEnv();
      const channel = `databases.${databaseId}.collections.${bookedOrdersCollectionId}.documents`;
      const unsubscribe = client.subscribe(channel, (response: any) => {
        if (
          response.payload?.customerId === userId &&
          (response.events.some((e: string) => e.endsWith(".create")) ||
            response.events.some((e: string) => e.endsWith(".update")) ||
            response.events.some((e: string) => e.endsWith(".delete")))
        ) {
          dispatch(fetchBookedOrdersByUserId(userId));
        }
      });
      return () => {
        unsubscribe();
      };
    }
  }, [dispatch, isAuthenticated, userId]);

  const getFilteredOrders = (status: OrderStatus | "completed" | "all") => {
    if (status === "all") {
      return orders;
    }
    if (status === "completed") {
      return orders.filter(
        (order) => order.status === "delivered" && order.paid
      );
    }
    return orders.filter((order) => order.status === status);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const order = orders.find((o) => o.$id === orderId);
      if (!order) {
        toast.error("Order not found");
        return;
      }

      await dispatch(cancelBookedOrder(orderId)).unwrap();

      toast.success("Order cancelled successfully!");
    } catch (error) {
      toast.error("Failed to cancel order");
      console.error("Error cancelling order:", error);
    }
  };

  const handleReorder = (order: IBookedOrderFetched) => {
    toast.success("Reorder functionality coming soon!");
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="rounded-2xl shadow-xl border-0 bg-white dark:bg-gray-800">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6">
                <Package className="w-10 h-10 text-orange-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Authentication Required
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                Please log in to view your orders
              </p>
              <Button asChild className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-semibold">
                <Link href="/login">Log In</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
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
            Loading your orders...
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card className="rounded-2xl shadow-xl border-0 bg-white dark:bg-gray-800">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <XCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Error Loading Orders
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                {error}
              </p>
              <Button
                onClick={() => dispatch(fetchBookedOrdersByUserId(userId!))}
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-semibold"
              >
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const allOrders = orders;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
            My Orders
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage your food delivery orders
          </p>
        </motion.div>

        {allOrders.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="rounded-2xl shadow-xl border-0 bg-white dark:bg-gray-800">
              <CardContent className="flex flex-col items-center justify-center py-20">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-24 h-24 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-6"
                >
                  <Package className="w-12 h-12 text-orange-500" />
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  No Orders Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-md">
                  You haven't placed any orders yet. Start exploring our delicious menu!
                </p>
                <Button asChild className="h-12 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-semibold shadow-lg">
                  <Link href="/menu">Browse Menu</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-6"
            >
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Filter by status</span>
              </div>
              <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 -mx-4 px-4 sm:mx-0 sm:px-0">
                {ORDER_STATUS_TABS.map((tab) => {
                  const TabIcon = tab.icon;
                  const count = tab.key === "all"
                    ? orders.length
                    : tab.key === "completed"
                    ? getFilteredOrders("completed").length
                    : getFilteredOrders(tab.key as OrderStatus).length;
                  
                  return (
                    <motion.button
                      key={tab.key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-2 whitespace-nowrap px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                        activeTab === tab.key
                          ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-200 dark:shadow-orange-900/50"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-gray-200 dark:border-gray-700"
                      }`}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      <TabIcon className="w-4 h-4" />
                      <span>{tab.label}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        activeTab === tab.key
                          ? "bg-white/20"
                          : "bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400"
                      }`}>
                        {count}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            <OrdersList
              orders={getFilteredOrders(activeTab)}
              onCancel={handleCancelOrder}
              onReorder={handleReorder}
            />
          </>
        )}
      </div>
    </div>
  );
};

interface OrdersListProps {
  orders: IBookedOrderFetched[];
  onCancel: (orderId: string) => void;
  onReorder: (order: IBookedOrderFetched) => void;
}

const OrdersList = ({ orders, onCancel, onReorder }: OrdersListProps) => {
  const { payWithPaystack, paying, paymentError } = usePayment();
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [orderToCancel, setOrderToCancel] = React.useState<IBookedOrderFetched | null>(null);
  const [payDialogOpen, setPayDialogOpen] = React.useState(false);
  const [orderToPay, setOrderToPay] = React.useState<IBookedOrderFetched | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<string | null>(null);
  const [updatingPayment, setUpdatingPayment] = React.useState(false);
  const [cancelling, setCancelling] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();
const {user} = useAuth();

  const handleCancelClick = (order: IBookedOrderFetched) => {
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  const handlePayClick = (order: IBookedOrderFetched) => {
    setOrderToPay(order);
    setSelectedPaymentMethod(order.paymentMethod);
    setPayDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (orderToCancel) {
      setCancelling(true);
      try {
        await onCancel(orderToCancel.$id);
        setCancelDialogOpen(false);
        setOrderToCancel(null);
      } finally {
        setCancelling(false);
      }
    }
  };

  const handlePaymentMethodChange = async (newMethod: string) => {
    if (!orderToPay || orderToPay.paymentMethod === newMethod) return;
    setUpdatingPayment(true);
    try {
      await dispatch(
        updateBookedOrderAsync({
          orderId: orderToPay.$id,
          orderData: { paymentMethod: newMethod },
        })
      ).unwrap();
      setSelectedPaymentMethod(newMethod);
      toast.success("Payment method updated!");
    } catch (err) {
      toast.error("Failed to update payment method");
    } finally {
      setUpdatingPayment(false);
    }
  };

  const handleDialogChange = (open: boolean) => {
    setCancelDialogOpen(open);
    if (!open) setOrderToCancel(null);
  };

  const handlePayDialogChange = (open: boolean) => {
    setPayDialogOpen(open);
    if (!open) setOrderToPay(null);
  };

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          No orders in this category
        </p>
      </motion.div>
    );
  }

  const handlePayNow = async () => {
    if (!orderToPay) return;
    payWithPaystack({
      email: user?.email || "user@example.com",
      amount: orderToPay.total,
      reference: orderToPay.orderId || orderToPay.$id,
      orderId: orderToPay.$id,
      onSuccess: () => {
        setPayDialogOpen(false);
        setOrderToPay(null);
      },
      onClose: () => {},
    });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900",
      confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-900",
      preparing: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-900",
      out_for_delivery: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-900",
      delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-900",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-900",
      failed: "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-700/30 dark:text-gray-400";
  };

  return (
    <>
      <div className="grid gap-6">
        <AnimatePresence>
          {orders.map((order, idx) => {
            const branch = branches.find((b) => b.id === order.selectedBranchId);
            const canCancel = ["pending", "confirmed", "preparing"].includes(order.status);
            const canPay = !order.paid && order.paymentMethod !== "cash" && !["delivered", "completed"].includes(order.status);
            const canReorder = ["completed", "cancelled", "failed"].includes(order.status);

            return (
              <motion.div
                key={order.$id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                layout
              >
                <Card className="rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <CardHeader className="border-b border-gray-100 dark:border-gray-700 pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-bold text-orange-600 dark:text-orange-400 mb-1">
                          Order: {order.riderCode?.toUpperCase()}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(order.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} border font-semibold px-3 py-1 whitespace-nowrap`}>
                        {order.status.replace(/_/g, " ").toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-4 space-y-4">
                    <div className="grid gap-3">
                      <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                            {branch ? branch.name : "-"}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {branch ? branch.address : ""}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                          ₦{order.total?.toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-orange-500" />
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                            {order.paymentMethod.replace(/_/g, " ")}
                          </span>
                        </div>
                        <Badge className={order.paid ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800" : "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800"}>
                          {order.paid ? "Paid" : "Unpaid"}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                      <Button asChild variant="outline" size="sm" className="flex-1 min-w-[120px] rounded-xl border-2 border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 font-semibold">
                        <Link href={`/myorders/${order.orderId}`}>
                         Track Order
                        </Link>
                      </Button>
                      {canPay && order.status !== "cancelled" && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handlePayClick(order)}
                          className="flex-1 min-w-[120px] rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 font-semibold"
                        >
                          <CreditCard className="w-4 h-4 mr-2" />
                          Pay Now
                        </Button>
                      )}
                      {canCancel && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelClick(order)}
                          className="flex-1 min-w-[120px] rounded-xl bg-red-500 hover:bg-red-600 font-semibold"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      )}
                      {canReorder && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => onReorder(order)}
                          className="flex-1 min-w-[120px] rounded-xl font-semibold"
                        >
                          <Package className="w-4 h-4 mr-2" />
                          Reorder
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Dialog open={payDialogOpen} onOpenChange={handlePayDialogChange}>
        <DialogContent className="dark:bg-gray-800 rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="dark:text-white text-xl font-bold">
              Pay for Order
            </DialogTitle>
          </DialogHeader>
          {orderToPay && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Amount</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ₦{orderToPay.total?.toLocaleString()}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payment Method
                </label>
                <select
                  className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-white p-3 focus:ring-2 focus:ring-orange-500 outline-none"
                  value={selectedPaymentMethod || orderToPay.paymentMethod}
                  onChange={(e) => handlePaymentMethodChange(e.target.value)}
                  disabled={updatingPayment}
                >
                  {paymentMethods
                    .filter((m) => m.value !== "cash")
                    .map((method) => (
                      <option key={method.value} value={method.value}>
                        {method.label}
                      </option>
                    ))}
                </select>
              </div>

              <Button
                className="w-full h-12 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 rounded-xl font-bold"
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
                    Pay ₦{orderToPay.total?.toLocaleString()}
                  </>
                )}
              </Button>

              {paymentError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400">{paymentError}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto h-11 rounded-xl">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="dark:bg-gray-800 rounded-2xl max-w-md">
          <DialogHeader className="space-y-3">
            <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-500" />
            </div>
            <DialogTitle className="dark:text-white text-xl font-bold text-center">
              Cancel Order?
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center space-y-3">
            {orderToCancel?.status === "preparing" && (
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-900/30">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-orange-700 dark:text-orange-300 text-left">
                    The restaurant may have already started preparing your food. Cancelling now may not always be possible or may incur a fee.
                  </p>
                </div>
              </div>
            )}
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Are you sure you want to cancel order <span className="font-semibold text-gray-900 dark:text-white">#{orderToCancel?.orderId}</span>? This action cannot be undone.
            </p>
          </DialogDescription>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-2 mt-4">
            <DialogClose asChild>
              <Button variant="outline" className="w-full sm:w-auto h-11 rounded-xl font-medium">
                Keep Order
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleConfirmCancel}
              disabled={cancelling}
              className="w-full sm:w-auto h-11 rounded-xl font-medium bg-red-500 hover:bg-red-600"
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
    </>
  );
};

const paymentMethods = [
  { value: "card", label: "Card" },
  { value: "transfer", label: "Bank Transfer" },
  { value: "wallet", label: "Wallet" },
  { value: "cash", label: "Cash on Delivery" },
];

export default MyOrders;