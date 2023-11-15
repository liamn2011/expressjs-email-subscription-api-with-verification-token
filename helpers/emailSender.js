require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
	host: process.env.SMTP_HOST,
	port: 465,
	secure: true,
	auth: {
		user: process.env.NODEMAILER_USER,
		pass: process.env.NODEMAILER_PASS,
	},
});

const emailSender = async (to, subject, html) => {
	// send mail with defined transport object
	const info = await transporter.sendMail({
		from: process.env.FROM_EMAIL, // sender address
		to: to, // list of receivers
		subject: subject, // Subject line
		html: html, // html body
	});

	console.log("Message sent: %s", info.messageId);
};

module.exports = emailSender;
