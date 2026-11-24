const jwt = require("jsonwebtoken");
const User = require("../models/User");

const SELF_ASSIGNABLE_ROLES = ["patient", "caregiver"];

const updateProfile = async (req, res) => {
  try {
    const updates = {};

    if (typeof req.body.name === "string") {
      updates.name = req.body.name.trim();
    }

    if (req.body.role !== undefined) {
      // Doctors and admins cannot be created or changed through this route
      if (
        !SELF_ASSIGNABLE_ROLES.includes(req.body.role) ||
        !SELF_ASSIGNABLE_ROLES.includes(req.user.role)
      ) {
        return res.status(403).json({ message: "Role cannot be changed" });
      }
      updates.role = req.body.role;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, {
      new: true,
      runValidators: true,
    }).select("-__v");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // The token carries the role, so issue a new one after a change
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ user, token });
  } catch (err) {
    console.error("updateProfile error:", err.message);
    res.status(500).json({ message: "Could not update profile" });
  }
};

module.exports = { updateProfile };