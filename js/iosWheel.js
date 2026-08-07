export function initIOSWheels() {
  function initWheel(type, min, max, defaultVal) {
    const wheel = document.getElementById(type + 'Wheel');
    if (!wheel) return;
    
    wheel.innerHTML = '<div style="height: 35px;"></div>';
    for (let i = min; i <= max; i++) {
      wheel.innerHTML += `<div class="ios-picker-item" data-value="${i}">${i}</div>`;
    }
    wheel.innerHTML += '<div style="height: 35px;"></div>';

    setTimeout(() => {
      const targetItem = wheel.querySelector(`[data-value="${defaultVal}"]`);
      if (targetItem) {
        wheel.scrollTop = targetItem.offsetTop - 35;
      }
    }, 50);

    wheel.addEventListener('scroll', () => {
      updateWheelValue(type);
    });
  }

  function updateWheelValue(type) {
    const wheel = document.getElementById(type + 'Wheel');
    if (!wheel) return;
    const items = wheel.querySelectorAll('.ios-picker-item');
    const containerCenter = wheel.scrollTop + wheel.clientHeight / 2;
    
    let closestItem = null;
    let minDiff = Infinity;

    items.forEach(item => {
      const itemCenter = item.offsetTop + item.clientHeight / 2;
      const diff = Math.abs(containerCenter - itemCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestItem = item;
      }
    });

    if (closestItem) {
      const input = document.getElementById(type + 'Input');
      if (input) {
        input.value = closestItem.getAttribute('data-value');
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  initWheel('angle', 0, 90, 45);
  initWheel('power', 0, 100, 50);
}