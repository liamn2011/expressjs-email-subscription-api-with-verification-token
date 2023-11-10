const sanitizeHtml = require("sanitize-html");
const util = require("../modules/utilities");
const businessLogic = require("../modules/businessLogic");

const verifySubscriber = async (req, res) => {
	let email = req.body.email;
	let token = req.body.token;
	const sanitizedEmail = sanitizeHtml(email);
	const sanitizedToken = sanitizeHtml(token);
	const allowedProperties = ["email", "token"];
	const additionalProperties = Object.keys(req.body).filter((property) => !allowedProperties.includes(property));

	if (additionalProperties.length > 0) {
		return res.status(400).json({ error: `Invalid properties: ${additionalProperties.join(", ")}` });
	}

	try {
		if (util.emailValidation(sanitizedEmail) && util.UUIDValidation(sanitizedToken)) {
			const result = await businessLogic.verifySubscriber(sanitizedEmail, sanitizedToken);
			res.status(result.status).json(result.responseBody);
		} else {
			res.status(200).json({ error: "Validation Error" });
		}
	} catch (error) {
		res.status(error.status).json(error);
	}
};

module.exports = {
	verifySubscriber,
};
