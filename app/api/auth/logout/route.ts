import { NextRequest, NextResponse } from 'next/server';
import { sessionOps } from '@/lib/auth-db';

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('sessionToken')?.value;

    if (sessionToken) {
      sessionOps.delete(sessionToken);
    }

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully',
    });

    // Clear session cookie
    response.cookies.delete('sessionToken');

    return response;
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to logout' },
      { status: 500 }
    );
  }
}
