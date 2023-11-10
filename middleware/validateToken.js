const jwt = require("jsonwebtoken");
const config = require("../config/config");

const validateToken = (req, res, next) => {
	const token = req.header("Authorization");

	if (!token) {
		return res.status(401).json({ error: "Unauthorized" });
	}

	try {
		const decoded = jwt.verify(token, config.JWT_SECRET);
		req.user = decoded;
		next();
	} catch (error) {
		return res.status(401).json({ error: "Unauthorized" });
	}
};

module.exports = validateToken;
