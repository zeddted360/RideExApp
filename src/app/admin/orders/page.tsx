"use client";
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/state/store';
import { fetchBookedOrdersByUserId as fetchAllOrders, fetchBookedOrderById, updateBookedOrderAsync } from '@/state/bookedOrdersSlice';
import { branches } from '../../../../data/branches';
import { OrderStatus } from '../../../../types/types';
import { useAuth } from '@/context/authContext';

const ORDER_STATUSES = [
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

export default function AdminOrdersPage() {
  const { userId } = useAuth();
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading, error } = useSelector((state: RootState) => state.bookedOrders);

  // For demo, fetch all orders for a dummy admin user (or fetch all if you have an endpoint)
  useEffect(() => {
    // Replace with a real admin fetch if you have one
    dispatch(fetchAllOrders(userId || ""));
  }, [dispatch, userId]);

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    dispatch(updateBookedOrderAsync({ orderId, orderData: { status: newStatus } }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-2">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-orange-600 mb-8">Admin Orders Dashboard</h1>
        {loading && <div className="text-orange-600 font-semibold">Loading orders...</div>}
        {error && <div className="text-red-600 font-semibold">{error}</div>}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-md">
            <thead>
              <tr className="bg-orange-100 dark:bg-orange-900/30">
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Order ID</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Branch</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">User</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Created</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Status</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Payment Status</th>
                <th className="py-3 px-4 text-left text-xs font-bold text-gray-700 dark:text-gray-200">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders && orders.length > 0 ? orders.map(order => {
                const branch = branches.find(b => b.id === order.selectedBranchId);
                return (
                  <tr key={order.$id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition">
                    <td className="py-3 px-4 font-mono text-blue-600 font-bold">#{order.orderId}</td>
                    <td className="py-3 px-4">{branch ? branch.name : '-'}</td>
                    <td className="py-3 px-4">{order.customerId}</td>
                    <td className="py-3 px-4 text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order.$id, e.target.value as OrderStatus)}
                        className="rounded border border-orange-300 px-2 py-1 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-orange-400"
                      >
                        {ORDER_STATUSES.map(status => (
                          <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      {order.paid ? (
                        <span className="inline-block px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold border border-green-200">Paid</span>
                      ) : (
                        <span className="inline-block px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-semibold border border-red-200">Unpaid</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <a
                        href={`/myorders/${order.orderId}`}
                        className="text-orange-600 hover:underline font-semibold"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        View
                      </a>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 