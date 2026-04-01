'use client'

import { useState, useEffect } from 'react'

export default function BuyerPortal() {
  const [crops, setCrops] = useState<any[]>([])
  const [offers, setOffers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('browse') // 'browse', 'myOffers'
  
  const [buyerForm, setBuyerForm] = useState({
    name: '',
    phone: '',
    bankAccount: '',
    message: '',
  })

  const [selectedCrop, setSelectedCrop] = useState<any>(null)
  const [offerPrice, setOfferPrice] = useState('')
  const [buyerPhone, setBuyerPhone] = useState('')

  useEffect(() => {
    fetchAvailableCrops()
  }, [])

  // Fetch offers when switching to "My Offers" tab
  useEffect(() => {
    if (activeTab === 'myOffers' && buyerForm.phone) {
      fetchMyOffers(buyerForm.phone)
    }
  }, [activeTab, buyerForm.phone])

  const fetchAvailableCrops = async () => {
    try {
      const res = await fetch('/api/marketplace/crops')
      const data = await res.json()
      if (data.success) {
        setCrops(data.crops)
      }
    } catch (error) {
      console.error('Failed to fetch crops:', error)
    }
  }

  const fetchMyOffers = async (phone: string) => {
    if (!phone) return
    try {
      const res = await fetch(`/api/marketplace/offers?buyerPhone=${phone}`)
      const data = await res.json()
      if (data.success) {
        // Enrich offers with crop details
        const enrichedOffers = data.offers.map((offer: any) => {
          const crop = crops.find((c: any) => c.id === offer.cropId)
          return {
            ...offer,
            cropName: crop?.cropName || 'Unknown Crop',
            farmerName: crop?.farmerName || 'Unknown Farmer',
          }
        })
        // Merge API offers with local offers, preferring API data for latest status
        const apiOfferIds = new Set(enrichedOffers.map((o: any) => o.id))
        const localOffersNotInAPI = offers.filter((o) => !apiOfferIds.has(o.id))
        setOffers([...enrichedOffers, ...localOffersNotInAPI])
      }
    } catch (error) {
      console.error('Failed to fetch offers:', error)
    }
  }

  const handleMakeOffer = async (e: any) => {
    e.preventDefault()
    
    if (!buyerForm.name || !buyerForm.phone || !offerPrice) {
      alert('❌ Please fill all required fields')
      return
    }

    if (!selectedCrop) {
      alert('❌ Please select a crop')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/marketplace/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cropId: selectedCrop.id,
          buyerName: buyerForm.name,
          buyerPhone: buyerForm.phone,
          bankAccount: buyerForm.bankAccount,
          offerPrice: parseFloat(offerPrice),
          quantity: selectedCrop.quantity,
          message: buyerForm.message,
        }),
      })

      const data = await res.json()
      if (data.success) {
        // Enrich offer with crop details
        const enrichedOffer = {
          ...data.offer,
          cropName: selectedCrop.cropName,
          farmerName: selectedCrop.farmerName,
        }
        setOffers([...offers, enrichedOffer])
        alert(`✅ Offer submitted to farmer!\nBlockchain Hash: ${data.offer.blockchainHash}`)
        setSelectedCrop(null)
        setOfferPrice('')
        setBuyerForm(prev => ({ ...prev, message: '' }))
        setActiveTab('myOffers')
      } else {
        alert(`❌ ${data.error}`)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('❌ Failed to submit offer')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setBuyerForm(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-agri-green mb-8">🏪 Buyer Marketplace</h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-6 py-3 font-bold transition ${
              activeTab === 'browse'
                ? 'text-agri-green border-b-2 border-agri-green'
                : 'text-slate-600 hover:text-agri-green'
            }`}
          >
            🌾 Browse Crops ({crops.length})
          </button>
          <button
            onClick={() => setActiveTab('myOffers')}
            className={`px-6 py-3 font-bold transition ${
              activeTab === 'myOffers'
                ? 'text-agri-green border-b-2 border-agri-green'
                : 'text-slate-600 hover:text-agri-green'
            }`}
          >
            💰 My Offers ({offers.length})
          </button>
        </div>

        {/* TAB: Browse Crops */}
        {activeTab === 'browse' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Crops Grid */}
            <div className="lg:col-span-2">
              {crops.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                  <p className="text-slate-600">Fetching available crops...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {crops.map((crop) => (
                    <div
                      key={crop.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer"
                      onClick={() => setSelectedCrop(crop)}
                    >
                      <div className="bg-agri-green/10 p-4">
                        <h3 className="text-lg font-bold text-agri-green">{crop.cropName}</h3>
                        <p className="text-sm text-slate-600">Grade {crop.quality} • {crop.quantity} kg</p>
                      </div>

                      <div className="p-4 space-y-3">
                        <div>
                          <p className="text-slate-600 text-sm">Farmer</p>
                          <p className="font-bold">{crop.farmerName}</p>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-slate-600 text-sm">Asking Price</p>
                            <p className="text-2xl font-bold text-agri-green">₹{crop.pricePerKg}/kg</p>
                          </div>
                          <div>
                            <p className="text-slate-600 text-sm">Total Value</p>
                            <p className="font-bold">₹{(crop.quantity * crop.pricePerKg).toLocaleString()}</p>
                          </div>
                        </div>

                        <div className="bg-blue-50 p-2 rounded text-xs">
                          <p className="text-slate-700">Listed on blockchain</p>
                          <p className="font-mono text-slate-600">{crop.blockchainHash.substring(0, 25)}...</p>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-4 border-t">
                        <button
                          className="w-full bg-agri-green text-white py-2 rounded-lg font-bold hover:opacity-90 transition"
                        >
                          💰 Make Offer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Offer Form Sidebar */}
            <div>
              {selectedCrop ? (
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-agri-green mb-4">Make Offer</h3>
                  <p className="text-sm text-slate-600 mb-6 pb-4 border-b">
                    {selectedCrop.cropName} from {selectedCrop.farmerName}
                  </p>

                  <form onSubmit={handleMakeOffer} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Your Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={buyerForm.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                        placeholder="Your name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={buyerForm.phone}
                        onChange={handleInputChange}
                        maxLength={10}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                        placeholder="9876543210"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Bank Account / UPI *</label>
                      <input
                        type="text"
                        name="bankAccount"
                        value={buyerForm.bankAccount}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                        placeholder="buyer@okaxis"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Offer Price per Kg (₹) *</label>
                      <input
                        type="number"
                        value={offerPrice}
                        onChange={(e) => setOfferPrice(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                        placeholder={selectedCrop.pricePerKg.toString()}
                        step="0.5"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Message (Optional)</label>
                      <textarea
                        name="message"
                        value={buyerForm.message}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green text-sm"
                        placeholder="Any message for the farmer..."
                        rows={3}
                      />
                    </div>

                    {offerPrice && (
                      <div className="bg-agri-green/10 rounded p-3">
                        <p className="text-slate-600 text-xs mb-1">Total Offer Amount</p>
                        <p className="text-2xl font-bold text-agri-green">
                          ₹{(selectedCrop.quantity * parseFloat(offerPrice)).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-600 mt-2">
                          (₹{parseFloat(offerPrice)}/kg × {selectedCrop.quantity} kg)
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading || !offerPrice}
                      className="w-full bg-agri-green text-white py-2 rounded-lg font-bold hover:opacity-90 transition disabled:opacity-50"
                    >
                      {loading ? '⏳ Submitting...' : '✅ Submit Offer'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCrop(null)
                        setOfferPrice('')
                        setBuyerForm({ name: '', phone: '', bankAccount: '', message: '' })
                      }}
                      className="w-full bg-slate-200 text-slate-800 py-2 rounded-lg font-medium hover:bg-slate-300 transition"
                    >
                      Cancel
                    </button>
                  </form>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                  <h3 className="text-lg font-bold text-agri-green mb-4">💡 How It Works</h3>
                  <div className="space-y-3 text-sm text-slate-700">
                    <p>1. Browse all listed crops from farmers</p>
                    <p>2. Click on a crop to make an offer</p>
                    <p>3. Enter your details and offer price</p>
                    <p>4. Farmer will accept or reject your offer</p>
                    <p>5. All transactions are recorded on blockchain</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: My Offers */}
        {activeTab === 'myOffers' && (
          <div>
            {offers.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-slate-600 mb-4">No offers yet. Browse crops and make an offer!</p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="bg-agri-green text-white px-6 py-2 rounded-lg font-bold hover:opacity-90"
                >
                  Browse Crops
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {offers
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((offer) => (
                    <div
                      key={offer.id}
                      className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                        offer.status === 'pending'
                          ? 'border-yellow-500'
                          : offer.status === 'accepted'
                          ? 'border-green-500'
                          : 'border-red-500'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold">{offer.cropName}</h3>
                          <p className="text-sm text-slate-600">💼 Your Offer</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-bold ${
                            offer.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : offer.status === 'accepted'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {offer.status === 'pending'
                            ? '⏳ Waiting for response'
                            : offer.status === 'accepted'
                            ? '✅ Accepted'
                            : '❌ Rejected'}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-slate-600 text-sm">Your Offer</p>
                          <p className="font-bold text-lg">₹{offer.offerPrice}/kg</p>
                        </div>
                        <div>
                          <p className="text-slate-600 text-sm">Quantity</p>
                          <p className="font-bold text-lg">{offer.quantity} kg</p>
                        </div>
                        <div>
                          <p className="text-slate-600 text-sm">Total Amount</p>
                          <p className="font-bold text-lg">₹{(offer.quantity * offer.offerPrice).toLocaleString()}</p>
                        </div>
                      </div>

                      {offer.message && (
                        <div className="bg-blue-50 p-3 rounded mb-4 text-sm">
                          <p className="text-slate-700">Your message: {offer.message}</p>
                        </div>
                      )}

                      <div className="text-xs text-slate-600 break-all pt-4 border-t">
                        <p className="mb-1">Blockchain Hash: {offer.blockchainHash.substring(0, 40)}...</p>
                        <p className="text-xs text-slate-500">
                          Submitted: {new Date(offer.createdAt).toLocaleDateString()}
                        </p>
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
