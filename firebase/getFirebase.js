const admin = require('firebase-admin');

/**
 * 
 * @param {Object} firebase - Is a firebase-admin instance
 */
const getFirebase = (firebase) => {
  if (!firebase) {
    if (!admin.apps.length) {
      if (process.env.SHERPON_ENV==='DEVELOPMENT') {
        admin.initializeApp({
          credential: admin.credential.cert(process.env.FIREBASE_SERVICE_ACCOUNT)
        });
      } else {
        admin.initializeApp();
      }
    }
    firebase = admin;
  }

  return firebase;
};

module.exports = getFirebase;