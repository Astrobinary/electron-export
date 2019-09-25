const Handlebars = require("handlebars");

exports = Handlebars.registerHelper("create_blocks", (page, block, blockIndex, options) => {
	let builtBlock = "";
	let margin = "";
	let display = "display: block;";

	if (block.att.type === "tocheader") return new Handlebars.SafeString(`<a href="#_toc" style="font-size: 8pt; text-align: left; margin-bottom: 20px; display: block;">TABLE OF CONTENTS</a>`);

	if (block.el[0].txt !== undefined) return;

	//Handles float for pc2 blocks
	let float = "";

	if (block.att.ipcnum === "2") {
		if (block.att.fipcblk) {
			let amt = parseFloat(block.att.bx) + parseFloat(block.att.bsx) - parseFloat(page[blockIndex + 1].att.bx);

			if (amt > 20) amt = 12;
			margin += `margin-right: ${Math.abs(amt)}pt;`;
		}

		display = `display: inline-block;`;
	}

	//Handle graphics here
	if (block.att.type === "graphic") return;

	//Margin top for frills
	if (block.att.type !== "main" && block.att.bisy < 300) margin = `margin-top: 10pt;`;

	//Check for sumbox frill
	if (block.att.bsy > 500 && block.att.type === "frill") return;

	//Check if previous block contains sumbox instructions
	if (page[0].att.bsy > 500 && page[0].att.type === "frill" && block.att.type === "main") {
		builtBlock = `<div class="block-${block.att.type}" style="${display} width: ${parseFloat(block.att.bsx) + 10}pt; ${createSumbox(page[0].el)} margin: auto; vertical-align: top; ${margin}">${options.fn(block)}</div>`;
	} else {
		//Standard block
		builtBlock = `<div class="block-${block.att.type}" style="${display}width: ${block.att.bsx}pt; margin: auto; ${float} vertical-align: top; ${margin}">${options.fn(block)}</div>`;
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

	return `border: ${ruleAtt.w}pt ${ruleStyle} ${ruleAtt.color}; ${padding}`;
};
