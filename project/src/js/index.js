// Import main stylesheets
import '../css/mainstyle.css';
import '../css/login.css';
import '../css/diary.css';
import '../css/about.css';
import '../css/game.css';

// Check which page we're on to load appropriate scripts
const currentPage = window.location.pathname;

// Load appropriate scripts based on the current page
if (currentPage.includes('about.html')) {
  // Maps script is loaded via the HTML script tag with callback
  console.log('About page detected, Google Maps will initialize when loaded');
} else if (currentPage.includes('yhteistiedot.html')) {
  // Game functionality is included in the yhteistiedot.html file
  console.log('Game page detected, game will initialize when loaded');
  
  // Import game script
  import('./game.js')
    .then(module => {
      console.log('Game module loaded successfully');
    })
    .catch(error => {
      console.error('Error loading game module:', error);
    });
}