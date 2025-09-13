
const express = require("express");
let router =express.Router();
const authMiddleware = require("../authMiddleware");
let portfolioController =require('../controller/portfolioController')

router.post("/add", authMiddleware, portfolioController.addFund);
router.get("/list", authMiddleware, portfolioController.getPortfolioList);
router.delete("/remove/:schemeCode", authMiddleware, portfolioController.removeFund);
router.get("/value", authMiddleware, portfolioController.getPortfolioValue);
router.get("/history", authMiddleware, portfolioController.getPortfolioHistory);



module.exports = router;
