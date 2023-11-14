require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	host: "smtppro.zoho.eu",
	port: 465,
	secure: true,
	auth: {
		user: process.env.NODEMAILER_USER,
		pass: process.env.NODEMAILER_PASS,
	},
});

exports.emailSend = async (to, subject, html) => {
	// send mail with defined transport object
	const info = await transporter.sendMail({
		from: process.env.FROM_EMAIL, // sender address
		to: to, // list of receivers
		subject: subject, // Subject line
		html: html, // html body
	});

	console.log("Message sent: %s", info.messageId);
};

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

exports.emailValidation = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
};

exports.UUIDValidation = (token) => {
	const tokenRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
	return tokenRegex.test(token);
};
