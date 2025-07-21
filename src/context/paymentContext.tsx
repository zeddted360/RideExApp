import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/state/store';
import { updateBookedOrderAsync } from '@/state/bookedOrdersSlice';
import toast from 'react-hot-toast';
import { validateEnv } from '@/utils/appwrite';
import { sendPaymentConfirmationSMS, sendPaymentReceivedAdminSMS } from '@/utils/smsService';

interface PaystackParams {
  email: string;
  amount: number;
  reference: string;
  orderId: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

interface PaymentContextType {
  payWithPaystack: (params: PaystackParams) => void;
  paying: boolean;
  paymentError: string | null;
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [paying, setPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Utility to load Paystack script and trigger payment
  function payWithPaystack({ email, amount, reference, orderId, onSuccess, onClose }: PaystackParams) {
    setPaymentError(null);
    if (typeof window === 'undefined') return;
    // Load script if not already loaded
    if (!document.getElementById('paystack-script')) {
      const script = document.createElement('script');
      script.id = 'paystack-script';
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }
    // Async handler for payment success
    const handlePaymentSuccess = async () => {
      setPaying(true);
      try {
        // Update order as paid
        await dispatch(updateBookedOrderAsync({
          orderId,
          orderData: { paid: true },
        })).unwrap();
        
        // Get order details for SMS
        const { databaseId, bookedOrdersCollectionId } = validateEnv();
        const orderResponse = await fetch(`/api/orders/${orderId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }).catch(() => null);
        
        let orderDetails = null;
        if (orderResponse?.ok) {
          orderDetails = await orderResponse.json();
        }
        
        // Send SMS notifications
        if (orderDetails) {
          const userSmsPromise = sendPaymentConfirmationSMS(
            orderDetails.orderId || reference,
            orderDetails.phone || email,
            amount
          );
          
          const adminSmsPromise = sendPaymentReceivedAdminSMS(
            orderDetails.orderId || reference,
            orderDetails.customerId || email,
            amount
          );
          
          // Send both SMS notifications
          const [userSmsSent, adminSmsSent] = await Promise.all([
            userSmsPromise,
            adminSmsPromise
          ]);
          
          if (userSmsSent && adminSmsSent) {
            toast.success('Payment successful! SMS notifications sent.');
          } else if (userSmsSent) {
            toast.success('Payment successful!');
            toast.error('Failed to send admin notification.');
          } else {
            toast.success('Payment successful!');
            toast.error('Failed to send SMS notifications.');
          }
        } else {
          toast.success('Payment successful!');
        }
        
        if (onSuccess) onSuccess();
      } catch (err) {
        setPaymentError('Failed to update order as paid');
        toast.error('Failed to update order as paid');
      } finally {
        setPaying(false);
      }
    };
    // Wait for script to load
    const runPaystack = () => {
      // @ts-ignore
      const handler = window.PaystackPop && window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email,
        amount: amount * 100, // Paystack expects kobo
        ref: reference,
        callback: function () {
          handlePaymentSuccess(); // Synchronous wrapper
        },
        onClose: function () {
          setPaying(false);
          if (onClose) onClose();
          toast('Payment cancelled');
        },
      });
      if (handler) handler.openIframe();
    };
    setPaying(true);
    if (window.PaystackPop) {
      runPaystack();
    } else {
      setTimeout(runPaystack, 800); // Wait for script to load
    }
  }

  return (
    <PaymentContext.Provider value={{ payWithPaystack, paying, paymentError }}>
      {children}
    </PaymentContext.Provider>
  );
};

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) throw new Error('usePayment must be used within a PaymentProvider');
  return context;
}; 