import React, { useEffect, useState } from "react";
import {
  Search,
  Filter,
  ChevronDown,
  Eye,
} from "lucide-react";
import { IBookedOrderFetched, IUserFectched, OrderStatus } from "../../types/types";
import { databases, validateEnv } from "@/utils/appwrite";

interface OrdersTabProps {
  orders: IBookedOrderFetched[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: OrderStatus | "all";
  setStatusFilter: (status: OrderStatus | "all") => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  filteredOrders: IBookedOrderFetched[];
  ordersPerPage: number;
  handleStatusChange: (orderId: string, newStatus: OrderStatus) => Promise<void>;
  ORDER_STATUSES: string[];
  branches: any[];
}

export default function OrdersTab({
  orders,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  currentPage,
  setCurrentPage,
  filteredOrders,
  ordersPerPage,
  handleStatusChange,
  ORDER_STATUSES,
  branches,
}: OrdersTabProps) {

  const [customerNames, setCustomerNames] = useState<{[key: string]: string}>({});
  const [fetchingNames, setFetchingNames] = useState(false);

  const fetchCustomerName = async (customerId: string) => {
    if (customerId && !customerNames[customerId]) {
      try {
        const response = await databases.getDocument(
          validateEnv().databaseId,
          validateEnv().userCollectionId,
          customerId
        ) as IUserFectched;
        setCustomerNames(prev => ({ ...prev, [customerId]: response.fullName as string}));
      } catch (err) {
        console.error(err instanceof Error ? err.message : "Error fetching customer name");
        setCustomerNames(prev => ({ ...prev, [customerId]: "Unknown Customer" }));
      }
    }
  };

  useEffect(() => {
    if (orders.length > 0 && !fetchingNames) {
      setFetchingNames(true);
      const uniqueCustomerIds = [...new Set(orders.map(order => order.customerId))];
      uniqueCustomerIds.forEach(fetchCustomerName);
      setFetchingNames(false);
    }
  }, [orders]);

  // Paginated orders for consistent rendering
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  return (
    <>
      {/* Orders Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Order Management
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 sm:py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100"
            />
          </div>
          <div className="relative flex-1 sm:flex-none">
            <Filter
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as OrderStatus | "all")
              }
              className="w-full pl-10 pr-8 py-3 sm:py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 appearance-none"
            >
              <option value="all">All Statuses</option>
              {ORDER_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, " ")}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>
      </div>

      {/* Orders Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600 font-semibold p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
          {error}
        </div>
      ) : (
        <>
          {/* Desktop Orders Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <thead className="bg-orange-100 dark:bg-orange-900/30">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Order ID
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Branch
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    User
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Created
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Payment
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.length > 0 ? (
                  paginatedOrders.map((order) => {
                    const branch = branches.find(
                      (b) => b.id === order.selectedBranchId
                    );
                    const customerName = customerNames[order.customerId] || (fetchingNames ? "Loading..." : "Unknown Customer");
                    return (
                      <tr
                        key={order.$id}
                        className="border-b border-gray-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition"
                      >
                        <td className="py-4 px-6 font-mono text-blue-600 font-bold">
                          {order.riderCode?.toUpperCase()}
                        </td>
                        <td className="py-4 px-6">
                          {branch ? branch.name : "-"}
                        </td>
                        <td className="py-4 px-6">{customerName}</td>
                        <td className="py-4 px-6 text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(
                                order.$id,
                                e.target.value as OrderStatus
                              )
                            }
                            className="rounded-lg border border-orange-300 px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-orange-400 w-full"
                          >
                            {ORDER_STATUSES.map((status) => (
                              <option key={status} value={status}>
                                {status.replace(/_/g, " ")}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4 px-6">
                          {order.paid ? (
                            <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold border border-green-200">
                              Paid
                            </span>
                          ) : (
                            <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold border border-red-200">
                              Unpaid
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          <a
                            href={`/myorders/${order.orderId}`}
                            className="text-orange-600 hover:text-orange-800 font-semibold transition"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="w-5 h-5" />
                          </a>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-8 text-center text-gray-500"
                    >
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Orders View */}
          <div className="lg:hidden space-y-4">
            {paginatedOrders.length > 0 ? (
              paginatedOrders.map((order) => {
                const branch = branches.find(
                  (b) => b.id === order.selectedBranchId
                );
                const customerName = customerNames[order.customerId] || (fetchingNames ? "Loading..." : "Unknown Customer");
                return (
                  <div
                    key={order.$id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-mono text-blue-600 font-bold text-sm">
                        #{order.orderId}
                      </span>
                      <a
                        href={`/myorders/${order.orderId}`}
                        className="text-orange-600 hover:text-orange-800 font-semibold text-sm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="w-5 h-5" />
                      </a>
                    </div>
                    <div className="space-y-2 mb-3">
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Branch:</span>{" "}
                        {branch ? branch.name : "-"}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">User:</span>{" "}
                        {customerName}
                      </p>
                      <p className="text-sm text-gray-500">
                        <span className="font-medium">Created:</span>{" "}
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Status
                        </label>
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusChange(
                              order.$id,
                              e.target.value as OrderStatus
                            )
                          }
                          className="w-full rounded-lg border border-orange-300 px-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-orange-400"
                        >
                          {ORDER_STATUSES.map((status) => (
                            <option key={status} value={status}>
                              {status.replace(/_/g, " ")}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Payment:
                        </span>
                        {order.paid ? (
                          <span className="ml-2 inline-block px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold border border-green-200">
                            Paid
                          </span>
                        ) : (
                          <span className="ml-2 inline-block px-3 py-1 rounded-full bg-red-100 text-red-800 text-xs font-semibold border border-red-200">
                            Unpaid
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-gray-500 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                No orders found.
              </div>
            )}
          </div>

          {/* Orders Pagination */}
          {filteredOrders.length > ordersPerPage && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              <button
                onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                disabled={currentPage === 1}
                className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700 transition text-sm"
              >
                Previous
              </button>
              <span className="text-gray-600 dark:text-gray-300 text-sm text-center">
                Page {currentPage} of{" "}
                {Math.ceil(filteredOrders.length / ordersPerPage)}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(
                    Math.min(
                      currentPage + 1,
                      Math.ceil(filteredOrders.length / ordersPerPage)
                    )
                  )
                }
                disabled={
                  currentPage ===
                  Math.ceil(filteredOrders.length / ordersPerPage)
                }
                className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700 transition text-sm"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}