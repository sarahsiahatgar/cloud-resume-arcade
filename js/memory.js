// js/memory.js

export function initMemoryGame() {
  const awsIcons = ['☁️', '⚡', '📦', '🔒', '💾', '🌐', '📊', '🤖'];
  let memCards = [...awsIcons, ...awsIcons];
  let flippedCards = [];
  let matchedPairs = 0;

  const board = document.getElementById('memoryBoard');
  const restartBtn = document.getElementById('restartMemBtn');

  function setup() {
    board.innerHTML = '';
    flippedCards = [];
    matchedPairs = 0;
    document.getElementById('memScore').textContent = '0';
    document.getElementById('memStatus').textContent = 'Flip cards to match AWS tech!';
    
    memCards.sort(() => Math.random() - 0.5);

    memCards.forEach((icon, index) => {
      const card = document.createElement('div');
      card.classList.add('memory-card');
      card.dataset.icon = icon;
      card.dataset.index = index;
      card.textContent = '❓';
      card.addEventListener('click', flipCard);
      board.appendChild(card);
    });
  }

  function flipCard() {
    if (flippedCards.length === 2 || this.classList.contains('flipped')) return;

    this.classList.add('flipped');
    this.textContent = this.dataset.icon;
    flippedCards.push(this);

    if (flippedCards.length === 2) {
      checkMatch();
    }
  }

  function checkMatch() {
    const [card1, card2] = flippedCards;
    
    if (card1.dataset.icon === card2.dataset.icon) {
      matchedPairs++;
      document.getElementById('memScore').textContent = matchedPairs;
      flippedCards = [];
      
      if (matchedPairs === awsIcons.length) {
        document.getElementById('memStatus').textContent = '🎉 You matched all AWS services!';
      }
    } else {
      setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        card1.textContent = '❓';
        card2.textContent = '❓';
        flippedCards = [];
      }, 800);
    }
  }

  restartBtn.addEventListener('click', setup);
  setup();
}