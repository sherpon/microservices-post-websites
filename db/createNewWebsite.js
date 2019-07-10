
const createNewWebsite = (firestore, name, domain, type, paymentProcessor, userId, timestamp, expiresAt) => {
  return new Promise((resolve, reject) => {
    let permissions = {};
    permissions[userId] = 'administrator';

    firestore.collection('websites').add({
      name,
      domain,
      type,
      paymentProcessor,
      favicon: '',
      storage: parseInt(process.env.WEBSITE_STORAGE_INIT),
      permissions,
      createdAt: timestamp,
      expiresAt,
    }).then(ref => {
      // console.log('Added document with ID: ', ref.id);
      resolve(ref.id);
    });
  });
};

module.exports = createNewWebsite;

/**
 * return new Promise((resolve, reject) => {
    const websiteId = uuidv1();
    const sql = `
    INSERT INTO Websites
    (id, name, favicon, domain, storage, createdAt)
    VALUES ('${websiteId}','${name}','','${domain}',${process.env.WEBSITE_STORAGE_INIT}, CURRENT_TIMESTAMP)
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
 */