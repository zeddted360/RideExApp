"use client";
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Home, 
  Building, 
  Star,
  CheckCircle,
  Loader2
} from 'lucide-react';

interface Address {
  id: string;
  name: string;
  type: 'home' | 'work' | 'other';
  address: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
  isDefault: boolean;
}

const MyAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      name: 'Home Address',
      type: 'home',
      address: '123 Main Street, Victoria Island',
      city: 'Lagos',
      state: 'Lagos',
      postalCode: '101241',
      phone: '+2348012345678',
      isDefault: true
    },
    {
      id: '2',
      name: 'Office Address',
      type: 'work',
      address: '456 Business Avenue, Ikeja',
      city: 'Lagos',
      state: 'Lagos',
      postalCode: '100001',
      phone: '+2348098765432',
      isDefault: false
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'home' as 'home' | 'work' | 'other',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phone: ''
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const getAddressIcon = (type: Address['type']) => {
    switch (type) {
      case 'home':
        return <Home className="w-4 h-4 text-blue-500" />;
      case 'work':
        return <Building className="w-4 h-4 text-green-500" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: Address['type']) => {
    switch (type) {
      case 'home':
        return 'bg-blue-100 text-blue-800';
      case 'work':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200";
      case "inactive":
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
      default:
        return "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200";
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'home',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      phone: ''
    });
    setEditingAddress(null);
    setShowAddForm(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAddress) {
      // Update existing address
      setAddresses(prev => prev.map(addr => 
        addr.id === editingAddress.id 
          ? { ...addr, ...formData }
          : addr
      ));
    } else {
      // Add new address
      const newAddress: Address = {
        id: Date.now().toString(),
        ...formData,
        isDefault: addresses.length === 0 // First address is default
      };
      setAddresses(prev => [...prev, newAddress]);
    }
    
    resetForm();
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      name: address.name,
      type: address.type,
      address: address.address,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      phone: address.phone
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const handleSetDefault = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  const handleUseMyLocation = async () => {
    setIsLocating(true);
    setLocationError(null);
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      setLocationError('Google Maps API key is missing.');
      setIsLocating(false);
      return;
    }
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        const data = await res.json();
        if (data.status === 'OK' && data.results.length > 0) {
          const result = data.results[0];
          const addressComponents = result.address_components;
          const getComponent = (type: string) =>
            addressComponents.find((c: any) => c.types.includes(type))?.long_name || '';
          setFormData((prev) => ({
            ...prev,
            address: result.formatted_address || '',
            city: getComponent('locality') || getComponent('administrative_area_level_2') || '',
            state: getComponent('administrative_area_level_1') || '',
            postalCode: getComponent('postal_code') || '',
          }));
        } else {
          setLocationError('Could not retrieve address from location.');
        }
      } catch (err) {
        setLocationError('Failed to fetch address from Google Maps.');
      } finally {
        setIsLocating(false);
      }
    }, (err) => {
      setLocationError('Failed to get your location. Please allow location access.');
      setIsLocating(false);
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Addresses</h1>
        <p className="text-gray-600">Manage your delivery addresses</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Saved Addresses ({addresses.length})
        </h2>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Addresses Yet</h3>
            <p className="text-gray-600 text-center mb-6">
              Add your first delivery address to get started
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <Card key={address.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getAddressIcon(address.type)}
                    <div>
                      <CardTitle className="text-lg">{address.name}</CardTitle>
                      <Badge className={getTypeColor(address.type)}>
                        {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  {address.isDefault && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-600">{address.address}</p>
                    <p className="text-sm text-gray-600">
                      {address.city}, {address.state} {address.postalCode}
                    </p>
                    <p className="text-sm text-gray-600">{address.phone}</p>
                  </div>
                  
                  <div className="flex gap-2 pt-4 border-t">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(address)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    {!address.isDefault && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleSetDefault(address.id)}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Set Default
                      </Button>
                    )}
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(address.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Address Form */}
      {showAddForm && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Address Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g., Home, Office"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="type">Address Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  >
                    <option value="home">Home</option>
                    <option value="work">Work</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Button type="button" variant="outline" onClick={handleUseMyLocation} disabled={isLocating}>
                  {isLocating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <MapPin className="w-4 h-4 mr-2" />}Use My Location
                </Button>
                {locationError && <span className="text-sm text-red-500">{locationError}</span>}
              </div>
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Enter your street address"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="Postal Code"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+2348012345678"
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit">
                  {editingAddress ? 'Update Address' : 'Add Address'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyAddresses; 