// app/api/sms/send/route.ts
import { ID, messaging } from '@/utils/serverAppwrite';
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PHONE_NUMBER = process.env.ADMIN_PHONE_NUMBER || null; 


export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, message, admin = false, adminMessage } = await req.json();

    if (!phoneNumber || !message) {
      return NextResponse.json({ success: false, error: 'Missing phoneNumber or message' }, { status: 400 });
    }

    // Validate E.164 format
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phoneNumber) || (admin && ADMIN_PHONE_NUMBER && !phoneRegex.test(ADMIN_PHONE_NUMBER))) {
      return NextResponse.json({ success: false, error: 'Invalid phone number format (use E.164, e.g., +234XXXXXXXXX)' }, { status: 400 });
    }

    // Send to user (create target if needed, but for one-off, use direct phone)
    const userMessage = await messaging.createSms(
      ID.unique(),
      message, // Body
      [phoneNumber] // Targets: array of phones (E.164)
    );

    const success = userMessage.$id ? true : false;
    let adminMessageId = null;

    // Optional admin SMS
    if (admin && ADMIN_PHONE_NUMBER && adminMessage) {
      if (adminMessage.length > 160) {
        return NextResponse.json({ success: false, error: 'Admin message too long (>160 chars)' }, { status: 400 });
      }
      const adminMsg = await messaging.createSms(
        ID.unique(),
        adminMessage,
        [ADMIN_PHONE_NUMBER]
      );
      adminMessageId = adminMsg.$id;
    }

    return NextResponse.json({
      success,
      messageId: userMessage.$id,
      adminMessageId,
      code: userMessage.status || 'OK'
    });
  } catch (error: any) {
    console.error('Appwrite SMS error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to send SMS' }, { status: 500 });
  }
}