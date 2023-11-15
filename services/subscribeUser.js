const shopifyApi = require("./shopifyApi");
const jsonResponse = require("../helpers/responseFormatter");
const uuidv4 = require("../helpers/uuidGenerator");
const sendEmailService = require("./sendEmail");
const yamlRender = require("../helpers/yamlRender");

const subscribeUserService = async (email) => {
	try {
		const message = await yamlRender();
		const result = await shopifyApi.getCustomers(email);
		const customersArray = result.responseBody.customers;
		if (customersArray.length == 0) {
			const result = await createUser(email);
			console.log(result.status);
			return jsonResponse(
				{
					success: true,
					message: message.subscribeSuccess,
					redirect: "/subscribed",
				},
				200
			);
		} else {
			if (result.responseBody.customers[0].tags == "Verified" && result.responseBody.customers[0].email == email) {
				return jsonResponse(
					{
						success: false,
						message: message.alreadySubscribed,
						redirect: "/",
					},
					200
				);
			} else {
				await sendEmailService("subscribeUser", email, customersArray[0].tags);
				return jsonResponse(
					{
						success: false,
						message: message.needVerify,
						redirect: "/",
					},
					200
				);
			}
		}
	} catch (error) {
		console.error("An error occurred:", error);
	}
};

const createUser = async (email) => {
	const verification_token = uuidv4();
	try {
		const result = await shopifyApi.addCustomers(verification_token, email);
		await sendEmailService("subscribeUser", email, verification_token);
		return result;
	} catch (error) {
		console.error("An error occurred:", error);
		throw error;
	}
};

module.exports = subscribeUserService;
