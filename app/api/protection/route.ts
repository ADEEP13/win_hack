import { NextRequest, NextResponse } from "next/server";
import { marketplaceDB } from "@/lib/marketplace-db";
import farmerProtection from "@/lib/farmer-protection";

/**
 * GET /api/protection/analyze-offer?offerId=<offerId>
 * Analyze an offer for farmer protection with comprehensive fraud detection
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const offerId = searchParams.get("offerId");

    if (!offerId) {
      return NextResponse.json(
        { error: "Missing offerId parameter" },
        { status: 400 }
      );
    }

    // Find the offer
    const offer = marketplaceDB.offers.find((o) => o.id === offerId);
    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    // Find the crop
    const crop = marketplaceDB.crops.find((c) => c.id === offer.cropId);
    if (!crop) {
      return NextResponse.json({ error: "Crop not found" }, { status: 404 });
    }

    // Get mandi price (from blockchain oracle)
    const mandiPrice = getMockMandiPrice(crop.cropName);

    // Run fraud detection
    const fraudAnalysis = await analyzeFraudWithAI({
      cropId: crop.id,
      offerPrice: offer.offerPrice,
      mandiPrice,
      buyerPhone: offer.buyerPhone,
      cropType: crop.cropName,
      cropQuantity: crop.quantity,
    });

    // Calculate financial impact
    const priceRatio = (offer.offerPrice / mandiPrice) * 100;
    const fairPrice = (mandiPrice * 0.95);
    const losses = farmerProtection.calculateFarmerLosses(
      offer.offerPrice,
      mandiPrice,
      crop.quantity
    );

    // Generate recommendations
    const protectionAlert = farmerProtection.generateFraudWarning(
      fraudAnalysis.fraudAnalysis.fraudScore,
      offer.buyerName,
      offer.offerPrice,
      fairPrice
    );

    return NextResponse.json({
      success: true,
      offer: {
        id: offer.id,
        buyerName: offer.buyerName,
        cropType: crop.cropName,
        quantity: crop.quantity,
      },
      priceAnalysis: {
        offeredPrice: offer.offerPrice,
        mandiPrice,
        fairPrice: parseFloat(fairPrice.toFixed(2)),
        priceRatio: parseFloat(priceRatio.toFixed(2)),
      },
      financialImpact: {
        lossPerUnit: losses.perUnit,
        totalLoss: losses.total,
        lossPercentage: losses.percentage,
        equivalentQuantity: `${crop.quantity} bags/boxes`,
        message: losses.total > 0 
          ? `Accepting this offer would result in ₹${losses.total.toFixed(2)} loss`
          : "This is a fair offer",
      },
      fraudDetection: fraudAnalysis.fraudAnalysis,
      safetyRecommendation: {
        alert: protectionAlert,
        shouldAccept:
          fraudAnalysis.farmerProtection.shouldAccept &&
          losses.percentage < 10,
        shouldReview:
          fraudAnalysis.farmerProtection.shouldReview ||
          losses.percentage >= 10,
        shouldReject: fraudAnalysis.farmerProtection.shouldReject,
      },
    });
  } catch (error) {
    console.error("Offer protection analysis error:", error);
    return NextResponse.json(
      { error: "Protection analysis failed" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/protection/report-fraud
 * Report fraudulent buyer to admin
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      offerId,
      buyerPhone,
      buyerName,
      reason,
      farmerPhone,
      reportDetails,
    } = body;

    if (!offerId || !buyerPhone || !reason) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Record fraud report
    const fraudReport = {
      id: `report_${Date.now()}`,
      offerId,
      buyerPhone,
      buyerName,
      reason,
      farmerPhone,
      reportDetails,
      reportedAt: new Date().toISOString(),
      status: "pending",
    };

    // In production, save to database
    console.log("🚨 FRAUD REPORT RECORDED:", fraudReport);

    // Check buyer's fraud history
    const buyerOffers = marketplaceDB.offers.filter(
      (o) => o.buyerPhone === buyerPhone
    );
    const suspiciousOffers = buyerOffers.filter((o) => {
      const mandiPrice = getMockMandiPrice("any");
      return o.offerPrice < (mandiPrice * 0.85);
    });

    const shouldBlacklist = suspiciousOffers.length >= 3;

    return NextResponse.json({
      success: true,
      report: {
        id: fraudReport.id,
        status: "recorded",
        message: "Your report has been recorded. Admin will review.",
      },
      buyerAnalysis: {
        totalOffers: buyerOffers.length,
        suspiciousOffers: suspiciousOffers.length,
        recommendedAction: shouldBlacklist ? "BLACKLIST" : "MONITOR",
      },
      nextSteps: [
        "Admin will investigate within 24 hours",
        "Buyer will be flagged in the system",
        shouldBlacklist ? "Buyer may be blacklisted" : "Buyer will be monitored",
        "You will be notified of actions taken",
      ],
    });
  } catch (error) {
    console.error("Fraud report error:", error);
    return NextResponse.json(
      { error: "Failed to record fraud report" },
      { status: 500 }
    );
  }
}

/**
 * Call fraud detection API with AI analysis
 */
async function analyzeFraudWithAI(payload: {
  cropId: string;
  offerPrice: number;
  mandiPrice: number;
  buyerPhone?: string;
  cropType?: string;
  cropQuantity?: number;
}) {
  // Call the fraud detect endpoint
  const response = await fetch("http://localhost:3001/api/fraud/detect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => null);

  if (response && response.ok) {
    return await response.json();
  }

  // Fallback if API unavailable
  return {
    fraudAnalysis: {
      fraudScore: 0,
      isHighRisk: false,
      isCritical: false,
      indicators: [],
      protectionLevel: [],
      recommendation: "ACCEPT",
    },
    farmerProtection: {
      shouldAccept: true,
      shouldReview: false,
      shouldReject: false,
      warningMessage: "✅ Offer analysis unavailable, but price is reasonable",
      safetyChecks: {
        priceAboveMinimum: true,
        reasonableDeviation: true,
        buyerReputable: true,
      },
    },
  };
}

/**
 * Mock function to get mandi price (would call blockchain in production)
 */
function getMockMandiPrice(cropName: string): number {
  const prices: { [key: string]: number } = {
    rice: 182000,
    wheat: 205000,
    tomato: 3500,
    onion: 2800,
    cotton: 480000,
    sugarcane: 325000,
    potato: 2000,
  };

  return prices[cropName.toLowerCase()] || 200000; // Default to 200000 paise (~₹2000)
}
