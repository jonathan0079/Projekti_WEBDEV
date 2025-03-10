// Lataa kaikki tarvittavat tyylitiedostotja muut moduulit
import '../css/mainstyle.css';
import '../css/login.css';
import '../css/diary.css';
import '../css/about.css';
import '../css/game.css';

//Tarkistaa, onko käyttäjä kirjautunut sisään
const currentPage = window.location.pathname;

// Lataa Google Maps API:n JavaScript-kirjaston

if (currentPage.includes('about.html')) {
  console.log('About page detected, Google Maps will initialize when loaded');
} else if (currentPage.includes('yhteistiedot.html')) {
  // Peli toiminnaalisuudet ladataan vain pelisivulla
  console.log('Game page detected, game will initialize when loaded');
  
// Lataa pelin toiminnallisuudet
  import('./game.js')
    .then(module => {
      console.log('Game module loaded successfully');
    })
    .catch(error => {
      console.error('Error loading game module:', error);
    });
}