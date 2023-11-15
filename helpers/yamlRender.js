const fs = require("fs");
const YAML = require("js-yaml");

const yamlRender = async () => {
	const raw = fs.readFileSync("./data.yaml");
	const data = YAML.load(raw);
	return data;
};

module.exports = yamlRender;
