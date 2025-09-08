const express = require("express");
const coRs = require("cors");
const dotenv = require("dotenv");

// Load env vars
dotenv.config();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Enable CORs
app.use(
  coRs({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeadeRs: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
  })
);

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Restaurant POS System API - Test Server",
    veRsion: "1.0.0",
    status: "working",
  });
});

// Simple test route
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API is working",
  });
});

const PORT = process.env.PORT || 5001;

const server = app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
