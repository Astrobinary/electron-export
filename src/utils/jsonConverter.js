import isDev from "electron-is-dev";
import fs from "fs";
import convert from "xml-js";

const generateJSON = path => {
	const rawXML = fs.readFileSync(`${path}\\tout.xml`, "utf8");
	const removeFrame = /<block type="frame"([\s\S]*?)<\/block>/gm;
	const xml = rawXML.replace(removeFrame, ""); //Removes XPP banner from XML

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

	if (isDev)
		fs.writeFile(`${path}\\gen.json`, results, "utf8", err => {
			err ? console.log("Error creating file.") : console.log(`JSON file created`);
		});

	return results;
};
export default generateJSON;
