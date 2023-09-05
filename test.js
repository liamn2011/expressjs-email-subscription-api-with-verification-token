const shopifyApi = require("./modules/shopifyApi");
const businessLogic = require("./modules/businessLogic");

// (async () => {
// 	try {
// 		const result = await shopifyApi.getCustomers("liamn2011@gmail.comn");
// 		console.log("Success", result);
// 	} catch (error) {
// 		console.log("Error", error);
// 	}
// })();

// (async () => {
// 	try {
// 		const result = await shopifyApi.updateCustomers(5802138108110);
// 		console.log("Success", result);
// 	} catch (error) {
// 		console.log("Error", error);
// 	}
// })();

(async () => {
	try {
		const result = await businessLogic.subscribeUser("liamn2011222@gmail.com");
	} catch (error) {
		console.log("Error", error);
	}
})();
