const help = require("./index");

//Created style based on element attributes
module.exports.inlineCSS = (rootStyle, page, block, group, gindex, lineIndex) => {
	let att;
	let style = "";
	let rootatt;

	if (lineIndex === undefined) lineIndex = 0;

	if (group.hasOwnProperty("el")) {
		if (group.el[lineIndex + 1] !== undefined) {
			group.el[lineIndex].att.bmline ? (att = group.el[lineIndex + 1].att) : (att = group.el[lineIndex].att);
		} else {
			att = group.el[lineIndex].att;
		}
	}

	rootStyle.forEach(item => {
		if (item.att.name === group.att.style) {
			rootatt = item.att;
			return;
		}
	});

	//Left indent & levels for ONLY block text
	if (group.el[lineIndex].att.lindent > 0 && !group.el[lineIndex].att.tbsa && !help.hasHang(group.el)) {
		if (group.el[lineIndex + 1] !== undefined) {
			if (group.el[lineIndex].att.lindent > group.el[lineIndex + 1].att.lindent) {
				style += `text-indent: ${att.lindent - group.el[1].att.lindent}pt;`;
				if (group.el[lineIndex + 1].att.lindent > lineIndex) style += `padding-left: ${group.el[lineIndex + 1].att.lindent}pt;`;
			} else {
				style += `padding-left: ${att.lindent}pt;`;
			}
		} else {
			if (group.att.class === "foots") {
				style += `padding-left: ${att.lindent}pt;`;
			} else if (group.att.style === "sum2") {
				style += `text-indent: ${att.lindent}pt;`;
			} else if (group.el[lineIndex].att.last && group.el[lineIndex].att.first) {
				style += `padding-left: ${att.lindent}pt;`;
			}
		}
	}

	if (group.el[0].att.rindent > 0) style += `padding-right: ${att.rindent}pt;`;

	//Right indent
	style += `text-align: ${att.qdtype};`;

	if (gindex === 0 && group.att.class === "ftnote") {
		style += `margin-top: ${parseFloat(att.prelead)}pt;`;
	} else {
		if (parseFloat(att.prelead) < 0) {
			//Don't add negative top margin to covers
			if (page !== undefined) {
				if (page.hasOwnProperty("type")) {
					if (!page.att.plname.includes("cov")) {
						style += `margin-top: ${parseFloat(att.prelead)}pt;`;
					}
				}
			} else {
				style += `margin-top: ${parseFloat(att.prelead)}pt;`;
			}
		} else {
			if (parseFloat(att.prelead) === 0) {
				if (gindex === 0 && lineIndex === 0 && !att.tbsa) style += `padding-top: ${parseFloat(att.yfinal)}pt;`;
			} else {
				if (group.hasOwnProperty("att")) {
					if (group.att.hasOwnProperty("style")) {
						if (!group.att.style.includes("calc.")) style += `padding-top: ${parseFloat(att.prelead)}pt;`;
					} else {
						style += `padding-top: ${parseFloat(att.prelead)}pt;`;
					}
				}
			}
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

		let lineHeight = "";
		if (group.el.length > 1) {
			if (!help.hasHang(group.el)) lineHeight = `line-height: ${parseFloat(rootatt.size) + parseFloat(att.ldextra)}pt;`;
		}

		if (group.el[0].hasOwnProperty("el")) {
			if (group.el[0].el.length > 1) {
				if (group.el[0].el[1].name === "rule") {
					lineHeight = `line-height: 0pt;`;
				}
			}
		}

		let fontSize = "";

		if (parseInt(rootatt.size) > 1) fontSize = `font-size: ${rootatt.size}pt;`;

		style += `${fontSize} ${lineHeight} font-family: ${fontFamily};`;
	}

	return style.trim();
};

module.exports.wrapBlockText = (text, style, rootStyle, group, line, groupCSS, t, tIndex, lineIndex, elIndex) => {
	let att, groupATT;
	let styles = "";
	let styleWrap = "";

	//Dont style empty text...
	if (!/\S/.test(text) && !t.att.ul1) return text;

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
	if (att.color !== "#000000") styles += `color: ${att.color};`;

	//Adds bg color to text
	if (att.hasOwnProperty("background-color")) styles += `background-color: ${att["background-color"]};`;

	//Checks for different size
	if (att.size !== groupATT.size) {
		if (parseInt(att.size) > 1) styles += `font-size: ${att.size}pt; line-height: ${parseFloat(att.size) + parseFloat(line.att.ldextra)}pt;`;
	}

	//If broken with a <qa> and alignment is different; has to be last T in an line element
	if (group.el[0].att.qdtype !== line.att.qdtype && line.att.quadset && line.el.length - 1 === tIndex && text.length > 1 && line.att.qdtype !== "forcej") {
		if (/\S/.test(text)) if (group.el[lineIndex - 1].att.quadset === "true") text = `<div style="text-align: ${line.att.qdtype};">${text}</div>`;
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
module.exports.rowStyle = (rootStyle, tgroup, row, rowIndex, col, colspec, colspecSpan) => {
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

	if (!colspec.hasOwnProperty("att")) return;

	if (colspec.att.tbclgut > 0) {
		//Cell Header rows
		if (tgroup.att.hdstyle_rows !== "0" && parseInt(row.att.rowrel) <= parseInt(tgroup.att.hdr_rows)) {
			if (isLast) {
				rowStyle.push(`margin-left: ${colspec.att.tbclwsp}pt;`);
				rowStyle.push(`padding-left: ${colspec.att.tbclwsp}pt;`);
			}

			if (col.att.namest !== undefined) {
				if (parseInt(tgroup.att.cols) !== parseInt(col.att.nameend.slice(3)) - parseInt(col.att.namest.slice(3)) + parseInt(col.att.col)) {
					rowStyle.push(`margin-right: ${colspec.att.tbcrwsp}pt; padding-right: ${colspec.att.tbcrwsp}pt;`);
				}
			} else {
				if (tgroup.att.cols !== col.att.col) rowStyle.push(`margin-right: ${colspec.att.tbcrwsp}pt; padding-right: ${colspec.att.tbcrwsp}pt;`);
			}
		} else {
			if (col.att.align === "center" && isLast) rowStyle.push(`padding-left: ${colspec.att.tbclwsp}pt;`);
		}
	}

	//Cell text size
	if (parseInt(rootAtt.size) > 1) rowStyle.push(`font-size: ${rootAtt.size}pt;`);

	//Cell line height
	if (col.el[0].el.length > 1) rowStyle.push(`line-height: ${parseFloat(rootAtt.size) + parseFloat(firstLine.att.ldextra)}pt;`);

	//Cell width
	if (isLast || col.att.nameend) {
		rowStyle.push(`width: ${parseFloat(colspec.att.tbcmeas)}pt;`);
	} else {
		rowStyle.push(`width: ${parseFloat(colspec.att.tbcmeas)}pt; max-width: ${colspec.att.colwidth}pt;`);
	}

	//Row gutter
	if (parseInt(row.att.rowrel) > parseInt(tgroup.att.hdr_rows)) {
		if (parseInt(row.att.rowrel) === parseInt(tgroup.att.hdr_rows)) {
			if (parseInt(row.att.row_gutter) <= 6) {
				rowStyle.push(`padding-top: ${parseInt(row.att.row_gutter) / 2}pt;`);
			}
		}
		if (parseInt(row.att.rowrel) === parseInt(tgroup.att.mx_rows)) {
			if (parseInt(row.att.row_gutter) <= 6) {
				rowStyle.push(`padding-bottom: ${parseInt(tgroup.el[tgroup.el.length - 1].el[0].att.row_gutter) / 2}pt;`);
			}
		}
	} else {
		if (parseInt(row.att.row_gutter) > 6) rowStyle.push(`padding-top: ${parseInt(row.att.row_gutter) / 2}pt;`);
	}

	let shading = this.getShadingColor(col);

	if (shading !== undefined) rowStyle.push(`background-color: ${help.toRGB(shading)};`);

	//Cell Hrule
	if (row.att.rthk === undefined) row.att.rthk = 1;
	if (row.att["rcolor-cmyk"] === undefined && shading !== undefined) row.att["rcolor-cmyk"] = `0.0 0.0 0.0 0.0`;
	if (col.att.rule_info === "1 1 0") rowStyle.push(`border-bottom: ${row.att.rthk}pt solid ${help.toRGB(row.att["rcolor-cmyk"])};`);
	if (col.att.rule_info === "2 1 0") rowStyle.push(`border-bottom: ${row.att.rthk}pt solid ${help.toRGB(row.att["rcolor-cmyk"])};`);

	//Vrule
	if (parseFloat(colspec.att.tbcrrule) > 0 && !this.hasXvrule(col)) {
		if (colspec.att.tbcrrule === "0.5") colspec.att.tbcrrule = 1;
		rowStyle.push(`border-right: ${colspec.att.tbcrrule}pt solid ${help.toRGB(colspec.att["tbcr_rcolor-cmyk"])};`);
	} else if (colspecSpan !== "") {
		if (parseFloat(colspecSpan.att.tbcrrule) > 0 && !this.hasXvrule(col)) {
			if (colspecSpan.att.tbcrrule === "0.5") colspecSpan.att.tbcrrule = 1;
			rowStyle.push(`border-right: ${colspecSpan.att.tbcrrule}pt solid ${help.toRGB(colspecSpan.att["tbcr_rcolor-cmyk"])};`);
		}
	}

	return rowStyle.join(" ");
};

module.exports.isLastColumn = (tgroup, col) => {
	if (tgroup.att.cols === col.att.col) return true;
	if (!col.att.hasOwnProperty("namest")) return false;
	if (parseInt(tgroup.att.cols) === parseInt(col.att.nameend.slice(3)) - parseInt(col.att.namest.slice(3)) + parseInt(col.att.col)) return true;

	return false;
};

module.exports.getShadingColor = col => {
	let shadeColor;

	col.el.forEach(group => {
		group.el.forEach(line => {
			if (line.el === undefined) return;
			line.el.forEach(t => {
				if (t.name === "shape") {
					shadeColor = t.att["color-cmyk"];
					return shadeColor;
				}
			});
		});
	});

	return shadeColor;
};

module.exports.hasCalHang = col => {
	col.el.forEach(group => {
		group.el.forEach(line => {
			if (line.el === undefined) return;
			if (line.el.ins === "cal;rhang") return true;
			line.el.forEach(t => {
				if (t.name === "t" && t.el !== undefined) {
					t.el.forEach(el => {
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

module.exports.hasBreakMacro = line => {
	let hasBreak = false;

	line.el.forEach(t => {
		if (t.name === "t" && t.el !== undefined) {
			t.el.forEach(el => {
				if (el.type === "instruction") {
					if (el.ins === "qa" || el.ins === "l") hasBreak = true;
					return hasBreak;
				}
			});
		} else {
			if (t.type === "instruction") {
				if (t.ins === "qa" || t.ins === "l") hasBreak = true;
				return hasBreak;
			}
		}
	});

	return hasBreak;
};

module.exports.hasXvrule = col => {
	let hasVrule = false;

	col.el.forEach(group => {
		group.el.forEach(line => {
			line.el.forEach(t => {
				if (t.name === "t" && t.el !== undefined) {
					t.el.forEach(el => {
						if (el.type === "instruction") {
							if (el.ins === "xvrule") hasVrule = true;
							return hasVrule;
						}
					});
				} else {
					if (t.type === "instruction") {
						if (t.ins === "xvrule") hasVrule = true;
						return hasVrule;
					}
				}
			});
		});
	});

	return hasVrule;
};

module.exports.hasStyleProperty = (arr, target) => {
	return arr.some(style => {
		return style.split(":")[0] === target;
	});
};

module.exports.handleInstructions = el => {
	if (el.ins === "qa") return `<br/>`;
	if (el.ins === "l") return `<br/>`;
	if (el.ins === "lz") return `&nbsp;`;

	if (el.ins.includes("link;")) return `<a href="${el.ins.slice(5)}">`;
	if (el.ins === "/link") return `</a>`;

	if (el.ins === "sup") return `<sup style="line-height: 0;">`;
	if (el.ins === "reset") return `</sup>`;

	if (el.ins.includes("ru;")) {
		const params = el.ins.split(";");
		return `<div style="border-bottom: ${params[2].replace(/\D+/gm, "")}pt solid black;">&nbsp;</div>`;
	}

	if (el.ins.includes("rx;")) return `<a name="${el.ins.slice(3)}"></a>`;

	return null;
};
