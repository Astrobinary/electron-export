const Handlebars = require("handlebars");

exports = Handlebars.registerHelper("create_blocks", (page, block, options) => {
	let builtBlock = "";
	let margin = "";

	//Handle graphics here
	if (block.att.type === "graphic") return;

	//Margin top for frills
	if (block.att.type !== "main" && block.att.bisy < 300) margin = `margin-top: ${block.att.bisy}pt;`;

	//Check for sumbox frill
	if (block.att.bsy > 500 && block.att.type === "frill") return;

	//Check if previous block contains sumbox instructions
	if (page[0].att.bsy > 500 && page[0].att.type === "frill" && block.att.type === "main") {
		builtBlock = `<div class="block-${block.att.type}" style="width: 100%; ${createSumbox(page[0].el)} display: inline-block; vertical-align: top; ${margin}">${options.fn(block)}</div>`;
	} else {
		//Standard block
		builtBlock = `<div class="block-${block.att.type}" style="width: 100%; display: inline-block; vertical-align: top; ${margin}">${options.fn(block)}</div>`;
	}

	return new Handlebars.SafeString(builtBlock);
});

const createSumbox = el => {
	let ruleAtt = el[0].el[0].el[1].att;
	return `border: ${ruleAtt.w}pt solid ${ruleAtt.color}; padding: 10pt; box-sizing: border-box;`;
};
