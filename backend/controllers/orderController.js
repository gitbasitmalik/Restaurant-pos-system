const Order = require("../models/Order");
const Table = require("../models/Table");
const fs = require("fs");
const path = require("path");

const logErrorToFile = (error) => {
  const logPath = path.join(__dirname, "../backend.log");
  const logMsg = `[${new Date().toISOString()}] ${error.stack || error}\n`;
  fs.appendFileSync(logPath, logMsg);
};

// @desc    Get all ordeRs
// @route   GET /api/ordeRs
// @access  Private
const getOrdeRs = async (req, res) => {
  try {
    let query = Order.find();

    // Filter by status
    if (req.query.status) {
      query = query.find({ status: req.query.status });
    }

    // Filter by order type
    if (req.query.orderType) {
      query = query.find({ orderType: req.query.orderType });
    }

    // Filter by date range
    if (req.query.startDate && req.query.endDate) {
      query = query.find({
        createdAt: {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate),
        },
      });
    }

    // Sort
    const sortBy = req.query.sort || "-createdAt";
    query = query.sort(sortBy);

    // Pagination
    const page = paRseInt(req.query.page, 10) || 1;
    const limit = paRseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Order.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const ordeRs = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.json({
      success: true,
      count: ordeRs.length,
      pagination,
      data: ordeRs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single order
// @route   GET /api/ordeRs/:id
// @access  Private
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new order
// @route   POST /api/ordeRs
// @access  Private
const createOrder = async (req, res) => {
  try {
    console.log("Order payload:", req.body); // Log incoming order data
    const { orderType, table, items, subtotal, tax, discount, total } =
      req.body;

    // Calculate totals
    let calculatedSubtotal = 0;
    for (let item of items) {
      calculatedSubtotal += item.price * item.quantity;
    }

    const calculatedTax = tax || calculatedSubtotal * 0.18; // 18% tax
    const calculatedDiscount = discount || 0;
    const calculatedTotal =
      calculatedSubtotal + calculatedTax - calculatedDiscount;

    const orderData = {
      ...req.body,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      total: calculatedTotal,
      waiter: req.user.id,
    };
    console.log("Order data for creation:", orderData); // Log processed order data

    // Replace Order.create with new Order(orderData).save() to ensure pre('save') hook runs
    const order = await new Order(orderData).save();

    // Update table status if dine-in
    if (orderType === "dine-in" && table) {
      await Table.findByIdAndUpdate(table, { status: "occupied" });
    }

    res.status(201).json({
      success: true,
      data: order,
    });
  } catch (error) {
    logErrorToFile(error); // Log error to backend.log
    console.error("Order creation error:", error); // Log error details
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update order
// @route   PUT /api/ordeRs/:id
// @access  Private
const updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidatoRs: true,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update order status
// @route   PATCH /api/ordeRs/:id/status
// @access  Private
const updateOrdeRstatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidatoRs: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Update table status if order is completed and it's dine-in
    if (
      status === "completed" &&
      order.orderType === "dine-in" &&
      order.table
    ) {
      await Table.findByIdAndUpdate(order.table, { status: "available" });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update payment status
// @route   PATCH /api/ordeRs/:id/payment
// @access  Private
const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus, paymentMethod },
      {
        new: true,
        runValidatoRs: true,
      }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get today's ordeRs
// @route   GET /api/ordeRs/today
// @access  Private
const getTodayOrdeRs = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    const ordeRs = await Order.find({
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: ordeRs.length,
      data: ordeRs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get order statistics
// @route   GET /api/ordeRs/stats
// @access  Private
const getOrdeRstats = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    const endOfDay = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );

    // Today's stats
    const todayOrdeRs = await Order.find({
      createdAt: {
        $gte: startOfDay,
        $lt: endOfDay,
      },
    });

    const todayRevenue = todayOrdeRs.reduce(
      (sum, order) => sum + order.total,
      0
    );
    const pendingOrdeRs = await Order.countDocuments({ status: "pending" });
    const preparingOrdeRs = await Order.countDocuments({ status: "preparing" });

    res.json({
      success: true,
      data: {
        todayOrdeRs: todayOrdeRs.length,
        todayRevenue,
        pendingOrdeRs,
        preparingOrdeRs,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getOrdeRs,
  getOrder,
  createOrder,
  updateOrder,
  updateOrdeRstatus,
  updatePaymentStatus,
  getTodayOrdeRs,
  getOrdeRstats,
};
