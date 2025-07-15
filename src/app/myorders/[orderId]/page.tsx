"use client";
import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/state/store';
import { fetchBookedOrderById, cancelBookedOrder } from '@/state/bookedOrdersSlice';
import { branches } from '../../../../data/branches';
import { CheckCircle, MapPin, CreditCard, Landmark, Truck, XCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { client, validateEnv } from '@/utils/appwrite';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

const rideExLogo = '/images/logo.png'; 

const statusSteps = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'preparing', label: 'Preparing' },
  { key: 'out_for_delivery', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
];

function getStatusIndex(status: string) {
  return statusSteps.findIndex(s => s.key === status) !== -1
    ? statusSteps.findIndex(s => s.key === status)
    : 0;
}

export default function OrderDetailsPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { currentOrder, loading, error } = useSelector((state: RootState) => state.bookedOrders);
  const menuItems = useSelector((state: RootState) => state.menuItem.menuItems);
  const featuredItems = useSelector((state: RootState) => state.featuredItem.featuredItems);
  const popularItems = useSelector((state: RootState) => state.popularItem.popularItems);

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
    }
  }, [orderId, dispatch]);

  // Real-time listener for order updates
  useEffect(() => {
    if (!orderId) return;
      const { bookedOrdersCollectionId, databaseId } = validateEnv();
    const channel = `databases.${databaseId}.collections.${bookedOrdersCollectionId}.documents.${orderId}`;
    const unsubscribe = client.subscribe(channel, (response: any) => {
      if (response.events.includes('databases.*.collections.*.documents.*.update')) {
        dispatch(fetchBookedOrderById(orderId));
      }
    });
    return () => {
      unsubscribe();
    };
  }, [orderId, dispatch]);

  const branch = currentOrder ? branches.find(b => b.id === currentOrder.selectedBranchId) : null;
  const statusIdx = currentOrder ? getStatusIndex(currentOrder.status) : 0;

  const handleCancelOrder = async () => {
    if (currentOrder) {
      await dispatch(cancelBookedOrder(currentOrder.$id));
      router.push('/myorders');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        <span className="ml-3 text-lg font-semibold text-orange-600">Loading order details...</span>
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
        <span className="ml-3 text-lg font-semibold text-gray-700 dark:text-gray-200">Order not found.</span>
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
          <Image src={rideExLogo} alt="RideEx Logo" width={60} height={60} className="rounded-full shadow-md" />
        </div>
        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 mb-6 border border-orange-100 dark:border-orange-900/40 relative overflow-hidden">
          {/* Status Progress Bar */}
          <div className="flex items-center justify-between mb-6">
            {statusSteps.map((step, idx) => (
              <div key={step.key} className="flex-1 flex flex-col items-center">
                <div className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${idx <= statusIdx ? 'bg-orange-500 border-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-400'}`}>
                  {idx < statusIdx ? <CheckCircle className="w-5 h-5" /> : idx === statusIdx ? <div className="w-3 h-3 rounded-full bg-orange-500" /> : <div className="w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700" />}
                </div>
                <span className={`mt-2 text-xs font-semibold ${idx <= statusIdx ? 'text-orange-600' : 'text-gray-400 dark:text-gray-500'}`}>{step.label}</span>
                {idx < statusSteps.length - 1 && (
                  <div className={`h-1 w-8 ${idx < statusIdx ? 'bg-orange-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>
                )}
              </div>
            ))}
          </div>
          {/* Order Info Section */}
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">Order ID:</span>
              <span className="text-lg font-bold text-blue-600">#{currentOrder.orderId}</span>
            </div>
            <div className="text-xs text-gray-500 mb-1">
              {new Date(currentOrder.createdAt).toLocaleString()}
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-500" />
              <span className="font-semibold text-gray-800 dark:text-gray-100">Delivery</span>
            </div>
          </div>
          {/* Delivery Estimate */}
          <div className="mb-4 flex flex-col items-center">
            <span className="block text-gray-500 text-sm mb-1">Estimated delivery time</span>
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{currentOrder.deliveryDuration || '40 min'}</span>
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
              <span className="font-semibold text-gray-900 dark:text-white">{branch.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {currentOrder.paymentMethod === 'card' ? <CreditCard className="w-4 h-4 text-orange-500" /> : <Landmark className="w-4 h-4 text-orange-500" />}
              <span className="font-semibold text-orange-600 capitalize">{currentOrder.paymentMethod.replace(/_/g, ' ')}</span>
            </div>
            <div className="text-xs text-gray-500 ml-6">{branch.address}</div>
          </div>
          {/* Order Summary (if available) */}
          {/* You can expand this with items, total, etc. if you have that data */}
          <div className="flex flex-col gap-1 mb-4 bg-orange-50 dark:bg-orange-900/30 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-300">Delivery Fee</span>
              <span className="font-semibold text-gray-900 dark:text-white">₦{currentOrder.deliveryFee?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold">
              <span>Total</span>
              <span>₦{currentOrder.total?.toLocaleString()}</span>
            </div>
          </div>
          {/* Thank you message */}
          <div className="text-center text-gray-700 dark:text-gray-200 mb-4">
            Got your order! Thank you for choosing <span className="font-bold text-orange-600">RideEx</span>.
          </div>
          {/* Order Items Accordion */}
          {itemIds.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2 text-orange-600">Order Items</h3>
              <Accordion type="multiple">
                              {itemIds.map((id, idx) => {
                    console.log("item ids are:", id)
                  const item = findItemById(id);
                  return (
                    <AccordionItem key={id} value={id} className="border-b border-orange-100 dark:border-orange-900/40">
                      <AccordionTrigger>
                        <div className="flex items-center gap-3">
                          {item && item.image ? (
                            <Image src={item.image.startsWith('http') ? item.image : `/public/${item.image}`} alt={item.name} width={40} height={40} className="rounded object-cover w-10 h-10" />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-gray-400">?</div>
                          )}
                          <span className="font-semibold text-gray-900 dark:text-gray-100">{item ? item.name : `Item ${id}`}</span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        {item ? (
                          <div className="p-2">
                            <div className="text-sm text-gray-700 dark:text-gray-200 mb-1">{item.description || "No description available."}</div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-bold text-orange-600">₦{item.price}</span>
                              {item.category && <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-2 py-0.5 rounded text-xs">{item.category}</span>}
                            </div>
                          </div>
                        ) : (
                          <div className="p-2 text-gray-400">Item details not found.</div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <Link
              href={`/pay/${currentOrder.orderId}`}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-lg transition text-center"
            >
              Pay Now
            </Link>
            <button
              onClick={handleCancelOrder}
              className="flex-1 border-2 border-orange-500 text-orange-600 font-bold py-3 rounded-xl text-lg transition hover:bg-orange-50 dark:hover:bg-orange-900/30"
            >
              Cancel Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 