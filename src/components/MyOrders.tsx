"use client";
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Clock, CheckCircle, XCircle, Truck, MapPin, Loader2 } from 'lucide-react';
import { AppDispatch, RootState } from '@/state/store';
import {
  fetchBookedOrdersByUserId,
  cancelBookedOrder,
} from "@/state/bookedOrdersSlice";
import { branches } from "../../data/branches";
import { IBookedOrderFetched, OrderStatus } from "../../types/types";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/authContext";
import { client, validateEnv } from '@/utils/appwrite';

const ORDER_STATUS_TABS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
  { key: "failed", label: "Failed" },
];

const MyOrders = () => {
  const { userId, isAuthenticated } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.bookedOrders
  );
  const [activeTab, setActiveTab] = useState<OrderStatus | "all">("all");

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
          (
            response.events.some((e: string) => e.endsWith('.create')) ||
            response.events.some((e: string) => e.endsWith('.update')) ||
            response.events.some((e: string) => e.endsWith('.delete'))
          )
        ) {
          dispatch(fetchBookedOrdersByUserId(userId));
        }
      });
      return () => {
        unsubscribe();
      };
    }
  }, [dispatch, isAuthenticated, userId]);

  const getFilteredOrders = (status: OrderStatus | "all") => {
    if (status === "all") return orders;
    return orders.filter((order) => order.status === status);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await dispatch(cancelBookedOrder(orderId)).unwrap();
      toast.success("Order cancelled successfully");
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };

  const handleReorder = (order: IBookedOrderFetched) => {
    // TODO: Implement reorder functionality
    toast.success("Reorder functionality coming soon!");
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Required
            </h3>
            <p className="text-gray-600 text-center mb-6">
              Please log in to view your orders
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="ml-2 text-gray-600">Loading your orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="w-16 h-16 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Error Loading Orders
            </h3>
            <p className="text-gray-600 text-center mb-6">{error}</p>
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
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Track your food delivery orders</p>
      </div>
      {allOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Orders Yet
            </h3>
            <p className="text-gray-600 text-center mb-6">
              You haven't placed any orders yet. Start exploring our delicious
              menu!
            </p>
            <Button asChild>
              <Link href="/menu">Browse Menu</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as OrderStatus | "all")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-9">
            {ORDER_STATUS_TABS.map((tab) => (
              <TabsTrigger key={tab.key} value={tab.key}>
                {tab.label} (
                {tab.key === "all"
                  ? allOrders.length
                  : getFilteredOrders(tab.key).length}
                )
              </TabsTrigger>
            ))}
          </TabsList>
          {ORDER_STATUS_TABS.map((tab) => (
            <TabsContent key={tab.key} value={tab.key} className="mt-6">
              <OrdersList
                orders={getFilteredOrders(tab.key)}
                onCancel={handleCancelOrder}
                onReorder={handleReorder}
              />
            </TabsContent>
          ))}
        </Tabs>
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
  if (orders.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No orders in this category.
      </div>
    );
  }
  return (
    <div className="grid gap-6">
      {orders.map((order) => {
        const branch = branches.find((b) => b.id === order.selectedBranchId);
        const canCancel = ["pending", "confirmed", "preparing"].includes(
          order.status
        );
        const canPay =
          ["pending", "confirmed"].includes(order.status) &&
          order.paymentMethod !== "cash";
        const canReorder = ["completed", "cancelled", "failed"].includes(
          order.status
        );
        return (
          <Card key={order.$id} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
              <div>
                <CardTitle className="text-lg font-bold text-blue-600">
                  Order #{order.orderId}
                </CardTitle>
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(order.createdAt).toLocaleString()}
                </div>
              </div>
              <Badge
                className={
                  order.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : order.status === "confirmed"
                    ? "bg-blue-100 text-blue-800"
                    : order.status === "preparing"
                    ? "bg-orange-100 text-orange-800"
                    : order.status === "out_for_delivery"
                    ? "bg-purple-100 text-purple-800"
                    : order.status === "delivered"
                    ? "bg-green-100 text-green-800"
                    : order.status === "completed"
                    ? "bg-green-200 text-green-900"
                    : order.status === "cancelled"
                    ? "bg-red-100 text-red-800"
                    : order.status === "failed"
                    ? "bg-gray-300 text-gray-700"
                    : "bg-gray-100 text-gray-800"
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
                <span className="text-gray-500">
                  {branch ? branch.address : ""}
                </span>
                <span className="font-semibold">
                  ₦{order.total?.toLocaleString()}
                </span>
                <span className="capitalize flex items-center gap-2">
                  Payment: {order.paymentMethod.replace(/_/g, " ")}
                  {order.paid ? (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Paid
                    </Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800 border-red-200">
                      Unpaid
                    </Badge>
                  )}
                </span>
              </div>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/myorders/${order.orderId}`}>View Details</Link>
                </Button>
                {canPay && (
                  <Button asChild variant="default" size="sm">
                    <Link href={`/pay/${order.orderId}`}>Pay Now</Link>
                  </Button>
                )}
                {canCancel && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onCancel(order.$id)}
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
  );
};

export default MyOrders; 