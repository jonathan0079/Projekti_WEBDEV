import promisePool from '../utils/database.js';
import bcrypt from 'bcrypt';

/**
 * Get user by id
 * @param {number} id - User ID
 * @returns {object} User object without password
 */
const getUserById = async (id) => {
  try {
    console.log('Getting user by ID:', id);
    const [rows] = await promisePool.query(
      'SELECT user_id, username, email, created_at, user_level FROM users WHERE user_id = ?',
      [id]
    );
    
    // Map the database field names to the expected names in the rest of the app
    if (rows[0]) {
      const user = rows[0];
      return {
        id: user.user_id,  // Map user_id to id for compatibility
        username: user.username,
        email: user.email,
        created_at: user.created_at,
        user_level: user.user_level
      };
    }
    return null;
  } catch (error) {
    console.error('Error in getUserById:', error);
    throw new Error('Database error');
  }
};

/**
 * Get user by username
 * @param {string} username - Username
 * @returns {object} Complete user object including password
 */
const getUserByUsername = async (username) => {
  try {
    console.log('Getting user by username:', username);
    const [rows] = await promisePool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    
    // Map database fields for consistency
    if (rows[0]) {
      const user = rows[0];
      return {
        id: user.user_id,  // Map user_id to id for compatibility
        user_id: user.user_id, // Keep original for backward compatibility
        username: user.username,
        password: user.password,
        email: user.email,
        created_at: user.created_at,
        user_level: user.user_level
      };
    }
    return null;
  } catch (error) {
    console.error('Error in getUserByUsername:', error);
    throw new Error('Database error');
  }
};

/**
 * Register a new user
 * @param {object} user - User object with username, password, email
 * @returns {number} Inserted user ID
 */
const registerUser = async (user) => {
  try {
    // Hash the password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(user.password, saltRounds);
    
    const [result] = await promisePool.query(
      'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
      [user.username, passwordHash, user.email]
    );
    
    return result.insertId;
  } catch (error) {
    console.error('Error in registerUser:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      if (error.sqlMessage.includes('username')) {
        throw new Error('Username already exists');
      } else if (error.sqlMessage.includes('email')) {
        throw new Error('Email already exists');
      }
    }
    throw new Error('Database error');
  }
};

// Debug function to test database connection
const testDatabaseConnection = async () => {
  try {
    const [result] = await promisePool.query('SELECT 1 as test');
    console.log('✅ Database connection successful:', result);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
};

// Test database connection on startup
testDatabaseConnection();

// Check if the Users table exists and has the right structure
const checkUsersTable = async () => {
  try {
    const [tables] = await promisePool.query('SHOW TABLES LIKE "users"');
    if (tables.length === 0) {
      console.error('❌ users table does not exist!');
      return false;
    }
    
    console.log('✅ users table exists');
    
    const [columns] = await promisePool.query('DESCRIBE users');
    console.log('Table structure:', columns.map(col => `${col.Field} (${col.Type})`));
    
    return true;
  } catch (error) {
    console.error('❌ Error checking users table:', error);
    return false;
  }
};

// Check Users table on startup
checkUsersTable();

export { getUserById, getUserByUsername, registerUser };