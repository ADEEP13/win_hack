import { NextRequest, NextResponse } from 'next/server';
import { isValidOTP, getSessionExpiryTime } from '@/lib/auth-utils';
import { userOps, otpOps, sessionOps } from '@/lib/auth-db';

export async function POST(request: NextRequest) {
  try {
    const { phone, otp, userType, name, email, bankAccount } = await request.json();

    // Validate inputs
    if (!phone || !otp || !isValidOTP(otp)) {
      return NextResponse.json(
        { success: false, error: 'Invalid OTP format' },
        { status: 400 }
      );
    }

    if (!userType || !['farmer', 'buyer', 'consumer', 'admin'].includes(userType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user type' },
        { status: 400 }
      );
    }

    // Check if OTP exists
    const storedOTP = otpOps.findByPhone(phone);
    if (!storedOTP) {
      return NextResponse.json(
        { success: false, error: 'No OTP found. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Check if OTP expired
    if (new Date(storedOTP.expiresAt).getTime() < Date.now()) {
      otpOps.delete(storedOTP.id);
      return NextResponse.json(
        { success: false, error: 'OTP has expired. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Check OTP attempts
    if (storedOTP.attempts >= 3) {
      otpOps.delete(storedOTP.id);
      return NextResponse.json(
        { success: false, error: 'Too many incorrect attempts. Please request a new OTP.' },
        { status: 400 }
      );
    }

    // Verify OTP
    if (storedOTP.code !== otp) {
      otpOps.increment(storedOTP.id);
      const updatedOTP = otpOps.findByPhone(phone);
      return NextResponse.json(
        { 
          success: false, 
          error: `Incorrect OTP. ${3 - (updatedOTP?.attempts || 0)} attempts remaining.` 
        },
        { status: 400 }
      );
    }

    // OTP verified! Create or update user
    let user = userOps.findByPhone(phone);
    if (!user) {
      user = userOps.create({
        phone,
        name: name || 'User',
        email: email || null,
        bankAccount: bankAccount || null,
        userType,
        verified: true,
      });
    } else {
      user = userOps.update(user.id, {
        name: name || user.name,
        email: email || user.email,
        bankAccount: bankAccount || user.bankAccount,
        userType,
        verified: true,
      });
    }

    // Create session
    const expiryTime = getSessionExpiryTime();
    const session = sessionOps.create(user.id, phone, userType, expiryTime);

    // Clear OTP
    otpOps.delete(storedOTP.id);

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        userType: user.userType,
      },
      sessionToken: session.sessionToken,
    });

    response.cookies.set('sessionToken', session.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
