import mysql from 'mysql2/promise';

// Create a connection pool to MySQL
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root', // Default XAMPP user
  port: '3307',
  password: '', // Default XAMPP password is empty
  database: 'usability_tests',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
