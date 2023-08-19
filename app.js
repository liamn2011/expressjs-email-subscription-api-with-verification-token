// Importing Modules
require("dotenv").config();
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const app = express();
const PORT = 3000;

// Secret key for JWT & Whitelisted Domains & JWT Expiry
const JWT_SECRET = process.env.JWT_SECRET_KEY;
const whitelist = ["http://example.com", "http://yourdomain.com", "http://localhost:8000"];
const expiresIn = "10s"; // Set an expiration time for the token (e.g., 1 hour)

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
app.use("/api/shopify", cors(corsOptions)); // Apply to specific endpoint

//Endpoint to generate JWT Token
app.post("/api/auth", (req, res) => {
	const { apiKey } = req.body;

	// You can validate the API key against your database or list of authorized keys here
	if (apiKey === process.env.API_KEY) {
		const token = jwt.sign({ apiKey }, JWT_SECRET, { expiresIn });
		res.json({ token });
	} else {
		res.status(401).json({ error: "Unauthorized" });
	}
});

// Shopify API Call
app.post("/api/shopify", validateToken, (req, res) => {
	let data = JSON.stringify(req.body);
	let config = {
		method: req.method,
		maxBodyLength: Infinity,
		url: process.env.SHOPIFY_URL,
		headers: {
			"X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
			"Content-Type": "application/json",
		},
		data: data,
	};
	axios
		.request(config)
		.then((response) => {
			console.log(JSON.stringify(response.data));
			console.log(response.status);
			res.send(response.data);
			res.status(response.status);
		})
		.catch((error) => {
			console.log(error);
			console.log(error.status);
			res.send(error);
			res.status(error.status);
		});
});
