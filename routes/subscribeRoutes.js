const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateToken"); // You can create a middleware for token validation
const subscribeController = require("../controllers/subscribeController");

router.post("/", validateToken, subscribeController.subscribeUser);

module.exports = router;
