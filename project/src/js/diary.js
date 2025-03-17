const API_URL = 'http://localhost:3000/api';

// päiväkirja toiminnallisuus

document.addEventListener('DOMContentLoaded', function() {
  console.log('Diary script loaded');
  console.log('API URL is set to:', API_URL);
  
// Tarkistaa onko käyttäjä kirjautunut
  if (!isAuthenticated()) {
    console.log('User not authenticated, redirecting to home page');
// Jos käyttäjä ei ole kirjautunut, ohjaa takaisin etusivulle
    window.location.href = 'index.html';
    return;
  }

 // DOM-elementit
  const diaryEntriesContainer = document.getElementById('diary-entries');
  const diaryForm = document.getElementById('diary-form');
  const entryDateInput = document.getElementById('entry-date');
  const moodInput = document.getElementById('mood');
  const weightInput = document.getElementById('weight');
  const sleepHoursInput = document.getElementById('sleep-hours');
  const notesInput = document.getElementById('notes');
  const submitButton = document.getElementById('submit-entry');
  const formTitle = document.getElementById('form-title');
  const resetFormButton = document.getElementById('reset-form');

// Aseta nykyinen päivämäärä lomakkeelle
  const today = new Date().toISOString().split('T')[0];
  entryDateInput.value = today;

// Aseta nykyinen käyttäjä lomakkeelle
  window.currentEntryId = null;

// Lataa päiväkirjamerkinnät
  loadDiaryEntries();

// Lisää lomakkeen tapahtumakuuntelija
  diaryForm.addEventListener('submit', handleDiarySubmit);
  
// Lisää nollauspainikkeen tapahtumakuuntelija
  if (resetFormButton) {
    resetFormButton.addEventListener('click', (e) => {
      e.preventDefault();
      resetForm();
    });
  }

// Lataa päiväkirjamerkinnät palvelimelta 
  function loadDiaryEntries() {
    try {
// Näytä latausindikaattori
      diaryEntriesContainer.innerHTML = '<div class="loading-indicator"></div>';

// Päiväkirjan URL-osoite
      const diaryUrl = `${API_URL}/diary`;
      console.log('Loading diary entries from:', diaryUrl);
      console.log('Auth token:', getAuthToken()?.substring(0, 20) + '...');

// Lähetä pyyntö palvelimelle
      fetch(diaryUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      .then(response => {
// Näytä vastauksen tila konsolissa
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Diary entries loaded:', data);

// Tyhjennä päiväkirjamerkinnät
        diaryEntriesContainer.innerHTML = '';

        if (!data.data || data.data.length === 0) {
          diaryEntriesContainer.innerHTML = '<p style="color: white;">Ei päiväkirjamerkintöjä. Lisää ensimmäinen merkintäsi lomakkeella.</p>';
          return;
        }

// lisää entryt HTML:ään
        data.data.forEach(entry => {
          const entryElement = createEntryElement(entry);
          diaryEntriesContainer.appendChild(entryElement);
        });
      })
      .catch(error => {
        console.error('Error loading diary entries:', error);
        diaryEntriesContainer.innerHTML = '<p>Virhe merkintöjen latauksessa. Yritä myöhemmin uudelleen.</p>';
        
// Tarkista virheviestistä, onko kyseessä autentikointivirhe
        if (error.message && (error.message.includes('401') || error.message.includes('403'))) {
          console.log('Authentication error, clearing token and redirecting');
          localStorage.removeItem('user');
          window.location.href = 'index.html';
        }
      });
    } catch (error) {
      console.error('Unexpected error in loadDiaryEntries:', error);
      diaryEntriesContainer.innerHTML = '<p>Virhe merkintöjen latauksessa. Yritä myöhemmin uudelleen.</p>';
    }
  }

// Luo HTML-elementin päiväkirjamerkinnälle

  function createEntryElement(entry) {
// Muunna päivämäärä luettavaan muotoon
    const date = new Date(entry.entry_date);
    const formattedDate = date.toLocaleDateString('fi-FI', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

// Luo div-elementti merkinnälle
    const entryElement = document.createElement('div');
    entryElement.className = 'diary-entry';
    entryElement.dataset.id = entry.id;

// Tarkista onko merkinnässä treenidataa (EI KÄYTETTY)
    let workoutData = null;
    if (entry.notes && typeof entry.notes === 'string' && entry.notes.includes('"activityType"')) {
      try {
        workoutData = JSON.parse(entry.notes);

        entry.notes = workoutData.notes || '';
      } catch (e) {
        console.log('Failed to parse workout data from notes:', e);
      }
    }

    let entryHTML = `
      <div class="entry-header">
        <h3>${formattedDate}</h3>
        <div class="entry-actions">
          <button class="edit-button" data-id="${entry.id}">Muokkaa</button>
          <button class="delete-button" data-id="${entry.id}">Poista</button>
        </div>
      </div>
      <div class="entry-content">
        <div class="entry-detail">
          <span class="detail-label">Mieliala:</span>
          <span class="detail-value">${entry.mood || 'Ei määritelty'}</span>
        </div>
        <div class="entry-detail">
          <span class="detail-label">Paino:</span>
          <span class="detail-value">${entry.weight ? entry.weight + ' kg' : 'Ei määritelty'}</span>
        </div>
        <div class="entry-detail">
          <span class="detail-label">Unitunnit:</span>
          <span class="detail-value">${entry.sleep_hours ? entry.sleep_hours + ' tuntia' : 'Ei määritelty'}</span>
        </div>`;

// Lisää treenidata, jos sitä on saatavilla (EI KÄYTETTY)
    if (workoutData) {
      entryHTML += `
        <div class="workout-summary">
          <h4>Harjoituksen tiedot</h4>
          <div class="summary-grid">
            <div class="summary-item">
              <div class="summary-value">${workoutData.activityType || 'Treenaus'}</div>
              <div class="summary-label">Aktiviteetti</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${workoutData.duration || '0'} min</div>
              <div class="summary-label">Kesto</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${workoutData.caloriesBurned || '0'}</div>
              <div class="summary-label">Kalorit</div>
            </div>
            <div class="summary-item">
              <div class="summary-value">${workoutData.intensity || '3'}/5</div>
              <div class="summary-label">Intensiteetti</div>
            </div>
          </div>
        </div>`;
    }

// Lisää muistiinpanot
    entryHTML += `
        <div class="entry-notes">
          <span class="detail-label">Muistiinpanot:</span>
          <p>${entry.notes || 'Ei muistiinpanoja'}</p>
        </div>
      </div>
    `;

    entryElement.innerHTML = entryHTML;

// Lisää tapahtumakuuntelijat muokkaus- ja poistopainikkeille
    const editButton = entryElement.querySelector('.edit-button');
    const deleteButton = entryElement.querySelector('.delete-button');

    editButton.addEventListener('click', () => {
      editEntry(entry);
    });

    deleteButton.addEventListener('click', () => {
      deleteEntry(entry.id);
    });

    return entryElement;
  }

// Käsittele päiväkirjalomakkeen lähetys
  function handleDiarySubmit(e) {
    e.preventDefault();
    console.log('Diary form submitted');

// Hae lomakkeen tiedot
    const entryDate = entryDateInput.value;
    const mood = moodInput.value;
    const weight = weightInput.value;
    const sleepHours = sleepHoursInput.value;
    let notes = notesInput.value;

// Tarkista pakolliset kentät
    if (!entryDate) {
      alert('Päivämäärä on pakollinen kenttä!');
      return;
    }

// Lähetä merkintä palvelimelle
    const entryData = {
      entry_date: entryDate,
      mood: mood,
      weight: weight ? parseFloat(weight) : null,
      sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
      notes: notes
    };

    console.log('Entry data:', entryData);
    console.log('Current entry ID:', window.currentEntryId);

// Poista mahdollinen tyhjä merkintä ID:stä
    submitButton.disabled = true;
    submitButton.textContent = window.currentEntryId ? 'Päivitetään...' : 'Tallennetaan...';

    let url, method;
    if (window.currentEntryId) {
// Päivitä olemassa oleva merkintä
      url = `${API_URL}/diary/${window.currentEntryId}`;
      method = 'PUT';
      console.log('Updating diary entry at:', url);
    } else {
// Luo uusi merkintä
      url = `${API_URL}/diary`;
      method = 'POST';
      console.log('Creating new diary entry at:', url);
    }

    fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(entryData)
    })
    .then(response => {
      console.log('Response status:', response.status);
      return response.json().then(data => {
        if (!response.ok) {
          throw new Error(data.message || 'Server error');
        }
        return data;
      });
    })
    .then(data => {
      console.log('Response data:', data);
      
// Näytä onnistumisviesti
      showMessage(window.currentEntryId ? 'Merkintä päivitetty onnistuneesti' : 'Merkintä luotu onnistuneesti', 'success');
      
// Tyhjennä lomake
      resetForm();
      
// Lataa päiväkirjamerkinnät uudelleen
      loadDiaryEntries();
    })
    .catch(error => {
      console.error('Error saving diary entry:', error);
      showMessage('Virhe: ' + error.message, 'error');
    })
    .finally(() => {
// Ota tallennuspainike takaisin käyttöön
      submitButton.disabled = false;
      submitButton.textContent = window.currentEntryId ? 'Päivitä merkintä' : 'Tallenna merkintä';
    });
  }

// Muokkaa päiväkirjamerkintää

  function editEntry(entry) {
    console.log('Editing entry:', entry);
    
// Täytä lomake merkinnän tiedoilla
    entryDateInput.value = entry.entry_date.split('T')[0];
    moodInput.value = entry.mood || '';
    weightInput.value = entry.weight || '';
    sleepHoursInput.value = entry.sleep_hours || '';
    

// Vaihda lomakkeen otsikko ja painikkeen teksti
    formTitle.textContent = 'Muokkaa merkintää';
    submitButton.textContent = 'Päivitä merkintä';

// Tallenna muokattavan merkinnän ID
    window.currentEntryId = entry.id;

// Vieritä lomake näkyviin
    diaryForm.scrollIntoView({ behavior: 'smooth' });
  }

// Poistaa päiväkirjamerkintä
  function deleteEntry(id) {
// Kysyy varmistusta ennen poistoa
    if (!confirm('Haluatko varmasti poistaa tämän merkinnän?')) {
      return;
    }

    console.log('Deleting entry with ID:', id);
    
// Poistaa merkinnän palvelimelta 
    const deleteButton = document.querySelector(`.delete-button[data-id="${id}"]`);
    if (deleteButton) {
      deleteButton.disabled = true;
      deleteButton.textContent = 'Poistetaan...';
    }

    fetch(`${API_URL}/diary/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${getAuthToken()}`
      }
    })
    .then(response => {
      console.log('Delete response status:', response.status);
//Parseetaan vastaus JSON-muotoon
      return response.json().catch(() => {
// Jos vastaus ei ole JSON-muodossa, palauta tyhjä objekti
        return { success: response.ok };
      }).then(data => {
        if (!response.ok) {
          throw new Error(data.message || 'Error deleting entry');
        }
        return data;
      });
    })
    .then(data => {
      console.log('Delete successful:', data);
      
// Näytä onnistumisviesti
      showMessage('Merkintä poistettu onnistuneesti', 'success');
      
// Tyhjennä lomake, jos poistettu merkintä on muokattavana
      if (window.currentEntryId === id) {
        resetForm();
      }
      
// Lataa päiväkirjamerkinnät uudelleen
      loadDiaryEntries();
    })
    .catch(error => {
      console.error('Error deleting entry:', error);
      showMessage('Virhe poistettaessa: ' + error.message, 'error');
      
// Ota poistopainike takaisin käyttöön
      if (deleteButton) {
        deleteButton.disabled = false;
        deleteButton.textContent = 'Poista';
      }
    });
  }

// Nollaa lomake

  function resetForm() {
// Tyhjennä lomake
    diaryForm.reset();

// Aseta nykyinen päivämäärä lomakkeelle
    entryDateInput.value = today;

// Vaihda lomakkeen otsikko ja painikkeen teksti
    formTitle.textContent = 'Lisää uusi merkintä';
    submitButton.textContent = 'Tallenna merkintä';

// Tyhjennä muokattavan merkinnän ID
    window.currentEntryId = null;
  }

// Näytä viesti käyttäjälle

  function showMessage(message, type = 'info') {
// Etsii tai luo viestielementin
    let messageElement = document.getElementById('status-message');
    if (!messageElement) {
      messageElement = document.createElement('div');
      messageElement.id = 'status-message';
      messageElement.style.position = 'fixed';
      messageElement.style.top = '20px';
      messageElement.style.right = '20px';
      messageElement.style.padding = '10px 20px';
      messageElement.style.borderRadius = '5px';
      messageElement.style.zIndex = '1000';
      messageElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
      document.body.appendChild(messageElement);
    }

// Aseta viestin sisältö ja tyyli
    messageElement.textContent = message;
    
// Aseta viestin tyyli tyypin mukaan
    if (type === 'error') {
      messageElement.style.backgroundColor = '#f44336';
      messageElement.style.color = 'white';
    } else if (type === 'success') {
      messageElement.style.backgroundColor = '#4CAF50';
      messageElement.style.color = 'white';
    } else {
      messageElement.style.backgroundColor = '#2196F3';
      messageElement.style.color = 'white';
    }

// Näyttä viesti ja animoi sen
    messageElement.style.display = 'block';
    messageElement.style.animation = 'fadeIn 0.3s, fadeOut 0.3s 2.7s';

// Piilotta viestin automaattisesti
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 3000);
  }

// Lisää funktiot globaaliin nimipohjaan
  window.loadDiaryEntries = loadDiaryEntries;
  window.resetForm = resetForm;
  window.showMessage = showMessage;
  window.editEntry = editEntry;
  window.deleteEntry = deleteEntry;
});

// Hae käyttäjän token localStoragesta 

function getAuthToken() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

// Tarkista onko käyttäjä kirjautunut

function isAuthenticated() {
  return getAuthToken() !== null;
}