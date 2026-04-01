import { NextRequest, NextResponse } from "next/server";

// Mock database - in production, use PostgreSQL
const cropsDatabase: any[] = [];
const offersDatabase: any[] = [];

// POST - Farmer lists a new crop
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, bankAccount, cropName, quantity, quality, pricePerKg } = body;

    if (!name || !phone || !cropName || !quantity || !pricePerKg) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newCrop = {
      id: `crop_${Date.now()}`,
      farmerName: name,
      farmerPhone: phone,
      bankAccount,
      cropName,
      quantity: parseInt(quantity),
      quality,
      pricePerKg: parseFloat(pricePerKg),
      listedAt: new Date().toISOString(),
      status: "active",
      blockchainHash: "0x" + Math.random().toString(16).substr(2, 40),
    };

    cropsDatabase.push(newCrop);

    return NextResponse.json({
      success: true,
      crop: newCrop,
      message: "Crop listed successfully on blockchain",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to list crop" },
      { status: 500 }
    );
  }
}

// GET - Fetch all active crops for buyers
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const farmerPhone = searchParams.get("farmerPhone");

    let crops = cropsDatabase.filter((c) => c.status === "active");

    // If farmerPhone is provided, return only that farmer's crops
    if (farmerPhone) {
      crops = crops.filter((c) => c.farmerPhone === farmerPhone);
    }

    return NextResponse.json({
      success: true,
      crops,
      count: crops.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch crops" },
      { status: 500 }
    );
  }
}
