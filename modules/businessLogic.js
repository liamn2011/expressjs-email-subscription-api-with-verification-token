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
				return utilities.jsonResponse({ success: false, message: "You're already a subscriber; we appreciate your return!", redirect: "/" }, 200);
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
			const updateResult = await shopifyApi.updateCustomers(result.responseBody.customers[0].id, "unsubscribed");
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
						<script src="https://kit.fontawesome.com/0dd279a637.js" crossorigin="anonymous"></script>
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
							.fa-brands {
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
																	<p>
																		You are one step of a way from being a member of the MUTTLIFE pack..... We just need you to verify your email address
																		before you become a MUTTLIFER.
																	</p>
																	<p>Please click the link below to verify your email. See you in the MUTTLIFE pack!</p>
																	<div class="verify-container">
																		<p>
																			<strong><a class="link" href="http://localhost:8000/verify?email=${to}&token=${token}">Click Here To Verify</a></strong>
																		</p>
																	</div>
																	<div class="social-icons">
																		<p>Follow us on:</p>
																		<i class="fa-brands fa-tiktok fa-xl"></i>
																		<i class="fa-brands fa-square-instagram fa-xl"></i>
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
								font-size: 16px;
								font-family: "Roboto";
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
																	<p>Welcome to the MUTTLIFE pack! We are so happy you are here!</p>
																	<p>As a MUTTLIFER, you will have acess to updates, new releases and spetacular events. This includes:</p>
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
