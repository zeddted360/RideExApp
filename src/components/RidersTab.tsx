"use client";
import React, { useState, Dispatch, SetStateAction } from "react"; // Add Dispatch and SetStateAction imports
import {
  Search,
  Filter,
  ChevronDown,
  User,
  Phone,
  MapPin,
  CheckCircle,
} from "lucide-react";
import { fileUrl, validateEnv } from "@/utils/appwrite"; // Adjust the import path as needed
import { IRiders, IRidersFetched } from "../../types/types";
import Link from "next/link";

interface RidersTabProps {
  riders: IRidersFetched[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: "pending" | "approved" | "all";
  setStatusFilter: (filter: "pending" | "approved" | "all") => void;
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>; // Updated type to support functional updates
  filteredRiders: IRidersFetched[];
  ridersPerPage: number;
  handleRiderStatusChange: (riderId: string) => void;
}

const RidersTab: React.FC<RidersTabProps> = ({
  riders,
  loading,
  error,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  currentPage,
  setCurrentPage,
  filteredRiders,
  ridersPerPage,
  handleRiderStatusChange,
}) => {
  const [selectedRider, setSelectedRider] = useState<IRidersFetched | null>(null);

  const paginatedRiders = filteredRiders.slice(
    (currentPage - 1) * ridersPerPage,
    currentPage * ridersPerPage
  );

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-block px-3 py-1 rounded-full text-xs font-semibold border";
    switch (status) {
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-200`;
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800 border-green-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 border-gray-200`;
    }
  };

  const handleRiderClick = (rider: IRidersFetched) => {
    setSelectedRider(rider);
  };

  const closeModal = () => {
    setSelectedRider(null);
  };

  return (
    <>
      {/* Riders Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
          Rider Management
        </h2>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search riders..."
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
                setStatusFilter(
                  e.target.value as "pending" | "approved" | "all"
                )
              }
              className="w-full pl-10 pr-8 py-3 sm:py-2 rounded-lg border border-orange-300 focus:ring-2 focus:ring-orange-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>
      </div>

      {/* Riders Content */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse bg-white dark:bg-gray-800 rounded-xl shadow-md p-6"
            >
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600 font-semibold p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
          {error}
        </div>
      ) : (
        <>
          {/* Desktop Riders Table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="min-w-full bg-white dark:bg-gray-800 rounded-xl shadow-md">
              <thead className="bg-orange-100 dark:bg-orange-900/30">
                <tr>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Rider
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Phone
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Address
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Status
                  </th>
                  <th className="py-4 px-6 text-left text-xs font-bold text-gray-700 dark:text-gray-200">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRiders.length > 0 ? (
                  paginatedRiders.map((rider) => (
                    <tr
                      key={rider.$id}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition cursor-pointer"
                      onClick={() => handleRiderClick(rider)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">
                              {rider.fullName}
                            </p>
                            {rider.email && (
                              <p className="text-sm text-gray-500">
                                {rider.email}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-500" />
                          <p className="text-sm text-gray-500">
                            {rider.phone}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <p className="text-sm text-gray-500">
                            {rider.address}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={getStatusBadge(rider.status)}>
                          {rider.status.charAt(0).toUpperCase() +
                            rider.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        {rider.status === "pending" ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent modal from opening
                              handleRiderStatusChange(rider.$id);
                            }}
                            className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                            title="Approve Rider"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-500">
                      No riders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Riders View */}
          <div className="lg:hidden space-y-4">
            {paginatedRiders.length > 0 ? (
              paginatedRiders.map((rider) => (
                <div
                  key={rider.$id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 cursor-pointer"
                  onClick={() => handleRiderClick(rider)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {rider.fullName}
                      </p>
                      {rider.email && (
                        <p className="text-sm text-gray-500">{rider.email}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-500">{rider.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <p className="text-sm text-gray-500">{rider.address}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Status:
                      </span>
                      <span className={getStatusBadge(rider.status)}>
                        {rider.status.charAt(0).toUpperCase() +
                          rider.status.slice(1)}
                      </span>
                    </div>
                    {rider.status === "pending" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent modal from opening
                          handleRiderStatusChange(rider.$id);
                        }}
                        className="w-full p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                      >
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md">
                No riders found.
              </div>
            )}
          </div>

          {/* Riders Pagination */}
          {filteredRiders.length > ridersPerPage && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.max(prev - 1, 1)) // Fixed functional update
                }
                disabled={currentPage === 1}
                className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700 transition text-sm"
              >
                Previous
              </button>
              <span className="text-gray-600 dark:text-gray-300 text-sm text-center">
                Page {currentPage} of {Math.ceil(filteredRiders.length / ridersPerPage)}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) =>
                    Math.min(
                      prev + 1,
                      Math.ceil(filteredRiders.length / ridersPerPage)
                    )
                  ) // Fixed functional update
                }
                disabled={
                  currentPage === Math.ceil(filteredRiders.length / ridersPerPage)
                }
                className="w-full sm:w-auto px-4 py-2 bg-orange-600 text-white rounded-lg disabled:opacity-50 hover:bg-orange-700 transition text-sm"
              >
                Next
              </button>
            </div>
          )}

          {/* Modal for Rider Details */}
          {selectedRider && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Rider Details
                </h3>
                <div className="space-y-4">
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Full Name:
                    </span>{" "}
                    {selectedRider.fullName}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Phone:
                    </span>{" "}
                    {selectedRider.phone}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Email:
                    </span>{" "}
                    {selectedRider.email || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Address:
                    </span>{" "}
                    {selectedRider.address}
                  </p>
                  <p>
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Status:
                    </span>{" "}
                    <span className={getStatusBadge(selectedRider.status)}>
                      {selectedRider.status.charAt(0).toUpperCase() +
                        selectedRider.status.slice(1)}
                    </span>
                  </p>
                  {selectedRider.driversLicensePicture &&
                      <div>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Driver's License:
                        </span>
                        <Link
                          href={fileUrl(
                            validateEnv().driversLicenceBuckedId,
                            selectedRider.driversLicensePicture
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline ml-2"
                        >
                          View License
                        </Link>
                      </div>
                    }
                </div>
                <button
                  onClick={closeModal}
                  className="mt-6 w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default RidersTab;