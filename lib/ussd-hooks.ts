/**
 * Custom React Hook for USSD WebSocket Management
 * Provides Socket.IO integration for real-time USSD communication
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import io, { Socket } from 'socket.io-client'

export interface USSDSocketCallbacks {
  onPhoneRegistered?: (data: any) => void
  onUSSDSent?: (data: any) => void
  onUSSDIncoming?: (data: any) => void
  onUSSDResponseReceived?: (data: any) => void
  onUSSDResponseSent?: (data: any) => void
  onUSSDError?: (data: any) => void
  onConnect?: () => void
  onDisconnect?: () => void
}

const SOCKET_IO_URL = 'http://localhost:4000'

/**
 * Hook to manage USSD Socket.IO connection
 * @param callbacks Object with callback functions for various events
 */
export function useUSSDSocket(callbacks: USSDSocketCallbacks) {
  const socketRef = useRef<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState('connecting')

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_VOICE_API_URL || SOCKET_IO_URL
    // Create Socket.IO connection
    const socket = io(socketUrl, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    // Connection handlers
    socket.on('connect', () => {
      console.log('✅ Connected to USSD server')
      setIsConnected(true)
      setConnectionStatus('connected')
      callbacks.onConnect?.()
    })

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from USSD server')
      setIsConnected(false)
      setConnectionStatus('disconnected')
      callbacks.onDisconnect?.()
    })

    socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error)
      setConnectionStatus('error')
    })

    // USSD event handlers
    socket.on('phone_registered', (data: unknown) => {
      console.log('📱 Phone registered:', data)
      callbacks.onPhoneRegistered?.(data)
    })

    socket.on('ussd_sent', (data: unknown) => {
      console.log('📤 USSD sent:', data)
      callbacks.onUSSDSent?.(data)
    })

    socket.on('ussd_incoming', (data: unknown) => {
      console.log('📥 Incoming USSD:', data)
      callbacks.onUSSDIncoming?.(data)
    })

    socket.on('ussd_response_received', (data: unknown) => {
      console.log('✅ Response received:', data)
      callbacks.onUSSDResponseReceived?.(data)
    })

    socket.on('ussd_response_sent', (data: unknown) => {
      console.log('📤 Response sent:', data)
      callbacks.onUSSDResponseSent?.(data)
    })

    socket.on('ussd_error', (data: unknown) => {
      console.error('❌ USSD error:', data)
      callbacks.onUSSDError?.(data)
    })

    socketRef.current = socket

    // Cleanup on unmount
    return () => {
      socket.close()
    }
  }, [callbacks])

  // Function to register a phone
  const registerPhone = useCallback((phoneNumber: string) => {
    if (socketRef.current) {
      socketRef.current.emit('register_phone', phoneNumber)
    }
  }, [])

  // Function to send USSD request
  const sendRequest = useCallback(
    (from: string, to: string, amount: number, pin: string) => {
      if (socketRef.current) {
        socketRef.current.emit('ussd_request', { from, to, amount, pin })
      }
    },
    []
  )

  // Function to respond to USSD request
  const respondToRequest = useCallback((requestId: string, action: 'accept' | 'reject') => {
    if (socketRef.current) {
      socketRef.current.emit('ussd_respond', { requestId, action })
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    connectionStatus,
    registerPhone,
    sendRequest,
    respondToRequest,
  }
}

/**
 * Hook to manage USSD menu state
 */
export function useUSSDMenu() {
  const [menuStack, setMenuStack] = useState<string[]>(['main'])
  const [displayBuffer, setDisplayBuffer] = useState('')
  const [inputBuffer, setInputBuffer] = useState('')

  const pushMenu = useCallback((menu: string) => {
    setMenuStack((prev) => [...prev, menu])
  }, [])

  const popMenu = useCallback(() => {
    setMenuStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))
  }, [])

  const goToMenu = useCallback((menu: string) => {
    setMenuStack([menu])
  }, [])

  const getCurrentMenu = () => menuStack[menuStack.length - 1]

  const clearInput = useCallback(() => {
    setInputBuffer('')
  }, [])

  const addInput = useCallback((char: string) => {
    setInputBuffer((prev) => prev + char)
  }, [])

  const getInput = () => inputBuffer

  const setDisplay = useCallback((text: string) => {
    setDisplayBuffer(text)
  }, [])

  const getDisplay = () => displayBuffer

  return {
    menuStack,
    pushMenu,
    popMenu,
    goToMenu,
    getCurrentMenu,
    inputBuffer,
    clearInput,
    addInput,
    getInput,
    displayBuffer,
    setDisplay,
    getDisplay,
  }
}
