'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface QRVerificationData {
  transactionHash: string;
  farmerName: string;
  farmerLocation: string;
  cropType: string;
  quantity: string;
  harvestDate: string;
  pricePerKg: number;
  timestamp: string;
  signature: string;
  scans: number;
}

function VerifyQRContent() {
  const searchParams = useSearchParams();
  const qrId = searchParams.get('id');
  
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [data, setData] = useState<QRVerificationData | null>(null);
  const [error, setError] = useState('');
  const [qrImage, setQrImage] = useState('');

  useEffect(() => {
    if (!qrId) {
      setError('No QR code ID provided');
      setLoading(false);
      return;
    }

    const verifyQR = async () => {
      try {
        const res = await fetch(`/api/qr/verify?id=${qrId}&format=json`);
        const result = await res.json();

        if (result.success) {
          setVerified(true);
          setData(result.data);
          
          // Also fetch the QR image
          const imageRes = await fetch(`/api/qr/verify?id=${qrId}&format=image`);
          const imageData = await imageRes.json();
          if (imageData.qrImage) {
            setQrImage(imageData.qrImage);
          }
        } else {
          setError(result.error || 'Failed to verify QR code');
        }
      } catch (err) {
        setError('Error verifying QR code');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    verifyQR();
  }, [qrId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-5xl mb-4">📱</div>
          <p className="text-slate-600 text-lg">Verifying QR Code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-agri-green mb-2">🔍 Farm-to-Fork Verification</h1>
          <p className="text-slate-600">Scan to verify product authenticity and farmer identity</p>
        </div>

        {error ? (
          // Error State
          <div className="bg-red-50 border-2 border-red-500 rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-red-700 mb-2">Verification Failed</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <p className="text-sm text-red-500">This QR code may be forged or tampered with.</p>
            <a
              href="/"
              className="inline-block mt-6 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
            >
              ← Back Home
            </a>
          </div>
        ) : verified && data ? (
          // Success State
          <div className="space-y-6">
            {/* Trust Certificate */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-lg p-8 text-center">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-3xl font-bold mb-2">Verified & Authentic</h2>
              <p className="text-green-100 mb-6">This product is directly from a verified farmer</p>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <p className="text-sm text-green-100">Blockchain-verified transaction</p>
                <p className="font-mono text-xs text-green-100 break-all mt-2">{data.transactionHash}</p>
              </div>
            </div>

            {/* Farmer Information */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-agri-green mb-6">👨‍🌾 Farmer Profile</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-600 text-sm mb-1">Farmer Name</p>
                  <p className="text-xl font-bold text-slate-800">{data.farmerName}</p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm mb-1">Location</p>
                  <p className="text-xl font-bold text-slate-800">📍 {data.farmerLocation}</p>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-agri-green mb-6">🌾 Product Details</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-slate-600">Crop Type</span>
                  <span className="font-bold text-slate-800">{data.cropType}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-slate-600">Quantity</span>
                  <span className="font-bold text-slate-800">{data.quantity} kg</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-slate-600">Price per KG</span>
                  <span className="font-bold text-slate-800">₹{data.pricePerKg}</span>
                </div>
                <div className="flex justify-between items-center pb-4 border-b">
                  <span className="text-slate-600">Harvest Date</span>
                  <span className="font-bold text-slate-800">
                    {new Date(data.harvestDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Transaction Date</span>
                  <span className="font-bold text-slate-800">
                    {new Date(data.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Blockchain Verification */}
            <div className="bg-white rounded-lg shadow-md p-8">
              <h3 className="text-2xl font-bold text-agri-green mb-6">⛓️ Blockchain Verification</h3>
              <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                <div>
                  <p className="text-slate-600 text-sm mb-2">Transaction Hash</p>
                  <p className="font-mono text-xs text-blue-600 break-all bg-white p-3 rounded border-l-4 border-blue-500">
                    {data.transactionHash}
                  </p>
                </div>
                <div>
                  <p className="text-slate-600 text-sm mb-2">Security Signature</p>
                  <p className="font-mono text-sm font-bold text-green-700 bg-white p-3 rounded border-l-4 border-green-500">
                    {data.signature}
                  </p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-4">
                  <p className="text-xs text-blue-900">
                    ℹ️ <span className="font-semibold">Authenticity Proof:</span> This transaction is recorded immutably on the blockchain. The cryptographic signature ensures that this data cannot be tampered with. The transaction hash is the permanent proof of this purchase.
                  </p>
                </div>
              </div>
            </div>

            {/* Scan Statistics */}
            <div className="bg-slate-100 rounded-lg p-6 text-center">
              <p className="text-slate-600 text-sm">This product has been scanned</p>
              <p className="text-3xl font-bold text-agri-green">{data.scans}</p>
              <p className="text-slate-600 text-sm">times</p>
            </div>

            {/* QR Code Display */}
            {qrImage && (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <h3 className="text-lg font-bold text-slate-800 mb-4">QR Code</h3>
                <img src={qrImage} alt="QR Code" className="mx-auto max-w-xs" />
              </div>
            )}

            {/* Call to Action */}
            <div className="bg-gradient-to-r from-agri-green to-green-600 text-white rounded-lg shadow-lg p-8 text-center">
              <h3 className="text-2xl font-bold mb-3">✨ Trust Verified</h3>
              <p className="mb-6">You can be confident this product is authentic and ethically sourced directly from the farmer.</p>
              <a
                href="/"
                className="inline-block bg-white text-agri-green px-8 py-2 rounded-lg font-bold hover:bg-slate-100 transition"
              >
                ← Back Home
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
export default function VerifyQRPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="text-5xl mb-4">📱</div>
            <p className="text-slate-600 text-lg">Loading...</p>
          </div>
        </div>
      }
    >
      <VerifyQRContent />
    </Suspense>
  );
}