
const express = require("express");
const router = express.Router();
const { updateNavNow } = require("../controller/navController");
const authMiddleware = require("../authMiddleware"); // optional

// Trigger NAV update manually
router.post("/update-now", authMiddleware, updateNavNow);

module.exports = router;
