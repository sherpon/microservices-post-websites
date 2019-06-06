
const addFileToDb = (firestore, websiteId, type, filename, timestamp, url, title) => {
  const websiteRef = firestore.collection('websites').doc(websiteId);
  switch (type) {
    case 'template':
      return websiteRef.collection('files').add({
        type: type,
        filename: filename,
        createdAt: timestamp,
      });
      break;

    case 'page':
      return websiteRef.collection('files').add({
        type: type,
        filename: filename,
        createdAt: timestamp,
        url,
        keywords:'',
        title,
        description:'',
        meta:'',
        scripts:'',
        styles:'',
      });
      break;
  
    default:
      return;
      break;
  }
};

module.exports = addFileToDb;