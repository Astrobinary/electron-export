const Handlebars = require("handlebars");

//Gathers all custom helpers for handlebars
exports.gather_blocks = require("./gather_blocks");
exports.create_blocks = require("./create_blocks");
exports.create_tags = require("./create_tags");
exports.display_text = require("./display_text");

//Outputs current context
Handlebars.registerHelper("debug", context => {
	console.log("Current Context");
	console.log("====================");
	console.log(context);
	console.log("--------------------");
});

//Filters json data based on name
Handlebars.registerHelper("filter_scope", (context, name, options) => {
	if (context.name === name) {
		return options.fn(context);
	} else {
		return options.inverse(this);
	}
});

//Soft filter for xpp instructions
exports.onlyElements = arr => {
	return arr.filter(item => {
		return item.type === "element";
	});
};
