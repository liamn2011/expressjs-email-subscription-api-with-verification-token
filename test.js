const shopifyApi = require("./modules/shopifyApi");
const businessLogic = require("./modules/businessLogic");

// (async () => {
// 	try {
// 		const result = await shopifyApi.getCustomers("");
// 		console.log("Success", result);
// 	} catch (error) {
// 		console.log("Error", error);
// 	}
// })();

// (async () => {
// 	try {
// 		const result = await shopifyApi.updateCustomers();
// 		console.log("Success", result);
// 	} catch (error) {
// 		console.log("Error", error);
// 	}
// })();

(async () => {
	try {
		const result = await businessLogic.subscribeUser("");
	} catch (error) {
		console.log("Error", error);
	}
})();
