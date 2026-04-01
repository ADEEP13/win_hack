'use client';

import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRouter } from 'next/navigation';

export default function ScanQRPage() {
  const scannerRef = useRef<HTMLDivElement>(null);
  const scannerInstanceRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!scannerRef.current || !isScanning) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1,
        disableFlip: false,
      },
      false
    );

    scannerInstanceRef.current = scanner;

    scanner.render(
      (decodedText) => {
        // Extracted QR code URL or data
        setScanResult(decodedText);
        
        // Stop scanning
        scanner.clear();
        setIsScanning(false);

        // Extract QR ID from URL or data
        const urlParams = new URLSearchParams(new URL(decodedText, 'https://example.com').search);
        const qrId = urlParams.get('id') || decodedText;

        // Redirect to verification page
        router.push(`/verify-qr?id=${qrId}`);
      },
      (error) => {
        // Ignore error messages from scanning
      }
    );

    return () => {
      if (scannerInstanceRef.current) {
        scannerInstanceRef.current.clear();
      }
    };
  }, [isScanning, router]);

  const handleStartScanning = () => {
    setIsScanning(true);
  };

  const handleStopScanning = () => {
    setIsScanning(false);
    if (scannerInstanceRef.current) {
      scannerInstanceRef.current.clear();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-agri-green mb-2">📱 Scan QR Code</h1>
          <p className="text-slate-600">Verify product authenticity and farmer identity</p>
        </div>

        {/* Scanner Container */}
        {!isScanning ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="text-5xl mb-6">📷</div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Ready to Scan</h2>
            <p className="text-slate-600 mb-8">
              Point your camera at the QR code on the product packaging to verify its authenticity.
            </p>

            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
              <p className="text-sm text-blue-900 mb-4">
                <span className="font-semibold">📌 How it works:</span>
              </p>
              <ul className="text-sm text-blue-900 space-y-2 text-left">
                <li>✓ Look for the QR code on the product receipt or packaging</li>
                <li>✓ Click "Start Scanning" to begin</li>
                <li>✓ Point your camera at the QR code</li>
                <li>✓ Your phone will automatically verify and show details</li>
                <li>✓ You'll see farmer info, product details, and blockchain verification</li>
              </ul>
            </div>

            <button
              onClick={handleStartScanning}
              className="inline-block bg-gradient-to-r from-agri-green to-green-600 text-white px-8 py-3 rounded-lg font-bold hover:opacity-90 transition text-lg"
            >
              📷 Start Scanning
            </button>

            {/* Previous Scan Link */}
            <p className="text-slate-600 mt-8 text-sm">
              Or paste a QR code URL:{' '}
              <input
                type="text"
                placeholder="Paste QR URL here"
                className="w-full mt-3 px-4 py-2 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-agri-green"
                onPaste={(e) => {
                  const pastedText = e.clipboardData?.getData('text') || '';
                  const urlParams = new URLSearchParams(new URL(pastedText, 'https://example.com').search);
                  const qrId = urlParams.get('id') || pastedText;
                  if (qrId) router.push(`/verify-qr?id=${qrId}`);
                }}
              />
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div id="qr-reader" style={{ width: '100%' }} />
            <div className="p-6 text-center">
              <div className="inline-block bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg mb-4">
                🎯 Point your camera at the QR code
              </div>
              <button
                onClick={handleStopScanning}
                className="block w-full bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition"
              >
                ✕ Stop Scanning
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-agri-green mb-4">🔒 Your Privacy</h3>
          <ul className="space-y-2 text-slate-700">
            <li>✓ No personal data is collected during scanning</li>
            <li>✓ Bank account details are never exposed in the QR code</li>
            <li>✓ You only see verified blockchain transaction data</li>
            <li>✓ The security signature proves authenticity</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
