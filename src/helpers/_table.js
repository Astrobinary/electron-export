const style = require('./_style');

module.exports.parseTD = (rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspecs) => {
	const colspec = colspecs[col.att.col - 1];

	let colspan = '';
	if (col.att.namest !== undefined) {
		let end = col.att.nameend.slice(3);
		let start = col.att.namest.slice(3);
		colspan = `colspan="${parseInt(end) - parseInt(start) + 1}"`;
	}

	let rowspan = '';
	if (col.att.morerows !== undefined) colspan = `rowspan="${parseInt(col.att.morerows) + 1}"`;

	return `<td ${colspan} ${rowspan} align="${col.att.align}" valign="${col.att.valign}" style="${style.rowStyle(rootStyle, tgroup, row, rowIndex, col, colspec)}" >${tdText(rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspec)}</td>`;
};

const tdText = (rootStyle, block, tgroup, row, rowIndex, col, colIndex, colspec) => {
	const isNumber = col.att.alfleft !== undefined;
	let text = '';
	let divStyle = [];

	if (col.att.hasOwnProperty('alfleft')) divStyle.push(`white-space: nowrap;`);

	col.el.forEach((group, groupIndex) => {
		let maxWidth = 0;

		//Handles indent
		if (group.el[0].att.lindent > 0) divStyle.push(`margin-left: ${group.el[0].att.lindent}pt;`);

		//Handles 2nd line indent
		if (group.el.length > 1)
			if (group.el[1].att.lindent > group.el[0].att.lindent) {
				divStyle.push(`margin-left: ${group.el[1].att.lindent}pt; text-indent: -${group.el[1].att.lindent}pt;`);
			}

		group.el.forEach((line, lineIndex) => {
			if (line.el === undefined) return;
			maxWidth = Math.max(maxWidth, line.att.lnwidth);

			if (rowIndex + 1 >= tgroup.att.hdstyle_rows) {
				let leftSpace = parseFloat(line.att.xfinal) - parseFloat(colspec.att.tbcxpos);

				if (leftSpace !== 0) {
					if (leftSpace > parseInt(colspec.att.tbclwsp)) {
						if (isNumber) divStyle.push(`margin-left: ${leftSpace.toFixed(2)}pt;`);
						if (isNumber) if (tgroup.att.cols !== col.att.col) divStyle.push(`margin-right: ${leftSpace.toFixed(2)}pt;`);
					} else {
						divStyle.push(`margin-left: ${colspec.att.tbclgut}pt;`);
						if (tgroup.att.cols !== col.att.col) divStyle.push(`margin-right: ${colspec.att.tbcrwsp}pt;`);
					}
				}
			}

			line.el.forEach((t, tIndex) => {
				if (t.type === 'instruction') {
					const ins = style.handleInstructions(t);
					if (ins !== null) text += ins;
				} else {
					if (t.att.x > 0 && parseInt(col.att.col) > 1) text += `<var style="padding-left: ${t.att.x}pt;"></var>`;
				}

				if (t.name === 't' && t.el !== undefined) {
					t.el.forEach((el, elIndex) => {
						if (el.type === 'instruction') {
							const ins = style.handleInstructions(el);
							if (ins !== null) text += ins;
						} else {
							if (el.txt === undefined) return;
							if (t.att.cgt && el.txt === '.') return;

							//Removes spaces from numbers
							if (/\d/.test(el.txt) && isNumber) {
								if (/\$/.test(el.txt)) {
									el.txt = el.txt.replace(/ +?/g, '');
								} else {
									el.txt = el.txt.trim();
								}
							}

							//Adds USB
							if (elIndex > 1) {
								if (t.el[elIndex - 1].name === 'xpp') {
									if (t.el[elIndex - 1].ins === 'usb') {
										if (el.txt.split(' ')[0] === '') el.txt = `&nbsp;${el.txt.slice(1)}`;
									}
								}
							}

							text += style.wrapBlockText(el.txt, t.att.style, rootStyle, group, line, group.att.style, t, tIndex, lineIndex, elIndex);

							if (line.att.quadset && t.att.cgt) text += `<br/>`;
						}
					});
				}
			});
		});

		if (col.att.col === '1') divStyle.push(`max-width: ${maxWidth}pt`);
	});
	return `<div style="${divStyle.join(' ')}">${text}</div>`;
};

const checkChgrow = row => {
	let rulestats = { xvrule: 0, xrule: 0, rule: 0 };

	row.el.forEach(entry => {
		entry.el.forEach(group => {
			group.el.forEach(line => {
				if (line.hasOwnProperty('el'))
					line.el.forEach(t => {
						if (t.ins === undefined) return;
						let ins = t.ins;

						if (ins === 'chgrow;xvrule') {
							rulestats.xvrule = parseInt(entry.att.col);
						}

						if (ins.includes('chgrow;xrule')) {
							rulestats.xrule = parseInt(entry.att.col);
						}

						if (ins.includes('chgrow;trule')) {
							rulestats.rule = parseInt(entry.att.col);
						}
					});
			});
		});
	});

	return rulestats;
};
