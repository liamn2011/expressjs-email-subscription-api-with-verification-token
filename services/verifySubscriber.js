const shopifyApi = require("./shopifyApi");
const jsonResponse = require("../helpers/responseFormatter");
const sendEmailService = require("./sendEmail");
const yamlRender = require("../helpers/yamlRender");

const verifySubscriberService = async (email, token) => {
	try {
		const message = await yamlRender();
		const result = await shopifyApi.getCustomers(email);
		const customersArray = result.responseBody.customers[0];
		if (!customersArray) {
			return jsonResponse(
				{
					success: false,
					message: message.verifyEmailError,
					redirect: "/",
				},
				200
			);
		}
		if (customersArray.tags == token && customersArray.email == email) {
			await shopifyApi.updateCustomers(result.responseBody.customers[0].id, "Verified");
			await sendEmailService("verifySubscriber", email, "");
			return jsonResponse({ success: true, message: message.verifySucess, redirect: "/subscribed" }, 200);
		} else if (customersArray.tags == "Verified" && customersArray.email == email) {
			return jsonResponse(
				{
					success: true,
					message: message.alreadyVerified,
					redirect: "/subscribed",
				},
				200
			);
		} else {
			return jsonResponse(
				{
					success: false,
					message: message.issueVerifying,
					redirect: "/",
				},
				200
			);
		}
	} catch (error) {
		console.error("An error occurred:", error);
	}
};

module.exports = verifySubscriberService;
