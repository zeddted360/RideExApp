// "use client";
// import React, { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState, AppDispatch } from "@/state/store";
// import {
//   fetchBookedOrders,
//   updateBookedOrderAsync,
// } from "@/state/bookedOrdersSlice";
// import { branches } from "../../../../data/branches";
// import { IVendor, IVendorFetched, OrderStatus } from "../../../../types/types";
// import { useRouter } from "next/navigation";
// import { account, databases, validateEnv, client } from "@/utils/appwrite";
// import {
//   sendOrderStatusUpdateSMS,
//   sendDeliveryStartedSMS,
//   sendOrderDeliveredSMS,
// } from "@/utils/smsService";
// import toast from "react-hot-toast";
// import {
//   Search,
//   Filter,
//   ChevronDown,
//   Users,
//   ShoppingCart,
//   CheckCircle,
//   XCircle,
//   Clock,
//   User,
//   Mail,
//   Phone,
//   Building,
//   MapPin,
//   Calendar,
//   Eye,
//   Loader2,
// } from "lucide-react";
// import { Query } from "appwrite";

// const ORDER_STATUSES = [
//   "pending",
//   "confirmed",
//   "preparing",
//   "out_for_delivery",
//   "delivered",
//   "cancelled",
// ];

// const VENDOR_STATUSES = ["pending", "approved", "rejected"];


// export default function AdminDashboard() {
//   const router = useRouter();
//   const dispatch = useDispatch<AppDispatch>();
//   const { orders, loading: ordersLoading, error: ordersError } = useSelector(
//     (state: RootState) => state.bookedOrders
//   );

//   // Tab state
//   const [activeTab, setActiveTab] = useState<"orders" | "vendors">("orders");

//   // Orders state
//   const [searchTerm, setSearchTerm] = useState("");
//   const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
//   const [currentPage, setCurrentPage] = useState(1);
//   const ordersPerPage = 10;

//   // Vendors state
//   const [vendors, setVendors] = useState<IVendorFetched[]>([]);
//   const [vendorsLoading, setVendorsLoading] = useState(false);
//   const [vendorsError, setVendorsError] = useState<string | null>(null);
//   const [vendorSearchTerm, setVendorSearchTerm] = useState("");
//   const [vendorStatusFilter, setVendorStatusFilter] = useState<
//     "pending" | "approved" | "rejected" | "all"
//   >("all");
//   const [vendorCurrentPage, setVendorCurrentPage] = useState(1);
//   const vendorsPerPage = 10;

//   // Authentication check
//   useEffect(() => {
//     account
//       .get()
//       .then(async (user) => {
//         if (!user) return router.replace("/");
//         const { databaseId, userCollectionId } = validateEnv();
//         try {
//           const userDoc = await databases.getDocument(
//             databaseId,
//             userCollectionId,
//             user.$id
//           );
//           if (!userDoc.isAdmin) router.replace("/");
//         } catch {
//           router.replace("/");
//         }
//       })
//       .catch(() => router.replace("/"));
//   }, [router]);

//   // Fetch orders
//   useEffect(() => {
//     if (activeTab === "orders") {
//       dispatch(fetchBookedOrders());
//     }
//   }, [dispatch, activeTab]);

//   // Fetch vendors
//   const fetchVendors = async () => {
//     if (activeTab !== "vendors") return;
//     setVendorsLoading(true);
//     setVendorsError(null);
//     try {
//       const { databaseId, vendorsCollectionId } = validateEnv();
//       const response = await databases.listDocuments(
//         databaseId,
//         vendorsCollectionId,
//         [
//           Query.orderDesc("$createdAt"),
//           Query.limit(100),
//         ]
//       );
//       setVendors(response.documents as unknown as IVendorFetched[]);
//     } catch (error: any) {
//       console.error("Error fetching vendors:", error);
//       setVendorsError("Failed to fetch vendors");
//       toast.error("Failed to fetch vendors");
//     } finally {
//       setVendorsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchVendors();
//   }, [activeTab]);

//   // Real-time updates for orders
//   useEffect(() => {
//     const { databaseId, bookedOrdersCollectionId } = validateEnv();
//     const unsubscribe = client.subscribe(
//       `databases.${databaseId}.collections.${bookedOrdersCollectionId}.documents`,
//       () => {
//         toast.success("Order list has been updated!", {
//           style: { background: "#dcfce7", color: "#166534" },
//         });
//         dispatch(fetchBookedOrders());
//       }
//     );
//     return () => unsubscribe();
//   }, [dispatch]);

//   // Real-time updates for vendors
//   useEffect(() => {
//     const { databaseId, vendorsCollectionId } = validateEnv();
//     const unsubscribe = client.subscribe(
//       `databases.${databaseId}.collections.${vendorsCollectionId}.documents`,
//       () => {
//         toast.success("Vendor list has been updated!", {
//           style: { background: "#dcfce7", color: "#166534" },
//         });
//         fetchVendors();
//       }
//     );
//     return () => unsubscribe();
//   }, []);

//   // Order status change handler
//   const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
//     try {
//       const order = orders.find((o) => o.$id === orderId);
//       if (!order) {
//         toast.error("Order not found");
//         return;
//       }

//       await dispatch(
//         updateBookedOrderAsync({ orderId, orderData: { status: newStatus } })
//       ).unwrap();

//       let smsSent = false;
//       switch (newStatus) {
//         case "confirmed":
//           smsSent = await sendOrderStatusUpdateSMS(
//             order.orderId,
//             "confirmed",
//             order.phone,
//             "30-45 minutes"
//           );
//           break;
//         case "preparing":
//           smsSent = await sendOrderStatusUpdateSMS(
//             order.orderId,
//             "preparing",
//             order.phone,
//             "20-30 minutes"
//           );
//           break;
//         case "out_for_delivery":
//           smsSent = await sendDeliveryStartedSMS(
//             order.orderId,
//             order.phone,
//             "15-20 minutes"
//           );
//           break;
//         case "delivered":
//           smsSent = await sendOrderDeliveredSMS(order.orderId, order.phone);
//           break;
//         case "cancelled":
//           smsSent = await sendOrderStatusUpdateSMS(
//             order.orderId,
//             "cancelled",
//             order.phone
//           );
//           break;
//         default:
//           smsSent = await sendOrderStatusUpdateSMS(
//             order.orderId,
//             newStatus,
//             order.phone
//           );
//       }

//       if (smsSent) {
//         toast.success(`Order status updated and SMS sent`);
//       } else {
//         toast.success(`Order status updated`);
//         toast.error("Failed to send SMS notification");
//       }
//     } catch (error) {
//       toast.error("Failed to update order status");
//       console.error("Error updating order status:", error);
//     }
//   };

//   // Vendor status change handler
//   const handleVendorStatusChange = async (
//     vendorId: string,
//     newStatus: "approved" | "rejected"
//   ) => {
//     try {
//       const vendor = vendors.find((v) => v.$id === vendorId);
//       if (!vendor) {
//         toast.error("Vendor not found");
//         return;
//       }

//       const { databaseId, vendorsCollectionId } = validateEnv();
//       await databases.updateDocument(databaseId, vendorsCollectionId, vendorId, {
//         status: newStatus,
//       });

//       // Update local state
//       setVendors((prev) =>
//         prev.map((v) => (v.$id === vendorId ? { ...v, status: newStatus } : v))
//       );

//       // Send email notification to vendor
//       const notificationResponse = await fetch("/api/vendor/send-notifications", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           vendorEmail: vendor.email,
//           vendorName: vendor.fullName,
//           businessName: vendor.businessName,
//           status: newStatus,
//         }),
//       });

//       if (!notificationResponse.ok) {
//         console.error("Failed to send notification:", await notificationResponse.text());
//         toast.success(`Vendor status updated to ${newStatus}`);
//         toast.error("Failed to send email notification");
//         return;
//       }

//       toast.success(`Vendor status updated to ${newStatus} and email sent`);
//     } catch (error) {
//       console.error("Error updating vendor status:", error);
//       toast.error("Failed to update vendor status");
//     }
//   };

//   // Filter orders
//   const filteredOrders = orders.filter((order) => {
//     const matchesSearch =
//       order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       order.customerId.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesStatus =
//       statusFilter === "all" || order.status === statusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   // Filter vendors
//   const filteredVendors = vendors.filter((vendor) => {
//     const matchesSearch =
//       vendor.fullName.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
//       vendor.email.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
//       vendor.businessName.toLowerCase().includes(vendorSearchTerm.toLowerCase());
//     const matchesStatus =
//       vendorStatusFilter === "all" || vendor.status === vendorStatusFilter;
//     return matchesSearch && matchesStatus;
//   });

//   const paginatedOrders = filteredOrders.slice(
//     (currentPage - 1) * ordersPerPage,
//     currentPage * ordersPerPage
//   );

//   const paginatedVendors = filteredVendors.slice(
//     (vendorCurrentPage - 1) * vendorsPerPage,
//     vendorCurrentPage * vendorsPerPage
//   );

//   const getStatusBadge = (status: string) => {
//     const baseClasses =
//       "inline-block px-3 py-1 rounded-full text-xs font-semibold border";
//     switch (status) {
//       case "pending":
//         return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-200`;
//       case "approved":
//         return `${baseClasses} bg-green-100 text-green-800 border-green-200`;
//       case "rejected":
//         return `${baseClasses} bg-red-100 text-red-800 border-red-200`;
//       default:
//         return `${baseClasses} bg-gray-100 text-gray-800 border-gray-200`;
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-6 sm:mb-8">
//           <h1 className="text-2xl sm:text-3xl font-extrabold text-orange-600 text-center sm:text-left mb-6">
//             Admin Dashboard
//           </h1>

//           {/* Tab Navigation */}
//           <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
//             <button
//               onClick={() => setActiveTab("orders")}
//               className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
//                 activeTab === "orders"
//                   ? "bg-white dark:bg-gray-700 text-orange-600 shadow-sm"
//                   : "text-gray-600 dark:text-gray-300 hover:text-orange-600"
//               }`}
//             >
//               <ShoppingCart className="w-4 h-4" />
//               Orders
//             </button>
//             <button
//               onClick={() => setActiveTab("vendors")}
//               className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
//                 activeTab === "vendors"
//                   ? "bg-white dark:bg-gray-700 text-orange-600 shadow-sm"
//                   : "text-gray-600 dark:text-gray-300 hover:text-orange-600"
//               }`}
//             >
//               <Users className="w-4 h-4" />
//               Vendors
//             </button>
//           </div>
//         </div>

//         {/* Orders Tab */}
//         {activeTab === "orders" && (
//           <>
//             {/* Orders Filters */}
//             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
//               <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
//                 Order Management
//               </h2>
//               <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
//                 <div className="relative flex-1 sm:flex-none">
//                   <Search
//                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                     size={18}
//                   />
//                   <input
//                     type="text"
//                     placeholder="Search orders..."
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full pl-10 pr-4 py-3 sm:py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
//                   />
//                 </div>
//                 <div className="relative flex-1 sm:flex-none">
//                   <Filter
//                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                     size={18}
//                   />
//                   <select
//                     value={statusFilter}
//                     onChange={(e) =>
//                       setStatusFilter(e.target.value as OrderStatus | "all")
//                     }
//                     className="w-full pl-10 pr-8 py-3 sm:py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 appearance-none"
//                   >
//                     <option value="all">All Statuses</option>
//                     {ORDER_STATUSES.map((status) => (
//                       <option key={status} value={status}>
//                         {status.replace(/_/g, " ")}
//                       </option>
//                     ))}
//                   </select>
//                   <ChevronDown
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                     size={18}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Orders Content */}
//             {ordersLoading ? (
//               <div className="space-y-4">
//                 {[...Array(5)].map((_, index) => (
//                   <div
//                     key={index}
//                     className="animate-pulse bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
//                   >
//                     <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
//                     <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
//                     <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
//                   </div>
//                 ))}
//               </div>
//             ) : ordersError ? (
//               <div className="text-red-600 font-semibold p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
//                 {ordersError}
//               </div>
//             ) : (
//               <>
//                 {/* Desktop Orders Table */}
//                 <div className="hidden lg:block overflow-x-auto">
//                   <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-md">
//                     <thead className="bg-orange-100 dark:bg-orange-900/30">
//                       <tr>
//                         <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
//                           Order ID
//                         </th>
//                         <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
//                           Branch
//                         </th>
//                         <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
//                           User
//                         </th>
//                         <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
//                           Created
//                         </th>
//                         <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
//                           Status
//                         </th>
//                         <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
//                           Payment
//                         </th>
//                         <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {paginatedOrders.length > 0 ? (
//                         paginatedOrders.map((order) => {
//                           const branch = branches.find(
//                             (b) => b.id === order.selectedBranchId
//                           );
//                           return (
//                             <tr
//                               key={order.$id}
//                               className="border-b border-gray-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
//                             >
//                               <td className="py-4 px-6 font-mono text-blue-600 font-bold">
//                                 #{order.orderId}
//                               </td>
//                               <td className="py-4 px-6">
//                                 {branch ? branch.name : "-"}
//                               </td>
//                               <td className="py-4 px-6">{order.customerId}</td>
//                               <td className="py-4 px-6 text-xs text-gray-500">
//                                 {new Date(order.createdAt).toLocaleString()}
//                               </td>
//                               <td className="py-4 px-6">
//                                 <select
//                                   value={order.status}
//                                   onChange={(e) =>
//                                     handleStatusChange(
//                                       order.$id,
//                                       e.target.value as OrderStatus
//                                     )
//                                   }
//                                   className="rounded-lg border border-orange-300 px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 w-full"
//                                 >
//                                   {ORDER_STATUSES.map((status) => (
//                                     <option key={status} value={status}>
//                                       {status.replace(/_/g, " ")}
//                                     </option>
//                                   ))}
//                                 </select>
//                               </td>
//                               <td className="py-4 px-6">
//                                 {order.paid ? (
//                                   <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold border border-green-200">
//                                     Paid
//                                   </span>
//                                 ) : (
//                                   <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold border border-red-200">
//                                     Unpaid
//                                   </span>
//                                 )}
//                               </td>
//                               <td className="py-4 px-6">
//                                 <a
//                                   href={`/myorders/${order.orderId}`}
//                                   className="text-orange-600 hover:text-orange-800 font-semibold transition"
//                                   target="_blank"
//                                   rel="noopener noreferrer"
//                                 >
//                                   <Eye className="w-5 h-5" />
//                                 </a>
//                               </td>
//                             </tr>
//                           );
//                         })
//                       ) : (
//                         <tr>
//                           <td
//                             colSpan={7}
//                             className="py-8 text-center text-gray-500"
//                           >
//                             No orders found.
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Mobile Orders View */}
//                 <div className="lg:hidden space-y-4">
//                   {paginatedOrders.length > 0 ? (
//                     paginatedOrders.map((order) => {
//                       const branch = branches.find(
//                         (b) => b.id === order.selectedBranchId
//                       );
//                       return (
//                         <div
//                           key={order.$id}
//                           className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
//                         >
//                           <div className="flex justify-between items-center mb-3">
//                             <span className="font-mono text-blue-600 font-bold text-sm">
//                               #{order.orderId}
//                             </span>
//                             <a
//                               href={`/myorders/${order.orderId}`}
//                               className="text-orange-600 hover:text-orange-800 font-semibold text-sm"
//                               target="_blank"
//                               rel="noopener noreferrer"
//                             >
//                               <Eye className="w-5 h-5" />
//                             </a>
//                           </div>
//                           <div className="space-y-2 mb-3">
//                             <p className="text-sm text-gray-500">
//                               <span className="font-medium">Branch:</span>{" "}
//                               {branch ? branch.name : "-"}
//                             </p>
//                             <p className="text-sm text-gray-500">
//                               <span className="font-medium">User:</span>{" "}
//                               {order.customerId}
//                             </p>
//                             <p className="text-sm text-gray-500">
//                               <span className="font-medium">Created:</span>{" "}
//                               {new Date(order.createdAt).toLocaleString()}
//                             </p>
//                           </div>
//                           <div className="space-y-3">
//                             <div>
//                               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                                 Status
//                               </label>
//                               <select
//                                 value={order.status}
//                                 onChange={(e) =>
//                                   handleStatusChange(
//                                     order.$id,
//                                     e.target.value as OrderStatus
//                                   )
//                                 }
//                                 className="w-full rounded-lg border border-orange-300 px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-orange-400"
//                               >
//                                 {ORDER_STATUSES.map((status) => (
//                                   <option key={status} value={status}>
//                                     {status.replace(/_/g, " ")}
//                                   </option>
//                                 ))}
//                               </select>
//                             </div>
//                             <div>
//                               <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                                 Payment:
//                               </span>
//                               {order.paid ? (
//                                 <span className="ml-2 inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold border border-green-200">
//                                   Paid
//                                 </span>
//                               ) : (
//                                 <span className="ml-2 inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold border border-red-200">
//                                   Unpaid
//                                 </span>
//                               )}
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })
//                   ) : (
//                     <div className="text-center text-gray-500 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
//                       No orders found.
//                     </div>
//                   )}
//                 </div>

//                 {/* Orders Pagination */}
//                 {filteredOrders.length > ordersPerPage && (
//                   <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
//                     <button
//                       onClick={() =>
//                         setCurrentPage((prev) => Math.max(prev - 1, 1))
//                       }
//                       disabled={currentPage === 1}
//                       className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700 transition text-sm"
//                     >
//                       Previous
//                     </button>
//                     <span className="text-gray-600 dark:text-gray-300 text-sm text-center">
//                       Page {currentPage} of{" "}
//                       {Math.ceil(filteredOrders.length / ordersPerPage)}
//                     </span>
//                     <button
//                       onClick={() =>
//                         setCurrentPage((prev) =>
//                           Math.min(
//                             prev + 1,
//                             Math.ceil(filteredOrders.length / ordersPerPage)
//                           )
//                         )
//                       }
//                       disabled={
//                         currentPage ===
//                         Math.ceil(filteredOrders.length / ordersPerPage)
//                       }
//                       className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700 transition text-sm"
//                     >
//                       Next
//                     </button>
//                   </div>
//                 )}
//               </>
//             )}
//           </>
//         )}

//         {/* Vendors Tab */}
//         {activeTab === "vendors" && (
//           <>
//             {/* Vendors Filters */}
//             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
//               <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
//                 Vendor Management
//               </h2>
//               <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
//                 <div className="relative flex-1 sm:flex-none">
//                   <Search
//                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                     size={18}
//                   />
//                   <input
//                     type="text"
//                     placeholder="Search vendors..."
//                     value={vendorSearchTerm}
//                     onChange={(e) => setVendorSearchTerm(e.target.value)}
//                     className="w-full pl-10 pr-4 py-3 sm:py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
//                   />
//                 </div>
//                 <div className="relative flex-1 sm:flex-none">
//                   <Filter
//                     className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                     size={18}
//                   />
//                   <select
//                     value={vendorStatusFilter}
//                     onChange={(e) =>
//                       setVendorStatusFilter(
//                         e.target.value as "pending" | "approved" | "rejected" | "all"
//                       )
//                     }
//                     className="w-full pl-10 pr-8 py-3 sm:py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 appearance-none"
//                   >
//                     <option value="all">All Statuses</option>
//                     {VENDOR_STATUSES.map((status) => (
//                       <option key={status} value={status}>
//                         {status.charAt(0).toUpperCase() + status.slice(1)}
//                       </option>
//                     ))}
//                   </select>
//                   <ChevronDown
//                     className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
//                     size={18}
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Vendors Content */}
//             {vendorsLoading ? (
//               <div className="space-y-4">
//                 {[...Array(5)].map((_, index) => (
//                   <div
//                     key={index}
//                     className="animate-pulse bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
//                   >
//                     <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
//                     <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
//                     <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
//                   </div>
//                 ))}
//               </div>
//             ) : vendorsError ? (
//               <div className="text-red-600 font-semibold p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
//                 {vendorsError}
//               </div>
//             ) : (
//               <>
//                 {/* Desktop Vendors Table */}
//                 <div className="hidden lg:block overflow-x-auto">
//                   <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-md">
//                     <thead className="bg-orange-100 dark:bg-orange-900/30">
//                       <tr>
//                         <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
//                           Vendor
//                         </th>
//                         <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
//                           Business
//                         </th>
//                         <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
//                           Contact
//                         </th>
//                         <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
//                           Location
//                         </th>
//                         <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
//                           Status
//                         </th>
//                         <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {paginatedVendors.length > 0 ? (
//                         paginatedVendors.map((vendor) => (
//                           <tr
//                             key={vendor.$id}
//                             className="border-b border-gray-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
//                           >
//                             <td className="py-4 px-6">
//                               <div className="flex items-center gap-3">
//                                 <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
//                                   <User className="w-5 h-5 text-orange-600" />
//                                 </div>
//                                 <div>
//                                   <p className="font-medium text-gray-900 dark:text-gray-100">
//                                     {vendor.fullName}
//                                   </p>
//                                   <p className="text-sm text-gray-500">
//                                     {vendor.email}
//                                   </p>
//                                 </div>
//                               </div>
//                             </td>
//                             <td className="py-4 px-6">
//                               <div>
//                                 <p className="font-medium text-gray-900 dark:text-gray-100">
//                                   {vendor.businessName}
//                                 </p>
//                                 <p className="text-sm text-gray-500">
//                                   {vendor.category}
//                                 </p>
//                               </div>
//                             </td>
//                             <td className="py-4 px-6">
//                               <div className="flex items-center gap-2">
//                                 <Phone className="w-4 h-4 text-gray-500" />
//                                 <p className="text-sm text-gray-500">
//                                   {vendor.phoneNumber}
//                                 </p>
//                               </div>
//                             </td>
//                             <td className="py-4 px-6">
//                               <div className="flex items-center gap-2">
//                                 <MapPin className="w-4 h-4 text-gray-500" />
//                                 <p className="text-sm text-gray-500">
//                                   {vendor.location}
//                                 </p>
//                               </div>
//                             </td>
//                             <td className="py-4 px-6">
//                               <span className={getStatusBadge(vendor.status)}>
//                                 {vendor.status.charAt(0).toUpperCase() +
//                                   vendor.status.slice(1)}
//                               </span>
//                             </td>
//                             <td className="py-4 px-6">
//                               {vendor.status === "pending" ? (
//                                 <div className="flex gap-2">
//                                   <button
//                                     onClick={() =>
//                                       handleVendorStatusChange(vendor.$id, "approved")
//                                     }
//                                     className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
//                                     title="Approve"
//                                   >
//                                     <CheckCircle className="w-5 h-5" />
//                                   </button>
//                                   <button
//                                     onClick={() =>
//                                       handleVendorStatusChange(vendor.$id, "rejected")
//                                     }
//                                     className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
//                                     title="Reject"
//                                   >
//                                     <XCircle className="w-5 h-5" />
//                                   </button>
//                                 </div>
//                               ) : (
//                                 <span className="text-gray-500">-</span>
//                               )}
//                             </td>
//                           </tr>
//                         ))
//                       ) : (
//                         <tr>
//                           <td
//                             colSpan={6}
//                             className="py-8 text-center text-gray-500"
//                           >
//                             No vendors found.
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>

//                 {/* Mobile Vendors View */}
//                 <div className="lg:hidden space-y-4">
//                   {paginatedVendors.length > 0 ? (
//                     paginatedVendors.map((vendor) => (
//                       <div
//                         key={vendor.$id}
//                         className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
//                       >
//                         <div className="flex items-center gap-3 mb-3">
//                           <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
//                             <User className="w-5 h-5 text-orange-600" />
//                           </div>
//                           <div>
//                             <p className="font-medium text-gray-900 dark:text-gray-100">
//                               {vendor.fullName}
//                             </p>
//                             <p className="text-sm text-gray-500">
//                               {vendor.email}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="space-y-2 mb-3">
//                           <div className="flex items-center gap-2">
//                             <Building className="w-4 h-4 text-gray-500" />
//                             <p className="text-sm text-gray-500">
//                               {vendor.businessName} ({vendor.category})
//                             </p>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Phone className="w-4 h-4 text-gray-500" />
//                             <p className="text-sm text-gray-500">
//                               {vendor.phoneNumber}
//                             </p>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <MapPin className="w-4 h-4 text-gray-500" />
//                             <p className="text-sm text-gray-500">
//                               {vendor.location}
//                             </p>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <Calendar className="w-4 h-4 text-gray-500" />
//                             <p className="text-sm text-gray-500">
//                               {new Date(vendor.createdAt).toLocaleString()}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="space-y-3">
//                           <div>
//                             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
//                               Status:
//                             </span>
//                             <span className={getStatusBadge(vendor.status)}>
//                               {vendor.status.charAt(0).toUpperCase() +
//                                 vendor.status.slice(1)}
//                             </span>
//                           </div>
//                           {vendor.status === "pending" && (
//                             <div className="flex gap-2">
//                               <button
//                                 onClick={() =>
//                                   handleVendorStatusChange(vendor.$id, "approved")
//                                 }
//                                 className="w-full p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
//                               >
//                                 Approve
//                               </button>
//                               <button
//                                 onClick={() =>
//                                   handleVendorStatusChange(vendor.$id, "rejected")
//                                 }
//                                 className="w-full p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
//                               >
//                                 Reject
//                               </button>
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     ))
//                   ) : (
//                     <div className="text-center text-gray-500 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
//                       No vendors found.
//                     </div>
//                   )}
//                 </div>

//                 {/* Vendors Pagination */}
//                 {filteredVendors.length > vendorsPerPage && (
//                   <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
//                     <button
//                       onClick={() =>
//                         setVendorCurrentPage((prev) => Math.max(prev - 1, 1))
//                       }
//                       disabled={vendorCurrentPage === 1}
//                       className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700 transition text-sm"
//                     >
//                       Previous
//                     </button>
//                     <span className="text-gray-600 dark:text-gray-300 text-sm text-center">
//                       Page {vendorCurrentPage} of{" "}
//                       {Math.ceil(filteredVendors.length / vendorsPerPage)}
//                     </span>
//                     <button
//                       onClick={() =>
//                         setVendorCurrentPage((prev) =>
//                           Math.min(
//                             prev + 1,
//                             Math.ceil(filteredVendors.length / vendorsPerPage)
//                           )
//                         )
//                       }
//                       disabled={
//                         vendorCurrentPage ===
//                         Math.ceil(filteredVendors.length / vendorsPerPage)
//                       }
//                       className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700 transition text-sm"
//                     >
//                       Next
//                     </button>
//                   </div>
//                 )}
//               </>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }




"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/state/store";
import {
  fetchBookedOrders,
  updateBookedOrderAsync,
} from "@/state/bookedOrdersSlice";
import { branches } from "../../../../data/branches";
import { IVendor, IVendorFetched, OrderStatus } from "../../../../types/types";
import { useRouter } from "next/navigation";
import { account, databases, validateEnv, client } from "@/utils/appwrite";
import {
  sendOrderStatusUpdateSMS,
  sendDeliveryStartedSMS,
  sendOrderDeliveredSMS,
} from "@/utils/smsService";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  ChevronDown,
  Users,
  ShoppingCart,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Calendar,
  Eye,
  Loader2,
  Package,
} from "lucide-react";
import { Query } from "appwrite";
import OrdersTab from "@/components/OrdersTab";
import VendorsTab from "@/components/VendorsTab";
import ContentModerationTab from "@/components/ContentModerationTab";

// Import separate components

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const VENDOR_STATUSES = ["pending", "approved", "rejected"];

export default function AdminDashboard() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { orders, loading: ordersLoading, error: ordersError } = useSelector(
    (state: RootState) => state.bookedOrders
  );

  // Tab state
  const [activeTab, setActiveTab] = useState<"orders" | "vendors" | "content">("orders");

  // Orders state
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const ordersPerPage = 10;

  // Vendors state
  const [vendors, setVendors] = useState<IVendorFetched[]>([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [vendorsError, setVendorsError] = useState<string | null>(null);
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [vendorStatusFilter, setVendorStatusFilter] = useState<
    "pending" | "approved" | "rejected" | "all"
  >("all");
  const [vendorCurrentPage, setVendorCurrentPage] = useState(1);
  const vendorsPerPage = 10;

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
  const fetchVendors = async () => {
    if (activeTab !== "vendors") return;
    setVendorsLoading(true);
    setVendorsError(null);
    try {
      const { databaseId, vendorsCollectionId } = validateEnv();
      const response = await databases.listDocuments(
        databaseId,
        vendorsCollectionId,
        [
          Query.orderDesc("$createdAt"),
          Query.limit(100),
        ]
      );
      setVendors(response.documents as unknown as IVendorFetched[]);
    } catch (error: any) {
      console.error("Error fetching vendors:", error);
      setVendorsError("Failed to fetch vendors");
      toast.error("Failed to fetch vendors");
    } finally {
      setVendorsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [activeTab]);

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

  // Real-time updates for vendors
  useEffect(() => {
    const { databaseId, vendorsCollectionId } = validateEnv();
    const unsubscribe = client.subscribe(
      `databases.${databaseId}.collections.${vendorsCollectionId}.documents`,
      () => {
        toast.success("Vendor list has been updated!", {
          style: { background: "#dcfce7", color: "#166534" },
        });
        fetchVendors();
      }
    );
    return () => unsubscribe();
  }, []);

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

      let smsSent = false;
      switch (newStatus) {
        case "confirmed":
          smsSent = await sendOrderStatusUpdateSMS(
            order.orderId,
            "confirmed",
            order.phone,
            "30-45 minutes"
          );
          break;
        case "preparing":
          smsSent = await sendOrderStatusUpdateSMS(
            order.orderId,
            "preparing",
            order.phone,
            "20-30 minutes"
          );
          break;
        case "out_for_delivery":
          smsSent = await sendDeliveryStartedSMS(
            order.orderId,
            order.phone,
            "15-20 minutes"
          );
          break;
        case "delivered":
          smsSent = await sendOrderDeliveredSMS(order.orderId, order.phone);
          break;
        case "cancelled":
          smsSent = await sendOrderStatusUpdateSMS(
            order.orderId,
            "cancelled",
            order.phone
          );
          break;
        default:
          smsSent = await sendOrderStatusUpdateSMS(
            order.orderId,
            newStatus,
            order.phone
          );
      }

      if (smsSent) {
        toast.success(`Order status updated and SMS sent`);
      } else {
        toast.success(`Order status updated`);
        toast.error("Failed to send SMS notification");
      }
    } catch (error) {
      toast.error("Failed to update order status");
      console.error("Error updating order status:", error);
    }
  };

  // Vendor status change handler
  const handleVendorStatusChange = async (
    vendorId: string,
    newStatus: "approved" | "rejected"
  ) => {
    try {
      const vendor = vendors.find((v) => v.$id === vendorId);
      if (!vendor) {
        toast.error("Vendor not found");
        return;
      }

      const { databaseId, vendorsCollectionId } = validateEnv();
      await databases.updateDocument(databaseId, vendorsCollectionId, vendorId, {
        status: newStatus,
      });

      // Update local state
      setVendors((prev) =>
        prev.map((v) => (v.$id === vendorId ? { ...v, status: newStatus } : v))
      );

      // Send email notification to vendor
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
    } catch (error) {
      console.error("Error updating vendor status:", error);
      toast.error("Failed to update vendor status");
    }
  };

  // Filter orders
  const filteredOrders = orders.filter((order) => {
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

  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const paginatedVendors = filteredVendors.slice(
    (vendorCurrentPage - 1) * vendorsPerPage,
    vendorCurrentPage * vendorsPerPage
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
            VENDOR_STATUSES={VENDOR_STATUSES}
          />
        )}

        {activeTab === "content" && <ContentModerationTab />}
      </div>
    </div>
  );
}