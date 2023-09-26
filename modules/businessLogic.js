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
			return utilities.jsonResponse({ success: true, message: "Congratulations, you've become a muttlifer", redirect: "/subscribed" }, 200);
		} else {
			if (result.responseBody.customers[0].tags == "Verified" && result.responseBody.customers[0].email == email) {
				return utilities.jsonResponse({ success: false, message: "You've already registered", redirect: "/" }, 200);
			} else {
				return utilities.jsonResponse({ success: false, message: "You need to verify your email address", redirect: "/" }, 200);
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
		await sendEmail("subscribeUser", email, verification_token);
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
			return utilities.jsonResponse(
				{
					success: false,
					message: "Unfortunately, we cannot find a subscriber with this email address. We'll redirect to the muttlife.co.uk web page to subscribe.",
					redirect: "/",
				},
				200
			); //No customer found with this email.
		}
		if (customersArray.tags == token && customersArray.email == email) {
			const updateResult = await shopifyApi.updateCustomers(result.responseBody.customers[0].id);
			await sendEmail("verifySubscriber", email, "");
			return utilities.jsonResponse(
				{ success: true, message: "Hello and Thank you for verifying your email address. You'll be redirected shortly", redirect: "/subscribed" },
				200
			); //Congratulations, you've become a muttlifer
		} else if (customersArray.tags == "Verified" && customersArray.email == email) {
			return utilities.jsonResponse(
				{
					success: true,
					message: "Hello again! You've already verified, but Thank you for re-verifying. You'll be redirected shortly",
					redirect: "/subscribed",
				},
				200
			); //You've already verified, Thank you for subscribing
		} else {
			return utilities.jsonResponse(
				{
					success: false,
					message:
						"Umm, there appears to be a problem with verifying your mailing address. You'll be shortly redirected to the muttlife.co.uk web page where you can resubscribe",
					redirect: "/",
				},
				200
			); //Email & Token does not match
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

/*
================================================================================
============================= Send Email Function ==============================
================================================================================
*/

const sendEmail = async (type, to, token) => {
	switch (type) {
		case "subscribeUser":
			utilities.emailSend(
				to,
				"Verify your email address",
				`<div><h1>${to}</h1><h2>${token}</h2>
				<a href="http://localhost:8000/verify?email=${to}&token=${token}">ClickMe</a>
			</div>`
			);
			break;
		case "verifySubscriber":
			utilities.emailSend(to, "Thank you for verifying", `<h1>Welcome to Muttlife</h1>`);
			break;
		default:
			console.log("not worked");
			break;
	}
};
