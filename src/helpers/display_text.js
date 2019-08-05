const help = require("./index");
const Handlebars = require("handlebars");
const render = require("./_text");

Handlebars.registerHelper("display_text", (rootStyle, block, group) => {
	let text = "";

	if (help.hasHang(group.el)) {
		text = render.listText(rootStyle, block, group, group.att.style);
	} else {
		text = render.text(rootStyle, block, group, group.att.style);
	}

	return new Handlebars.SafeString(text);
});
