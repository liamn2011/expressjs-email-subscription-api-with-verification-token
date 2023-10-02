const shopifyApi = require("./shopifyApi");
const utilities = require("./utilities");

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
				return utilities.jsonResponse({ success: false, message: "You've already registered", redirect: "/" }, 200);
			} else {
				return utilities.jsonResponse({ success: false, message: "You need to verify your email address", redirect: "/" }, 200);
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
					message: "Unfortunately, we cannot find a subscriber with this email address. We'll redirect to the muttlife.co.uk web page to subscribe.",
					redirect: "/",
				},
				200
			); //No customer found with this email.
		}
		if (customersArray.tags == token && customersArray.email == email) {
			const updateResult = await shopifyApi.updateCustomers(result.responseBody.customers[0].id, "Verified");
			await sendEmail("verifySubscriber", email, "");
			return utilities.jsonResponse(
				{ success: true, message: "Hello and Thank you for verifying your email address. You'll be redirected shortly", redirect: "/subscribed" },
				200
			); //Congratulations, you've become a muttlifer
		} else if (customersArray.tags == "Verified" && customersArray.email == email) {
			return utilities.jsonResponse(
				{
					success: true,
					message: "Hello again! You've already verified, but Thank you for re-verifying. You'll be redirected shortly",
					redirect: "/subscribed",
				},
				200
			); //You've already verified, Thank you for subscribing
		} else {
			return utilities.jsonResponse(
				{
					success: false,
					message:
						"Umm, there appears to be a problem with verifying your mailing address. You'll be shortly redirected to the muttlife.co.uk web page where you can resubscribe",
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
			const updateResult = await shopifyApi.updateCustomers(result.responseBody.customers[0].id, "unsubscribed");
			return utilities.jsonResponse({ success: true, message: "unsubscribed", redirect: "/" }, 200);
		}
	} catch (error) {}
};

/*
================================================================================
======== Resubscribe (maybe deleted the original verification email) ===========
================================================================================
*/

/*
================================================================================
============================= Send Email Function ==============================
================================================================================
*/

const sendEmail = async (type, to, token) => {
	switch (type) {
		case "subscribeUser":
			utilities.emailSend(
				to,
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
							.body-td {
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
								background-color: black;
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
								border-top: solid black 1px;
								padding-top: 30px;
							}
							.link {
								color: #0000ee;
							}
							.verify-container {
								text-align: center;
							}
							@media screen and (max-width: 598px) {
								p,
								li {
									font-size: 30px;
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
											<img src="./logo.png" />
										</div>
										<table>
											<tr align="center">
												<table>
													<tbody>
														<tr>
															<td class="body-td">
																<div class="body">
																	<p>Hey ${to}!</p>
																	<p>You are one step of a way from being a fully fledged MUTTLIFER..... We just need you to verify your email address.</p>
																	<p>Please click the link below to verify. Catch you in the MUTTLIFER club!</p>
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
																		<td class="td1"><a class="link" href="http://localhost:8000/unsubscribe?email=${to}">Unsubscribe</a></td>
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
				to,
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
								background-color: blueviolet;
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
								border-top: solid black 1px;
								padding-top: 30px;
							}
							.link {
								color: #0000ee;
							}
							.verify-container {
								text-align: center;
							}
							@media screen and (max-width: 500px) {
								p,
								li {
									font-size: 30px;
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
											<img src="./logo.png" />
										</div>
										<table>
											<tr align="center">
												<table>
													<tbody>
														<tr>
															<td>
																<div class="body">
																	<p>Hey ${to}!</p>
																	<p>Welcome MUTTLIFER to the PACK! We are so happy to see you join</p>
																	<p>As a MUTTLIFE member, we'll provide with all the updates, new releases and spetacular events. This includes:</p>
																	<ul>
																		<li>Providing you with updates to our online shop development & the all exciting launch date</li>
																		<li>A sneak peak to our new clothing collection and brand new items</li>
																		<li>The list goes on........</li>
																	</ul>
																	<p>Keep mentally healthy, musically in-tuned, and animal loving</p>
																	<p>Sincerely, The MUTTLIFE Team</p>
																</div>
															</td>
														</tr>
														<tr>
															<td>
																<table class="footer">
																	<tr>
																		<td class="td1"><a class="link" href="http://localhost:8000/unsubscribe?email=${to}">Unsubscribe</a></td>
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
