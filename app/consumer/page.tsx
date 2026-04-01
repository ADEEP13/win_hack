'use client'

import { useState } from 'react'

const mockTrace = {
  cropId: 1,
  cropName: 'Rice (Basmati)',
  farmer: 'Ramesh Kumar',
  farmLocation: { lat: 13.21, lng: 77.61, name: 'Tumkur, Karnataka' },
  harvestDate: '2025-01-13',
  quality: 'Grade A',
  aiConfidence: 94,
  image: '🌾',
  pricePerKg: 37,
  quantity: 500,
  totalFarmerPayment: 18500,
  paymentMethod: 'UPI',
  farmerUPI: 'farmer@okaxis',
  buyerUPI: 'buyer@icici',
  paymentInitiated: '2025-01-13T10:30:00Z',
  paymentCompleted: '2025-01-13T11:00:00Z',
  transactionRef: 'UPI202501131030XXXX',
  retailPrice: 21000,
  fairnessScore: 88,
  blockchain: {
    hash: '0x1234567890abcdef1234567890abcdef12345678',
    block: 1234,
    timestamp: 1705142400,
    events: [
      { type: 'CropListed', time: '10:15 AM' },
      { type: 'OfferMade', time: '10:20 AM' },
      { type: 'OfferAccepted', time: '10:22 AM' },
      { type: 'PaymentCommitted', time: '10:30 AM' },
      { type: 'PaymentCompleted', time: '11:00 AM' },
    ],
  },
}

export default function ConsumerApp() {
  const [scanned, setScanned] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [activeTab, setActiveTab] = useState<'scan' | 'history'>('scan')

  const handleScanQR = () => {
    setScanned(true)
  }

  const retailMarkup = mockTrace.retailPrice - mockTrace.totalFarmerPayment
  const farmerPercentage = (mockTrace.totalFarmerPayment / mockTrace.retailPrice) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-agri-green mb-2">🔍 Consumer Trace</h1>
          <p className="text-slate-600">Scan QR codes on your food packaging to see its complete journey from farm to table.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 bg-white rounded-lg shadow-md p-2">
          <button
            onClick={() => setActiveTab('scan')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
              activeTab === 'scan'
                ? 'bg-agri-green text-white'
                : 'bg-transparent text-slate-700 hover:bg-slate-100'
            }`}
          >
            📱 Scan QR Code
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 px-4 rounded-lg font-bold transition ${
              activeTab === 'history'
                ? 'bg-agri-green text-white'
                : 'bg-transparent text-slate-700 hover:bg-slate-100'
            }`}
          >
            📜 Scan History
          </button>
        </div>

        {/* Scan QR Tab */}
        {activeTab === 'scan' && (
          <>
            {!scanned ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <div className="text-6xl mb-6">📷</div>
                <h2 className="text-2xl font-bold text-agri-green mb-4">Scan QR Code</h2>
                <p className="text-slate-600 mb-8">Point your camera at the QR code on the product packaging</p>

                <a
                  href="/scan-qr"
                  className="inline-block bg-agri-green text-white px-8 py-3 rounded-lg font-bold text-lg hover:opacity-90 transition mb-8"
                >
                  📷 Start Scanning
                </a>

                <div className="mt-8 bg-slate-100 rounded-lg p-6 max-w-xs mx-auto">
                  <p className="text-sm text-slate-600 mb-2">Demo QR Code</p>
                  <div className="bg-white p-4 rounded border-2 border-slate-300 mb-4">
                    <div className="text-center font-mono text-xs">
                      ┌────────────┐
                      <br />
                      │ ██████    │
                      <br />
                      │ ██ ██ ██  │
                      <br />
                      │ ██████    │
                      <br />
                      └────────────┘
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Blockchain Hash: {mockTrace.blockchain.hash}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-md p-8 text-center border-t-4 border-green-500">
                  <div className="text-6xl mb-4">{mockTrace.image}</div>
                  <h2 className="text-3xl font-bold text-agri-green mb-2">{mockTrace.cropName}</h2>
                  <p className="text-slate-600 mb-4">{mockTrace.quality} | AI Verified {mockTrace.aiConfidence}%</p>
                  <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-lg font-bold">
                    ✅ Verified & Fair Trade
                  </div>
                </div>

                {/* Farm Info */}
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h3 className="text-2xl font-bold text-agri-green mb-6">🌾 From The Farm</h3>

                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <p className="text-slate-600 text-sm">Farmer Name</p>
                      <p className="text-xl font-bold">{mockTrace.farmer}</p>
                    </div>
                    <div>
                      <p className="text-slate-600 text-sm">Harvest Date</p>
                      <p className="text-xl font-bold">
                        {new Date(mockTrace.harvestDate).toLocaleDateString()} ({Math.floor((new Date().getTime() - new Date(mockTrace.harvestDate).getTime()) / (1000 * 60 * 60 * 24))} days old)
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-slate-600 text-sm mb-2">Location</p>
                    <button
                      onClick={() => setShowMap(!showMap)}
                      className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-200 transition"
                    >
                      📍 {mockTrace.farmLocation.name}
                    </button>

                    {showMap && (
                      <div className="mt-4 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg p-6 text-center">
                        <p className="text-slate-600 text-sm mb-2">Farm Location</p>
                        <p className="text-2xl mb-3">🌍</p>
                        <p className="font-mono text-sm">{mockTrace.farmLocation.lat.toFixed(2)}, {mockTrace.farmLocation.lng.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Info - Most Important */}
                <div className="bg-white rounded-lg shadow-md p-8 border-l-4 border-green-500">
                  <h3 className="text-2xl font-bold text-agri-green mb-6">💰 Payment (No Cryptocurrency)</h3>

                  <div className="bg-green-50 rounded-lg p-6 mb-6">
                    <p className="text-slate-600 text-sm mb-2">Farmer Received (Bank Transfer)</p>
                    <div className="flex justify-between items-baseline mb-3">
                      <p className="text-4xl font-bold text-green-700">₹{mockTrace.totalFarmerPayment.toLocaleString()}</p>
                      <span className="text-sm text-slate-600">({mockTrace.pricePerKg}₹/kg × {mockTrace.quantity} kg)</span>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex items-center justify-between pb-3 border-b">
                      <span className="text-slate-600">Payment Method:</span>
                      <span className="font-bold">🏦 {mockTrace.paymentMethod}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b">
                      <span className="text-slate-600">From:</span>
                      <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">{mockTrace.buyerUPI}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b">
                      <span className="text-slate-600">To:</span>
                      <span className="font-mono bg-slate-100 px-2 py-1 rounded text-xs">{mockTrace.farmerUPI}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b">
                      <span className="text-slate-600">Initiated:</span>
                      <span className="text-xs">{new Date(mockTrace.paymentInitiated).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3 border-b">
                      <span className="text-slate-600">Completed:</span>
                      <span className="text-xs">{new Date(mockTrace.paymentCompleted).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Reference:</span>
                      <span className="font-mono bg-blue-100 px-2 py-1 rounded text-xs text-blue-800">
                        {mockTrace.transactionRef}
                      </span>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded p-4 text-sm">
                    <p className="text-blue-900 font-medium">ℹ️ About This Payment</p>
                    <p className="text-blue-800 text-xs mt-2">
                      This is a real bank transfer via UPI/NEFT, NOT a cryptocurrency transaction.
                      The blockchain records proof of this payment for transparency and verification only.
                    </p>
                  </div>
                </div>

                {/* Fair Trade Score */}
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h3 className="text-2xl font-bold text-agri-green mb-6">⭐ Fair Trade Score</h3>

                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-600">Farmer's Share</span>
                      <span className="text-2xl font-bold text-green-700">{farmerPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4">
                      <div
                        className="bg-green-500 h-4 rounded-full"
                        style={{ width: `${farmerPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-slate-600 mt-2">Farmer: ₹{mockTrace.totalFarmerPayment.toLocaleString()} | Retail Markup: ₹{retailMarkup.toLocaleString()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-4 text-center">
                      <p className="text-slate-600 text-sm mb-2">Fairness Index</p>
                      <p className="text-3xl font-bold text-green-700">{mockTrace.fairnessScore}%</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                      <p className="text-slate-600 text-sm mb-2">Middleman Cost</p>
                      <p className="text-xl font-bold text-slate-700">Eliminated ✅</p>
                    </div>
                  </div>
                </div>

                {/* Blockchain Transparency */}
                <div className="bg-white rounded-lg shadow-md p-8">
                  <h3 className="text-2xl font-bold text-agri-green mb-6">⛓️ Blockchain Transparency</h3>

                  <div className="bg-slate-50 rounded-lg p-4 mb-6 font-mono text-xs">
                    <p className="text-slate-600 mb-2">Transaction Hash:</p>
                    <p className="text-green-700 break-all font-bold">{mockTrace.blockchain.hash}</p>
                    <p className="text-slate-600 mt-3">Block: {mockTrace.blockchain.block}</p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <p className="font-bold text-slate-700 mb-4">Transaction Timeline:</p>
                    {mockTrace.blockchain.events.map((event, idx) => (
                      <div key={idx} className="flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-green-500" />
                        <span className="text-sm text-slate-700">{event.type} - {event.time}</span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-yellow-50 rounded p-4 text-sm border border-yellow-200">
                    <p className="font-medium text-yellow-900 mb-2">✅ Why Blockchain Without Crypto?</p>
                    <p className="text-yellow-800 text-xs">
                      This blockchain record proves that the payment was initiated and completed.
                      No one—not admin, not middleman, not hackers—can alter this immutable record.
                      The actual money moved through a real bank, not cryptocurrency. Blockchain provides transparency, not payment.
                    </p>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="bg-agri-green text-white rounded-lg shadow-md p-8 text-center">
                  <h3 className="text-2xl font-bold mb-3">✅ Trust Verified</h3>
                  <p className="mb-6">This product comes directly from the farmer at a fair price. Your money supports agriculture.</p>
                  <button
                    onClick={() => setScanned(false)}
                    className="bg-white text-agri-green px-6 py-2 rounded-lg font-bold hover:bg-slate-100 transition"
                  >
                    📱 Scan Another Product
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-agri-green mb-6">📜 Your Scan History</h2>
            <p className="text-slate-600 mb-8">Scanned products will appear here for easy reference.</p>
            
            <div className="bg-slate-50 rounded-lg p-8 text-center">
              <div className="text-4xl mb-4">📱</div>
              <p className="text-slate-600">No scans yet. Start by clicking "Scan QR Code" above!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
