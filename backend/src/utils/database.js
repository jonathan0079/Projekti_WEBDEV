import mysql from 'mysql2';
import 'dotenv/config';

// Luo connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Vie promise-pohjainen pool async/await käyttöä varten
const promisePool = pool.promise();
export default promisePool;