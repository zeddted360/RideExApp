// import { NextRequest, NextResponse } from "next/server";
// import twilio from "twilio";

// // You should store these in environment variables
// const accountSid = process.env.TWILIO_ACCOUNT_SID!;
// const authToken = process.env.TWILIO_AUTH_TOKEN!;
// const twilioPhone = process.env.TWILIO_PHONE_NUMBER!;
// const adminPhone = process.env.ADMIN_PHONE_NUMBER; // Optional: set in .env

// const client = twilio(accountSid, authToken);

// // using appwrite and twilo


// export async function POST(req: NextRequest) {
//   try {
//     const { phoneNumber, message, admin, adminMessage } = await req.json();
    

//     if (!phoneNumber || !message) {
//       return NextResponse.json({ success: false, error: "Missing phoneNumber or message" }, { status: 400 });
//     }
//     // Send to user
//     await client.messages.create({
//       body: message,
//       from: twilioPhone,
//       to: phoneNumber,
//     });

//     // Optionally send to admin
//     if (admin && adminPhone && adminMessage) {
//       await client.messages.create({
//         body: adminMessage,
//         from: twilioPhone,
//         to: adminPhone,
//       });
//     }

//     return NextResponse.json({ success: true });
//   } catch (error: any) {
//     console.error("Twilio SMS error:", error);
//     return NextResponse.json({ success: false, error: error.message || "Failed to send SMS" }, { status: 500 });
//   }
// } 


import { NextRequest, NextResponse } from "next/server";

// VTpass API credentials (store in environment variables for security)
const VTPASS_X_TOKEN = process.env.VTPASS_X_TOKEN || "VTP_PK_1ca6c7a1162d0844a7f6812a65e6cec0231a19949946489bdd788cdd3b2fc674";
const VTPASS_X_SECRET = process.env.VTPASS_X_SECRET || "VTP_SK_4dfed95564920936cc4dbb2f44c88d5e6812fe6041d7002fd0bc089ab49c6995";
const VTPASS_SENDER_ID = process.env.VTPASS_SENDER_ID || "Ridex"; // Registered sender ID
const ADMIN_PHONE_NUMBER = process.env.ADMIN_PHONE_NUMBER; // Admin phone number from .env
const VTPASS_BASE_URL = process.env.VTPASS_ENV === "sandbox" 
  ? "https://sandbox.vtpass.com/api" 
  : "https://messaging.vtpass.com"; 

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, message, admin, adminMessage } = await req.json();

    // Validate required fields
    if (!phoneNumber || !message) {
      return NextResponse.json(
        { success: false, error: "Missing phoneNumber or message" },
        { status: 400 }
      );
    }

    // Validate phone number format (E.164: e.g., +2347061933309)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber) || (admin && ADMIN_PHONE_NUMBER && !phoneRegex.test(ADMIN_PHONE_NUMBER))) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number format. Use E.164 (e.g., +2347061933309)" },
        { status: 400 }
      );
    }

    // Validate message length (160 characters for standard SMS)
    if (message.length > 160 || (admin && adminMessage && adminMessage.length > 160)) {
      return NextResponse.json(
        { success: false, error: "Message exceeds 160-character limit" },
        { status: 400 }
      );
    }

    const headers = {
      "X-Token": VTPASS_X_TOKEN,
      "X-Secret": VTPASS_X_SECRET,
    };

    // Prepare VTpass Normal SMS endpoint
    const vtpassUrl = `${VTPASS_BASE_URL}/sms/sendsms`;

    // Send SMS to user
    const userSmsParams = new URLSearchParams({
      sender: VTPASS_SENDER_ID,
      recipient: phoneNumber,
      message: message,
      responsetype: "json",
    });

    const userSmsResponse = await fetch(`${vtpassUrl}?${userSmsParams}`, {
      method: "GET",
      headers: headers,
    });

    const userSmsResult = await userSmsResponse.json();

    if (userSmsResult.responseCode !== "TG00") {
      console.error("VTpass user SMS error:", {
        response: userSmsResult,
        messageId: userSmsResult.messages?.[0]?.messageId,
      });
      return NextResponse.json(
        { success: false, error: userSmsResult.description || "Failed to send user SMS" },
        { status: 500 }
      );
    }

    // Log messageId for delivery tracking
    const userMessageId = userSmsResult.messages?.[0]?.messageId;
    console.log(`User SMS sent. Message ID: ${userMessageId}`);

    // Optionally send to admin
    let adminSuccess = true;
    if (admin && ADMIN_PHONE_NUMBER && adminMessage) {
      const adminSmsParams = new URLSearchParams({
        sender: VTPASS_SENDER_ID,
        recipient: ADMIN_PHONE_NUMBER,
        message: adminMessage,
        responsetype: "json",
      });

      const adminSmsResponse = await fetch(`${vtpassUrl}?${adminSmsParams}`, {
        method: "GET",
        headers: headers,
      });

      const adminSmsResult = await adminSmsResponse.json();

      if (adminSmsResult.responseCode !== "TG00") {
        console.error("VTpass admin SMS error:", {
          response: adminSmsResult,
          messageId: adminSmsResult.messages?.[0]?.messageId,
        });
        adminSuccess = false;
      } else {
        const adminMessageId = adminSmsResult.messages?.[0]?.messageId;
        console.log(`Admin SMS sent. Message ID: ${adminMessageId}`);
      }
    }

    return NextResponse.json({
      success: admin ? userSmsResult.responseCode === "TG00" && adminSuccess : userSmsResult.responseCode === "TG00",
    });
  } catch (error: any) {
    console.error("VTpass SMS error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send SMS" },
      { status: 500 }
    );
  }
}