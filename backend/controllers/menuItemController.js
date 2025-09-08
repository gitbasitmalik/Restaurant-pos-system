const MenuItem = require("../models/MenuItem");

// @desc    Get all menu items
// @route   GET /api/menu-items
// @access  Public
const getMenuItems = async (req, res) => {
  try {
    let query = MenuItem.find({ isAvailable: true });

    // Filter by category if provided
    if (req.query.category) {
      query = query.find({ category: req.query.category });
    }

    // Filter by veg/non-veg
    if (req.query.isVeg !== undefined) {
      query = query.find({ isVeg: req.query.isVeg });
    }

    // Search by name
    if (req.query.search) {
      query = query.find({
        name: { $regex: req.query.search, $options: "i" },
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
    const total = await MenuItem.countDocuments({ isAvailable: true });

    query = query.skip(startIndex).limit(limit);

    const menuItems = await query;

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
      count: menuItems.length,
      pagination,
      data: menuItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get single menu item
// @route   GET /api/menu-items/:id
// @access  Public
const getMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create new menu item
// @route   POST /api/menu-items
// @access  Private/Admin
const createMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.create(req.body);

    res.status(201).json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update menu item
// @route   PUT /api/menu-items/:id
// @access  Private/Admin
const updateMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidatoRs: true,
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    res.json({
      success: true,
      data: menuItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu-items/:id
// @access  Private/Admin
const deleteMenuItem = async (req, res) => {
  try {
    const menuItem = await MenuItem.findById(req.params.id);

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    // Soft delete - just set isAvailable to false
    menuItem.isAvailable = false;
    await menuItem.save();

    res.json({
      success: true,
      message: "Menu item deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get menu items by category
// @route   GET /api/menu-items/category/:categoryId
// @access  Public
const getMenuItemsByCategory = async (req, res) => {
  try {
    const menuItems = await MenuItem.find({
      category: req.params.categoryId,
      isAvailable: true,
    }).sort({ name: 1 });

    res.json({
      success: true,
      count: menuItems.length,
      data: menuItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemsByCategory,
};
