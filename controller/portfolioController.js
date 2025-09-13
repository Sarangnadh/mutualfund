const Portfolio = require("../model/Portfolio");
const { calculatePortfolio } = require("../services/portfolioService");

const moment = require("moment");
const { fetchFundNavHistory } = require("../services/navService");

const axios = require("axios");


exports.addFund = async (req, res) => {
  try {
    const { schemeCode, units } = req.body;

    if (!schemeCode || !units || units <= 0) {
      return res.status(400).json({ success: false, message: "Invalid input" });
    }

    // 🔍 Fetch scheme details from mfapi.in
    const schemeResponse = await axios.get(`https://api.mfapi.in/mf/${schemeCode}`);
    if (!schemeResponse.data || !schemeResponse.data.meta) {
      return res.status(404).json({ success: false, message: "Scheme not found" });
    }

    const schemeName = schemeResponse.data.meta.scheme_name;

    // 🔍 Fetch latest NAV from mfapi.in
    const latestNavResponse = await axios.get(`https://api.mfapi.in/mf/${schemeCode}/latest`);
    const purchaseNav = latestNavResponse.data && latestNavResponse.data.data
      ? parseFloat(latestNavResponse.data.data[0].nav)
      : 0;

    if (!purchaseNav || purchaseNav <= 0) {
      return res.status(400).json({ success: false, message: "Invalid NAV value" });
    }

    // Save portfolio with schemeName and purchaseNav
    const portfolio = await Portfolio.create({
      userId: req.user.id,
      schemeCode,
      schemeName,
      units,
      purchaseNav, // 🆕 store purchase NAV
    });

    res.json({
      success: true,
      message: "Fund added to portfolio successfully",
      portfolio: {
        id: portfolio._id,
        schemeCode: portfolio.schemeCode,
        schemeName: portfolio.schemeName,
        units: portfolio.units,
        purchaseNav: portfolio.purchaseNav,
        addedAt: portfolio.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getPortfolioList = async (req, res) => {
  try {
    const holdings = await Portfolio.find({ userId: req.user.id });

    res.json({
      success: true,
      data: {
        totalHoldings: holdings.length,
        holdings,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.removeFund = async (req, res) => {
  try {
    const { schemeCode } = req.params;

    await Portfolio.deleteOne({ userId: req.user.id, schemeCode });

    res.json({ success: true, message: "Fund removed from portfolio successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.getPortfolioValue = async (req, res) => {
  try {
    const data = await calculatePortfolio(req.user.id);

    res.json({
      success: true,
      data,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getPortfolioHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate } = req.query;

    // Date range: default last 30 days
    const start = startDate
      ? moment(startDate, "DD-MM-YYYY")
      : moment().subtract(30, "days");
    const end = endDate ? moment(endDate, "DD-MM-YYYY") : moment();

    // User holdings
    const holdings = await Portfolio.find({ userId });
    if (!holdings.length) {
      return res.json({ success: true, data: [] });
    }

    // Total Investment (units × purchaseNav)
    const totalInvestment = holdings.reduce(
      (sum, h) => sum + h.units * h.purchaseNav,
      0
    );

    // Map to store portfolio value by date
    const historyMap = {};

    for (const holding of holdings) {
      const history = await fetchFundNavHistory(holding.schemeCode);

      if (history && history.data) {
        history.data.forEach((entry) => {
          const entryDate = moment(entry.date, "DD-MM-YYYY");

          if (entryDate.isBetween(start, end, "day", "[]")) {
            const dateKey = entryDate.format("DD-MM-YYYY");
            const nav = parseFloat(entry.nav);

            if (!historyMap[dateKey]) {
              historyMap[dateKey] = { totalValue: 0 };
            }

            historyMap[dateKey].totalValue += holding.units * nav;
          }
        });
      }
    }

    // Prepare response
    const responseData = Object.entries(historyMap)
      .sort(([a], [b]) => moment(a, "DD-MM-YYYY") - moment(b, "DD-MM-YYYY"))
      .map(([date, data]) => ({
        date,
        totalValue: parseFloat(data.totalValue.toFixed(2)),
        profitLoss: parseFloat((data.totalValue - totalInvestment).toFixed(2)),
      }));

    res.json({ success: true, data: responseData });
  } catch (err) {
    console.error("Error in getPortfolioHistory:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
