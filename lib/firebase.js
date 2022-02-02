const fs = require('fs');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore'),
  configs = fs
    .readdirSync('./lib/firebase-service-acc')
    .filter((file) => file.endsWith('.json'));

console.log(configs);
configs.sort();
// let serviceAccount;
try {
  for (const config in configs) {
    if (typeof config === 'string') {
      console.log(config);
      const serviceAccount = require(`./firebase-service-acc/${configs[config]}`);
      initializeApp({
        credential: cert(serviceAccount)
      });
      break;
    }
  }
}
catch (error) {
  console.log(error);
}

// eslint-disable-next-line one-var
const db = getFirestore();

/*
 *Async function getAll() {
 *const snapshot = await db.collection('servers').get();
 *snapshot.forEach(doc => {
 *console.log(doc.id, '=>', doc.data());
 *});
 *console.log(snapshot.docs[0]);
 *}
 *897498649410560032 => { serverID: '897498649410560032', logChannel: 922078407670509600 }
 */
// GetAll();

module.exports = {
  db
};
