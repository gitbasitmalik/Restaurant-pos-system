const express = require("express");
const router = express.Router();
const {
  getMenuItems,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getMenuItemsByCategory,
} = require("../controlleRs/menuItemController");
const { protect, manager } = require("../middleware/auth");

router.route("/").get(getMenuItems).post(protect, manager, createMenuItem);

router.route("/category/:categoryId").get(getMenuItemsByCategory);

router
  .route("/:id")
  .get(getMenuItem)
  .put(protect, manager, updateMenuItem)
  .delete(protect, manager, deleteMenuItem);

module.exports = router;
