/**
 * reference https://cloud.google.com/functions/docs/sql
 */

const mysql = require('mysql');

const mysqlConfig = {
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE
};

if (process.env.SHERPON_ENV==='DEVELOPMENT') {
  mysqlConfig.host = process.env.MYSQL_HOST;
  mysqlConfig.port = process.env.MYSQL_PORT;
} else {
  // for Production or Staging
  mysqlConfig.socketPath = process.env.INSTANCE_CONNECTION_NAME;
}

/**
 * @returns {Object} - returns the mysql connection object
 */
const getConnection = (connection) => {
  if (!connection) {
    connection = mysql.createPool(mysqlConfig);
  }

  return connection;
};

module.exports = getConnection;