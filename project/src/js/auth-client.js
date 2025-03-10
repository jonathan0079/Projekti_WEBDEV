// IMPORTANT: Correct URL format with protocol and hostname
// Using a variable that's easier to change during development
const API_URL = 'http://localhost:3000/api';

/**
 * Handle login modal functionality
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('Auth client script loaded');
  console.log('API URL is set to:', API_URL);
  
  // Get DOM elements
  const loginButton = document.getElementById('login-button');
  const modal = document.getElementById('login-modal');
  const closeModal = document.getElementById('close-modal');
  const loginTab = document.getElementById('login-tab');
  const registerTab = document.getElementById('register-tab');
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginError = document.getElementById('login-error');
  const registerError = document.getElementById('register-error');
  const userMenuTrigger = document.getElementById('user-menu-trigger');
  const userMenuContent = document.getElementById('user-menu-content');
  const logoutButton = document.getElementById('logout-button');
  const userGreeting = document.getElementById('user-greeting');

  // Check if user is logged in
  checkAuthStatus();

  // Show login modal
  if (loginButton) {
    console.log('Login button found');
    loginButton.addEventListener('click', () => {
      console.log('Login button clicked');
      modal.style.display = 'block';
      showLoginForm();
    });
  } else {
    console.warn('Login button not found in the DOM');
  }

  // Close modal when clicking the X
  if (closeModal) {
    closeModal.addEventListener('click', () => {
      console.log('Close modal button clicked');
      modal.style.display = 'none';
      clearForms();
    });
  }

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      console.log('Clicked outside modal, closing');
      modal.style.display = 'none';
      clearForms();
    }
  });

  // Switch between login and register tabs
  if (loginTab) {
    loginTab.addEventListener('click', showLoginForm);
  }

  if (registerTab) {
    registerTab.addEventListener('click', showRegisterForm);
  }

  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  } else {
    console.warn('Login form not found in the DOM');
  }

  // Handle register form submission
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  } else {
    console.warn('Register form not found in the DOM');
  }

  // Handle logout
  if (logoutButton) {
    logoutButton.addEventListener('click', handleLogout);
  }

  /**
   * Show login form and hide register form
   */
  function showLoginForm() {
    console.log('Showing login form');
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    clearErrors();
  }

  /**
   * Show register form and hide login form
   */
  function showRegisterForm() {
    console.log('Showing register form');
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    clearErrors();
  }

  /**
   * Clear form fields
   */
  function clearForms() {
    console.log('Clearing forms');
    loginForm.reset();
    registerForm.reset();
    clearErrors();
  }

  /**
   * Clear error messages
   */
  function clearErrors() {
    if (loginError) loginError.textContent = '';
    if (registerError) {
      registerError.textContent = '';
      registerError.className = 'login-error'; // Reset to default class
    }
  }

  /**
   * Handle login form submission
   */
  async function handleLogin(e) {
    e.preventDefault();
    console.log('Login form submitted');
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    // Validate input
    if (!username || !password) {
      loginError.textContent = 'Käyttäjänimi ja salasana vaaditaan';
      return;
    }
    
    console.log('Attempting login with username:', username);
    
    // Show loading state
    const submitButton = loginForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Kirjaudutaan...';
    submitButton.disabled = true;
    
    // Build the full login URL
    const loginUrl = `${API_URL}/auth/login`;
    console.log('Login endpoint (full URL):', loginUrl);
    
    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      console.log('Login response:', data);
      
      if (!response.ok) {
        loginError.textContent = data.message || 'Kirjautuminen epäonnistui';
        console.error('Login failed:', data.message);
        return;
      }
      
      // Store user data in localStorage
      localStorage.setItem('user', JSON.stringify(data.data));
      console.log('User data stored in localStorage:', data.data);
      
      // Close modal
      modal.style.display = 'none';
      
      // Update UI for logged-in user
      updateAuthUI(true);
      
      // Reload page to update UI
      window.location.reload();
      
    } catch (error) {
      console.error('Login error:', error);
      loginError.textContent = 'Palvelinvirhe, yritä myöhemmin uudelleen';
    } finally {
      // Restore button state
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  }

  /**
   * Handle register form submission
   */
  async function handleRegister(e) {
    e.preventDefault();
    console.log('Register form submitted');
    
    // Clear previous error message
    if (registerError) {
      registerError.textContent = '';
      registerError.className = 'login-error';
    }
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-confirm-password').value;
    
    // Basic validation
    if (!username || !email || !password || !confirmPassword) {
      registerError.textContent = 'Kaikki kentät vaaditaan';
      return;
    }
    
    if (password !== confirmPassword) {
      registerError.textContent = 'Salasanat eivät täsmää';
      return;
    }
    
    console.log('Attempting to register user:', { username, email });
    
    try {
      // Show loading state
      const submitButton = registerForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;
      submitButton.textContent = 'Rekisteröidään...';
      submitButton.disabled = true;
      
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password })
      });
      
      const data = await response.json();
      console.log('Registration response:', data);
      
      // Reset button state
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
      
      // Check for error
      if (!response.ok) {
        registerError.textContent = data.message || 'Rekisteröinti epäonnistui';
        console.error('Registration failed:', data.message || 'Unknown error');
        return;
      }
      
      // Registration successful
      if (data.success) {
        // Show success message
        registerError.textContent = 'Rekisteröinti onnistui! Voit nyt kirjautua sisään.';
        registerError.className = 'login-error success';
        
        // Clear the form
        registerForm.reset();
        
        // Switch to login tab after a short delay
        setTimeout(() => {
          showLoginForm();
        }, 2000);
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      registerError.textContent = 'Palvelinvirhe, yritä myöhemmin uudelleen';
    }
  }

  /**
   * Handle user logout
   */
  function handleLogout(e) {
    e.preventDefault();
    console.log('Logging out user');
    // Remove user data from localStorage
    localStorage.removeItem('user');
    
    // Update UI for logged-out user
    updateAuthUI(false);
    
    // Show logout message
    showMessage('Olet kirjautunut ulos onnistuneesti', 'success');
    
    // If on diary page, redirect to home page
    if (window.location.pathname.includes('diary.html')) {
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } else {
      // Reload page to update UI
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  /**
   * Check if user is logged in
   */
  function checkAuthStatus() {
    console.log('Checking authentication status');
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user && user.token) {
      console.log('User is logged in:', user.username);
      // User is logged in
      updateAuthUI(true);
      
      // If on diary page, load diary entries
      if (window.location.pathname.includes('diary.html')) {
        console.log('On diary page, loading entries');
        if (typeof loadDiaryEntries === 'function') {
          loadDiaryEntries();
        } else {
          console.warn('loadDiaryEntries function not found');
        }
      }
    } else {
      console.log('User is not logged in');
      // User is not logged in
      updateAuthUI(false);
      
      // If on diary page, redirect to home page
      if (window.location.pathname.includes('diary.html')) {
        console.log('Redirecting from diary page to home page');
        window.location.href = 'index.html';
      }
    }
  }

  /**
   * Update UI based on authentication status
   */
  function updateAuthUI(isLoggedIn) {
    console.log('Updating UI for authentication status:', isLoggedIn);
    if (isLoggedIn) {
      // Get user data
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Hide login button
      if (loginButton) {
        loginButton.style.display = 'none';
        console.log('Login button hidden');
      }
      
      // Show user menu
      if (userMenuTrigger) {
        userMenuTrigger.style.display = 'flex';
        if (userGreeting) {
          userGreeting.textContent = `Hei, ${user.username}!`;
        }
        console.log('User menu displayed');
      } else {
        console.warn('User menu trigger not found');
      }
      
      // Show diary link in navigation
      const diaryNavLink = document.getElementById('diary-nav-link');
      if (diaryNavLink) {
        diaryNavLink.style.display = 'inline';
        console.log('Diary nav link displayed');
      } else {
        console.warn('Diary nav link not found');
      }
    } else {
      // Show login button
      if (loginButton) {
        loginButton.style.display = 'inline-block';
        console.log('Login button displayed');
      }
      
      // Hide user menu
      if (userMenuTrigger) {
        userMenuTrigger.style.display = 'none';
        console.log('User menu hidden');
      }
      
      // Hide diary link in navigation
      const diaryNavLink = document.getElementById('diary-nav-link');
      if (diaryNavLink) {
        diaryNavLink.style.display = 'none';
        console.log('Diary nav link hidden');
      }
    }
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

    // Show message
    messageElement.style.display = 'block';

    // Hide message after 3 seconds
    setTimeout(() => {
      messageElement.style.display = 'none';
    }, 3000);
  }
});

/**
 * Get authentication token from localStorage
 */
function getAuthToken() {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? user.token : null;
}

/**
 * Check if user is authenticated
 */
function isAuthenticated() {
  return getAuthToken() !== null;
}

/**
 * Show message to user (global function)
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

  // Show message
  messageElement.style.display = 'block';

  // Hide message after 3 seconds
  setTimeout(() => {
    messageElement.style.display = 'none';
  }, 3000);
}