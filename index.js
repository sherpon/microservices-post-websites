//"use strict";

// Get Development Env
require('./utilities/getEnv')();

const getToken = require('./utilities/getToken');
const getConnection = require('./db/getConnection');
const getFirestore = require('./db/getFirestore');
const isDomainAvailable = require('./db/isDomainAvailable');
const createNewWebsite = require('./db/createNewWebsite');
const createNewPermission = require('./db/createNewPermission');
const addFileToDb = require('./db/addFileToDb');
const getStorage = require('./storage/getStorage');
const copyFileFromSource = require('./storage/copyFileFromSource');
const getAuthorization = require('./services/getAuthorization');

let connection;
let firestore;
let storage;

const publishNewWebsiteStep = async (req, res) => {
  res.status(201);  // send CREATED
  res.send({
    id: req.websiteId,
    name: req.body.name,
    domain: req.body.domain,
    favicon: '',
    storage: 600,
    createdAt: req.websiteCreatedAt,
    permission: 'administrator'
  });
};

const uploadFilesToBucketStep = async (req, res) => {
  try {
    const websiteId = req.websiteId;
    const websiteFiles = req.websiteFiles;
    storage = getStorage(storage);
    await copyFileFromSource(storage, 'templates/index.ejs', websiteId, `templates/${websiteFiles.templateIndexId}`);
    await copyFileFromSource(storage, 'templates/pages.ejs', websiteId, `templates/${websiteFiles.templatePagesId}`);
    await copyFileFromSource(storage, 'templates/header.ejs', websiteId, `templates/${websiteFiles.templateHeaderId}`);
    await copyFileFromSource(storage, 'templates/footer.ejs', websiteId, `templates/${websiteFiles.templateFooterId}`);
    await copyFileFromSource(storage, 'pages/about.ejs', websiteId, `pages/${websiteFiles.pageAboutId}`);
    publishNewWebsiteStep(req, res);
  } catch (error) {
    console.error(error);
    res.status(401);
    res.end();  // send no content
  }
};

const createFilesToDbStep = async (req, res) => {
  try {
    const websiteId = req.websiteId;
    firestore = getFirestore(firestore);
    const timestamp = firestore.Timestamp.now();
    await firestore.collection('websites').doc(websiteId).set({ createdAt: timestamp });
    const templateIndexRef = await addFileToDb(firestore, websiteId, 'template', 'index.ejs', timestamp);
    const templatePagesRef = await addFileToDb(firestore, websiteId, 'template', 'pages.ejs', timestamp);
    const templateHeaderRef = await addFileToDb(firestore, websiteId, 'template', 'header.ejs', timestamp);
    const templateFooterRef = await addFileToDb(firestore, websiteId, 'template', 'footer.ejs', timestamp);
    const pageAboutRef = await addFileToDb(firestore, websiteId, 'page', 'about.ejs', timestamp, /** url */ 'about', /** title */ 'About page');
    // populate
    req.websiteCreatedAt = timestamp;
    req.websiteFiles = {
      templateIndexId: templateIndexRef.id,
      templatePagesId: templatePagesRef.id,
      templateHeaderId: templateHeaderRef.id,
      templateFooterId: templateFooterRef.id,
      pageAboutId: pageAboutRef.id,
    };
    uploadFilesToBucketStep(req, res);
  } catch (error) {
    console.error(error);
    res.status(401);
    res.end();  // send no content
  }
};

const createNewPermissionStep = async (req, res) => {
  try {
    const userId = req.query.userId;
    const websiteId = req.websiteId;
    const permissionType = 'administrator';
    await createNewPermission(connection, userId, websiteId, permissionType);
    createFilesToDbStep(req, res);
  } catch (error) {
    console.error(error);
    res.status(401);
    res.end();  // send no content
  }
};

const createNewWebsiteStep = async (req, res) => {
  try {
    const name = req.body.name;
    const domain = req.body.domain;
    const websiteId = await createNewWebsite(connection, name, domain);
    // populate
    req.websiteId = websiteId;
    createNewPermissionStep(req, res);
  } catch (error) {
    console.error(error);
    res.status(401);
    res.end();  // send no content
  }
};

const getAuthorizationStep = async (req, res) => {
  try {
    const token = req.userToken;
    const response = await getAuthorization(token, userId);
    if (response.status===202) {
      // authorized
      createNewWebsiteStep(req, res);
    } else {
      // unauthorized
      console.log('the user ' + userId + ' is unauthorized');
      res.status(406);
      res.end();  // send no content
    }
  } catch (error) {
    console.error(error);
    res.status(401);
    res.end();  // send no content
  }
};

const getTokenStep = (req, res) => {
  const myAuthentication = getToken(req.headers);
  if (myAuthentication===false) {
    // didn't find any token
    res.status(401);
    res.end();  // send no content
  } else {
    // populate it
    req.userToken = myAuthentication.token;
    // getAuthorizationStep(req, res);
    createNewWebsiteStep(req, res); /** IMPORTANT */
  }
};

const isDomainAvailableStep = async (req, res) => {
  const domain = req.body.domain;
  try {
    connection = getConnection(connection);
    const isAvailable = await isDomainAvailable(connection, domain);
    if (isAvailable) {
      // is available
      getTokenStep(req, res);
    } else {
      // isn't available
      console.log('the domain ' + domain + ' is not available');
      res.status(406);
      res.end();  // send no content
    }
  } catch (error) {
    console.error(error);
    res.status(401);
    res.end();  // send no content
  }
};

/**
 * HTTP Cloud Function.
 * This function is exported by index.js, and is executed when
 * you make an HTTP request to the deployed function's endpoint.
 *
 * @param {Object} req Cloud Function request context.
 *                     More info: https://expressjs.com/en/api.html#req
 * @param {Object} res Cloud Function response context.
 *                     More info: https://expressjs.com/en/api.html#res
 */
exports.postWebsites = (req, res) => {
  // const token = req.userToken;
  // const userId = req.query.userId;
  // const name = req.body.name;
  // const domain = req.body.domain;

  // Set CORS headers for preflight requests
  res.set('Access-Control-Allow-Origin', process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
  res.set('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    // Send response to OPTIONS requests
    res.set('Access-Control-Allow-Methods', 'POST');
    res.set('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.set('Access-Control-Max-Age', '3600');
    res.status(204)
    res.end();
  } else {
    isDomainAvailableStep(req, res);
  }
};
