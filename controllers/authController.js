require("dotenv").config();
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const sanitizeHtml = require("sanitize-html");
const util = require("../modules/utilities");

const JWT_SECRET = config.JWT_SECRET;
const expiresIn = config.expiresIn;

const authenticate = (req, res) => {
	// Your authentication logic here
	const { apiKey } = req.body;
	const sanitizedApiKey = sanitizeHtml(apiKey, req.body);
	const allowedProperties = ["apiKey"];
	const additionalProperties = Object.keys(req.body).filter((property) => !allowedProperties.includes(property)); // Check for additional properties in the request body

	if (additionalProperties.length > 0) {
		res.setHeader("Content-Type", "application/json");
		res.status(400).json({ error: `Invalid properties: ${additionalProperties.join(", ")}` });
		return;
	}

	// You can validate the API key against your database or list of authorized keys here
	if (sanitizedApiKey === process.env.API_KEY) {
		const token = jwt.sign({ sanitizedApiKey }, JWT_SECRET, { expiresIn });
		res.setHeader("Content-Type", "application/json");
		res.json({ token });
	} else {
		res.setHeader("Content-Type", "application/json");
		res.status(401).json({ error: "Unauthorized" });
	}
};

module.exports = {
	authenticate,
};
