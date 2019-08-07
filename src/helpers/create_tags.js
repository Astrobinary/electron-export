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
