const { pasteKey, pasteUser, pastePass } = require('../config.json');
const PasteClient = require('pastebin-api').default;

const PstCli = new PasteClient(pasteKey);
const pstToken = async function() {return await PstCli.login(pasteUser, pastePass);};

async function CreatePst(data, expiry, title) {
	const paste = {
		url: '',
		error: '',
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

function GetPaste(link) {
	return PstCli.getRawPasteByKey({
		pasteKey: link,
		userKey: pstToken,
	});
}

function PasteCheck(link) {
	if (!/(https:\/\/pastebin.com\/).+/g.test(link)) {
		return `https://pastebin.com/${link}`;
	}
	else {
		return link;
	}
}

module.exports = {
	CreatePst,
	PasteCheck,
	GetPaste,
};
