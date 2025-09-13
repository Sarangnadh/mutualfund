
const axios = require("axios");

const NAV_API_BASE = "https://api.mfapi.in/mf";

// Fetch all funds
async function fetchAllFunds() {
  const res = await axios.get(NAV_API_BASE);
  return res.data; // [{schemeCode, schemeName}, ...]
}

// Fetch NAV history for a scheme
async function fetchFundNavHistory(schemeCode) {
   try {
    const res = await axios.get(`${NAV_API_BASE}/${schemeCode}`);
    if (!res.data || !res.data.data) throw new Error("No NAV data found");
    return res.data;
  } catch (err) {
    throw new Error(`Failed to fetch NAV for ${schemeCode}: ${err.message}`);
  }
}

module.exports = {
  fetchAllFunds,
  fetchFundNavHistory,
};
