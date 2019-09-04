const fs = require("fs");
const convert = require("xml-js");

const file = "json_test";
const path = "C:\\Users\\padillab\\Documents\\Development\\electron-export\\samples\\"; //For dev purposes only

const rawXML = fs.readFileSync(`${path}\\xml_test.xml`, "utf8");
const removeFrame = /<block type="frame"([\s\S]*?)<\/block>/gm;

const xml = rawXML.replace(removeFrame, ""); //Removes XPP banner from XML

const generateJSON = () => {
	const options = {
		ignoreDoctype: true,
		ignoreDeclaration: true,
		ignoreComment: true,
		alwaysArray: true,
		captureSpacesBetweenElements: true,
		spaces: 2,
		elementsKey: "el",
		attributesKey: "att",
		textKey: "txt",
		instructionKey: "ins"
	};

	let results = convert.xml2json(xml, options);

	const removeWithComma = /.\{([\s].*?)"type": "text",[\s\S].*"txt": "\\r.*"[\s\S].*\},\n\s*/gm;
	const removeNoComma = /.\},[\s].*\{([\s].*?)"type": "text",[\s\S].*"txt": "\\r.*"[\s\S].*\}\n\s*/gm;
	results = results.replace(removeWithComma, "");
	results = results.replace(removeNoComma, "}");

	fs.writeFile(`${path}\\${file}.json`, results, "utf8", err => {
		err ? console.log("Error creating file.") : console.log(`JSON file created (${file}.json)`);
	});

	return results;
};

export default generateJSON;
