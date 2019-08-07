const help = require("./index");
const Handlebars = require("handlebars");
const style = require("./_style");
const cmd = require("node-cmd");

Handlebars.registerHelper("display_text", (rootStyle, block, group) => {
	let text = "";

	if (help.hasHang(group.el)) {
		text = listText(rootStyle, block, group, group.att.style);
	} else {
		text = blockText(rootStyle, block, group, group.att.style);
	}

	return new Handlebars.SafeString(text);
});

const blockText = (rootStyle, block, group, groupStyle) => {
	let text = "";

	group.el.forEach((line, lineIndex) => {
		if (!line.el && line.att.bmline) text += `<div style="${style.generatedCSS(rootStyle, groupStyle)} ${style.inlineCSS(block, group)}">&nbsp;</div>`;

		if (line.hasOwnProperty("el"))
			line.el.forEach((t, tIndex) => {
				if (t.name === "t") {
					if (!t.hasOwnProperty("att")) return;
					if (t.att.suppress) return;
					text += parseText(rootStyle, group, groupStyle, line, lineIndex, t, tIndex);
				} else if (t.name === "xpp") {
					if (t.ins === "qa") text += `<br/>`;
					if (t.ins.includes("rx;")) text += `<a name="${t.ins.slice(3)}"></a>`;
				} else if (t.name === "rule") {
					text += handleRules(line, t);
				} else if (t.name === "image") {
					// cmd.get(`n: & cd N:\\xz\\gs & gs.exe -dDEVICEWIDTHPOINTS=${t.att.w} -dDEVICEHEIGHTPOINTS=${t.att.h} -sDEVICE=jpeg -dJPEGQ=100 -r300 -o C:\\Users\\padillab\\Documents\\Development\\electron-export\\output\\${t.att.id.substring(0, t.att.id.length - 4)}.jpg N:\\graphics\\house\\${t.att.id}`);
					text += `<img style="-ms-interpolation-mode: bicubic; width: ${parseFloat(t.att.w) * parseFloat(t.att.scale)}pt; max-width: 100%; vertical-align: bottom;" src="${t.att.id.substring(0, t.att.id.length - 4)}.jpg"/>`;
				}
			});
	});

	return text;
};

const listText = (rootStyle, block, group, groupStyle) => {
	let text = "";
	let hangCharacters = "";
	let hangAmount = group.el[1].att.lindent - group.el[0].att.lindent;

	group.el.forEach((line, lineIndex) => {
		help.onlyType(line.el, "element").forEach((t, tIndex) => {
			if (t.att.suppress) return;
			if (lineIndex === 0) {
				hangCharacters += parseText(rootStyle, group, groupStyle, line, lineIndex, t, tIndex);
			} else {
				text += parseText(rootStyle, group, groupStyle, line, lineIndex, t, tIndex);
			}
		});
	});

	return `<td class="group-prehang" style="width: ${hangAmount}pt">${hangCharacters.trim()}</td><td class="group-hang" style="text-align:${group.el[1].att.qdtype}">${text}</td>`;
};

const parseText = (rootStyle, group, groupStyle, line, lineIndex, t, tIndex) => {
	let text = "";
	// //Check for empty generated lines
	if (!t.el) {
		if (!t.hasOwnProperty("att")) return;
		if (t.att.hasOwnProperty("cgt") && t.hasOwnProperty("el")) return `<div>&nbsp;</div>`;
		return text;
	}

	//Removes leaders from sum1
	if (groupStyle === "sum1") if (t.att.cgt) return "";

	t.el.forEach((el, elIndex) => {
		if (el)
			if (el.type === "instruction") {
				const ins = handleInstructions(el);
				if (ins !== null) text += ins;
			} else {
				//Adds usb to text
				if (elIndex > 1) {
					if (t.el[elIndex - 1].name === "xpp") {
						if (t.el[elIndex - 1].ins === "usb") {
							if (el.txt.split(" ")[0] === "") el.txt = `&nbsp;${el.txt.slice(1)}`;
						}
					}
				}

				//Wrap text with basic styling
				text += style.wrapText(el.txt, t.att.style, rootStyle, group, line, groupStyle, t, tIndex, lineIndex);
			}
	});

	return text;
};

const handleInstructions = el => {
	if (el.ins === "qa") return `<br/>`;
	if (el.ins.includes("link;")) return `<a href="${el.ins.slice(5)}">`;
	if (el.ins === "/link") return `</a>`;

	if (el.ins.includes("rx;")) return `<a name="${el.ins.slice(3)}"></a>`;

	return null;
};

const handleRules = (line, t) => {
	if (line.el[0].ins === "sumbox") return "";

	let margin_top = "";
	if (line.att.qdtype === "left") margin_top = "";
	if (line.att.qdtype === "center") margin_top = "margin: auto; margin-bottom: 10px; margin-top: 5px;";

	if (t.att.y < 0) margin_top = `margin-top: ${t.att.y}pt;`;
	if (t.att.d === "0.5") t.att.d = "1";

	let margin_left = "";
	if (line.att.lindent !== "0") margin_top = `margin-left: ${line.att.lindent}p`;

	return `<div class="hr-centered" style="height: 2.67px; border-bottom: ${t.att.d}pt solid ${t.att.color}; width: ${t.att.w}pt; ${margin_top} ${margin_left}"> </div>`;
};
