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

	// //Handles font variant/font weight
	// let fontWeight = "";

	// if (att.hasOwnProperty("fv")) {
	// 	if (att.fv === "1") {
	// 		fontWeight = "font-weight: bold; font-style: normal;";
	// 	} else if (att.fv === "2") {
	// 		fontWeight = "font-weight: normal; font-style: italic;";
	// 	} else if (att.fv === "3") {
	// 		fontWeight = "font-weight: bold; font-style: italic;";
	// 	} else {
	// 		fontWeight = "font-weight: normal; font-style: normal;";
	// 	}
	// }

	//Handles font family
	let fontFamily = "";

	if (att.font.includes("Arial")) {
		fontFamily = "Arial, Sans-Serif";
	} else if (att.font.includes("Times")) {
		fontFamily = "Times New Roman, Times, Serif";
	} else if (att.font.includes("Helvetica")) {
		fontFamily = "Helvetica, Arial, Sans-Serif";
	}

	return `font-size: ${att.size}pt; color: ${att.color}; font-family: ${fontFamily};`;
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
				if (group.el[1].att.lindent > 0) style += `padding-left: ${group.el[1].att.lindent}pt;`;
			} else {
				style += `padding-left: ${att.lindent}pt;`;
			}
		} else {
			style += `text-indent: ${att.lindent}pt;`;
		}
	}

	style += `text-align: ${att.qdtype}; `;
	style += `margin-top: ${parseInt(att.prelead) + parseInt(att.ldextra)}pt;`;

	return style.trim();
};

module.exports.wrapText = (text, style, rootStyle, group, line, groupCSS, t, tIndex, lineIndex) => {
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

	//Dont style empty text...
	if (!/\S/.test(text)) return text;

	let styles = "";
	let styleWrap = "";

	//Checks for different color
	if (att.color !== "#000000") {
		styles += `color: ${att.color};`;
	}

	//Checks for different size
	if (att.size !== groupATT.size) {
		styles += `font-size: ${att.size}pt;`;
	}

	//If broken with a <qa> and alignment is different
	//has to be last T in an line element
	if (group.el[0].att.qdtype !== line.att.qdtype && line.att.quadset && line.el.length - 1 === tIndex && text.length > 1 && line.att.qdtype !== "forcej") {
		// string is not empty and not just whitespace
		if (/\S/.test(text)) {
			//If the previous line has quadset then
			if (group.el[lineIndex - 1].att.quadset === "true") text = `<div style="text-align: ${line.att.qdtype};">${text}</div>`;
		}
	}

	if (text === "󰄝") text = "&#8226;"; //Bullet to html??
	if (t.att.y < 0) text = `<sup style="line-height: 1; font-size: x-small;">${text}</sup>`;
	if (t.att.ul1) text = `<u>${text}</u>`;

	if (styles !== "") {
		styleWrap = `style="${styles}"`;
	}

	if (att.fv === "1") {
		return `<b ${styleWrap}>${text}</b>`;
	} else if (att.fv === "2") {
		return `<i ${styleWrap}>${text}</i>`;
	} else if (att.fv === "3") {
		return `<b><i ${styleWrap}>${text}</i></b>`;
	} else if (styles !== "") {
		return `<font ${styleWrap}>${text}</font>`;
	}

	return text;
};
