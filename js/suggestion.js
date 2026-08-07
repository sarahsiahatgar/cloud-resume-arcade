/* js/suggestion-box.js

export function initSuggestionBox() {
  async function submitSuggestion() {
    const input = document.getElementById('gameSuggestion');
    const status = document.getElementById('suggestionMsg');
    const suggestion = input.value.trim();

    if (!suggestion) {
      status.textContent = 'Please enter a game name!';
      status.style.color = '#e74c3c';
      return;
    }

    status.style.color = '#b5be8a';
    status.textContent = 'Submitting...';

    try {
      const response = await fetch('https://dcfmz6brx0.execute-api.us-east-1.amazonaws.com/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestion })
      });

      if (response.ok) {
        status.textContent = 'Thanks for the suggestion! 🎮';
        status.style.color = '#2ecc71';
        input.value = '';
      } else {
        status.textContent = 'Oops! Failed to save. Try again.';
        status.style.color = '#e74c3c';
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      status.textContent = 'Oops! Something went wrong.';
      status.style.color = '#e74c3c';
    }
  }

  document.getElementById('submitSuggestionBtn').addEventListener('click', submitSuggestion);
}
*/

// js/suggestion.js

export function initSuggestionBox() {
  const input = document.getElementById('gameSuggestion');
  const submitBtn = document.getElementById('submitSuggestionBtn');
  const status = document.getElementById('suggestionMsg');

  if (input && submitBtn && status) {
    input.disabled = true;
    input.placeholder = "Suggestions currently closed...";
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.6';
    submitBtn.style.cursor = 'not-allowed';
    status.textContent = "We're too busy building! Suggestion box is temporarily closed. 🛑";
    status.style.color = '#ffffff';
  }

  async function submitSuggestion() {
    return;
  }

  if (submitBtn) {
    submitBtn.addEventListener('click', submitSuggestion);
  }
}