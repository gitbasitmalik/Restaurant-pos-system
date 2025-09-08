const mongoose = require("mongoose");

const ordeRschema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
  },
  table: {
    type: mongoose.Schema.ObjectId,
    ref: "Table",
    required: function () {
      return this.orderType === "dine-in";
    },
  },
  orderType: {
    type: String,
    enum: ["dine-in", "takeaway", "delivery"],
    required: true,
  },
  customerName: {
    type: String,
    trim: true,
  },
  customerPhone: {
    type: String,
    trim: true,
  },
  customerAddress: {
    type: String,
    trim: true,
  },
  items: [
    {
      menuItem: {
        type: mongoose.Schema.ObjectId,
        ref: "MenuItem",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
      notes: {
        type: String,
        trim: true,
      },
    },
  ],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "served",
      "completed",
      "cancelled",
    ],
    default: "pending",
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "refunded"],
    default: "pending",
  },
  paymentMethod: {
    type: String,
    enum: ["cash", "card", "upi", "online"],
    default: "cash",
  },
  waiter: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  notes: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate order number before saving
ordeRschema.pre("save", async function (next) {
  if (!this.orderNumber) {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
      },
    });
    this.orderNumber = `ORD-${dateStr}-${(count + 1)
      .toString()
      .padStart(4, "0")}`;
  }
  this.updatedAt = Date.now();
  next();
});

// Populate items with menu item details
ordeRschema.pre(/^find/, function (next) {
  this.populate({
    path: "items.menuItem",
    select: "name price category",
  })
    .populate({
      path: "table",
      select: "number capacity",
    })
    .populate({
      path: "waiter",
      select: "name",
    });
  next();
});

module.exports = mongoose.model("Order", ordeRschema);
