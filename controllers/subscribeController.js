const sanitizeHtml = require("sanitize-html");
const emailValidation = require("../helpers/emailValidation");
const subscribeUserService = require("../services/subscribeUser");

const subscribeUser = async (req, res) => {
	let email = req.body.email;
	const sanitizedEmail = sanitizeHtml(email);
	const allowedProperties = ["email"];
	const additionalProperties = Object.keys(req.body).filter((property) => !allowedProperties.includes(property));

	if (additionalProperties.length > 0) {
		return res.status(400).json({ error: `Invalid properties: ${additionalProperties.join(", ")}` });
	}

	try {
		if (emailValidation(sanitizedEmail)) {
			const result = await subscribeUserService(sanitizedEmail);
			res.status(result.status).json(result.responseBody);
		} else {
			res.status(200).json({ error: "Invalid Email Address" });
		}
	} catch (error) {
		res.status(error.status).json(error);
	}
};

module.exports = {
	subscribeUser,
};
