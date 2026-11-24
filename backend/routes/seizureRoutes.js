const express = require("express");
const {
  createSeizure,
  getSeizures,
} = require("../controllers/seizureController");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.use(protect, authorize("patient", "caregiver"));

router.post("/", createSeizure);
router.get("/", getSeizures);

module.exports = router;