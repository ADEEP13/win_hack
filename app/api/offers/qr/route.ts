import { NextRequest, NextResponse } from 'next/server';
import { qrService } from '@/lib/qr-service';

/**
 * GET /api/offers/qr?offerId=<offerId>
 * Get QR code for an offer (returns both data and image)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const offerId = searchParams.get('offerId');
    const format = searchParams.get('format') || 'full'; // 'full', 'image', 'data'

    if (!offerId) {
      return NextResponse.json(
        { error: 'Missing offerId parameter' },
        { status: 400 }
      );
    }

    // Get all QR codes and find the one for this offer
    // In production, this should query the database
    const qrCode = Object.entries(require('@/lib/qr-service')).find(
      ([key, value]: any) => value && value.offerId === offerId
    )?.[1] as any;

    if (!qrCode) {
      return NextResponse.json(
        { error: 'QR code not found for this offer' },
        { status: 404 }
      );
    }

    if (format === 'image') {
      // Return just the image
      if (!qrCode.qrImage) {
        return NextResponse.json(
          { error: 'QR image not available' },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        qrImage: qrCode.qrImage,
        format: 'base64',
      });
    }

    if (format === 'data') {
      // Return just the data/payload
      return NextResponse.json({
        success: true,
        payload: qrCode.payload,
        qrUrl: qrCode.qrUrl,
      });
    }

    // Return full QR code data
    return NextResponse.json({
      success: true,
      qrCode: {
        id: qrCode.id,
        offerId: qrCode.offerId,
        qrImage: qrCode.qrImage,
        qrUrl: qrCode.qrUrl,
        payload: qrCode.payload,
        createdAt: qrCode.createdAt,
        scans: qrCode.scans,
      },
    });
  } catch (error) {
    console.error('Error getting QR code:', error);
    return NextResponse.json(
      { error: 'Failed to get QR code' },
      { status: 500 }
    );
  }
}
