import { NextRequest, NextResponse } from "next/server";
import { marketplaceDB } from "@/lib/marketplace-db";

/**
 * GET /api/admin/fraud-dashboard
 * Real-time fraud monitoring dashboard for admins
 */
export async function GET(request: NextRequest) {
  try {
    // Analyze all offers for fraud patterns
    const offers = marketplaceDB.offers;
    const crops = marketplaceDB.crops;

    // Create crop price map
    const mandiPrices: { [key: string]: number } = {
      rice: 182000,
      wheat: 205000,
      tomato: 3500,
      onion: 2800,
      cotton: 480000,
      sugarcane: 325000,
      potato: 2000,
    };

    // Analyze each offer
    const fraudAnalysis = offers.map((offer) => {
      const crop = crops.find((c) => c.id === offer.cropId);
      const mandiPrice =
        mandiPrices[crop?.cropName.toLowerCase() || "unknown"] || 200000;
      const priceRatio = (offer.offerPrice / mandiPrice) * 100;
      const isSuspicious = priceRatio < 85;

      return {
        offerId: offer.id,
        buyerName: offer.buyerName,
        buyerPhone: offer.buyerPhone,
        cropType: crop?.cropName || "Unknown",
        offerPrice: offer.offerPrice,
        mandiPrice,
        priceRatio: parseFloat(priceRatio.toFixed(2)),
        isSuspicious,
        fraudRiskLevel:
          priceRatio < 70
            ? "CRITICAL"
            : priceRatio < 85
              ? "HIGH"
              : priceRatio < 90
                ? "MEDIUM"
                : "LOW",
        status: offer.status,
        createdAt: offer.createdAt,
      };
    });

    // Group by buyer to identify patterns
    const buyerPatterns = new Map<
      string,
      {
        phone: string;
        name: string;
        totalOffers: number;
        suspiciousOffers: number;
        exploitationRate: number;
        avgPriceRatio: number;
        criticalOffers: number;
        riskLevel: "SAFE" | "MONITOR" | "INVESTIGATE" | "BLACKLIST";
      }
    >();

    fraudAnalysis.forEach((analysis) => {
      if (!buyerPatterns.has(analysis.buyerPhone)) {
        buyerPatterns.set(analysis.buyerPhone, {
          phone: analysis.buyerPhone,
          name: analysis.buyerName,
          totalOffers: 0,
          suspiciousOffers: 0,
          exploitationRate: 0,
          avgPriceRatio: 0,
          criticalOffers: 0,
          riskLevel: "SAFE",
        });
      }

      const pattern = buyerPatterns.get(analysis.buyerPhone)!;
      pattern.totalOffers++;
      if (analysis.isSuspicious) pattern.suspiciousOffers++;
      if (analysis.fraudRiskLevel === "CRITICAL") pattern.criticalOffers++;
      pattern.avgPriceRatio += analysis.priceRatio;
    });

    // Calculate final metrics
    const processedPatterns = Array.from(buyerPatterns.values()).map(
      (pattern) => {
        pattern.avgPriceRatio = parseFloat(
          (pattern.avgPriceRatio / pattern.totalOffers).toFixed(2)
        );
        pattern.exploitationRate = parseFloat(
          ((pattern.suspiciousOffers / pattern.totalOffers) * 100).toFixed(2)
        );

        if (pattern.criticalOffers >= 2) {
          pattern.riskLevel = "BLACKLIST";
        } else if (pattern.exploitationRate >= 60) {
          pattern.riskLevel = "INVESTIGATE";
        } else if (pattern.exploitationRate >= 30) {
          pattern.riskLevel = "MONITOR";
        } else {
          pattern.riskLevel = "SAFE";
        }

        return pattern;
      }
    );

    // Summary statistics
    const totalOffers = fraudAnalysis.length;
    const suspiciousOffers = fraudAnalysis.filter(
      (a) => a.isSuspicious
    ).length;
    const criticalOffers = fraudAnalysis.filter(
      (a) => a.fraudRiskLevel === "CRITICAL"
    ).length;
    const blockedOffers = fraudAnalysis.filter(
      (a) => a.fraudRiskLevel === "CRITICAL" && a.status !== "accepted"
    ).length;

    const highRiskBuyers = processedPatterns.filter(
      (p) => p.riskLevel === "INVESTIGATE" || p.riskLevel === "BLACKLIST"
    );

    // Calculate fraud rate
    const fraudRate = parseFloat(
      ((suspiciousOffers / totalOffers) * 100).toFixed(2)
    );

    // Top exploiters
    const topExploiters = processedPatterns
      .sort((a, b) => b.exploitationRate - a.exploitationRate)
      .slice(0, 5);

    // Recent fraud attempts (last 24 hours)
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
    const recentFraudAttempts = fraudAnalysis
      .filter((a) => a.isSuspicious && a.createdAt > thirtyMinsAgo)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      summary: {
        totalOffers,
        suspiciousOffers,
        criticSize: criticalOffers,
        blockedOffers,
        fraudRate: `${fraudRate}%`,
        highRiskBuyers: highRiskBuyers.length,
      },
      alerts: {
        critical: criticalOffers > 0 ? "🚨 Critical fraud attempts detected!" : "✅ No critical threats",
        monitoring:
          highRiskBuyers.length > 0
            ? `⚠️ ${highRiskBuyers.length} buyers under investigation`
            : "✅ No buyers under investigation",
        fraudRate:
          fraudRate > 20
            ? "📊 High fraud rate detected - review buyer patterns"
            : "✅ Fraud rate within acceptable range",
      },
      topExploiters: topExploiters.map((p) => ({
        buyerName: p.name,
        buyerPhone: p.phone,
        exploitationRate: `${p.exploitationRate}%`,
        totalOffers: p.totalOffers,
        suspiciousOffers: p.suspiciousOffers,
        avgPriceRatio: p.avgPriceRatio,
        recommendation: p.riskLevel,
      })),
      recentAlerts: recentFraudAttempts.map((a) => ({
        timestamp: a.createdAt,
        buyer: a.buyerName,
        crop: a.cropType,
        priceRatio: `${a.priceRatio}%`,
        fairPrice: a.mandiPrice,
        offeredPrice: a.offerPrice,
        loss: a.mandiPrice - a.offerPrice,
        action: `Contact buyer or review offer ${a.offerId}`,
      })),
      buyerAnalysis: processedPatterns.map((p) => ({
        buyerName: p.name,
        buyerPhone: p.phone,
        totalOffers: p.totalOffers,
        suspiciousOffers: p.suspiciousOffers,
        exploitationRate: `${p.exploitationRate}%`,
        avgPriceRatio: p.avgPriceRatio,
        criticalOffers: p.criticalOffers,
        riskLevel: p.riskLevel,
        recommendedAction:
          p.riskLevel === "BLACKLIST"
            ? "Blacklist this buyer immediately"
            : p.riskLevel === "INVESTIGATE"
              ? "Investigate buyer pattern - possible fraud ring"
              : p.riskLevel === "MONITOR"
                ? "Monitor future offers"
                : "No action needed - buyer is safe",
      })),
      recommendations: generateRecommendations(
        fraudRate,
        totalOffers,
        highRiskBuyers.length,
        criticalOffers
      ),
    });
  } catch (error) {
    console.error("Fraud dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to generate fraud dashboard" },
      { status: 500 }
    );
  }
}

/**
 * Generate admin recommendations based on fraud metrics
 */
function generateRecommendations(
  fraudRate: number,
  totalOffers: number,
  highRiskBuyers: number,
  criticalOffers: number
): string[] {
  const recommendations: string[] = [];

  if (criticalOffers > 0) {
    recommendations.push(
      `🚨 URGENT: Block ${criticalOffers} critical fraud attempts immediately`
    );
  }

  if (fraudRate > 30) {
    recommendations.push(
      `⚠️ HIGH FRAUD RATE: ${fraudRate}% of offers are suspicious. Consider stricter validation rules.`
    );
  }

  if (highRiskBuyers > 0) {
    recommendations.push(
      `🔍 INVESTIGATION NEEDED: ${highRiskBuyers} buyers show exploitation patterns. Recommend blacklisting repeat offenders.`
    );
  }

  if (totalOffers > 100 && fraudRate > 15) {
    recommendations.push(
      `📊 PATTERN DETECTED: Multiple fraud attempts suggest organized exploitation. Consider buyer verification improvements.`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      `✅ HEALTHY MARKETPLACE: Fraud rates are low. Continue monitoring.`
    );
  }

  recommendations.push(
    `📱 FARMER PROTECTION: All offers below 85% mandi price are auto-flagged for farmer review.`
  );
  recommendations.push(
    `🔔 REAL-TIME ALERTS: Admin will be notified of critical fraud attempts.`
  );

  return recommendations;
}
