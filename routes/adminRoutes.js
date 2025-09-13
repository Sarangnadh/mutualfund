
const express = require("express");
const router = express.Router();
const adminController =require('../controller/adminController');


router.get("/users" ,adminController.getAllUsers);
router.get("/portfolios", adminController.getAllPortfolios);
router.get("/popular-funds",adminController.getPopularFunds);
router.get("/stats", adminController.getSystemStats);

module.exports = router;