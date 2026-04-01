import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, isValidIndianPhone, getOTPExpiryTime, sendOTPSMS } from '@/lib/auth-utils';
import { otpOps } from '@/lib/auth-db';

export async function POST(request: NextRequest) {
  try {
    const { phone, userType } = await request.json();

    // Validate phone format
    if (!phone || !isValidIndianPhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number. Must be a 10-digit Indian number.' },
        { status: 400 }
      );
    }

    // Validate user type
    if (!userType || !['farmer', 'buyer', 'consumer', 'admin'].includes(userType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Check if previous OTP still valid and limit requests
    const existingOTP = otpOps.findByPhone(phone);
    if (existingOTP) {
      const timeSinceCreation = Date.now() - new Date(existingOTP.createdAt).getTime();
      if (timeSinceCreation < 30 * 1000) {
        return NextResponse.json(
          { success: false, error: 'Please wait 30 seconds before requesting another OTP' },
          { status: 429 }
        );
      }
    }

    // Generate OTP
    const otp = generateOTP();
    const expiryTime = getOTPExpiryTime();

    // Store OTP
    otpOps.create(phone, otp, expiryTime);

    // Send OTP via SMS (mock for now)
    const smsSent = await sendOTPSMS(phone, otp);

    if (!smsSent) {
      return NextResponse.json(
        { success: false, error: 'Failed to send OTP. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent to ${phone}. Valid for 10 minutes.`,
      // For DEMO ONLY: remove in production
      demo_otp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP' },
      { status: 500 }
    );
  }
}
