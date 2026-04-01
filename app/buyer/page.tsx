'use client'

import { useState } from 'react'

const mockCrops = [
  {
    id: 1,
    cropName: 'Rice (Basmati)',
    quality: 'A',
    quantity: 500,
    pricePerKg: 37,
    mandiPrice: 36.4,
    farmerName: 'Ramesh Kumar',
    location: 'Tumkur, Karnataka',
    aiConfidence: 94,
    image: '🌾',
    exploitationScore: 'Fair ✅',
  },
  {
    id: 2,
    cropName: 'Tomato',
    quality: 'B',
    quantity: 300,
    pricePerKg: 28,
    mandiPrice: 35,
    farmerName: 'Priya Sharma',
    location: 'Hosur, Tamil Nadu',
    aiConfidence: 87,
    image: '🍅',
    exploitationScore: 'Good ✅',
  },
  {
    id: 3,
    cropName: 'Onion',
    quality: 'A',
    quantity: 800,
    pricePerKg: 26,
    mandiPrice: 28,
    farmerName: 'Hari Patel',
    location: 'Bengaluru Rural, Karnataka',
    aiConfidence: 92,
    image: '🧅',
    exploitationScore: 'Fair ✅',
  },
]

export default function BuyerPortal() {
  const [offers, setOffers] = useState<any[]>([])
  const [selectedCrop, setSelectedCrop] = useState<any>(null)
  const [offerPrice, setOfferPrice] = useState('')
  const [bankAccount, setBankAccount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleMakeOffer = async (crop: any) => {
    setLoading(true)
    try {
      const minAllowedPrice = crop.mandiPrice * 0.85

      if (parseFloat(offerPrice) < minAllowedPrice) {
        alert(
          `❌ Offer too low!\nMinimum allowed: ₹${minAllowedPrice.toFixed(2)}/kg (85% of mandi rate)\nYour offer: ₹${offerPrice}/kg`
        )
        setLoading(false)
        return
      }

      const totalAmount = parseInt(crop.quantity) * parseFloat(offerPrice)

      const newOffer = {
        id: offers.length + 1,
        cropId: crop.id,
        cropName: crop.cropName,
        farmerName: crop.farmerName,
        offerPrice: parseFloat(offerPrice),
        totalAmount,
        bankAccount,
        timestamp: new Date().toISOString(),
        status: 'pending',
        blockchainHash: '0x' + Math.random().toString(16).substr(2, 40),
        fraudScore: Math.random() * 40, // Low fraud score for fair offers
      }

      setOffers([...offers, newOffer])
      alert(`✅ Offer submitted!\nBlockchain Hash: ${newOffer.blockchainHash}`)
      setSelectedCrop(null)
      setOfferPrice('')
      setBankAccount('')
    } catch (error) {
      alert('❌ Error submitting offer')
    } finally {
      setLoading(false)
    }
  }

  const handleRogueBuyerOffer = () => {
    const crop = mockCrops[0]
    const minAllowedPrice = crop.mandiPrice * 0.85
    const roguePrice = crop.mandiPrice * 0.60 // 40% below market - scam attempt

    alert(
      `🚨 FRAUD DETECTED!\n\nAttempted offer: ₹${roguePrice.toFixed(2)}/kg\nFair market rate: ₹${crop.mandiPrice.toFixed(2)}/kg\nMinimum allowed: ₹${minAllowedPrice.toFixed(2)}/kg\n\n❌ OFFER BLOCKED by smart contract`
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-4xl font-bold text-agri-green mb-8">🏪 Buyer Marketplace</h1>

      {/* Demo Buttons */}
      <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800 mb-3">
          <strong>Demo:</strong> Try making a legit offer below, or click "Test Fraud Block" to see fraud detection.
        </p>
        <button
          onClick={handleRogueBuyerOffer}
          className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
        >
          🚨 Test Fraud Block (60% below market)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Marketplace */}
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-6 text-agri-green">Available Crops</h2>
          <div className="space-y-6">
            {mockCrops.map((crop) => (
              <div key={crop.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-4xl mb-2">{crop.image}</div>
                    <h3 className="text-2xl font-bold text-agri-green">{crop.cropName}</h3>
                    <p className="text-slate-600">Grade {crop.quality}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-agri-gold">₹{crop.pricePerKg}</div>
                    <p className="text-sm text-slate-600">per kg</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-slate-600">Farmer</p>
                    <p className="font-medium">{crop.farmerName}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Quantity</p>
                    <p className="font-medium">{crop.quantity} kg</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Location</p>
                    <p className="font-medium">{crop.location}</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded p-3 mb-4 text-sm">
                  <p className="text-slate-600 mb-2">
                    <strong>Fair Trade Check:</strong> {crop.exploitationScore}
                  </p>
                  <div className="flex justify-between text-xs text-slate-600">
                    <span>Mandi rate: ₹{crop.mandiPrice}/kg</span>
                    <span>AI Quality: {crop.aiConfidence}% confidence</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCrop(crop)}
                  className="w-full bg-agri-green text-white py-2 rounded-lg font-medium hover:opacity-90 transition"
                >
                  💰 Make Offer
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Offer Form / My Offers */}
        <div>
          {selectedCrop ? (
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold text-agri-green mb-4">Make Offer</h3>
              <p className="text-sm text-slate-600 mb-4">{selectedCrop.cropName}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Your Bank Account / UPI</label>
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agri-green"
                    placeholder="buyer@icici"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Offer Price per Kg (₹)
                  </label>
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-agri-green"
                    placeholder={selectedCrop.pricePerKg.toString()}
                    step="0.5"
                  />
                  <p className="text-xs text-slate-600 mt-1">
                    Min: ₹{(selectedCrop.mandiPrice * 0.85).toFixed(2)} (85% of mandi rate)
                  </p>
                </div>

                {offerPrice && (
                  <div className="bg-slate-100 rounded p-3 text-sm">
                    <p className="text-slate-600 mb-2">Total Amount:</p>
                    <p className="text-2xl font-bold text-agri-green">
                      ₹{(parseInt(selectedCrop.quantity) * parseFloat(offerPrice)).toLocaleString()}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => handleMakeOffer(selectedCrop)}
                  disabled={loading || !offerPrice || !bankAccount}
                  className="w-full bg-agri-green text-white py-2 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50"
                >
                  {loading ? '⏳ Submitting...' : '✅ Submit Offer'}
                </button>

                <button
                  onClick={() => setSelectedCrop(null)}
                  className="w-full bg-slate-200 text-slate-800 py-2 rounded-lg font-medium hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h3 className="text-xl font-bold text-agri-green mb-4">My Offers</h3>

              {offers.length === 0 ? (
                <p className="text-sm text-slate-600">No offers yet. Select a crop to make an offer.</p>
              ) : (
                <div className="space-y-4">
                  {offers.map((offer) => (
                    <div key={offer.id} className="border rounded-lg p-4 text-sm">
                      <p className="font-bold text-agri-green mb-2">{offer.cropName}</p>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-600">₹{offer.offerPrice}/kg</span>
                        <span className={`text-xs font-bold ${offer.status === 'pending' ? 'text-yellow-600' : 'text-green-600'}`}>
                          {offer.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">{offer.blockchainHash}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
