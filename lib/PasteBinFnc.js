function PasteCheck(link) {
	if (/(https:\/\/dpaste.com\/)(.+)/g.test(link)) {
		return link.substring(19);
	}
	else {
		return link;
	}
}

module.exports = {
	PasteCheck,
};
