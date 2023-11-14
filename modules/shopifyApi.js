require("dotenv").config();
const axios = require("axios");
const utilities = require("./utilities");

const apiCall = async (method, url, data) => {
	let config = {
		method: method,
		maxBodyLength: Infinity,
		url: url,
		headers: {
			"X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
			"Content-Type": "application/json",
		},
		data: data,
	};
	return axios
		.request(config)
		.then((response) => {
			return utilities.jsonResponse(response.data, response.status);
		})
		.catch((error) => {
			return utilities.jsonResponse(error, error.response.status);
		});
};

exports.getCustomers = async (email) => {
	console.log("getCustomers");
	const result = await apiCall(
		"GET",
		"https://" + process.env.SHOPIFY_DOMAIN + ".myshopify.com/admin/api/2023-04/customers/search.json?query=email:" + email
	);
	return result;
};

exports.updateCustomers = async (customerId, tags) => {
	console.log("updateCustomers");
	let state = tags == "Verified" ? "subscribed" : "unsubscribed";
	let data = JSON.stringify({
		customer: {
			id: customerId,
			tags: tags,
			first_name: null,
			email_marketing_consent: {
				state: state,
				opt_in_level: "confirmed_opt_in",
			},
		},
	});
	const result = await apiCall(
		"PUT",
		"https://" + process.env.SHOPIFY_DOMAIN + ".myshopify.com/admin/api/2023-04/customers/" + customerId + ".json",
		data
	);
	return result;
};

exports.addCustomers = async (verification_token, email) => {
	console.log("addCustomers");
	let data = JSON.stringify({
		customer: {
			first_name: verification_token,
			email: email,
			tags: verification_token,
			email_marketing_consent: {
				state: "unsubscribed",
				opt_in_level: "confirmed_opt_in",
			},
		},
	});
	const result = await apiCall("POST", "https://" + process.env.SHOPIFY_DOMAIN + ".myshopify.com/admin/api/2023-04/customers.json", data);
	return result;
};

exports.deleteCustomers = async (customerId) => {
	console.log("deleteCustomers");
	const result = await apiCall(
		"DELETE",
		"https://" + process.env.SHOPIFY_DOMAIN + ".myshopify.com/admin/api/2023-04/customers/" + customerId + ".json"
	);
	return result;
};
