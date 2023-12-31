const express = require("express");
const router = express.Router();
const validateToken = require("../middleware/validateToken");
const verifyController = require("../controllers/verifyController");

router.post("/", validateToken, verifyController.verifySubscriber);

module.exports = router;
