import { NextRequest, NextResponse } from "next/server";

// Mock database
const offersDatabase: any[] = [];
const cropsDatabase: any[] = [];

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

    offersDatabase.push(newOffer);

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

// GET - Fetch offers for a farmer or a crop
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const farmerPhone = searchParams.get("farmerPhone");
    const cropId = searchParams.get("cropId");

    let offers = [...offersDatabase];

    if (farmerPhone && cropId) {
      // Get all offers for a specific crop of a specific farmer
      offers = offers.filter(
        (o) => o.cropId === cropId
      );
    } else if (farmerPhone) {
      // Get all offers received by a farmer (we need to match phone with crops)
      offers = offers.filter((o) => {
        // This would require fetching crops first in production
        return true; // Simplified for now
      });
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

    const offer = offersDatabase.find((o) => o.id === offerId);
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

    return NextResponse.json({
      success: true,
      offer,
      message: `Offer ${status} successfully`,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update offer" },
      { status: 500 }
    );
  }
}
