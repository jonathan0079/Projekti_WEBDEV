// Calorie Clicker Game
import '../css/game.css';
import { initGameScores, saveGameScore, checkAndOfferToSaveScore } from './game.js';

document.addEventListener('DOMContentLoaded', function() {
  console.log('Calorie Clicker game initializing');
  
  // Initialize the game score system
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
  let gameTime = 30; // Game duration in seconds
  let gameInterval;
  let foodItems = [];
  
  // Calorie values and spawn rates for different food types
  const foodTypes = [
    { name: 'apple', calories: 10, spawnRate: 0.2, color: '#ff0000', radius: 15 },
    { name: 'burger', calories: 50, spawnRate: 0.1, color: '#8B4513', radius: 20 },
    { name: 'salad', calories: 5, spawnRate: 0.15, color: '#00ff00', radius: 18 },
    { name: 'pizza', calories: 100, spawnRate: 0.05, color: '#FFA500', radius: 25 },
    { name: 'soda', calories: 30, spawnRate: 0.12, color: '#000000', radius: 17 }
  ];
  
  // Add click event listener to the login button
  if (loginFromGameButton) {
    loginFromGameButton.addEventListener('click', function() {
      document.getElementById('login-button').click();
    });
  }
  
  // Add click event listener to the save score button
  if (saveScoreButton) {
    saveScoreButton.addEventListener('click', function() {
      saveGameScore(gameScore);
    });
  }
  
  // Game initialization
  function initGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Reset game variables
    gameScore = 0;
    gameTime = 30;
    foodItems = [];
    
    // Update score display
    currentScoreDisplay.textContent = gameScore;
    
    // Draw game instructions
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Klikkaa ruoka-aineksia kerätäksesi tai polttaaksesi kaloreita!', canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText('Terveelliset ruuat = positiiviset pisteet, epäterveelliset = negatiiviset', canvas.width / 2, canvas.height / 2 + 10);
    ctx.fillText('Paina "Aloita peli" aloittaaksesi!', canvas.width / 2, canvas.height / 2 + 50);
  }
  
  // Start the game
  function startGame() {
    if (gameRunning) return;
    
    gameRunning = true;
    gameScore = 0;
    gameTime = 10;
    foodItems = [];
    
    // Update score display
    currentScoreDisplay.textContent = gameScore;
    
    // Set up game loop
    gameInterval = setInterval(function() {
      updateGame();
      drawGame();
      
      // Spawn food items randomly
      if (Math.random() < 0.1) { // 10% chance each frame to spawn a new food
        spawnFoodItem();
      }
      
      // Decrease game time
      gameTime -= 0.02; // Assuming ~50 FPS, this is roughly 1 second
      
      // Check if game time is up
      if (gameTime <= 0) {
        endGame();
      }
    }, 20); // ~50 FPS
    
    // Add click event listener
    canvas.addEventListener('click', handleCanvasClick);
  }
  
  // End the game
  function endGame() {
    // Stop game loop
    clearInterval(gameInterval);
    
    // Set game state
    gameRunning = false;
    
    // Remove click event listener
    canvas.removeEventListener('click', handleCanvasClick);
    
    // Display game over screen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Peli päättyi!', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '24px Arial';
    ctx.fillText(`Loppupisteet: ${gameScore}`, canvas.width / 2, canvas.height / 2);
    ctx.font = '18px Arial';
    ctx.fillText('Paina "Aloita alusta" pelataksesi uudelleen', canvas.width / 2, canvas.height / 2 + 50);
    
    // Only offer to save score if it's positive
    if (gameScore > 0) {
      checkAndOfferToSaveScore(gameScore);
    } else {
      console.log('Score is zero or negative, not offering to save');
    }
  }
  
  // Update game state
  function updateGame() {
    // Update food items positions (fall down)
    for (let i = foodItems.length - 1; i >= 0; i--) {
      const item = foodItems[i];
      
      // Move item down
      item.y += item.speed;
      
      // Remove items that have fallen off the bottom
      if (item.y > canvas.height + item.radius) {
        foodItems.splice(i, 1);
      }
    }
  }
  
  // Draw the game
  function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = 'rgba(49, 67, 83, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw food items
    for (const item of foodItems) {
      ctx.beginPath();
      ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
      ctx.fillStyle = item.color;
      ctx.fill();
      ctx.closePath();
    }
    
    // Draw game info
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '18px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Pisteet: ${gameScore}`, 10, 30);
    
    // Draw timer
    ctx.textAlign = 'right';
    ctx.fillText(`Aika: ${Math.max(0, Math.ceil(gameTime))}s`, canvas.width - 10, 30);
  }
  
  // Spawn a new food item
  function spawnFoodItem() {
    // Randomly select a food type based on spawn rates
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
    
    // If no food was selected (shouldn't happen), pick the first one
    if (!selectedFood) {
      selectedFood = foodTypes[0];
    }
    
    // Create a new food item
    const newItem = {
      x: Math.random() * (canvas.width - 40) + 20, // Random x position
      y: -20, // Start above the canvas
      radius: selectedFood.radius,
      color: selectedFood.color,
      calories: selectedFood.calories,
      name: selectedFood.name,
      speed: 2 + Math.random() * 3 // Random speed between 2 and 5
    };
    
    // Adjust calories based on food type (healthy foods give positive points, unhealthy foods negative)
    if (newItem.name === 'apple' || newItem.name === 'salad') {
      newItem.calories = Math.abs(newItem.calories); // Positive
    } else {
      newItem.calories = -Math.abs(newItem.calories); // Negative
    }
    
    // Add to food items array
    foodItems.push(newItem);
  }
  
  // Handle canvas click events
  function handleCanvasClick(event) {
    // Get click coordinates relative to canvas
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if a food item was clicked
    for (let i = foodItems.length - 1; i >= 0; i--) {
      const item = foodItems[i];
      
      // Calculate distance from click to item center
      const distance = Math.sqrt(
        Math.pow(x - item.x, 2) + Math.pow(y - item.y, 2)
      );
      
      // If click is within item radius, it's a hit
      if (distance <= item.radius) {
        // Add/subtract calories to score
        gameScore += item.calories;
        
        // Update score display
        currentScoreDisplay.textContent = gameScore;
        
        // Remove the clicked item
        foodItems.splice(i, 1);
        
        // Only handle one item per click
        break;
      }
    }
  }
  
  // Add event listeners to buttons
  startButton.addEventListener('click', startGame);
  
  resetButton.addEventListener('click', function() {
    // Stop current game if running
    if (gameRunning) {
      clearInterval(gameInterval);
      gameRunning = false;
      canvas.removeEventListener('click', handleCanvasClick);
    }
    
    // Initialize new game
    initGame();
  });
  
  // Initialize the game on page load
  initGame();
});