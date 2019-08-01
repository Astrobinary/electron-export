const help = require("./index");
const Handlebars = require("handlebars");
const render = require("./_text");

Handlebars.registerHelper("display_text", (rootStyle, block, group) => {
	// let lines = help.onlyType(group.el, "element");
	let text = render.text(rootStyle, block, group, group.att.style);

	return new Handlebars.SafeString(text);
});
