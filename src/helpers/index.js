const Handlebars = require("handlebars");

//Gathers all custom helpers for handlebars
exports.gather_blocks = require("./gather_blocks");
exports.create_blocks = require("./create_blocks");
exports.create_tags = require("./create_tags");
exports.display_text = require("./display_text");

//Outputs current context
Handlebars.registerHelper("debug", context => {
	console.log("========START========");
	console.log(context);
	console.log("---------END---------");
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
exports.onlyType = (arr, type) => {
	if (arr === undefined) return [];

	return arr.filter(item => {
		return item.type === type;
	});
};

//Checks t if contains hang
exports.hasHang = lines => {
	if (lines[0].att.last === "true") return;

	if (lines.length > 1) {
		if (lines[0].att.yfinal === lines[1].att.yfinal) {
			return true;
		}
	}

	return;
};
