const UUIDValidation = (token) => {
	const tokenRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
	return tokenRegex.test(token);
};

module.exports = UUIDValidation;
