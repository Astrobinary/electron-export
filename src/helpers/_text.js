const help = require("./index");
const style = require("./_style");

module.exports.text = (rootStyle, block, group, groupStyle) => {
	let text = "";

	group.el.forEach((line, lineIndex) => {
		// if (!line.el) text += `<div style="${style.generatedCSS(rootStyle, groupStyle)} ${style.inlineCSS(block, group)}">&nbsp;</div>`;

		if (line.hasOwnProperty("el"))
			line.el.forEach((t, tIndex) => {
				if (t.name === "t") {
					if (!t.hasOwnProperty("att")) return;
					if (t.att.suppress) return;
					text += this.parseText(rootStyle, group, groupStyle, line, lineIndex, t, tIndex);
				} else if (t.name === "xpp") {
					if (t.ins === "qa") text += `<br/>`;
				} else if (t.name === "rule") {
					text += handleRules(line, t);
				} else if (t.name === "image") {
					text += `[IMAGE PLACEHOLDER]`;
				}
			});
	});

	return text;
};

module.exports.listText = (rootStyle, block, group, groupStyle) => {
	let text = "";
	let hangCharacters = "";
	let hangAmount = group.el[1].att.lindent - group.el[0].att.lindent;

	group.el.forEach((line, lineIndex) => {
		help.onlyType(line.el, "element").forEach((t, tIndex) => {
			if (lineIndex === 0) {
				hangCharacters += this.parseText(rootStyle, group, groupStyle, line, lineIndex, t, tIndex);
			} else {
				text += this.parseText(rootStyle, group, groupStyle, line, lineIndex, t, tIndex);
			}
		});
	});

	return `<td class="group-prehang" style="width: ${hangAmount}pt">${hangCharacters.trim()}</td><td class="group-hang" style="text-align:${group.el[1].att.qdtype}">${text}</td>`;
};

//Wrap text in exception styling
module.exports.parseText = (rootStyle, group, groupStyle, line, lineIndex, t, tIndex) => {
	let text = "";
	// //Check for empty generated lines
	if (!t.el) {
		if (!t.hasOwnProperty("att")) {
			console.log(t);
			return;
		}
		if (t.att.hasOwnProperty("cgt") && t.hasOwnProperty("el")) return `<div>&nbsp;</div>`;
		return text;
	}

	t.el.forEach(el => {
		if (el)
			if (el.type === "instruction") {
				const ins = handleInstructions(el);
				if (ins !== null) text += ins;
			} else {
				text += style.wrapText(el.txt, t.att.style, rootStyle, group, line, groupStyle, t, tIndex, lineIndex);
			}
	});

	return text;
};

const handleInstructions = el => {
	if (el.ins === "qa") return `<br/>`;
	if (el.ins.includes("link;")) return `<a href="${el.ins.slice(5)}">`;

	if (el.ins === "/link") return `</a>`;

	return null;
};

const handleRules = (line, t) => {
	if (line.el[0].ins === "sumbox") return "";

	let margin = "";
	if (line.att.qdtype === "left") margin = "";
	if (line.att.qdtype === "center") margin = "margin: auto; margin-bottom: 10px; margin-top: 5px;";

	if (t.att.y < 0) margin = `margin-top: ${t.att.y}pt;`;

	return `<div class="hr-centered" style="height: 2.67px; border-bottom: ${t.att.d}pt solid #000000; width: ${t.att.w}pt; ${margin}"> </div>`;
};
