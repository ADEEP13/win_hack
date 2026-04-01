import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Mock market rates data - can be connected to blockchain/database later
    const marketRates = [
      {
        cropName: "Rice",
        pricePerKg: 1820,
        change: "+2.5%",
        trend: "↑"
      },
      {
        cropName: "Wheat",
        pricePerKg: 2050,
        change: "+1.2%",
        trend: "↑"
      },
      {
        cropName: "Tomato",
        pricePerKg: 35,
        change: "-1.5%",
        trend: "↓"
      },
      {
        cropName: "Potato",
        pricePerKg: 25,
        change: "+0.8%",
        trend: "↑"
      },
      {
        cropName: "Cotton",
        pricePerKg: 5850,
        change: "+3.1%",
        trend: "↑"
      },
      {
        cropName: "Onion",
        pricePerKg: 28,
        change: "-0.5%",
        trend: "↓"
      }
    ];

    return NextResponse.json({
      success: true,
      rates: marketRates,
      updatedAt: new Date().toISOString(),
      count: marketRates.length
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch market rates" }, { status: 500 });
  }
}
