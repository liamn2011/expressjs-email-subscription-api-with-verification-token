const express = require("express");
const router = express.Router();
const subscribeController = require("../controllers/subscribeController");
const validateToken = require("../middleware/validateToken"); // You can create a middleware for token validation

// Define route for subscribing
router.post("/", validateToken, subscribeController.subscribeUser);

module.exports = router;
