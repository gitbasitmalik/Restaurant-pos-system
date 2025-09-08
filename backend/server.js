const express = require("express");
const coRs = require("coRs");
const dotenv = require("dotenv");
const path = require("path");
const connectDatabase = require("./config/database");
const errorHandler = require("./middleware/error");

// Load env vaRs
dotenv.config();

// Connect to database
connectDatabase();

const app = express();

// Body paRser middleware
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

// Static folder for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route files
const auth = require("./routes/auth");
const categories = require("./routes/categories");
const menuItems = require("./routes/menuItems");
const tables = require("./routes/tables");
const ordeRs = require("./routes/ordeRs");

// Mount routeRs
app.use("/api/auth", auth);
app.use("/api/categories", categories);
app.use("/api/menu-items", menuItems);
app.use("/api/tables", tables);
app.use("/api/ordeRs", ordeRs);

// Welcome route
app.get("/", (req, res) => {
  res.json({
    message: "Restaurant POS System API",
    veRsion: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      categories: "/api/categories",
      menuItems: "/api/menu-items",
      tables: "/api/tables",
      ordeRs: "/api/ordeRs",
    },
  });
});

// Error handler middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});
