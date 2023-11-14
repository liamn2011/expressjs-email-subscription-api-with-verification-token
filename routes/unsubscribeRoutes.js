const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateToken");
const unsubscribeController = require("../controllers/unsubscribeController");

router.post("/", validateToken, unsubscribeController.unsubscribeUser);

module.exports = router;
