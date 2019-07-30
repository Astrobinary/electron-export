const fs = require("fs");
const convert = require("xml-js");

const file = "json_bancorp";
const path = "C:\\Users\\padillab\\Documents\\Development\\electron-export\\samples\\"; //For dev purposes only

const rawXML = fs.readFileSync(`${path}bancorp\\xml_bancorp.xml`, "utf8");
const removeFrame = /<block type="frame"([\s\S]*?)<\/block>/gm;
const xml = rawXML.replace(removeFrame, ""); //Removes XPP banner from XML

const removeEmptyElement = /{},\s\n*/gm;
const removeEmptyLastElement = /,\n\s*?{}/gm;

const generateJSON = () => {
	const options = {
		ignoreDoctype: true,
		ignoreDeclaration: true,
		ignoreComment: true,
		compact: true,
		spaces: 2,
		textKey: "txt",
		attributesKey: "att",
		elementsKey: "el",
		instructionKey: "ins",
		attributesFn: val => {
			return val["trace"] !== "delete" ? val : null; //Removes deleted traces attributes
		}
	};

	const results = convert.xml2json(xml, options);
	let cleanResults = results.replace(removeEmptyElement, "");
	cleanResults = cleanResults.replace(removeEmptyLastElement, "");

	fs.writeFile(`${path}bancorp\\${file}.json`, cleanResults, "utf8", err => {
		err ? console.log("Error creating file.") : console.log(`JSON file created (${file}.json)`);
	});

	return cleanResults;
};

export default generateJSON;
