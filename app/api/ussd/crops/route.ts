import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Mock crops data - can be connected to database later
    const crops = [
      {
        id: "1",
        name: "Rice",
        season: "Kharif",
        harvestTime: "Sep-Oct",
        priceRange: "₹1800-₹2000"
      },
      {
        id: "2",
        name: "Wheat",
        season: "Rabi",
        harvestTime: "Mar-Apr",
        priceRange: "₹2000-₹2200"
      },
      {
        id: "3",
        name: "Tomato",
        season: "Year-round",
        harvestTime: "Ongoing",
        priceRange: "₹30-₹50"
      },
      {
        id: "4",
        name: "Potato",
        season: "Winter",
        harvestTime: "Feb-Mar",
        priceRange: "₹20-₹30"
      }
    ];

    return NextResponse.json({
      success: true,
      crops,
      count: crops.length
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch crops" }, { status: 500 });
  }
}
