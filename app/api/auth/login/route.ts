import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { phone, name, role } = await request.json();

    // Validation
    if (!phone || !name || !role) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!["farmer", "buyer", "consumer", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // TODO: Connect to PostgreSQL and create/get user
    // For now, return mock JWT
    const mockUserId = Math.random().toString(36).substring(7);
    const mockToken = Buffer.from(
      JSON.stringify({ userId: mockUserId, phone, role })
    ).toString("base64");

    return NextResponse.json({
      success: true,
      userId: mockUserId,
      phone,
      role,
      token: mockToken,
      message: "Login successful"
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}
