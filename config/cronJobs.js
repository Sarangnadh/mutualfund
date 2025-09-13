const cron = require("node-cron");
const Fund = require("../model/Fund");
const FundLatestNav = require("../model/FundLatestNav");
const FundNavHistory = require("../model/FundNavHistory");
const { fetchFundNavHistory } = require("../services/navService");
const { retry } = require("../utilies/retry");
const logger = require("../utilies/logger");

// Daily NAV update job
const updateNavJob = cron.schedule("0 0 * * *", async () => {
  logger.info("⏳ Starting daily NAV update...");

  try {
    const funds = await Fund.find({}, "schemeCode");

    const results = [];

    for (const fund of funds) {
      const schemeCode = fund.schemeCode;
      try {
        // Fetch NAV with retry
        const navData = await retry(() => fetchFundNavHistory(schemeCode), 3, 2000);

        if (!navData?.data?.length) {
          results.push({ schemeCode, status: "failed", message: "No NAV data" });
          logger.warn(`❌ No NAV data for ${schemeCode}`);
          continue;
        }

        const latest = navData.data[0];
        const nav = parseFloat(latest.nav);
        const date = new Date(latest.date);

        // Update latest NAV
        await FundLatestNav.updateOne(
          { schemeCode },
          { schemeCode, nav, date },
          { upsert: true }
        );

        // Update NAV history
        await FundNavHistory.updateOne(
          { schemeCode, date },
          { schemeCode, nav, date },
          { upsert: true }
        );

        results.push({ schemeCode, nav, date, status: "updated" });
        logger.info(`✅ Updated NAV for ${schemeCode} → ${nav}`);
      } catch (err) {
        results.push({ schemeCode, status: "failed", message: err.message });
        logger.error(`❌ Failed updating NAV for ${schemeCode}: ${err.message}`);
        // Optional: send alert for critical funds
      }
    }

    logger.info(`🎉 NAV update completed: ${results.length} funds processed`);
  } catch (err) {
    logger.error(`❌ NAV update job failed: ${err.message}`);
  }
});

module.exports = { updateNavJob };
