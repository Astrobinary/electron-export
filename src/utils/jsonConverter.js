const fs = require("fs");
const convert = require("xml-js");

const file = "json_test";
const path = "C:\\Users\\padillab\\Documents\\Development\\electron-export\\samples\\"; //For dev purposes only

const rawXML = fs.readFileSync(`${path}training\\xml_test.xml`, "utf8");
const removeFrame = /<block type="frame"([\s\S]*?)<\/block>/gm;
const xml = rawXML.replace(removeFrame, ""); //Removes XPP banner from XML

const generateJSON = () => {
	const options = {
		ignoreDoctype: true,
		ignoreDeclaration: true,
		ignoreComment: true,
		alwaysArray: true,
		spaces: 2,
		elementsKey: "el",
		attributesKey: "att",
		textKey: "txt",
		instructionKey: "ins",

		attributesFn: val => {
			if (val["trace"] === "delete") return undefined; //Removes deleted traces attributes

			return val;
		}
	};

	const results = convert.xml2json(xml, options);

	fs.writeFile(`${path}training\\${file}.json`, results, "utf8", err => {
		err ? console.log("Error creating file.") : console.log(`JSON file created (${file}.json)`);
	});

	return results;
};

export default generateJSON;
