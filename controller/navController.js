
const Portfolio = require("../model/Portfolio");
const { fetchLatestNAV, updateLatestNAV, addNAVHistory } = require("../utilies/navHelpers");

exports.updateNavNow = async (req, res) => {
  try {
    const portfolioSchemes = await Portfolio.distinct("schemeCode");

    if (portfolioSchemes.length === 0) {
      return res.json({ success: true, message: "No portfolios found to update NAV." });
    }

    const results = [];

    for (const schemeCode of portfolioSchemes) {
      try {
        const latestNav = await fetchLatestNAV(schemeCode);
        await updateLatestNAV(schemeCode, latestNav);
        await addNAVHistory(schemeCode, latestNav);

        results.push({
          schemeCode,
          date: latestNav.date,
          nav: latestNav.nav,
          status: "updated",
        });
      } catch (err) {
        results.push({
          schemeCode,
          status: "failed",
          message: err.message,
        });
      }
    }

    res.json({
      success: true,
      message: "NAV update triggered successfully",
      data: results,
    });
  } catch (error) {
    console.error("Error updating NAV:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
