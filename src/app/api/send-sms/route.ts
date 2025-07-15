import { NextRequest, NextResponse } from "next/server";
import twilio from "twilio";

// You should store these in environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER!;
const adminPhone = process.env.ADMIN_PHONE_NUMBER; // Optional: set in .env

const client = twilio(accountSid, authToken);

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, message, admin, adminMessage } = await req.json();
    console.log("the user phone number is :", phoneNumber);
    console.log("the admin phone number is :", adminPhone);
    
    if (!phoneNumber || !message) {
      return NextResponse.json({ success: false, error: "Missing phoneNumber or message" }, { status: 400 });
    }

    // Send to user
    await client.messages.create({
      body: message,
      from: twilioPhone,
      to: phoneNumber,
    });

    // Optionally send to admin
    if (admin && adminPhone && adminMessage) {
      await client.messages.create({
        body: adminMessage,
        from: twilioPhone,
        to: adminPhone,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Twilio SMS error:", error);
    return NextResponse.json({ success: false, error: error.message || "Failed to send SMS" }, { status: 500 });
  }
} 