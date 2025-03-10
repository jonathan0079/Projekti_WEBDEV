// Fixed Diary.js implementation for the HealthDiary application
// Properly handles creating, updating, and deleting diary entries

// IMPORTANT: Correct URL format with protocol and hostname
const API_URL = 'http://localhost:3000/api';

/**
 * Diary functionality
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Diary script loaded');
  console.log('API URL is set to:', API_URL);
  
  // Check if user is logged in
  if (!isAuthenticated()) {
    console.log('User not authenticated, redirecting to home page');
    // Redirect to home page if not logged in
    window.location.href = 'index.html';
    return;
  }

  // Get DOM elements
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

  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  entryDateInput.value = today;

  // Variable to store current entry ID when editing
  window.currentEntryId = null;

  // Load diary entries on page load
  loadDiaryEntries();

  // Handle diary form submission
  diaryForm.addEventListener('submit', handleDiarySubmit);
  
  // Add reset button functionality
  if (resetFormButton) {
    resetFormButton.addEventListener('click', (e) => {
      e.preventDefault();
      resetForm();
    });
  }

  /**
   * Load diary entries from API
   */
  function loadDiaryEntries() {
    try {
      // Show loading indicator
      diaryEntriesContainer.innerHTML = '<div class="loading-indicator"></div>';

      // Build the full diary entries URL
      const diaryUrl = `${API_URL}/diary`;
      console.log('Loading diary entries from:', diaryUrl);
      console.log('Auth token:', getAuthToken()?.substring(0, 20) + '...');

      // Make the fetch request
      fetch(diaryUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      })
      .then(response => {
        // Log the response status for debugging
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        console.log('Diary entries loaded:', data);

        // Clear container
        diaryEntriesContainer.innerHTML = '';

        if (!data.data || data.data.length === 0) {
          diaryEntriesContainer.innerHTML = '<p style="color: white;">Ei päiväkirjamerkintöjä. Lisää ensimmäinen merkintäsi lomakkeella.</p>';
          return;
        }

        // Create entries
        data.data.forEach(entry => {
          const entryElement = createEntryElement(entry);
          diaryEntriesContainer.appendChild(entryElement);
        });
      })
      .catch(error => {
        console.error('Error loading diary entries:', error);
        diaryEntriesContainer.innerHTML = '<p>Virhe merkintöjen latauksessa. Yritä myöhemmin uudelleen.</p>';
        
        // If the error is related to authentication, redirect to login
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

  /**
   * Create HTML element for a diary entry
   */
  function createEntryElement(entry) {
    // Format date
    const date = new Date(entry.entry_date);
    const formattedDate = date.toLocaleDateString('fi-FI', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Create entry element
    const entryElement = document.createElement('div');
    entryElement.className = 'diary-entry';
    entryElement.dataset.id = entry.id;

    // Parse JSON notes to extract workout data if available
    let workoutData = null;
    if (entry.notes && typeof entry.notes === 'string' && entry.notes.includes('"activityType"')) {
      try {
        workoutData = JSON.parse(entry.notes);
        // Display main notes in a readable format
        entry.notes = workoutData.notes || '';
      } catch (e) {
        console.log('Failed to parse workout data from notes:', e);
      }
    }

    // Basic entry HTML
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

    // Add workout data if available
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

    // Add notes section
    entryHTML += `
        <div class="entry-notes">
          <span class="detail-label">Muistiinpanot:</span>
          <p>${entry.notes || 'Ei muistiinpanoja'}</p>
        </div>
      </div>
    `;

    entryElement.innerHTML = entryHTML;

    // Add event listeners
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

  /**
   * Handle diary form submission
   */
  function handleDiarySubmit(e) {
    e.preventDefault();
    console.log('Diary form submitted');

    // Get form values
    const entryDate = entryDateInput.value;
    const mood = moodInput.value;
    const weight = weightInput.value;
    const sleepHours = sleepHoursInput.value;
    let notes = notesInput.value;

    // Validate required fields
    if (!entryDate) {
      alert('Päivämäärä on pakollinen kenttä!');
      return;
    }

    // Prepare data
    const entryData = {
      entry_date: entryDate,
      mood: mood,
      weight: weight ? parseFloat(weight) : null,
      sleep_hours: sleepHours ? parseFloat(sleepHours) : null,
      notes: notes
    };

    console.log('Entry data:', entryData);
    console.log('Current entry ID:', window.currentEntryId);

    // Show loading state
    submitButton.disabled = true;
    submitButton.textContent = window.currentEntryId ? 'Päivitetään...' : 'Tallennetaan...';

    let url, method;
    if (window.currentEntryId) {
      // Update existing entry
      url = `${API_URL}/diary/${window.currentEntryId}`;
      method = 'PUT';
      console.log('Updating diary entry at:', url);
    } else {
      // Create new entry
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
      
      // Show success message
      showMessage(window.currentEntryId ? 'Merkintä päivitetty onnistuneesti' : 'Merkintä luotu onnistuneesti', 'success');
      
      // Reset form
      resetForm();
      
      // Reload entries
      loadDiaryEntries();
    })
    .catch(error => {
      console.error('Error saving diary entry:', error);
      showMessage('Virhe: ' + error.message, 'error');
    })
    .finally(() => {
      // Reset button state
      submitButton.disabled = false;
      submitButton.textContent = window.currentEntryId ? 'Päivitä merkintä' : 'Tallenna merkintä';
    });
  }

  /**
   * Edit diary entry
   */
  function editEntry(entry) {
    console.log('Editing entry:', entry);
    
    // Set form values
    entryDateInput.value = entry.entry_date.split('T')[0]; // Format YYYY-MM-DD
    moodInput.value = entry.mood || '';
    weightInput.value = entry.weight || '';
    sleepHoursInput.value = entry.sleep_hours || '';
    
    // Try to parse JSON workout data from notes
    let workoutData = null;
    if (entry.notes && entry.notes.includes('"activityType"')) {
      try {
        workoutData = JSON.parse(entry.notes);
        notesInput.value = workoutData.notes || '';
      } catch (e) {
        console.log('Failed to parse workout data from notes:', e);
        notesInput.value = entry.notes || '';
      }
    } else {
      notesInput.value = entry.notes || '';
    }

    // Change form title and button text
    formTitle.textContent = 'Muokkaa merkintää';
    submitButton.textContent = 'Päivitä merkintä';

    // Store entry ID
    window.currentEntryId = entry.id;

    // Scroll to form
    diaryForm.scrollIntoView({ behavior: 'smooth' });
  }

  /**
   * Delete diary entry
   */
  function deleteEntry(id) {
    // Confirm deletion
    if (!confirm('Haluatko varmasti poistaa tämän merkinnän?')) {
      return;
    }

    console.log('Deleting entry with ID:', id);
    
    // Show loading or disable buttons
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
      
      // Always try to parse JSON response, but don't fail if it's not JSON
      return response.json().catch(() => {
        // If not JSON, create a simple object with success based on status
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
      
      // Show success message
      showMessage('Merkintä poistettu onnistuneesti', 'success');
      
      // Reset form if editing the deleted entry
      if (window.currentEntryId === id) {
        resetForm();
      }
      
      // Reload entries
      loadDiaryEntries();
    })
    .catch(error => {
      console.error('Error deleting entry:', error);
      showMessage('Virhe poistettaessa: ' + error.message, 'error');
      
      // Re-enable delete button
      if (deleteButton) {
        deleteButton.disabled = false;
        deleteButton.textContent = 'Poista';
      }
    });
  }

  /**
   * Reset diary form
   */
  function resetForm() {
    // Reset form
    diaryForm.reset();

    // Set date to today
    entryDateInput.value = today;

    // Reset form title and button text
    formTitle.textContent = 'Lisää uusi merkintä';
    submitButton.textContent = 'Tallenna merkintä';

    // Reset entry ID
    window.currentEntryId = null;
  }

  /**
   * Show message to user
   */
  function showMessage(message, type = 'info') {
    // Create message element if it doesn't exist
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

    // Set message content and style
    messageElement.textContent = message;
    
    // Set color based on message type
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

    // Show message with animation
    messageElement.style.display = 'block';
    messageElement.style.animation = 'fadeIn 0.3s, fadeOut 0.3s 2.7s';

    // Hide message after 3 seconds
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 3000);
  }

  // Make functions available globally
  window.loadDiaryEntries = loadDiaryEntries;
  window.resetForm = resetForm;
  window.showMessage = showMessage;
  window.editEntry = editEntry;
  window.deleteEntry = deleteEntry;
});

/**
 * Get authentication token from localStorage
 */
function getAuthToken() {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user?.token;
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