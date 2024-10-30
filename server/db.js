// server/db.js
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: Number(process.env.PORT), // Ensure port is a number
});

module.exports = pool;

