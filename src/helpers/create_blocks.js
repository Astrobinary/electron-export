const Handlebars = require("handlebars");

exports = Handlebars.registerHelper("create_blocks", (page, block, blockIndex, options) => {
	let builtBlock = "";
	let margin = "";
	let display = "display: block;";
	let width = `width: ${parseFloat(block.att.bsx) + 16}pt;`;

	if (block.att.type === "tocheader") return new Handlebars.SafeString(`<a href="#_toc" style="font-size: 8pt; text-align: left; margin-bottom: 20px; display: block;">TABLE OF CONTENTS</a>`);
	if (block.el[0].txt !== undefined) return;

	if (block.att.ipcnum === "2") {
		if (block.att.fipcblk) {
			let amt = parseFloat(block.att.bx) + parseFloat(block.att.bsx) - parseFloat(page[blockIndex + 1].att.bx);
			if (amt > 20) amt = 12;
			margin += `margin-right: ${Math.abs(amt)}pt;`;

			width = `width: ${parseFloat(block.att.bsx) + 8}pt`;
		}

		display = `display: inline-block;`;
	}

	if (parseInt(block.att.bsx) > 612) width = `width: 100%;`;

	//Check for sumbox frill
	if (block.att.bsy > 500 && block.att.type === "frill") return;

	//Margin top for frills (temp)
	if (block.att.type !== "main" && block.att.bisy < 300) margin = `margin-top: 10pt;`;

	//Check if previous or next block contains sumbox instructions
	let pageNum;
	if (page[0].att.bsy > 500 && page[0].att.type === "frill" && block.att.type === "main") pageNum = 0;
	if (page.length > 0) if (page[1].att.bsy > 500 && page[1].att.type === "frill" && block.att.type === "main") pageNum = 1;

	if (pageNum !== undefined) {
		builtBlock = `<div class="block-${block.att.type}" style="${display} ${width} ${createSumbox(page[pageNum].el)} margin: auto; vertical-align: top; ${margin}">${options.fn(block)}</div>`;
	} else {
		builtBlock = `<div class="block-${block.att.type}" style="${display} ${width} margin: auto;  vertical-align: top; ${margin}">${options.fn(block)}</div>`;
	}

	return new Handlebars.SafeString(builtBlock);
});

const createSumbox = el => {
	let ruleStyle = "solid";
	let padding = "padding: 10pt 10pt 10pt 10pt;";
	let ruleAtt;
	if (el[0].el[0].el[1] !== undefined) {
		ruleAtt = el[0].el[0].el[1].att;
	}

	if (ruleAtt === undefined) {
		ruleAtt = {};
		ruleAtt.w = "1";
		ruleAtt.color = "black";
	} else if (ruleAtt.w === "0.5") {
		ruleAtt.w = "1";
	}

	if (ruleAtt.w === undefined) ruleAtt.w = ruleAtt["outline-size"];

	return `border: ${ruleAtt.w}pt ${ruleStyle} ${ruleAtt.color}; ${padding}`;
};
