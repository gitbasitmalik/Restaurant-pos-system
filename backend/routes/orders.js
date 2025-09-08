const express = require("express");
const router = express.Router();
const {
  getOrdeRs,
  getOrder,
  createOrder,
  updateOrder,
  updateOrdeRstatus,
  updatePaymentStatus,
  getTodayOrdeRs,
  getOrdeRstats,
} = require("../controlleRs/orderController");
const { protect } = require("../middleware/auth");

router.route("/").get(protect, getOrdeRs).post(protect, createOrder);

router.get("/today", protect, getTodayOrdeRs);
router.get("/stats", protect, getOrdeRstats);

router.route("/:id").get(protect, getOrder).put(protect, updateOrder);

router.patch("/:id/status", protect, updateOrdeRstatus);
router.patch("/:id/payment", protect, updatePaymentStatus);

module.exports = router;
