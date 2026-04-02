/**
 * Farmer Protection Service
 * Prevents price exploitation and ensures fair marketplace transactions
 */

interface FraudAnalysis {
  fraudScore: number;
  isHighRisk: boolean;
  isCritical: boolean;
  indicators: FraudIndicator[];
  protectionLevel: string[];
  recommendation: string;
}

interface FraudIndicator {
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  message: string;
}

interface PriceAnalysis {
  mandiPrice: number;
  offeredPrice: number;
  pricePercentage: string;
  fairPriceGuide: {
    minimum: number;
    fair: number;
    optimal: number;
    currency: string;
  };
  savings: {
    fromFair: string;
    fromOptimal: string;
  };
}

interface FarmerProtection {
  shouldAccept: boolean;
  shouldReview: boolean;
  shouldReject: boolean;
  warningMessage: string;
  safetyChecks: {
    priceAboveMinimum: boolean;
    reasonableDeviation: boolean;
    buyerReputable: boolean;
  };
}

/**
 * Analyze offer for fraud and return protection analysis
 */
export async function analyzeFraudRisk(payload: {
  cropId: string;
  offerPrice: number;
  mandiPrice: number;
  buyerPhone?: string;
  cropType?: string;
  cropQuantity?: number;
  farmerPhone?: string;
}): Promise<{
  fraudAnalysis: FraudAnalysis;
  priceAnalysis: PriceAnalysis;
  farmerProtection: FarmerProtection;
}> {
  try {
    const response = await fetch("/api/fraud/detect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Fraud detection API failed: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Fraud analysis error:", error);
    throw error;
  }
}

/**
 * Get buyer reputation score
 */
export async function getBuyerReputation(buyerId: string): Promise<{
  reputationScore: number;
  status: string;
  riskLevel: string;
  recommendation: string;
}> {
  try {
    const response = await fetch(`/api/fraud/buyer-reputation?buyerId=${buyerId}`);
    if (!response.ok) throw new Error("Failed to fetch buyer reputation");
    return await response.json();
  } catch (error) {
    console.error("Buyer reputation fetch error:", error);
    return {
      reputationScore: 50,
      status: "UNKNOWN",
      riskLevel: "UNKNOWN",
      recommendation: "Unable to verify buyer reputation",
    };
  }
}

/**
 * Alert farmer about suspicious offer
 */
export function alertFarmer(
  farmerName: string,
  fraudScore: number,
  message: string,
  offerPrice: number,
  fairPrice: number
): void {
  const severity =
    fraudScore >= 70 ? "CRITICAL" : fraudScore >= 50 ? "HIGH" : "MEDIUM";

  const alertData = {
    timestamp: new Date(),
    farmer: farmerName,
    severity,
    fraudScore,
    message,
    savings: `Unfair offer: You could get ₹${(fairPrice - offerPrice).toFixed(2)} more from fair price`,
  };

  // Log alert (would send to admin dashboard in production)
  console.log("🚨 FARMER PROTECTION ALERT:", alertData);

  // Could also trigger SMS/voice notification
  if (typeof window !== "undefined") {
    // Browser environment
    if (severity === "CRITICAL") {
      // Visual notification
      window.alert(`⚠️ CRITICAL: ${message}\n\nFair price: ₹${fairPrice.toFixed(2)}\nOffered: ₹${offerPrice.toFixed(2)}`);
    }
  }
}

/**
 * Get safe price range for farmer education
 */
export function getSafePriceRange(mandiPrice: number): {
  minimum: number;
  warning: number;
  fair: number;
  optimal: number;
  maximum: number;
} {
  return {
    minimum: (mandiPrice * 85) / 100, // Absolute minimum (85%)
    warning: (mandiPrice * 90) / 100, // Warning threshold (90%)
    fair: (mandiPrice * 95) / 100, // Fair price (95%)
    optimal: mandiPrice, // Optimal (100%)
    maximum: (mandiPrice * 110) / 100, // Maximum possible (110%)
  };
}

/**
 * Format price analysis for farmer display
 */
export function formatPriceAnalysis(analysis: PriceAnalysis): string {
  const { mandiPrice, offeredPrice, fairPriceGuide } = analysis;
  const loss = fairPriceGuide.fair - offeredPrice;

  return `
Market Price: ₹${mandiPrice.toFixed(2)}
Fair Price: ₹${fairPriceGuide.fair.toFixed(2)}
Your Offer: ₹${offeredPrice.toFixed(2)}
${loss > 0 ? `⚠️ You would lose: ₹${loss.toFixed(2)}` : `✅ Good offer!`}
  `.trim();
}

/**
 * Validate offer against fraud thresholds
 */
export function validateOfferPrice(
  offerPrice: number,
  mandiPrice: number,
  strictMode: boolean = false
): {
  isValid: boolean;
  reason: string;
  recommendation: string;
} {
  const minPrice = (mandiPrice * 85) / 100;
  const severeMinPrice = (mandiPrice * 70) / 100;

  if (offerPrice < severeMinPrice) {
    return {
      isValid: false,
      reason: "Severe price exploitation detected",
      recommendation: "REJECT - This offer is too low and exploitative",
    };
  }

  if (offerPrice < minPrice) {
    return {
      isValid: !strictMode,
      reason: "Below minimum fair price threshold",
      recommendation: strictMode
        ? "REQUIRE_CONFIRMATION"
        : "WARN - Consider negotiating",
    };
  }

  return {
    isValid: true,
    reason: "Offer price is within acceptable range",
    recommendation: "ACCEPT - Safe to proceed",
  };
}

/**
 * Calculate farmer losses due to price exploitation
 */
export function calculateFarmerLosses(
  offerPrice: number,
  mandiPrice: number,
  quantity: number
): {
  perUnit: number;
  total: number;
  percentage: number;
} {
  const fairPrice = (mandiPrice * 95) / 100;
  const perUnitLoss = fairPrice - offerPrice;
  const totalLoss = perUnitLoss * quantity;
  const percentageLoss = ((fairPrice - offerPrice) / fairPrice) * 100;

  return {
    perUnit: parseFloat(perUnitLoss.toFixed(2)),
    total: parseFloat(totalLoss.toFixed(2)),
    percentage: parseFloat(percentageLoss.toFixed(2)),
  };
}

/**
 * Generate fraud warning message for farmer
 */
export function generateFraudWarning(
  fraudScore: number,
  buyerName: string,
  offerPrice: number,
  fairPrice: number
): string {
  const lossAmount = fairPrice - offerPrice;

  if (fraudScore >= 70) {
    return `🚨 CRITICAL FRAUD ALERT: ${buyerName} is attempting severe exploitation! This offer is ₹${lossAmount.toFixed(2)} below fair price. DO NOT ACCEPT.`;
  } else if (fraudScore >= 50) {
    return `⚠️ HIGH RISK: ${buyerName}'s offer seems unfair. You're losing ₹${lossAmount.toFixed(2)} per unit. Contact admin before accepting.`;
  } else if (fraudScore >= 30) {
    return `📌 CAUTION: ${buyerName}'s offer is below fair market price by ₹${lossAmount.toFixed(2)}. You can negotiate for better price.`;
  } else {
    return `✅ SAFE: ${buyerName}'s offer appears reasonable. You may safely accept.`;
  }
}

/**
 * Track fraud patterns over time
 */
export interface BuyerPattern {
  buyerId: string;
  totalOffers: number;
  exploitativeOffers: number;
  avgExploitationPercentage: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  recommendation: string;
}

export function assessBuyerPattern(
  offers: Array<{ price: number; mandiPrice: number }>
): BuyerPattern {
  if (offers.length === 0) {
    return {
      buyerId: "unknown",
      totalOffers: 0,
      exploitativeOffers: 0,
      avgExploitationPercentage: 0,
      riskLevel: "LOW",
      recommendation: "New buyer - monitor carefully",
    };
  }

  const exploitative = offers.filter(
    (o) => (o.price / o.mandiPrice) * 100 < 85
  );
  const avgExploitation = (
    ((exploitative.length / offers.length) * 100) +
    (exploitative.length > 0
      ? exploitative.reduce(
          (sum, o) => sum + ((o.mandiPrice - o.price) / o.mandiPrice) * 100,
          0
        ) / exploitative.length
      : 0)
  ).toFixed(2);

  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
  let recommendation = "Buyer appears trustworthy";

  const exploitRate = (exploitative.length / offers.length) * 100;
  if (exploitRate > 60) {
    riskLevel = "CRITICAL";
    recommendation = "BLACKLIST - Repeatedly exploitative buyer";
  } else if (exploitRate > 40) {
    riskLevel = "HIGH";
    recommendation = "Be very cautious - frequent low offers";
  } else if (exploitRate > 20) {
    riskLevel = "MEDIUM";
    recommendation = "Monitor this buyer - occasional low offers";
  }

  return {
    buyerId: "tracked_buyer",
    totalOffers: offers.length,
    exploitativeOffers: exploitative.length,
    avgExploitationPercentage: parseFloat(avgExploitation),
    riskLevel,
    recommendation,
  };
}

export default {
  analyzeFraudRisk,
  getBuyerReputation,
  alertFarmer,
  getSafePriceRange,
  formatPriceAnalysis,
  validateOfferPrice,
  calculateFarmerLosses,
  generateFraudWarning,
  assessBuyerPattern,
};
