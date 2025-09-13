
const Fund = require("../model/Fund");
const FundLatestNav = require("../model/FundLatestNav");
const FundNavHistory = require("../model/FundNavHistory");

const { fetchAllFunds, fetchFundNavHistory } = require("../services/navService");
const  {updateNavJob}  = require("../config/cronJobs");

// Import fund list from mfapi.in

exports.importFunds = async (req, res) => {
  try {
    const fundList = await fetchAllFunds(); // basic {schemeCode, schemeName}
    let enrichedFunds = [];
    const trimmedFundList = fundList.slice(0,15 );

    // Fetch metadata for each fund
    for (const fund of trimmedFundList) {
      try {
        const fundDetails = await fetchFundNavHistory(fund.schemeCode);
        const meta = fundDetails.meta || {};
        enrichedFunds.push({
          schemeCode: fund.schemeCode,
          schemeName: fund.schemeName,
          fundHouse: meta.fund_house || null,
          schemeType: meta.scheme_type || null,
          schemeCategory: meta.scheme_category || null,
        });
        // console.log("Pushed 10 funds");
      } catch (err) {
        console.warn(`Failed to fetch details for schemeCode ${fund.schemeCode}: ${err.message}`);
      }
    }

    // Bulk insert/update
    const bulkOps = enrichedFunds.map(fund => ({
      updateOne: {
        filter: { schemeCode: fund.schemeCode },
        update: { $set: fund },
        upsert: true,
      },
    }));

    await Fund.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: "Funds imported successfully",
      count: enrichedFunds.length,
    });
  } catch (err) {
    console.error("Error in importFunds:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all funds from DB
exports.getFunds = async (req, res) => {
  try {
    const { search, page = 1, limit = 20 } = req.query;

    const query = search
      ? { schemeName: { $regex: search, $options: "i" } }
      : {};

    const totalFunds = await Fund.countDocuments(query);
    const funds = await Fund.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .select("schemeCode schemeName fundHouse schemeType schemeCategory");

    res.json({
      success: true,
      data: {
        funds,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalFunds / limit),
          totalFunds,
          hasNext: page * limit < totalFunds,
          hasPrev: page > 1,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// Get NAV history of a scheme
exports.getFundNavHistory = async (req, res) => {
  try {
    const { schemeCode } = req.params;
console.log("schemeCode param:", schemeCode);
    // Fetch fund details from DB
    const fund = await Fund.findOne({ schemeCode: parseInt(schemeCode) });
    if (!fund) {
      return res.status(404).json({ success: false, message: "Fund not found" });
    }

    // Fetch NAV history from external API (mfapi.in)
    const navData = await fetchFundNavHistory(schemeCode);

    if (!navData || !navData.data || navData.data.length === 0) {
      return res.status(404).json({ success: false, message: "No NAV history available" });
    }

    // Extract latest NAV
    const latestNavEntry = navData.data[0]; // first element is the latest
    const currentNav = parseFloat(latestNavEntry.nav);
    const asOn = latestNavEntry.date;

    // Format history (limit to, say, 30 records for now)
    const history = navData.data.slice(0, 30).map(entry => ({
      date: entry.date,
      nav: parseFloat(entry.nav),
    }));

    res.json({
      success: true,
      data: {
        schemeCode: fund.schemeCode,
        schemeName: fund.schemeName,
        currentNav,
        asOn,
        history,
      },
    });
  } catch (err) {
    console.error("Error fetching NAV history:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.manualUpdateNavs = async (req, res) => {
  try {
    await updateNavJob. // run cron immediately
    res.json({ success: true, message: "NAV update triggered manually" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};