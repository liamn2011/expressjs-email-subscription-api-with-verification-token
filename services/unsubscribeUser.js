const shopifyApi = require("./shopifyApi");
const jsonResponse = require("../helpers/responseFormatter");
const yamlRender = require("../helpers/yamlRender");

const unsubscribeUserService = async (email) => {
	try {
		const message = await yamlRender();
		const result = await shopifyApi.getCustomers(email);
		const customersArray = result.responseBody.customers[0];
		if (!customersArray) {
			return jsonResponse(
				{
					success: false,
					message: message.alreadyUnsubscribed,
					redirect: "/",
				},
				200
			);
		} else {
			await shopifyApi.deleteCustomers(result.responseBody.customers[0].id);
			return jsonResponse(
				{
					success: true,
					message: message.unsubscribeSuccess,
					redirect: "/",
				},
				200
			);
		}
	} catch (error) {}
};

module.exports = unsubscribeUserService;
