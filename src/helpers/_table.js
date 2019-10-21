const style = require("./_style");
const help = require("./index");

module.exports.cellContainer = (rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspecs) => {
	const colspec = colspecs[col.att.col - 1];
	const isLast = isLastColumn(tgroup, col);
	let columnSpan = "";
	let colspecWithSpan = "";

	if (col.att.namest !== undefined) {
		columnSpan = `colspan="${parseInt(col.att.nameend.slice(3)) - parseInt(col.att.namest.slice(3)) + 1}"`;
		colspecWithSpan = colspecs[col.att.nameend.slice(3) - 1];
	}

	let rowspan = "";
	if (col.att.morerows !== undefined) rowspan = `rowspan="${parseInt(col.att.morerows) + 1}"`;

	return `<td ${columnSpan} ${rowspan} align="${col.att.align}" valign="${col.att.valign}" style="${rowStyle(rootStyle, tgroup, row, rowIndex, col, colspec, colspecWithSpan)}" >${cellStyle(rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspec, colspecWithSpan)}</td>`;
};

const rowStyle = (rootStyle, tgroup, row, rowIndex, col, colspec, colspecSpan) => {
	const styleClass = col.el[0].att.style;
	const firstLine = col.el[0].el[0];
	const isLast = isLastColumn(tgroup, col);

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
		if (tgroup.att.hdstyle_rows !== "0" && parseInt(row.att.rowrel) <= parseInt(tgroup.att.hdr_rows) && col.att.namest === undefined) {
			if (col.att.align !== "right" && isLast) {
				if (parseInt(colspec.att.tbcrwsp) > 0) {
					rowStyle.push(`margin-right: ${colspec.att.tbcrwsp}pt;`);
					rowStyle.push(`padding-right: ${colspec.att.tbcrwsp}pt;`);
				}
				rowStyle.push(`margin-left: ${colspec.att.tbclwsp}pt;`);
				// rowStyle.push(`padding-left: ${colspec.att.tbclwsp}pt;`);
			}

			if (col.att.namest !== undefined) {
				if (parseInt(tgroup.att.cols) !== parseInt(col.att.nameend.slice(3)) - parseInt(col.att.namest.slice(3)) + parseInt(col.att.col)) {
					rowStyle.push(`margin-right: ${colspec.att.tbcrwsp}pt; padding-right: ${colspec.att.tbcrwsp}pt;`);
					rowStyle.push(`margin-left: ${colspec.att.tbclwsp}pt; padding-left: ${colspec.att.tbclwsp}pt;`);
				}
			} else {
				if (tgroup.att.cols !== col.att.col) {
					rowStyle.push(`margin-left: ${colspec.att.tbclwsp}pt; `);
					rowStyle.push(`margin-right: ${colspec.att.tbcrwsp}pt; `);
				}
			}
		} else {
			if (col.att.align === "center" && isLast) rowStyle.push(`padding-left: ${parseFloat(colspec.att.tbclwsp)}pt;`);
		}
	}

	//Cell text size
	if (parseInt(rootAtt.size) > 1) rowStyle.push(`font-size: ${rootAtt.size}pt;`);

	//Cell line height
	if (col.el[0].el.length > 1) rowStyle.push(`line-height: ${parseFloat(rootAtt.size) + parseFloat(firstLine.att.ldextra)}pt;`);

	//Cell width
	if (isLast) {
		rowStyle.push(`width: ${parseFloat(colspec.att.colwidth)}pt;`);
	} else {
		rowStyle.push(`width: ${parseFloat(colspec.att.colwidth) - parseFloat(colspec.att.tbclwsp) * 2}pt; max-width: ${colspec.att.colwidth}pt;`);
	}

	if (col.att.col === "1") {
		rowStyle.push(`padding-left: ${parseFloat(colspec.att.tbclwsp)}pt;`);
	}

	if (isLast && parseInt(colspec.att.tbcrwsp) > 0 && col.att.namest === undefined) {
		if (col.att.namest === undefined) {
		} else {
			rowStyle.push(`padding-right: ${colspec.att.tbcrwsp}pt;`);
			console.log("here");
		}
		rowStyle.push(`padding-right: ${colspec.att.tbcrwsp}pt;`);
	}

	//Row gutter
	if (parseInt(row.att.rowrel) > parseInt(tgroup.att.hdr_rows)) {
		if (parseInt(row.att.rowrel) === parseInt(tgroup.att.hdr_rows)) {
			rowStyle.push(`padding-top: ${parseInt(row.att.row_gutter) / 2}pt;`);
		}
		if (parseInt(row.att.rowrel) === parseInt(tgroup.att.mx_rows)) {
			rowStyle.push(`padding-bottom: ${parseInt(tgroup.el[tgroup.el.length - 1].el[0].att.row_gutter) / 2}pt;`);
		}
	} else {
		rowStyle.push(`padding-top: ${parseInt(row.att.row_gutter) / 2}pt;`);
	}

	if (tgroup.el[tgroup.el.length - 1].el.length + parseInt(tgroup.att.hdr_rows) === parseInt(row.att.rowrel)) {
		rowStyle.push(`padding-top: ${parseInt(tgroup.el[tgroup.el.length - 1].el[0].att.row_gutter) / 2}pt;`);
	} else {
		if (rowIndex > 0) {
			if (tgroup.el[tgroup.el.length - 1].el[rowIndex - 1] !== undefined) rowStyle.push(`padding-top: ${parseInt(tgroup.el[tgroup.el.length - 1].el[rowIndex - 1].att.row_gutter) / 2}pt; `);
		} else {
			rowStyle.push(`padding-top: ${parseInt(row.att.row_gutter) / 2}pt;`);
		}
	}

	let shading = getShadingColor(col);
	if (shading !== undefined) rowStyle.push(`background-color: ${help.toRGB(shading)};`);

	//Cell Hrule

	if (col.att.rule_info !== undefined) {
		if (row.att.rthk === undefined) row.att.rthk = 1;
		if (row.att.rcolor === undefined) row.att.rcolor = "black";
		if (col.att.rule_info === "1 1 0") rowStyle.push(`border-bottom: ${row.att.rthk}pt solid ${row.att.rcolor};`);
		if (col.att.rule_info === "2 1 0") rowStyle.push(`border-bottom: ${row.att.rthk}pt solid ${row.att.rcolor};`);
		if (col.att.rule_info === "3 1 0") rowStyle.push(`border-bottom: 3pt double ${row.att.rcolor};`);
	}

	//Vrule
	if (parseFloat(colspec.att.tbcrrule) > 0 && !hasXvrule(col)) {
		if (colspec.att.tbcrrule === "0.5") colspec.att.tbcrrule = 1;
		rowStyle.push(`border-right: ${colspec.att.tbcrrule}pt solid ${help.toRGB(colspec.att["tbcr_rcolor-cmyk"])};`);
	} else if (colspecSpan !== "") {
		if (parseFloat(colspecSpan.att.tbcrrule) > 0 && !hasXvrule(col)) {
			if (colspecSpan.att.tbcrrule === "0.5") colspecSpan.att.tbcrrule = 1;
			rowStyle.push(`border-right: ${colspecSpan.att.tbcrrule}pt solid ${help.toRGB(colspecSpan.att["tbcr_rcolor-cmyk"])};`);
		}
	}

	return rowStyle.join(" ");
};

const cellStyle = (rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspec, colspecWithSpan) => {
	const isNumber = col.att.alfleft !== undefined;
	const isLast = isLastColumn(tgroup, col);
	let text = "";
	let inlineCSS = "";
	let divStyle = [];
	let shading = getShadingColor(col);

	col.el.forEach((group, groupIndex) => {
		const isNotHeaderCell = parseInt(row.att.rowrel) > parseInt(tgroup.att.hdr_rows);
		let maxWidth = 0;

		inlineCSS = style.inlineCSS(rootStyle, undefined, block, group, 0, groupIndex);

		group.el.forEach((line, lineIndex) => {
			if (line.el === undefined) return;

			if (row.att.rthk === undefined) row.att.rthk = 1;
			if (row.att["rcolor-cmyk"] === undefined && shading !== undefined) {
				let colors = shading.split(" ");

				row.att["rcolor-cmyk"] = `1 1 1 1`;

				if (colors[0] === "0" && colors[1] === "0" && colors[2] === "0") {
					if (parseInt(colors[3]) < 0.5) {
						row.att["rcolor-cmyk"] = `1 1 1 1`;
					} else {
						row.att["rcolor-cmyk"] = `0.0 0.0 0.0 0.0`;
					}
				}
			} else if (row.att["rcolor-cmyk"] === undefined && shading === undefined) {
				row.att["rcolor-cmyk"] = `1 1 1 1`;
			}

			// if (line.att.last) {
			// 	if (parseInt(line.att.prelead) > 0) divStyle.push(`padding-top: ${line.att.prelead}pt;`);
			// 	if (row.att.row === "1" && line.att.last) divStyle.push(`padding-top: ${parseFloat(row.att["row_gutter"]) / 2}pt;`);
			// 	if (row.att.rowrel === "1") divStyle.push(`padding-top: ${parseFloat(row.att["row_pos"])}pt;`);

			// 	if (tgroup.el[tgroup.el.length - 1].el.length + parseInt(tgroup.att.hdr_rows) === parseInt(row.att.rowrel) && line.att.last) {
			// 		const botDifference = parseFloat(row.att["row_pos"] - (parseFloat(line.att.yfinal) - parseFloat(row.att.tbrdepth)));
			// 		if (botDifference > 0) divStyle.push(`padding-bottom: ${botDifference / 2}pt;`);
			// 	}
			// }

			if (line.att.last || line.att.nobkpt) {
				if (row.att.rthk === "0.5") row.att.rthk = 1;
				if (col.att.rule_info === "1 0 0") divStyle.push(`border-bottom: ${row.att.rthk}pt solid ${help.toRGB(row.att["rcolor-cmyk"])};`); //urule
				if (col.att.rule_info === "1 2 0") divStyle.push(`border-bottom: ${row.att.rthk}pt solid ${help.toRGB(row.att["rcolor-cmyk"])};`); //trule
				if (col.att.rule_info === "2 0 0") divStyle.push(`border-bottom: ${row.att.rthk}pt solid ${help.toRGB(row.att["rcolor-cmyk"])};`); //urule
				if (col.att.rule_info === "2 2 0") divStyle.push(`border-bottom: ${row.att.rthk}pt solid ${help.toRGB(row.att["rcolor-cmyk"])};`); //trule
				if (col.att.rule_info === "3 0 0") divStyle.push(`border-bottom: 3pt double ${help.toRGB(row.att["rcolor-cmyk"])};`); // double trule
				if (col.att.rule_info === "3 2 0") divStyle.push(`border-bottom: 3pt double ${help.toRGB(row.att["rcolor-cmyk"])};`); // double trule
			}

			//Stop text from wrapping
			if (line.att.first && line.att.last) divStyle.push(`white-space: nowrap;`);

			//Gets max width per each line
			let currentWidth = 0;
			if (line.att.qdtype !== "center" && group.el.length > 1) currentWidth = parseFloat(line.att.lnwidth);
			maxWidth = Math.max(maxWidth, currentWidth);

			if (isNotHeaderCell)
				if (line.att.qdtype !== "center" && line.att.last) {
					const leftSpace = parseFloat(line.att.xfinal) - parseFloat(colspec.att.tbcxpos);
					if (leftSpace !== 0 && isNumber) {
						if (leftSpace > parseInt(colspec.att.tbclwsp) / 2) {
							divStyle.push(`margin-left: ${leftSpace.toFixed(2)}pt;`);
							if (!isLast) divStyle.push(`margin-right: ${leftSpace.toFixed(2)}pt;`);
						} else {
							if (!isLast) divStyle.push(`margin-right: ${colspec.att.tbcrwsp}pt;`);
						}
					} else {
						if (!isNumber && !isLast) {
							divStyle.push(`margin-right: ${colspec.att.tbcrwsp}pt;`);
							if (col.att.col !== "1") divStyle.push(`margin-left: ${colspec.att.tbclwsp}pt;`);
						} else if (col.att.col !== "1") {
							if (line.att.last) divStyle.push(`padding-right: ${colspec.att.tbcrwsp}pt;`);
							if (!isNumber && line.att.qdtype !== "left") divStyle.push(`margin-left: ${leftSpace.toFixed(2)}pt;`);
							divStyle.push(`margin-left: ${colspec.att.tbclwsp}pt;`);
						}
					}
				} else if ((col.att.col === "1" || col.att.namest === "col1") && !isLast) {
					let hasRight = divStyle.some(item => {
						return item.includes("margin-right");
					});

					if (!hasRight && line.att.last) divStyle.push(`margin-right: ${colspec.att.tbcrwsp}pt;`);
				}

			if (!isNotHeaderCell) {
				if (col.att.namest === undefined) {
					if (line.att.last) {
						if (col.att.col !== "1") {
							divStyle.push(`margin-left: ${parseInt(colspec.att.tbclwsp)}pt;`);
						}
						divStyle.push(`margin-right: ${parseInt(colspec.att.tbcrwsp)}pt;`);
					}

					if (line.att.qdtype === "right" && isLast) {
						divStyle.push(`margin-left: ${parseInt(colspec.att.tbclgut)}pt;`);
					}
				} else {
					divStyle.push(`padding-left: ${parseInt(colspec.att.tbclwsp)}pt;`);
					if (!isLast) divStyle.push(`margin-right: ${parseInt(colspec.att.tbcrwsp)}pt;`);
				}
			}

			//Handles table indents
			if (group.el.length > 1) {
				if (group.el[1].att.lindent > group.el[0].att.lindent && group.el[0].att.qdtype !== "center") {
					let lineNum = 0;
					let diff = parseInt(group.el[1].att.xfinal) - parseInt(group.el[0].att.xfinal);
					if (group.el[0].att.lindent === "0" && diff === 0) lineNum = 1;
					if (line.att.last) divStyle.push(`margin-left: ${parseInt(group.el[lineNum].att.lindent) + diff}pt; text-indent: -${diff}pt;`);
				}
			} else {
				if (line.att.lindent > 0 && line.att.first && line.att.last) {
					divStyle.push(`padding-left: ${group.el[0].att.lindent}pt;`);
				}
			}

			if (parseInt(line.att.lnwidth) === 0 && parseInt(line.att.lnmeas) < 500 && parseFloat(colspec.att.tbmxalnw) !== 0) divStyle.push(`max-width: ${parseFloat(colspec.att.tbmxalnw)}pt;`);

			line.el.forEach((t, tIndex) => {
				if (t.type === "instruction") {
					const ins = style.handleInstructions(t);
					if (ins !== null) text += ins;
				} else {
					//Add widths to certian columns
					const offSet = getTotalX(line, tIndex);
					if (!style.hasStyleProperty(divStyle, "max-width") && line.att.last && !isNumber && parseFloat(line.att.lnwidth) !== 0) {
						if (parseInt(t.att.x) && !isLast) {
							if (col.att.rule_info === "1 2 0") divStyle.push(`max-width: ${parseFloat(line.att.lnwidth) + parseFloat(colspec.att.tbcrwsp) + parseFloat(offSet)}pt;`);
						} else {
							if (col.att.rule_info === "1 2 0") divStyle.push(`max-width: ${parseFloat(line.att.lnwidth)}pt;`);
						}

						if (parseInt(t.att.x) && !isLast) {
							if (col.att.rule_info === "2 2 0") divStyle.push(`max-width: ${parseFloat(line.att.lnwidth) + parseFloat(colspec.att.tbcrwsp) + parseFloat(offSet)}pt;`);
						} else if (parseInt(t.att.x)) {
							if (col.att.rule_info === "2 2 0") divStyle.push(`max-width: ${parseFloat(line.att.lnwidth)}pt;`);
						}

						if (parseInt(t.att.x) && !isLast) {
							if (col.att.rule_info === "3 2 0") divStyle.push(`max-width: ${parseFloat(line.att.lnwidth) + parseFloat(colspec.att.tbcrwsp) + parseFloat(offSet)}pt;`);
						} else if (parseInt(t.att.x)) {
							if (col.att.rule_info === "3 2 0") divStyle.push(`max-width: ${parseFloat(line.att.lnwidth)}pt;`);
						}
					}

					if (isNotHeaderCell && line.att.last && isNumber && !style.hasStyleProperty(divStyle, "max-width")) {
						if (parseFloat(t.att.x) > 0 && t.hasOwnProperty("el") && parseFloat(colspec.att.tbmxalnw) !== 0) {
							if (isLast && col.att.rule_info === undefined) {
								divStyle.push(`max-width: ${parseFloat(colspec.att.tbmxalnw) + parseFloat(t.att.x)}pt;`);
							} else {
								divStyle.push(`max-width: ${parseFloat(colspec.att.tbmxalnw) - parseFloat(t.att.x) + parseFloat(colspec.att.tbcrwsp)}pt;`);
							}
						} else if (t.hasOwnProperty("el") && parseFloat(colspec.att.tbmxalnw) !== 0) {
							if (isLast && parseInt(line.att.lnwidth) > colspec.att.tbmxalnw && col.att.rule_info === undefined) {
								divStyle.push(`max-width: ${parseFloat(line.att.lnwidth) + parseFloat(colspec.att.tbcrwsp)}pt;`);
							} else {
								divStyle.push(`max-width: ${parseFloat(colspec.att.tbmxalnw) + parseFloat(colspec.att.tbcrwsp)}pt;`);
							}
						}
					}

					if (parseFloat(t.att.x) > 0 && parseInt(col.att.col) > 1 && text.length > 0) {
						text += `<var style="padding-left: ${t.att.x}pt;"></var>`;
						if (isNumber && style.hasStyleProperty(divStyle, "max-width") === false) divStyle.push(`max-width: ${(parseFloat(line.att.lnwidth) + parseFloat(t.att.x)).toFixed(2)}pt;`);
					} else if (t.att.x > 0 && text.length < 1 && t.name !== "shape") {
						const offSet = getTotalX(line, tIndex);
						if (tIndex > 1) {
							if (offSet > 0) divStyle.push(`padding-left: ${offSet}pt;`);
						} else {
							divStyle.push(`padding-left: ${t.att.x}pt;`);
						}
					} else {
						if (parseFloat(t.att.x) < 0) {
							let newStyle = divStyle.map(item => {
								if (item.includes("margin-left") && !isNumber && line.att.qdtype !== "center") {
									const amt = item.replace(/[^0-9,.]/g, "");

									return `margin-left: ${parseFloat(amt - parseFloat(Math.abs(t.att.x)) + parseFloat(colspec.att.tbclwsp))}pt;`;
								}
								return item;
							});
							divStyle = newStyle;
						}
					}
				}

				if (t.name === "t" && t.el !== undefined) {
					if (t.att.suppress) return;
					t.el.forEach((el, elIndex) => {
						if (el.type === "instruction") {
							const ins = style.handleInstructions(el);
							if (ins !== null) text += ins;
						} else {
							if (el.txt === undefined) return;
							if (t.att.cgt && el.txt === ".") return;
							if (hasThinSpaceBeforeBox(line, tIndex, el)) return;

							//Removes spaces from financial numbers
							if (/\d/.test(el.txt) && isNumber) {
								if (/\$/.test(el.txt)) {
									el.txt = el.txt.replace(/ +?/g, "");
								} else {
									el.txt = el.txt.trim();
								}
							} else if ((/\d/.test(el.txt) && /\$/.test(el.txt) && isNumber) || /\s—/.test(el.txt)) {
								el.txt = el.txt.replace(/ +?/g, "");
							}

							//Adds USB
							if (elIndex > 1) {
								if (t.el[elIndex - 1].ins === "usb") {
									if (el.txt.split(" ")[0] === "") el.txt = `&nbsp;${el.txt.slice(1)}`;
								}
							}

							//Wraps text in styles
							text += style.wrapBlockText(el.txt, t.att.style, rootStyle, group, line, group.att.style, t, tIndex, lineIndex, elIndex);

							//Add line break to generated text that does not have instructions
							if (line.att.quadset && !style.hasBreakMacro(line) && !line.att.last) {
								if (group.el[lineIndex + 1] !== undefined) if (group.el[lineIndex + 1].att.yfinal !== line.att.yfinal) text += `<br/>`;
							}
						}
					});
				}

				if (t.name === "image") {
					help.convertImage(t);
					text += `<img style="width: ${parseFloat(t.att.w) * parseFloat(t.att.scale)}pt; max-width: 100%; vertical-align: bottom;" src="${t.att.id.substring(0, t.att.id.length - 4)}.jpg"/>`;
				}
			});
		});
	});

	if (text.length < 1) text += `&nbsp;`;

	return `<div style="${divStyle.join(" ")} ${inlineCSS}">${text}</div>`;
};

const getTotalX = (line, tIndex) => {
	let total = 0;
	if (line.el === undefined) return total;

	for (var i = tIndex; i >= 0; i--) {
		if (line.el[i].hasOwnProperty("att")) {
			if (line.el[i].att.hasOwnProperty("x")) total += parseFloat(line.el[i].att.x);
		}
	}

	return total;
};

const getShadingColor = col => {
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

const hasXvrule = col => {
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

const hasThinSpaceBeforeBox = (line, tIndex, el) => {
	if (line.el[tIndex + 1] !== undefined) {
		if (line.el[tIndex + 1].name === "t") {
			if (line.el[tIndex + 1].el !== undefined) {
				if (line.el[tIndex + 1].el[0].txt === "☐") {
					if (el.txt.length === 1) return true;
				}
			}
		}
	}

	return false;
};

const isLastColumn = (tgroup, col) => {
	if (tgroup.att.cols === col.att.col) return true;
	if (!col.att.hasOwnProperty("namest")) return false;
	if (parseInt(tgroup.att.cols) === parseInt(col.att.nameend.slice(3)) - parseInt(col.att.namest.slice(3)) + parseInt(col.att.col)) return true;

	return false;
};
