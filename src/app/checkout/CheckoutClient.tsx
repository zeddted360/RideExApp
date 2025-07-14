/// <reference types="google.maps" />
"use client";
import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Clock, CreditCard, Truck } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/state/store";
import { createNotification } from "@/state/notificationSlice";
import { account, databases, validateEnv } from "@/utils/appwrite";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ID } from "appwrite";
import { OrderStatus, INotification } from "../../../types/types";
import {
  calculateDeliveryFee,
  getBranchById,
} from "@/utils/deliveryFeeCalculator";
import { Loader } from "@googlemaps/js-api-loader";
import { useRouter } from "next/navigation";
import { deleteOrderAsync, resetOrders } from "@/state/orderSlice";

const branches = [
  {
    id: 1,
    name: "RideEx OWERRI-1 (main)",
    lat: 5.4862,
    lng: 7.0256,
    address: "Obinze, Owerri, Imo State, Nigeria",
  },
  {
    id: 2,
    name: "RideEx FUTO (OWERRI)",
    lat: 5.3846,
    lng: 6.996,
    address: "Federal University of Technology, Owerri, Imo State, Nigeria",
  },
];

function generateTimeSlots() {
  const slots = [];
  const now = new Date();
  slots.push({ id: "now", label: "Now", start: now, end: null });
  let start = new Date(now.getTime());
  for (let i = 0; i < 4; i++) {
    const end = new Date(start.getTime() + 45 * 60000);
    slots.push({
      id: `${i + 1}`,
      label: `${start.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${end.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      start: new Date(start),
      end: new Date(end),
    });
    start = end;
  }
  return slots;
}

export default function CheckoutClient() {
  const [selectedBranch, setSelectedBranch] = useState(1);
  const [deliveryDay, setDeliveryDay] = useState<"today" | "tomorrow">("today");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "cash" | "transfer"
  >("card");
  const [isOrderLoading, setIsOrderLoading] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [address, setAddress] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [deliveryFee, setDeliveryFee] = useState<number>(1000);
  const [deliveryDistance, setDeliveryDistance] = useState<string>("");
  const [deliveryDuration, setDeliveryDuration] = useState<string>("");
  const [isCalculatingFee, setIsCalculatingFee] = useState<boolean>(false);
  const [tempAddress, setTempAddress] = useState<string>("");
  const [apartmentFlat, setApartmentFlat] = useState<string>("");
  const [label, setLabel] = useState<"Home" | "Work" | "Other">("Home");
  const [manualMode, setManualMode] = useState<boolean>(false);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);
  const [userAddresses, setUserAddresses] = useState<string[]>([]);
  const [addressMode, setAddressMode] = useState<'select' | 'add'>('select');

  // Google Maps refs
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const autocompleteInput = useRef<HTMLInputElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Add a dedicated ref for the dialog autocomplete input
  const dialogAutocompleteInput = useRef<HTMLInputElement | null>(null);
  const dialogAutocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Initialize Google Map
  const initMap = useCallback(() => {
    if (!mapContainer.current) {
      return;
    }
    if (!window.google || !window.google.maps) {
      return;
    }
    const defaultLocation = { lat: branches[0].lat, lng: branches[0].lng };
    mapRef.current = new window.google.maps.Map(mapContainer.current, {
      center: defaultLocation,
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
    });
    markerRef.current = new window.google.maps.Marker({
      position: defaultLocation,
      map: mapRef.current,
    });
    if (autocompleteInput.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        autocompleteInput.current,
        {
          types: ["geocode"],
          componentRestrictions: { country: "ng" },
        }
      );
      autocompleteRef.current.addListener("place_changed", () => {
        const place = autocompleteRef.current?.getPlace();
        if (!place?.geometry?.location) return;
        const location = place.geometry.location;
        mapRef.current?.setCenter(location);
        markerRef.current?.setPosition(location);
        // Always use the full formatted address from Google
        if (place.formatted_address) {
          setTempAddress(place.formatted_address);
        } else if (place.name) {
          setTempAddress(place.name);
        }
      });
    }
  }, []);

  // Only initialize the map when both mapLoaded and mapContainer.current are ready
  useEffect(() => {
    if (mapLoaded && mapContainer.current) {
      initMap();
    }
  }, [mapLoaded, mapContainer.current, initMap]);

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
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  // Load Google Maps script using the official loader
  useEffect(() => {
    setIsClient(true);
    if (!googleMapsApiKey) {
      setError("Google Maps API key is missing.");
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
        setMapLoaded(true);
        // Do NOT call initMap here
      })
      .catch(() => {
        setError("Failed to load Google Maps.");
      });
  }, [googleMapsApiKey]);

  // Update map center when branch changes
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const branch = branches.find((b) => b.id === selectedBranch);
    if (branch) {
      const location = { lat: branch.lat, lng: branch.lng };
      mapRef.current.setCenter(location);
      markerRef.current.setPosition(location);
    }
  }, [selectedBranch]);

  // Add a useEffect to render the branch map when selectedBranch changes
  useEffect(() => {
    if (!window.google || !window.google.maps) return;
    const branch = branches.find((b) => b.id === selectedBranch);
    if (!branch) return;
    const mapDiv = document.getElementById("branch-map");
    if (!mapDiv) return;
    const map = new window.google.maps.Map(mapDiv, {
      center: { lat: branch.lat, lng: branch.lng },
      zoom: 14,
      mapTypeControl: false,
      streetViewControl: false,
    });
    new window.google.maps.Marker({
      position: { lat: branch.lat, lng: branch.lng },
      map,
      title: branch.name,
    });
  }, [selectedBranch, mapLoaded]);

  // Handle address change for autocomplete and manual input
  const handleAddressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newAddress = e.target.value;
      setTempAddress(newAddress);

      if (newAddress.length > 3 && window.google?.maps) {
        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
          { address: newAddress, region: "ng" },
          (results: any, status: any) => {
            if (
              status === "OK" &&
              results[0] &&
              mapRef.current &&
              markerRef.current
            ) {
              const location = results[0].geometry.location;
              mapRef.current.setCenter(location);
              markerRef.current.setPosition(location);
            }
          }
        );
      }
    },
    []
  );

  // Calculate delivery fee
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    const calculateFee = async () => {
      if (!address.trim() || !selectedBranch) {
        setDeliveryFee(1000);
        setDeliveryDistance("");
        setDeliveryDuration("");
        return;
      }

      setIsCalculatingFee(true);
      try {
        const selectedBranchData = branches.find(
          (b) => b.id === selectedBranch
        );
        if (!selectedBranchData) throw new Error("Branch not found");
        const result = await calculateDeliveryFee(
          address,
          selectedBranch,
          selectedBranchData
        );
        setDeliveryFee(result.fee);
        setDeliveryDistance(result.distance);
        setDeliveryDuration(result.duration);
      } catch (error) {
        console.error("Failed to calculate delivery fee:", error);
        setDeliveryFee(1000);
        setDeliveryDistance("");
        setDeliveryDuration("");
      } finally {
        setIsCalculatingFee(false);
      }
    };

    timeoutId = setTimeout(calculateFee, 1000);
    return () => clearTimeout(timeoutId);
  }, [address, selectedBranch]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await account.get();
        setIsAuthenticated(true);
        setPhoneNumber(userData.phone || "");
      } catch (err) {
        setIsAuthenticated(false);
        setError("Please log in to proceed with checkout.");
      }
    };
    fetchUser();
  }, []);

  // Fetch user addresses when address dialog opens
  useEffect(() => {
    if (showAddressForm) {
      (async () => {
        try {
          const userData = await account.get();
          const { databaseId, userCollectionId } = validateEnv();
          const userDoc = await databases.getDocument(databaseId, userCollectionId, userData.$id);
          console.log("the userDoc is :", userDoc);
          if (Array.isArray(userDoc.address)) {
            setUserAddresses(userDoc.address);
            if (userDoc.address.length > 0) {
              setAddressMode('select');
            } else {
              setAddressMode('add');
            }
          } else {
            setUserAddresses([]);
            setAddressMode('add');
          }
        } catch {
          setUserAddresses([]);
          setAddressMode('add');
        }
      })();
    }
  }, [showAddressForm]);

  // Add new address to user profile
  const handleSaveNewAddress = async (newAddress: string) => {
    try {
      const userData = await account.get();

      const { databaseId , userCollectionId} = validateEnv();
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
      setAddressMode('select');
      setShowAddressForm(false);
      setManualMode(false);
    } catch (err) {
      setError('Failed to save address.');
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

  // Format delivery time
  const formatDeliveryTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Remove notifyAdmin and notifyUser, replace with sendNotification
  const sendNotification = async (orderData: any, recipient: string) => {
    try {
      const notification: INotification = {
        type: recipient === "admin" ? "admin_new_order" : "user_order_confirmation",
        recipient,
        userId: orderData.customerId, // always include userId for filtering
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
    } catch (error) {
      // Optionally handle error
    }
  };

  // Handle add address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!address.trim()) {
      setError("Please provide a delivery address.");
      return;
    }

    if (!phoneNumber.trim()) {
      setError("Please provide a phone number.");
      return;
    }

    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError(
        "Please enter a valid phone number in E.164 format (e.g., +234XXXXXXXXX)."
      );
      return;
    }

    setShowAddressForm(false);
  };

  // Handle confirm location
  const handleConfirmLocation = () => {
    let fullAddress = tempAddress;
    if (apartmentFlat.trim()) {
      fullAddress = `${apartmentFlat}, ${tempAddress}`;
    }
    setAddress(fullAddress);
    setShowAddressForm(false);
    setManualMode(false);
  };
  console.log("the selected address is:", address);
  // Handle place order
  const handlePlaceOrder = useCallback(() => {
    setShowConfirmation(true);
  }, []);

  // Handle confirm order
  const handleConfirmOrder = useCallback(async () => {
    if (!address || !phoneNumber || orders.length === 0) {
      setError(
        "Please add a delivery address, phone number, and items to your cart."
      );
      return;
    }

    if (!isAuthenticated) {
      setError("Please log in to place an order.");
      return;
    }

    setIsOrderLoading(true);
    setError(null);

    try {
      const userData = await account.get();
      const orderId = ID.unique();
      const deliveryTime = calculateDeliveryTime();

      const order = {
        orderId,
        itemIds: orders.map((item: any) => item.$id),
        paymentMethod,
        address,
        apartmentFlat,
        label,
        deliveryTime: formatDeliveryTime(deliveryTime),
        createdAt: new Date().toISOString(),
        total: subtotal + deliveryFee,
        status: "pending" as OrderStatus,
        phone: phoneNumber,
        customerId: userData.$id,
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
        sendNotification(order, userData.$id),
      ]);

      // Delete all order items for the user
      await Promise.all(
        orders.map((item: any) => dispatch(deleteOrderAsync(item.$id)))
      );
      // Clear Redux order state
      dispatch(resetOrders());

      setIsOrderLoading(false);
      setShowConfirmation(false);
      router.push("/order-confirmation");
    } catch (err: any) {
      setError(`Failed to place order: ${err.message}`);
      setIsOrderLoading(false);
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
    isAuthenticated,
    apartmentFlat,
    label,
    dispatch,
    router,
    calculateDeliveryTime,
    formatDeliveryTime,
  ]);

  // Add this effect after addressMode and address state declarations
  useEffect(() => {
    if (address === "__add_new__") {
      setAddressMode('add');
    }
  }, [address]);

  // Update the autocomplete initialization effect for the dialog
  useEffect(() => {
    if (mapLoaded && showAddressForm && addressMode === 'add' && !manualMode && dialogAutocompleteInput.current) {
      dialogAutocompleteRef.current = new window.google.maps.places.Autocomplete(
        dialogAutocompleteInput.current,
        {
          types: ["geocode"],
          componentRestrictions: { country: "ng" },
        }
      );
      dialogAutocompleteRef.current.addListener("place_changed", () => {
        const place = dialogAutocompleteRef.current?.getPlace();
        if (place?.formatted_address) {
          setTempAddress(place.formatted_address);
        } else if (place?.name) {
          setTempAddress(place.name);
        }
      });
    }
  }, [mapLoaded, showAddressForm, addressMode, manualMode]);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 py-12 px-2 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          {/* Branch Selection */}
          <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-900/80 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Select Branch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={String(selectedBranch)}
                onValueChange={(val) => setSelectedBranch(Number(val))}
                className="flex flex-wrap gap-4"
                aria-label="Branch selection"
              >
                {branches.map((branch) => (
                  <label
                    key={branch.id}
                    htmlFor={`branch-${branch.id}`}
                    className={`flex items-center px-6 py-3 rounded-xl font-semibold cursor-pointer border-2 transition-all duration-200 shadow-sm text-base min-w-[180px] justify-between gap-2
                    ${selectedBranch === branch.id
                      ? "bg-orange-500/90 text-white border-orange-500 shadow-lg"
                      : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-200 hover:bg-orange-50 dark:hover:bg-gray-700"}
                  `}
                  >
                    <RadioGroupItem
                      value={String(branch.id)}
                      id={`branch-${branch.id}`}
                      className="sr-only"
                    />
                    <span>{branch.name}</span>
                    {branch.id === 1 && (
                      <span className="ml-2 text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">main</span>
                    )}
                  </label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Branch Location with Map */}
          <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-900/80 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Branch Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 mb-4">
                <div className="font-semibold text-lg text-gray-800 dark:text-gray-100">
                  {branches.find((b) => b.id === selectedBranch)?.name}
                </div>
                <div className="text-base text-gray-700 dark:text-gray-300">
                  {branches.find((b) => b.id === selectedBranch)?.address}
                </div>
              </div>
              <div
                id="branch-map"
                style={{ width: "100%", height: "250px", borderRadius: "1rem", overflow: "hidden" }}
                className="border border-gray-200 dark:border-gray-700 shadow-md"
              />
            </CardContent>
          </Card>

          {/* Delivery Options */}
          <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-900/80 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Delivery Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 block">
                  Delivery Day
                </Label>
                <RadioGroup
                  value={deliveryDay}
                  onValueChange={(value: "today" | "tomorrow") =>
                    setDeliveryDay(value)
                  }
                  className="flex gap-6"
                >
                  <label className="flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 font-medium text-base transition-all duration-150">
                    <RadioGroupItem value="today" />
                    <span>Today</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer px-4 py-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 font-medium text-base transition-all duration-150">
                    <RadioGroupItem value="tomorrow" />
                    <span>Tomorrow</span>
                  </label>
                </RadioGroup>
              </div>
              {timeSlots.length > 0 && (
                <div>
                  <Label className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2 block">
                    Delivery Time
                  </Label>
                  <RadioGroup
                    value={selectedTimeSlot}
                    onValueChange={setSelectedTimeSlot}
                    className="grid grid-cols-2 gap-3"
                  >
                    {timeSlots.map((slot) => (
                      <label
                        key={slot.id}
                        className="flex items-center space-x-2 cursor-pointer p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 font-medium text-base transition-all duration-150"
                      >
                        <RadioGroupItem value={slot.id} />
                        <span>{slot.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address Form */}
          <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-900/80 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-gray-800 rounded-xl shadow-sm">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-6 h-6 text-orange-500" />
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {address || "No address added"}
                      </p>
                      <p className="text-base text-gray-700 dark:text-gray-300">
                        {phoneNumber || "No phone number"}
                      </p>
                      <p className="text-xs text-gray-500">{label}</p>
                    </div>
                  </div>
                  <Dialog
                    open={showAddressForm}
                    onOpenChange={setShowAddressForm}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-lg font-semibold">
                        {address ? "Edit" : "Add"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="rounded-2xl">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-bold">
                          {address ? "Edit Address" : "Add Address"}
                        </DialogTitle>
                      </DialogHeader>
                      {/* If there are saved addresses, show selection */}
                      {addressMode === 'select' && userAddresses.length > 0 && (
                        <div className="mb-4">
                          <Label className="mb-2 block">Select a saved address</Label>
                          <RadioGroup value={address} onValueChange={setAddress}>
                            {userAddresses.map((addr, idx) => (
                              <label key={idx} className="flex items-center space-x-2 cursor-pointer p-2 rounded border hover:bg-orange-50">
                                <RadioGroupItem value={addr} />
                                <span>{addr}</span>
                              </label>
                            ))}
                            <label className="flex items-center space-x-2 cursor-pointer p-2 rounded border hover:bg-orange-50">
                              <RadioGroupItem value="__add_new__" />
                              <span>Add new address</span>
                            </label>
                          </RadioGroup>
                        </div>
                      )}
                      {/* Add new address form */}
                      {addressMode === 'add' && (
                        <div className="space-y-3">
                          {!manualMode ? (
                            <>
                              <input
                                ref={dialogAutocompleteInput}
                                type="text"
                                value={tempAddress}
                                onChange={e => setTempAddress(e.target.value)}
                                placeholder="Search for your address"
                                required
                                className="mb-2 p-3 border border-gray-200 dark:border-gray-700 rounded-xl w-full focus:ring-2 focus:ring-orange-400 focus:outline-none bg-gray-50 dark:bg-gray-800 text-base"
                              />
                              <Button
                                type="button"
                                variant="link"
                                onClick={() => setManualMode(true)}
                                className="w-full text-orange-600 dark:text-orange-400 font-semibold"
                              >
                                Can't find your address? Enter manually
                              </Button>
                            </>
                          ) : (
                            <>
                              <Input
                                value={tempAddress}
                                onChange={e => setTempAddress(e.target.value)}
                                placeholder="Enter your delivery address manually"
                                required
                                className="rounded-xl"
                              />
                              <Button
                                type="button"
                                variant="link"
                                onClick={() => setManualMode(false)}
                                className="w-full text-orange-600 dark:text-orange-400 font-semibold"
                              >
                                Back to address search
                              </Button>
                            </>
                          )}
                          <Input
                            value={apartmentFlat}
                            onChange={(e) => setApartmentFlat(e.target.value)}
                            placeholder="Apartment & Flat No"
                            className="mb-2 rounded-xl"
                          />
                          <div className="flex gap-2 mb-2">
                            <Button
                              type="button"
                              variant={label === "Home" ? "default" : "outline"}
                              onClick={() => setLabel("Home")}
                              className="rounded-lg"
                            >
                              Home
                            </Button>
                            <Button
                              type="button"
                              variant={label === "Work" ? "default" : "outline"}
                              onClick={() => setLabel("Work")}
                              className="rounded-lg"
                            >
                              Work
                            </Button>
                            <Button
                              type="button"
                              variant={label === "Other" ? "default" : "outline"}
                              onClick={() => setLabel("Other")}
                              className="rounded-lg"
                            >
                              Other
                            </Button>
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              let fullAddress = tempAddress;
                              if (apartmentFlat.trim()) {
                                fullAddress = `${apartmentFlat}, ${tempAddress}`;
                              }
                              handleSaveNewAddress(fullAddress);
                            }}
                            className="w-full mb-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-base py-3"
                          >
                            Save Address
                          </Button>
                          <Button
                            type="button"
                            variant="link"
                            onClick={() => setAddressMode('select')}
                            className="w-full text-orange-600 dark:text-orange-400 font-semibold"
                            disabled={userAddresses.length === 0}
                          >
                            Back to address list
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Order Summary Sticky on Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-8 lg:sticky lg:top-10"
        >
          {/* Order Summary */}
          <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-900/90 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-5">
                {orders.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-orange-50 dark:bg-gray-800 rounded-lg px-3 py-2 shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-gray-700 rounded-lg flex items-center justify-center text-orange-600 dark:text-orange-300 font-bold text-lg">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-gray-100">{item.name}</p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          ₦{item.price} each
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                      ₦{item.totalPrice}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-base font-medium">
                    <span>Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-medium">
                    <span>Delivery Fee</span>
                    <span className="flex items-center gap-2">
                      {isCalculatingFee && (
                        <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      )}
                      ₦{deliveryFee.toLocaleString()}
                    </span>
                  </div>
                  {deliveryDistance && deliveryDuration && (
                    <div className="text-xs text-gray-500 bg-orange-50 dark:bg-gray-800 p-2 rounded-lg mt-2">
                      <div className="flex justify-between">
                        <span>Distance:</span>
                        <span>{deliveryDistance}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated time:</span>
                        <span>{deliveryDuration}</span>
                      </div>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>₦{(subtotal + deliveryFee).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="shadow-lg border-0 bg-white/90 dark:bg-gray-900/80 rounded-2xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value: "card" | "cash") =>
                  setPaymentMethod(value)
                }
                className="space-y-4"
              >
                <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 font-medium text-base transition-all duration-150">
                  <RadioGroupItem value="card" />
                  <CreditCard className="w-6 h-6 text-orange-500" />
                  <span>Credit/Debit Card</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-800 font-medium text-base transition-all duration-150">
                  <RadioGroupItem value="cash" />
                  <Truck className="w-6 h-6 text-orange-500" />
                  <span>Cash on Delivery</span>
                </label>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Place Order Button */}
          <Button
            onClick={handlePlaceOrder}
            disabled={
              !address || !phoneNumber || orders.length === 0 || isOrderLoading
            }
            className="w-full py-5 text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl shadow-lg transition-all duration-200"
          >
            Place Order - ₦{(subtotal + deliveryFee).toLocaleString()}
          </Button>

          {/* Error Message */}
          {error && <p className="text-red-600 text-base text-center font-semibold mt-2">{error}</p>}

          {/* Confirmation Dialog */}
          <AnimatePresence>
            {showConfirmation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border-0"
                >
                  <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Confirm Order</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-6 text-lg">
                    Are you sure you want to place this order for ₦
                    {(subtotal + deliveryFee).toLocaleString()}?
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleConfirmOrder}
                      disabled={isOrderLoading}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg rounded-xl py-3"
                    >
                      {isOrderLoading ? "Processing..." : "Confirm Order"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowConfirmation(false)}
                      disabled={isOrderLoading}
                      className="flex-1 rounded-xl font-semibold text-lg py-3"
                    >
                      Cancel
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}