// Game score system for HyteGym calorie clicker game
const API_URL = 'http://localhost:3000/api';
const GAME_TYPE = 'calorie_clicker'; // Use a consistent game type across all requests

/**
 * Initialize the game score system
 */
const initGameScores = () => {
  console.log('Initializing game score system');
  
  // Check elements exist before trying to access them
  const loginMessage = document.getElementById('game-score-login-message');
  const scoreContainer = document.getElementById('game-score-container');
  
  // Check if user is logged in
  if (!isAuthenticated()) {
    console.log('User not authenticated, hiding score saving features');
    if (loginMessage) loginMessage.style.display = 'block';
    if (scoreContainer) scoreContainer.style.display = 'none';
  } else {
    console.log('User authenticated, showing score features');
    if (loginMessage) loginMessage.style.display = 'none';
    if (scoreContainer) scoreContainer.style.display = 'block';
    
    // Log the auth token (partially) for debugging
    const token = getAuthToken();
    if (token) {
      console.log('Auth token available:', token.substring(0, 10) + '...');
    } else {
      console.warn('Auth token is null or undefined even though isAuthenticated() returned true');
    }
    
    getUserHighScore();
  }
  
  // Always load leaderboard (it's a public endpoint)
  loadLeaderboard();
};

/**
 * Save a game score to the database
 * @param {number} score - The game score to save
 */
const saveGameScore = async (score) => {
  if (!isAuthenticated()) {
    console.log('User not authenticated, cannot save score');
    showMessage('Kirjaudu sisään tallentaaksesi pisteet!', 'warning');
    
    // Optionally open login modal
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
      loginButton.click();
    }
    
    return;
  }

  try {
    console.log(`Saving score: ${score} for game: ${GAME_TYPE}`);
    
    // Get token and ensure it's actually available
    const token = getAuthToken();
    if (!token) {
      console.error('Auth token is null or undefined although isAuthenticated() returned true');
      showMessage('Kirjautumisvirhe. Kirjaudu uudelleen sisään.', 'error');
      return;
    }
    
    console.log('Authorization header:', `Bearer ${token.slice(0, 10)}...`);

    const response = await fetch(`${API_URL}/game/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        score: parseInt(score),  // Ensure score is an integer
        game_type: GAME_TYPE
      })
    });

    // Log the raw response for debugging
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries([...response.headers]));
    
    const data = await response.json();
    console.log('Score save response:', data);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Handle auth error specifically
        console.error('Authorization error when saving score:', data);
        showMessage('Kirjautuminen on vanhentunut. Kirjaudu uudelleen sisään.', 'error');
        
        // Clear potentially expired token
        localStorage.removeItem('user');
        
        // Redirect to home or reload page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
        return;
      }
      
      throw new Error(data.message || 'Pisteiden tallennus epäonnistui');
    }

    console.log('Score saved successfully:', data);
    showMessage('Pisteet tallennettu onnistuneesti!', 'success');
    
    // Refresh leaderboard and user high score
    loadLeaderboard();
    getUserHighScore();
    
  } catch (error) {
    console.error('Error saving score:', error);
    showMessage(`Virhe: ${error.message}`, 'error');
  }
};

const loadLeaderboard = async () => {
  try {
    const leaderboardElement = document.getElementById('game-leaderboard');
    leaderboardElement.innerHTML = '<p>Ladataan pisteitä...</p>';

    // Build the leaderboard URL with query parameters
    const leaderboardUrl = `${API_URL}/game/leaderboard?game_type=${GAME_TYPE}&limit=10`;
    console.log('Loading leaderboard from:', leaderboardUrl);

    const response = await fetch(leaderboardUrl);
    const data = await response.json();

    console.log('Leaderboard data:', data);

    // Clear the loading message
    leaderboardElement.innerHTML = '';

    // Check if there was an error
    if (!data.success) {
      console.error('Error from leaderboard API:', data.error || data.message);
      leaderboardElement.innerHTML = '<p>Virhe pisteiden latauksessa. Yritä myöhemmin uudelleen.</p>';
      return;
    }

    // Get the scores array from the data.data field
    const scores = data.data || [];

    // Check if we have data
    if (scores.length === 0) {
      leaderboardElement.innerHTML = '<p>Ei vielä pisteitä. Ole ensimmäinen!</p>';
      return;
    }

    // Create table for leaderboard
    const table = document.createElement('table');
    table.className = 'leaderboard-table';
    
    // Add header row
    const thead = document.createElement('thead');
    thead.innerHTML = `
      <tr>
        <th>#</th>
        <th>Käyttäjä</th>
        <th>Pisteet</th>
        <th>Päivämäärä</th>
      </tr>
    `;
    table.appendChild(thead);
    
    // Add body rows
    const tbody = document.createElement('tbody');
    
    scores.forEach((entry, index) => {
      const row = document.createElement('tr');
      
      // Highlight the current user's scores
      const user = JSON.parse(localStorage.getItem('user'));
      const isCurrentUser = user && entry.username === user.username;
      
      if (isCurrentUser) {
        row.className = 'current-user';
      }
      
      // Format date (check if created_at exists)
      let formattedDate = 'N/A';
      if (entry.created_at) {
        const date = new Date(entry.created_at);
        formattedDate = date.toLocaleDateString('fi-FI');
      }
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.username || 'Unknown'}</td>
        <td>${entry.score || 0}</td>
        <td>${formattedDate}</td>
      `;
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    leaderboardElement.appendChild(table);

  } catch (error) {
    console.error('Error loading leaderboard:', error);
    document.getElementById('game-leaderboard').innerHTML = 
      '<p>Virhe pisteiden latauksessa. Yritä myöhemmin uudelleen.</p>';
  }
};

/**
 * Get user's high score for the game
 */
const getUserHighScore = async () => {
  const highScoreElement = document.getElementById('user-high-score');
  
  if (!isAuthenticated()) {
    highScoreElement.textContent = '-';
    console.log('User not authenticated, skipping high score fetch');
    return;
  }

  try {
    highScoreElement.textContent = 'Ladataan...';

    // Build the URL with query parameters
    const userScoresUrl = `${API_URL}/game/user-scores?game_type=${GAME_TYPE}&limit=1`;
    console.log('Loading user high score from:', userScoresUrl);
    
    // Get token and ensure it's actually available
    const token = getAuthToken();
    if (!token) {
      console.error('Auth token is null or undefined');
      highScoreElement.textContent = 'Virhe';
      return;
    }
    
    console.log('Authorization header:', `Bearer ${token.slice(0, 10)}...`);

    const response = await fetch(userScoresUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('User scores data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Käyttäjän pisteiden haku epäonnistui');
    }

    // Display high score if available
    if (data.data && data.data.length > 0) {
      highScoreElement.textContent = data.data[0].score;
    } else if (data.data) {
      // Data exists but no scores
      highScoreElement.textContent = '0';
    } else {
      // Unexpected data format
      console.warn('Unexpected data format for user scores:', data);
      highScoreElement.textContent = '0';
    }

  } catch (error) {
    console.error('Error getting user high score:', error);
    // Don't update the UI on error - keep showing "Loading..." rather than "Error"
    // as it's less disruptive to the user experience
    highScoreElement.textContent = '0';
  }
};

/**
 * Check if current score is higher than user's previous high score
 * If yes, offer to save it
 * @param {number} score - Current game score
 */
const checkAndOfferToSaveScore = (score) => {
  if (!isAuthenticated()) {
    console.log('User not authenticated, not checking high score');
    return;
  }

  const highScoreElement = document.getElementById('user-high-score');
  const currentHighScore = parseInt(highScoreElement.textContent) || 0;

  console.log(`Current score: ${score}, Previous high score: ${currentHighScore}`);

  if (score > currentHighScore) {
    // This is a new high score!
    if (confirm(`Uusi ennätys: ${score}! Haluatko tallentaa pisteet?`)) {
      saveGameScore(score);
    }
  } else if (score > 0) {
    // Not a high score but still a score
    if (confirm(`Sait ${score} pistettä. Haluatko tallentaa pisteet?`)) {
      saveGameScore(score);
    }
  }
};

/**
 * Show a message to the user
 * @param {string} message - Message to show
 * @param {string} type - Message type (success, error, warning)
 */
const showMessage = (message, type = '') => {
  // Check if snackbar exists, if not create one
  let snackbar = document.getElementById('game-snackbar');
  if (!snackbar) {
    snackbar = document.createElement('div');
    snackbar.id = 'game-snackbar';
    document.body.appendChild(snackbar);
  }

  snackbar.textContent = message;
  snackbar.className = `game-snackbar show ${type}`;

  // Remove the snackbar after 3 seconds
  setTimeout(() => {
    snackbar.className = snackbar.className.replace('show', '');
  }, 3000);
};

/**
 * Get authentication token from localStorage
 */
function getAuthToken() {
  try {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      console.log('No user data in localStorage');
      return null;
    }
    
    const user = JSON.parse(userJson);
    if (!user || !user.token) {
      console.log('User data exists but no token found:', user);
      return null;
    }
    
    return user.token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return getAuthToken() !== null;
}

/**
 * Debug API connection
 */
function debugApiConnection() {
  // Test a simple GET request to the API root
  fetch(`${API_URL}/`)
    .then(response => {
      console.log('API root response status:', response.status);
      return response.text();
    })
    .then(data => {
      console.log('API root response:', data);
    })
    .catch(error => {
      console.error('Error connecting to API root:', error);
    });
    
  // Log useful debugging information
  console.log('API URL:', API_URL);
  console.log('Authentication status:', isAuthenticated());
  console.log('localStorage user data:', localStorage.getItem('user'));
}

// Run debug when initializing in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('Running in development mode, debugging API connection...');
  debugApiConnection();
}

// Export the functions for use in the game
export {
  initGameScores,
  saveGameScore,
  loadLeaderboard,
  getUserHighScore,
  checkAndOfferToSaveScore
};