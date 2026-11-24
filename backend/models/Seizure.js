const mongoose = require("mongoose");

const SEIZURE_TYPES = [
  "focal",
  "generalized_tonic_clonic",
  "absence",
  "myoclonic",
  "atonic",
  "unknown",
];

const seizureSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: { type: String, enum: SEIZURE_TYPES, default: "unknown" },
    startedAt: { type: Date, required: true },
    durationSeconds: { type: Number, min: 0, default: 0 },
    triggers: { type: [String], default: [] },
    notes: { type: String, trim: true, maxlength: 1000, default: "" },
    // Generated on the device so an offline entry is not saved twice when it syncs
    clientId: { type: String, trim: true },
  },
  { timestamps: true }
);

seizureSchema.index(
  { user: 1, clientId: 1 },
  { unique: true, partialFilterExpression: { clientId: { $type: "string" } } }
);

module.exports = mongoose.model("Seizure", seizureSchema);
module.exports.SEIZURE_TYPES = SEIZURE_TYPES;