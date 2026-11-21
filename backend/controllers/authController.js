const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Otp = require("../models/Otp");
const sendEmail = require("../utils/sendEmail");

const OTP_EXPIRY_MINUTES = 10;

const requestOtp = async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: "A valid email is required" });
    }

    // Generate a 6-digit code
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);

    // Keep only one active OTP per email
    await Otp.deleteMany({ email });
    await Otp.create({
      email,
      otpHash,
      expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
    });

    await sendEmail({
      to: email,
      subject: "Your login code",
      text: `Your login code is ${otp}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
    });

    res.json({ message: "OTP sent to your email" });
  } catch (err) {
    console.error("requestOtp error:", err.message);
    res.status(500).json({ message: "Could not send OTP" });
  }
};

module.exports = { requestOtp };