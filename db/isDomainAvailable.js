
/**
 * 
 * @param {Object} connection 
 * @param {String} domain 
 * @returns {Promise} - returns true or false
 */
const isDomainAvailable = (connection, domain) => {
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
        resolve(false);
      } else {
        resolve(true);
      }
    });

  });
};

module.exports = isDomainAvailable;