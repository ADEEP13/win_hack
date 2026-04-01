import { NextRequest, NextResponse } from 'next/server';
import { sessionOps, userOps } from '@/lib/auth-db';

export async function GET(request: NextRequest) {
  try {
    // Try to get session token from cookie first, then from header
    let sessionToken = request.cookies.get('sessionToken')?.value;
    
    if (!sessionToken) {
      // Fallback: check for token in X-Session-Token header
      sessionToken = request.headers.get('X-Session-Token') || undefined;
    }

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'No session found' },
        { status: 200 }
      );
    }

    const session = sessionOps.findByToken(sessionToken);
    if (!session) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Invalid session' },
        { status: 200 }
      );
    }

    // Check if session expired
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      sessionOps.delete(sessionToken);
      return NextResponse.json(
        { success: false, authenticated: false, error: 'Session expired' },
        { status: 200 }
      );
    }

    // Get user details
    const user = userOps.findById(session.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, authenticated: false, error: 'User not found' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        userType: user.userType,
      },
      session: {
        token: sessionToken,
        expiresAt: session.expiresAt,
      },
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { success: false, authenticated: false, error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
