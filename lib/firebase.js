const fs = require('fs');
const {
  initializeApp,
  cert,
} = require('firebase-admin/app');
const {
  getFirestore,
} = require('firebase-admin/firestore');
const config = fs.readdirSync('./lib/firebase-service-acc');

console.log(config);
const serviceAccount = require(`./firebase-service-acc/${config[0]}`);

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
/*
async function getAll() {
	const snapshot = await db.collection('servers').get();
	snapshot.forEach(doc => {
		console.log(doc.id, '=>', doc.data());
	});
	console.log(snapshot.docs[0]);
}
897498649410560032 => { serverID: '897498649410560032', logChannel: 922078407670509600 }
*/
// getAll();

module.exports = {
  db,
};
