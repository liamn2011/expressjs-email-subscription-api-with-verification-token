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
