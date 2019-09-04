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

	const isLast = style.isLastColumn(tgroup, col);

	if (col.att.hasOwnProperty('alfleft')) divStyle.push(`white-space: nowrap;`);

	col.el.forEach((group, groupIndex) => {
		let maxWidth = 0;

		//Handles indent
		if (group.el[0].att.lindent > 0) divStyle.push(`margin-left: ${group.el[0].att.lindent}pt;`);

		//Handles 2nd line indent
		if (group.el.length > 1)
			if (group.el[1].att.lindent > group.el[0].att.lindent) {
				divStyle.push(`margin-left: ${group.el[1].att.lindent}pt; text-indent: -${parseInt(group.el[1].att.xfinal) - parseInt(group.el[0].att.xfinal)}pt;`);
			}

		group.el.forEach((line, lineIndex) => {
			if (line.el === undefined) return;

			if (col.att.rule_info === '1 0 0') divStyle.push(`border-bottom: 1pt solid;`); //urule
			if (col.att.rule_info === '1 2 0') divStyle.push(`border-bottom: 1pt solid;`); //trule
			if (col.att.rule_info === '3 2 0') divStyle.push(`border-bottom: 3pt double;`); // double trule

			let currentWidth = 0;

			if (line.att.qdtype !== 'center' && group.el.length > 1) {
				currentWidth = parseFloat(line.att.lnwidth) - 5.25;
			}

			maxWidth = Math.max(maxWidth, currentWidth);

			if (rowIndex + 1 > tgroup.att.hdstyle_rows) {
				let leftSpace = parseFloat(line.att.xfinal) - parseFloat(colspec.att.tbcxpos);
				if (!line.att.quadset && !(line.att.first && line.att.last) && isNumber) divStyle.push(`padding-right: ${(parseFloat(colspec.att.tbcmeas) - parseFloat(line.att.lnwidth)).toFixed()}pt;`);
				if (col.att.col === '1' && line.att.last && line.att.qdtype !== 'center' && maxWidth !== 0) {
					divStyle.push(`width: ${maxWidth}pt;`);
				} else if (isNumber && line.att.first && line.att.last && line.att.qdtype === 'center') {
					divStyle.push(`width: ${line.att.lnwidth}pt;`);
				} else {
					if (isNumber && isLast) divStyle.push(`max-width: ${line.att.lnwidth}pt;`);
				}

				if (line.att.qdtype !== 'center' && line.att.last) {
					if (leftSpace !== 0 && isNumber) {
						if (leftSpace > parseInt(colspec.att.tbclwsp) / 2) {
							divStyle.push(`margin-left: ${leftSpace.toFixed(2)}pt;`);
							if (!isLast) {
								divStyle.push(`margin-right: ${leftSpace.toFixed(2)}pt;`);
							}
						} else {
							divStyle.push(`margin-left: ${colspec.att.tbclgut}pt;`);
							if (!isLast) divStyle.push(`margin-right: ${colspec.att.tbcrwsp}pt;`);
						}
					} else {
						if (!isNumber && !isLast) {
							divStyle.push(`margin-right: ${colspec.att.tbcrwsp}pt;`);
						} else {
							divStyle.push(`margin-left: ${colspec.att.tbclwsp}pt;`);
						}
					}
				}
			} else {
				if (col.att.col === '1' && !isLast && line.att.last) divStyle.push(`margin-right: ${colspec.att.tbcrwsp}pt;`);
			}

			line.el.forEach((t, tIndex) => {
				if (t.type === 'instruction') {
					const ins = style.handleInstructions(t);
					if (ins !== null) text += ins;
				} else {
					if (t.att.x > 0 && parseInt(col.att.col) > 1 && text.length > 0) {
						text += `<var style="padding-left: ${t.att.x}pt;"></var>`;
						divStyle.push(`max-width: ${parseFloat(line.att.lnwidth) + parseFloat(t.att.x)}pt;`);
					} else if (t.att.x > 0 && parseInt(col.att.col) > 1 && text.length < 1) {
						if (tIndex > 1) {
							if (line.el[tIndex - 1].name === 'shape') {
								divStyle.push(`padding-left: ${parseFloat(t.att.x) - Math.abs(line.el[tIndex - 1].att.x)}pt;`);
							} else {
								divStyle.push(`padding-left: ${t.att.x}pt;`);
							}
						} else {
							divStyle.push(`padding-left: ${t.att.x}pt;`);
						}
					}
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
							} else if ((/\d/.test(el.txt) && /\$/.test(el.txt)) || /\s—/.test(el.txt)) {
								el.txt = el.txt.replace(/ +?/g, '');
							}

							if (isNumber && el.txt.includes('%')) divStyle.push(`margin-right: 2.5ch;`);

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
