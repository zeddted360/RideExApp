"use client";
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from "@/components/ui/button";
import { Package, XCircle, MapPin, Loader2 } from "lucide-react";
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
import { usePayment, PaymentProvider } from "@/context/paymentContext";
import {
  sendOrderCancellationSMS,
  sendOrderCancellationAdminSMS,
} from "@/utils/smsService";

const ORDER_STATUS_TABS: {
  key: OrderStatus | "completed" | "all";
  label: string;
}[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
  { key: "completed", label: "Completed" },
];

const MyOrders = () => {
  const { userId, isAuthenticated } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.bookedOrders
  );
  const [activeTab, setActiveTab] = useState<OrderStatus | "completed" | "all">(
    "all"
  );

  useEffect(() => {
    if (isAuthenticated && userId) {
      dispatch(fetchBookedOrdersByUserId(userId));
      // Real-time listener for booked orders
      const { bookedOrdersCollectionId, databaseId } = validateEnv();
      const channel = `databases.${databaseId}.collections.${bookedOrdersCollectionId}.documents`;
      const unsubscribe = client.subscribe(channel, (response: any) => {
        // Only refetch if the event is relevant to this user
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
      // Find the order to get details
      const order = orders.find((o) => o.$id === orderId);
      if (!order) {
        toast.error("Order not found");
        return;
      }

      // Cancel the order
      await dispatch(cancelBookedOrder(orderId)).unwrap();

      // Send SMS notifications
      const userSmsPromise = sendOrderCancellationSMS(
        order.orderId,
        order.phone
      );

      const adminSmsPromise = sendOrderCancellationAdminSMS(
        order.orderId,
        order.customerId, // Using customerId as userName for now
        order.phone
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
    } catch (error) {
      toast.error("Failed to cancel order");
      console.error("Error cancelling order:", error);
    }
  };

  const handleReorder = (order: IBookedOrderFetched) => {
    // TODO: Implement reorder functionality
    toast.success("Reorder functionality coming soon!");
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen">
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Authentication Required
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              Please log in to view your orders
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="ml-2 text-gray-600 dark:text-gray-300">
            Loading your orders...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen">
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="w-16 h-16 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Error Loading Orders
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              {error}
            </p>
            <Button
              onClick={() => dispatch(fetchBookedOrdersByUserId(userId!))}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allOrders = orders;

  return (
    <div className="container mx-auto px-4 py-8 bg-white dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          My Orders
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Track your food delivery orders
        </p>
      </div>
      {allOrders.length === 0 ? (
        <Card className="bg-white dark:bg-gray-900">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Orders Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              You haven't placed any orders yet. Start exploring our delicious
              menu!
            </p>
            <Button asChild>
              <Link href="/menu">Browse Menu</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Custom Tab Bar */}
          <div
            className="flex overflow-x-auto gap-2 mb-6 pb-2 border-b border-gray-200 dark:border-gray-700 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
            style={{ WebkitOverflowScrolling: "touch" }}
          >
            {ORDER_STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                className={`whitespace-nowrap px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150
                  ${
                    activeTab === tab.key
                      ? "bg-orange-500 text-white dark:bg-orange-400 dark:text-gray-900 shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-orange-100 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-orange-900"
                  }
                `}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label} (
                {tab.key === "all"
                  ? orders.length
                  : tab.key === "completed"
                  ? getFilteredOrders("completed").length
                  : getFilteredOrders(tab.key as OrderStatus).length}
                )
              </button>
            ))}
          </div>
          {/* Tab Content */}
          <div>
            <OrdersList
              orders={getFilteredOrders(activeTab)}
              onCancel={handleCancelOrder}
              onReorder={handleReorder}
            />
          </div>
        </>
      )}
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
  const [orderToCancel, setOrderToCancel] =
    React.useState<IBookedOrderFetched | null>(null);
  const [payDialogOpen, setPayDialogOpen] = React.useState(false);
  const [orderToPay, setOrderToPay] =
    React.useState<IBookedOrderFetched | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = React.useState<
    string | null
  >(null);
  const [updatingPayment, setUpdatingPayment] = React.useState(false);
  const dispatch = useDispatch<AppDispatch>();
  // Open dialog when cancel is triggered
  const handleCancelClick = (order: IBookedOrderFetched) => {
    setOrderToCancel(order);
    setCancelDialogOpen(true);
  };

  // Open dialog when pay is triggered
  const handlePayClick = (order: IBookedOrderFetched) => {
    setOrderToPay(order);
    setSelectedPaymentMethod(order.paymentMethod);
    setPayDialogOpen(true);
  };

  // Confirm cancellation and reset dialog state
  const handleConfirmCancel = () => {
    if (orderToCancel) {
      onCancel(orderToCancel.$id);
      setCancelDialogOpen(false);
      setOrderToCancel(null);
    }
  };

  // Handle payment method change
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

  // Reset dialog state if closed without confirming
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
      <div className="text-center text-gray-500 dark:text-gray-400 py-8">
        No orders in this category.
      </div>
    );
  }
  // Paystack payment handler (now only calls context)
  const handlePayNow = async () => {
    if (!orderToPay) return;
    payWithPaystack({
      email: orderToPay.customerEmail || orderToPay.email || "user@example.com",
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

  return (
    <>
      <div className="grid gap-6">
        {orders.map((order) => {
          const branch = branches.find((b) => b.id === order.selectedBranchId);
          const canCancel = ["pending", "confirmed", "preparing"].includes(
            order.status
          );
          const canPay =
            !order.paid &&
            order.paymentMethod !== "cash" &&
            !["delivered", "completed"].includes(order.status);
          const canReorder = ["completed", "cancelled", "failed"].includes(
            order.status
          );
          return (
            <Card
              key={order.$id}
              className="shadow-md bg-white dark:bg-gray-900"
            >
              <CardHeader className="flex flex-row items-center justify-between border-b pb-4 border-gray-200 dark:border-gray-700">
                <div>
                  <CardTitle className="text-lg font-bold text-blue-600 dark:text-blue-300">
                    Order #{order.orderId}
                  </CardTitle>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(order.createdAt).toLocaleString()}
                  </div>
                </div>
                <Badge
                  className={
                    order.status === "pending"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      : order.status === "confirmed"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : order.status === "preparing"
                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                      : order.status === "out_for_delivery"
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      : order.status === "delivered"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : order.status === "completed"
                      ? "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200"
                      : order.status === "cancelled"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      : order.status === "failed"
                      ? "bg-gray-300 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                  }
                >
                  {order.status.replace(/_/g, " ").toUpperCase()}
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 py-4">
                <div className="flex flex-wrap gap-4 items-center text-sm">
                  <span>
                    <MapPin className="inline w-4 h-4 mr-1 text-orange-500" />{" "}
                    {branch ? branch.name : "-"}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {branch ? branch.address : ""}
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    ₦{order.total?.toLocaleString()}
                  </span>
                  <span className="capitalize flex items-center gap-2">
                    Payment: {order.paymentMethod.replace(/_/g, " ")}
                    {order.paid ? (
                      <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800">
                        Paid
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-800">
                        Unpaid
                      </Badge>
                    )}
                  </span>
                </div>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/myorders/${order.orderId}`}>
                      View Details
                    </Link>
                  </Button>
                  {canPay && order.status !== "cancelled" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handlePayClick(order)}
                    >
                      Pay Now
                    </Button>
                  )}
                  {canCancel && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelClick(order)}
                    >
                      Cancel Order
                    </Button>
                  )}
                  {canReorder && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onReorder(order)}
                    >
                      Reorder
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {/* Pay Now Modal */}
      <Dialog open={payDialogOpen} onOpenChange={handlePayDialogChange}>
        <DialogContent className="dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">
              Pay for Order
            </DialogTitle>
          </DialogHeader>
          {orderToPay && (
            <>
              <div className="mb-4">
                <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Total: ₦{orderToPay.total?.toLocaleString()}
                </div>
                <div className="mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    className="w-full rounded border-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 p-2"
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
                {/* Payment options UI can be expanded here based on selectedPaymentMethod */}
                <div className="mt-4">
                  <Button
                    className="w-full"
                    onClick={handlePayNow}
                    disabled={paying}
                  >
                    {paying ? "Processing Payment..." : "Pay Now"}
                  </Button>
                  {paymentError && (
                    <p className="text-red-500 text-sm mt-2">{paymentError}</p>
                  )}
                </div>
              </div>
            </>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Cancel Confirmation Dialog - always shown for cancelable orders */}
      <Dialog open={cancelDialogOpen} onOpenChange={handleDialogChange}>
        <DialogContent className="dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="dark:text-gray-100">
              Cancel Order
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="dark:text-gray-300">
            {orderToCancel?.status === "preparing" ? (
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
            <Button variant="destructive" onClick={handleConfirmCancel}>
              Yes, Cancel Order
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