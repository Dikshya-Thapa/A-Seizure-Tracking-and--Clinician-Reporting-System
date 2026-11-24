const express = require("express");
const {
  requestOtp,
  verifyOtp,
  getMe,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/request-otp", requestOtp);
router.post("/verify-otp", verifyOtp);
router.get("/me", protect, getMe);

module.exports = router;