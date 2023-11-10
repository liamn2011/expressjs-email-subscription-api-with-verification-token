const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateToken");
const unsubscribeController = require("../controllers/unsubscribeController");

// Define route for unsubscribing
router.post("/", validateToken, unsubscribeController.unsubscribeUser);

module.exports = router;
