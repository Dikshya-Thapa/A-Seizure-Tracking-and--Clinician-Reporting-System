const Seizure = require("../models/Seizure");
const { SEIZURE_TYPES } = require("../models/Seizure");

const createSeizure = async (req, res) => {
  try {
    const { type, startedAt, durationSeconds, triggers, notes, clientId } =
      req.body;

    const started = new Date(startedAt);
    if (!startedAt || Number.isNaN(started.getTime())) {
      return res.status(400).json({ message: "A valid startedAt is required" });
    }
    if (started > new Date()) {
      return res.status(400).json({ message: "startedAt cannot be in the future" });
    }
    if (type !== undefined && !SEIZURE_TYPES.includes(type)) {
      return res.status(400).json({ message: "Invalid seizure type" });
    }
    if (
      durationSeconds !== undefined &&
      (typeof durationSeconds !== "number" || durationSeconds < 0)
    ) {
      return res.status(400).json({ message: "Invalid duration" });
    }

    // An offline entry that was already synced is returned, not duplicated
    if (clientId) {
      const existing = await Seizure.findOne({ user: req.user.id, clientId });
      if (existing) {
        return res.status(200).json({ seizure: existing });
      }
    }

    const seizure = await Seizure.create({
      user: req.user.id,
      type,
      startedAt: started,
      durationSeconds,
      triggers: Array.isArray(triggers) ? triggers.map(String) : [],
      notes,
      clientId,
    });

    res.status(201).json({ seizure });
  } catch (err) {
    console.error("createSeizure error:", err.message);
    res.status(500).json({ message: "Could not save seizure" });
  }
};

const getSeizures = async (req, res) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 50, 200);
    const seizures = await Seizure.find({ user: req.user.id })
      .sort({ startedAt: -1 })
      .limit(limit);

    res.json({ seizures });
  } catch (err) {
    console.error("getSeizures error:", err.message);
    res.status(500).json({ message: "Could not fetch seizures" });
  }
};

module.exports = { createSeizure, getSeizures };