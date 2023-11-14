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
			return utilities.jsonResponse({ success: true, message: "Congratulations, you've become a subscriber", redirect: "/subscribed" }, 200);
		} else {
			if (result.responseBody.customers[0].tags == "Verified" && result.responseBody.customers[0].email == email) {
				return utilities.jsonResponse({ success: false, message: "You're already a subscriber.....", redirect: "/" }, 200);
			} else {
				await sendEmail("subscribeUser", email, customersArray[0].tags);
				return utilities.jsonResponse(
					{
						success: false,
						message: "You've already subscribed. To complete the process, please verify your email address. An email has been sent to your inbox.",
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
					message: "Unfortunately, we couldn't locate a subscriber with this email address......",
					redirect: "/",
				},
				200
			);
		}
		if (customersArray.tags == token && customersArray.email == email) {
			const updateResult = await shopifyApi.updateCustomers(result.responseBody.customers[0].id, "Verified");
			await sendEmail("verifySubscriber", email, "");
			return utilities.jsonResponse({ success: true, message: "Thank you for confirming your email address.", redirect: "/subscribed" }, 200); //Congratulations, you've become a muttlifer
		} else if (customersArray.tags == "Verified" && customersArray.email == email) {
			return utilities.jsonResponse(
				{
					success: true,
					message: "You've already verified, but thank you for reconfirming.",
					redirect: "/subscribed",
				},
				200
			);
		} else {
			return utilities.jsonResponse(
				{
					success: false,
					message: "Umm, it seems there is an issue with verifying your mailing address.",
					redirect: "/",
				},
				200
			);
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
					message: "You've already unsubscribed. We're sorry to see you go!",
					redirect: "/",
				},
				200
			);
		} else {
			await shopifyApi.deleteCustomers(result.responseBody.customers[0].id);
			return utilities.jsonResponse(
				{
					success: true,
					message: "We're sorry to see you go, ........",
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
								background-color: rgb(243, 243, 243);
							}
							table {
								width: 100%;
							}
				
							.td2 {
								text-align: right;
							}
							.logo {
								/* background: rgb(255, 207, 221);
								background: linear-gradient(249deg, rgba(255, 207, 221, 1) 0%, rgba(231, 92, 159, 0.5) 52%, rgba(203, 104, 221, 0.5) 100%); */
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
								padding-bottom: 30px;
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
				
							.main-image {
								display: block;
								margin-left: auto;
								margin-right: auto;
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
											<h1>Logo</h1>
										</div>
										<table>
											<tr align="center">
												<table>
													<tbody>
														<tr>
															<td class="body-td">
																<div class="body">
																	<p>Hey ${to}!</p>
																	<p>{{Verify Email Body}}</p>
																	<div class="verify-container">
																		<p>
																			<strong><a class="link" href="http://localhost:8000/verify?email=${to}&token=${token}">Click Here To Verify</a></strong>
																		</p>
																	</div>
																</div>
															</td>
														</tr>
														<tr>
															<td>
																<table class="footer">
																	<tr>
																		<td class="td1">
																			<a
																				style="color: inherit; text-decoration: none"
																				class="link"
																				href="http://localhost:8000/unsubscribe?email=${sanitizedTo}"
																				>Unsubscribe</a
																			>
																		</td>
																		<td class="td2"><span>&copy;2023 Copyright</span></td>
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
								background-color: rgb(243, 243, 243);
							}
							table {
								width: 100%;
							}
				
							.td2 {
								text-align: right;
							}
							.logo {
								/* background: rgb(255, 207, 221);
								background: linear-gradient(249deg, rgba(255, 207, 221, 1) 0%, rgba(231, 92, 159, 0.5) 52%, rgba(203, 104, 221, 0.5) 100%); */
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
								padding-bottom: 30px;
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
				
							.main-image {
								display: block;
								margin-left: auto;
								margin-right: auto;
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
											<h1>Logo</h1>
										</div>
										<table>
											<tr align="center">
												<table>
													<tbody>
														<tr>
															<td class="body-td">
																<div class="body">
																	<p>Hey ${sanitizedTo}</p>
																	<p>{{Welcome Email Body}}</p>
																	<div class="social-icons">
																		<h2>Social Media Links</h2>
																	</div>
																</div>
															</td>
														</tr>
														<tr>
															<td>
																<table class="footer">
																	<tr>
																		<td class="td1">
																			<a
																				style="color: inherit; text-decoration: none"
																				class="link"
																				href="http://localhost:8000/unsubscribe?email=${sanitizedTo}"
																				>Unsubscribe</a
																			>
																		</td>
																		<td class="td2"><span>&copy;2023 Copyright</span></td>
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
