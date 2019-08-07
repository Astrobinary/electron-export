//General CSS for tags generated from XML
module.exports.generatedCSS = (rootStyle, currentName) => {
	let att;

	rootStyle.forEach(style => {
		if (style.att.name === currentName) {
			att = style.att;
			return;
		}
	});

	if (att === undefined) return;

	//Handles font family
	let fontFamily = "";

	if (att.font.includes("Arial")) {
		fontFamily = "Arial";
	} else if (att.font.includes("Times")) {
		fontFamily = "Times New Roman";
	} else if (att.font.includes("Helvetica")) {
		fontFamily = "Helvetica";
	} else {
		fontFamily = "Arial";
	}

	return `font-size: ${att.size}pt; font-family: ${fontFamily};`;
};

//Created style based on element attributes
module.exports.inlineCSS = (block, group, gindex) => {
	let att;
	let style = "";

	if (group.el[0].att.bmline) {
		att = group.el[1].att;
	} else {
		att = group.el[0].att;
	}

	//Indents and levels
	if (group.el[0].att.lindent > 0) {
		if (group.el[1] !== undefined) {
			if (group.el[0].att.lindent > group.el[1].att.lindent) {
				style += `text-indent: ${att.lindent - group.el[1].att.lindent}pt;`;
				if (group.el[1].att.lindent > 0) style += `margin-left: ${group.el[1].att.lindent}pt;`;
			} else {
				style += `margin-left: ${att.lindent}pt;`;
			}
		} else {
			style += `text-indent: ${att.lindent}pt;`;
		}
	}

	if (group.el[0].att.rindent > 0) {
		style += `margin-right: ${att.rindent}pt;`;
	}

	style += `text-align: ${att.qdtype}; `;

	//Add margin if not first block in group (used for pc2)
	if (block.att.ipcnum === "2" && (block.att.fipcblk || block.att.lipcblk)) {
		if (att.prelead === "0") {
			style += `margin-top: ${parseFloat(att.prelead) + parseFloat(att.ldextra) + parseFloat(att.yfinal)}pt;`;
		} else {
			style += `margin-top: ${parseFloat(att.prelead) + parseFloat(att.ldextra)}pt;`;
		}
	} else {
		if (gindex === 0 && group.att.class === "ftnote") {
			style += `margin-top: ${parseFloat(att.prelead) + parseFloat(att.ldextra) + 5}pt;`;
		} else {
			style += `margin-top: ${parseFloat(att.prelead) + parseFloat(att.ldextra)}pt;`;
		}
	}

	if (group.el[0].el[0].ins === "textbox") {
		style += `border: 1px solid; padding: ${group.el[1].att.prelead}pt; margin-top: ${group.el[1].att.prelead}pt;`;
	}

	if (group.att.class === "sum1") {
		if (group.el.length > 1)
			if (group.el[1].att.lindent !== 0) {
				style += `margin-left: ${group.el[1].att.lindent}pt; text-indent: -${group.el[1].att.lindent}pt;`;
			}

		style += `max-width: ${att.lnwidth}pt;`;
	}

	return style.trim();
};

module.exports.wrapText = (text, style, rootStyle, group, line, groupCSS, t, tIndex, lineIndex) => {
	//Dont style empty text...
	if (!/\S/.test(text)) return text;
	text = text.replace(/</gm, "&lt;");
	text = text.replace(/>/gm, "&gt;");

	let att, groupATT;

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

	let styles = "";
	let styleWrap = "";

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

	//If broken with a <qa> and alignment is different has to be last T in an line element
	if (group.el[0].att.qdtype !== line.att.qdtype && line.att.quadset && line.el.length - 1 === tIndex && text.length > 1 && line.att.qdtype !== "forcej") {
		if (/\S/.test(text)) {
			if (group.el[lineIndex - 1].att.quadset === "true") text = `<div style="text-align: ${line.att.qdtype};">${text}</div>`;
		}
	}

	//Handles X value
	if (t.att.x > 0) styles += `padding-left: ${t.att.x - 3}pt;`;

	// Handles Y value
	if (t.att.y > 0) styles += `transform: translateY(${t.att.y}pt); display: inline-block;`;

	//Handles CM casing
	if (att.cm === "upper") {
		styles += `text-transform: uppercase;`;
	} else if (att.cm === "lower") {
		styles += `text-transform: lowercase;`;
	} else if (att.cm === "smallcap") {
		styles += `font-variant: small-caps;`;
	}

	if (text === "󰄝") text = `<font style=" font-size: 16pt; line-height: 12pt;">&#8226;</font>`; //Bullet to html??
	if (t.att.y < 0) text = `<sup style="line-height: 1; font-size: x-small;">${text}</sup>`;
	if (t.att.ul1) text = `<u>${text}</u>`;

	if (styles !== "") {
		styleWrap = `style="${styles}"`;
	}

	if (att.fv === "1") {
		text = `<b ${styleWrap}>${text}</b>`;
	} else if (att.fv === "2") {
		text = `<i ${styleWrap}>${text}</i>`;
	} else if (att.fv === "3") {
		text = `<b><i ${styleWrap}>${text}</i></b>`;
	} else if (styles !== "") {
		text = `<font ${styleWrap}>${text}</font>`;
	}

	//Wraps text around page ref link
	if (tIndex > 1 && t.att.cgt) {
		if (group.el[lineIndex].el[tIndex - 1].name === "xref") {
			text = `<a href="#${group.el[lineIndex].el[tIndex - 1].att.id}">${text}</a>`;
		}
	}

	if (t.att.hasOwnProperty("ul8")) text = `<font style="text-decoration: line-through">${text}</font>`;
	if (t.att.hasOwnProperty("ul10")) text = `<font style="border-bottom: 3px double;">${text}</font>`;
	if (t.att.hasOwnProperty("ul8") && t.att.hasOwnProperty("ul10")) text = `<font  style="text-decoration: line-through border-bottom: 3px double;">${text}</font>`;

	return text;
};
