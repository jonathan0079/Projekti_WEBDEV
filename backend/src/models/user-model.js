import promisePool from '../utils/database.js';
import bcrypt from 'bcrypt';

// Hakee käyttäjän id: n perusteella

const getUserById = async (id) => {
  try {
    console.log('Getting user by ID:', id);
    const [rows] = await promisePool.query(
      'SELECT user_id, username, email, created_at, user_level FROM users WHERE user_id = ?',
      [id]
    );
    
// Karttaa tietokannan kentät yhdenmukaisuuden vuoksi

    if (rows[0]) {
      const user = rows[0];
      return {
        id: user.user_id,
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

// Hakee käyttäjän käyttäjätunnuksen perusteella

const getUserByUsername = async (username) => {
  try {
    console.log('Getting user by username:', username);
    const [rows] = await promisePool.query(
      'SELECT * FROM Users WHERE username = ?',
      [username]
    );

// Karttaa tietokannan kentät yhdenmukaisuuden vuoksi

    if (rows[0]) {
      const user = rows[0];
      return {
        id: user.user_id,
        user_id: user.user_id,
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

// Rekisteröi uuden käyttäjän tietokantaan

const registerUser = async (user) => {
  try {
    // Hashää salasanan bcryptillä
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


export { getUserById, getUserByUsername, registerUser };