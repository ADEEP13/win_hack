import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { phone, name, email, role, bankAccount, ifsCode, upiId, location } = await request.json();

    // Validation
    if (!phone || !name || !role) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: phone, name, role' },
        { status: 400 }
      );
    }

    if (!['farmer', 'buyer', 'consumer', 'admin'].includes(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid role' },
        { status: 400 }
      );
    }

    if (phone.length !== 10) {
      return NextResponse.json(
        { success: false, error: 'Phone number must be 10 digits' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE phone = $1',
      [phone]
    );

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User with this phone number already exists' },
        { status: 409 }
      );
    }

    // Insert new user into database
    const result = await query(
      `INSERT INTO users (phone, name, email, role, bank_account, ifsc_code, upi_id, location)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, phone, name, role, created_at`,
      [
        phone,
        name,
        email || null,
        role,
        bankAccount || null,
        ifsCode || null,
        upiId || null,
        location || null,
      ]
    );

    const user = result.rows[0];

    return NextResponse.json(
      {
        success: true,
        message: 'Sign-up successful! You can now login.',
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          role: user.role,
          createdAt: user.created_at,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Sign-up error:', error);

    // Check for duplicate phone constraint
    if (error.code === '23505') {
      return NextResponse.json(
        { success: false, error: 'User with this phone number already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Sign-up failed. Please try again.' },
      { status: 500 }
    );
  }
}
