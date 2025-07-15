"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/state/store";
import { fetchBookedOrdersByUserId } from "@/state/bookedOrdersSlice";
import { branches } from "../../../data/branches";
import { useRouter } from "next/navigation";

export default function OrderConfirmation() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const { orders, loading, error } = useSelector(
    (state: RootState) => state.bookedOrders
  );

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
        <div className="flex gap-4 mt-2">
          <Link
            href={`/myorders/${latestOrder.orderId}`}
            className="flex-1 border-2 border-orange-500 text-orange-600 font-bold py-3 rounded-xl text-lg transition hover:bg-orange-50 dark:hover:bg-orange-900/30 text-center"
          >
            Go to Details
          </Link>
          <Link
            href={`/pay/${latestOrder.orderId}`}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-lg transition text-center"
          >
            Pay Now
          </Link>
        </div>
      </div>
    </div>
  );
}
