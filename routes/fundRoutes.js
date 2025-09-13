
const express = require("express");
let router =express.Router();

let fundController =require('../controller/fundController')


router.post("/import", fundController.importFunds);   // Admin: Import all funds from mfapi.in
router.get("/list", fundController.getFunds);         // Get funds from DB
router.get("/:schemeCode/nav", fundController.getFundNavHistory)
router.post("/update-navs", fundController.manualUpdateNavs); // ✅ Manual NAV update



module.exports = router;
