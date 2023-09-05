require("dotenv").config();
const axios = require("axios");

const apiCall = async (method, url, data) => {
	console.log("step1");
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
	console.log("step2");
	return axios
		.request(config)
		.then((response) => {
			console.log(JSON.stringify(response.data));
			console.log(response.status);
			return {
				responseBody: response.data,
				status: response.status,
			};
		})
		.catch((error) => {
			console.log(error);
			console.log(error.status);
			return {
				responseBody: error,
				status: error.status,
			};
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
