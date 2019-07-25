const Handlebars = require("handlebars");

exports.boogie = Handlebars.registerHelper("boogie", function(text) {
	return new Handlebars.SafeString(text);
});
