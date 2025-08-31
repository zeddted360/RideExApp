/// <reference types="google.maps" />
"use client";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/state/store";
import { createNotification } from "@/state/notificationSlice";
import { account, databases, validateEnv } from "@/utils/appwrite";
import { ID } from "appwrite";
import { OrderStatus, INotification } from "../../../types/types";
import { calculateDeliveryFee } from "@/utils/deliveryFeeCalculator";
import { Loader } from "@googlemaps/js-api-loader";
import { useRouter } from "next/navigation";
import { deleteOrderAsync, resetOrders } from "@/state/orderSlice";
import BranchSelector from "@/components/checkout/BranchSelector";
import BranchMap from "@/components/checkout/BranchMap";
import DeliveryOptions from "@/components/checkout/DeliveryOptions";
import OrderSummary from "@/components/checkout/OrderSummary";
import AddressSection from "@/components/checkout/AddressSection";
import PaymentMethodSelector, { PaymentMethod } from "@/components/checkout/PaymentMethodSelector";
import PlaceOrderButton from "@/components/checkout/PlaceOrderButton";
import { generateTimeSlots, formatDeliveryTime } from "@/utils/checkoutUtils";
import { sendOrderPlacedSMS } from "@/utils/smsService";
import { branches } from "../../../data/branches";
import { useAuth } from "@/context/authContext";

export default function CheckoutClient() {
  const [selectedBranch, setSelectedBranch] = useState(1);
  const [deliveryDay, setDeliveryDay] = useState<"today" | "tomorrow">("today");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(1000);
  const [deliveryDistance, setDeliveryDistance] = useState("");
  const [deliveryDuration, setDeliveryDuration] = useState("");
  const [isCalculatingFee, setIsCalculatingFee] = useState(false);
  const [tempAddress, setTempAddress] = useState("");
  const [apartmentFlat, setApartmentFlat] = useState("");
  const [label, setLabel] = useState<"Home" | "Work" | "Other">("Home");
  const [manualMode, setManualMode] = useState(false);
  const [userAddresses, setUserAddresses] = useState<string[]>([]);
  const [addressMode, setAddressMode] = useState<"select" | "add">("select");
  const [googlePlaceSelected, setGooglePlaceSelected] = useState(false);
  const [selectedPlace, setSelectedPlace] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [lastPickedAddress, setLastPickedAddress] = useState("");

  const dialogAutocompleteInput = useRef<HTMLInputElement | null>(null);
  const dialogAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(
    null
  );
  const autocompleteListenerRef = useRef<google.maps.MapsEventListener | null>(
    null
  );
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const orders = useSelector((state: RootState) => state.orders.orders) || [];
  const subtotal = orders.reduce(
    (sum, item) => sum + (item.totalPrice || 0),
    0
  );
  const timeSlots = useMemo(
    () => (deliveryDay === "today" ? generateTimeSlots() : []),
    [deliveryDay]
  );
  const { googleMapsApiKey } = validateEnv();

  // Memoized branch data
  const selectedBranchData = useMemo(
    () => branches.find((b) => b.id === selectedBranch),
    [selectedBranch]
  );
  // Custom debounce hook for delivery fee calculation
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
      const handler = setTimeout(() => setDebouncedValue(value), delay);
      return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
  };
  const debouncedAddress = useDebounce(address, 500);
  // Centralized error handling with auto-clear
  const handleError = (message: string) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };
  // Google Maps initialization
  const initMap = useCallback(() => {
    if (!dialogAutocompleteInput.current || !window.google?.maps) return;

    dialogAutocompleteRef.current = new window.google.maps.places.Autocomplete(
      dialogAutocompleteInput.current,
      {
        types: ["geocode"],
        componentRestrictions: { country: "ng" },
      }
    );

    autocompleteListenerRef.current = dialogAutocompleteRef.current.addListener(
      "place_changed",
      () => {
        const place = dialogAutocompleteRef.current?.getPlace();
        if (!place?.geometry?.location) return;
        if (place.formatted_address) {
          setTempAddress(place.formatted_address);
          setGooglePlaceSelected(true);
          setSelectedPlace(place);
          setLastPickedAddress(place.formatted_address);
        } else if (place.name) {
          setTempAddress(place.name);
          setGooglePlaceSelected(true);
          setSelectedPlace(place);
          setLastPickedAddress(place.name);
        }
      }
    );
  }, []);

  // Load Google Maps
  useEffect(() => {
    if (!googleMapsApiKey) {
      handleError(
        "Google Maps API key is missing. Please enter address manually."
      );
      setManualMode(true);
      return;
    }

    const loader = new Loader({
      apiKey: googleMapsApiKey,
      version: "weekly",
      libraries: ["places"],
    });

    loader
      .load()
      .then(() => {
        setIsClient(true);
        if (dialogAutocompleteInput.current) initMap();
      })
      .catch(() => {
        handleError(
          "Failed to load Google Maps. Please enter address manually."
        );
        setManualMode(true);
      });

    return () => {
      if (autocompleteListenerRef.current) {
        autocompleteListenerRef.current.remove();
        autocompleteListenerRef.current = null;
      }
      dialogAutocompleteRef.current = null;
    };
  }, [googleMapsApiKey, initMap]);

  // Calculate delivery fee
  useEffect(() => {
    const calculateFee = async () => {
      if (!debouncedAddress.trim() || !selectedBranchData) {
        setDeliveryFee(500);
        setDeliveryDistance("");
        setDeliveryDuration("");
        return;
      }

      setIsCalculatingFee(true);
      try {
        const result = await calculateDeliveryFee(
          debouncedAddress,
          selectedBranch,
          selectedBranchData
        );
        setDeliveryFee(result.fee);
        setDeliveryDistance(result.distance);
        setDeliveryDuration(result.duration);
      } catch (error) {
        handleError("Failed to calculate delivery fee. Using default fee.");
        setDeliveryFee(1000);
        setDeliveryDistance("");
        setDeliveryDuration("");
      } finally {
        setIsCalculatingFee(false);
      }
    };

    calculateFee();
  }, [debouncedAddress, selectedBranch, selectedBranchData]);

  const { user } = useAuth();
  const userId = user?.userId;
  const userEmail = user?.email;


  useEffect(() => {
    if (user) {
      if (user.phoneNumber) setPhoneNumber(user.phoneNumber);
    }
  }, [user]);
  // Fetch user addresses
  useEffect(() => {
    if (showAddressForm) {
      (async () => {
        try {
          const userData = await account.get();
          const { databaseId, userCollectionId } = validateEnv();
          const userDoc = await databases.getDocument(
            databaseId,
            userCollectionId,
            userData.$id
          );
          if (Array.isArray(userDoc.address)) {
            setUserAddresses(userDoc.address);
            setAddressMode(userDoc.address.length > 0 ? "select" : "add");
          } else {
            setUserAddresses([]);
            setAddressMode("add");
          }
        } catch {
          setUserAddresses([]);
          setAddressMode("add");
        }
      })();
    }
  }, [showAddressForm]);

  // Handle address mode change
  useEffect(() => {
    if (address === "__add_new__") {
      setAddressMode("add");
    }
  }, [address]);

  // Save new address
  const handleSaveNewAddress = async (newAddress: string) => {
    try {
      if (user) {
        if (user.email.startsWith("guest")) {
          setAddress(newAddress);
          return;
        }
      }
      const userData = await account.get();
      const { databaseId, userCollectionId } = validateEnv();
      const updatedAddresses = [...userAddresses, newAddress];
      await databases.updateDocument(
        databaseId,
        userCollectionId,
        userData.$id,
        {
          address: updatedAddresses,
        }
      );
      setUserAddresses(updatedAddresses);
      setAddress(newAddress);
      setAddressMode("select");
      setShowAddressForm(false);
      setManualMode(false);
      setGooglePlaceSelected(false);
      setSelectedPlace(null);
    } catch {
      handleError("Failed to save address.");
    }
  };

  // Calculate delivery time
  const calculateDeliveryTime = useCallback(() => {
    const now = new Date();
    if (deliveryDay === "tomorrow") {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(12, 0, 0, 0);
      return tomorrow;
    }

    if (selectedTimeSlot === "now") {
      return new Date(now.getTime() + 30 * 60000);
    }

    const selectedSlot = timeSlots.find((slot) => slot.id === selectedTimeSlot);
    return selectedSlot?.end || new Date(now.getTime() + 45 * 60000);
  }, [deliveryDay, selectedTimeSlot, timeSlots]);

  // Send notification
  const sendNotification = async (orderData: any, recipient: string) => {
    try {
      const notification: INotification = {
        type:
          recipient === "admin" ? "admin_new_order" : "user_order_confirmation",
        recipient,
        userId: orderData.customerId,
        orderId: orderData.orderId,
        address: orderData.address,
        phone: orderData.phone,
        deliveryTime: orderData.deliveryTime,
        totalAmount: orderData.total,
        items: orderData.itemIds,
        deliveryDistance: orderData.deliveryDistance,
        deliveryDuration: orderData.deliveryDuration,
        deliveryFee: orderData.deliveryFee,
        selectedBranchId: orderData.selectedBranchId,
        label: orderData.label,
        status: "unread",
        createdAt: new Date().toISOString(),
      };
      await dispatch(createNotification(notification)).unwrap();
    } catch {
      handleError("Failed to send notification.");
    }
  };

  // Handle add address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      handleError("Please provide a delivery address.");
      return;
    }

    if (!phoneNumber.trim()) {
      handleError("Please provide a phone number.");
      return;
    }

    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      handleError(
        "Please enter a valid phone number in E.164 format (e.g., +234XXXXXXXXX)."
      );
      return;
    }

    setShowAddressForm(false);
  };
  // Handle place order
  const handlePlaceOrder = useCallback(() => {
    setShowConfirmation(true);
  }, []);
  // Handle confirm order
  const handleConfirmOrder = useCallback(async () => {
    if (!address || !phoneNumber || orders.length === 0) {
      handleError(
        "Please add a delivery address, phone number, and items to your cart."
      );
      return;
    }

    if (!userId) {
      handleError("Please log in to place an order.");
      return;
    }

    setIsOrderLoading(true);
    try {
      const orderId = ID.unique();
      const deliveryTime = calculateDeliveryTime();

      const order = {
        orderId,
        itemIds: orders.map((item: any) => item.itemId),
        paymentMethod,
        address,
        label,
        deliveryTime: formatDeliveryTime(deliveryTime),
        createdAt: new Date().toISOString(),
        total: subtotal + deliveryFee,
        status: "pending" as OrderStatus,
        phone: phoneNumber,
        customerId: userId,
        deliveryFee,
        deliveryDistance,
        deliveryDuration,
        selectedBranchId: selectedBranch,
      };

      const { databaseId, bookedOrdersCollectionId } = validateEnv();
      await databases.createDocument(
        databaseId,
        bookedOrdersCollectionId,
        orderId,
        order
      );

      await Promise.all([
        sendNotification(order, "admin"),
        sendNotification(order, userId),
        sendOrderPlacedSMS({
          userPhone: phoneNumber,
          orderId,
          userName: user.username || user.email || userId,
          origin: window.location.origin,
        }).catch(() => handleError("Failed to send SMS confirmation.")),
      ]);

      await Promise.all(
        orders.map((item: any) => dispatch(deleteOrderAsync(item.$id)))
      );
      dispatch(resetOrders());

      router.push("/order-confirmation");
    } catch (err) {
      handleError(
        `Failed to place order: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    } finally {
      setIsOrderLoading(false);
      setShowConfirmation(false);
    }
  }, [
    address,
    phoneNumber,
    paymentMethod,
    selectedTimeSlot,
    orders,
    subtotal,
    deliveryDay,
    deliveryFee,
    deliveryDistance,
    deliveryDuration,
    selectedBranch,
    userId,
    userEmail,
    apartmentFlat,
    label,
    dispatch,
    router,
    calculateDeliveryTime,
    formatDeliveryTime,
  ]);

 
  if (!isClient) {
    return <div>Loading...</div>;
  
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-white to-orange-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-12 px-2 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-10"
        >
          <section className="rounded-2xl shadow-xl bg-white/95 dark:bg-gray-900/90 border border-orange-100 dark:border-gray-800 p-6 mb-2">
            <BranchSelector
              selectedBranch={selectedBranch}
              setSelectedBranch={setSelectedBranch}
              branches={branches}
            />
          </section>

          <section className="rounded-2xl shadow-xl bg-white/95 dark:bg-gray-900/90 border border-orange-100 dark:border-gray-800 p-6 mb-2">
            <BranchMap selectedBranch={selectedBranch} branches={branches} />
          </section>

          <section className="rounded-2xl shadow-xl bg-white/95 dark:bg-gray-900/90 border border-orange-100 dark:border-gray-800 p-6 mb-2">
            <DeliveryOptions
              deliveryDay={deliveryDay}
              setDeliveryDay={setDeliveryDay}
              timeSlots={timeSlots}
              selectedTimeSlot={selectedTimeSlot}
              setSelectedTimeSlot={setSelectedTimeSlot}
            />
          </section>

          <section className="rounded-2xl shadow-xl bg-white/95 dark:bg-gray-900/90 border border-orange-100 dark:border-gray-800 p-6 mb-2">
            <AddressSection
              address={address}
              phoneNumber={phoneNumber}
              showAddressForm={showAddressForm}
              setShowAddressForm={setShowAddressForm}
              addressMode={addressMode}
              userAddresses={userAddresses}
              setAddress={setAddress}
              setAddressMode={setAddressMode}
              tempAddress={tempAddress}
              setTempAddress={setTempAddress}
              manualMode={manualMode}
              setManualMode={setManualMode}
              googlePlaceSelected={googlePlaceSelected}
              setGooglePlaceSelected={setGooglePlaceSelected}
              selectedPlace={selectedPlace}
              setSelectedPlace={setSelectedPlace}
              lastPickedAddress={lastPickedAddress}
              setLastPickedAddress={setLastPickedAddress}
              apartmentFlat={apartmentFlat}
              setApartmentFlat={setApartmentFlat}
              label={label}
              setLabel={setLabel}
              error={error}
              setError={setError}
              handleSaveNewAddress={handleSaveNewAddress}
              handleAddAddress={handleAddAddress}
              selectedBranch={selectedBranch}
              branches={branches}
            />
          </section>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-10 lg:sticky lg:top-10"
        >
          <section className="rounded-2xl shadow-2xl bg-white/100 dark:bg-gray-900/95 border border-orange-200 dark:border-gray-800 p-6 mb-2">
            <OrderSummary
              orders={orders.map((item) => ({
                ...item,
                price: Number(item.price),
                totalPrice: Number(item.totalPrice),
              }))}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              isCalculatingFee={isCalculatingFee}
              deliveryDistance={deliveryDistance}
              deliveryDuration={deliveryDuration}
            />
          </section>

          <section className="rounded-2xl shadow-xl bg-white/95 dark:bg-gray-900/90 border border-orange-100 dark:border-gray-800 p-6 mb-2">
            <PaymentMethodSelector
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
          </section>

          <section className="rounded-2xl shadow-xl bg-white/95 dark:bg-gray-900/90 border border-orange-100 dark:border-gray-800 p-6 mb-2">
            <PlaceOrderButton
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              address={address}
              phoneNumber={phoneNumber}
              orders={orders}
              isOrderLoading={isOrderLoading}
              handlePlaceOrder={handlePlaceOrder}
              showConfirmation={showConfirmation}
              setShowConfirmation={setShowConfirmation}
              handleConfirmOrder={handleConfirmOrder}
              error={error}
            />
          </section>
        </motion.div>
      </div>
    </div>
  );
}