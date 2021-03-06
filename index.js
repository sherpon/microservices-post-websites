//"use strict";

// Get Development Env
require('./utilities/getEnv')();

const Firestore = require('@google-cloud/firestore');

const getToken = require('./utilities/getToken');
const getExpiresAtDate = require('./utilities/getExpiresAtDate');
const getFirestore = require('./db/getFirestore');
const isDomainAvailable = require('./db/isDomainAvailable');
const paymentProcess = require('./payment/paymentProcess');
const createNewWebsite = require('./db/createNewWebsite');
const addFileToDb = require('./db/addFileToDb');
const getStorage = require('./storage/getStorage');
const copyFileFromSource = require('./storage/copyFileFromSource');
const getAuthorization = require('./services/getAuthorization');
const virtualhostCreator = require('./services/virtualhostCreator');

let firestore;
let storage;

const publishNewWebsiteStep = async (req, res) => {
  try {
    const config = {
      id: req.websiteId,
      name: req.body.name,
      domain: req.body.domain,
      type: req.body.type,
      favicon: '',
      expiresAt: new Date(req.websiteExpiresAt._seconds * 1000)  // TEMPORALLY 4102462800000 Fri Jan 01 2100 00:00:00 GMT-0500 (Peru Standard Time)
    };
    const status = await virtualhostCreator(config);
    if (status===201) {
      res.status(201);  // send CREATED
      res.send({
        id: req.websiteId,
        name: req.body.name,
        domain: req.body.domain,
        type: req.body.type,
        favicon: '',
        storage: parseInt(process.env.WEBSITE_STORAGE_INIT),
        createdAt: new Date(req.websiteCreatedAt._seconds * 1000),
        expiresAt: new Date(req.websiteExpiresAt._seconds * 1000),
        permission: 'administrator'
      });
    } else {
      console.log('the virtualhost request failed.');
      res.status(401);
      res.end();  // send no content
    }
  } catch (error) {
    console.error('the virtualhost request get error.');
    console.error(error);
    res.status(401);
    res.end();  // send no content
  }
};

const uploadFilesToBucketStep = async (req, res) => {
  try {
    const websiteId = req.websiteId;
    storage = getStorage(storage);
    await copyFileFromSource(storage, 'templates/index.ejs', websiteId, 'templates/index');
    await copyFileFromSource(storage, 'templates/pages.ejs', websiteId, 'templates/pages');
    await copyFileFromSource(storage, 'templates/header.ejs', websiteId, 'templates/header');
    await copyFileFromSource(storage, 'templates/footer.ejs', websiteId, 'templates/footer');
    await copyFileFromSource(storage, 'pages/home.ejs', websiteId, 'pages/home');
    await copyFileFromSource(storage, 'pages/about.ejs', websiteId, 'pages/about');
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
    const timestamp = req.websiteCreatedAt;  // return an object like this { "_seconds": 1559856428, "_nanoseconds": 858000000 }
    // create website instance in firestore db
    // await firestore.collection('websites').doc(websiteId).set({ createdAt: timestamp });
    await addFileToDb(firestore, websiteId, 'template', 'index', timestamp);
    await addFileToDb(firestore, websiteId, 'template', 'pages', timestamp);
    await addFileToDb(firestore, websiteId, 'template', 'header', timestamp);
    await addFileToDb(firestore, websiteId, 'template', 'footer', timestamp);
    await addFileToDb(firestore, websiteId, 'page', 'home', timestamp, /** url */ 'home', /** title: website's name */ req.body.name);
    await addFileToDb(firestore, websiteId, 'page', 'about', timestamp, /** url */ 'about', /** title */ 'About page');
    uploadFilesToBucketStep(req, res);
  } catch (error) {
    console.error(error);
    res.status(401);
    res.end();  // send no content
  }
};

const createNewWebsiteStep = async (req, res) => {
  try {
    const userId = req.query.userId;
    const name = req.body.name;
    const domain = req.body.domain;
    const type = req.body.type;
    const paymentProcessor = req.websitePaymentProcessor;
    const timestamp = Firestore.Timestamp.now();  // return an object like this { "_seconds": 1559856428, "_nanoseconds": 858000000 }
    const expiresAt = Firestore.Timestamp.fromDate(getExpiresAtDate());
    const websiteId = await createNewWebsite(firestore, name, domain, type, paymentProcessor, userId, timestamp, expiresAt);
    // populate
    req.websiteId = websiteId;
    req.websiteCreatedAt = timestamp;
    req.websiteExpiresAt = expiresAt;
    // createNewPermissionStep(req, res);
    createFilesToDbStep(req, res);
  } catch (error) {
    console.error(error);
    res.status(401);
    res.end();  // send no content
  }
};

const paymentProcessStep = async (req, res) => {
  try {
    const newReq = await paymentProcess(req, firestore);
    // poppulate
    // req.userPaymentProcessor
    // req.websitePaymentProcessor
    createNewWebsiteStep(newReq, res);
  } catch (error) {
    console.error(error);
    res.status(401);
    res.end();  // send no content
  }
};

const getAuthorizationStep = async (req, res) => {
  try {
    const userId = req.query.userId;
    const token = req.userToken;
    const response = await getAuthorization(token, userId);
    if (response.status===202) {
      // authorized
      // createNewWebsiteStep(req, res);
      paymentProcessStep(req, res);
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
    getAuthorizationStep(req, res);
    // createNewWebsiteStep(req, res); /** IMPORTANT */
  }
};

const isDomainAvailableStep = async (req, res) => {
  try {
    const domain = req.body.domain;
    firestore = getFirestore(firestore);
    const isAvailable = await isDomainAvailable(firestore, domain);
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
  res.set('Access-Control-Allow-Origin', process.env.ADMIN_APP_URL);
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
