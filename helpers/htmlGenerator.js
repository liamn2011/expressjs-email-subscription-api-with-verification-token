const fs = require("fs");
const handlebars = require("handlebars");

const htmlGenerator = async (template, replacement) => {
	const source = fs.readFileSync(template, "utf-8").toString();
	const templates = handlebars.compile(source);
	const replacements = replacement;
	return templates(replacements);
};

module.exports = htmlGenerator;
