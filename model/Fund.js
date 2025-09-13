

const mongoose = require("mongoose");

const fundSchema = new mongoose.Schema(
  {
    schemeCode: { type: Number, unique: true, required: true },
    schemeName: { type: String, required: true },
    fundHouse: { type: String },
    category: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fund", fundSchema);
