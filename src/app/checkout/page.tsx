"use client";
import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Clock, ChevronRight, Loader2 } from "lucide-react";
import { RootState } from "@/state/store";
import { motion, AnimatePresence } from "framer-motion";
import { account, validateEnv, fileUrl } from "@/utils/appwrite";
import Image from "next/image";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const branches = [
  { id: 1, name: "FAVGRAB OWERRI-1 (main)", lat: 5.4862, lng: 7.0256 },
  { id: 2, name: "FavGrab FUTO (OWERRI)", lat: 5.3846, lng: 6.996 },
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

export default function CheckoutPage() {
  const [selectedBranch, setSelectedBranch] = useState(branches[0].id);
  const [deliveryDay, setDeliveryDay] = useState("today");
  const [selectedTime, setSelectedTime] = useState("now");
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [isOrderLoading, setIsOrderLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [address, setAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState(""); // Added for Appwrite phone update
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const orders = useSelector((state: RootState) => state.orders.orders) || [];
  const { loading, error: ordersErrorState } = useSelector((state: RootState) => state.orders);


  const timeSlots = useMemo(
    () => (deliveryDay === "today" ? generateTimeSlots() : []),
    [deliveryDay]
  );
  const subtotal = (orders || []).reduce(
    (sum, item) => sum + (item.totalPrice || 0),
    0
  );
  // Get Google Maps API key from environment variable (must be NEXT_PUBLIC_ prefix)
  const { googleMapsApiKey } = validateEnv();
  // Build the map URL using the env variable
  const mapUrl = `https://www.google.com/maps/embed/v1/view?key=${googleMapsApiKey}&center=5.4356,7.0176&zoom=12&maptype=roadmap`;

  // Fetch current user data to prefill phone number
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await account.get();
        setIsAuthenticated(true);
        setPhoneNumber(userData.phone || "");
        // Optionally fetch address from a database collection
      } catch (err) {
        setIsAuthenticated(false);
        setError("Please log in to proceed with checkout.");
      }
    };
    fetchUser();
  }, []);

  const handleAddAddress = async (e:any) => {
    e.preventDefault();
    setError(null);
    if (!address || !phoneNumber || !password) {
      setError("Please provide address, phone number, and password.");
      return;
    }
    // Validate phone number (basic E.164 format check)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber)) {
      setError(
        "Please enter a valid phone number in E.164 format (e.g., +1234567890)."
      );
      return;
    }
    try {
      // Update phone number in Appwrite
      await account.updatePhone(phoneNumber, password);
      setShowAddressForm(false);
      setPassword(""); // Clear password after submission
      // Save address to backend or state as needed (e.g., Appwrite database)
    } catch (err:any) {
      setError(
        err.message ||
          "Failed to update phone number. Please check your password."
      );
    }
  };

  const handlePlaceOrder = useCallback(() => {
    setShowConfirmation(true);
  }, []);

  const handleConfirmOrder = useCallback(() => {
    if (!address || !phoneNumber) {
      alert('Please add a delivery address and phone number.');
      return;
    }
    setIsOrderLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsOrderLoading(false);
      setShowConfirmation(false);
      // Redirect or handle order submission
      // Example: window.location.href = '/order-confirmation';
    }, 2000);
  }, [address, phoneNumber]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Branch, Map, Address, Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Branch Selection */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Select Branch
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={String(selectedBranch)}
                onValueChange={(val) => setSelectedBranch(Number(val))}
                className="flex flex-wrap gap-3"
                aria-label="Branch selection"
              >
                {branches.map((branch) => (
                  <label
                    key={branch.id}
                    htmlFor={`branch-${branch.id}`}
                    className={`flex items-center px-4 py-2 rounded-full font-medium cursor-pointer border transition-all duration-200 ${
                      selectedBranch === branch.id
                        ? "bg-red-500 text-white border-red-500"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-orange-50"
                    }`}
                  >
                    <RadioGroupItem
                      value={String(branch.id)}
                      id={`branch-${branch.id}`}
                      className="sr-only"
                    />
                    {branch.name}
                    {branch.id === 1 && (
                      <span className="ml-2 text-xs font-bold">(main)</span>
                    )}
                  </label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Google Map */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Branch Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence>
                {(isMapExpanded || windowWidth >= 1024) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden rounded-lg"
                  >
                    <iframe
                      title="Branch Map"
                      width="100%"
                      height="250"
                      style={{ border: 0 }}
                      src={mapUrl}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <Button
                variant="ghost"
                className="w-full mt-3 text-pink-600 hover:bg-orange-50"
                onClick={() => setIsMapExpanded(!isMapExpanded)}
                title={isMapExpanded ? "Hide map" : "Show map"}
              >
                {isMapExpanded ? "Hide Map" : "Show Map"}
              </Button>
              <div className="flex flex-wrap gap-4 mt-4">
                {branches.map((branch) => (
                  <div key={branch.id} className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">
                      {branch.name}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Delivery Address */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-gray-600">
                  {address ? `${address} (${phoneNumber})` : 'No address selected'}
                </span>
                <Dialog open={showAddressForm} onOpenChange={setShowAddressForm}>
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-pink-600 hover:text-pink-700 flex items-center gap-1"
                      title="Add a new delivery address"
                      disabled={!isAuthenticated}
                    >
                      <Plus className="w-4 h-4" /> {address ? 'Edit' : 'Add'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{address ? "Edit Address" : "Add Address"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddAddress} className="space-y-4">
                      <div>
                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                          Address
                        </label>
                        <Input
                          id="address"
                          type="text"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Enter your delivery address"
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="Enter your phone number"
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                          Password (required to update phone number)
                        </label>
                        <Input
                          id="password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="mt-1"
                          required
                        />
                      </div>
                      {error && <p className="text-sm text-red-500">{error}</p>}
                      <DialogFooter>
                        <Button
                          type="submit"
                          className="bg-pink-500 hover:bg-pink-600 text-white"
                          title="Save address"
                          disabled={isOrderLoading}
                        >
                          Save
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowAddressForm(false);
                            setError(null);
                          }}
                          title="Cancel address entry"
                          disabled={isOrderLoading}
                        >
                          Cancel
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              {!isAuthenticated && (
                <p className="text-sm text-red-500 mt-2">
                  Please log in to add an address and phone number.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Preferred Time Frame For Delivery */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Preferred Delivery Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={deliveryDay}
                onValueChange={setDeliveryDay}
                className="flex gap-4 mb-4"
                aria-label="Delivery day selection"
              >
                <label
                  htmlFor="today"
                  className={`flex items-center px-4 py-2 rounded-full cursor-pointer border transition-all duration-200 ${
                    deliveryDay === "today"
                      ? "bg-pink-600 text-white border-pink-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-orange-50"
                  }`}
                >
                  <RadioGroupItem
                    value="today"
                    id="today"
                    className="sr-only"
                  />
                  Today
                </label>
                <label
                  htmlFor="tomorrow"
                  className={`flex items-center px-4 py-2 rounded-full cursor-pointer border transition-all duration-200 ${
                    deliveryDay === "tomorrow"
                      ? "bg-pink-600 text-white border-pink-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-orange-50"
                  }`}
                >
                  <RadioGroupItem
                    value="tomorrow"
                    id="tomorrow"
                    className="sr-only"
                  />
                  Tomorrow
                </label>
              </RadioGroup>
              <RadioGroup
                value={selectedTime}
                onValueChange={setSelectedTime}
                className="flex flex-wrap gap-3"
                aria-label="Delivery time slot selection"
              >
                {timeSlots.length > 0 ? (
                  timeSlots.map((slot) => (
                    <label
                      key={slot.id}
                      htmlFor={`slot-${slot.id}`}
                      className={`flex items-center px-4 py-2 rounded-full cursor-pointer border text-sm font-medium transition-all duration-200 ${
                        selectedTime === slot.id
                          ? "bg-pink-600 text-white border-pink-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-orange-50"
                      }`}
                    >
                      <RadioGroupItem
                        value={slot.id}
                        id={`slot-${slot.id}`}
                        className="sr-only"
                      />
                      {slot.label}
                    </label>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">
                    No time slots available for tomorrow. Please select "Today".
                  </p>
                )}
              </RadioGroup>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: Cart Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xl font-bold text-gray-800">
                Cart Summary
              </CardTitle>
              <Badge className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                Delivery
              </Badge>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center text-gray-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Loading cart...
                </div>
              ) : ordersErrorState ? (
                <div className="text-center text-red-500">
                  Error loading cart: {ordersErrorState}
                </div>
              ) : !orders || orders.length === 0 ? (
                <div className="text-center text-gray-500">
                  No items in cart.
                </div>
              ) : (
                orders.map((item) => (
                  <div key={item.$id} className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                      <Image
                        src={
                          typeof item.image === "string"
                            ? fileUrl(
                                item.source === "featured"
                                  ? validateEnv().featuredBucketId
                                  : item.source === "popular"
                                  ? validateEnv().popularBucketId
                                  : validateEnv().menuBucketId,
                                item.image
                              )
                            : "/placeholder.png"
                        }
                        alt={item.name}
                        className="object-cover w-full h-full"
                        width={100}
                        height={100}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-800">
                        {item.name}
                      </div>
                      <div className="text-gray-500 text-sm">₦{item.price}</div>
                    </div>
                    <div className="font-bold text-gray-800">
                      {item.quantity}
                    </div>
                  </div>
                ))
              )}
              <Button
                variant="outline"
                className="w-full flex items-center justify-between mb-4 text-blue-500 hover:bg-blue-50"
                title="Apply a coupon or select an offer"
              >
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Select Offer/Apply Coupon
                </span>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">₦{subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount</span>
                  <span className="text-green-600">₦0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Charge</span>
                  <span className="text-green-600">₦0</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2">
                  <span className="text-gray-800">Total</span>
                  <span className="text-gray-800">₦{subtotal}</span>
                </div>
              </div>
              {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
            </CardContent>
          </Card>
          <Button
            className="w-full h-12 text-lg font-bold bg-pink-500 hover:bg-pink-600 mt-6 rounded-full flex items-center justify-center"
            onClick={handlePlaceOrder}
            disabled={isOrderLoading || !orders || orders.length === 0 || timeSlots.length === 0 || !address || !phoneNumber}
            title="Place your order"
          >
            {isOrderLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" /> Placing
                Order...
              </>
            ) : (
              "Place Order"
            )}
          </Button>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Confirm Order
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to place this order for ₦{subtotal}?
              </p>
              <div className="flex gap-2">
                <Button
                  className="bg-pink-500 hover:bg-pink-600 text-white flex-1"
                  onClick={handleConfirmOrder}
                  disabled={isOrderLoading}
                >
                  {isOrderLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                      Confirming...
                    </>
                  ) : (
                    "Confirm"
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirmation(false)}
                  disabled={isOrderLoading}
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



