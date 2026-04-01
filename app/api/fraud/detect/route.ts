import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { cropId, offerPrice, mandiPrice } = await request.json();
    
    // Simple fraud detection: offer must be >= 85% of mandi price
    const minAllowed = (mandiPrice * 85) / 100;
    const isFraud = offerPrice < minAllowed;
    const fraudScore = isFraud ? 95 : 10;
    
    return NextResponse.json({
      success: true,
      isFraud,
      fraudScore,
      minAllowedPrice: minAllowed,
      recommendation: isFraud ? "block" : "accept"
    });
  } catch (error) {
    return NextResponse.json({ error: "Fraud detection failed" }, { status: 500 });
  }
}
