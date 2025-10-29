// AccountTab.tsx
"use client";
import React, { Dispatch, FC, SetStateAction, useState, useCallback } from "react";
import { Input } from "../ui/input";
import { IRestaurantFetched, IScheduleDay, IRestaurant } from "../../../types/types";
import { Edit, Search, Clock, MapPin, Star } from "lucide-react";
import EditRestaurantModal from "./EditRestaurantModal";
import Image from "next/image";
import { fileUrl, validateEnv } from "@/utils/appwrite";
import { isOpen } from "@/utils/isOpen";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/state/store";
import { updateAsyncRestaurant, getAsyncRestaurantById } from "@/state/restaurantSlice";
import { SubmitHandler, UseFormReturn } from "react-hook-form";
import { RestaurantFormData } from "@/utils/schema";
import toast from "react-hot-toast";

interface IAccountTabProps {
  searchCategory: string;
  setSearchCategory: Dispatch<SetStateAction<string>>;
  filteredRestaurants: IRestaurantFetched[];
  setFilteredRestaurants: Dispatch<SetStateAction<IRestaurantFetched[]>>;
}

const AccountTab: FC<IAccountTabProps> = ({
  filteredRestaurants,
  setFilteredRestaurants,
  searchCategory,
  setSearchCategory,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [restaurant, setRestaurant] = useState<IRestaurantFetched | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleEditRestaurant = (id: string) => {
    const res = filteredRestaurants.find((restaurant) => restaurant.$id === id);
    if (!res) return;
    setRestaurant(res);
    setShowEditModal(true);
  };

  // Handle form submission for updating restaurant
  const onSubmit = useCallback(
    async (data: RestaurantFormData, form: UseFormReturn<RestaurantFormData>) => {
      if (!restaurant) return;

      let hasChanges =
        data.logo instanceof FileList ||
        data.name !== restaurant.name ||
        data.category !== restaurant.category ||
        data.deliveryTime !== restaurant.deliveryTime ||
        data.distance !== restaurant.distance ||
        data.rating !== (restaurant.rating || 0) ||
        JSON.stringify(data.schedule) !== JSON.stringify(restaurant.schedule);

      if (!hasChanges) {
        toast.error("No changes were made to the restaurant information.");
        return;
      }

      setIsUpdating(true);
      try {
        // Normalize schedule to ensure no undefined values
        const normalizedSchedule = data.schedule.map((d) => ({
          day: d.day,
          isClosed: d.isClosed,
          openTime: d.openTime ?? null,
          closeTime: d.closeTime ?? null,
        })) as IScheduleDay[];

        let updateData: IRestaurant = {
          name: data.name,
          category: data.category,
          deliveryTime: data.deliveryTime,
          distance: data.distance,
          rating: data.rating,
          vendorId: data.vendorId,
          logo: data.logo as string | FileList,
          schedule: normalizedSchedule,
          address:data.address
        };

        // Update the restaurant
        await dispatch(
          updateAsyncRestaurant({
            id: restaurant.$id,
            data: updateData,
          })
        ).unwrap();

        // Refetch the restaurant data
        const updatedRestaurant = await dispatch(
          getAsyncRestaurantById(restaurant.$id)
        ).unwrap();

        // Update filteredRestaurants to reflect changes
        setFilteredRestaurants((prev) =>
          prev.map((r) => (r.$id === restaurant.$id ? updatedRestaurant : r))
        );

        // Update local restaurant state for the modal
        setRestaurant(updatedRestaurant);
        setShowEditModal(false);
        toast.success("Restaurant updated successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to update restaurant");
      } finally {
        setIsUpdating(false);
        form.reset();
      }
    },
    [dispatch, restaurant, setFilteredRestaurants, setShowEditModal, setRestaurant]
  );



  
  const getTodaySchedule = (schedule: IScheduleDay[] | undefined) => {
    if (!schedule) return null;
    const now = new Date();
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const currentDay = daysOfWeek[now.getDay()];
    return schedule.find((s) => s.day === currentDay);
  };

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search restaurants by category..."
          value={searchCategory}
          onChange={(e) => setSearchCategory(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 transition-all"
        />
      </div>

      {/* Results Section */}
      {filteredRestaurants.length > 0 ? (
        <div className="space-y-4">
          {filteredRestaurants.map((restaurant: IRestaurantFetched) => {
            const todaySchedule = getTodaySchedule(restaurant.schedule);
            return (
              <div
                key={restaurant.$id}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-orange-200 dark:hover:border-orange-900"
              >
                <div className="flex flex-col sm:flex-row">
                  {/* Image Section - Left Side */}
                  <div className="relative w-full sm:w-64 h-48 sm:h-auto flex-shrink-0 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-700 dark:to-gray-600">
                    <Image
                      src={fileUrl(validateEnv().restaurantBucketId, restaurant.logo as string)}
                      alt={`${restaurant.name} logo`}
                      fill
                      className="object-cover"
                    />
                    {/* Rating Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        {restaurant.rating || 0}
                      </span>
                    </div>
                  </div>

                  {/* Content Section - Right Side */}
                  <div className="flex-1 p-6 relative">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEditRestaurant(restaurant.$id)}
                      className="absolute top-4 right-4 p-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      aria-label={`Edit ${restaurant.name}`}
                    >
                      <Edit className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                    </button>

                    {/* Restaurant Info */}
                    <div className="space-y-4">
                      {/* Header */}
                      <div className="pr-12">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1.5 line-clamp-1">
                          {restaurant.name}
                        </h3>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                          <span className="text-sm font-medium text-orange-700 dark:text-orange-400">
                            {restaurant.category}
                          </span>
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="flex flex-wrap gap-4 pt-2">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
                            <Clock className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">{restaurant.deliveryTime}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <div className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium">{restaurant.distance}</span>
                        </div>
                      </div>

                      {/* Operating Hours */}
                      <div className="flex items-center gap-6 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Status
                          </span>
                          <span
                            className={`text-sm font-semibold px-2.5 py-1 rounded-md ${
                              isOpen(restaurant)
                                ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                            }`}
                          >
                            {isOpen(restaurant) ? "Open" : "Closed"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Today's Hours
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-700">
                            {todaySchedule?.isClosed
                              ? "Closed"
                              : `${todaySchedule?.openTime || "N/A"} - ${todaySchedule?.closeTime || "N/A"}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center mb-5 shadow-inner">
            <Search className="w-12 h-12 text-orange-400 dark:text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {searchCategory.trim() ? "No restaurants found" : "No restaurants yet"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-center max-w-md leading-relaxed">
            {searchCategory.trim()
              ? "Try adjusting your search category to find what you're looking for."
              : "Start adding restaurants to see them appear here."}
          </p>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && restaurant && (
        <EditRestaurantModal
          restaurant={restaurant}
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          setRestaurant={setRestaurant}
          onSubmit={onSubmit}
          isUpdating={isUpdating}
          setIsUpdating={setIsUpdating}
        />
      )}
    </div>
  );
};

export default AccountTab;