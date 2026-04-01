/**
 * USSD API Client
 * Helper functions to interact with the backend USSD endpoints
 */

const API_BASE_URL = 'http://localhost:4000'

export interface USSDRequest {
  id: string
  from: string
  to: string
  amount: number
  status: 'pending' | 'accepted' | 'rejected'
  type: string
  createdAt: string
}

export interface MobileUser {
  phone: string
  name: string
  balance: number
  message: string
}

/**
 * Send a USSD money transfer request
 * @param from Sender phone number
 * @param to Receiver phone number
 * @param amount Amount to transfer
 * @param pin User PIN for authentication
 */
export async function sendUSSDRequest(
  from: string,
  to: string,
  amount: number,
  pin: string
): Promise<USSDRequest> {
  const response = await fetch(`${API_BASE_URL}/ussd/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to, amount, pin }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to send USSD request')
  }

  return response.json()
}

/**
 * Get incoming USSD requests for a phone number
 * @param phone Phone number to check
 */
export async function getIncomingRequests(phone: string): Promise<USSDRequest[]> {
  const response = await fetch(`${API_BASE_URL}/ussd/incoming/${phone}`)

  if (!response.ok) {
    throw new Error('Failed to fetch incoming requests')
  }

  const data = await response.json()
  return data.requests || []
}

/**
 * Respond to a USSD request
 * @param requestId ID of the request
 * @param action 'accept' or 'reject'
 */
export async function respondToUSSDRequest(
  requestId: string,
  action: 'accept' | 'reject'
): Promise<USSDRequest> {
  const response = await fetch(`${API_BASE_URL}/ussd/respond`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requestId, action }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to respond to request')
  }

  return response.json()
}

/**
 * Get all USSD requests (admin)
 */
export async function getAllRequests(): Promise<USSDRequest[]> {
  const response = await fetch(`${API_BASE_URL}/ussd/requests`)

  if (!response.ok) {
    throw new Error('Failed to fetch requests')
  }

  const data = await response.json()
  return data.requests || []
}

/**
 * Get user details and balance
 * @param phone Phone number
 */
export async function getUserDetails(phone: string): Promise<MobileUser> {
  const response = await fetch(`${API_BASE_URL}/ussd/user/${phone}`)

  if (!response.ok) {
    throw new Error('User not found')
  }

  return response.json()
}

/**
 * Get market prices
 */
export async function getMarketPrices() {
  const response = await fetch(`${API_BASE_URL}/market/prices`)

  if (!response.ok) {
    throw new Error('Failed to fetch market prices')
  }

  return response.json()
}

/**
 * Initialize USSD menu navigation
 * @param sessionId Session ID
 * @param input User input
 * @param language Language code (en/hi)
 */
export async function initUSSDMenu(
  sessionId: string,
  input: string,
  language: string = 'en'
) {
  const response = await fetch(`${API_BASE_URL}/ussd/menu`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ sessionId, input, language }),
  })

  if (!response.ok) {
    throw new Error('Failed to initialize USSD menu')
  }

  return response.json()
}
