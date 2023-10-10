const shopifyApi = require("./shopifyApi");
const utilities = require("./utilities");
const he = require("he");

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
				return utilities.jsonResponse({ success: false, message: "You're already a subscriber; we appreciate your support!", redirect: "/" }, 200);
			} else {
				await sendEmail("subscribeUser", email, customersArray[0].tags);
				return utilities.jsonResponse(
					{
						success: false,
						message:
							"You've successfully subscribed. To complete the process, please verify your email address. An email has been sent to your inbox.",
						redirect: "/",
					},
					200
				);
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
					message:
						"Unfortunately, we couldn't locate a subscriber with this email address. You will be redirected to the muttlife.co.uk webpage to where you can subscribe.",
					redirect: "/",
				},
				200
			); //No customer found with this email.
		}
		if (customersArray.tags == token && customersArray.email == email) {
			const updateResult = await shopifyApi.updateCustomers(result.responseBody.customers[0].id, "Verified");
			await sendEmail("verifySubscriber", email, "");
			return utilities.jsonResponse(
				{ success: true, message: "Thank you for confirming your email address. You will be redirected shortly.", redirect: "/subscribed" },
				200
			); //Congratulations, you've become a muttlifer
		} else if (customersArray.tags == "Verified" && customersArray.email == email) {
			return utilities.jsonResponse(
				{
					success: true,
					message: "You've already verified, but thank you for reconfirming. You'll be redirected shortly.",
					redirect: "/subscribed",
				},
				200
			); //You've already verified, Thank you for subscribing
		} else {
			return utilities.jsonResponse(
				{
					success: false,
					message:
						"Umm, it seems there is an issue with verifying your mailing address. You will be redirected to the muttlife.co.uk webpage to where you can subscribe.",
					redirect: "/",
				},
				200
			); //Email & Token does not match
		}
	} catch (error) {
		console.error("An error occurred:", error);
	}
};

exports.unsubscribeUser = async (email) => {
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
		} else {
			// const updateResult = await shopifyApi.updateCustomers(result.responseBody.customers[0].id, "unsubscribed");
			await shopifyApi.deleteCustomers(result.responseBody.customers[0].id);
			return utilities.jsonResponse(
				{
					success: true,
					message: "We're sorry to see you go, but we appreciate your past engagement; should you ever reconsider, you're always welcome back.",
					redirect: "/",
				},
				200
			);
		}
	} catch (error) {}
};

/*
================================================================================
============================= Send Email Function ==============================
================================================================================
*/

const sendEmail = async (type, to, token) => {
	const sanitizedTo = he.encode(to);
	const sanitizedToken = he.encode(token);
	switch (type) {
		case "subscribeUser":
			utilities.emailSend(
				sanitizedTo,
				"Verify your email address",
				`
				<!DOCTYPE html>
				<html lang="en">
					<head>
						<meta charset="UTF-8" />
						<meta name="viewport" content="width=device-width, initial-scale=1.0" />
						<title>Document</title>
						<style>
							* {
								margin: 0;
							}
							body {
								width: 100%;
								font-size: 16px;
								font-family: "Roboto", sans-serif;
							}
							.body-td,
							.footer {
								font-size: 16px;
								font-family: "Roboto", sans-serif;
							}
							p {
								margin: 30px;
							}
							.container {
								max-width: 50em;
							}
							table {
								width: 100%;
							}
				
							.td2 {
								text-align: right;
							}
							.logo {
								background-color: rgb(190, 115, 168);
								padding: 30px;
								margin-bottom: 20px;
							}
							.logo img {
								width: 400px;
							}
							.body {
								margin-bottom: 20px;
							}
							.footer {
								border-top: solid rgb(74, 70, 70) 1px;
								padding-top: 30px;
							}
							.link {
								color: #0000ee;
							}
							.verify-container {
								text-align: center;
							}
							.social-icons {
								text-align: center;
							}
				
							.instagram,
							.tiktok {
								width: 30px;
								margin: 0 10px 0 10px;
							}
							@media screen and (max-width: 598px) {
								p,
								li,
								td {
									font-size: 20px;
								}
							}
						</style>
					</head>
					<body>
						<table>
							<tr align="center">
								<td>
									<div class="container">
										<div class="logo">
											<img src="https://muttlifeemailimages.s3.eu-west-1.amazonaws.com/Logo+for+Figma+(White).png" />
										</div>
										<table>
											<tr align="center">
												<table>
													<tbody>
														<tr>
															<td class="body-td">
																<div class="body">
																	<p>Hey ${sanitizedTo}!</p>
																	<p>
																		You are one step of a way from being a member of the MUTTLIFE pack..... We just need you to verify your email address
																		before you become a MUTTLIFER.
																	</p>
																	<p>Please click the link below to verify your email. See you in the MUTTLIFE pack!</p>
																	<div class="verify-container">
																		<p>
																			<strong><a class="link" href="http://localhost:8000/verify?email=${sanitizedTo}&token=${sanitizedToken}">Click Here To Verify</a></strong>
																		</p>
																	</div>
																	<div class="social-icons">
																		<p style="margin-bottom: 10px">Follow us on:</p>
																		<i class=""><img class="tiktok" src="https://muttlifeemailimages.s3.eu-west-1.amazonaws.com/tiktokIcon.png" /></i>
																		<i class=""><img class="instagram" src="https://muttlifeemailimages.s3.eu-west-1.amazonaws.com/instagramIcon.png" /></i>
																	</div>
																</div>
															</td>
														</tr>
														<tr>
															<td>
																<table class="footer">
																	<tr>
																		<td class="td1"><a class="link" href="http://localhost:8000/unsubscribe?email=${sanitizedTo}">Unsubscribe</a></td>
																		<td class="td2"><span>&copy;2023 MUTTLIFE</span></td>
																	</tr>
																</table>
															</td>
														</tr>
													</tbody>
												</table>
											</tr>
										</table>
									</div>
								</td>
							</tr>
						</table>
					</body>
				</html>								
				`
			);
			break;
		case "verifySubscriber":
			utilities.emailSend(
				sanitizedTo,
				"Thank you for verifying",
				`
				<!DOCTYPE html>
				<html lang="en">
					<head>
						<meta charset="UTF-8" />
						<meta name="viewport" content="width=device-width, initial-scale=1.0" />
						<title>Document</title>
						<style>
							* {
								margin: 0;
							}
							body {
								width: 100%;
								font-size: 16px;
								font-family: "Roboto", sans-serif;
							}
							.body-td,
							.footer {
								font-size: 16px;
								font-family: "Roboto", sans-serif;
							}
							p {
								margin: 30px;
							}
							.container {
								max-width: 50em;
							}
							table {
								width: 100%;
							}
				
							.td2 {
								text-align: right;
							}
							.logo {
								background-color: rgb(190, 115, 168);
								padding: 30px;
								margin-bottom: 20px;
							}
							.logo img {
								width: 400px;
							}
							.body {
								margin-bottom: 20px;
							}
							.footer {
								border-top: solid rgb(74, 70, 70) 1px;
								padding-top: 30px;
							}
							.link {
								color: #0000ee;
							}
							.verify-container {
								text-align: center;
							}
							.social-icons {
								text-align: center;
							}
				
							.instagram,
							.tiktok {
								width: 30px;
								margin: 0 10px 0 10px;
							}
							@media screen and (max-width: 598px) {
								p,
								li,
								td {
									font-size: 20px;
								}
							}
						</style>
					</head>
					<body>
						<table>
							<tr align="center">
								<td>
									<div class="container">
										<div class="logo">
											<img src="https://muttlifeemailimages.s3.eu-west-1.amazonaws.com/Logo+for+Figma+(White).png" />
										</div>
										<table>
											<tr align="center">
												<table>
													<tbody>
														<tr>
															<td class="body-td">
																<div class="body">
																	<p>Hey ${sanitizedTo}!</p>
																	<p>Welcome to the PACK MUTTLIFER! We're absolutely thrilled to have you join our vibrant community.</p>
																	<p>
																		As a cherished member of MUTTLIFE, we'll provide with all the updates, new releases and spetacular events. Here's a
																		glimpse of what's coming your way:
																	</p>
																	<ul>
																		<li>
																			Stay tuned for exciting updates on the development of our online shop, and mark your calendar for the grand launch –
																			it's going to be awesome!
																		</li>
																		<li>Sneak a peek at our upcoming clothing collection, featuring brand new items that are bound to make a statement.</li>
																		<li>And much more!</li>
																	</ul>
																	<p>Stay mentally healthy, musically in-tuned, and keep spreading the love for animals.</p>
																	<p>Sincerely, <br /><br />The MUTTLIFE Team 🐾</p>
																	<div class="social-icons">
																		<p style="margin-bottom: 10px">Follow us on:</p>
																		<a href="https://www.tiktok.com/"
																			><img class="tiktok" src="https://muttlifeemailimages.s3.eu-west-1.amazonaws.com/tiktokIcon.png"
																		/></a>
																		<a href="https://www.instagram.com/"
																			><img class="instagram" src="https://muttlifeemailimages.s3.eu-west-1.amazonaws.com/instagramIcon.png"
																		/></a>
																	</div>
																</div>
															</td>
														</tr>
														<tr>
															<td>
																<table class="footer">
																	<tr>
																		<td class="td1"><a class="link" href="http://localhost:8000/unsubscribe?email=${sanitizedTo}">Unsubscribe</a></td>
																		<td class="td2"><span>&copy;2023 MUTTLIFE</span></td>
																	</tr>
																</table>
															</td>
														</tr>
													</tbody>
												</table>
											</tr>
										</table>
									</div>
								</td>
							</tr>
						</table>
					</body>
				</html>										
				`
			);
			break;
		default:
			console.log("not worked");
			break;
	}
};
