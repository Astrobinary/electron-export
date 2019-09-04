const Handlebars = require('handlebars');

exports = Handlebars.registerHelper('create_blocks', (page, block, blockIndex, options) => {
	let builtBlock = '';
	let margin = '';

	if (block.el[0].txt !== undefined) return;

	//Handles float for pc2 blocks
	let float = block.att.ipcnum === '2' && block.att.lipcblk ? 'float: right;' : '';

	//Handle graphics here
	if (block.att.type === 'graphic') return;

	//Margin top for frills
	if (block.att.type !== 'main' && block.att.bisy < 300) margin = `margin-top: 10pt;`;

	//Check for sumbox frill
	if (block.att.bsy > 500 && block.att.type === 'frill') return;

	//Check if previous block contains sumbox instructions
	if (page[0].att.bsy > 500 && page[0].att.type === 'frill' && block.att.type === 'main') {
		builtBlock = `<div class="block-${block.att.type}" style="width: ${parseFloat(block.att.bsx) + 10}pt; ${createSumbox(page[0].el)} display: inline-block; vertical-align: top; margin-left: -20pt; ${margin}">${options.fn(block)}</div>`;
	} else {
		//Standard block
		builtBlock = `<div class="block-${block.att.type}" style="width: ${block.att.bsx}pt; display: inline-block; ${float} vertical-align: top; ${margin}">${options.fn(block)}</div>`;
	}

	return new Handlebars.SafeString(builtBlock);
});

const createSumbox = el => {
	let ruleStyle = 'solid';
	let padding = 'padding: 10pt 15pt 10pt 10pt;';
	let ruleAtt = el[0].el[0].el[1].att;
	if (ruleAtt.w === '0.5') ruleAtt.w = '1';

	return `border: ${ruleAtt.w}pt ${ruleStyle} ${ruleAtt.color}; ${padding}`;
};
