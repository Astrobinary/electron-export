const help = require("./index");

//Created style based on element attributes
module.exports.inlineCSS = (rootStyle, page, block, group, gindex, lineIndex) => {
	let att;
	let style = "";
	let rootatt;

	if (group === undefined) console.log("what");

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

	//Right indent
	if (group.el[0].att.rindent > 0) style += `padding-right: ${att.rindent}pt;`;

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
				} else {
					style += `margin-top: ${parseFloat(att.prelead)}pt;`;
				}
			}
		} else {
			if (parseFloat(att.prelead) === 0) {
				if (gindex === 0 && lineIndex === 0 && !att.tbsa) style += `padding-top: ${parseFloat(att.yfinal)}pt;`;
			} else {
				if (group.hasOwnProperty("att")) {
					if (group.att.hasOwnProperty("style")) {
						if (!group.att.style.includes("calc.")) {
							if (parseFloat(att.yfinal) < 10) {
								style += `padding-top: ${parseFloat(att.yfinal)}pt;`;
							} else {
								style += `padding-top: ${parseFloat(att.prelead)}pt;`;
							}
						}
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
			console.log(rootatt.font);

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

	//If broken with a <qa> and alignment is different; has to be last T in an line element
	if (group.el[0].att.qdtype !== line.att.qdtype && group.el[0].att.qdtype !== "justify" && line.att.quadset && text.length > 1 && line.att.qdtype !== "forcej") {
		if (line.el.length > 1) {
			if (tIndex === 0) text = `<div style="text-align: ${line.att.qdtype}; padding-top: ${line.att.prelead}pt;">${text}`;
			if (line.el.length - 1 === tIndex) text += `</div>`;
		} else {
			if (parseInt(line.att.prelead) < 0) {
				text = `<div style="text-align: ${line.att.qdtype}; margin-top: ${line.att.prelead}pt; padding-left: ${line.att.lindent}pt;">${text}</div>`;
			} else {
				text = `<div style="text-align: ${line.att.qdtype}; padding-top: ${line.att.prelead}pt; padding-left: ${line.att.lindent}pt;">${text}</div>`;
			}
		}
	}

	return text;
};

module.exports.hasStyleProperty = (arr, target) => {
	return arr.some(style => {
		return style.split(":")[0] === target;
	});
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

module.exports.handleInstructions = el => {
	if (el.ins === "qa") return `<br/>`;
	if (el.ins === "l") return `<br/>`;
	if (el.ins === "lz") return `&nbsp;`;

	if (el.ins === "xix") return `<div>`;

	if (el.ins.includes("link;")) return `<a href="${el.ins.slice(5)}">`;
	if (el.ins === "/link") return `</a>`;

	if (el.ins === "sup") return `<sup>`;
	if (el.ins === "reset") return `</sup>`;

	if (el.ins.includes("ru;")) {
		const params = el.ins.split(";");
		return `<div style="border-bottom: ${params[2].replace(/\D+/gm, "")}pt solid black;">&nbsp;</div>`;
	}

	if (el.ins.includes("rx;")) return `<a name="${el.ins.slice(3)}"></a>`;

	return null;
};
