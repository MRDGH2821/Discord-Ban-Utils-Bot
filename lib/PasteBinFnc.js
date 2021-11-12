const { pasteKey, pasteUser, pastePass } = require('../config.json');
const PasteClient = require('pastebin-api').default;

const PstCli = new PasteClient(pasteKey);
const pstToken = PstCli.login(pasteUser, pastePass);

async function CreatePst(data, expiry, title) {
	await PstCli.createPaste({
		code: data,
		expireDate: expiry,
		format: 'javascript',
		name: title,
		publicity: 2,
	})
		.then(async url => {
			return url;
		})
		.catch(async error => {
			return error;
		});
}

async function GetPaste(link) {
	await PstCli.getRawPasteByKey({
		pasteKey: link,
		userKey: await pstToken,
	})
		.then(async data => {
			return data;
		})
		.catch(async error => {
			return error;
		});
}

function PasteCheck(link) {
	if (/(https:\/\/pastebin.com\/)(.+)/g.test(link)) {
		return link.substring(21);
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
