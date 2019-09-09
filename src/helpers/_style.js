const help = require("./index");

//Created style based on element attributes
module.exports.inlineCSS = (rootStyle, block, group, gindex) => {
	let att;
	let style = "";
	let rootatt;

	group.el[0].att.bmline ? (att = group.el[1].att) : (att = group.el[0].att);

	rootStyle.forEach(item => {
		if (item.att.name === group.att.style) {
			rootatt = item.att;
			return;
		}
	});

	//Left indent & levels
	if (group.el[0].att.lindent > 0) {
		if (group.el[1] !== undefined) {
			if (group.el[0].att.lindent > group.el[1].att.lindent) {
				style += `text-indent: ${att.lindent - group.el[1].att.lindent}pt;`;
				if (group.el[1].att.lindent > 0) style += `padding-left: ${group.el[1].att.lindent}pt;`;
			} else {
				style += `padding-left: ${att.lindent}pt;`;
			}
		} else {
			style += `text-indent: ${att.lindent}pt;`;
		}
	}

	if (group.el[0].att.rindent > 0) {
		style += `padding-left: ${att.rindent}pt;`;
	}

	//Right indent
	style += `text-align: ${att.qdtype}; `;

	//Add margin if not first block in group (used for pc2)
	if (block.att.ipcnum === "2" && (block.att.fipcblk || block.att.lipcblk)) {
		if (att.prelead === "0") {
			style += `margin-top: ${parseFloat(att.prelead) + parseFloat(att.yfinal)}pt;`;
		} else {
			style += `margin-top: ${parseFloat(att.prelead)}pt;`;
		}
	} else {
		if (gindex === 0 && group.att.class === "ftnote") {
			style += `margin-top: ${parseFloat(att.prelead) + 5}pt;`;
		} else {
			style += `margin-top: ${parseFloat(att.prelead)}pt;`;
		}
	}
	if (group.att.class === "sum1") {
		if (group.el.length > 1)
			if (group.el[1].att.lindent !== 0 && group.el[1].att.lindent < 100) {
				style += `margin-left: ${group.el[1].att.lindent}pt; text-indent: -${group.el[1].att.lindent}pt;`;
			}

		style += `max-width: ${group.el[0].att.lnwidth}pt;`;
	}

	let fontFamily = "";

	if (rootatt !== undefined) {
		if (rootatt.font.includes("Arial")) {
			fontFamily = "Arial";
		} else if (rootatt.font.includes("Times")) {
			fontFamily = "Times New Roman";
		} else if (rootatt.font.includes("Helvetica")) {
			fontFamily = "Helvetica";
		} else {
			fontFamily = "Arial";
		}

		let lineHeight = `line-height: ${parseFloat(rootatt.size) + parseFloat(att.ldextra)}pt;`;

		if (group.el[0].hasOwnProperty("el")) {
			if (group.el[0].el.length > 1) {
				if (group.el[0].el[1].name === "rule") {
					lineHeight = `line-height: 0pt;`;
				}
			}
		}

		style += `font-size: ${rootatt.size}pt; ${lineHeight} font-family: ${fontFamily};`;
	}

	return style.trim();
};

module.exports.wrapBlockText = (text, style, rootStyle, group, line, groupCSS, t, tIndex, lineIndex, elIndex) => {
	let att, groupATT;
	let styles = "";
	let styleWrap = "";

	//Dont style empty text...
	if (!/\S/.test(text)) return text;
	text = text.replace(/</gm, "&lt;");
	text = text.replace(/>/gm, "&gt;");

	//Search through generated style objs
	rootStyle.forEach(element => {
		if (element.att.name === style) {
			att = element.att;
			return;
		}
	});

	rootStyle.forEach(element => {
		if (element.att.name === groupCSS) {
			groupATT = element.att;
			return;
		}
	});

	//Checks for different color
	if (att.color !== "#000000") {
		styles += `color: ${att.color};`;
	}
	//Adds bg color to text
	if (att.hasOwnProperty("background-color")) styles += `background-color: ${att["background-color"]};`;

	//Checks for different size
	if (att.size !== groupATT.size) {
		styles += `font-size: ${att.size}pt;`;
	}

	//If broken with a <qa> and alignment is different; has to be last T in an line element
	if (group.el[0].att.qdtype !== line.att.qdtype && line.att.quadset && line.el.length - 1 === tIndex && text.length > 1 && line.att.qdtype !== "forcej") {
		if (/\S/.test(text)) if (group.el[lineIndex - 1].att.quadset === "true") text = `<div style="text-align: ${line.att.qdtype};">${text}</div>`;
	} else if (line.att.quadset && text.length > 1 && t.att.cgt) {
		text += `</br>`;
	}

	//Handles strikes and double underlines
	if (t.att.hasOwnProperty("ul8")) styles += `text-decoration: line-through;`;
	if (t.att.hasOwnProperty("ul10")) styles += `border-bottom: 3px double;`;
	if (t.att.hasOwnProperty("ul8") && t.att.hasOwnProperty("ul10")) style += `text-decoration: line-through; border-bottom: 3px double;`;

	//Handles Y value
	if (t.att.y > 0) styles += `transform: translateY(${t.att.y}pt); display: inline-block;`;

	//Handles CM casing
	if (att.cm === "upper") {
		styles += `text-transform: uppercase;`;
	} else if (att.cm === "lower") {
		styles += `text-transform: lowercase;`;
	} else if (att.cm === "smallcap") {
		styles += `font-variant: small-caps;`;
	}

	//Handles bullets
	if (text === "󰄝") text = `<font style=" font-size: 16pt; line-height: 12pt;">&#8226;</font>`; //Bullet to html??

	//Handles underlines
	if (t.att.ul1) text = `<u>${text}</u>`;

	//Wraps text in basic styles
	if (styles !== "") styleWrap = `style="${styles}"`;

	if (att.fv === "1") {
		text = `<b ${styleWrap}>${text}</b>`.trim();
	} else if (att.fv === "2") {
		text = `<i ${styleWrap}>${text}</i>`.trim();
	} else if (att.fv === "3") {
		text = `<b><i ${styleWrap}>${text}</i></b>`.trim();
	} else if (styles !== "") {
		text = `<var style="${styles} font-style: inherit;">${text}</var>`.trim();
	}

	//Wraps text around page ref link
	if (tIndex > 1 && t.att.cgt) if (group.el[lineIndex].el[tIndex - 1].name === "xref") text = `<a href="#${group.el[lineIndex].el[tIndex - 1].att.id}">${text}</a>`;

	return text;
};

//Style related to table rows (TD)
module.exports.rowStyle = (rootStyle, tgroup, row, rowIndex, col, colspec) => {
	const styleClass = col.el[0].att.style;
	const firstLine = col.el[0].el[0];
	const isLast = this.isLastColumn(tgroup, col);

	let rowStyle = [];
	let rootAtt;

	rootStyle.forEach(item => {
		if (item.att.name === styleClass) {
			rootAtt = item.att;
			return;
		}
	});

	if (colspec.att.tbclgut > 0) {
		//Cell Header rows
		if (tgroup.att.hdstyle_rows !== "0" && rowIndex + 1 <= tgroup.att.hdstyle_rows) {
			if (tgroup.att.tgroupstyle === "fintab") rowStyle.push(`margin-left: ${colspec.att.tbclwsp}pt; padding-left: ${parseInt(colspec.att.tbclwsp)}pt;`);

			if (col.att.namest !== undefined) {
				if (parseInt(tgroup.att.cols) !== parseInt(col.att.nameend.slice(3)) - parseInt(col.att.namest.slice(3)) + parseInt(col.att.col)) {
					rowStyle.push(`margin-right: ${colspec.att.tbcrwsp}pt; padding-right: ${colspec.att.tbcrwsp}pt;`);
				}
			} else {
				if (tgroup.att.cols !== col.att.col) rowStyle.push(`margin-right: ${colspec.att.tbcrwsp}pt; padding-right: ${colspec.att.tbcrwsp}pt;`);
			}
		}
	}

	if (isLast && tgroup.att.tgroupstyle === "fintab" && this.hasCalHang(col)) {
		rowStyle.push(`padding-right: 2ch;`);
	} else if (isLast && tgroup.att.tgroupstyle === "fintab") {
		rowStyle.push(`padding-right: 0.5ch;`);
	}

	//Cell text size
	rowStyle.push(`font-size: ${rootAtt.size}pt;`);

	//Cell line height
	rowStyle.push(`line-height: ${parseFloat(rootAtt.size) + parseFloat(firstLine.att.ldextra)}pt;`);

	//Cell width/height
	rowStyle.push(`width: ${parseFloat(colspec.att.tbcmeas)}pt; max-width: ${parseFloat(colspec.att.colwidth)}pt;`);
	if (col.att.col === "1") rowStyle.push(`min-width: ${colspec.att.tbcmeas}pt;`);

	//Last row height fix
	if (parseInt(tgroup.att.mx_rows) === parseInt(row.att.rowrel)) {
		if (tgroup.el[tgroup.el.length - 1].el[rowIndex - 1] !== undefined) {
			rowStyle.push(`height: ${parseInt(row.att.tbrdepth) - parseInt(tgroup.el[tgroup.el.length - 1].el[rowIndex - 1].att.row_gutter) / 2}pt;`);
		}
	} else {
		rowStyle.push(`height: ${row.att.tbrdepth}pt;`);
	}

	//Cell Hrule
	if (col.att.rule_info === "1 1 0") rowStyle.push(`border-bottom: ${row.att.rthk}pt solid ${help.toRGB(row.att["rcolor-cmyk"])};`);

	return rowStyle.join(" ");
};

module.exports.isLastColumn = (tgroup, col) => {
	if (tgroup.att.cols === col.att.col) return true;
	if (!col.att.hasOwnProperty("namest")) return false;
	if (parseInt(tgroup.att.cols) === parseInt(col.att.nameend.slice(3)) - parseInt(col.att.namest.slice(3)) + parseInt(col.att.col)) return true;

	return false;
};

module.exports.hasCalHang = col => {
	col.el.forEach((group, groupIndex) => {
		group.el.forEach((line, lineIndex) => {
			if (line.el.ins === "cal;rhang") return true;
			line.el.forEach((t, tIndex) => {
				if (t.name === "t" && t.el !== undefined) {
					t.el.forEach((el, elIndex) => {
						if (el.type === "instruction") {
							if (el.ins === "cal;rhang") return true;
						}
					});
				}
			});
		});
	});

	return false;
};

module.exports.handleInstructions = el => {
	if (el.ins === "qa") return `<br/>`;
	if (el.ins === "l") return `<br/>`;

	if (el.ins.includes("link;")) return `<a href="${el.ins.slice(5)}">`;
	if (el.ins === "/link") return `</a>`;
	if (el.ins === "sup") return `<sup style="line-height: 0;">`;
	if (el.ins === "reset") return `</sup>`;

	if (el.ins.includes("rx;")) return `<a name="${el.ins.slice(3)}"></a>`;

	return null;
};
