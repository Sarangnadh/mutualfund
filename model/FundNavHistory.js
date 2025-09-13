const mongoose = require("mongoose");

const fundNavHistorySchema = new mongoose.Schema(
  {
    schemeCode: { type: Number, required: true },
    nav: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  { timestamps: true }
);

fundNavHistorySchema.index({ schemeCode: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("FundNavHistory", fundNavHistorySchema);
