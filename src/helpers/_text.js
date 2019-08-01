const help = require("./index");
const style = require("./_style");

module.exports.text = (rootStyle, block, group, groupStyle) => {
	let text = "";

	group.el.forEach((line, lineIndex) => {
		if (!line.el) text += `<div style="${style.generatedCSS(rootStyle, groupStyle)} ${style.inlineCSS(block, group)}">&nbsp;</div>`;

		help.onlyType(line.el, "element").forEach((t, tIndex) => {
			if (t.att.suppress) return;

			text += this.parseText(rootStyle, group, groupStyle, line, lineIndex, t, tIndex);
		});
	});

	return text;
};

//Wrap text in exception styling
module.exports.parseText = (rootStyle, group, groupStyle, line, lineIndex, t, tIndex) => {
	let text = "";
	let needsSpace = false;

	if (t.name === "xref") return text;

	if (!t.el) {
		if (t.att.hasOwnProperty("cgt")) {
			return `<div>&nbsp;</div>`;
		}
		return text;
	}

	if (t.el.length === 1) {
		if (t.el[0].type !== "text") needsSpace = true;
	}

	t.el.forEach(el => {
		if (needsSpace) text += " ";
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
