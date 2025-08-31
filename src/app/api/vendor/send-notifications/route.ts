// import { NextResponse } from 'next/server';
// import nodemailer from 'nodemailer';

// export async function POST(request: Request) {
//   try {
//     const { vendorEmail, vendorName, businessName } = await request.json();

//     // Validate required fields
//     if (!vendorEmail || !vendorName || !businessName) {
//       return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
//     }

//     // Create Nodemailer transporter
//     const transporter = nodemailer.createTransport({
//       service: 'gmail',
//       auth: {
//         user: process.env.SMTP_USER,
//         pass: process.env.SMTP_PASS,
//       },
//     });

//     // Admin notification email
//     const adminMailOptions = {
//       from: process.env.SMTP_USER,
//       to: process.env.ADMIN_EMAIL,
//       subject: 'New Vendor Registration Pending Approval',
//       html: `
//         <h2>New Vendor Registration</h2>
//         <p>A new vendor has registered and is awaiting approval:</p>
//         <ul>
//           <li><strong>Name:</strong> ${vendorName}</li>
//           <li><strong>Email:</strong> ${vendorEmail}</li>
//           <li><strong>Business Name:</strong> ${businessName}</li>
//         </ul>
//         <p>Please review the registration in the admin dashboard.</p>
//       `,
//     };

//     // Vendor welcome email
//     const vendorMailOptions = {
//       from: process.env.GMAIL_USER,
//       to: vendorEmail,
//       subject: 'Welcome to RideEx!',
//       html: `
//         <h2>Welcome, ${vendorName}!</h2>
//         <p>Thank you for registering your business, <strong>${businessName}</strong>, with RideEx.</p>
//         <p>Your account is currently pending admin approval. We'll notify you once your account is activated.</p>
//         <p>If you have any questions, contact us at support@rideex.com.</p>
//         <p>Best regards,<br>The RideEx Team</p>
//       `,
//     };

//     // Send both emails
//     await Promise.all([
//       transporter.sendMail(adminMailOptions),
//       transporter.sendMail(vendorMailOptions),
//     ]);

//     return NextResponse.json({ message: 'Notifications sent successfully' }, { status: 200 });
//   } catch (error: any) {
//     console.error('Error sending notifications:', error);
//     return NextResponse.json({ message: 'Failed to send notifications' }, { status: 500 });
//   }
// }

import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: Request) {
  try {
    const { vendorEmail, vendorName, businessName, status } = await request.json();

    // Validate required fields
    if (!vendorEmail || !vendorName || !businessName) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Admin notification email (for new registration or status update)
    const adminMailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.ADMIN_EMAIL,
      subject: status
        ? `Vendor Status Updated: ${businessName}`
        : "New Vendor Registration Pending Approval",
      html: status
        ? `
          <h2>Vendor Status Update</h2>
          <p>The status of the following vendor has been updated:</p>
          <ul>
            <li><strong>Name:</strong> ${vendorName}</li>
            <li><strong>Email:</strong> ${vendorEmail}</li>
            <li><strong>Business Name:</strong> ${businessName}</li>
            <li><strong>Status:</strong> ${status.charAt(0).toUpperCase() + status.slice(1)}</li>
          </ul>
          <p>Please review the vendor details in the admin dashboard.</p>
        `
        : `
          <h2>New Vendor Registration</h2>
          <p>A new vendor has registered and is awaiting approval:</p>
          <ul>
            <li><strong>Name:</strong> ${vendorName}</li>
            <li><strong>Email:</strong> ${vendorEmail}</li>
            <li><strong>Business Name:</strong> ${businessName}</li>
          </ul>
          <p>Please review the registration in the admin dashboard.</p>
        `,
    };

    // Vendor notification email
    const vendorMailOptions = {
      from: process.env.GMAIL_USER,
      to: vendorEmail,
      subject: status
        ? `Your Vendor Application Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`
        : "Welcome to RideEx!",
      html: status
        ? `
          <h2>Application Status Update</h2>
          <p>Dear ${vendorName},</p>
          <p>Your vendor application for <strong>${businessName}</strong> has been <strong>${status}</strong>.</p>
          ${
            status === "approved"
              ? "<p>You can now log in to your vendor dashboard to start managing your business.</p>"
              : "<p>If you have any questions or believe this was a mistake, please contact us at support@rideex.com.</p>"
          }
          <p>Best regards,<br>The RideEx Team</p>
        `
        : `
          <h2>Welcome, ${vendorName}!</h2>
          <p>Thank you for registering your business, <strong>${businessName}</strong>, with RideEx.</p>
          <p>Your account is currently pending admin approval. We'll notify you once your account is activated.</p>
          <p>If you have any questions, contact us at support@rideex.com.</p>
          <p>Best regards,<br>The RideEx Team</p>
        `,
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(vendorMailOptions),
    ]);

    return NextResponse.json({ message: "Notifications sent successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error sending notifications:", error);
    return NextResponse.json({ message: "Failed to send notifications" }, { status: 500 });
  }
}