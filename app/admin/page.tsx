'use client'

import { useState } from 'react'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('transactions')

  const mockTransactions = [
    {
      id: 1,
      type: 'CropListed',
      actor: 'Ramesh Kumar (Farmer)',
      details: 'Rice 500kg, Grade A, ₹37/kg',
      hash: '0x1234...5678',
      timestamp: '2025-01-13T10:15:00Z',
      status: 'confirmed',
      fraudScore: 2,
    },
    {
      id: 2,
      type: 'OfferMade',
      actor: 'Buyer #123',
      details: '₹37/kg for Rice - FAIR OFFER ✓',
      hash: '0x2345...6789',
      timestamp: '2025-01-13T10:20:00Z',
      status: 'confirmed',
      fraudScore: 5,
    },
    {
      id: 3,
      type: 'OfferBlocked',
      actor: 'Fraudulent Buyer #999',
      details: '₹22.20/kg (60% below market) - BLOCKED',
      hash: '0x3456...7890',
      timestamp: '2025-01-13T09:45:00Z',
      status: 'blocked',
      fraudScore: 98,
    },
    {
      id: 4,
      type: 'PaymentCommitted',
      actor: 'Buyer #123',
      details: 'UPI: ₹18,500 | To: farmer@okaxis',
      hash: '0x4567...8901',
      timestamp: '2025-01-13T10:30:00Z',
      status: 'confirmed',
      fraudScore: 3,
    },
    {
      id: 5,
      type: 'PaymentCompleted',
      actor: 'Farmer Ramesh',
      details: 'Ref: UPI202501131030XXXX',
      hash: '0x5678...9012',
      timestamp: '2025-01-13T11:00:00Z',
      status: 'confirmed',
      fraudScore: 1,
    },
  ]

  const mockAlerts = [
    {
      id: 1,
      severity: 'high',
      type: 'Price Exploitation',
      message: 'Buyer attempted 60% below market price offer - AUTO BLOCKED',
      buyerId: '#999',
      timestamp: '2025-01-13T09:45:00Z',
      action: 'Blocked',
    },
    {
      id: 2,
      severity: 'medium',
      type: 'Quality Mismatch',
      message: 'Buyer requesting Grade A but farmer listed Grade B',
      cropId: '#456',
      timestamp: '2025-01-13T08:20:00Z',
      action: 'Review',
    },
    {
      id: 3,
      severity: 'low',
      type: 'Payment Delay',
      message: 'Previous payment from buyer delayed by 2 hours',
      buyerId: '#456',
      timestamp: '2025-01-12T16:30:00Z',
      action: 'Monitor',
    },
  ]

  const stats = [
    { label: 'Crops Listed', value: 127, icon: '🌾' },
    { label: 'Active Offers', value: 34, icon: '💰' },
    { label: 'Completed Trades', value: 89, icon: '✅' },
    { label: 'Fraud Blocked', value: 12, icon: '🚨' },
  ]

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-4xl font-bold text-agri-green mb-4">📊 Admin Dashboard</h1>
      <p className="text-slate-600 mb-8">Real-time monitoring of all blockchain transactions and fraud alerts</p>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-slate-600 text-sm">{stat.label}</p>
            <p className="text-3xl font-bold text-agri-green">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-6 py-3 font-medium border-b-2 transition ${
            activeTab === 'transactions'
              ? 'border-agri-green text-agri-green'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          📝 Blockchain Transactions
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-6 py-3 font-medium border-b-2 transition ${
            activeTab === 'alerts'
              ? 'border-agri-green text-agri-green'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          🚨 Fraud Alerts
        </button>
        <button
          onClick={() => setActiveTab('blockchain')}
          className={`px-6 py-3 font-medium border-b-2 transition ${
            activeTab === 'blockchain'
              ? 'border-agri-green text-agri-green'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          ⛓️ Blockchain Status
        </button>
      </div>

      {/* Transactions Tab */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">Actor</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">Details</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">Fraud Score</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">Hash</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">Time</th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((tx) => (
                  <tr key={tx.id} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-medium">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        tx.status === 'blocked'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">{tx.actor}</td>
                    <td className="px-4 py-3 text-sm text-slate-800">{tx.details}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              tx.fraudScore > 50 ? 'bg-red-500' : tx.fraudScore > 25 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${tx.fraudScore}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold">{tx.fraudScore}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-blue-600 hover:cursor-pointer">
                      {tx.hash} →
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {new Date(tx.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Fraud Alerts Tab */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          {mockAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg shadow-md p-6 border-l-4 ${
                alert.severity === 'high'
                  ? 'bg-red-50 border-red-500'
                  : alert.severity === 'medium'
                  ? 'bg-yellow-50 border-yellow-500'
                  : 'bg-blue-50 border-blue-500'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      alert.severity === 'high'
                        ? 'bg-red-200 text-red-800'
                        : alert.severity === 'medium'
                        ? 'bg-yellow-200 text-yellow-800'
                        : 'bg-blue-200 text-blue-800'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                    <span className="font-bold text-slate-900">{alert.type}</span>
                  </div>
                  <p className="text-slate-700 font-medium mb-2">{alert.message}</p>
                  <p className="text-xs text-slate-600">
                    {alert.buyerId && `Buyer: ${alert.buyerId}`}
                    {alert.cropId && `Crop: ${alert.cropId}`}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded text-sm font-bold cursor-pointer hover:opacity-80 transition ${
                  alert.action === 'Blocked'
                    ? 'bg-red-200 text-red-800'
                    : 'bg-slate-200 text-slate-800'
                }`}>
                  {alert.action}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {new Date(alert.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Blockchain Status Tab */}
      {activeTab === 'blockchain' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-bold text-agri-green mb-6">Ganache Status</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-slate-600">Network</span>
                <span className="font-bold">
                  <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  Running (Hardhat)
                </span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-slate-600">RPC URL</span>
                <span className="font-mono text-sm bg-slate-100 px-2 py-1 rounded">http://localhost:8545</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-slate-600">Chain ID</span>
                <span className="font-bold">1337</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-slate-600">Current Block</span>
                <span className="font-bold">127</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-slate-600">Block Time</span>
                <span className="font-bold">0s (Instant Mining)</span>
              </div>
              <div className="flex items-center justify-between pb-3 border-b">
                <span className="text-slate-600">Connected Wallets</span>
                <span className="font-bold">10 accounts</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Gas Price</span>
                <span className="font-bold">0 Wei (Free)</span>
              </div>
            </div>

            <button className="w-full mt-6 bg-slate-200 text-slate-800 py-2 rounded-lg font-medium hover:bg-slate-300 transition">
              📊 View Block Explorer
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8">
            <h3 className="text-xl font-bold text-agri-green mb-6">Smart Contracts</h3>

            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">CropMarketplace.sol</p>
                <p className="font-mono text-xs text-blue-700 mb-2">0x1234567890abcdef1234567890abcdef12345678</p>
                <div className="flex gap-2 text-xs">
                  <span className="bg-blue-200 text-blue-800 px-2 py-1 rounded">Deployed</span>
                  <span className="bg-green-200 text-green-800 px-2 py-1 rounded">Active</span>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <p className="text-sm text-slate-600 mb-1">PriceOracle.sol</p>
                <p className="font-mono text-xs text-purple-700 mb-2">0x87654321fedcba0987654321fedcba0987654321</p>
                <div className="flex gap-2 text-xs">
                  <span className="bg-purple-200 text-purple-800 px-2 py-1 rounded">Deployed</span>
                  <span className="bg-green-200 text-green-800 px-2 py-1 rounded">Active</span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-slate-50 rounded-lg p-4">
              <p className="text-sm font-bold text-slate-900 mb-2">Event Activity</p>
              <div className="text-xs space-y-1 text-slate-700">
                <p>✅ CropListed (event)</p>
                <p>✅ OfferMade (event)</p>
                <p>✅ OfferAccepted (event)</p>
                <p>✅ PaymentCommitted (event)</p>
                <p>✅ PaymentCompleted (event)</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
