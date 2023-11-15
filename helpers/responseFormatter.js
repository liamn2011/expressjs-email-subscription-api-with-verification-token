const jsonResponse = (responseBody, status) => {
	var response = {
		responseBody: responseBody,
		status: status,
	};

	return response;
};

module.exports = jsonResponse;
