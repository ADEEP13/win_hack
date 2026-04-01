import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-db';
import { getUserProfile, updateUserProfile } from '@/lib/profile-db';

export async function GET(request: NextRequest) {
  try {
    // Get user from session cookie or header
    let sessionToken = request.cookies.get('sessionToken')?.value;
    
    if (!sessionToken) {
      // Fallback: check for token in X-Session-Token header
      sessionToken = request.headers.get('X-Session-Token') || undefined;
    }

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const session = await getSession(sessionToken);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    // Fetch user profile
    const profile = await getUserProfile(session.phone);
    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get user from session cookie or header
    let sessionToken = request.cookies.get('sessionToken')?.value;
    
    if (!sessionToken) {
      // Fallback: check for token in X-Session-Token header
      sessionToken = request.headers.get('X-Session-Token') || undefined;
    }

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const session = await getSession(sessionToken);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Invalid session' },
        { status: 401 }
      );
    }

    const { name, email, bankAccount, address, city, state, profileImage } = await request.json();

    // Update user profile
    const updatedProfile = await updateUserProfile(session.phone, {
      name: name || undefined,
      email: email || undefined,
      bankAccount: bankAccount || undefined,
      address: address || undefined,
      city: city || undefined,
      state: state || undefined,
      profileImage: profileImage || undefined,
    });

    if (!updatedProfile) {
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
