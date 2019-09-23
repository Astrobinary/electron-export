const style = require("./_style");
const { remote } = require("electron");
const cmd = require("node-cmd");

module.exports.parseTD = (rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspecs) => {
	const colspec = colspecs[col.att.col - 1];
	let colspan = "";

	if (col.att.namest !== undefined) {
		let end = col.att.nameend.slice(3);
		let start = col.att.namest.slice(3);
		colspan = `colspan="${parseInt(end) - parseInt(start) + 1}"`;
	}

	let rowspan = "";
	if (col.att.morerows !== undefined) colspan = `rowspan="${parseInt(col.att.morerows) + 1}"`;

	return `<td ${colspan} ${rowspan} align="${col.att.align}" valign="${col.att.valign}" style="${style.rowStyle(rootStyle, tgroup, row, rowIndex, col, colspec)}" >${tdText(rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspec)}</td>`;
};

const tdText = (rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspec) => {
	const isNumber = col.att.alfleft !== undefined;
	const isLast = style.isLastColumn(tgroup, col);

	let text = "";
	let divStyle = [];

	col.el.forEach((group, groupIndex) => {
		let maxWidth = 0;

		//Handles indent
		if (group.el[0].att.lindent > 0) divStyle.push(`padding-left: ${group.el[0].att.lindent}pt;`);

		//Handles 2nd line indent
		if (group.el.length > 1)
			if (group.el[1].att.lindent > group.el[0].att.lindent && group.el[0].att.qdtype !== "center") {
				divStyle.push(`margin-left: ${group.el[1].att.lindent}pt; text-indent: -${parseInt(group.el[1].att.xfinal) - parseInt(group.el[0].att.xfinal)}pt;`);
			}

		group.el.forEach((line, lineIndex) => {
			if (line.el === undefined) return;

			//Basic rules TODO: implement width/color
			if (line.att.last) {
				if (col.att.rule_info === "1 0 0") divStyle.push(`border-bottom: 1pt solid;`); //urule
				if (col.att.rule_info === "1 2 0") divStyle.push(`border-bottom: 1pt solid;`); //trule
				if (col.att.rule_info === "3 2 0") divStyle.push(`border-bottom: 3pt double;`); // double trule
			}

			//Stop financial numbers from wrapping
			if (line.att.first && line.att.last) divStyle.push(`white-space: nowrap;`);

			if (line.att.first && line.att.last && line.att.bandwidth < 2.66 && line.att.bandwidth > 0) divStyle.push(`letter-spacing: -${((2.66 - parseFloat(line.att.bandwidth)) / 10).toFixed(3)}pt;`);

			//Gets max width per each line
			let currentWidth = 0;
			if (line.att.qdtype !== "center" && group.el.length > 1) currentWidth = parseFloat(line.att.lnwidth) - 4.25;
			maxWidth = Math.max(maxWidth, currentWidth);

			let leftSpace = parseFloat(line.att.xfinal) - parseFloat(colspec.att.tbcxpos);
			//Apply styles to body rows only
			if (rowIndex + 1 > tgroup.att.hdstyle_rows) {
				//If fin number is on its own line, add line measure difference to the right
				if (!line.att.quadset && !(line.att.first && line.att.last) && isNumber) divStyle.push(`padding-right: ${(parseFloat(colspec.att.tbcmeas) - parseFloat(line.att.lnwidth)).toFixed()}pt;`);

				//Add widths to certian columns
				if (col.att.col === "1" && line.att.last && line.att.qdtype !== "center" && maxWidth !== 0) {
					divStyle.push(`width: ${maxWidth}pt;`);
				} else if (isNumber && line.att.first && line.att.last && line.att.qdtype === "center") {
					divStyle.push(`width: ${line.att.lnwidth}pt;`);
				} else if (isNumber && isLast) {
					divStyle.push(`max-width: ${line.att.lnwidth}pt;`);
				}

				if (line.att.qdtype !== "center" && line.att.last) {
					if (leftSpace !== 0 && isNumber) {
						if (leftSpace > parseInt(colspec.att.tbclwsp) / 2) {
							divStyle.push(`margin-left: ${leftSpace.toFixed(2)}pt;`);
							if (!isLast) {
								divStyle.push(`margin-right: ${leftSpace.toFixed(2)}pt;`);
							}
						} else {
							if (!isLast) divStyle.push(`margin-right: ${colspec.att.tbcrwsp}pt;`);
						}
					} else {
						if (!isNumber && !isLast) {
							divStyle.push(`margin-right: ${colspec.att.tbcrwsp}pt;`);
							if (col.att.col !== "1") divStyle.push(`margin-left: ${leftSpace.toFixed(2)}pt;`);
						} else {
							if (col.att.col !== "1") divStyle.push(`padding-right: ${colspec.att.tbcrgut}pt;`);
						}
					}
				} else {
					if (col.att.col === "1" && !isLast && line.att.last) divStyle.push(`padding-right: ${parseInt(colspec.att.tbcrwsp)}pt;`);
				}
			} else {
				if (col.att.col === "1" && !isLast && line.att.last) divStyle.push(`margin-right: ${parseInt(colspec.att.tbcrwsp)}pt;`); //Apply style to header column 1
				if (!isLast) divStyle.push(`margin-left: ${parseInt(colspec.att.tbclgut) / 2}pt;`);
			}

			line.el.forEach((t, tIndex) => {
				if (t.type === "instruction") {
					const ins = style.handleInstructions(t);
					if (ins !== null) text += ins;
				} else {
					if (t.att.x > 0 && parseInt(col.att.col) > 1 && text.length > 0) {
						text += `<var style="padding-left: ${t.att.x}pt;"></var>`;
						divStyle.push(`max-width: ${parseFloat(line.att.lnwidth) + parseFloat(t.att.x)}pt;`);
					} else if (t.att.x > 0 && text.length < 1) {
						if (tIndex > 1) {
							const offSet = tXpos(line, t, tIndex);
							if (offSet > 0) divStyle.push(`padding-left: ${offSet}pt;`);
						} else {
							divStyle.push(`padding-left: ${t.att.x}pt;`);
						}
					}
				}

				if (t.name === "t" && t.el !== undefined) {
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

							//Offset % when hangs off table
							if (isNumber && el.txt.includes("%")) divStyle.push(`margin-right: 2.5ch;`);

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
							if (line.att.quadset && t.att.cgt) text += `<br/>`;
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

	return `<div style="${divStyle.join(" ")}">${text}</div>`;
};

const tXpos = (line, t, tIndex) => {
	if (line.el === undefined) return;

	let total = 0;

	for (var i = tIndex; i >= 0; i--) {
		if (line.el[i].hasOwnProperty("att")) {
			total += parseFloat(line.el[i].att.x);
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
