// db.js
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'performancems'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

module.exports = connection;