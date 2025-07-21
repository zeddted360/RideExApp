import { getUserPhoneNumber } from "./phoneStorage";
import { getUserPhoneFromAuth } from "./userUtils";
import { RootState } from "@/state/store";

/**
 * Send SMS notification to user
 * This demonstrates how to use the stored phone number for future SMS functionality
 */
export const sendSMSNotification = async (
  message: string,
  state?: RootState
): Promise<boolean> => {
  try {
    // Try to get phone from auth state first, then fallback to localStorage
    let userPhone: string | null = null;

    if (state) {
      userPhone = getUserPhoneFromAuth(state);
    }

    if (!userPhone) {
      userPhone = getUserPhoneNumber();
    }

    if (!userPhone) {
      console.warn("No verified phone number found for SMS");
      return false;
    }

    // Call your SMS API endpoint
    const response = await fetch("/api/send-sms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber: userPhone,
        message: message,
      }),
    });

    const result = await response.json();
    return result.success;
  } catch (error) {
    console.error("Failed to send SMS:", error);
    return false;
  }
};

/**
 * Send order confirmation SMS
 */
export const sendOrderConfirmationSMS = async (
  orderId: string,
  estimatedDelivery: string,
  state?: RootState
): Promise<boolean> => {
  const message = `Your order #${orderId} has been confirmed! Estimated delivery: ${estimatedDelivery}. Thank you for choosing RideEx!`;
  return sendSMSNotification(message, state);
};

/**
 * Send delivery update SMS
 */
export const sendDeliveryUpdateSMS = async (
  orderId: string,
  status: string,
  state?: RootState
): Promise<boolean> => {
  const message = `Order #${orderId} update: ${status}. Track your order on RideEx app!`;
  return sendSMSNotification(message, state);
};

/**
 * Send promotional SMS (with user consent)
 */
export const sendPromotionalSMS = async (
  promotion: string,
  state?: RootState
): Promise<boolean> => {
  const message = `🎉 ${promotion} - Limited time offer! Order now on RideEx. Reply STOP to unsubscribe.`;
  return sendSMSNotification(message, state);
};

/**
 * Send order placed SMS to user and admin using the /api/send-sms endpoint
 */
export async function sendOrderPlacedSMS({
  userPhone,
  orderId,
  userName,
  origin,
}: {
  userPhone: string;
  orderId: string;
  userName: string;
  origin: string;
}) {
  const userSms = fetch("/api/send-sms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phoneNumber: userPhone,
      message: `Your order has been placed! View/manage: ${origin}/myorders/${orderId}`,
    }),
  });
  const adminSms = fetch("/api/send-sms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phoneNumber: userPhone, // Not used, but required by API
      admin: true,
      adminMessage: `New order from ${userName}. Order ID: ${orderId}. View: ${origin}/admin/orders/${orderId}`,
      message: "-", // Not used for admin
    }),
  });
  await Promise.all([userSms, adminSms]);
}

/**
 * Send order status update SMS to user
 */
export const sendOrderStatusUpdateSMS = async (
  orderId: string,
  status: string,
  userPhone: string,
  estimatedTime?: string
): Promise<boolean> => {
  let message = `Order #${orderId} status: ${status.replace(/_/g, ' ')}`;
  
  if (estimatedTime) {
    message += `. Estimated delivery: ${estimatedTime}`;
  }
  
  message += `. Track your order at: ${typeof window !== 'undefined' ? window.location.origin : ''}/myorders/${orderId}`;
  
  try {
    const response = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: userPhone,
        message: message,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send status update SMS:", error);
    return false;
  }
};

/**
 * Send order cancellation SMS to user
 */
export const sendOrderCancellationSMS = async (
  orderId: string,
  userPhone: string,
  reason?: string
): Promise<boolean> => {
  const message = `Order #${orderId} has been cancelled${reason ? `: ${reason}` : ''}. Refund will be processed if payment was made.`;
  
  try {
    const response = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: userPhone,
        message: message,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send cancellation SMS:", error);
    return false;
  }
};

/**
 * Send order cancellation notification to admin
 */
export const sendOrderCancellationAdminSMS = async (
  orderId: string,
  userName: string,
  userPhone: string,
  reason?: string
): Promise<boolean> => {
  const message = `Order #${orderId} cancelled by ${userName} (${userPhone})${reason ? `: ${reason}` : ''}.`;
  
  try {
    const response = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: userPhone, // Not used for admin
        admin: true,
        adminMessage: message,
        message: "-",
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send admin cancellation SMS:", error);
    return false;
  }
};

/**
 * Send delivery started SMS
 */
export const sendDeliveryStartedSMS = async (
  orderId: string,
  userPhone: string,
  estimatedDeliveryTime: string
): Promise<boolean> => {
  const message = `Order #${orderId} is out for delivery! Estimated arrival: ${estimatedDeliveryTime}. Track your order at: ${typeof window !== 'undefined' ? window.location.origin : ''}/myorders/${orderId}`;
  
  try {
    const response = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: userPhone,
        message: message,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send delivery started SMS:", error);
    return false;
  }
};

/**
 * Send order delivered SMS
 */
export const sendOrderDeliveredSMS = async (
  orderId: string,
  userPhone: string
): Promise<boolean> => {
  const message = `Order #${orderId} has been delivered! Enjoy your meal! 🍽️ Rate your experience at: ${typeof window !== 'undefined' ? window.location.origin : ''}/myorders/${orderId}`;
  
  try {
    const response = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: userPhone,
        message: message,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send delivery confirmation SMS:", error);
    return false;
  }
};

/**
 * Send payment confirmation SMS
 */
export const sendPaymentConfirmationSMS = async (
  orderId: string,
  userPhone: string,
  amount: number
): Promise<boolean> => {
  const message = `Payment confirmed for order #${orderId}! Amount: ₦${amount.toLocaleString()}. Thank you for your payment.`;
  
  try {
    const response = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: userPhone,
        message: message,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send payment confirmation SMS:", error);
    return false;
  }
};

/**
 * Send payment received notification to admin
 */
export const sendPaymentReceivedAdminSMS = async (
  orderId: string,
  userName: string,
  amount: number
): Promise<boolean> => {
  const message = `Payment received for order #${orderId} from ${userName}. Amount: ₦${amount.toLocaleString()}.`;
  
  try {
    const response = await fetch("/api/send-sms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber: "dummy", // Not used for admin
        admin: true,
        adminMessage: message,
        message: "-",
      }),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send admin payment notification SMS:", error);
    return false;
  }
};

/*
 * Example: How to use in a React component
 *
 * import { useSelector } from 'react-redux';
 * import { sendOrderConfirmationSMS } from '@/utils/smsService';
 * import { RootState } from '@/state/store';
 *
 * const OrderComponent = () => {
 *   const state = useSelector((state: RootState) => state);
 *
 *   const handleOrderConfirm = async () => {
 *     const success = await sendOrderConfirmationSMS('ORD123', '30-45 minutes', state);
 *     if (success) {
 *       console.log('SMS sent successfully!');
 *     }
 *   };
 *
 *   return <button onClick={handleOrderConfirm}>Confirm Order</button>;
 * };
 */
