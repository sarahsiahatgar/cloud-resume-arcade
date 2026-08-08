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
