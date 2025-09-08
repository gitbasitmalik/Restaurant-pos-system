const express = require("express");
const router = express.Router();
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
} = require("../controlleRs/categoryController");
const { protect, manager } = require("../middleware/auth");

router.route("/").get(getCategories).post(protect, manager, createCategory);

router
  .route("/:id")
  .get(getCategory)
  .put(protect, manager, updateCategory)
  .delete(protect, manager, deleteCategory);

module.exports = router;
