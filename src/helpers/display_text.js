const Handlebars = require("handlebars");
const { remote } = require("electron");
const help = require("./index");
const style = require("./_style");
const table = require("./_table");
const cmd = require("node-cmd");

Handlebars.registerHelper("display_text", (rootStyle, page, block, group) => {
	let text = "";

	if (help.hasHang(group.el)) {
		text = listText(rootStyle, block, group, group.att.style);
	} else if (group.name === "table") {
		text = tableText(rootStyle, block, group);
	} else {
		text = blockText(rootStyle, page, block, group, group.att.style);
	}

	return new Handlebars.SafeString(text);
});

const blockText = (rootStyle, page, block, group, groupStyle) => {
	let text = "";

	group.el.forEach((line, lineIndex) => {
		if (!line.el && line.att.bmline) {
			text += `<div style="${style.inlineCSS(rootStyle, page, block, group, 0, lineIndex)}">&nbsp;</div>`;
		}

		if (line.hasOwnProperty("el")) {
			line.el.forEach((t, tIndex) => {
				if (t.name === "t") {
					if (!t.hasOwnProperty("att")) return;
					if (t.att.suppress) return;
					text += generateText(rootStyle, block, group, groupStyle, line, lineIndex, t, tIndex);
				} else if (t.name === "xpp") {
					if (t.ins.includes("pick;")) {
						text += getPickUp(page, t);
					} else {
						const ins = style.handleInstructions(t);
						if (ins !== null) text += ins;
					}
				} else if (t.name === "rule") {
					text += handleBlockRules(rootStyle, block, group, line, t, tIndex);
				} else if (t.name === "image") {
					help.convertImage(t);
					text += `<img style="width: ${parseFloat(t.att.w) * parseFloat(t.att.scale)}pt; max-width: 100%; vertical-align: bottom;" src="${t.att.id.substring(0, t.att.id.length - 4)}.jpg"/>`;
				}
			});

			if (line.att.quadset && !line.att.last) {
				if (group.el[lineIndex + 1] !== undefined) {
					if (!style.hasBreakMacro(line)) {
						if (parseFloat(group.el[lineIndex + 1].att.yfinal) > parseFloat(line.att.yfinal) && group.el[lineIndex + 1].hasOwnProperty("el") && group.el[lineIndex + 1].el.name !== "rule" && !line.att.tbsa) text += `<br/>`;
					}
				}
			}
		}
	});

	let tempText = text.replace(/<[^>]*>/gm, "").replace(/\s+/gm, "");
	if (tempText.toUpperCase().includes("TABLEOFCONTENTS") && !group.att.style.includes("para")) text = `<a name="_toc"></a>${text}`;

	return text;
};

const listText = (rootStyle, block, group, groupStyle) => {
	let text = "";
	let hangCharacters = "";
	let inlineCSS = "";
	let level = "";
	let hangAmount = group.el[1].att.lindent - group.el[0].att.lindent;

	if (group.el[0].att.lindent > 0) level = `padding-left: ${group.el[0].att.lindent}pt;`;

	group.el.forEach((line, lineIndex) => {
		inlineCSS = style.inlineCSS(rootStyle, undefined, block, group, 0, lineIndex);

		if (line.hasOwnProperty("el"))
			line.el.forEach((t, tIndex) => {
				if (t.name === "t") {
					if (!t.hasOwnProperty("att")) return;
					if (t.att.suppress) return;

					if (lineIndex === 0) {
						hangCharacters += generateText(rootStyle, block, group, groupStyle, line, lineIndex, t, tIndex);
					} else {
						text += generateText(rootStyle, block, group, groupStyle, line, lineIndex, t, tIndex);
					}
				} else if (t.name === "xpp") {
					const ins = style.handleInstructions(t);
					if (ins !== null)
						if (lineIndex === 0) {
							hangCharacters += ins;
						} else {
							text += ins;
						}
				} else if (t.name === "rule") {
					text += handleBlockRules(rootStyle, block, group, line, t, tIndex);
				} else if (t.name === "image") {
					help.convertImage(t);
					text += `<img style="-ms-interpolation-mode: bicubic; width: ${parseFloat(t.att.w) * parseFloat(t.att.scale)}pt; max-width: 100%; vertical-align: bottom;" src="${t.att.id.substring(0, t.att.id.length - 4)}.jpg"/>`;
				}
			});
	});

	return `<td class="group-prehang" style="${inlineCSS} width: ${hangAmount}pt; ${level}">${hangCharacters.trim()}</td><td class="group-hang" style="${inlineCSS} text-align:${group.el[1].att.qdtype};  max-width: ${group.el[1].att.lnwidth}pt;">${text}</td>`;
};

const tableText = (rootStyle, block, frame, groupStyle) => {
	const tgroup = frame.el[0];
	const colspec = tgroup.el.filter(item => item.name === "colspec");
	const thead = tgroup.el.filter(item => item.name === "thead");
	let tbody = tgroup.el.filter(item => item.name === "tbody");
	let tempHead = [];
	let text = "";

	//Push thead into main body rows
	if (thead !== undefined)
		thead.forEach(el => {
			tempHead.push(el);
		});

	tempHead = tempHead.reverse();

	tempHead.forEach(element => {
		tbody.unshift(element);
	});

	tbody.forEach((element, rowIndex) => {
		element.el.forEach((row, rowIndex) => {
			let td = "";

			row.el.forEach((col, colIndex) => {
				td += table.cellContainer(rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspec);
			});

			if (parseInt(row.att.rowrel) > parseInt(tgroup.att.hdr_rows) && tgroup.att.tgroupstyle === "fintab") {
				if (tgroup.att.stubcols && remote.getGlobal("edgarShade")) {
					if (row.att.row % 2 === 0) {
						text += `<tr row="${row.att.rowrel}">${td}</tr>`;
					} else {
						text += `<tr row="${row.att.rowrel}" style="background-color: #cceeff;">${td}</tr>`;
					}
				} else {
					text += `<tr row="${row.att.rowrel}">${td}</tr>`;
				}
			} else {
				text += `<tr row="${row.att.rowrel}">${td}</tr>`;
			}
		});
	});

	return text;
};

const generateText = (rootStyle, block, group, groupStyle, line, lineIndex, t, tIndex) => {
	let text = "";
	//Check for empty generated lines
	if (!t.el) {
		if (!t.hasOwnProperty("att")) return;
		if (t.att.hasOwnProperty("cgt") && t.hasOwnProperty("el")) return `<div>&nbsp;</div>`;
		return text;
	}

	//Removes leaders from sum1
	if (groupStyle === "sum1" || t.el[0].txt === ".") if (t.att.cgt) return "";

	t.el.forEach((el, elIndex) => {
		if (el.type === "instruction") {
			const ins = style.handleInstructions(el);
			if (ins !== null) text += ins;
		} else {
			//Adds usb to text
			if (elIndex > 1) {
				if (t.el[elIndex - 1].ins === "usb") {
					if (el.txt.split(" ")[0] === "") el.txt = `&nbsp;${el.txt.slice(1)}`;
				}
			}

			if (t.att.x > 0 && el.txt.length > 0) text += `<var style="padding-left: ${t.att.x}pt;">${text}</var>`;

			//Wrap text with styling
			text += style.wrapBlockText(el.txt, t.att.style, rootStyle, group, line, groupStyle, t, tIndex, lineIndex, elIndex);
		}
	});

	return text;
};

const handleBlockRules = (rootStyle, block, group, line, t, tIndex) => {
	let margin_top = "";
	let margin_bot = "";
	let display = `inline-block`;
	let width = ``;

	if (parseInt(line.att.prelead) < 0) {
		line.att.prelead = parseInt(line.att.prelead) + 12;
	}

	if (line.att.qdtype === "left") margin_top = `margin-top: ${parseInt(line.att.prelead)}pt;`;

	if (parseInt(line.att.prelead) < 0) line.att.prelead = Math.abs(parseInt(line.att.prelead));

	if (line.att.qdtype === "center") margin_top = `margin: auto; margin-top: ${parseInt(line.att.prelead) + 6}pt; margin-bottom: 3pt;`;

	if (t.att.d === "0.5") t.att.d = "1";

	let margin_left = "";
	if (line.att.lindent !== "0") margin_left = `margin-left: ${line.att.lindent}pt;`;

	if (t.att.w > 500 && line.att.qdtype !== "center") {
		display = `block`;
	} else {
		width = `width: ${t.att.w}pt;`;
	}

	if (parseInt(line.att.xfinal) > 10 && line.att.qdtype === "left") {
		display = `block`;
		margin_left = `margin-left: ${parseFloat(line.att.xfinal) - parseFloat(line.att.lindent)}pt;`;
	}

	// if (block.att.type === "main")
	// 	rootStyle.forEach(element => {
	// 		if (element.att.name === group.att.style) {
	// 			margin_bot = `margin-bottom: -${parseFloat(element.att.size) + parseFloat(t.att.y)}pt;`;
	// 			return;
	// 		}
	// 	});

	return `<div class="rule" style="border-bottom: ${t.att.d}pt solid ${t.att.color}; display: ${display}; ${width} ${margin_top} ${margin_left} ${margin_bot}"> </div>`;
};

const getPickUp = (page, t) => {
	const pickupID = t.ins.split(";")[1];

	let img = "";

	const block = page.el
		.filter(item => {
			return item.att.type === "pickup";
		})
		.filter(item => {
			return item.att.id === pickupID;
		});

	const imageID = block[0].el[0].att.id;

	const folder = remote.getGlobal("saveLocation");
	cmd.get(`n: & cd N:\\xz\\gs & gs.exe -dDEVICEWIDTHPOINTS=${block[0].att.ssx} -dDEVICEHEIGHTPOINTS=${block[0].att.ssy} -sDEVICE=jpeg -dJPEGQ=100 -r300 -o ${folder}\\${imageID.substring(0, imageID.length - 4)}.jpg N:\\graphics\\house\\${block[0].el[0].att.id}`);

	img = `<img style="width: ${block[0].att.ssx}pt; max-width: 100%; vertical-align: bottom; float: left; padding-right: 5pt; display: inline-block;" src="${imageID.substring(0, imageID.length - 4)}.jpg">`;

	return img;
};
