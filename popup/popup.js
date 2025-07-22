document.addEventListener('DOMContentLoaded', () => {
  const scanBtn = document.getElementById('scanBtn');
  const urlField = document.getElementById('url');
  const resultsEl = document.getElementById('results');

  if (!scanBtn || !urlField || !resultsEl) {
    return;
  }

  scanBtn.addEventListener('click', () => {
    const url = urlField.value.trim();
    if (!url) {
      resultsEl.textContent = 'Please enter a URL.';
      return;
    }

    chrome.runtime.sendMessage({ action: 'scanURL', url, apiKey: 'YOUR_API_KEY_HERE' }, (response) => {
      if (response && response.status === 'success') {
        resultsEl.textContent = response.result.threat_level;
      } else {
        resultsEl.textContent = 'Error: ' + (response ? response.message : 'No response');
      }
    });
  });
});
