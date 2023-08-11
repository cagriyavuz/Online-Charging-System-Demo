const mysql = require('mysql2')
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Getout22",
    database: "cigarcell"
})

module.exports = db;