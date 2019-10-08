const style = require("./_style");
const { remote } = require("electron");
const help = require("./index");
const cmd = require("node-cmd");

module.exports.parseTD = (rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspecs) => {
	let colspan = "";
	let colspecSpan = "";
	const colspec = colspecs[col.att.col - 1];


	if (col.att.namest !== undefined) {
		let end = col.att.nameend.slice(3);
		let start = col.att.namest.slice(3);
		colspan = `colspan="${parseInt(end) - parseInt(start) + 1}"`;
	}

	if(colspan !== ""){
		colspecSpan = colspecs[col.att.nameend.slice(3) - 1];
	}



	let rowspan = "";
	if (col.att.morerows !== undefined) colspan = `rowspan="${parseInt(col.att.morerows) + 1}"`;

	return `<td ${colspan} ${rowspan} align="${col.att.align}" valign="${col.att.valign}" style="${style.rowStyle(rootStyle, tgroup, row, rowIndex, col, colspec, colspecSpan)}" >${tdText(rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspec)}</td>`;
};

const tdText = (rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspec) => {
	const isNumber = col.att.alfleft !== undefined;
	const isLast = style.isLastColumn(tgroup, col);
	let inlineCSS = "";

	let text = "";
	let divStyle = [];
	let shading = style.getShading(col);

	col.el.forEach((group, groupIndex) => {
		let maxWidth = 0;

		inlineCSS = style.inlineCSS(rootStyle, block, group, 0, groupIndex);

		group.el.forEach((line, lineIndex) => {
			if (line.el === undefined) return;

			if (row.att.rthk === undefined) row.att.rthk = 1;
			if (row.att["rcolor-cmyk"] === undefined && shading !== undefined) {
				row.att["rcolor-cmyk"] = `0.0 0.0 0.0 0.0`;
			} else if (row.att["rcolor-cmyk"] === undefined && shading === undefined) {
				row.att["rcolor-cmyk"] = `1 1 1 1`;
			}

			if (line.att.last || line.att.nobkpt) {
				if (row.att.rthk === "0.5") row.att.rthk = 1;
				if (col.att.rule_info === "1 0 0") divStyle.push(`border-bottom: ${row.att.rthk}pt solid ${help.toRGB(row.att["rcolor-cmyk"])};`); //urule
				if (col.att.rule_info === "1 2 0") divStyle.push(`border-bottom: ${row.att.rthk}pt solid ${help.toRGB(row.att["rcolor-cmyk"])};`); //trule
				if (col.att.rule_info === "2 0 0") divStyle.push(`border-bottom: ${row.att.rthk}pt solid ${help.toRGB(row.att["rcolor-cmyk"])};`); //urule
				if (col.att.rule_info === "2 2 0") divStyle.push(`border-bottom: ${row.att.rthk}pt solid ${help.toRGB(row.att["rcolor-cmyk"])};`); //trule
				if (col.att.rule_info === "3 0 0") divStyle.push(`border-bottom: 3pt double ${help.toRGB(row.att["rcolor-cmyk"])};`); // double trule
				if (col.att.rule_info === "3 2 0") divStyle.push(`border-bottom: 3pt double ${help.toRGB(row.att["rcolor-cmyk"])};`); // double trule
			}

			//Stop financial numbers from wrapping
			if (line.att.first && line.att.last) divStyle.push(`white-space: nowrap;`);

			if (line.att.first && line.att.last && line.att.bandwidth < 2.66 && line.att.bandwidth > 0) divStyle.push(`letter-spacing: -${((2.66 - parseFloat(line.att.bandwidth)) / 10).toFixed(3)}pt;`);

			//Gets max width per each line
			let currentWidth = 0;
			if (line.att.qdtype !== "center" && group.el.length > 1) currentWidth = parseFloat(line.att.lnwidth);
			maxWidth = Math.max(maxWidth, currentWidth);

			let leftSpace = parseFloat(line.att.xfinal) - parseFloat(colspec.att.tbcxpos);
			//Apply styles to body rows only
			if (parseInt(row.att.rowrel) > parseInt(tgroup.att.hdr_rows)) {
				//If fin number is on its own line, add line measure difference to the right
				if (!line.att.quadset && !(line.att.first && line.att.last) && isNumber) divStyle.push(`padding-right: ${(parseFloat(colspec.att.tbcmeas) - parseFloat(line.att.lnwidth)).toFixed()}pt;`);

				// if (col.att.col === "1" && line.att.last && line.att.qdtype !== "center" && maxWidth !== 0) {
				// 	divStyle.push(`width: ${maxWidth}pt;`);
				// } else if (isNumber && line.att.first && line.att.last && line.att.qdtype === "center") {
				// 	divStyle.push(`width: ${line.att.lnwidth}pt;`);
				// } else if (isNumber && isLast && line.att.lnwidth > 0) {
				// 	if (line.att.lnwidth < 10) {
				// 		divStyle.push(`max-width: ${colspec.att.colwidth}pt;`);
				// 	} else {
				// 		divStyle.push(`max-width: ${line.att.lnwidth}pt;`);
				// 	}
				// }

				//Add margins to certian columns
				if (line.att.qdtype !== "center" && line.att.last) {
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
						} else {
							if (col.att.col !== "1" && line.att.last) divStyle.push(`padding-right: ${colspec.att.tbcrwsp}pt;`);
							if (col.att.col !== "1" && !isNumber && line.att.qdtype !== "left") divStyle.push(`margin-left: ${leftSpace.toFixed(2)}pt;`);
							divStyle.push(`margin-left: ${colspec.att.tbclwsp}pt;`);
						}
					}
				} else {
					if ((col.att.col === "1" || col.att.namest === "col1") && !isLast) {
						let hasRight = divStyle.some(item => {
							return item.includes("margin-right");
						});

						if (!hasRight && line.att.last) {
							divStyle.push(`margin-right: ${colspec.att.tbcrwsp}pt;`);
							// divStyle.push(`padding-right: ${parseInt(colspec.att.tbcrwsp)}pt;`);
						}
					} else if (line.att.last && isLast) {
						divStyle.push(`margin-left: ${colspec.att.tbclwsp}pt;`);
					}
				}
			} else {
				//Table headers
				if (col.att.col === "1" && !isLast && line.att.last) divStyle.push(`margin-right: ${parseInt(colspec.att.tbcrwsp)}pt;`); //Apply style to header column 1
				if (!isLast && line.att.last) divStyle.push(`margin-left: ${parseInt(colspec.att.tbclgut) / 2}pt;`);
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

			line.el.forEach((t, tIndex) => {
				if (t.type === "instruction") {
					const ins = style.handleInstructions(t);
					if (ins !== null) text += ins;
				} else {
					//Add widths to certian columns
					if (parseInt(row.att.rowrel) > parseInt(tgroup.att.hdr_rows) && line.att.last && isNumber) {
						if (isNumber && parseInt(colspec.att.tbmxalnw) > 0 && parseFloat(t.att.x) > 0) {
							let temp = parseFloat(colspec.att.tbmxalnw) - parseFloat(t.att.x);
							let wid = style.getValueMinMax(divStyle, "width:", temp.toFixed(2), false);
							if (wid !== undefined && wid > 0) divStyle.push(`width: ${wid}pt;`);
						} else {
							

							


							if (parseInt(line.att.lnwidth) < parseInt(colspec.att.tbmxalnw)) {
								

								divStyle.push(`max-width: ${style.getValueMinMax(divStyle, "max-width:", parseFloat(colspec.att.tbmxalnw), true)}pt;`);
							} else {

								divStyle.push(`max-width: ${style.getValueMinMax(divStyle, "max-width:", parseFloat(line.att.lnwidth), true)}pt;`);

								
							}
						}
					}

					if (parseFloat(t.att.x) > 0 && parseInt(col.att.col) > 1 && text.length > 0) {
						text += `<var style="padding-left: ${t.att.x}pt;"></var>`;
						if (isNumber) divStyle.push(`max-width: ${(parseFloat(line.att.lnwidth) + parseFloat(t.att.x)).toFixed(2)}pt;`);
					} else if (t.att.x > 0 && text.length < 1 && t.name !== "shape") {
						const offSet = tXpos(line, t, tIndex);
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

							//Removes spaces from fin numbers
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
								if (t.el[elIndex - 1].name === "xpp") {
									if (t.el[elIndex - 1].ins === "usb") {
										if (el.txt.split(" ")[0] === "") el.txt = `&nbsp;${el.txt.slice(1)}`;
									}
								}
							}

							//Wraps text in style
							text += style.wrapBlockText(el.txt, t.att.style, rootStyle, group, line, group.att.style, t, tIndex, lineIndex, elIndex);

							//Add line break to generated text that does not have instructions
							if (line.att.quadset && !style.hasBreakMacro(line) && !line.att.last) {
								if (group.el[lineIndex + 1] !== undefined) if (group.el[lineIndex + 1].att.yfinal !== line.att.yfinal) text += `<br/>`;
							}
						}
					});
				}

				if (t.name === "image") {
					const folder = remote.getGlobal("saveLocation");
					cmd.get(`n: & cd N:\\xz\\gs & gs.exe -dDEVICEWIDTHPOINTS=${t.att.w} -dDEVICEHEIGHTPOINTS=${t.att.h} -sDEVICE=jpeg -dJPEGQ=100 -r300 -o ${folder}\\${t.att.id.substring(0, t.att.id.length - 4)}.jpg N:\\graphics\\house\\${t.att.id}`);
					text += `<img style="width: ${parseFloat(t.att.w) * parseFloat(t.att.scale)}pt; max-width: 100%; vertical-align: bottom;" src="${t.att.id.substring(0, t.att.id.length - 4)}.jpg"/>`;
				}
			});
		});
	});

	if (text.length < 1) text += `&nbsp;`;

	return `<div style="${divStyle.join(" ")} ${inlineCSS}">${text}</div>`;
};

const tXpos = (line, t, tIndex) => {
	let total = 0;
	if (line.el === undefined) return total;

	for (var i = tIndex; i >= 0; i--) {
		if (line.el[i].hasOwnProperty("att")) {
			if (line.el[i].att.hasOwnProperty("x")) total += parseFloat(line.el[i].att.x);
		}
	}

	return total;
};

// const checkChgrow = row => {
// 	let rulestats = { xvrule: 0, xrule: 0, rule: 0 };

// 	row.el.forEach(entry => {
// 		entry.el.forEach(group => {
// 			group.el.forEach(line => {
// 				if (line.hasOwnProperty("el"))
// 					line.el.forEach(t => {
// 						if (t.ins === undefined) return;
// 						let ins = t.ins;

// 						if (ins === "chgrow;xvrule") {
// 							rulestats.xvrule = parseInt(entry.att.col);
// 						}

// 						if (ins.includes("chgrow;xrule")) {
// 							rulestats.xrule = parseInt(entry.att.col);
// 						}

// 						if (ins.includes("chgrow;trule")) {
// 							rulestats.rule = parseInt(entry.att.col);
// 						}
// 					});
// 			});
// 		});
// 	});

// 	return rulestats;
// };
