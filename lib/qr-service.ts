import crypto from 'crypto';
import QRCode from 'qrcode';

export interface QRPayload {
  transactionHash: string;
  farmerId: string;
  farmerName: string;
  farmerLocation: string;
  cropType: string;
  quantity: string;
  harvestDate: string;
  pricePerKg: number;
  timestamp: string;
  signature: string;
}

export interface QRCodeRecord {
  id: string;
  offerId: string;
  payload: QRPayload;
  qrData: string; // Encoded payload
  qrImage: string; // Base64 PNG image
  qrUrl: string; // Verification URL
  createdAt: string;
  scans: number;
}

// In-memory QR storage (replace with DB in production)
const qrCodes: Map<string, QRCodeRecord> = new Map();

export const qrService = {
  /**
   * Generate a cryptographic signature for the QR data
   */
  generateSignature(data: Omit<QRPayload, 'signature'>): string {
    const dataString = JSON.stringify(data);
    const hash = crypto.createHash('sha256').update(dataString).digest('hex');
    return hash.substring(0, 16); // 16-char signature
  },

  /**
   * Create a QR code payload and encode it
   */
  async generateQRCode(offerId: string, payload: Omit<QRPayload, 'signature'>, baseUrl?: string): Promise<QRCodeRecord> {
    const signature = this.generateSignature(payload);
    
    const fullPayload: QRPayload = {
      ...payload,
      signature,
    };

    // Encode as a compact URL-safe string
    const qrData = Buffer.from(JSON.stringify(fullPayload)).toString('base64');
    
    // Generate QR verification URL with provided baseUrl
    const qrUrl = this.generateQRUrl(`qr_${Date.now()}_${Math.random().toString(36).substring(7)}`, baseUrl);
    
    // Generate actual QR image
    let qrImage = '';
    try {
      qrImage = await QRCode.toDataURL(qrUrl, {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
    } catch (error) {
      console.error('Error generating QR image:', error);
      qrImage = ''; // Graceful fallback
    }
    
    const qrCodeId = `qr_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    const qrCode: QRCodeRecord = {
      id: qrCodeId,
      offerId,
      payload: fullPayload,
      qrData,
      qrImage,
      qrUrl,
      createdAt: new Date().toISOString(),
      scans: 0,
    };

    qrCodes.set(qrCodeId, qrCode);
    return qrCode;
  },

  /**
   * Verify and retrieve QR code data
   */
  verifyQRCode(qrId: string): QRCodeRecord | null {
    const qr = qrCodes.get(qrId);
    if (!qr) return null;

    // Verify signature
    const { signature, ...dataWithoutSignature } = qr.payload;
    const expectedSignature = this.generateSignature(dataWithoutSignature);
    
    if (signature !== expectedSignature) {
      console.error('QR signature mismatch - data may be tampered');
      return null;
    }

    // Increment scan count
    qr.scans += 1;
    qrCodes.set(qrId, qr);

    return qr;
  },

  /**
   * Get QR code by ID
   */
  getQRCode(qrId: string): QRCodeRecord | null {
    return qrCodes.get(qrId) || null;
  },

  /**
   * Get all QR codes for a consumer
   */
  getConsumerQRCodes(consumerPhone: string): QRCodeRecord[] {
    // In production, filter from database by consumer
    return Array.from(qrCodes.values());
  },

  /**
   * Generate a scannable URL for the QR code
   */
  generateQRUrl(qrId: string, baseUrl?: string): string {
    // Use provided baseUrl, environment variable, or default to localhost
    const url = baseUrl || process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://100.108.95.3:3001';
    return `${url}/verify-qr?id=${qrId}`;
  },
};
