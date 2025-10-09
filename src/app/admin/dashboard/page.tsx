"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/state/store";
import {
  fetchBookedOrders,
  updateBookedOrderAsync,
} from "@/state/bookedOrdersSlice";
import {
  listAsyncRestaurants,
} from "@/state/restaurantSlice"; 
import {
  listAsyncVendors,
  updateVendorStatusAsync,
  deleteVendorAsync,
} from "@/state/vendorSlice";
import {
  listAsyncRiders,
  updateRiderStatusAsync,
  deleteRiderAsync,
} from "@/state/riderSlice";
import { branches } from "../../../../data/branches";
import { IBookedOrderFetched, IRidersFetched, OrderStatus, IRestaurantFetched } from "../../../../types/types";
import { useRouter } from "next/navigation";
import { account, databases, validateEnv, client, storage } from "@/utils/appwrite";
import toast from "react-hot-toast";
import {
  Users,
  ShoppingCart,
  User,
  Building,
  Package,
} from "lucide-react";
import { Query } from "appwrite";
import OrdersTab from "@/components/OrdersTab";
import VendorsTab from "@/components/VendorsTab";
import ContentModerationTab from "@/components/ContentModerationTab";
import RidersTab from "@/components/RidersTab";
import RestaurantsTab from "@/components/RestaurantsTab";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const VENDOR_STATUSES = ["pending", "approved", "rejected"];
const RIDER_STATUSES = ["pending", "approved", "rejected"];

export default function AdminDashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading: ordersLoading, error: ordersError } = useSelector(
    (state: RootState) => state.bookedOrders
  );
  const { restaurants, loading: restaurantsLoading, error: restaurantsError } = useSelector(
    (state: RootState) => state.restaurant
  );
  const { vendors, loading: vendorsLoading, error: vendorsError } = useSelector(
    (state: RootState) => state.vendors
  );
  const { riders, loading: ridersLoading, error: ridersError } = useSelector(
    (state: RootState) => state.riders
  );

  // Tab state
  const [activeTab, setActiveTab] = useState<
    "orders" | "vendors" | "content" | "riders" | "restaurants"
  >("orders");

  // Orders state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ordersPerPage = 10;

  // Vendors state
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [vendorStatusFilter, setVendorStatusFilter] = useState<
    "pending" | "approved" | "rejected" | "all"
  >("all");
  const [vendorCurrentPage, setVendorCurrentPage] = useState(1);
  const vendorsPerPage = 10;

  // Riders state
  const [riderSearchTerm, setRiderSearchTerm] = useState("");
  const [riderStatusFilter, setRiderStatusFilter] = useState<
    "pending" | "approved" | "rejected" | "all"
  >("all");
  const [riderCurrentPage, setRiderCurrentPage] = useState(1);
  const ridersPerPage = 10;

  // Restaurants state
  const [restaurantSearchTerm, setRestaurantSearchTerm] = useState("");
  const [restaurantCurrentPage, setRestaurantCurrentPage] = useState(1);
  const restaurantsPerPage = 10;

  // Authentication check
  useEffect(() => {
    account
      .get()
      .then(async (user) => {
        if (!user) return router.replace("/");
        const { databaseId, userCollectionId } = validateEnv();
        try {
          const userDoc = await databases.getDocument(
            databaseId,
            userCollectionId,
            user.$id
          );
          if (!userDoc.isAdmin) router.replace("/");
        } catch {
          router.replace("/");
        }
      })
      .catch(() => router.replace("/"));
  }, [router]);

  // Fetch orders
  useEffect(() => {
    if (activeTab === "orders") {
      dispatch(fetchBookedOrders());
    }
  }, [dispatch, activeTab]);

  // Fetch vendors
  useEffect(() => {
    if (activeTab === "vendors") {
      dispatch(listAsyncVendors());
    }
  }, [dispatch, activeTab]);

  // Fetch riders
  useEffect(() => {
    if (activeTab === "riders") {
      dispatch(listAsyncRiders());
    }
  }, [dispatch, activeTab]);

  // Fetch restaurants
  useEffect(() => {
    if (activeTab === "restaurants") {
      dispatch(listAsyncRestaurants());
    }
  }, [dispatch, activeTab]);

  // Real-time updates for orders
  useEffect(() => {
    const { databaseId, bookedOrdersCollectionId } = validateEnv();
    const unsubscribe = client.subscribe(
      `databases.${databaseId}.collections.${bookedOrdersCollectionId}.documents`,
      () => {
        toast.success("Order list has been updated!", {
          style: { background: "#dcfce7", color: "#166534" },
        });
        dispatch(fetchBookedOrders());
      }
    );
    return () => unsubscribe();
  }, [dispatch]);

  // Real-time updates for restaurants
  useEffect(() => {
    const { databaseId, restaurantsCollectionId } = validateEnv();
    const unsubscribe = client.subscribe(
      `databases.${databaseId}.collections.${restaurantsCollectionId}.documents`,
      () => {
        toast.success("Restaurant list has been updated!", {
          style: { background: "#dcfce7", color: "#166534" },
        });
        dispatch(listAsyncRestaurants());
      }
    );
    return () => unsubscribe();
  }, [dispatch]);

  // Real-time updates for vendors
  useEffect(() => {
    const { databaseId, vendorsCollectionId } = validateEnv();
    const unsubscribe = client.subscribe(
      `databases.${databaseId}.collections.${vendorsCollectionId}.documents`,
      () => {
        toast.success("Vendor list has been updated!", {
          style: { background: "#dcfce7", color: "#166534" },
        });
        dispatch(listAsyncVendors());
      }
    );
    return () => unsubscribe();
  }, [dispatch]);

  // Real-time updates for riders
  useEffect(() => {
    const { databaseId, ridersCollectionId } = validateEnv();
    const unsubscribe = client.subscribe(
      `databases.${databaseId}.collections.${ridersCollectionId}.documents`,
      () => {
        toast.success("Rider list has been updated!", {
          style: { background: "#dcfce7", color: "#166534" },
        });
        dispatch(listAsyncRiders());
      }
    );
    return () => unsubscribe();
  }, [dispatch]);

  // Order status change handler
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const order = orders.find((o) => o.$id === orderId);
      if (!order) {
        toast.error("Order not found");
        return;
      }

      await dispatch(
        updateBookedOrderAsync({ orderId, orderData: { status: newStatus } })
      ).unwrap();

      toast.success("Order status updated");
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Error updating order status:", error);
    }
  };

  // Vendor status change handler
  const handleVendorStatusChange = async (
    vendorId: string,
    newStatus: "pending" | "approved" | "rejected"
  ) => {
    try {
      const vendor = vendors.find((v) => v.$id === vendorId);
      if (!vendor) {
        toast.error("Vendor not found");
        return;
      }

      await dispatch(
        updateVendorStatusAsync({ vendorId, newStatus })
      ).unwrap();

      if (newStatus !== "pending") {
        const notificationResponse = await fetch("/api/vendor/send-notifications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            vendorEmail: vendor.email,
            vendorName: vendor.fullName,
            businessName: vendor.businessName,
            status: newStatus,
          }),
        });

        if (!notificationResponse.ok) {
          console.error("Failed to send notification:", await notificationResponse.text());
          toast.success(`Vendor status updated to ${newStatus}`);
          toast.error("Failed to send email notification");
          return;
        }

        toast.success(`Vendor status updated to ${newStatus} and email sent`);
      } else {
        toast.success(`Vendor status updated to ${newStatus}`);
      }
    } catch (error: any) {
      console.error("Error updating vendor status:", error);
      toast.error(error.message || "Failed to update vendor status");
    }
  };

  // Vendor delete handler
  const handleVendorDelete = async (vendorId: string) => {
    try {
      const vendor = vendors.find((v) => v.$id === vendorId);
      if (!vendor) {
        toast.error("Vendor not found");
        return;
      }
      await dispatch(deleteVendorAsync(vendorId)).unwrap();
      toast.success("Vendor deleted successfully");
    } catch (error: any) {
      console.error("Error deleting vendor:", error);
      toast.error(error.message || "Failed to delete vendor");
    }
  };

  // Rider status change handler
  const handleRiderStatusChange = async (
    riderId: string,
    newStatus: "pending" | "approved" | "rejected"
  ) => {
    try {
      const rider = riders.find((r) => r.$id === riderId);
      if (!rider) {
        toast.error("Rider not found");
        return;
      }

      await dispatch(
        updateRiderStatusAsync({ riderId, newStatus })
      ).unwrap();

      toast.success(`Rider status updated to ${newStatus}`);
    } catch (error: any) {
      console.error("Error updating rider status:", error);
      toast.error(error.message || "Failed to update rider status");
    }
  };

  // Rider delete handler
  const handleRiderDelete = async (riderId: string) => {
    try {
      const rider = riders.find((r) => r.$id === riderId);
      if (!rider) {
        toast.error("Rider not found");
        return;
      }
      await dispatch(deleteRiderAsync(riderId)).unwrap();
      toast.success("Rider deleted successfully");
    } catch (error: any) {
      console.error("Error deleting rider:", error);
      toast.error(error.message || "Failed to delete rider");
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order: IBookedOrderFetched) => {
    const matchesSearch =
      order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter vendors
  const filteredVendors = vendors.filter((vendor) => {
    const matchesSearch =
      vendor.fullName.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
      vendor.businessName.toLowerCase().includes(vendorSearchTerm.toLowerCase());
    const matchesStatus =
      vendorStatusFilter === "all" || vendor.status === vendorStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter riders
  const filteredRiders = riders.filter((rider) => {
    const matchesSearch =
      rider.fullName.toLowerCase().includes(riderSearchTerm.toLowerCase()) ||
      rider.phone.toLowerCase().includes(riderSearchTerm.toLowerCase()) ||
      rider.email?.toLowerCase().includes(riderSearchTerm.toLowerCase()) ||
      rider.address?.toLowerCase().includes(riderSearchTerm.toLowerCase());
    const matchesStatus =
      riderStatusFilter === "all" || rider.status === riderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter restaurants
  const filteredRestaurants = restaurants.filter((restaurant: IRestaurantFetched) => {
    return restaurant.name.toLowerCase().includes(restaurantSearchTerm.toLowerCase());
  });

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const paginatedVendors = filteredVendors.slice(
    (vendorCurrentPage - 1) * vendorsPerPage,
    vendorCurrentPage * vendorsPerPage
  );

  const paginatedRiders = filteredRiders.slice(
    (riderCurrentPage - 1) * ridersPerPage,
    riderCurrentPage * ridersPerPage
  );

  const paginatedRestaurants = filteredRestaurants.slice(
    (restaurantCurrentPage - 1) * restaurantsPerPage,
    restaurantCurrentPage * restaurantsPerPage
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-orange-600 text-center sm:text-left mb-6">
            Admin Dashboard
          </h1>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("orders")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "orders"
                  ? "bg-white dark:bg-gray-700 text-orange-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-orange-600"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              Orders
            </button>
            <button
              onClick={() => setActiveTab("vendors")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "vendors"
                  ? "bg-white dark:bg-gray-700 text-orange-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-orange-600"
              }`}
            >
              <Users className="w-4 h-4" />
              Vendors
            </button>
            <button
              onClick={() => setActiveTab("restaurants")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "restaurants"
                  ? "bg-white dark:bg-gray-700 text-orange-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-orange-600"
              }`}
            >
              <Building className="w-4 h-4" />
              Restaurants
            </button>
            <button
              onClick={() => setActiveTab("content")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "content"
                  ? "bg-white dark:bg-gray-700 text-orange-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-orange-600"
              }`}
            >
              <Package className="w-4 h-4" />
              Content
            </button>
            <button
              onClick={() => setActiveTab("riders")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === "riders"
                  ? "bg-white dark:bg-gray-700 text-orange-600 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:text-orange-600"
              }`}
            >
              <User className="w-4 h-4" />
              Riders
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === "orders" && (
          <OrdersTab
            orders={paginatedOrders}
            loading={ordersLoading}
            error={ordersError}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            filteredOrders={filteredOrders}
            ordersPerPage={ordersPerPage}
            handleStatusChange={handleStatusChange}
            ORDER_STATUSES={ORDER_STATUSES}
            branches={branches}
          />
        )}

        {activeTab === "vendors" && (
          <VendorsTab
            vendors={paginatedVendors}
            loading={vendorsLoading}
            error={vendorsError}
            searchTerm={vendorSearchTerm}
            setSearchTerm={setVendorSearchTerm}
            statusFilter={vendorStatusFilter}
            setStatusFilter={setVendorStatusFilter}
            currentPage={vendorCurrentPage}
            setCurrentPage={setVendorCurrentPage}
            filteredVendors={filteredVendors}
            vendorsPerPage={vendorsPerPage}
            handleVendorStatusChange={handleVendorStatusChange}
            handleVendorDelete={handleVendorDelete}
            VENDOR_STATUSES={VENDOR_STATUSES}
          />
        )}

        {activeTab === "restaurants" && (
          <RestaurantsTab
            restaurants={paginatedRestaurants}
            loading={restaurantsLoading}
            error={restaurantsError}
            searchTerm={restaurantSearchTerm}
            setSearchTerm={setRestaurantSearchTerm}
            currentPage={restaurantCurrentPage}
            setCurrentPage={setRestaurantCurrentPage}
            filteredRestaurants={filteredRestaurants}
            restaurantsPerPage={restaurantsPerPage}
          />
        )}

        {activeTab === "content" && <ContentModerationTab />}

        {activeTab === "riders" && (
          <RidersTab
            riders={paginatedRiders}
            loading={ridersLoading}
            error={ridersError}
            searchTerm={riderSearchTerm}
            setSearchTerm={setRiderSearchTerm}
            statusFilter={riderStatusFilter}
            setStatusFilter={setRiderStatusFilter}
            currentPage={riderCurrentPage}
            setCurrentPage={setRiderCurrentPage}
            filteredRiders={filteredRiders}
            ridersPerPage={ridersPerPage}
            handleRiderStatusChange={handleRiderStatusChange}
            handleRiderDelete={handleRiderDelete}
            RIDER_STATUSES={RIDER_STATUSES}
          />
        )}
      </div>
    </div>
  );
}