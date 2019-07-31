const Handlebars = require("handlebars");

Handlebars.registerHelper("create_tags", (block, group, gindex, options) => {
	let builtTag = "";

	builtTag = `<div class="${group.att.class}" style="${group.att.style}">${options.fn(this)}</div>`;

	return new Handlebars.SafeString(builtTag);
});
