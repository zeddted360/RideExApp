import { validateEnv } from "./appwrite";

// Utility function to send SMS using Smart SMS Solutions API
async function sendSMSToNumber(to: string, message: string) {
  const { smartSmsSenderId } = validateEnv();
  const token = "01kdOKcv0332xYSWjjRe6soZWV1BWuziZnY8vjNQAIWUip8TyH";

  const formData = new FormData();
  formData.append("token", token);
  formData.append("sender", smartSmsSenderId);
  formData.append("to", to);
  formData.append("message", message);
  formData.append("type", "0");
  formData.append("routing", "3"); // Routing for DND numbers in Nigeria

  const response = await fetch(
    "https://app.smartsmssolutions.com/io/api/client/v1/sms/",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.text(); // As per example, response is text

  // Parse response if it's JSON, or handle as text
  let parsedData;
  try {
    parsedData = JSON.parse(data);
  } catch {
    parsedData = { state: "success" }; // Assume success if not JSON
  }

  if (parsedData.state !== "success") {
    throw new Error(parsedData.Message || "Failed to send SMS");
  }

  return parsedData;
}

// Reusable function for sending order feedback SMS
async function sendOrderFeedback({
  customer,
  number,
  status,
  adminNumber,
  orderId,
  message,
}: {
  customer: string;
  number: string;
  status: string;
  adminNumber?: string;
  orderId: string;
  message?: string;
}) {
  try {
    // Custom message if not provided
    const customerMessage =
      message ||
      `Dear ${customer}, your order #${orderId} is now ${status
        .replace(/_/g, " ")
        .toLowerCase()}. Thank you for choosing us!`;

    // Send to customer
    await sendSMSToNumber(number, customerMessage);

    // Send to admin if adminNumber is provided
    if (adminNumber) {
      const adminMessage = `Admin Alert: Order #${orderId} for ${customer} (${number}) is now ${status
        .replace(/_/g, " ")
        .toLowerCase()}.`;
      await sendSMSToNumber(adminNumber, adminMessage);
    }

    console.log("SMS sent successfully");
  } catch (error) {
    console.error("Error sending SMS:", error);
    throw error;
  }
}

// Example usage:
// await sendOrderFeedback({
//   customer: 'John Doe',
//   number: '08012345678',
//   status: 'out_for_delivery',
//   adminNumber: '08098765432', // Optional
//   orderId: 'ORD12345',
//   message: 'Optional custom message' // Optional, overrides default
// });
