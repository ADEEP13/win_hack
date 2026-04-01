import { NextRequest, NextResponse } from "next/server";
import { marketplaceDB } from "@/lib/marketplace-db";
import { qrService } from "@/lib/qr-service";

// POST - Buyer makes an offer on a crop
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { cropId, buyerName, buyerPhone, offerPrice, quantity, bankAccount, message } = body;

    if (!cropId || !buyerName || !buyerPhone || !offerPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newOffer = {
      id: `offer_${Date.now()}`,
      cropId,
      buyerName,
      buyerPhone,
      offerPrice: parseFloat(offerPrice),
      quantity: quantity ? parseInt(quantity) : null,
      bankAccount,
      message,
      createdAt: new Date().toISOString(),
      status: "pending", // pending, accepted, rejected
      blockchainHash: "0x" + Math.random().toString(16).substr(2, 40),
    };

    marketplaceDB.offers.push(newOffer);

    return NextResponse.json({
      success: true,
      offer: newOffer,
      message: "Offer submitted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit offer" },
      { status: 500 }
    );
  }
}

// GET - Fetch offers for a farmer, buyer, or a crop
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const farmerPhone = searchParams.get("farmerPhone");
    const buyerPhone = searchParams.get("buyerPhone");
    const cropId = searchParams.get("cropId");

    let offers = [...marketplaceDB.offers];

    if (buyerPhone) {
      // Get all offers made by a specific buyer
      offers = offers.filter((o) => o.buyerPhone === buyerPhone);
    } else if (farmerPhone && cropId) {
      // Get all offers for a specific crop of a specific farmer
      offers = offers.filter(
        (o) => o.cropId === cropId
      );
    } else if (farmerPhone) {
      // Get all offers received by a farmer
      // 1. Find all crops owned by this farmer
      const farmerCrops = marketplaceDB.crops.filter((c) => c.farmerPhone === farmerPhone);
      const farmerCropIds = farmerCrops.map((c) => c.id);
      
      // 2. Filter offers that match those crops
      offers = offers.filter((o) => farmerCropIds.includes(o.cropId));
    }

    return NextResponse.json({
      success: true,
      offers,
      count: offers.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}

// PUT - Farmer accepts or rejects an offer
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, status } = body; // status: 'accepted' or 'rejected'

    if (!offerId || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const offer = marketplaceDB.offers.find((o) => o.id === offerId);
    if (!offer) {
      return NextResponse.json(
        { error: "Offer not found" },
        { status: 404 }
      );
    }

    if (status !== "accepted" && status !== "rejected") {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    offer.status = status;
    offer.respondedAt = new Date().toISOString();

    // Generate QR code when offer is accepted
    let qrCode = null;
    if (status === "accepted") {
      const crop = marketplaceDB.crops.find((c) => c.id === offer.cropId);
      
      if (crop) {
        qrCode = qrService.generateQRCode(offerId, {
          transactionHash: offer.blockchainHash,
          farmerId: crop.farmerId || "UNKNOWN",
          farmerName: crop.farmerName,
          farmerLocation: crop.farmerLocation || "Unknown",
          cropType: crop.cropName,
          quantity: crop.quantity.toString(),
          harvestDate: crop.harvestedDate || new Date().toISOString(),
          pricePerKg: offer.offerPrice,
          timestamp: new Date().toISOString(),
        });

        // Store QR code ID with offer
        (offer as any).qrCodeId = qrCode.id;
        (offer as any).qrCodeUrl = qrService.generateQRUrl(qrCode.id);
      }
    }

    return NextResponse.json({
      success: true,
      offer,
      qrCode,
      message: `Offer ${status} successfully`,
      verificationUrl: qrCode ? qrService.generateQRUrl(qrCode.id) : null,
    });
  } catch (error) {
    console.error("Error updating offer:", error);
    return NextResponse.json(
      { error: "Failed to update offer" },
      { status: 500 }
    );
  }
}
