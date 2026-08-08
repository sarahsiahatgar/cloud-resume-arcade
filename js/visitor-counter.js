// js/visitor-counter.js

const API_URL = 'https://dcfmz6brx0.execute-api.us-east-1.amazonaws.com/';

export function initVisitorCounter() {
  async function getVisitorCount(shouldIncrement = false) {
    try {
      const endpoint = shouldIncrement ? `${API_URL}?increment=true` : API_URL;
      const response = await fetch(endpoint);
      const data = await response.json();
      
      const count = data.visitor_count || '1';
      document.getElementById('visitorCount').textContent = count;
    } catch (err) {
      console.error('Failed to fetch visitor count:', err);
      document.getElementById('visitorCount').textContent = '1';
    }
  }

  const THIRTY_MINUTES = 30 * 60 * 1000;
  const lastVisit = localStorage.getItem('lastVisitTime');
  const now = Date.now();

  if (!lastVisit || (now - parseInt(lastVisit, 10)) > THIRTY_MINUTES) {
    localStorage.setItem('lastVisitTime', now);
    getVisitorCount(true);
  } else {
    getVisitorCount(false);
  }
}