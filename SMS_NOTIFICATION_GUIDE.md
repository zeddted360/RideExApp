# SMS Notification System Guide

## Overview
This guide outlines the complete SMS notification system implemented in your food delivery app using Twilio. The system sends notifications to both users and admins for various order events.

## Current SMS Infrastructure

### 1. SMS API Route (`/api/send-sms`)
- **Location**: `src/app/api/send-sms/route.ts`
- **Function**: Handles sending SMS via Twilio
- **Features**: 
  - Sends SMS to users
  - Sends SMS to admin (optional)
  - Error handling and logging

### 2. SMS Service (`src/utils/smsService.ts`)
- **Location**: `src/utils/smsService.ts`
- **Function**: Contains utility functions for different SMS notifications
- **Features**: Modular functions for different notification types

## SMS Notification Points

### ✅ **1. Order Placed** (User & Admin)
**Location**: `src/app/checkout/CheckoutClient.tsx`
**Trigger**: When user confirms order
**Notifications**:
- **User**: Order confirmation with order details
- **Admin**: New order notification with customer details

```typescript
// Example implementation
await Promise.all([
  sendNotification(order, "admin"),
  sendNotification(order, userData.$id),
  sendOrderPlacedSMS({
    userPhone: phoneNumber,
    orderId,
    userName: userData.name || userData.email || userData.$id,
    origin: window.location.origin,
  })
]);
```

### ✅ **2. Order Status Updates** (Admin → User)
**Location**: `src/app/admin/orders/page.tsx`
**Trigger**: When admin changes order status
**Notifications**:
- **Confirmed**: "Order #123 status: confirmed. Estimated delivery: 30-45 minutes"
- **Preparing**: "Order #123 status: preparing. Estimated delivery: 20-30 minutes"
- **Out for Delivery**: "Order #123 is out for delivery! Estimated arrival: 15-20 minutes"
- **Delivered**: "Order #123 has been delivered! Enjoy your meal! 🍽️"
- **Cancelled**: "Order #123 status: cancelled"

### ✅ **3. Order Cancellation** (User → Admin)
**Location**: 
- `src/components/MyOrders.tsx`
- `src/app/myorders/[orderId]/page.tsx`
- `src/app/order-confirmation/page.tsx`
**Trigger**: When user cancels order
**Notifications**:
- **User**: "Order #123 has been cancelled. Refund will be processed if payment was made."
- **Admin**: "Order #123 cancelled by user@example.com (+2348012345678)"

### ✅ **4. Payment Confirmation** (User & Admin)
**Location**: `src/context/paymentContext.tsx`
**Trigger**: When payment is successful
**Notifications**:
- **User**: "Payment confirmed for order #123! Amount: ₦5,000. Thank you for your payment."
- **Admin**: "Payment received for order #123 from user@example.com. Amount: ₦5,000."

### ✅ **5. Phone Verification** (User)
**Location**: `src/app/api/phone-verification/route.ts`
**Trigger**: During user registration
**Notification**: "Your FoodieHub verification code is: 123456. Valid for 10 minutes."

## SMS Functions Available

### User Notifications
```typescript
// Order status updates
sendOrderStatusUpdateSMS(orderId, status, userPhone, estimatedTime?)

// Order cancellation
sendOrderCancellationSMS(orderId, userPhone, reason?)

// Payment confirmation
sendPaymentConfirmationSMS(orderId, userPhone, amount)

// Delivery updates
sendDeliveryStartedSMS(orderId, userPhone, estimatedDeliveryTime)
sendOrderDeliveredSMS(orderId, userPhone)
```

### Admin Notifications
```typescript
// Order cancellation notification
sendOrderCancellationAdminSMS(orderId, userName, userPhone, reason?)

// Payment received notification
sendPaymentReceivedAdminSMS(orderId, userName, amount)
```

## Environment Variables Required

Add these to your `.env.local` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
ADMIN_PHONE_NUMBER=admin_phone_number_for_notifications
```

## Best Practices Implemented

### 1. **Error Handling**
- All SMS functions include try-catch blocks
- Graceful fallback when SMS fails
- User feedback via toast notifications

### 2. **Async Operations**
- SMS notifications are sent asynchronously
- Non-blocking operations for better UX
- Parallel sending for user and admin notifications

### 3. **Message Templates**
- Consistent message formatting
- Clear and actionable content
- Order tracking links included

### 4. **Phone Number Validation**
- Proper phone number formatting
- Nigerian phone number support (+234, 0, 234 formats)
- Verification before sending SMS

### 5. **Admin Notifications**
- Separate admin notification system
- Order details included in admin messages
- Actionable links for admin dashboard

## Additional Notification Points (Future Implementation)

### 6. **Promotional SMS** (Optional)
**Trigger**: Marketing campaigns
**Implementation**: `sendPromotionalSMS(promotion, state)`
**Note**: Requires user consent

### 7. **Delivery Updates** (Real-time)
**Trigger**: GPS tracking updates
**Implementation**: `sendDeliveryUpdateSMS(orderId, status, state)`

### 8. **Payment Reminders** (Scheduled)
**Trigger**: Unpaid orders after X hours
**Implementation**: Scheduled job to check unpaid orders

## Testing SMS Notifications

### Development Testing
1. Use Twilio's test credentials
2. Test with your own phone number
3. Monitor Twilio console for delivery status

### Production Considerations
1. **Rate Limiting**: Implement to prevent abuse
2. **Cost Monitoring**: Track SMS costs
3. **Delivery Reports**: Monitor delivery success rates
4. **User Consent**: Ensure users opt-in for promotional SMS

## Troubleshooting

### Common Issues
1. **SMS not sent**: Check Twilio credentials and phone number format
2. **Admin notifications not working**: Verify `ADMIN_PHONE_NUMBER` environment variable
3. **Phone number validation**: Ensure proper Nigerian phone number format

### Debug Steps
1. Check browser console for errors
2. Verify Twilio account status
3. Test with Twilio's test phone numbers
4. Monitor network requests to `/api/send-sms`

## Cost Optimization

### SMS Cost Management
1. **Message Length**: Keep messages concise
2. **Frequency**: Limit promotional SMS
3. **Targeting**: Send only relevant notifications
4. **User Preferences**: Allow users to opt-out

### Monitoring
- Track SMS costs in Twilio dashboard
- Monitor delivery success rates
- Set up alerts for high usage

## Security Considerations

1. **Phone Number Privacy**: Don't log sensitive phone numbers
2. **Rate Limiting**: Prevent SMS spam
3. **User Consent**: Respect user preferences
4. **Environment Variables**: Secure Twilio credentials

This SMS notification system provides comprehensive coverage for all major order events in your food delivery app, ensuring both users and admins stay informed throughout the order lifecycle. 