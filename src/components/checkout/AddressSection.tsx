
import React, { MouseEvent, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin } from "lucide-react";
import { Loader } from "@googlemaps/js-api-loader";
import { validateEnv } from "@/utils/appwrite";

interface AddressSectionProps {
  address: string;
  phoneNumber: string;
  showAddressForm: boolean;
  setShowAddressForm: (open: boolean) => void;
  addressMode: "select" | "add";
  userAddresses: string[];
  setAddress: (address: string) => void;
  setAddressMode: (mode: "select" | "add") => void;
  tempAddress: string;
  setTempAddress: (address: string) => void;
  manualMode: boolean;
  setManualMode: (mode: boolean) => void;
  googlePlaceSelected: boolean;
  setGooglePlaceSelected: (val: boolean) => void;
  selectedPlace: any;
  setSelectedPlace: (place: any) => void;
  lastPickedAddress: string;
  setLastPickedAddress: (val: string) => void;
  apartmentFlat: string;
  setApartmentFlat: (val: string) => void;
  label: "Home" | "Work" | "Other";
  setLabel: (val: "Home" | "Work" | "Other") => void;
  error: string | null;
  setError: (err: string | null) => void;
  handleSaveNewAddress: (address: string) => Promise<void>;
  handleAddAddress: (e: React.FormEvent) => Promise<void>;
  selectedBranch: number;
  branches: {
    id: number;
    name: string;
    lat: number;
    lng: number;
    address: string;
  }[];
}

const AddressSection: React.FC<AddressSectionProps> = (props) => {
  const {
    address,
    phoneNumber,
    showAddressForm,
    setShowAddressForm,
    addressMode,
    userAddresses,
    setAddress,
    setAddressMode,
    tempAddress,
    setTempAddress,
    manualMode,
    setManualMode,
    googlePlaceSelected,
    setGooglePlaceSelected,
    selectedPlace,
    setSelectedPlace,
    lastPickedAddress,
    setLastPickedAddress,
    apartmentFlat,
    setApartmentFlat,
    label,
    setLabel,
    error,
    setError,
    handleSaveNewAddress,
    handleAddAddress,
    selectedBranch,
    branches,
  } = props;

  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstance = useRef<google.maps.Map | null>(null);
  const markerInstance = useRef<google.maps.Marker | null>(null);
  const autocompleteInput = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({
    lat: 6.5244, // Default to Lagos, Nigeria
    lng: 3.3792,
  });
  // Load Google Maps script
  useEffect(() => {
    const { googleMapsApiKey } = validateEnv();
    if (!googleMapsApiKey) {
      setMapError("Google Maps API key is missing.");
      return;
    }
    const loader = new Loader({
      apiKey: googleMapsApiKey,
      version: "weekly",
      libraries: ["places"],
    });
    loader
      .load()
      .then(() => setMapLoaded(true))
      .catch((err) => {
        setMapError("Failed to load Google Maps: " + err.message);
      });
  }, []);

  // Initialize map and autocomplete
  useEffect(() => {
    if (!mapLoaded || manualMode || addressMode !== "add") return;

    // Initialize map
    if (mapRef.current && !mapInstance.current) {
      const branch = branches.find((b) => b.id === selectedBranch);
      const initialCenter = branch
        ? { lat: branch.lat, lng: branch.lng }
        : mapCenter;
      mapInstance.current = new window.google.maps.Map(mapRef.current, {
        center: initialCenter,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
      });
      markerInstance.current = new google.maps.Marker({
        position: initialCenter,
        map: mapInstance.current,
      });
      setMapCenter(initialCenter);
    }

    // Initialize autocomplete
    if (autocompleteInput.current && !autocompleteRef.current) {
      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        autocompleteInput.current,
        {
          types: ["geocode"],
          componentRestrictions: { country: "ng" },
        }
      );
      autocompleteInput.current.addEventListener("input", () => {
        setTempAddress(autocompleteInput.current!.value);
        setGooglePlaceSelected(false);
      });
      
      autocompleteRef.current.addListener(
        "place_changed",
        (
          e: MouseEvent<React.RefObject<google.maps.places.Autocomplete | null>>
        ) => {

          console.log("A place just changed now");
          const place = autocompleteRef.current?.getPlace();
          if (place?.geometry?.location) {
            const location = place.geometry.location;
            const newCenter = { lat: location.lat(), lng: location.lng() };
            setMapCenter(newCenter);
            mapInstance.current?.setCenter(newCenter);
            markerInstance.current?.setPosition(newCenter);
            const newAddress = place.formatted_address || place.name || "";
            setTempAddress(newAddress);
            setGooglePlaceSelected(true);
            setSelectedPlace(place);
            setLastPickedAddress(newAddress);
          }
        }
      );
    }

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
      if (mapInstance.current) {
        mapInstance.current = null;
      }
      if (markerInstance.current) {
        markerInstance.current.setMap(null);
        markerInstance.current = null;
      }
    };
  }, [mapLoaded, manualMode, addressMode, selectedBranch, branches]);

  // Save and close modal
  const handleSave = async () => {
    if (!tempAddress.trim()) {
      setError("Please enter your address.");
      return;
    }
    if (!label) {
      setError("Please select a label for your address (Home, Work, or Other).");
      return;
    }
    setError(null);
    let fullAddress = tempAddress;
    if (apartmentFlat.trim()) {
      fullAddress = `${apartmentFlat}, ${tempAddress}`;
    }
    await handleSaveNewAddress(fullAddress);
    setShowAddressForm(false);
    setManualMode(false);
    setGooglePlaceSelected(false);
    setLastPickedAddress("");
    setTempAddress("");
    setApartmentFlat("");
  };

  return (
    <Card className="bg-transparent border-0 p-0">
      <CardHeader className="pb-2 bg-transparent border-0">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
          Delivery Address
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
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
            <Button
              variant="outline"
              size="sm"
              className="rounded-lg font-semibold"
              onClick={() => setShowAddressForm(true)}
            >
              {address ? "Edit" : "Add"}
            </Button>
            {/* Address Modal - custom div modal */}
            {showAddressForm && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0 w-full max-w-lg mx-4 p-8 relative animate-fade-in" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setShowAddressForm(false);
                      setManualMode(false);
                      setTempAddress("");
                      setApartmentFlat("");
                      setError(null);
                    }}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold focus:outline-none"
                    aria-label="Close"
                    type="button"
                  >
                    ×
                  </button>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{address ? "Edit Address" : "Add Address"}</h2>
                  {mapError && (
                    <p className="text-red-600 text-sm mt-1">{mapError}</p>
                  )}
                  {addressMode === "select" && userAddresses.length > 0 && (
                    <div className="mb-4">
                      <Label className="mb-2 block">Select a saved address</Label>
                      <RadioGroup
                        value={address}
                        onValueChange={(val) => {
                          if (val === "__add_new__") {
                            setAddressMode("add");
                          } else {
                            setAddress(val);
                            setShowAddressForm(false);
                          }
                        }}
                      >
                        {userAddresses.map((addr, idx) => (
                          <label
                            key={idx}
                            className="flex items-center space-x-2 cursor-pointer p-2 rounded border hover:bg-orange-50"
                          >
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
                  {addressMode === "add" && (
                    <div className="space-y-3">
                      {!manualMode ? (
                        <>
                          <div className="relative">
                            <input
                              ref={autocompleteInput}
                              placeholder="Search for your address"
                              className="mb-2 p-3 border border-gray-200 dark:border-gray-700 rounded-xl w-full focus:ring-2 focus:ring-orange-400 focus:outline-none bg-gray-50 dark:bg-gray-800 text-base pr-10"
                            />
                            {googlePlaceSelected &&
                              tempAddress === lastPickedAddress && (
                                <span
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600"
                                  title="Google verified"
                                >
                                  ✓
                                </span>
                              )}
                          </div>
                          <div className="w-full h-80 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 mb-2">
                            {mapLoaded ? (
                              <div
                                ref={mapRef}
                                style={{  width: "100%", height: "100%", }}
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700">
                                <p>Loading map...</p>
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="link"
                            onClick={() => {
                              setManualMode(true);
                              setGooglePlaceSelected(false);
                              setLastPickedAddress("");
                            }}
                            className="w-full text-orange-600 dark:text-orange-400 font-semibold"
                          >
                            Can't find your address? Enter manually
                          </Button>
                          {error && (
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                          )}
                          <Button
                            type="button"
                            onClick={handleSave}
                            className="w-full mb-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-base py-3"
                            disabled={!tempAddress.trim()}
                          >
                            Save Address
                          </Button>
                        </>
                      ) : (
                        <>
                          <Input
                            value={tempAddress}
                            onChange={(e) => setTempAddress(e.target.value)}
                            placeholder="Enter your delivery address manually"
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
                          {error && (
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                          )}
                          <Button
                            type="button"
                            onClick={handleSave}
                            className="w-full mb-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-base py-3"
                            disabled={!tempAddress.trim()}
                          >
                            Save Address
                          </Button>
                        </>
                      )}
                      <Input
                        value={apartmentFlat}
                        onChange={(e) => setApartmentFlat(e.target.value)}
                        placeholder="e.g. Apt 2B, Suite 301, Flat 4"
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
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AddressSection;