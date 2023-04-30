const mysql = require('mysql'); 
require("dotenv").config();
var connection =mysql.createConnection({
  host: process.env.SERVER_IP_ADDRESS,
  port: '3306',
  user: 'sogogi',
  password: process.env.PASSWORD,
  database: 'smart_reservation'
});

connection.connect();

module.exports = connection;