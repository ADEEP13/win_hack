'use client'

import { useState, useEffect } from 'react'
import io, { Socket } from 'socket.io-client'

interface USSDRequest {
  id: string
  from: string
  to: string
  amount: number
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
}

interface SocketRequestPayload {
  requestId: string
  request: USSDRequest
}

interface SocketResponsePayload {
  requestId: string
  action: 'accept' | 'reject'
}

interface SocketErrorPayload {
  error: string
}

interface Phone1State {
  phoneNumber: string
  menuState: 'main' | 'sendMoney' | 'enterRecipient' | 'enterAmount' | 'enterPin' | 'waiting' | 'viewOffers' | 'listCrop' | 'marketRates'
  display: string
  recipientPhone: string
  amount: string
  pin: string
  inputBuffer: string
}

interface Phone2State {
  phoneNumber: string
  display: string
  incomingRequest: USSDRequest | null
  selectedAction: 'accept' | 'reject' | null
}

const MOCK_USERS = {
  '9876543210': 'Raj Kumar',
  '9988776655': 'Priya Singh',
  '8765432109': 'Amit Patel',
}

interface Offer {
  id: string
  cropName: string
  farmer: string
  pricePerKg: number
  quantity: number
  status: string
}

interface Crop {
  id: string
  name: string
  season: string
  harvestTime: string
  priceRange: string
}

interface MarketRate {
  cropName: string
  pricePerKg: number
  change: string
  trend: string
}

export default function USSDSimulation() {
  const [phone1, setPhone1] = useState<Phone1State>({
    phoneNumber: '9876543210',
    menuState: 'main',
    display: 'JanDhan Plus 🌾\n\n1. Send Money\n2. View Offers\n3. List Crop\n4. Market Rates\n0. Exit',
    recipientPhone: '',
    amount: '',
    pin: '',
    inputBuffer: '',
  })

  const [phone2, setPhone2] = useState<Phone2State>({
    phoneNumber: '9988776655',
    display: 'Welcome 🌾\nPress any key...',
    incomingRequest: null,
    selectedAction: null,
  })

  const [socket, setSocket] = useState<Socket | null>(null)
  const [connectionStatus, setConnectionStatus] = useState('connecting...')
  
  // Menu data state
  const [offers, setOffers] = useState<Offer[]>([])
  const [crops, setCrops] = useState<Crop[]>([])
  const [marketRates, setMarketRates] = useState<MarketRate[]>([])
  const [menuPage, setMenuPage] = useState(0) // For pagination in long lists

  // Initialize WebSocket connection
  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_VOICE_API_URL || `${window.location.protocol}//${window.location.hostname}:4000`
    const newSocket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })

    newSocket.on('connect', () => {
      console.log('✅ Connected to USSD server')
      setConnectionStatus('connected')
      // Register both phones
      newSocket.emit('register_phone', phone1.phoneNumber)
      newSocket.emit('register_phone', phone2.phoneNumber)
    })

    newSocket.on('phone_registered', (data: { success: boolean; phoneNumber: string }) => {
      console.log('📱 Phone registered:', data)
    })

    newSocket.on('ussd_sent', (data: SocketRequestPayload) => {
      console.log('📤 USSD sent:', data)
      setPhone1((prev) => ({
        ...prev,
        display: `✅ Request Sent!\n\nTo: ${data.request.to}\nAmount: ₹${data.request.amount}\n\nWaiting for approval...`,
        menuState: 'waiting',
        inputBuffer: '',
      }))
    })

    newSocket.on('ussd_incoming', (data: SocketRequestPayload) => {
      console.log('📥 Incoming request:', data)
      setPhone2((prev) => ({
        ...prev,
        incomingRequest: data.request,
        display: `📥 Incoming Request\n\nFrom: ${data.request.from}\nAmount: ₹${data.request.amount}\n\n1. Accept\n2. Reject`,
        selectedAction: null,
      }))
    })

    newSocket.on('ussd_response_received', (data: SocketResponsePayload) => {
      const action = data.action === 'accept' ? '✅ Accepted' : '❌ Rejected'
      setPhone1((prev) => ({
        ...prev,
        display: `${action}\n\nTransaction ${action.toLowerCase()}\n\nPress 0 for main menu`,
        inputBuffer: '',
      }))
    })

    newSocket.on('ussd_error', (data: SocketErrorPayload) => {
      setPhone1((prev) => ({
        ...prev,
        display: `❌ Error\n\n${data.error}\n\nPress 0 for main menu`,
        inputBuffer: '',
      }))
    })

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from USSD server')
      setConnectionStatus('disconnected')
    })

    setSocket(newSocket)

    return () => {
      newSocket.close()
    }
  }, [])

  // Fetch menu data from APIs
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const [offersRes, cropsRes, ratesRes] = await Promise.all([
          fetch('/api/ussd/offers'),
          fetch('/api/ussd/crops'),
          fetch('/api/ussd/market-rates'),
        ])

        if (offersRes.ok) {
          const data = await offersRes.json()
          setOffers(data.offers)
        }

        if (cropsRes.ok) {
          const data = await cropsRes.json()
          setCrops(data.crops)
        }

        if (ratesRes.ok) {
          const data = await ratesRes.json()
          setMarketRates(data.rates)
        }
      } catch (error) {
        console.error('Failed to fetch menu data:', error)
      }
    }

    fetchMenuData()
  }, [])

  // Format offers for USSD display (max 2 items per screen)
  const formatOffers = (page: number = 0) => {
    const itemsPerPage = 2
    const start = page * itemsPerPage
    const end = start + itemsPerPage
    const pageOffers = offers.slice(start, end)
    
    let display = 'Active Offers:\n\n'
    pageOffers.forEach((offer, idx) => {
      display += `${start + idx + 1}. ${offer.cropName}\n   ₹${offer.pricePerKg}/kg\n`
    })
    display += `\n0. Back`
    return display
  }

  // Format crops for USSD display
  const formatCrops = (page: number = 0) => {
    const itemsPerPage = 1
    const start = page * itemsPerPage
    const end = start + itemsPerPage
    const pageCrops = crops.slice(start, end)
    
    let display = ''
    pageCrops.forEach((crop) => {
      display += `${crop.name}\nSeason: ${crop.season}\nHarvest: ${crop.harvestTime}\nPrice: ${crop.priceRange}\n`
    })
    display += `\n1. Next | 2. Prev\n0. Back`
    return display
  }

  // Format market rates for USSD display
  const formatMarketRates = (page: number = 0) => {
    const itemsPerPage = 3
    const start = page * itemsPerPage
    const end = start + itemsPerPage
    const pageRates = marketRates.slice(start, end)
    
    let display = `Market Rates (${start + 1}-${Math.min(end, marketRates.length)}):\n\n`
    pageRates.forEach((rate) => {
      display += `${rate.cropName}: ₹${rate.pricePerKg}\n${rate.trend} ${rate.change}\n`
    })
    display += `\n1. Next | 0. Back`
    return display
  }

  // Handle Phone 1 Keypad Input
  const handlePhone1Keypad = (key: string) => {
    let newState = { ...phone1 }

    if (key === '*') {
      // Clear input
      newState.inputBuffer = ''
      newState.display = 'JanDhan Plus 🌾\n\n1. Send Money\n2. View Offers\n3. List Crop\n4. Market Rates\n0. Exit'
      newState.menuState = 'main'
      setPhone1(newState)
      setMenuPage(0)
      return
    }

    if (key === '#') {
      // Submit input - process based on current menu state
      if (newState.menuState === 'main') {
        if (newState.inputBuffer === '1') {
          newState.menuState = 'enterRecipient'
          newState.display = `Enter receiver phone\nnumber (10 digits):\n\n${newState.inputBuffer ? newState.inputBuffer + (newState.inputBuffer.length < 10 ? '_' : '') : '_________'}`
          newState.inputBuffer = ''
        } else if (newState.inputBuffer === '2') {
          newState.menuState = 'viewOffers'
          newState.display = formatOffers(0)
          newState.inputBuffer = ''
          setMenuPage(0)
        } else if (newState.inputBuffer === '3') {
          newState.menuState = 'listCrop'
          newState.display = formatCrops(0)
          newState.inputBuffer = ''
          setMenuPage(0)
        } else if (newState.inputBuffer === '4') {
          newState.menuState = 'marketRates'
          newState.display = formatMarketRates(0)
          newState.inputBuffer = ''
          setMenuPage(0)
        } else if (newState.inputBuffer === '0') {
          newState.display = 'Thank you!\nGoodbye 🌾'
          newState.inputBuffer = ''
        }
      } else if (newState.menuState === 'enterRecipient') {
        if (newState.inputBuffer.length === 10) {
          newState.recipientPhone = newState.inputBuffer
          newState.menuState = 'enterAmount'
          newState.display = `Sending to:\n${MOCK_USERS[newState.inputBuffer as keyof typeof MOCK_USERS] || 'Unknown'}\n\nEnter amount (₹):\n${newState.inputBuffer ? newState.inputBuffer + '_' : '_'}`
          newState.inputBuffer = ''
        } else {
          newState.display = `❌ Invalid phone\nMust be 10 digits\nEntered: ${newState.inputBuffer.length}/10\n\nPress 0 to exit`
          newState.inputBuffer = ''
        }
      } else if (newState.menuState === 'enterAmount') {
        if (newState.inputBuffer && !isNaN(Number(newState.inputBuffer))) {
          newState.amount = newState.inputBuffer
          newState.menuState = 'enterPin'
          newState.display = `Amount: ₹${newState.amount}\nRecipient:\n${newState.recipientPhone}\n\nEnter PIN:`
          newState.inputBuffer = ''
        } else {
          newState.display = '❌ Invalid amount\n\nPress 0 to exit'
          newState.inputBuffer = ''
        }
      } else if (newState.menuState === 'enterPin') {
        if (newState.inputBuffer.length === 4) {
          newState.pin = newState.inputBuffer
          newState.display = `📤 Sending...\n\nTo: ${newState.recipientPhone}\nAmount: ₹${newState.amount}`
          newState.inputBuffer = ''

          // Send request to backend via Socket.IO
          if (socket) {
            socket.emit('ussd_request', {
              from: newState.phoneNumber,
              to: newState.recipientPhone,
              amount: parseInt(newState.amount),
              pin: newState.pin,
            })
          }

          newState.menuState = 'main'
          newState.amount = ''
          newState.pin = ''
          newState.recipientPhone = ''
        } else {
          newState.display = `❌ Invalid PIN\n4 digits required\nEntered: ${newState.inputBuffer.length}/4\n\nPress 0 to exit`
          newState.inputBuffer = ''
        }
      } else if (newState.menuState === 'viewOffers') {
        if (newState.inputBuffer === '0') {
          newState.menuState = 'main'
          newState.display = 'JanDhan Plus 🌾\n\n1. Send Money\n2. View Offers\n3. List Crop\n4. Market Rates\n0. Exit'
          newState.inputBuffer = ''
          setMenuPage(0)
        }
      } else if (newState.menuState === 'listCrop') {
        if (newState.inputBuffer === '1') {
          const nextPage = menuPage + 1
          if (nextPage < Math.ceil(crops.length / 1)) {
            setMenuPage(nextPage)
            newState.display = formatCrops(nextPage)
          }
          newState.inputBuffer = ''
        } else if (newState.inputBuffer === '2') {
          const prevPage = menuPage - 1
          if (prevPage >= 0) {
            setMenuPage(prevPage)
            newState.display = formatCrops(prevPage)
          }
          newState.inputBuffer = ''
        } else if (newState.inputBuffer === '0') {
          newState.menuState = 'main'
          newState.display = 'JanDhan Plus 🌾\n\n1. Send Money\n2. View Offers\n3. List Crop\n4. Market Rates\n0. Exit'
          newState.inputBuffer = ''
          setMenuPage(0)
        }
      } else if (newState.menuState === 'marketRates') {
        if (newState.inputBuffer === '1') {
          const nextPage = menuPage + 1
          if (nextPage < Math.ceil(marketRates.length / 3)) {
            setMenuPage(nextPage)
            newState.display = formatMarketRates(nextPage)
          }
          newState.inputBuffer = ''
        } else if (newState.inputBuffer === '0') {
          newState.menuState = 'main'
          newState.display = 'JanDhan Plus 🌾\n\n1. Send Money\n2. View Offers\n3. List Crop\n4. Market Rates\n0. Exit'
          newState.inputBuffer = ''
          setMenuPage(0)
        }
      }
      setPhone1(newState)
      return
    }

    // Regular number input - always update display with input buffer shown inside the screen
    if (!isNaN(Number(key))) {
      newState.inputBuffer += key

      if (newState.menuState === 'main') {
        // Show input in main menu
        newState.display = `JanDhan Plus 🌾\n\n1. Send Money\n2. View Offers\n3. List Crop\n4. Market Rates\n0. Exit\n\nInput: ${newState.inputBuffer}`
      } else if (newState.menuState === 'enterRecipient') {
        newState.display = `Enter receiver phone\nnumber (10 digits):\n\n${newState.inputBuffer}${newState.inputBuffer.length < 10 ? '_' : ''}`
      } else if (newState.menuState === 'enterAmount') {
        newState.display = `Enter amount (₹):\n\n${newState.inputBuffer}_`
      } else if (newState.menuState === 'enterPin') {
        newState.display = `Enter PIN (4 digits):\n\n${'*'.repeat(newState.inputBuffer.length)}${newState.inputBuffer.length < 4 ? '_' : ''}`
      }

      setPhone1(newState)
    }
  }

  // Handle Phone 2 Keypad Input
  const handlePhone2Keypad = (key: string) => {
    let newState = { ...phone2 }

    if (!newState.incomingRequest) {
      if (key === '*') {
        newState.display = 'Welcome 🌾\nPress any key...'
      }
      setPhone2(newState)
      return
    }

    if (key === '1') {
      // Accept
      newState.display = '✅ Accepting...'
      newState.selectedAction = 'accept'

      if (socket) {
        socket.emit('ussd_respond', {
          requestId: newState.incomingRequest.id,
          action: 'accept',
        })
      }

      setTimeout(() => {
        newState.display = '✅ Request Accepted!\n\n✅ Payment confirmed\n\nPress 0 to exit'
        newState.incomingRequest = null
        setPhone2(newState)
      }, 1000)
    } else if (key === '2') {
      // Reject
      newState.display = '⏳ Rejecting...'
      newState.selectedAction = 'reject'

      if (socket) {
        socket.emit('ussd_respond', {
          requestId: newState.incomingRequest.id,
          action: 'reject',
        })
      }

      setTimeout(() => {
        newState.display = '❌ Request Rejected\n\nPress 0 to exit'
        newState.incomingRequest = null
        setPhone2(newState)
      }, 1000)
    } else if (key === '0') {
      newState.display = 'Welcome 🌾\nPress any key...'
      newState.incomingRequest = null
      newState.selectedAction = null
    }

    setPhone2(newState)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">📱 USSD Dual-Phone Simulator</h1>
          <p className="text-slate-300">Real-time peer-to-peer USSD transactions simulation</p>
          <div className="mt-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
            } text-white`}>
              {connectionStatus === 'connected' ? '🟢 Connected' : '🔴 ' + connectionStatus}
            </span>
          </div>
        </div>

        {/* Main Layout: Two Phones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Phone 1 - Sender */}
          <div className="flex justify-center">
            <div className="w-80 bg-gradient-to-b from-gray-900 to-black rounded-3xl shadow-2xl border-8 border-gray-800 overflow-hidden">
              {/* Phone Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-3 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">📤 SENDER</span>
                  <span className="text-xs">{phone1.phoneNumber}</span>
                </div>
              </div>

              {/* Display Screen */}
              <div className="bg-gray-900 p-4 m-4 rounded-lg border-2 border-gray-700 min-h-60 max-h-60 overflow-hidden flex flex-col justify-start">
                <div className="text-green-400 font-mono text-sm whitespace-pre-wrap break-words">
                  {phone1.display}
                </div>
              </div>

              {/* Numeric Keypad */}
              <div className="bg-black p-4">
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => handlePhone1Keypad(String(num))}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 active:scale-95"
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    onClick={() => handlePhone1Keypad('*')}
                    className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 active:scale-95"
                  >
                    * CLR
                  </button>
                  <button
                    onClick={() => handlePhone1Keypad('0')}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 active:scale-95"
                  >
                    0
                  </button>
                  <button
                    onClick={() => handlePhone1Keypad('#')}
                    className="bg-green-700 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 active:scale-95"
                  >
                    # OK
                  </button>
                </div>
              </div>

              {/* Phone Bottom */}
              <div className="bg-gray-900 h-4"></div>
            </div>
          </div>

          {/* Phone 2 - Receiver */}
          <div className="flex justify-center">
            <div className="w-80 bg-gradient-to-b from-gray-900 to-black rounded-3xl shadow-2xl border-8 border-gray-800 overflow-hidden">
              {/* Phone Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 text-white">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">📥 RECEIVER</span>
                  <span className="text-xs">{phone2.phoneNumber}</span>
                </div>
              </div>

              {/* Display Screen */}
              <div className="bg-gray-900 p-4 m-4 rounded-lg border-2 border-gray-700 min-h-60 max-h-60 overflow-hidden flex flex-col justify-start">
                <div className={`font-mono text-sm whitespace-pre-wrap break-words ${
                  phone2.incomingRequest ? 'text-yellow-400' : 'text-green-400'
                }`}>
                  {phone2.display}
                </div>
              </div>

              {/* Request Status Light */}
              {phone2.incomingRequest && (
                <div className="bg-red-900 px-4 py-2 animate-pulse">
                  <div className="text-red-400 font-mono text-center text-sm">🔔 INCOMING...</div>
                </div>
              )}

              {/* Numeric Keypad */}
              <div className="bg-black p-4">
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => handlePhone2Keypad(String(num))}
                      className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 active:scale-95 disabled:opacity-50"
                      disabled={!phone2.incomingRequest && num !== 0}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2">
                  <button
                    onClick={() => handlePhone2Keypad('*')}
                    className="bg-red-700 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 active:scale-95"
                  >
                    * CLR
                  </button>
                  <button
                    onClick={() => handlePhone2Keypad('0')}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 active:scale-95"
                  >
                    0
                  </button>
                  <button
                    onClick={() => handlePhone2Keypad('#')}
                    className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 active:scale-95 disabled:opacity-50"
                    disabled={!phone2.incomingRequest}
                  >
                    # OK
                  </button>
                </div>
              </div>

              {/* Phone Bottom */}
              <div className="bg-gray-900 h-4"></div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-white">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3">📋 How to Use</h3>
            <ol className="text-sm space-y-2 text-slate-300">
              <li><strong>Send Money:</strong> Press 1 → Enter recipient → Amount → PIN (1234)</li>
              <li><strong>View Offers:</strong> Press 2 → See active crop offers</li>
              <li><strong>List Crops:</strong> Press 3 → Browse crop info & prices</li>
              <li><strong>Market Rates:</strong> Press 4 → Check daily market rates</li>
              <li>Press # to submit, * to clear</li>
              <li><strong>Receiver</strong> gets notification → Press 1 Accept or 2 Reject</li>
            </ol>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3">👥 Test Users</h3>
            <div className="text-sm space-y-2 text-slate-300">
              <div>
                <strong>Raj Kumar</strong>
                <div className="text-xs">📱 9876543210 | PIN: 1234</div>
              </div>
              <div>
                <strong>Priya Singh</strong>
                <div className="text-xs">📱 9988776655 | PIN: 5678</div>
              </div>
              <div>
                <strong>Amit Patel</strong>
                <div className="text-xs">📱 8765432109 | PIN: 0000</div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-3">🔑 Keypad Guide</h3>
            <div className="text-sm space-y-1 text-slate-300 font-mono">
              <div>0–9: Enter numbers</div>
              <div><strong>* CLR</strong>: Clear input</div>
              <div><strong># OK</strong>: Submit/Confirm</div>
              <div className="text-green-400">Green: Normal</div>
              <div className="text-yellow-400">Yellow: Waiting</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
