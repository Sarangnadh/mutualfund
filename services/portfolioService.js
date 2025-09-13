
const Portfolio = require("../model/Portfolio");
const FundLatestNav = require("../model/FundLatestNav");
const Fund = require("../model/Fund");

async function calculatePortfolio(userId) {
  const holdings = await Portfolio.find({ userId });

  let totalInvestment = 0;
  let currentValue = 0;
  const detailedHoldings = [];

  // To capture latest NAV date
  let asOn = null;

  for (const holding of holdings) {
    // Latest NAV from DB
    const latestNavEntry = await FundLatestNav.findOne({ schemeCode: holding.schemeCode });
    const latestNav = latestNavEntry ? latestNavEntry.nav : 0;
    if (latestNavEntry && latestNavEntry.date) {
      asOn = latestNavEntry.date; // Keep updating with latest date
    }

    // Fund Name
    const fund = await Fund.findOne({ schemeCode: holding.schemeCode });
    const schemeName = fund ? fund.schemeName : "Unknown Fund";

    // Investment calculations
    const investedValue = holding.units * holding.purchaseNav;
    const currentHoldingValue = holding.units * latestNav;
    const profitLoss = currentHoldingValue - investedValue;

    totalInvestment += investedValue;
    currentValue += currentHoldingValue;

    detailedHoldings.push({
      schemeCode: holding.schemeCode,
      schemeName,
      units: holding.units,
      currentNav: parseFloat(latestNav.toFixed(4)),
      currentValue: parseFloat(currentHoldingValue.toFixed(2)),
      investedValue: parseFloat(investedValue.toFixed(2)),
      profitLoss: parseFloat(profitLoss.toFixed(2)),
    });
  }

  const profitLoss = currentValue - totalInvestment;
  const profitLossPercent = totalInvestment
    ? parseFloat(((profitLoss / totalInvestment) * 100).toFixed(2))
    : 0;

  return {
    totalInvestment: parseFloat(totalInvestment.toFixed(2)),
    currentValue: parseFloat(currentValue.toFixed(2)),
    profitLoss: parseFloat(profitLoss.toFixed(2)),
    profitLossPercent,
    asOn,
    holdings: detailedHoldings,
  };
}

module.exports = { calculatePortfolio };
