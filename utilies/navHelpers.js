

// utils/navHelpers.js
const axios = require("axios");
const FundLatestNav = require("../model/FundLatestNav");
const FundNavHistory = require("../model/FundNavHistory");

const NAV_API_BASE = "https://api.mfapi.in/mf";

// Fetch latest NAV for a scheme
async function fetchLatestNAV(schemeCode) {
  const res = await axios.get(`${NAV_API_BASE}/${schemeCode}`);
  if (!res.data || !res.data.data || res.data.data.length === 0) {
    throw new Error(`No NAV data found for scheme ${schemeCode}`);
  }
  const latest = res.data.data[0]; // Most recent NAV entry
  return {
    schemeCode,
    nav: parseFloat(latest.nav),
    date: latest.date,
  };
}

// Update FundLatestNav collection
async function updateLatestNAV(schemeCode, navData) {
  await FundLatestNav.updateOne(
    { schemeCode },
    {
      schemeCode,
      nav: navData.nav,
      date: navData.date,
      updatedAt: new Date(),
    },
    { upsert: true }
  );
}

// Insert into FundNavHistory collection
async function addNAVHistory(schemeCode, navData) {
  await FundNavHistory.updateOne(
    { schemeCode, date: navData.date },
    {
      schemeCode,
      nav: navData.nav,
      date: navData.date,
    },
    { upsert: true }
  );
}

module.exports = {
  fetchLatestNAV,
  updateLatestNAV,
  addNAVHistory,
};
