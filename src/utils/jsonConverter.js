const fs = require("fs");
const convert = require("xml-js");

const file = "sample_bl";
const path = "C:\\Users\\padillab\\Documents\\Development\\electron-export\\src\\utils\\samples\\"; //For dev purposes only

const rawXML = fs.readFileSync(`${path}\\xml\\${file}.xml`, "utf8");
const removeFrame = /<block type="frame"([\s\S]*?)<\/block>/gm;
const xml = rawXML.replace(removeFrame, ""); //Removes XPP banner from XML

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

	fs.writeFile(`${path}\\json\\${file}.json`, results, "utf8", err => {
		err ? console.log("Error creating file.") : console.log(`JSON file created (${file}.json)`);
	});

	return results;
};

export default generateJSON;
