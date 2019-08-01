const Handlebars = require("handlebars");
const style = require("./_style");

Handlebars.registerHelper("create_tags", (rootStyle, block, group, gindex, options) => {
	let builtTag = "";

	// console.log("~~~~~~~~~");
	// console.log(block);
	// console.log("---------");

	let generatedCSS = style.generatedCSS(rootStyle, group.att.style);
	let inlineCSS = style.inlineCSS(block, group, gindex);

	//Checks if current group is a table
	if (group.name === "table") return new Handlebars.SafeString(`<div style="text-align: center; margin: 20px 0; color: #c7c7c7;">TABLE PLACEHOLDER</div>`);

	builtTag = `<div class="${group.att.style}" style="${generatedCSS} ${inlineCSS}">${options.fn(this)}</div>`;

	return new Handlebars.SafeString(builtTag);
});
