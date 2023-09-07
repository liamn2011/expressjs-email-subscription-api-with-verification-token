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
	const result = await apiCall("GET", "https://muttlifemcr.myshopify.com/admin/api/2023-04/customers/search.json?query=email:" + email);
	return result;
};

exports.updateCustomers = async (customerId) => {
	console.log("updateCustomers");
	let data = JSON.stringify({
		customer: {
			id: customerId,
			tags: "Verified",
			first_name: null,
		},
	});
	const result = await apiCall("PUT", "https://muttlifemcr.myshopify.com/admin/api/2023-04/customers/" + customerId + ".json", data);
	return result;
};

exports.addCustomers = async (verification_token, email) => {
	console.log("addCustomers");
	let data = JSON.stringify({
		customer: {
			first_name: verification_token,
			email: email,
			verified_email: true,
			send_email_welcome: true,
			tags: verification_token,
			accepts_marketing: true,
		},
	});
	const result = await apiCall("POST", "https://muttlifemcr.myshopify.com/admin/api/2023-04/customers.json", data);
	return result;
};
