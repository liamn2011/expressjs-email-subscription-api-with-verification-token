const he = require("he");
const emailSender = require("../helpers/emailSender");
const htmlGenerator = require("../helpers/htmlGenerator");

const sendEmailService = async (type, to, token) => {
	const sanitizedTo = he.encode(to);
	const sanitizedToken = he.encode(token);
	switch (type) {
		case "subscribeUser":
			emailSender(
				sanitizedTo,
				"Verify your email address",
				await htmlGenerator("./services/emailTemplates/subscribeUser.html", {
					To: sanitizedTo,
					Token: sanitizedToken,
				})
			);
			break;
		case "verifySubscriber":
			emailSender(
				sanitizedTo,
				"Thank you for verifying",
				await htmlGenerator("./services/emailTemplates//verifySubscriber.html", {
					To: sanitizedTo,
				})
			);
			break;
		default:
			console.log("not worked");
			break;
	}
};

module.exports = sendEmailService;
