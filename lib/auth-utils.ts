// Auth utility functions for OTP and session management

// Generate a random 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Generate session token
export function generateSessionToken(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Validate Indian phone number format
export function isValidIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

// Validate OTP format
export function isValidOTP(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

// Mock SMS sender (for demo - in production, use Twilio/AWS SNS)
export async function sendOTPSMS(phone: string, otp: string): Promise<boolean> {
  try {
    console.log(`📱 [DEMO] OTP for ${phone}: ${otp}`);
    
    // In production, integrate with SMS provider:
    // const twilio = require('twilio')(accountSid, authToken);
    // await twilio.messages.create({
    //   body: `Your JanDhan Plus OTP is: ${otp}. Valid for 10 minutes.`,
    //   from: '+1234567890',
    //   to: `+91${phone}`
    // });
    
    return true;
  } catch (error) {
    console.error('Failed to send OTP:', error);
    return false;
  }
}

// Calculate OTP expiry (10 minutes from now)
export function getOTPExpiryTime(): Date {
  const now = new Date();
  return new Date(now.getTime() + 10 * 60 * 1000); // 10 minutes
}

// Calculate session expiry (30 days from now)
export function getSessionExpiryTime(): Date {
  const now = new Date();
  return new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days
}

// Validate user type
export function isValidUserType(type: string): type is 'farmer' | 'buyer' | 'consumer' | 'admin' {
  return ['farmer', 'buyer', 'consumer', 'admin'].includes(type);
}
