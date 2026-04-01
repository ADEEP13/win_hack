import crypto from 'crypto';

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

export interface QRCode {
  id: string;
  offerId: string;
  payload: QRPayload;
  qrData: string; // Encoded payload
  createdAt: string;
  scans: number;
}

// In-memory QR storage (replace with DB in production)
const qrCodes: Map<string, QRCode> = new Map();

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
  generateQRCode(offerId: string, payload: Omit<QRPayload, 'signature'>): QRCode {
    const signature = this.generateSignature(payload);
    
    const fullPayload: QRPayload = {
      ...payload,
      signature,
    };

    // Encode as a compact URL-safe string
    const qrData = Buffer.from(JSON.stringify(fullPayload)).toString('base64');
    
    const qrCode: QRCode = {
      id: `qr_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      offerId,
      payload: fullPayload,
      qrData,
      createdAt: new Date().toISOString(),
      scans: 0,
    };

    qrCodes.set(qrCode.id, qrCode);
    return qrCode;
  },

  /**
   * Verify and retrieve QR code data
   */
  verifyQRCode(qrId: string): QRCode | null {
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
  getQRCode(qrId: string): QRCode | null {
    return qrCodes.get(qrId) || null;
  },

  /**
   * Get all QR codes for a consumer
   */
  getConsumerQRCodes(consumerPhone: string): QRCode[] {
    // In production, filter from database by consumer
    return Array.from(qrCodes.values());
  },

  /**
   * Generate a scannable URL for the QR code
   */
  generateQRUrl(qrId: string, baseUrl: string = 'https://jandhan-plus.com'): string {
    return `${baseUrl}/verify-qr?id=${qrId}`;
  },
};
