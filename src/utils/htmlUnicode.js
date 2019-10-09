import fs from "fs";
const config = JSON.parse(fs.readFileSync(`N:\\sd_liz\\unicode_config.json`));

const convertUnicode = xml => {
	Object.keys(config).forEach(function(key, index) {
		let regex = new RegExp(key, "gm");
		try {
			xml = xml.replace(regex, config[key]);
		} catch (error) {
			console.log(error);
		}
	});

	return xml;
};
export default convertUnicode;
