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
			colText += parseColumn(rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspec, checkChgrow(row));
		});

		text += `<tr row="${row.att.rowrel}">${colText}</tr>`;
	});

	return text;
};

const parseColumn = (rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspecs, ruleprops) => {
	// if (col.att === undefined) return;
	let colspec = colspecs[col.att.col - 1];
	let rowStyle = "";
	let text = "";
	let addedStyle = "";
	let isNumber = false;
	let totalGut = 0;
	let backgroundColor = "";

	if (colspec === undefined) return;

	let colspan = "";

	if (col.att.namest !== undefined) {
		let end = col.att.nameend.slice(3);
		let start = col.att.namest.slice(3);

		colspan = `colspan="${parseInt(end) - parseInt(start) + 1}"`;
	}

	if (colspec.att.tbclgut > 0) {
		if (tgroup.att.hdstyle_rows !== "0" && rowIndex + 1 <= tgroup.att.hdstyle_rows) {
			rowStyle += `margin-left: ${colspec.att.tbclwsp}pt; padding-left: ${colspec.att.tbclwsp}pt;`;

			if (col.att.namest !== undefined) {
				if (parseInt(tgroup.att.cols) !== parseInt(col.att.nameend.slice(3)) - parseInt(col.att.namest.slice(3)) + parseInt(col.att.col)) {
					rowStyle += `margin-right: ${colspec.att.tbcrwsp}pt; padding-right: ${colspec.att.tbcrwsp}pt;`;
				}
			} else {
				if (tgroup.att.cols !== col.att.col) rowStyle += `margin-right: ${colspec.att.tbcrwsp}pt; padding-right: ${colspec.att.tbcrwsp}pt;`;
			}
		}

		totalGut += parseFloat(colspec.att.tbclgut) + parseFloat(colspec.att.tbcrgut);
	}

	rowStyle += `width: ${parseFloat(colspec.att.tbcmeas)}pt; max-width: ${parseFloat(colspec.att.colwidth)}pt;`;

	rowStyle += `height: ${row.att.tbrdepth}pt;`;
	rowStyle += `white-space: nowrap;`;

	if (col.att.alfleft !== undefined) isNumber = true;

	let rowspan = "";

	if (col.att.morerows !== undefined) {
		colspan = `rowspan="${parseInt(col.att.morerows) + 1}"`;
	}

	if (ruleprops.xvrule > 0) {
		if (col.att.col < ruleprops.xvrule && col.att.hasOwnProperty("rule_info")) {
			rowStyle += `border-left: 1px solid black;`;
		} else if (colspec.att.tbclrule > 0) {
			rowStyle += `border-left: 1px solid black;`;
		}
	} else {
		if (colspec.att.tbclrule > 0) rowStyle += `border-left: 1px solid black;`;
		if (colspec.att.tbcrrule > 0) rowStyle += `border-right: 1px solid black;`;
	}

	if (ruleprops.rule > 0) {
		if (col.att.col < ruleprops.rule && col.att.hasOwnProperty("rule_info")) {
			addedStyle += `border-bottom: 1px solid black;`;
		}
	}

	col.el.forEach((group, groupIndex) => {
		group.el.forEach((line, lineIndex) => {
			if (col.att.rule_info && group.el.length - 1 === lineIndex) {
				let rgb = "rgb(0, 0, 0)";
				if (row.att["rcolor-cmyk"] !== undefined) rgb = help.toRGB(row.att["rcolor-cmyk"]);

				let thickness = "1pt";
				if (row.att.rthk !== undefined && parseFloat(row.att.rthk) > 0.5) thickness = row.att.rthk;

				if (col.att.rule_info === "1 0 0") addedStyle += `border-bottom: ${thickness} solid ${rgb};`; //urule
				if (col.att.rule_info === "1 2 0") addedStyle += `border-bottom: ${thickness} solid ${rgb};`; //trule
				if (col.att.rule_info === "3 2 0") addedStyle += `border-bottom: 3pt double ${rgb};`; // doubel trule
				if (col.att.rule_info === "1 1 0") rowStyle += `border-bottom: ${thickness} solid ${rgb};`; //hrule
			}

			if (!line.el) return;

			if (line.att.lindent > 0) addedStyle += `padding-left: ${line.att.lindent}pt;`;

			if (tgroup.att.hdstyle_rows !== "0" && rowIndex + 1 <= tgroup.att.hdstyle_rows) {
			} else {
				let leftSpace = parseFloat(line.att.xfinal) - parseFloat(colspec.att.tbcxpos);

				if (leftSpace !== 0) {
					if (leftSpace / 2 + leftSpace < colspec.att.tbcmeas) {
						if (isNumber) addedStyle += `margin-left: ${leftSpace.toFixed(2)}pt;`;
						if (isNumber) if (tgroup.att.cols !== col.att.col) addedStyle += `margin-right: ${leftSpace.toFixed(2)}pt;`;
					} else {
						addedStyle += `margin-left: ${colspec.att.tbclwsp}pt;`;
						if (tgroup.att.cols !== col.att.col) addedStyle += `margin-right: ${colspec.att.tbcrwsp}pt;`;
					}
				}
			}

			if (line.att.prelead > 0) addedStyle += `margin-top: ${line.att.prelead}pt;`;

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

					if (innertext === "" && addedStyle.includes("border-bottom")) innertext = `&nbsp;`;
					text += innertext;
				}
			});

			text += `</div>`;
		});
	});

	return `<td ${colspan} ${rowspan} align="${col.att.align}" valign="${col.att.valign}" style="${rowStyle} ${backgroundColor} display: table-cell;" >${text}</td>`;
};

const checkChgrow = row => {
	let rulestats = { xvrule: 0, xrule: 0, rule: 0 };

	row.el.forEach(entry => {
		entry.el.forEach(group => {
			group.el.forEach(line => {
				if (line.hasOwnProperty("el"))
					line.el.forEach(t => {
						if (t.ins === undefined) return;
						let ins = t.ins;

						if (ins === "chgrow;xvrule") {
							rulestats.xvrule = parseInt(entry.att.col);
						}

						if (ins.includes("chgrow;xrule")) {
							rulestats.xrule = parseInt(entry.att.col);
						}

						if (ins.includes("chgrow;trule")) {
							rulestats.rule = parseInt(entry.att.col);
						}
					});
			});
		});
	});

	return rulestats;
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

				if (isTable && /\d/.test(el.txt) && isNumber) {
					if (/\$/.test(el.txt)) {
						el.txt = el.txt.replace(/ +?/g, "");
					} else {
						el.txt = el.txt.trim();
					}
				}

				//Wrap text with basic styling
				text += style.wrapText(el.txt, t.att.style, rootStyle, group, line, groupStyle, t, tIndex, lineIndex, elIndex);
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
