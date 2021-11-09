const { pasteKey } = require('../config.json');
const PasteClient = require('pastebin-api').default;

const PstCli = new PasteClient(pasteKey);

async function CreatePst(data, expiry, title) {
	const paste = {
		url: '',
		error:'',
	};
	try {
		paste.url = await PstCli.createPaste({
			code: data,
			expireDate: expiry,
			format: 'javascript',
			name: title,
			publicity: 1,
		});
		paste.error = null;
	}
	catch (e) {
		paste.url = null;
		paste.error = e;
	}
	return paste;
}

module.exports = {
	CreatePst,
};
