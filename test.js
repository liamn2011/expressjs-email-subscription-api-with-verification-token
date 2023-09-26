require("dotenv").config();
const utilities = require("./modules/utilities");

(async () => {
	try {
		const result = await utilities.emailSend("", "<b>Hello world? sdcsdcsdsd</b>");
	} catch (error) {
		console.log("Error", error);
	}
})();
