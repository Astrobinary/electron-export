const Handlebars = require("handlebars");
const style = require("./_style");
const help = require("./index");

Handlebars.registerHelper("create_tags", (rootStyle, block, group, gindex, options) => {
	if (group.att === undefined) {
		return;
	}
	let generatedCSS = style.generatedCSS(rootStyle, group.att.style);
	let inlineCSS = style.inlineCSS(block, group, gindex);
	let blockTag = "";

	//Checks for hanging elements such as bullets, ftnotes, etc.
	if (help.hasHang(group.el)) {
		blockTag = createHangTag(generatedCSS, inlineCSS, group.att.style, options);
		return new Handlebars.SafeString(blockTag);
	}

	//Checks for sum1/sum2
	// if (group.att.class === "sum1" || group.att.class == "sum2") {
	// 	blockTag = createSumTag(block, group, generatedCSS, gindex, options);
	// 	return new Handlebars.SafeString(blockTag);
	// }

	//Checks if current group is a table
	if (group.name === "table") {
		blockTag = `<div style="text-align: center; margin: 20px 0; color: #c7c7c7;">TABLE PLACEHOLDER</div>`;
		return new Handlebars.SafeString(blockTag);
	}

	blockTag = `<div class="${group.att.style}" style="${generatedCSS} ${inlineCSS}">${options.fn(this)}</div>`;
	return new Handlebars.SafeString(blockTag);
});

const createHangTag = (generatedCSS, inlineCSS, tag, options) => {
	const tableStart = `<table class="${tag}" cellpadding="0" cellspacing="0" width="100%" style="${inlineCSS} ${generatedCSS}">`;
	const tableEnd = `<tbody><tr style="vertical-align: top;">${options.fn(this)}</tr></tbody></table>`;

	const table = tableStart + tableEnd;

	return table;
};

const createSumTag = (block, group, css, gindex, options) => {
	let style = "";
	let lines = group.el;

	//Style for all sum1 groups
	if (group.att.class == "sum1") {
		let indent = 0;
		if (lines.length > 1) indent = lines[1].att.lindent;

		style += `width: ${216 - indent}pt; `;
		style += `text-indent: ${-indent}pt; `;
		style += `margin-left: ${indent}pt; `;
		style += `margin-right: ${20}pt;`;
		style += `vertical-align: top; `;
	}

	//Style for all sum2 groups
	if (group.att.class == "sum2" && block.el[gindex].el[1] !== undefined) {
		console.log(block.el[gindex].el[1].att);
		const indent = block.el[gindex].el[1].att.lindent;
		style += `width: ${220}pt; `;
		style += `vertical-align: bottom; `;

		//Checks previous group to see if its following a sum2
		if (gindex > 1)
			if (block.el[gindex - 2].att.class == "sum2") {
				// style += `margin-left: ${indent}pt; `;
				style += `float: right; `;
			}

		//Checks to see if first group in block
		if (gindex == 1) {
			style += `float: right; `;
			// style += `margin-left: ${indent}pt; `;
		}
	}

	style += `text-align: ${lines[0].att.qdtype};`;

	return `<div class="${group.att.class}"  style="${css} ${style} display: inline-block; margin-top: 15px;">${options.fn(this)}</div>`;
};
