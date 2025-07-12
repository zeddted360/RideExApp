"use client";
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Clock, CheckCircle, XCircle, Truck, MapPin, Loader2 } from 'lucide-react';
import { AppDispatch, RootState } from '@/state/store';
import { fetchOrdersByUserIdAsync, deleteOrderAsync } from '@/state/orderSlice';
import { useAuth } from '@/context/authContext';
import toast from 'react-hot-toast';
import { ICartItemFetched } from '../../types/types';

const MyOrders = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useAuth();
  const { orders, loading, error } = useSelector((state: RootState) => state.orders);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch orders when component mounts
  useEffect(() => {
    if (isAuthenticated && user?.userId) {
      dispatch(fetchOrdersByUserIdAsync(user.userId));
    }
  }, [dispatch, isAuthenticated, user?.userId]);

  // Filter orders based on status
  const getFilteredOrders = (status: string) => {
    if (!orders) return [];
    
    if (status === 'all') return orders;
    return orders.filter(order => order.status === status);
  };

  const getStatusIcon = (status: ICartItemFetched['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-orange-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ICartItemFetched['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStatus = (status: ICartItemFetched['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await dispatch(deleteOrderAsync(orderId)).unwrap();
      toast.success('Order deleted successfully');
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  const handleReorder = (order: ICartItemFetched) => {
    // TODO: Implement reorder functionality
    toast.success('Reorder functionality coming soon!');
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
            <p className="text-gray-600 text-center mb-6">
              Please log in to view your orders
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <span className="ml-2 text-gray-600">Loading your orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <XCircle className="w-16 h-16 text-red-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Orders</h3>
            <p className="text-gray-600 text-center mb-6">{error}</p>
            <Button onClick={() => dispatch(fetchOrdersByUserIdAsync(user!.userId))}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allOrders = orders || [];
  const pendingOrders = getFilteredOrders('pending');
  const processingOrders = getFilteredOrders('processing');
  const completedOrders = getFilteredOrders('success');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Track your food delivery orders</p>
      </div>

      {allOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="w-16 h-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders Yet</h3>
            <p className="text-gray-600 text-center mb-6">
              You haven't placed any orders yet. Start exploring our delicious menu!
            </p>
            <Button onClick={() => window.history.back()}>
              Browse Menu
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">
              All ({allOrders.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="processing">
              Processing ({processingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="success">
              Completed ({completedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <OrdersList orders={allOrders} onDelete={handleDeleteOrder} onReorder={handleReorder} />
          </TabsContent>

          <TabsContent value="pending" className="mt-6">
            <OrdersList orders={pendingOrders} onDelete={handleDeleteOrder} onReorder={handleReorder} />
          </TabsContent>

          <TabsContent value="processing" className="mt-6">
            <OrdersList orders={processingOrders} onDelete={handleDeleteOrder} onReorder={handleReorder} />
          </TabsContent>

          <TabsContent value="success" className="mt-6">
            <OrdersList orders={completedOrders} onDelete={handleDeleteOrder} onReorder={handleReorder} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

// Separate component for the orders list
interface OrdersListProps {
  orders: ICartItemFetched[];
  onDelete: (orderId: string) => void;
  onReorder: (order: ICartItemFetched) => void;
}

const OrdersList = ({ orders, onDelete, onReorder }: OrdersListProps) => {
  const getStatusIcon = (status: ICartItemFetched['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'processing':
        return <Package className="w-4 h-4 text-orange-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: ICartItemFetched['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-orange-100 text-orange-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatStatus = (status: ICartItemFetched['status']) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="w-16 h-16 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Orders</h3>
          <p className="text-gray-600 text-center">
            No orders found in this category
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.$id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(order.status)}
                <div>
                  <CardTitle className="text-lg">Order #{order.$id.slice(-8)}</CardTitle>
                  <p className="text-sm text-gray-600">{order.name}</p>
                </div>
              </div>
              <Badge className={getStatusColor(order.status)}>
                {formatStatus(order.status)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Order Details</h4>
                <div className="space-y-1">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Item:</span> {order.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Quantity:</span> {order.quantity}
                  </div>
                  {order.specialInstructions && (
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">Special Instructions:</span> {order.specialInstructions}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Amount</p>
                  <p className="text-lg font-semibold text-gray-900">
                    ₦{order.totalPrice.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Order Date</p>
                  <p className="text-sm text-gray-900">
                    {formatDate(order.$createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Category</p>
                  <p className="text-sm text-gray-900 capitalize">
                    {order.category}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                {order.status === 'success' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onReorder(order)}
                  >
                    Reorder
                  </Button>
                )}
                {order.status === 'pending' && (
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => onDelete(order.$id)}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MyOrders; 