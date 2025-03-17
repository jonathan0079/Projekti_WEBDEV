// Kaloritreeni-pelin toiminnallisuus
import '../css/game.css';
import { initGameScores, saveGameScore, checkAndOfferToSaveScore } from './game.js';

document.addEventListener('DOMContentLoaded', function() {
  console.log('Calorie Clicker game initializing');
  
// Aloittaa
  initGameScores();
  
  // Game variables
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const startButton = document.getElementById('start-game');
  const resetButton = document.getElementById('reset-game');
  const saveScoreButton = document.getElementById('save-score');
  const currentScoreDisplay = document.getElementById('current-score');
  const loginFromGameButton = document.getElementById('login-from-game');
  
  let gameRunning = false;
  let gameScore = 0;
  let gameTime = 10;
  let gameInterval;
  let foodItems = [];
  
// Ruoka-aineet ja niiden ominaisuudet 
  const foodTypes = [
    { name: 'pizza', calories: 100, spawnRate: 0.2, color: '#ff0000', radius: 15 },
    { name: 'salad', calories: 200, spawnRate: 0.1, color: '#8B4513', radius: 20 },
    { name: 'burger', calories: 500, spawnRate: 0.15, color: '#00ff00', radius: 18 },
    { name: 'apple', calories: 50, spawnRate: 0.05, color: '#FFA500', radius: 25 },
    { name: 'smoothie', calories: 60, spawnRate: 0.12, color: '#000000', radius: 17 }
  ];
  
// Lisää tapahtumakuuntelija kirjautumisnappiin pelistä
  if (loginFromGameButton) {
    loginFromGameButton.addEventListener('click', function() {
      document.getElementById('login-button').click();
    });
  }
  
// Lisää tapahtumakuuntelija tallennusnappiin
  if (saveScoreButton) {
    saveScoreButton.addEventListener('click', function() {
      saveGameScore(gameScore);
    });
  }
  
  function initGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    gameScore = 0;
    gameTime = 10;
    foodItems = [];
    

    currentScoreDisplay.textContent = gameScore;
    
// ohjeet pelin alussa
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Klikkaa ruoka-aineksia kerätäksesi tai polttaaksesi kaloreita!', canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText('Terveelliset ruuat = positiiviset pisteet, epäterveelliset = negatiiviset', canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('Paina "Aloita peli" aloittaaksesi!', canvas.width / 2, canvas.height / 2 + 50);
  }
  
 // Aloittaa pelin
  function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    gameScore = 0;
    gameTime = 10;
    foodItems = [];
    
// Päivittää pelin pistemäärän
    currentScoreDisplay.textContent = gameScore;
    
// Aloittaa pelin loopin
    gameInterval = setInterval(function() {
      updateGame();
      drawGame();
      
// Lisää ruoka-aineksia satunnaisesti
      if (Math.random() < 0.1) {
        spawnFoodItem();
      }
      
// Vähentää peliaikaa
      gameTime -= 0.02;
      
// Peli loppuu kun aika loppuu
      if (gameTime <= 0) {
        endGame();
      }
    }, 20);
    
// Lisää tapahtumakuuntelija klikkauksille
    canvas.addEventListener('click', handleCanvasClick);
  }
  
// Peli loppuu
  function endGame() {
// Lopettaa pelin
    clearInterval(gameInterval);
    
// Asettaa pelin lopetetuksi
    gameRunning = false;
    
// Poistaa tapahtumakuuntelijan klikkauksille
    canvas.removeEventListener('click', handleCanvasClick);
    
// Näyttää lopputuloksen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Peli päättyi!', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '24px Arial';
    ctx.fillText(`Loppupisteet: ${gameScore}`, canvas.width / 2, canvas.height / 2);
    ctx.font = '18px Arial';
    ctx.fillText('Paina "Aloita alusta" pelataksesi uudelleen', canvas.width / 2, canvas.height / 2 + 50);
    
// Tarjoaa tallennusta jos pistemäärä on positiivinen
    if (gameScore > 0) {
      checkAndOfferToSaveScore(gameScore);
    } else {
      console.log('Score is zero or negative, not offering to save');
    }
  }
  
// Päivittää peliä
  function updateGame() {
// Liikuttaa ruoka-aineita alaspäin
    for (let i = foodItems.length - 1; i >= 0; i--) {
      const item = foodItems[i];

      item.y += item.speed;
      
// Poistaa ruoka-aineet jotka ovat menneet ruudun alapuolelle
      if (item.y > canvas.height + item.radius) {
        foodItems.splice(i, 1);
      }
    }
  }
  
// Piirtää pelin
  function drawGame() {
// Tyhjentää canvasin
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
// Piirtää taustan
    ctx.fillStyle = 'rgba(49, 67, 83, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
// Piirtää ruoka-aineet
    for (const item of foodItems) {
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.closePath();
    }
    
// piiirtää pistemäärän ja ajan
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Pisteet: ${gameScore}`, 10, 30);
    
    ctx.textAlign = 'right';
    ctx.fillText(`Aika: ${Math.max(0, Math.ceil(gameTime))}s`, canvas.width - 10, 30);
  }
  
// Lisää ruoka-aineen
  function spawnFoodItem() {
// Valitsee satunnaisen ruoka-aineen
    let random = Math.random();
    let selectedFood = null;
    let totalRate = 0;
    
    for (const food of foodTypes) {
      totalRate += food.spawnRate;
      if (random <= totalRate) {
        selectedFood = food;
        break;
      }
    }
    
// Jos ei valittua ruoka-ainesta, valitsee ensimmäisen
    if (!selectedFood) {
      selectedFood = foodTypes[0];
    }
    
// Luo uuden ruoka-aineen
    const newItem = {
      x: Math.random() * (canvas.width - 40) + 20,
      y: -20,
      radius: selectedFood.radius,
      color: selectedFood.color,
      calories: selectedFood.calories,
      name: selectedFood.name,
      speed: 2 + Math.random() * 3
    };
    
// Asettaa kalorit positiivisiksi tai negatiivisiksi riippuen ruoka-aineesta
    if (newItem.name === 'apple' || newItem.name === 'salad') {
      newItem.calories = Math.abs(newItem.calories);
    } else {
      newItem.calories = -Math.abs(newItem.calories);
    }
    
// Lisää ruoka-aineen listaan
    foodItems.push(newItem);
  }
  
// Käsittelee klikkauksia
  function handleCanvasClick(event) {
// Laskee klikkauksen sijainnin canvasissa
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
// Käy läpi kaikki ruoka-aineet ja tarkistaa onko klikkaus osunut niihin
    for (let i = foodItems.length - 1; i >= 0; i--) {
      const item = foodItems[i];
      
// Laskee klikkauksen ja ruoka-aineen etäisyyden
      const distance = Math.sqrt(
        Math.pow(x - item.x, 2) + Math.pow(y - item.y, 2)
      );
      
// Jos klikkaus osuu ruoka-aineeseen
      if (distance <= item.radius) {
// Lisää tai vähentää pisteitä ruoka-aineen kalorien mukaan
        gameScore += item.calories;
        
// Päivittää pistemäärän
        currentScoreDisplay.textContent = gameScore;
        
// Poistaa ruoka-aineen listasta
        foodItems.splice(i, 1);
        
// Siirtyy seuraavaan ruoka-aineeseen
        break;
      }
    }
  }
  
// Lisää tapahtumakuuntelijat
  startButton.addEventListener('click', startGame);
  
  resetButton.addEventListener('click', function() {
// Lopettaa pelin jos se on käynnissä
    if (gameRunning) {
      clearInterval(gameInterval);
      gameRunning = false;
      canvas.removeEventListener('click', handleCanvasClick);
    }
    
// Alustaa pelin
    initGame();
  });

  initGame();
});