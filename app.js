// Importing Modules
require("dotenv").config();
const helmet = require("helmet");
const sanitizeHtml = require("sanitize-html");
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const businessLogic = require("./modules/businessLogic");
const util = require("./modules/utilities");
const app = express();
const PORT = 3000;

// Secret key for JWT & Whitelisted Domains & JWT Expiry
const JWT_SECRET = process.env.JWT_SECRET_KEY;
const whitelist = ["http://example.com", "http://yourdomain.com", "http://localhost:8000", "http://www.localhost:8000", "http://www.localhost:9000"];
const expiresIn = "30s"; // Set an expiration time for the token (e.g., 1 hour)

// Configure CORS options
const corsOptions = {
	origin: function (origin, callback) {
		if (whitelist.indexOf(origin) !== -1 || !origin) {
			callback(null, true);
		} else {
			callback(new Error("Not allowed by CORS"));
		}
	},
};

// Apply rate limiting middleware
const limiter = rateLimit({
	windowMs: 60000, // 1 hour in milliseconds
	max: 100, // 100 requests per hour
});

// Middleware to validate JWT token
const validateToken = (req, res, next) => {
	const token = req.header("Authorization");

	if (!token) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	try {
		const decoded = jwt.verify(token, JWT_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		return res.status(401).json({ error: "Unauthorized" });
	}
};

// App / Express.js setup
app.use(express.json());
app.use(cors());
app.use(limiter);
app.listen(PORT, (error) => {
	if (!error) console.log(`Server is Successfully Running,and App is listening on port http://localhost:${PORT}`);
	else console.log("Error occurred, server can't start", error);
});

/*=======================  API Calls  =======================*/

//Apply CORS middleware with options for specific endpoints
app.use("/api/auth", cors(corsOptions)); // Apply to specific endpoint
app.use("/api/subscribe", cors(corsOptions)); // Apply to specific endpoint
app.use("/api/verify", cors(corsOptions));

//Endpoint to generate JWT Token
app.post("/api/auth", (req, res) => {
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
});

// Shopify API Call
app.post("/api/subscribe", validateToken, async (req, res) => {
	let email = req.body.email;
	const sanitizedEmail = sanitizeHtml(email);
	const allowedProperties = ["email"];
	const additionalProperties = Object.keys(req.body).filter((property) => !allowedProperties.includes(property)); // Check for additional properties in the request body

	if (additionalProperties.length > 0) {
		res.setHeader("Content-Type", "application/json");
		res.status(400).json({ error: `Invalid properties: ${additionalProperties.join(", ")}` });
		return;
	}

	try {
		if (util.emailValidation(sanitizedEmail)) {
			const result = await businessLogic.subscribeUser(sanitizedEmail);
			res.setHeader("Content-Type", "application/json");
			res.status(result.status);
			res.json(result.responseBody);
		} else {
			res.setHeader("Content-Type", "application/json");
			res.status(200).json({ error: "Invalid Email Address" });
		}
	} catch (error) {
		res.setHeader("Content-Type", "application/json");
		res.status(error.status);
		res.json(error);
	}
});

app.post("/api/verify", validateToken, async (req, res) => {
	let email = req.body.email;
	let token = req.body.token;
	const sanitizedEmail = sanitizeHtml(email);
	const sanitizedToken = sanitizeHtml(token);
	const allowedProperties = ["email", "token"];
	const additionalProperties = Object.keys(req.body).filter((property) => !allowedProperties.includes(property)); // Check for additional properties in the request body

	if (additionalProperties.length > 0) {
		res.setHeader("Content-Type", "application/json");
		res.status(400).json({ error: `Invalid properties: ${additionalProperties.join(", ")}` });
		return;
	}

	try {
		if (util.emailValidation(sanitizedEmail) && util.UUIDValidation(sanitizedToken)) {
			const result = await businessLogic.verifySubscriber(sanitizedEmail, sanitizedToken);
			res.setHeader("Content-Type", "application/json");
			res.status(result.status);
			res.json(result.responseBody);
		} else {
			res.setHeader("Content-Type", "application/json");
			res.status(200).json({ error: "Validation Error" });
		}
	} catch (error) {
		res.setHeader("Content-Type", "application/json");
		res.status(error.status);
		res.json(error);
	}
});

app.post("/api/unsubscribe", validateToken, async (req, res) => {
	let email = req.body.email;
	const sanitizedEmail = sanitizeHtml(email);
	const allowedProperties = ["email"];
	const additionalProperties = Object.keys(req.body).filter((property) => !allowedProperties.includes(property));

	if (additionalProperties.length > 0) {
		res.setHeader("Content-Type", "application/json");
		res.status(400).json({ error: `Invalid properties: ${additionalProperties.join(", ")}` });
		return;
	}

	try {
		if (util.emailValidation(sanitizedEmail)) {
			const result = await businessLogic.unsubscribeUser(sanitizedEmail);
			res.setHeader("Content-Type", "application/json");
			res.status(result.status);
			res.json(result.responseBody);
		} else {
			res.setHeader("Content-Type", "application/json");
			res.status(200).json({ error: "Validation Error" });
		}
	} catch (error) {
		res.setHeader("Content-Type", "application/json");
		res.status(error.status);
		res.json(error);
	}
});
