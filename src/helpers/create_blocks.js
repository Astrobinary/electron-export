const Handlebars = require("handlebars");

exports = Handlebars.registerHelper("create_blocks", (block, options) => {
	let builtBlock = "";

	//Handle graphics here
	if (block.att.type === "graphic") return;

	//Standard block
	builtBlock = `<div class="block-${block.att.type}" style="width: 100%; display: inline-block; vertical-align: top;">${options.fn(block)}</div>`;

	return new Handlebars.SafeString(builtBlock);
});
