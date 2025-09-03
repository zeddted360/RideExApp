import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Environment variables (ensure these are in .env.local)
const {
  SMTP_USER,
  SMTP_PASS,
} = process.env;

export async function POST(req: NextRequest) {
  if (!SMTP_USER || !SMTP_PASS) {
    return NextResponse.json({ error: "Missing SMTP configuration" }, { status: 500 });
  }

  const { fullName, email, phone, address, licenseNumber, motorcycleModel } = await req.json();

  // Basic validation (already handled client-side, but server-side check for security)
  if (!fullName || !email || !phone || !address || !licenseNumber || !motorcycleModel) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  // Set up Nodemailer transporter
  const transporter = nodemailer.createTransport({
   service:"gmail",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  try {
    // Email to Admin
    const adminMailOptions = {
      from: SMTP_USER,
      to: "admin@rideex.com", // Replace with admin email
      subject: "New Rider Application",
      text: `New rider application received:\n\nFull Name: ${fullName}\nEmail: ${email}\nPhone: ${phone}\nAddress: ${address}\nLicense Number: ${licenseNumber}\nMotorcycle Model: ${motorcycleModel}\n\nPlease review and follow up.`,
    };

    // Email to Rider
    const riderMailOptions = {
      from: SMTP_USER,
      to: email,
      subject: "RideEx Rider Application Received",
      text: `Dear ${fullName},\n\nThank you for applying to become a RideEx rider! We have received your application with the following details:\n\n- Email: ${email}\n- Phone: ${phone}\n- Address: ${address}\n- License Number: ${licenseNumber}\n- Motorcycle Model: ${motorcycleModel}\n\nOur team will review your application and contact you soon. Stay tuned!\n\nBest,\nRideEx Team`,
    };

    // Send emails
    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(riderMailOptions);

    return NextResponse.json({ message: "Application submitted and notifications sent" });
  } catch (error) {
    console.error("Email Error:", error);
    return NextResponse.json({ error: "Failed to send notifications. Please try again later." }, { status: 500 });
  }
}