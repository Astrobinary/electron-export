const Handlebars = require("handlebars");

exports.gather_blocks = Handlebars.registerHelper("gather_blocks", (context, options) => {
	return options.fn(context);
});
