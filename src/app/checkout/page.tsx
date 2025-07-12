"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Clock, Phone, User, CreditCard, Truck } from "lucide-react";
import { useSelector } from "react-redux";
import { RootState } from "@/state/store";
import { account, validateEnv } from "@/utils/appwrite";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { ChevronRight, Loader2 } from "lucide-react";
import { fileUrl } from "@/utils/appwrite";
import Image from "next/image";

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
  const [selectedBranch, setSelectedBranch] = useState(1);
  const [deliveryDay, setDeliveryDay] = useState<"today" | "tomorrow">("today");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">("card");
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
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setWindowWidth(window.innerWidth);
      const handleResize = () => setWindowWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const orders = useSelector((state: RootState) => state.orders.orders) || [];
  const { loading, error: ordersErrorState } = useSelector(
    (state: RootState) => state.orders
  );

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

  const handleAddAddress = async (e: any) => {
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
    } catch (err: any) {
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
      alert("Please add a delivery address and phone number.");
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

  // Don't render until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Select Branch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {branches.map((branch) => (
                    <div
                      key={branch.id}
                      className="flex items-center px-4 py-2 rounded-full font-medium cursor-pointer border transition-all duration-200 bg-white text-gray-700 border-gray-300"
                    >
                      {branch.name}
                      {branch.id === 1 && (
                        <span className="ml-2 text-xs font-bold">(main)</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="shadow-sm border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-800">
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₦0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>₦500</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold">
                    <span>Total</span>
                    <span>₦500</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
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

          {/* Delivery Options */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Delivery Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Delivery Day */}
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Delivery Day
                </Label>
                <RadioGroup
                  value={deliveryDay}
                  onValueChange={(value: "today" | "tomorrow") =>
                    setDeliveryDay(value)
                  }
                  className="flex gap-4"
                >
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="today" />
                    <span className="text-sm">Today</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <RadioGroupItem value="tomorrow" />
                    <span className="text-sm">Tomorrow</span>
                  </label>
                </RadioGroup>
              </div>

              {/* Time Slots */}
              {timeSlots.length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Delivery Time
                  </Label>
                  <RadioGroup
                    value={selectedTimeSlot}
                    onValueChange={setSelectedTimeSlot}
                    className="grid grid-cols-2 gap-2"
                  >
                    {timeSlots.map((slot) => (
                      <label
                        key={slot.id}
                        className="flex items-center space-x-2 cursor-pointer p-2 rounded border hover:bg-gray-50"
                      >
                        <RadioGroupItem value={slot.id} />
                        <span className="text-sm">{slot.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Address Form */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!showAddressForm ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="font-medium text-gray-800">
                          {address || "No address added"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {phoneNumber || "No phone number"}
                        </p>
                      </div>
                    </div>
                    <Dialog
                      open={showAddressForm}
                      onOpenChange={setShowAddressForm}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddressForm(true)}
                        >
                          {address ? "Edit" : "Add"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {address ? "Edit Address" : "Add Address"}
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAddAddress} className="space-y-4">
                          <div>
                            <Label
                              htmlFor="address"
                              className="text-sm font-medium text-gray-700"
                            >
                              Address
                            </Label>
                            <Input
                              id="address"
                              type="text"
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="Enter your delivery address"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="phone"
                              className="text-sm font-medium text-gray-700"
                            >
                              Phone Number
                            </Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="+234XXXXXXXXX"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="password"
                              className="text-sm font-medium text-gray-700"
                            >
                              Password (for phone update)
                            </Label>
                            <Input
                              id="password"
                              type="password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Enter your password"
                              className="mt-1"
                            />
                          </div>
                          {error && (
                            <p className="text-red-600 text-sm">{error}</p>
                          )}
                          <div className="flex gap-2">
                            <Button type="submit" className="flex-1">
                              Save Address
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowAddressForm(false)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div>
                    <Label
                      htmlFor="address"
                      className="text-sm font-medium text-gray-700"
                    >
                      Address
                    </Label>
                    <Input
                      id="address"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Enter your delivery address"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-700"
                    >
                      Phone Number
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+234XXXXXXXXX"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700"
                    >
                      Password (for phone update)
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="mt-1"
                    />
                  </div>
                  {error && <p className="text-red-600 text-sm">{error}</p>}
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      Save Address
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddressForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Right: Order Summary, Payment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Order Summary */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex justify-between items-center"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {item.quantity}x
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          ₦{item.price} each
                        </p>
                      </div>
                    </div>
                    <span className="font-medium text-gray-800">
                      ₦{item.totalPrice}
                    </span>
                  </div>
                ))}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>₦500</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span>₦{(subtotal + 500).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card className="shadow-sm border-gray-200">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-800">
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value: "card" | "cash") =>
                  setPaymentMethod(value)
                }
                className="space-y-3"
              >
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded border hover:bg-gray-50">
                  <RadioGroupItem value="card" />
                  <CreditCard className="w-5 h-5 text-orange-500" />
                  <span>Credit/Debit Card</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer p-3 rounded border hover:bg-gray-50">
                  <RadioGroupItem value="cash" />
                  <Truck className="w-5 h-5 text-orange-500" />
                  <span>Cash on Delivery</span>
                </label>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Place Order Button */}
          <Button
            onClick={handlePlaceOrder}
            disabled={!address || !phoneNumber || orders.length === 0}
            className="w-full py-4 text-lg font-semibold bg-orange-600 hover:bg-orange-700 text-white"
          >
            Place Order - ₦{(subtotal + 500).toLocaleString()}
          </Button>

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
                  className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
                >
                  <h3 className="text-lg font-semibold mb-4">Confirm Order</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to place this order for ₦
                    {(subtotal + 500).toLocaleString()}?
                  </p>
                  <div className="flex gap-3">
                    <Button
                      onClick={handleConfirmOrder}
                      disabled={isOrderLoading}
                      className="flex-1 bg-orange-600 hover:bg-orange-700"
                    >
                      {isOrderLoading ? "Processing..." : "Confirm Order"}
                    </Button>
                    <Button
                      variant="outline"
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
        </motion.div>
      </div>
    </div>
  );
}



