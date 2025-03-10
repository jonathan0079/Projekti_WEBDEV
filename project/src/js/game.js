// Pelipistejärjestelmä HyteGymin kaloritreeni-pelille
const API_URL = 'http://localhost:3000/api';
const GAME_TYPE = 'calorie_clicker'; // Käytä yhtenäistä pelityyppiä kaikissa pyynnöissä

/**
 * Alusta pelipistejärjestelmä
 */
const initGameScores = () => {
  console.log('Alustetaan pelipistejärjestelmä');
  
  // Tarkista elementtien olemassaolo ennen käyttöä
  const loginMessage = document.getElementById('game-score-login-message');
  const scoreContainer = document.getElementById('game-score-container');
  
  // Tarkista käyttäjän kirjautumistila
  if (!isAuthenticated()) {
    console.log('Käyttäjä ei ole kirjautunut, piilotetaan pistetallennusominaisuudet');
    if (loginMessage) loginMessage.style.display = 'block';
    if (scoreContainer) scoreContainer.style.display = 'none';
  } else {
    console.log('Käyttäjä kirjautunut, näytetään pisteiden tallennusominaisuudet');
    if (loginMessage) loginMessage.style.display = 'none';
    if (scoreContainer) scoreContainer.style.display = 'block';
    
    // Kirjaa osa tunnuksesta lokiin vianjäljitystä varten
    const token = getAuthToken();
    if (token) {
      console.log('Käyttöoikeustunnus saatavilla:', token.substring(0, 10) + '...');
    } else {
      console.warn('Käyttöoikeustunnus on null tai undefined, vaikka kirjautuminen näytti onnistuneen');
    }
    
    getUserHighScore();
  }
  
  // Lataa aina tulostaulu (on julkinen päätepiste)
  loadLeaderboard();
};

/**
 * Tallenna pelipisteet
 * @param {number} score - Tallennettavat pisteet
 */
const saveGameScore = async (score) => {
  if (!isAuthenticated()) {
    console.log('Käyttäjä ei ole kirjautunut, pisteiden tallennus ei onnistu');
    showMessage('Kirjaudu sisään tallentaaksesi pisteet!', 'warning');
    
    // Avaa tarvittaessa kirjautumismodaali
    const loginButton = document.getElementById('login-button');
    if (loginButton) {
      loginButton.click();
    }
    
    return;
  }

  try {
    console.log(`Tallennetaan pisteet: ${score} pelityypille: ${GAME_TYPE}`);
    
    // Hanki tunnus ja varmista, että se on todella saatavilla
    const token = getAuthToken();
    if (!token) {
      console.error('Käyttöoikeustunnus on null tai undefined, vaikka kirjautuminen näytti onnistuneen');
      showMessage('Kirjautumisvirhe. Kirjaudu uudelleen sisään.', 'error');
      return;
    }
    
    console.log('Valtuutusheader:', `Bearer ${token.slice(0, 10)}...`);

    const response = await fetch(`${API_URL}/game/scores`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        score: parseInt(score),  // Varmista, että pisteet ovat kokonaisluku
        game_type: GAME_TYPE
      })
    });

    // Kirjaa raaka vastaus vianjäljitystä varten
    console.log('Vastauksen tila:', response.status);
    console.log('Vastauksen otsikot:', Object.fromEntries([...response.headers]));
    
    const data = await response.json();
    console.log('Pisteiden tallennus vastaus:', data);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Käsittele valtuutusvirhe erikseen
        console.error('Valtuutusvirhe pisteitä tallennettaessa:', data);
        showMessage('Kirjautuminen on vanhentunut. Kirjaudu uudelleen sisään.', 'error');
        
        // Tyhjennä mahdollisesti vanhentunut tunnus
        localStorage.removeItem('user');
        
        // Uudelleenohjaa tai lataa sivu uudelleen lyhyen viiveen jälkeen
        setTimeout(() => {
          window.location.reload();
        }, 2000);
        
        return;
      }
      
      throw new Error(data.message || 'Pisteiden tallennus epäonnistui');
    }

    console.log('Pisteet tallennettu onnistuneesti:', data);
    showMessage('Pisteet tallennettu onnistuneesti!', 'success');
    
    // Päivitä tulostaulu ja käyttäjän korkein pistemäärä
    loadLeaderboard();
    getUserHighScore();
    
  } catch (error) {
    console.error('Virhe pisteiden tallennuksessa:', error);
    showMessage(`Virhe: ${error.message}`, 'error');
  }
};

/**
 * Lataa pelitulostaulu
 */
const loadLeaderboard = async () => {
  try {
    const leaderboardElement = document.getElementById('game-leaderboard');
    leaderboardElement.innerHTML = '<p>Ladataan pisteitä...</p>';

    // Rakenna tulostaulu-URL kyselyn parametreilla
    const leaderboardUrl = `${API_URL}/game/leaderboard?game_type=${GAME_TYPE}&limit=10`;
    console.log('Ladataan tulostaulu osoitteesta:', leaderboardUrl);

    const response = await fetch(leaderboardUrl);
    const data = await response.json();

    console.log('Tulostaulu-data:', data);

    // Tyhjennä latausviesti
    leaderboardElement.innerHTML = '';

    // Tarkista mahdollinen virhe
    if (!data.success) {
      console.error('Virhe tulostaulun API:ssa:', data.error || data.message);
      leaderboardElement.innerHTML = '<p>Virhe pisteiden latauksessa. Yritä myöhemmin uudelleen.</p>';
      return;
    }

    // Hanki pisteet data.data-kentästä
    const scores = data.data || [];

    // Tarkista onko dataa
    if (scores.length === 0) {
      leaderboardElement.innerHTML = '<p>Ei vielä pisteitä. Ole ensimmäinen!</p>';
      return;
    }

    // Luo käyttäjien korkeimpien pisteiden kartta
    const topScores = new Map();
    scores.forEach(entry => {
      const currentTopScore = topScores.get(entry.username) || 0;
      
      // Päivitä käyttäjän korkein pistemäärä
      if (entry.score > currentTopScore) {
        topScores.set(entry.username, entry.score);
      }
    });

    // Muunna korkeimmat pisteet taulukoksi ja järjestä
    const topScoresList = Array.from(topScores.entries())
      .map(([username, score]) => {
        // Etsi alkuperäisestä datasta ensimmäinen tietueen, jolla on tämä käyttäjänimi ja pistemäärä
        const originalEntry = scores.find(entry => 
          entry.username === username && entry.score === score
        );
        return originalEntry || { username, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10); // Rajaa 10 parhaan pistemäärän listaan

    // Luo taulukko
    const table = document.createElement('table');
    table.className = 'leaderboard-table';
    
    // Lisää otsikkorivi
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
    
    // Lisää rivit
    const tbody = document.createElement('tbody');
    
    topScoresList.forEach((entry, index) => {
      const row = document.createElement('tr');
      
      // Korosta nykyisen käyttäjän pisteet
      const user = JSON.parse(localStorage.getItem('user'));
      const isCurrentUser = user && entry.username === user.username;
      
      if (isCurrentUser) {
        row.className = 'current-user';
      }
      
      // Muotoile päivämäärä (tarkista onko created_at olemassa)
      let formattedDate = 'N/A';
      if (entry.created_at) {
        const date = new Date(entry.created_at);
        formattedDate = date.toLocaleDateString('fi-FI');
      }
      
      row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.username || 'Tuntematon'}</td>
        <td>${entry.score || 0}</td>
        <td>${formattedDate}</td>
      `;
      
      tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    leaderboardElement.appendChild(table);

  } catch (error) {
    console.error('Virhe tulostaulun latauksessa:', error);
    document.getElementById('game-leaderboard').innerHTML = 
      '<p>Virhe pisteiden latauksessa. Yritä myöhemmin uudelleen.</p>';
  }
};

/**
 * Hanki käyttäjän korkein pistemäärä
 */
const getUserHighScore = async () => {
  const highScoreElement = document.getElementById('user-high-score');
  
  if (!isAuthenticated()) {
    highScoreElement.textContent = '-';
    console.log('Käyttäjä ei ole kirjautunut, ohitetaan korkeimman pistemäärän haku');
    return;
  }

  try {
    highScoreElement.textContent = 'Ladataan...';

    // Rakenna URL kyselyn parametreilla
    const userScoresUrl = `${API_URL}/game/user-scores?game_type=${GAME_TYPE}&limit=1`;
    console.log('Ladataan käyttäjän korkein pistemäärä osoitteesta:', userScoresUrl);
    
    // Hanki tunnus ja varmista, että se on todella saatavilla
    const token = getAuthToken();
    if (!token) {
      console.error('Käyttöoikeustunnus on null tai undefined');
      highScoreElement.textContent = 'Virhe';
      return;
    }
    
    console.log('Valtuutusheader:', `Bearer ${token.slice(0, 10)}...`);

    const response = await fetch(userScoresUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    console.log('Käyttäjän pisteet:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Käyttäjän pisteiden haku epäonnistui');
    }

    // Näytä korkein pistemäärä, jos saatavilla
    if (data.data && data.data.length > 0) {
      highScoreElement.textContent = data.data[0].score;
    } else if (data.data) {
      // Data on olemassa, mutta pisteitä ei ole
      highScoreElement.textContent = '0';
    } else {
      // Odottamaton tietomuoto
      console.warn('Odottamaton tietomuoto käyttäjän pisteille:', data);
      highScoreElement.textContent = '0';
    }

  } catch (error) {
    console.error('Virhe käyttäjän korkeimman pistemäärän haussa:', error);
    // Älä päivitä käyttöliittymää virheessä - näytä edelleen "Ladataan..." mieluummin kuin "Virhe"
    // koska se on vähemmän häiritsevää käyttäjäkokemukselle
    highScoreElement.textContent = '0';
  }
};

/**
 * Tarkista, onko nykyinen pistemäärä korkeampi kuin käyttäjän aikaisempi korkein pistemäärä
 * Jos kyllä, tarjoa pisteiden tallentamista
 * @param {number} score - Nykyinen pelipiste
 */
const checkAndOfferToSaveScore = (score) => {
  if (!isAuthenticated()) {
    console.log('Käyttäjä ei ole kirjautunut, ei tarkisteta korkeinta pistemäärää');
    return;
  }

  const highScoreElement = document.getElementById('user-high-score');
  const currentHighScore = parseInt(highScoreElement.textContent) || 0;

  console.log(`Nykyinen pistemäärä: ${score}, Aikaisempi korkein pistemäärä: ${currentHighScore}`);

  if (score > currentHighScore) {
    // Tämä on uusi korkein pistemäärä!
    if (confirm(`Uusi ennätys: ${score}! Haluatko tallentaa pisteet?`)) {
      saveGameScore(score);
    }
  } else if (score > 0) {
    // Ei korkein pistemäärä, mutta silti pisteitä
    if (confirm(`Sait ${score} pistettä. Haluatko tallentaa pisteet?`)) {
      saveGameScore(score);
    }
  }
};

/**
 * Näytä viesti käyttäjälle
 * @param {string} message - Näytettävä viesti
 * @param {string} type - Viestin tyyppi (success, error, warning)
 */
const showMessage = (message, type = '') => {
  // Tarkista onko snackbar olemassa, jos ei, luo sellainen
  let snackbar = document.getElementById('game-snackbar');
  if (!snackbar) {
    snackbar = document.createElement('div');
    snackbar.id = 'game-snackbar';
    document.body.appendChild(snackbar);
  }

  snackbar.textContent = message;
  snackbar.className = `game-snackbar show ${type}`;

  // Poista snackbar 3 sekunnin kuluttua
  setTimeout(() => {
    snackbar.className = snackbar.className.replace
    ('show', '');
  }, 3000);
};

/**
 * Hae käyttöoikeustunnus localStorage:sta
 */
function getAuthToken() {
  try {
    const userJson = localStorage.getItem('user');
    if (!userJson) {
      console.log('Käyttäjätietoja ei löydy localStorage:sta');
      return null;
    }
    
    const user = JSON.parse(userJson);
    if (!user || !user.token) {
      console.log('Käyttäjätiedot löytyivät, mutta tunnusta ei:', user);
      return null;
    }
    
    return user.token;
  } catch (error) {
    console.error('Virhe käyttöoikeustunnuksen haussa:', error);
    return null;
  }
}

/**
 * Tarkista, onko käyttäjä todennistettu
 */
function isAuthenticated() {
  return getAuthToken() !== null;
}

/**
 * Testaa API-yhteys
 */
function debugApiConnection() {
  // Testaa yksinkertainen GET-pyyntö API:n juureen
  fetch(`${API_URL}/`)
    .then(response => {
      console.log('API:n juurivasteeen tila:', response.status);
      return response.text();
    })
    .then(data => {
      console.log('API:n juurivastaus:', data);
    })
    .catch(error => {
      console.error('Virhe yhdistettäessä API:n juureen:', error);
    });
    
  // Kirjaa hyödyllisiä virheenkorjaustietoja
  console.log('API-URL:', API_URL);
  console.log('Todennustila:', isAuthenticated());
  console.log('localStorage käyttäjätiedot:', localStorage.getItem('user'));
}

// Suorita virheenkorjaus kehitystilassa
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
  console.log('Suoritetaan kehitystilassa, testataan API-yhteyttä...');
  debugApiConnection();
}

// Vie funktiot käytettäväksi pelissä
export {
  initGameScores,
  saveGameScore,
  loadLeaderboard,
  getUserHighScore,
  checkAndOfferToSaveScore
};