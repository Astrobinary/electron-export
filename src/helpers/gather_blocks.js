const Handlebars = require("handlebars");
exports = Handlebars.registerHelper("gather_blocks", (streams, options) => {
	let pageBlocks = [];
	let footnotes = [];

	// //Goes through each objects and pulls the blocks
	for (let i = 0; i < streams.length; i++) {
		for (let x = 0; x < streams[i].el.length; x++) {
			if (streams[i].el[x].type === "element" && streams[i].el[x].att.type !== "footnote") {
				pageBlocks.push(streams[i].el[x]);
			} else if (streams[i].el[x].type === "element" && streams[i].el[x].att.type === "footnote") {
				footnotes.push(streams[i].el[x]);
			}
		}
	}

	//Sorts the blocks based on page position (_att.by)
	let filterdBlocks = pageBlocks.sort((a, b) => {
		if (a.att.by === b.att.by) {
			if (a.att.fipcblk) {
				return -1;
			} else {
				return 1;
			}
		}

		return a.att.by - b.att.by;
	});

	//Places page footnote after the last main block
	//Finds last block
	let temp = filterdBlocks
		.slice()
		.reverse()
		.find(block => block.att.type === "main");

	//Injects footnote objects to the end of main block
	if (footnotes.length > 0) {
		for (let y = 0; y < footnotes.length; y++) {
			for (let z = 0; z < footnotes[y].el.length; z++) {
				if (footnotes[y].el[z].type === "element") {
					temp.el.push(footnotes[y].el[z]);
				}
			}
		}
	}

	return options.fn(filterdBlocks);
});
