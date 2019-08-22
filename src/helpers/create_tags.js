const Handlebars = require("handlebars");
const style = require("./_style");
const help = require("./index");

Handlebars.registerHelper("create_tags", (rootStyle, block, group, gindex, options) => {
	if (group.att === undefined) {
		return;
	}
	// let generatedCSS = style.generatedCSS(rootStyle, group.att.style);
	let inlineCSS = style.inlineCSS(rootStyle, block, group, gindex);
	let blockTag = "";

	//Checks for hanging elements such as bullets, ftnotes, etc.
	if (help.hasHang(group.el)) {
		blockTag = createHangTag(inlineCSS, group.att.style, options);
		return new Handlebars.SafeString(blockTag);
	}

	//Checks if current group is a table
	if (group.name === "table") {
		blockTag = createTable(block, options.data._parent.index, group, group.el[0], options);
		return new Handlebars.SafeString(blockTag);
	}

	blockTag = `<div class="${group.att.style}" style="${inlineCSS}">${options.fn(this)}</div>`;
	return new Handlebars.SafeString(blockTag);
});

const createHangTag = (inlineCSS, tag, options) => {
	const tableStart = `<table class="${tag}" cellpadding="0" cellspacing="0" width="100%" style="${inlineCSS}">`;
	const tableEnd = `<tr style="vertical-align: top;">${options.fn(this)}</tr></table>`;

	const table = tableStart + tableEnd;

	return table;
};

const createTable = (block, blockIndex, frame, tgroup, options) => {
	let margin = "";
	let border = "";

	if (frame.att.frame !== "none") border = `border: 1pt solid;`;

	if (tgroup.att.tbxposn > 0) margin += `margin-left: ${tgroup.att.tbxposn}pt; `;
	margin += `margin-top: 6pt;`;

	// ${tgroup.el[tgroup.el.length - 1].el[0].att.row_pos}

	const table = `<table class="${tgroup.att.tgroupstyle}" style="width: ${tgroup.att.tbwidth}pt; ${margin}${border} border-collapse: collapse;">${options.fn(this)}</table>`;

	return table;
};
