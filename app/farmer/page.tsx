'use client'

import { useState, useEffect } from 'react'

export default function FarmerPortal() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bankAccount: '',
    cropName: '',
    quantity: '',
    quality: 'A',
    pricePerKg: '',
    image: null as File | null,
  })

  const [crops, setCrops] = useState<any[]>([])
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('list') // 'list', 'myCrops', 'offers'
  const [mandiPrices] = useState({
    Rice: 1820,
    Wheat: 2050,
    Tomato: 35,
    Onion: 28,
    Cotton: 5850,
    Potato: 25,
  })

  // Fetch farmer's crops when phone is saved
  useEffect(() => {
    if (formData.phone && formData.phone.length === 10) {
      fetchFarmerCrops(formData.phone)
      fetchFarmerOffers(formData.phone)
    }
  }, [formData.phone])

  const fetchFarmerCrops = async (phone: string) => {
    try {
      const res = await fetch(`/api/marketplace/crops?farmerPhone=${phone}`)
      const data = await res.json()
      if (data.success) {
        setCrops(data.crops)
      }
    } catch (error) {
      console.error('Failed to fetch crops:', error)
    }
  }

  const fetchFarmerOffers = async (phone: string) => {
    try {
      const res = await fetch(`/api/marketplace/offers?farmerPhone=${phone}`)
      const data = await res.json()
      if (data.success) {
        setOffers(data.offers)
      }
    } catch (error) {
      console.error('Failed to fetch offers:', error)
    }
  }

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: any) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }))
  }

  const handleListCrop = async (e: any) => {
    e.preventDefault()
    
    if (!formData.phone || formData.phone.length !== 10) {
      alert('❌ Please enter a valid 10-digit phone number first')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/marketplace/crops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          bankAccount: formData.bankAccount,
          cropName: formData.cropName,
          quantity: formData.quantity,
          quality: formData.quality,
          pricePerKg: formData.pricePerKg,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setCrops([...crops, data.crop])
        setFormData(prev => ({
          ...prev,
          cropName: '',
          quantity: '',
          quality: 'A',
          pricePerKg: '',
        }))
        alert(`✅ Crop listed successfully!\nBlockchain Hash: ${data.crop.blockchainHash}`)
        setActiveTab('myCrops')
      } else {
        alert(`❌ ${data.error}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Failed to list crop')
    } finally {
      setLoading(false)
    }
  }

  const handleRespondToOffer = async (offerId: string, status: 'accepted' | 'rejected') => {
    try {
      const res = await fetch('/api/marketplace/offers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offerId, status }),
      })

      const data = await res.json()
      if (data.success) {
        setOffers(offers.map(o => o.id === offerId ? { ...o, status } : o))
        alert(`✅ Offer ${status}!`)
      }
    } catch (error) {
      alert('❌ Failed to respond to offer')
    }
  }

  const mandiPrice = mandiPrices[formData.cropName as keyof typeof mandiPrices]

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-agri-green mb-8">👨‍🌾 Farmer Portal</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-6 py-3 font-bold transition ${
              activeTab === 'list'
                ? 'text-agri-green border-b-2 border-agri-green'
                : 'text-slate-600 hover:text-agri-green'
            }`}
          >
            📝 List Crop
          </button>
          <button
            onClick={() => setActiveTab('myCrops')}
            className={`px-6 py-3 font-bold transition ${
              activeTab === 'myCrops'
                ? 'text-agri-green border-b-2 border-agri-green'
                : 'text-slate-600 hover:text-agri-green'
            }`}
          >
            🌾 My Crops ({crops.length})
          </button>
          <button
            onClick={() => setActiveTab('offers')}
            className={`px-6 py-3 font-bold transition ${
              activeTab === 'offers'
                ? 'text-agri-green border-b-2 border-agri-green'
                : 'text-slate-600 hover:text-agri-green'
            }`}
          >
            💰 Offers ({offers.length})
          </button>
        </div>

        {/* TAB: List Crop */}
        {activeTab === 'list' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-8">
                <h2 className="text-2xl font-bold mb-6 text-agri-green">List Your Crop</h2>

                <form onSubmit={handleListCrop} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Your Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                        placeholder="Ramesh Kumar"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        maxLength="10"
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                        placeholder="9876543210"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">UPI ID / Bank Account *</label>
                    <input
                      type="text"
                      name="bankAccount"
                      value={formData.bankAccount}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                      placeholder="farmer@okaxis or IBAN"
                      required
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h3 className="font-bold text-lg mb-4">Crop Details</h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Crop Name *</label>
                        <input
                          type="text"
                          name="cropName"
                          value={formData.cropName}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                          placeholder="Rice, Wheat, Tomato..."
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Quantity (kg) *</label>
                        <input
                          type="number"
                          name="quantity"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                          placeholder="500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Price per Kg (₹) *</label>
                        <input
                          type="number"
                          name="pricePerKg"
                          value={formData.pricePerKg}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                          placeholder="37"
                          required
                        />
                        {mandiPrice && (
                          <p className="text-xs text-slate-600 mt-1">
                            📊 Mandi Price: ₹{mandiPrice}/kg
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Expected Quality *</label>
                        <select
                          name="quality"
                          value={formData.quality}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                        >
                          <option value="A">Grade A (Premium)</option>
                          <option value="B">Grade B (Good)</option>
                          <option value="C">Grade C (Standard)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-agri-green text-white py-3 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50"
                  >
                    {loading ? '📝 Listing...' : '📝 List Crop on Blockchain'}
                  </button>
                </form>
              </div>
            </div>

            {/* Mandi Prices */}
            <div className="bg-blue-50 rounded-lg shadow-md p-8 h-fit">
              <h3 className="font-bold text-lg mb-4 text-blue-900">💡 Mandi Prices Today</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>🌾 Rice</span>
                  <span className="font-bold">₹1820</span>
                </div>
                <div className="flex justify-between">
                  <span>🌾 Wheat</span>
                  <span className="font-bold">₹2050</span>
                </div>
                <div className="flex justify-between">
                  <span>🍅 Tomato</span>
                  <span className="font-bold">₹35</span>
                </div>
                <div className="flex justify-between">
                  <span>🧅 Onion</span>
                  <span className="font-bold">₹28</span>
                </div>
              </div>

              <div className="border-t mt-4 pt-4">
                <h4 className="font-bold text-green-900 mb-2">✅ Fair Trade Guarantee</h4>
                <p className="text-xs text-slate-600">
                  Your crop will never sell below 85% of mandi price. Smart contracts enforce fair pricing.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: My Crops */}
        {activeTab === 'myCrops' && (
          <div>
            {crops.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-slate-600 mb-4">No crops listed yet</p>
                <button
                  onClick={() => setActiveTab('list')}
                  className="bg-agri-green text-white px-6 py-2 rounded-lg font-bold hover:opacity-90"
                >
                  List Your First Crop
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {crops.map((crop) => (
                  <div key={crop.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
                    <div className="bg-agri-green/10 p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-agri-green">{crop.cropName}</h3>
                          <p className="text-sm text-slate-600">Grade {crop.quality} • {crop.quantity} kg</p>
                        </div>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-bold">
                          ✅ Active
                        </span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Your Price:</span>
                        <span className="font-bold">₹{crop.pricePerKg}/kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600">Total Value:</span>
                        <span className="font-bold">₹{(crop.quantity * crop.pricePerKg).toLocaleString()}</span>
                      </div>
                      <div className="border-t pt-3 text-xs break-all">
                        <p className="text-slate-600 mb-1">Blockchain Hash:</p>
                        <p className="font-mono text-green-700">{crop.blockchainHash.substring(0, 20)}...</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 border-t">
                      <button className="w-full text-agri-green font-bold py-2 hover:bg-agri-green/5 transition">
                        📊 View {offers.filter(o => o.cropId === crop.id).length} Offers
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: Offers */}
        {activeTab === 'offers' && (
          <div>
            {offers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-slate-600">No offers yet. List a crop to receive offers from buyers!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {offers
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((offer) => (
                    <div key={offer.id} className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                      offer.status === 'pending' ? 'border-yellow-500' :
                      offer.status === 'accepted' ? 'border-green-500' :
                      'border-red-500'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold">Offer from {offer.buyerName}</h3>
                          <p className="text-sm text-slate-600">📱 {offer.buyerPhone}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                          offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          offer.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {offer.status === 'pending' ? '⏳ Pending' : 
                           offer.status === 'accepted' ? '✅ Accepted' :
                           '❌ Rejected'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
                        <div>
                          <p className="text-slate-600">Offer Price</p>
                          <p className="font-bold text-lg">₹{offer.offerPrice}/kg</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Quantity</p>
                          <p className="font-bold text-lg">{offer.quantity || '—'} kg</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Total</p>
                          <p className="font-bold text-lg">₹{(offer.offerPrice * (offer.quantity || 0)).toLocaleString()}</p>
                        </div>
                      </div>

                      {offer.message && (
                        <div className="bg-blue-50 p-3 rounded mb-4 text-sm">
                          <p className="text-slate-700">{offer.message}</p>
                        </div>
                      )}

                      {offer.status === 'pending' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleRespondToOffer(offer.id, 'accepted')}
                            className="flex-1 bg-green-600 text-white py-2 rounded-lg font-bold hover:bg-green-700 transition"
                          >
                            ✅ Accept Offer
                          </button>
                          <button
                            onClick={() => handleRespondToOffer(offer.id, 'rejected')}
                            className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold hover:bg-red-700 transition"
                          >
                            ❌ Reject
                          </button>
                        </div>
                      )}

                      <div className="mt-4 text-xs text-slate-600 break-all">
                        <p className="mb-1">Blockchain Hash: {offer.blockchainHash.substring(0, 30)}...</p>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
