const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Otp = require("../models/Otp");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");

const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const SELF_ASSIGNABLE_ROLES = ["patient", "caregiver"];

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const requestOtp = async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();

    if (!isValidEmail(email)) {
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

const verifyOtp = async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const otp = (req.body.otp || "").toString().trim();

    if (!isValidEmail(email) || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const record = await Otp.findOne({ email });
    if (!record || record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired or not found" });
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      await Otp.deleteMany({ email });
      return res
        .status(429)
        .json({ message: "Too many attempts. Request a new OTP" });
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      record.attempts += 1;
      await record.save();
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    // OTP is single use
    await Otp.deleteMany({ email });

    // Find the user or create one on first login
    let user = await User.findOne({ email });
    if (!user) {
      const role = SELF_ASSIGNABLE_ROLES.includes(req.body.role)
        ? req.body.role
        : "patient";
      user = await User.create({
        email,
        name: (req.body.name || "").trim(),
        role,
        isVerified: true,
      });
    } else if (!user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("verifyOtp error:", err.message);
    res.status(500).json({ message: "Could not verify OTP" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-__v");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (err) {
    console.error("getMe error:", err.message);
    res.status(500).json({ message: "Could not fetch user" });
  }
};

module.exports = { requestOtp, verifyOtp, getMe };