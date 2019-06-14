
/**
 * 
 * @param {object} firestore 
 * @param {string} domain 
 * @returns {Promise} - returns true or false
 */
const isDomainAvailable = (firestore, domain) => {
  return new Promise((resolve, reject) => {
    if (domain === undefined) {
      resolve(false);
    }

    firestore.collection('websites').where('domain', '==', domain)
    .get()
    .then(snapshot => {
      if (snapshot.empty) {
        resolve(true);
      } else {
        resolve(false);
      }
    })
    .catch(err => {
      console.error('Error getting documents', err);
      reject(err);
    });
  });
};

module.exports = isDomainAvailable;

/**
 * 
  return new Promise((resolve, reject) => {
    if (domain === undefined) {
      resolve(false);
    }

    const sql = `
    SELECT * FROM Websites 
    WHERE domain LIKE '${domain}'
    `;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        //reject(error);
        reject(new Error(error));
        //throw error;
      }

      // connected!
      if (results.length===0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });

  });
 */