# Phone Verification Setup Guide

## Overview
This implementation uses Twilio SMS for phone number verification during user registration.

## Prerequisites

1. **Twilio Account**: Sign up at [twilio.com](https://www.twilio.com)
2. **Twilio Phone Number**: Purchase a phone number for sending SMS
3. **Environment Variables**: Add the following to your `.env.local` file

## Environment Variables

Add these to your `.env.local` file:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
```

## How to Get Twilio Credentials

1. **Account SID & Auth Token**:
   - Log into your Twilio Console
   - Go to Dashboard → Account Info
   - Copy "Account SID" and "Auth Token"

2. **Phone Number**:
   - Go to Phone Numbers → Manage → Buy a number
   - Purchase a number that supports SMS
   - Copy the phone number (format: +1234567890)

## How It Works

1. **User enters phone number** → System validates format
2. **Send verification code** → Twilio sends SMS with 6-digit code
3. **User enters code** → System verifies the code
4. **Success** → User proceeds to account creation

## Features

- ✅ **Format Validation**: Accepts +234, 0, and 234 formats
- ✅ **SMS Delivery**: Real SMS sent via Twilio
- ✅ **Code Expiration**: Codes expire after 10 minutes
- ✅ **Error Handling**: Comprehensive error messages
- ✅ **Security**: Codes are stored temporarily and deleted after use

## Testing

For development/testing, you can use Twilio's test credentials or purchase a trial account.

## Production Considerations

1. **Database Storage**: Replace in-memory storage with Redis or database
2. **Rate Limiting**: Implement rate limiting for SMS sending
3. **Cost Optimization**: Monitor SMS costs and implement limits
4. **Error Monitoring**: Add proper logging and monitoring

## Alternative Options

If Twilio is not suitable, consider:

1. **Firebase Phone Auth**: Google's phone verification service
2. **AWS SNS**: Amazon's SMS service
3. **Vonage**: Alternative SMS provider
4. **Local SMS Gateway**: For local deployments

## Troubleshooting

- **SMS not received**: Check Twilio logs and phone number format
- **Invalid code errors**: Verify code storage and expiration logic
- **API errors**: Check environment variables and Twilio credentials 