const express = require("express");
const router = express.Router();
const {
  getTables,
  getTable,
  createTable,
  updateTable,
  deleteTable,
  updateTableStatus,
  getAvailableTables,
} = require("../controlleRs/tableController");
const { protect, manager } = require("../middleware/auth");

router.route("/").get(protect, getTables).post(protect, manager, createTable);

router.get("/available", protect, getAvailableTables);

router
  .route("/:id")
  .get(protect, getTable)
  .put(protect, manager, updateTable)
  .delete(protect, manager, deleteTable);

router.patch("/:id/status", protect, updateTableStatus);

module.exports = router;
