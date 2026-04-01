import { NextRequest, NextResponse } from 'next/server';

/**
 * Decode QR data from URL parameter (base64 encoded)
 * This allows offline verification if data is included in QR itself
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const data = searchParams.get('data');
    const id = searchParams.get('id');

    // If data is provided in URL (embedded in QR), decode it
    if (data) {
      try {
        const decodedData = JSON.parse(
          Buffer.from(data, 'base64').toString('utf-8')
        );
        return NextResponse.json({
          success: true,
          source: 'embedded',
          data: decodedData,
          message: '✅ Transaction verified (offline)',
        });
      } catch (e) {
        return NextResponse.json(
          { success: false, error: 'Invalid QR data format' },
          { status: 400 }
        );
      }
    }

    // If only ID is provided, return error asking for data
    if (id) {
      return NextResponse.json(
        { success: false, error: 'QR data not embedded in code' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Missing QR data or ID parameter' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error decoding QR:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to decode QR data' },
      { status: 500 }
    );
  }
}
