const shopifyApi = require("./shopifyApi");

/*
================================================================================
=========================== New Email Subscriber ===============================
================================================================================
*/

exports.subscribeUser = async (email) => {
	try {
		const result = await shopifyApi.getCustomers(email);
		const customersArray = result.responseBody.customers;
		if (customersArray.length == 0) {
			const result = await createUser(email);
			return result;
		} else {
			console.log("If account already exists, then I need to check they have verified there email address");
			if (result.responseBody.customers[0].tags == "Verified" && result.responseBody.customers[0].email == email) {
				console.log("You've already registered");
			} else {
				console.log("You need to verify your email address");
			}
		}
	} catch (error) {
		console.error("An error occurred:", error);
	}
};

const uuidv4 = async () => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};

const createUser = async (email) => {
	const verification_token = await uuidv4();
	try {
		const result = await shopifyApi.addCustomers(verification_token, email);
		return result;
	} catch (error) {
		console.error("An error occurred:", error);
		throw error;
	}
};

/*
================================================================================
======================== Subscriber email verification =========================
================================================================================
*/

exports.verifySubscriber = async (email, token) => {
	try {
		const result = await shopifyApi.getCustomers(email);
		if (result.responseBody.customers[0].tags == token && result.responseBody.customers[0].email == email) {
			const result = await shopifyApi.updateCustomers(result.responseBody.customers[0].id);
			return result;
		} else if (result.responseBody.customers[0].tags == "Verified" && result.responseBody.customers[0].email == email) {
			return "You've already verified, Thank you for subscribing";
		}
	} catch (error) {
		console.error("An error occurred:", error);
	}
};
