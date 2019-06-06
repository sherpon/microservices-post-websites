//"use strict";

// Get Development Env
require('./utilities/getEnv')();

const getToken = require('./utilities/getToken');
const getFirebase = require('./firebase/getFirebase');
const getConnection = require('./db/getConnection');
const isDomainAvailable = require('./db/isDomainAvailable');
const createNewWebsite = require('./db/createNewWebsite');
const createNewPermission = require('./db/createNewPermission');
const getAuthorization = require('./services/getAuthorization');

let connection;
let firebase;

const publishNewWebsiteStep = async (req, res) => {};

const uploadFilesToBucketStep = async (req, res) => {};

const createFilesToDbStep = async (req, res) => {};

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
    getAuthorizationStep(req, res);
  }
};

const isDomainAvailableStep = async (req, res) => {
  const domain = req.body.domain;
  try {
    firebase = getFirebase(firebase);
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
