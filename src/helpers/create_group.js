const { remote } = require("electron");
const Handlebars = require("handlebars");
const style = require("./_style");
const help = require("./index");

Handlebars.registerHelper("create_group", (rootStyle, page, block, group, gindex, options) => {
	if (group.att === undefined) return;
	if (group.el === undefined) return;

	let inlineCSS = style.inlineCSS(rootStyle, page, block, group, gindex, 0);

	let blockTag = "";
	let hasInsert = false;

	//Checks for hanging elements such as bullets, ftnotes, etc.
	if (help.hasHang(group.el)) {
		blockTag = createHangTag(group, group.att.style, options);
		return new Handlebars.SafeString(blockTag);
	}

	//Checks if current group is a table
	if (group.name === "table") {
		blockTag = createTable(block, group, gindex, group.el[0], options);
		return new Handlebars.SafeString(blockTag);
	}

	//Check for R tags
	if (remote.getGlobal("marked")) hasInsert = findTraceInBlock(group);

	blockTag = `<div class="${group.att.style}" style="${inlineCSS}">${options.fn(this)}</div>`;
	if (hasInsert) blockTag = `<R>${blockTag}</R>`;

	return new Handlebars.SafeString(blockTag);
});

const createHangTag = (group, tag, options) => {
	let top = "";

	if (parseFloat(group.el[0].att.yfinal) < 10) {
		top = `margin-top: ${parseFloat(group.el[0].att.yfinal)}pt;`;
	} else {
		top = `margin-top: ${parseFloat(group.el[0].att.prelead)}pt;`;
	}

	const tableStart = `<table class="${tag}" width="100%" style="${top} border-collapse: collapse;">`;
	const tableEnd = `<tr style="vertical-align: top;">${options.fn(this)}</tr></table>`;

	const table = tableStart + tableEnd;

	return table;
};

const createTable = (block, frame, gIndex, tgroup, options) => {
	let hasInsert = false;
	let margin = "";
	let border = "";
	let table = "";

	if (remote.getGlobal("marked")) hasInsert = findTraceInTable(tgroup);

	margin += `margin: auto;`;

	if (frame.att.frame !== "none") {
		if (frame.att.topbox) border += `border-top: ${parseFloat(frame.att.topbox) > 0.5 ? frame.att.topbox : 1}pt solid ${frame.att.btcolor};`;
		if (frame.att.botbox) border += `border-bottom: ${parseFloat(frame.att.botbox) > 0.5 ? frame.att.botbox : 1}pt solid ${frame.att.bbcolor};`;
		if (frame.att.lsidbox) border += `border-left: ${parseFloat(frame.att.lsidbox) > 0.5 ? frame.att.lsidbox : 1}pt solid ${frame.att.blcolor};`;
		if (frame.att.rsidbox) border += `border-right: ${parseFloat(frame.att.rsidbox) > 0.5 ? frame.att.rsidbox : 1}pt solid ${frame.att.brcolor};`;
	}

	//Calculates top margin based on prev group
	margin += findTopMarginTable(block, tgroup, gIndex);

	let width = `width: ${tgroup.att.tbwidth}pt;`;

	if (parseFloat(block.att.bsx) - parseFloat(tgroup.att.tbwidth) < 10) {
		width = `width: 100%;`;
	}

	if (tgroup.att.tbxposn > 0) margin += `margin-left: ${tgroup.att.tbxposn}pt; `;

	table = `<table class="${tgroup.att.tgroupstyle}" style="${width} ${margin}${border} border-collapse: collapse;">${options.fn(this)}</table>`;

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

const findTopMarginTable = (block, tgroup, gIndex) => {
	let last = "";
	let yfinal = 0;
	let marginTop = 0;
	if (gIndex > 0) {
		last = block.el[gIndex - 1].el[block.el[gIndex - 1].el.length - 1].att;
		if (last.yfinal === undefined) {
			yfinal = parseFloat(last.tbdepth) + parseFloat(last.tbyposn);
		} else {
			yfinal = parseFloat(last.yfinal);
		}
	}

	if (parseFloat(tgroup.att.tbyposn) - yfinal === 0) {
		marginTop = 10;
	} else {
		if (tgroup.att.tbyposn > 0) marginTop = parseFloat(tgroup.att.tbyposn) - yfinal;
	}

	return `margin-top: ${marginTop}pt;`;
};
