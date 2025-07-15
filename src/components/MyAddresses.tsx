"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Trash2 } from "lucide-react";
import { account, databases, validateEnv } from "@/utils/appwrite";
import { Loader } from "@googlemaps/js-api-loader";

const MyAddresses = () => {
  const [addresses, setAddresses] = useState<string[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState("");
  const [apartmentFlat, setApartmentFlat] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const autocompleteInput = useRef<HTMLInputElement | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
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
          setAddresses(userDoc.address);
        } else {
          setAddresses([]);
        }
      } catch {
        setAddresses([]);
      }
    })();
  }, []);

  // Load Google Maps script for Places Autocomplete
  useEffect(() => {
    const { googleMapsApiKey } = validateEnv();
    if (!googleMapsApiKey) return;
    const loader = new Loader({
      apiKey: googleMapsApiKey,
      version: "weekly",
      libraries: ["places"],
    });
    loader.load().then(() => setMapLoaded(true));
  }, []);

  // Initialize autocomplete when mapLoaded and add form is open and not manual
  useEffect(() => {
    if (mapLoaded && showAddForm && !manualMode) {
      setTimeout(() => {
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
            if (place?.formatted_address) {
              setNewAddress(place.formatted_address);
            } else if (place?.name) {
              setNewAddress(place.name);
            }
          });
        }
      }, 100);
    }
  }, [mapLoaded, showAddForm, manualMode]);

  // Add new address
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const userData = await account.get();
      const { databaseId, userCollectionId } = validateEnv();
      let fullAddress = newAddress.trim();
      if (apartmentFlat.trim()) {
        fullAddress = `${apartmentFlat.trim()}, ${fullAddress}`;
      }
      const updatedAddresses = [...addresses, fullAddress];
      await databases.updateDocument(
        databaseId,
        userCollectionId,
        userData.$id,
        {
          address: updatedAddresses,
        }
      );
      setAddresses(updatedAddresses);
      setNewAddress("");
      setApartmentFlat("");
      setShowAddForm(false);
    } catch (err) {
      setError("Failed to add address.");
    } finally {
      setLoading(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (idx: number) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await account.get();
      const { databaseId, userCollectionId } = validateEnv();
      const updatedAddresses = addresses.filter((_, i) => i !== idx);
      await databases.updateDocument(
        databaseId,
        userCollectionId,
        userData.$id,
        {
          address: updatedAddresses,
        }
      );
      setAddresses(updatedAddresses);
    } catch (err) {
      setError("Failed to delete address.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
          My Addresses
        </h1>
        <p className="text-gray-500 dark:text-gray-300">
          Manage your delivery addresses
        </p>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Saved Addresses{" "}
          <span className="text-base font-normal text-gray-500 dark:text-gray-400">
            ({addresses.length})
          </span>
        </h2>
        <Button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-md transition-all duration-200"
        >
          <Plus className="w-5 h-5" /> Add New Address
        </Button>
      </div>

      {error && (
        <p className="text-red-600 mb-4 text-center font-semibold">{error}</p>
      )}

      {/* Add Address Form as custom modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0 w-full max-w-lg mx-4 p-8 relative animate-fade-in">
            <button
              onClick={() => {
                setShowAddForm(false);
                setManualMode(false);
                setNewAddress("");
                setApartmentFlat("");
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl font-bold focus:outline-none"
              aria-label="Close"
              type="button"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Add New Address
            </h2>
            <form onSubmit={handleAddAddress} className="space-y-6">
              {!manualMode ? (
                <>
                  <input
                    ref={autocompleteInput}
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Search for your address"
                    required
                    className="rounded-xl px-4 py-3 text-base border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-gray-50 dark:bg-gray-800 w-full"
                  />
                </>
              ) : (
                <>
                  <Input
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Enter new address manually"
                    required
                    className="rounded-xl px-4 py-3 text-base border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-gray-50 dark:bg-gray-800"
                  />
                </>
              )}
              <Input
                value={apartmentFlat}
                onChange={(e) => setApartmentFlat(e.target.value)}
                placeholder="e.g. Apt 2B, Suite 301, Flat 4"
                className="rounded-xl px-4 py-3 text-base border border-gray-300 focus:ring-2 focus:ring-orange-400 focus:outline-none bg-gray-50 dark:bg-gray-800"
              />
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-xl py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-lg shadow-md transition-all duration-200"
                >
                  {loading ? "Adding..." : "Add Address"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setManualMode(false);
                    setNewAddress("");
                    setApartmentFlat("");
                  }}
                  className="flex-1 rounded-xl py-3 font-semibold text-lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {addresses.length === 0 ? (
        <Card className="rounded-2xl shadow-xl border-0 bg-white/90 dark:bg-gray-900/80">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <MapPin className="w-20 h-20 text-orange-400 mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No Addresses Yet
            </h3>
            <p className="text-gray-500 dark:text-gray-300 text-center mb-8">
              Add your first delivery address to get started
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-md transition-all duration-200"
            >
              <Plus className="w-5 h-5" /> Add Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {addresses.map((address, idx) => (
            <Card
              key={idx}
              className="rounded-2xl shadow-lg border-0 bg-white/95 dark:bg-gray-900/90 hover:shadow-2xl transition-shadow"
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <MapPin className="w-6 h-6 text-orange-500" />
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 dark:text-white">
                        Address {idx + 1}
                      </CardTitle>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteAddress(idx)}
                    disabled={loading}
                    className="rounded-lg font-semibold px-3 py-1.5 hover:bg-red-600 transition-all"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 px-1 pb-2">
                  <p className="text-base text-gray-700 dark:text-gray-200 break-words">
                    {address}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyAddresses; 