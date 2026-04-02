import { NextRequest, NextResponse } from "next/server";
import { marketplaceDB } from "@/lib/marketplace-db";

/**
 * POST /api/fraud/detect
 * Comprehensive fraud detection system protecting farmers from price exploitation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cropId,
      offerPrice,
      mandiPrice,
      buyerPhone,
      cropType,
      cropQuantity,
      farmerPhone,
    } = body;

    if (!cropId || !offerPrice || !mandiPrice) {
      return NextResponse.json(
        { error: "Missing required fields: cropId, offerPrice, mandiPrice" },
        { status: 400 }
      );
    }

    // Initialize fraud analysis
    let fraudScore = 0;
    const fraudIndicators = [];
    const protectionLevel = [];

    // ============================================
    // RULE 1: Price Below Minimum Threshold
    // ============================================
    const minAllowedPrice = (mandiPrice * 85) / 100;
    const pricePercentage = (offerPrice / mandiPrice) * 100;

    if (offerPrice < minAllowedPrice) {
      fraudScore += 40;
      fraudIndicators.push({
        type: "BELOW_MINIMUM_PRICE",
        severity: "HIGH",
        message: `Offer is ${(100 - pricePercentage).toFixed(2)}% below mandi price`,
        expectedPrice: minAllowedPrice,
        offeredPrice: offerPrice,
        difference: minAllowedPrice - offerPrice,
      });
    }

    // ============================================
    // RULE 2: Extreme Price Exploitation (< 70% of mandi)
    // ============================================
    const severeMinPrice = (mandiPrice * 70) / 100;
    if (offerPrice < severeMinPrice) {
      fraudScore += 30;
      fraudIndicators.push({
        type: "SEVERE_EXPLOITATION",
        severity: "CRITICAL",
        message: `Buyer attempting severe exploitation (${pricePercentage.toFixed(2)}% of fair price)`,
        expectedPrice: severeMinPrice,
        offeredPrice: offerPrice,
      });
      protectionLevel.push("BLOCK_OFFER");
    }

    // ============================================
    // RULE 3: Repeat Buyer Pattern Analysis
    // ============================================
    if (buyerPhone) {
      const buyerHistory = marketplaceDB.offers.filter(
        (o) => o.buyerPhone === buyerPhone
      );
      const suspiciousOffers = buyerHistory.filter((o) => {
        const historicalPrice = o.offerPrice;
        const historicalMinPrice = (mandiPrice * 85) / 100;
        return historicalPrice < historicalMinPrice;
      });

      if (buyerHistory.length > 0) {
        const exploitationRate =
          (suspiciousOffers.length / buyerHistory.length) * 100;

        if (exploitationRate > 50) {
          fraudScore += 25;
          fraudIndicators.push({
            type: "REPEAT_EXPLOITER",
            severity: "HIGH",
            message: `Buyer has ${exploitationRate.toFixed(0)}% suspicious offers in history`,
            totalOffers: buyerHistory.length,
            suspiciousOffers: suspiciousOffers.length,
            exploitationRate: exploitationRate.toFixed(2),
          });
          protectionLevel.push("FLAG_BUYER");
        } else if (exploitationRate > 25) {
          fraudScore += 15;
          fraudIndicators.push({
            type: "CAUTIOUS_BUYER",
            severity: "MEDIUM",
            message: `Buyer shows pattern of below-fair offers (${exploitationRate.toFixed(0)}%)`,
            exploitationRate: exploitationRate.toFixed(2),
          });
        }
      }
    }

    // ============================================
    // RULE 4: Market Anomaly Detection
    // ============================================
    if (cropType) {
      const similarOffers = marketplaceDB.offers.filter(
        (o) => o.cropId === cropId && o.status === "pending"
      );

      if (similarOffers.length > 2) {
        const averageOfferPrice =
          similarOffers.reduce((sum, o) => sum + o.offerPrice, 0) /
          similarOffers.length;
        const deviation = Math.abs(offerPrice - averageOfferPrice);
        const deviationPercent = (deviation / averageOfferPrice) * 100;

        if (deviationPercent > 30) {
          fraudScore += 10;
          fraudIndicators.push({
            type: "MARKET_ANOMALY",
            severity: "LOW",
            message: `Offer deviates ${deviationPercent.toFixed(2)}% from similar offers`,
            marketAverage: averageOfferPrice.toFixed(2),
            currentOffer: offerPrice,
          });
        }
      }
    }

    // ============================================
    // RULE 5: Quantity Validation
    // ============================================
    if (cropQuantity && cropQuantity === 0) {
      fraudScore += 20;
      fraudIndicators.push({
        type: "INVALID_QUANTITY",
        severity: "MEDIUM",
        message: "Zero or invalid quantity in offer",
      });
    }

    // ============================================
    // FARMER PROTECTION RECOMMENDATIONS
    // ============================================
    const recommendation = getFraudRecommendation(fraudScore);
    const fairPriceGuide = {
      minimum: minAllowedPrice,
      fair: (mandiPrice * 95) / 100,
      optimal: mandiPrice,
      currency: "₹",
    };

    // ============================================
    // SAFE TRANSACTION INDICATORS
    // ============================================
    const safetyChecks = {
      priceAboveMinimum: offerPrice >= minAllowedPrice,
      reasonableDeviation: pricePercentage >= 75,
      buyerReputable:
        buyerPhone &&
        !marketplaceDB.offers.some(
          (o) =>
            o.buyerPhone === buyerPhone &&
            o.status === "rejected" &&
            o.agreedDate
        ),
    };

    // Alert if fraud risk is high
    if (fraudScore >= 60) {
      protectionLevel.push("ALERT_FARMER");
      if (!protectionLevel.includes("BLOCK_OFFER")) {
        protectionLevel.push("REQUIRE_CONFIRMATION");
      }
    }

    return NextResponse.json({
      success: true,
      fraudAnalysis: {
        fraudScore: Math.min(fraudScore, 100),
        isHighRisk: fraudScore >= 60,
        isCritical: fraudScore >= 80,
        indicators: fraudIndicators,
        protectionLevel: protectionLevel,
        recommendation,
      },
      priceAnalysis: {
        mandiPrice,
        offeredPrice: offerPrice,
        pricePercentage: pricePercentage.toFixed(2),
        fairPriceGuide,
        savings: {
          fromFair: (
            ((mandiPrice * 0.95 - offerPrice) / (mandiPrice * 0.95)) *
            100
          ).toFixed(2),
          fromOptimal: (
            ((mandiPrice - offerPrice) / mandiPrice) *
            100
          ).toFixed(2),
        },
      },
      farmerProtection: {
        shouldAccept: fraudScore < 40,
        shouldReview: fraudScore >= 40 && fraudScore < 70,
        shouldReject: fraudScore >= 70,
        warningMessage:
          fraudScore >= 40
            ? "⚠️ This offer may not be fair. Review carefully."
            : "✅ This offer appears reasonable.",
        safetyChecks,
      },
    });
  } catch (error) {
    console.error("Fraud detection error:", error);
    return NextResponse.json(
      { error: "Fraud detection failed", details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * Get fraud recommendation based on score
 */
function getFraudRecommendation(fraudScore: number): string {
  if (fraudScore >= 80) {
    return "BLOCK_IMMEDIATELY - Severe exploitation attempt detected. Do not accept this offer.";
  } else if (fraudScore >= 60) {
    return "REQUIRE_CONFIRMATION - High fraud risk. Call admin before accepting.";
  } else if (fraudScore >= 40) {
    return "CAUTION - This offer is below fair price. Consider alternatives.";
  } else if (fraudScore >= 20) {
    return "REVIEW - Offer is acceptable but slightly below market. Negotiate if possible.";
  } else {
    return "ACCEPT - Offer appears fair and reasonable. Safe to proceed.";
  }
}
