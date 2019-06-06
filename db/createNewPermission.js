const createNewWebsite = (connection, userId, websiteId, permission) => {
  return new Promise((resolve, reject) => {
    const sql = `
    INSERT INTO Permissions
    (id, userId, websiteId, type)
    VALUES (NULL,'${userId}','${websiteId}','${permission}')
    `;
    connection.query(sql, (error, results, fields) => {
      if (error) {
        //reject(error);
        reject(new Error(error));
        //throw error;
      }
      resolve(true);
    });
  });
};

module.exports = createNewWebsite;