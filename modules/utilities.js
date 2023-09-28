require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	//service: "Godaddy",
	host: "smtppro.zoho.eu", //"smtp.forwardemail.net",
	port: 465,
	secure: true,
	auth: {
		// TODO: replace `user` and `pass` values from <https://forwardemail.net>
		user: process.env.NODEMAILER_USER,
		pass: process.env.NODEMAILER_PASS, //"be5e37d7e541bc269f3f1beb",
	},
});

// async..await is not allowed in global scope, must use a wrapper
exports.emailSend = async (to, subject, html) => {
	// send mail with defined transport object
	const info = await transporter.sendMail({
		from: "customerservices@muttlife.co.uk", // sender address
		to: to, // list of receivers
		subject: subject, // Subject line
		//text: "Hello world?", // plain text body
		html: html, // html body
	});

	console.log("Message sent: %s", info.messageId);
};

// emailSend().catch(console.error);

exports.jsonResponse = (responseBody, status) => {
	var response = {
		responseBody: responseBody,
		status: status,
	};

	return response;
};

exports.uuidv4 = () => {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8;
		return v.toString(16);
	});
};
