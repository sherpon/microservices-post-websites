const uuidv1 = require('uuid/v1');

const createNewWebsite = (connection, name, domain) => {
  return new Promise((resolve, reject) => {
    const websiteId = uuidv1();
    const sql = `
    INSERT INTO Websites
    (id, name, favicon, domain, storage, createdAt)
    VALUES ('${websiteId}','${name}','','${domain}',600, CURRENT_TIMESTAMP)
    `;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        //reject(error);
        reject(new Error(error));
        //throw error;
      }
      resolve(websiteId);
    });
  });
};

module.exports = createNewWebsite;