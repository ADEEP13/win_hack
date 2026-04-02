import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { phone, role } = await request.json();

    // Validation
    if (!phone || !role) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: phone, role" },
        { status: 400 }
      );
    }

    if (!["farmer", "buyer", "consumer", "admin"].includes(role)) {
      return NextResponse.json(
        { success: false, error: "Invalid role" },
        { status: 400 }
      );
    }

    if (phone.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Invalid phone number" },
        { status: 400 }
      );
    }

    // Check if user exists in database
    const result = await query(
      "SELECT id, phone, name, role, trust_score FROM users WHERE phone = $1 AND role = $2",
      [phone, role]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: "User not found. Please sign up first before logging in.",
          requiresSignup: true
        },
        { status: 404 }
      );
    }

    const user = result.rows[0];

    // Generate token
    const token = Buffer.from(
      JSON.stringify({ 
        userId: user.id, 
        phone: user.phone, 
        name: user.name,
        role: user.role,
        timestamp: Date.now()
      })
    ).toString("base64");

    return NextResponse.json({
      success: true,
      userId: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      trustScore: user.trust_score,
      token,
      message: "✅ Login successful"
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed. Please try again." },
      { status: 500 }
    );
  }
}
