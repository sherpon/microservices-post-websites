/**
 * https://jestjs.io/docs/en/manual-mocks
 */

const firebaseAdmin = jest.genMockFromModule('firebase-admin');

let __mockFirebaseAuthenticationUser = {
  token: '',
  uid: '',
};

const __setMockUser = (user) => {
  __mockFirebaseAuthenticationUser = user;
};

firebaseAdmin.__setMockUser = __setMockUser; 

let auth = {};
auth.verifyIdToken = (token) => {
  return new Promise((resolve, reject) => {
    if (token===undefined) {
      reject('error: token is undefined');
    }

    if (token==='') {
      reject('error: token is empty');
    }

    if (token===__mockFirebaseAuthenticationUser.token) {
      const decodedToken = {
        uid: __mockFirebaseAuthenticationUser.uid
      };
      resolve(decodedToken)
    } else {
      reject('error: the token doesn\'t exist.');
    }
  });
};

firebaseAdmin.initializeApp = (credentianObject) => {};
firebaseAdmin.credential = {
  cert: () => {}
};
firebaseAdmin.apps = {
  length: 1
};
firebaseAdmin.auth = () => auth;

module.exports = firebaseAdmin;