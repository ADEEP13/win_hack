#!/usr/bin/env node

const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors());

const PORT = process.env.VOICE_API_PORT || process.env.PORT || 4000;

// In-memory storage (in production, use PostgreSQL)
const ussdRequests = new Map();
const ussdSessions = new Map();
const userPINs = new Map();
const connectedPhones = new Map(); // phone -> socket.id mapping

// Mock user database with PINs
const mockUsers = {
  "9876543210": { name: "Raj Kumar", pin: "1234", balance: 50000 },
  "9988776655": { name: "Priya Singh", pin: "5678", balance: 75000 },
  "8765432109": { name: "Amit Patel", pin: "0000", balance: 100000 },
};

// Mock market prices
const marketPrices = {
  rice: 1820,
  wheat: 2050,
  tomato: 35,
  onion: 28
};

// ============================================================
// SOCKET.IO REAL-TIME EVENTS
// ============================================================

io.on("connection", (socket) => {
  console.log(`📱 New device connected: ${socket.id}`);

  // Register a phone number with the socket
  socket.on("register_phone", (phoneNumber) => {
    connectedPhones.set(phoneNumber, socket.id);
    socket.phoneNumber = phoneNumber;
    console.log(`✅ Phone ${phoneNumber} registered with socket ${socket.id}`);
    socket.emit("phone_registered", { success: true, phoneNumber });
  });

  // Listen for incoming USSD requests
  socket.on("ussd_request", (data) => {
    const { from, to, amount, pin } = data;
    
    // Validate PIN
    const sender = mockUsers[from];
    if (!sender || sender.pin !== pin) {
      socket.emit("ussd_error", { error: "Invalid PIN or phone number" });
      return;
    }

    // Create request
    const requestId = uuidv4();
    const request = {
      id: requestId,
      from,
      to,
      amount,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    ussdRequests.set(requestId, request);
    console.log(`📤 USSD Request created: ${from} -> ${to} (₹${amount})`);

    // Emit to sender confirmation
    socket.emit("ussd_sent", { requestId, request });

    // Emit to receiver's socket if connected
    const receiverSocketId = connectedPhones.get(to);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("ussd_incoming", { requestId, request });
      console.log(`📥 Incoming request notified to ${to}`);
    }
  });

  // Listen for USSD response (accept/reject)
  socket.on("ussd_respond", (data) => {
    const { requestId, action } = data; // action = "accept" or "reject"
    
    if (!ussdRequests.has(requestId)) {
      socket.emit("ussd_error", { error: "Invalid request ID" });
      return;
    }

    const request = ussdRequests.get(requestId);
    request.status = action === "accept" ? "accepted" : "rejected";
    request.updatedAt = new Date().toISOString();

    console.log(`✅ USSD Request ${action}: ${requestId}`);

    // Notify both parties
    const senderSocketId = connectedPhones.get(request.from);
    const receiverSocketId = connectedPhones.get(request.to);

    if (senderSocketId) {
      io.to(senderSocketId).emit("ussd_response_received", { requestId, action });
    }
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("ussd_response_sent", { requestId, action });
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Device disconnected: ${socket.id}`);
    if (socket.phoneNumber) {
      connectedPhones.delete(socket.phoneNumber);
    }
  });
});

// ============================================================
// REST API ENDPOINTS
// ============================================================

// USSD Menu Navigation (existing endpoint, enhanced)
app.post("/ussd/menu", (req, res) => {
  const { sessionId, input, language = "hi", phone = "9876543210" } = req.body;

  const menus = {
    hi: {
      main: "JanDhan Plus mein swagat 🌾\n1. Send Money\n2. View Offers\n3. List Crop\n4. Market Rates\n0. Exit",
      sendMoney: "Phone number enter karo:\n(10 digits)",
      enterAmount: "Amount enter karo (₹):",
      enterPin: "PIN enter karo (4 digits):",
      marketRates: `Aaj ke mandi rate:\n1. Rice: ₹${marketPrices.rice}/kg\n2. Wheat: ₹${marketPrices.wheat}/kg\n3. Tomato: ₹${marketPrices.tomato}/kg\n0. Back`,
      success: "✅ Request sent successfully!\nTransaction will appear soon.",
      error: "❌ Invalid input. Try again."
    },
    en: {
      main: "Welcome to JanDhan Plus 🌾\n1. Send Money\n2. View Offers\n3. List Crop\n4. Market Rates\n0. Exit",
      sendMoney: "Enter receiver phone number:\n(10 digits)",
      enterAmount: "Enter amount (₹):",
      enterPin: "Enter PIN (4 digits):",
      marketRates: `Today's market rates:\n1. Rice: ₹${marketPrices.rice}/kg\n2. Wheat: ₹${marketPrices.wheat}/kg\n3. Tomato: ₹${marketPrices.tomato}/kg\n0. Back`,
      success: "✅ Request sent successfully!\nWaiting for approval...",
      error: "❌ Invalid input. Try again."
    }
  };

  const lang = menus[language] || menus.en;
  
  // Simulate session state progression
  let response = lang.main;
  if (input === "1") response = lang.sendMoney;
  else if (input === "4") response = lang.marketRates;
  
  res.json({
    sessionId: sessionId || uuidv4(),
    response,
    nextInput: true,
    menu: "main"
  });
});

// Send USSD Money Request
app.post("/ussd/send", (req, res) => {
  const { from, to, amount, pin } = req.body;

  // Validate inputs
  if (!from || !to || !amount || !pin) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const sender = mockUsers[from];
  if (!sender) {
    return res.status(400).json({ error: "Sender phone not found" });
  }

  if (sender.pin !== pin) {
    return res.status(401).json({ error: "Invalid PIN" });
  }

  if (sender.balance < amount) {
    return res.status(400).json({ error: "Insufficient balance" });
  }

  // Create USSD request
  const requestId = uuidv4();
  const ussdRequest = {
    id: requestId,
    from,
    to,
    amount,
    status: "pending",
    createdAt: new Date().toISOString(),
    type: "send_money"
  };

  ussdRequests.set(requestId, ussdRequest);
  console.log(`📤 USSD Send Request: ${from} -> ${to} (₹${amount})`);

  res.json({
    success: true,
    requestId,
    message: "Request sent successfully",
    request: ussdRequest
  });
});

// Get Incoming USSD Requests
app.get("/ussd/incoming/:phone", (req, res) => {
  const { phone } = req.params;
  
  const incoming = Array.from(ussdRequests.values()).filter(
    (req) => req.to === phone && req.status === "pending"
  );

  res.json({
    success: true,
    phone,
    incomingCount: incoming.length,
    requests: incoming
  });
});

// Respond to USSD Request
app.post("/ussd/respond", (req, res) => {
  const { requestId, action } = req.body; // action = "accept" or "reject"

  if (!ussdRequests.has(requestId)) {
    return res.status(404).json({ error: "Request not found" });
  }

  if (!["accept", "reject"].includes(action)) {
    return res.status(400).json({ error: "Invalid action" });
  }

  const request = ussdRequests.get(requestId);
  request.status = action === "accept" ? "accepted" : "rejected";
  request.updatedAt = new Date().toISOString();

  console.log(`✅ USSD Request ${action}: ${requestId}`);

  res.json({
    success: true,
    requestId,
    message: `Request ${action}ed successfully`,
    request
  });
});

// Get All USSD Requests (for admin)
app.get("/ussd/requests", (req, res) => {
  const allRequests = Array.from(ussdRequests.values());
  res.json({
    success: true,
    totalRequests: allRequests.length,
    requests: allRequests
  });
});

// Get User Details (with balance)
app.get("/ussd/user/:phone", (req, res) => {
  const { phone } = req.params;
  const user = mockUsers[phone];

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({
    success: true,
    phone,
    name: user.name,
    balance: user.balance,
    message: `Welcome ${user.name}. Balance: ₹${user.balance}`
  });
});

// Market prices endpoint (existing)
app.get("/market/prices", (req, res) => {
  res.json({
    success: true,
    prices: marketPrices,
    timestamp: new Date().toISOString(),
    currency: "INR"
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    service: "JanDhan Plus Voice/USSD API",
    status: "running",
    port: PORT,
    socketIO: "enabled",
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({
    success: false,
    error: "Internal server error",
    message: err.message
  });
});

// Start server with error handling
server.listen(PORT, () => {
  console.log(`✅ Voice/USSD API running on port ${PORT}`);
  console.log(`📱 WebSocket server enabled for real-time USSD`);
  console.log(`🔗 Connect WebSocket to ws://localhost:${PORT}`);
}).on("error", (err) => {
  console.error(`❌ Failed to start Voice API on port ${PORT}:`, err.message);
  process.exit(1);
});
