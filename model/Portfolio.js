
const mongoose = require("mongoose");

const portfolioSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    schemeCode: { type: Number, required: true },
    schemeName: { type: String, required: true }, // Fund name
    units: { type: Number, required: true },
    purchaseNav: { type: Number, required: true }, // 🆕 Purchase-time NAV
    purchaseDate: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Portfolio", portfolioSchema);
