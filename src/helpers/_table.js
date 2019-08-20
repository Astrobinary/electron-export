const style = require("./_style");

module.exports.parseTD = (rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspecs) => {
	const colspec = colspecs[col.att.col - 1];

	let colspan = "";
	if (col.att.namest !== undefined) {
		let end = col.att.nameend.slice(3);
		let start = col.att.namest.slice(3);
		colspan = `colspan="${parseInt(end) - parseInt(start) + 1}"`;
	}

	let rowspan = "";
	if (col.att.morerows !== undefined) colspan = `rowspan="${parseInt(col.att.morerows) + 1}"`;

	return `<td ${colspan} ${rowspan} align="${col.att.align}" valign="${col.att.valign}" style="${style.rowStyle(rootStyle, tgroup, row, rowIndex, col, colspec)}" >${tdText(rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspec)}</td>`;
};

const tdText = (rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspec) => {
	let text = "";
	let divStyle = [];

	if (col.att.hasOwnProperty("alfleft")) divStyle.push(`white-space: nowrap;`);

	col.el.forEach((group, groupIndex) => {
		let maxWidth = 0;

		let leftSpace = parseFloat(group.el[0].att.xfinal) - parseFloat(colspec.att.tbcxpos);

		console.log(row);

		if (tgroup.att.hdstyle_rows !== "0" && rowIndex + 1 <= tgroup.att.hdstyle_rows) {
		} else {
			divStyle.push(`padding-left: ${leftSpace}pt;`);
		}

		group.el.forEach((line, lineIndex) => {
			if (line.el === undefined) return;
			maxWidth = Math.max(maxWidth, line.att.lnwidth);

			line.el.forEach((t, tIndex) => {
				if (t.el !== undefined)
					t.el.forEach(el => {
						if (el.type === "instruction") {
							const ins = style.handleInstructions(el);
							if (ins !== null) text += ins;
						} else {
							if (el.txt === undefined) return;
							if (t.att.cgt && el.txt === ".") return;
							if (t.att.x > 0) text += `<font style="padding-left: ${t.att.x}pt;">${el.txt}</font>`;
							text += el.txt;

							if (line.att.quadset && t.att.cgt) text += `<br/>`;
						}
					});
			});
		});

		// divStyle.push(`max-width: ${maxWidth}pt;`);
	});
	return `<div style="${divStyle.join(" ")}">${text}</div>`;
};

const checkChgrow = row => {
	let rulestats = { xvrule: 0, xrule: 0, rule: 0 };

	row.el.forEach(entry => {
		entry.el.forEach(group => {
			group.el.forEach(line => {
				if (line.hasOwnProperty("el"))
					line.el.forEach(t => {
						if (t.ins === undefined) return;
						let ins = t.ins;

						if (ins === "chgrow;xvrule") {
							rulestats.xvrule = parseInt(entry.att.col);
						}

						if (ins.includes("chgrow;xrule")) {
							rulestats.xrule = parseInt(entry.att.col);
						}

						if (ins.includes("chgrow;trule")) {
							rulestats.rule = parseInt(entry.att.col);
						}
					});
			});
		});
	});

	return rulestats;
};
