
const mongoose = require("mongoose");

const fundLatestNavSchema = new mongoose.Schema(
  {
    schemeCode: { type: Number, unique: true, required: true },
    nav: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FundLatestNav", fundLatestNavSchema);
