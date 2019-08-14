const help = require("./index");
const Handlebars = require("handlebars");
const style = require("./_style");
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

	return `<td class="group-prehang" style="width: ${hangAmount}pt">${hangCharacters.trim()}</td><td class="group-hang" style="text-align:${group.el[1].att.qdtype}; max-width: ${group.el[1].att.lnwidth}pt;">${text}</td>`;
};

const tableText = (rootStyle, block, frame, groupStyle) => {
	let tgroup = frame.el[0];
	let colspec = tgroup.el.filter(item => item.name === "colspec");
	let thead = tgroup.el.filter(item => item.name === "thead");
	let tbody = tgroup.el[tgroup.el.length - 1].el;

	let tempHead = [];
	//Push thead into main body rows
	if (thead !== undefined)
		thead.forEach(el => {
			el.el.forEach(row => {
				tempHead.push(row);
			});
		});

	let text = "";

	tempHead = tempHead.reverse();

	tempHead.forEach(element => {
		tbody.unshift(element);
	});

	tbody.forEach((row, rowIndex) => {
		let colText = "";

		row.el.forEach((col, colIndex) => {
			colText += parseColumn(rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspec, checkXVrule(row));
		});

		text += `<tr row="${row.att.rowrel}">${colText}</tr>`;
	});

	return text;
};

const parseColumn = (rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspecs, xVrule) => {
	// if (col.att === undefined) return;
	let colspec = colspecs[col.att.col - 1];
	let rowStyle = "";
	let text = "";
	let addedStyle = "";
	let isNumber = false;
	let totalGut = 0;
	let backgroundColor = "";

	if (colspec === undefined) return;

	if (colspec.att.tbclgut > 0) {
		rowStyle += `padding-left: ${colspec.att.tbclwsp}pt; `;
		totalGut += parseFloat(colspec.att.tbclwsp);
	}
	if (colspec.att.tbcrgut > 0) {
		rowStyle += `padding-right: ${colspec.att.tbcrwsp}pt; `;
		totalGut += parseFloat(colspec.att.tbcrwsp);
	}

	// rowStyle += `padding-bottom: ${parseFloat(row.att.row_gutter)}pt;`;
	rowStyle += `height: ${row.att.tbrdepth - row.att.row_gutter / 2}pt;`;

	if (col.att.alfleft !== undefined) {
		isNumber = true;
		addedStyle += `text-align: ${tgroup.att.hj_mode};`;
	}

	rowStyle += `white-space: nowrap;`;

	rowStyle += `width: ${parseFloat(colspec.att.colwidth) - totalGut}pt; max-width: ${parseFloat(colspec.att.colwidth)}pt;`;

	let colspan = "";

	if (col.att.namest !== undefined) {
		let end = col.att.nameend.slice(3);
		let start = col.att.namest.slice(3);

		colspan = `colspan="${parseInt(end) - parseInt(start) + 1}"`;
	}

	let rowspan = "";

	if (col.att.morerows !== undefined) {
		colspan = `rowspan="${parseInt(col.att.morerows) + 1}"`;
	}

	if (xVrule > 0) {
		if (col.att.col < xVrule && col.att.hasOwnProperty("rule_info")) {
			rowStyle += `border-left: 1px solid black;`;
		}
	} else if (colspec.att.tbclrule > 0) {
		rowStyle += `border-left: 1px solid black;`;
	}

	if(row.att.row_gutter !== "0") rowStyle += `padding-top: ${row.att.row_gutter / 2}pt;`;

	col.el.forEach((group, groupIndex) => {
		group.el.forEach((line, lineIndex) => {
			if (col.att.rule_info && group.el.length - 1 === lineIndex) {
				if (col.att.rule_info === "1 0 0") {
					addedStyle += `border-bottom: 1pt solid;`;
				}
			}

			if (!line.el) return;

			addedStyle += `margin-top: ${line.att.prelead}pt;`;

			text += `<div class="${group.att.style}" style="${style.inlineCSS(rootStyle, block, group, groupIndex, addedStyle)} ">`;

			line.el.forEach((t, tIndex) => {
				if (!t.att) {
					const ins = handleInstructions(t);

					if (ins !== null) text += ins;
				} else if (t.name === "shape") {
					backgroundColor = `background-color: ${help.toRGB(t.att["color-cmyk"])};`;
				} else {
					if (t.att.suppress) return;

					let innertext = `${parseText(rootStyle, group, group.att.style, line, lineIndex, t, tIndex, true, isNumber)}`;

					// if (innertext === "" && !isNumber && !t.att.cgt && !parseInt(line.att.xfinal) < 1) innertext = `&nbsp;`;
					text += innertext;
				}
			});

			text += `</div>`;
		});
	});


	return `<td ${colspan} ${rowspan} align="${col.att.align}" valign="${col.att.valign}" style="${rowStyle} ${backgroundColor} " >${text}</td>`;
};

const checkXVrule = row => {
	let xVrule = 0;

	row.el.forEach(entry => {
		entry.el.forEach(group => {
			group.el.forEach(line => {
				if (line.hasOwnProperty("el"))
					line.el.forEach(t => {
						if (t.ins === "chgrow;xvrule") {
							xVrule = parseInt(entry.att.col);
							return;
						}
					});
			});
		});
	});

	return xVrule;
};

const parseText = (rootStyle, group, groupStyle, line, lineIndex, t, tIndex, isTable, isNumber) => {
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
				const ins = handleInstructions(el);
				if (ins !== null) text += ins;
			} else {
				//Adds usb to text
				if (elIndex > 1 && !isTable) {
					if (t.el[elIndex - 1].name === "xpp") {
						if (t.el[elIndex - 1].ins === "usb") {
							if (el.txt.split(" ")[0] === "") el.txt = `&nbsp;${el.txt.slice(1)}`;
						}
					}
				}

				if (isTable && isNumber) el.txt = el.txt.trim();

				//Wrap text with basic styling
				text += style.wrapText(el.txt, t.att.style, rootStyle, group, line, groupStyle, t, tIndex, lineIndex);
			}
		}
	});

	return text;
};

const handleInstructions = el => {
	if (el.ins === "qa") return `<br/>`;
	if (el.ins.includes("link;")) return `<a href="${el.ins.slice(5)}">`;
	if (el.ins === "/link") return `</a>`;
	if (el.ins === "sup") return `<sup style="line-height: 0;">`;
	if (el.ins === "reset") return `</sup>`;

	if (el.ins.includes("rx;")) return `<a name="${el.ins.slice(3)}"></a>`;

	return null;
};

const handleRules = (line, t) => {
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
