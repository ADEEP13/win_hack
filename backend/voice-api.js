#!/usr/bin/env node

const express = require("express");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = 4000;

// Mock market prices
const marketPrices = {
  rice: 1820,
  wheat: 2050,
  tomato: 35,
  onion: 28
};

// USSD Simulator - Menu navigation
app.post("/ussd/menu", (req, res) => {
  const { sessionId, input, language = "hi" } = req.body;

  const menus = {
    hi: {
      main: "Swagat hai JanDhan Plus mein\n1. Balance check\n2. Transfer paisa\n3. Fasal bhejo\n4. Mandi rates",
      rates: `Aaj ke mandi rate:\n1. Rice: Rs${marketPrices.rice}\n2. Wheat: Rs${marketPrices.wheat}\n0. Back`
    },
    en: {
      main: "Welcome to JanDhan Plus\n1. Check balance\n2. Send money\n3. List crop\n4. Market rates",
      rates: `Today's market rates:\n1. Rice: Rs${marketPrices.rice}\n2. Wheat: Rs${marketPrices.wheat}\n0. Back`
    }
  };

  const menu = menus[language] || menus.en;
  const response = input === "4" ? menu.rates : menu.main;

  res.json({
    sessionId,
    response,
    nextInput: true
  });
});

// Market prices endpoint
app.get("/market/prices", (req, res) => {
  res.json({
    success: true,
    prices: marketPrices,
    timestamp: new Date().toISOString(),
    currency: "INR"
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
app.listen(PORT, () => {
  console.log(`✅ Voice/USSD API running on port ${PORT}`);
}).on("error", (err) => {
  console.error(`❌ Failed to start Voice API on port ${PORT}:`, err.message);
  process.exit(1);
});
