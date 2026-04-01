import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    // Mock offers data - can be connected to database later
    const offers = [
      {
        id: "1",
        cropName: "Rice",
        farmer: "Farmer A",
        pricePerKg: 1820,
        quantity: 500,
        status: "active"
      },
      {
        id: "2",
        cropName: "Wheat",
        farmer: "Farmer B",
        pricePerKg: 2050,
        quantity: 300,
        status: "active"
      },
      {
        id: "3",
        cropName: "Tomato",
        farmer: "Farmer C",
        pricePerKg: 35,
        quantity: 1000,
        status: "active"
      },
      {
        id: "4",
        cropName: "Potato",
        farmer: "Farmer D",
        pricePerKg: 25,
        quantity: 800,
        status: "active"
      }
    ];

    return NextResponse.json({
      success: true,
      offers,
      count: offers.length
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch offers" }, { status: 500 });
  }
}
