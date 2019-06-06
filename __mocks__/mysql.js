/**
 * https://jestjs.io/docs/en/manual-mocks
 */

const mysql = jest.genMockFromModule('mysql');

let __mockError = false;
let __mockResultsUsers = [];
let __mockResultsPermissions = [];
let __mockFields = [];

const __setMockError = (newError) => {
  __mockError = newError;
};
const __setMockResultsUsers = (newResultsUsers) => {
  __mockResultsUsers = newResultsUsers;
};
const __setMockResultsPermissions = (newResultsPermissions) => {
  __mockResultsPermissions = newResultsPermissions;
};
const __setMockFields = (newFields) => {
  __mockFields = newFields;
};
mysql.__setMockError = __setMockError;
mysql.__setMockResultsUsers = __setMockResultsUsers;
mysql.__setMockResultsPermissions = __setMockResultsPermissions;
mysql.__setMockFields = __setMockFields;

const query = (sql, callback) => {
  if (__mockError!== false) {
    callback(__mockError, [] /** returns empty */, [] /** returns empty */);
    return;
  }
  if (sql.search(/SELECT \* FROM Users/) !== -1) {
    callback(false, __mockResultsUsers, __mockFields);
    return;
  }
  if (sql.search(/SELECT \* FROM Permissions/) !== -1) {
    callback(false, __mockResultsPermissions, __mockFields);
    return;
  }
  callback(false, __mockResultsUsers, __mockFields);
};

const connection = {
  connect: () => {},
  query: query,
  end: () => {},
};
const createConnection = () => connection;
mysql.createConnection = createConnection;

const pool = {
  query: query,
};
const createPool = () => pool;
mysql.createPool = createPool;
module.exports = mysql;