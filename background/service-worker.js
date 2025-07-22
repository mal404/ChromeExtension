importScripts('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');

const SUPABASE_URL = 'https://wqczlzljkfdaoloujyka.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxY3psemxqa2ZkYW9sb3VqeWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNzY0MzgsImV4cCI6MjA2ODY1MjQzOH0.RhU05RsDNUH_uv6oJ3LIYD8hoMDCyO7MJqiwEpTdWYU';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function saveSession(session) {
  chrome.storage.local.set({ supabaseSession: session });
}

function loadSession(callback) {
  chrome.storage.local.get(['supabaseSession'], (result) => {
    callback(result.supabaseSession || null);
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'login') {
    supabase.auth.signInWithPassword({
      email: request.email,
      password: request.password
    }).then(({ data, error }) => {
      if (error) {
        sendResponse({ status: 'error', message: error.message });
        return;
      }
      saveSession(data.session);
      sendResponse({ status: 'success', session: data.session });
    });
    return true;
  }

  if (request.action === 'logout') {
    supabase.auth.signOut().then(() => {
      chrome.storage.local.remove('supabaseSession', () => {
        sendResponse({ status: 'success' });
      });
    });
    return true;
  }

  if (request.action === 'scanURL') {
    loadSession((session) => {
      const token = session ? session.access_token : request.apiKey;
      fetch(`${SUPABASE_URL}/functions/v1/secure-scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : undefined
        },
        body: JSON.stringify({ url: request.url })
      })
        .then((response) => response.json())
        .then((data) => sendResponse({ status: 'success', result: data }))
        .catch((error) => sendResponse({ status: 'error', message: error.message }));
    });
    return true;
  }
});
