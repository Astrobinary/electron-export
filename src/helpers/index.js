const Handlebars = require("handlebars");
const fs = require("fs");
const cmd = require("node-cmd");
const { remote } = require("electron");

//Gathers all custom helpers for handlebars
exports.gather_blocks = require("./sort_blocks");
exports.create_blocks = require("./create_blocks");
exports.create_tags = require("./create_group");
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

exports.convertImage = t => {
	const folder = remote.getGlobal("saveLocation");
	if (!fs.existsSync(`${folder}\\${t.att.id.substring(0, t.att.id.length - 4)}.jpg`)) {
		cmd.get(`n: & cd N:\\xz\\gs & gs.exe -dDEVICEWIDTHPOINTS=${t.att.w} -dDEVICEHEIGHTPOINTS=${t.att.h} -sDEVICE=jpeg -dJPEGQ=100 -r300 -o ${folder}\\${t.att.id.substring(0, t.att.id.length - 4)}.jpg N:\\graphics\\house\\${t.att.id}`);
	}
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

exports.toRGB = cmyk => {
	if (cmyk === undefined) return;
	const CMYK = cmyk.split(" ");
	let result = [];

	const c = parseFloat(CMYK[0]);
	const m = parseFloat(CMYK[1]);
	const y = parseFloat(CMYK[2]);
	const k = parseFloat(CMYK[3]);

	result.push(1 - Math.min(1, c * (1 - k) + k));
	result.push(1 - Math.min(1, m * (1 - k) + k));
	result.push(1 - Math.min(1, y * (1 - k) + k));

	result[0] = Math.round(result[0] * 255);
	result[1] = Math.round(result[1] * 255);
	result[2] = Math.round(result[2] * 255);

	return `rgb(${result[0]}, ${result[1]}, ${result[2]})`;
};
