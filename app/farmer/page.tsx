'use client'

import { useState } from 'react'

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
  const [loading, setLoading] = useState(false)

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: any) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] }))
  }

  const handleListCrop = async (e: any) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate blockchain recording
      const newCrop = {
        id: crops.length + 1,
        ...formData,
        timestamp: new Date().toISOString(),
        blockchainHash: '0x' + Math.random().toString(16).substr(2, 40),
      }

      setCrops([...crops, newCrop])
      setFormData({
        name: formData.name,
        phone: formData.phone,
        bankAccount: formData.bankAccount,
        cropName: '',
        quantity: '',
        quality: 'A',
        pricePerKg: '',
        image: null,
      })

      alert(`✅ Crop listed successfully!\nBlockchain Hash: ${newCrop.blockchainHash}`)
    } catch (error) {
      console.error('Error listing crop:', error)
      alert('❌ Failed to list crop')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-4xl font-bold text-agri-green mb-8">👨‍🌾 Farmer Portal</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold mb-6 text-agri-green">List Your Crop</h2>

            <form onSubmit={handleListCrop} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Your Name</label>
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
                  <label className="block text-sm font-medium mb-2">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                    placeholder="98765432100"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">UPI ID / Bank Account</label>
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
                    <label className="block text-sm font-medium mb-2">Crop Name</label>
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
                    <label className="block text-sm font-medium mb-2">Quantity (kg)</label>
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
                    <label className="block text-sm font-medium mb-2">Price per Kg (₹)</label>
                    <input
                      type="number"
                      name="pricePerKg"
                      value={formData.pricePerKg}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                      placeholder="37"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Expected Quality</label>
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

                <div className="mt-4">
                  <label className="block text-sm font-medium mb-2">Upload Crop Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-agri-green"
                    required
                  />
                  {formData.image && (
                    <p className="text-sm text-green-600 mt-2">✅ {formData.image.name}</p>
                  )}
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

        {/* Info Panel */}
        <div className="bg-blue-50 rounded-lg shadow-md p-8 h-fit">
          <h3 className="font-bold text-lg mb-4 text-blue-900">💡 Mandi Prices Today</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>🌾 Rice (per quintal)</span>
              <span className="font-bold">₹1,820</span>
            </div>
            <div className="flex justify-between">
              <span>🌾 Wheat (per quintal)</span>
              <span className="font-bold">₹2,050</span>
            </div>
            <div className="flex justify-between">
              <span>🍅 Tomato (per kg)</span>
              <span className="font-bold">₹35</span>
            </div>
            <div className="flex justify-between">
              <span>🧅 Onion (per kg)</span>
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

      {/* Listed Crops */}
      {crops.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-agri-green mb-6">Your Listed Crops</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {crops.map((crop) => (
              <div key={crop.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-agri-green">{crop.cropName}</h3>
                    <p className="text-sm text-slate-600">Grade {crop.quality}</p>
                  </div>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-lg text-sm font-bold">
                    ✅ Listed
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-slate-600">Quantity</p>
                    <p className="font-bold">{crop.quantity} kg</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Price</p>
                    <p className="font-bold">₹{parseInt(crop.pricePerKg)}/kg</p>
                  </div>
                </div>

                <div className="bg-slate-100 rounded p-3 text-xs break-all">
                  <p className="text-slate-600 mb-1">Blockchain Hash:</p>
                  <p className="font-mono text-green-700">{crop.blockchainHash}</p>
                </div>

                <button className="w-full mt-4 bg-slate-200 text-slate-800 py-2 rounded-lg font-medium hover:bg-slate-300 transition">
                  📊 View Offers
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
