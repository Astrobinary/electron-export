const help = require("./index");
const Handlebars = require("handlebars");
const style = require("./_style");
const table = require("./_table");
const cmd = require("node-cmd");

Handlebars.registerHelper("display_text", (rootStyle, block, group) => {
	let text = "";

	if (help.hasHang(group.el)) {
		text = listText(rootStyle, block, group, group.att.style);
	} else if (group.name === "table") {
		text = tableText(rootStyle, block, group);
	} else {
		text = blockText(rootStyle, block, group, group.att.style);
	}

	return new Handlebars.SafeString(text);
});

const blockText = (rootStyle, block, group, groupStyle) => {
	let text = "";

	group.el.forEach((line, lineIndex) => {
		if (!line.el && line.att.bmline) text += `<div style="${style.inlineCSS(rootStyle, block, group)}">&nbsp;</div>`;

		if (line.hasOwnProperty("el"))
			line.el.forEach((t, tIndex) => {
				if (t.name === "t") {
					if (!t.hasOwnProperty("att")) return;
					if (t.att.suppress) return;
					text += parseBlockText(rootStyle, group, groupStyle, line, lineIndex, t, tIndex);
				} else if (t.name === "xpp") {
					const ins = style.handleInstructions(t);
					if (ins !== null) text += ins;
				} else if (t.name === "rule") {
					text += handleBlockRules(line, t);
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
				hangCharacters += parseBlockText(rootStyle, group, groupStyle, line, lineIndex, t, tIndex);
			} else {
				text += parseBlockText(rootStyle, group, groupStyle, line, lineIndex, t, tIndex);
			}
		});
	});

	return `<td class="group-prehang" style="width: ${hangAmount}pt">${hangCharacters.trim()}</td><td class="group-hang" style="text-align:${group.el[1].att.qdtype}; max-width: ${group.el[1].att.lnwidth}pt;">${text}</td>`;
};

const tableText = (rootStyle, block, frame, groupStyle) => {
	const tgroup = frame.el[0];
	const colspec = tgroup.el.filter(item => item.name === "colspec");
	const thead = tgroup.el.filter(item => item.name === "thead");
	const tbody = tgroup.el[tgroup.el.length - 1].el;
	let tempHead = [];
	let text = "";

	//Push thead into main body rows
	if (thead !== undefined)
		thead.forEach(el => {
			el.el.forEach(row => {
				tempHead.push(row);
			});
		});

	tempHead = tempHead.reverse();

	tempHead.forEach(element => {
		tbody.unshift(element);
	});

	tbody.forEach((row, rowIndex) => {
		let td = "";

		row.el.forEach((col, colIndex) => {
			td += table.parseTD(rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspec);
		});

		if (rowIndex + 1 > tgroup.att.hdstyle_rows && tgroup.att.tgroupstyle === "fintab") {
			if (tgroup.att.stubcols) {
				if (row.att.row % 2 === 0) {
					text += `<tr row="${row.att.rowrel}">${td}</tr>`;
				} else {
					text += `<tr row="${row.att.rowrel}" style="background-color: #cceeff;">${td}</tr>`;
				}
			}
		} else {
			text += `<tr row="${row.att.rowrel}">${td}</tr>`;
		}
	});

	return text;
};

const parseBlockText = (rootStyle, group, groupStyle, line, lineIndex, t, tIndex) => {
	let text = "";
	// //Check for empty generated lines
	if (!t.el) {
		if (!t.hasOwnProperty("att")) return;
		if (t.att.hasOwnProperty("cgt") && t.hasOwnProperty("el")) return `<div>&nbsp;</div>`;
		return text;
	}

	//Removes leaders from sum1
	if (groupStyle === "sum1" || t.el[0].txt === ".") if (t.att.cgt) return "";

	t.el.forEach((el, elIndex) => {
		if (el) {
			if (el.type === "instruction") {
				const ins = style.handleInstructions(el);
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

				//Wrap text with styling
				text += style.wrapBlockText(el.txt, t.att.style, rootStyle, group, line, groupStyle, t, tIndex, lineIndex, elIndex);
			}
		}
	});

	return text;
};

const handleBlockRules = (line, t) => {
	if (line.el.length > 3) return "";

	let margin_top = "";
	if (line.att.qdtype === "left") margin_top = "";
	if (line.att.qdtype === "center") margin_top = "margin: auto; margin-top: 5px; margin-bottom: 5px;";

	if (t.att.y < 0) margin_top = `margin-top: ${t.att.y}pt;`;
	if (t.att.d === "0.5") t.att.d = "1";

	let margin_left = "";
	if (line.att.lindent !== "0") margin_left = `margin-left: ${line.att.lindent}p`;

	return `<div class="rule" style="height: 2.67px; border-bottom: ${t.att.d}pt solid ${t.att.color}; width: ${t.att.w}pt; ${margin_top} ${margin_left} display: inline-block;"> </div>`;
};
