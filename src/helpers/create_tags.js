const { remote } = require("electron");
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
	let hasInsert = false;

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

	//Check for R tags
	if (remote.getGlobal("marked")) hasInsert = findTraceInBlock(group);

	blockTag = `<div class="${group.att.style}" style="${inlineCSS}">${options.fn(this)}</div>`;
	if (hasInsert) blockTag = `<R>${blockTag}</R>`;

	return new Handlebars.SafeString(blockTag);
});

const createHangTag = (inlineCSS, tag, options) => {
	const tableStart = `<table class="${tag}" cellpadding="0" cellspacing="0" width="100%" ">`;
	const tableEnd = `<tr style="vertical-align: top;">${options.fn(this)}</tr></table>`;

	const table = tableStart + tableEnd;

	return table;
};

const createTable = (block, blockIndex, frame, tgroup, options) => {
	let margin = "";
	let border = "";
	let hasInsert = false;
	let table = "";

	if (remote.getGlobal("marked")) hasInsert = findTraceInTable(tgroup);

	if (frame.att.frame !== "none") border = `border: 1pt solid;`;

	if (tgroup.att.tbxposn > 0) margin += `margin-left: ${tgroup.att.tbxposn}pt; `;
	margin += `margin-top: 6pt;`;

	//Added +5 workaroudn for adding +5 padding to last column
	table = `<table class="${tgroup.att.tgroupstyle}" style="width: ${parseFloat(tgroup.att.tbwidth) + 6}pt; ${margin}${border} border-collapse: collapse;">${options.fn(this)}</table>`;

	if (hasInsert) table = `<R>${table}</R>`;

	return table;
};

const findTraceInBlock = group => {
	return group.el.some(line => {
		return line.att.chngbar;
	});
};

const findTraceInTable = tgroup => {
	let body = tgroup.el[tgroup.el.length - 1];
	let hasInsert = false;

	body.el.forEach(row => {
		row.el.forEach(entry => {
			entry.el.forEach(group => {
				return group.el.some(line => {
					if (line.att.chngbar) {
						hasInsert = true;
						return true;
					}
					return false;
				});
			});
		});
	});

	return hasInsert;
};
