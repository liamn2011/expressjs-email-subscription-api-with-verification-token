const shopifyApi = require("./shopifyApi");
const utilities = require("./utilities");

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
			console.log(result.status);
			return result;
		} else {
			if (result.responseBody.customers[0].tags == "Verified" && result.responseBody.customers[0].email == email) {
				return utilities.jsonResponse({ errorCode: 1, error: "You've already registered" }, 409);
			} else {
				return utilities.jsonResponse({ errorCode: 2, error: "You need to verify your email address" }, 400);
			}
		}
	} catch (error) {
		console.error("An error occurred:", error);
	}
};

const createUser = async (email) => {
	const verification_token = utilities.uuidv4();
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
		const customersArray = result.responseBody.customers[0];
		if (!customersArray) {
			return utilities.jsonResponse({ errorCode: 3, error: "No customer found with this email." }, 401);
		}
		if (customersArray.tags == token && customersArray.email == email) {
			const updateResult = await shopifyApi.updateCustomers(result.responseBody.customers[0].id);
			return updateResult;
		} else if (customersArray.tags == "Verified" && customersArray.email == email) {
			return utilities.jsonResponse({ errorCode: 4, error: "You've already verified, Thank you for subscribing" }, 400);
		} else {
			return utilities.jsonResponse({ errorCode: 5, error: "Email & Token does not match" }, 412);
		}
	} catch (error) {
		console.error("An error occurred:", error);
	}
};

/*
================================================================================
======== Resubscribe (maybe deleted the original verification email) ===========
================================================================================
*/
