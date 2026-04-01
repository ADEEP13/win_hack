import { NextRequest, NextResponse } from 'next/server';
import { qrService } from '@/lib/qr-service';
import QRCode from 'qrcode';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const qrId = searchParams.get('id');
    const format = searchParams.get('format') || 'json'; // 'json' or 'image'

    if (!qrId) {
      return NextResponse.json(
        { success: false, error: 'QR ID is required' },
        { status: 400 }
      );
    }

    // Verify QR code authenticity
    const qrData = qrService.verifyQRCode(qrId);

    if (!qrData) {
      return NextResponse.json(
        { success: false, error: 'Invalid or tampered QR code' },
        { status: 404 }
      );
    }

    if (format === 'image') {
      // Generate QR image
      const url = qrService.generateQRUrl(qrId);
      const qrImage = await QRCode.toDataURL(url);
      
      return NextResponse.json({
        success: true,
        qrImage,
        data: qrData.payload,
      });
    }

    // Return JSON data
    return NextResponse.json({
      success: true,
      qrCode: qrData,
      data: {
        transactionHash: qrData.payload.transactionHash,
        farmerName: qrData.payload.farmerName,
        farmerLocation: qrData.payload.farmerLocation,
        cropType: qrData.payload.cropType,
        quantity: qrData.payload.quantity,
        harvestDate: qrData.payload.harvestDate,
        pricePerKg: qrData.payload.pricePerKg,
        timestamp: qrData.payload.timestamp,
        signature: qrData.payload.signature,
        scans: qrData.scans,
      },
      message: '✅ Transaction verified and authentic!',
    });
  } catch (error) {
    console.error('Error verifying QR:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify QR code' },
      { status: 500 }
    );
  }
}
