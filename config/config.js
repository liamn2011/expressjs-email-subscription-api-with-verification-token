// config.js
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const config = {
	JWT_SECRET: process.env.JWT_SECRET_KEY,
	whitelist: ["http://localhost:8000", "http://www.localhost:8000", "http://www.localhost:9000"],
	expiresIn: "30s",
	corsOptions: {
		origin: function (origin, callback) {
			var whitelist = config.whitelist;
			if (whitelist.indexOf(origin) !== -1 || !origin) {
				callback(null, true);
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
	},
	limiter: rateLimit({
		windowMs: 60000,
		max: 100,
	}),
};

module.exports = config;
