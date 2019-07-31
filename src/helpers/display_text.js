const help = require("./index");
const Handlebars = require("handlebars");

Handlebars.registerHelper("display_text", group => {
	let lines = help.onlyElements(group.el);

	console.log("----------");
	console.log(lines);
	console.log("~~~~~~~~~~");

	return new Handlebars.SafeString(group);
});
