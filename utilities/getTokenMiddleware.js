const getToken = require('./getToken');

const getTokenMiddleware = (handle) => (req, res) => {
  const myAuthentication = getToken(req.headers);
  if (myAuthentication===false) {
    // didn't find any token
    res.status(401);
    res.end();  // send no content
  } else {
    // populate it
    req.userToken = myAuthentication.token;
    handle(req, res);
  }
};

module.exports = getTokenMiddleware;