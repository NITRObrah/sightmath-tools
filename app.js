// ========================================
// DOM Helpers all this shiii just to keep data/memorey are what ever you call it
// ========================================
const $ = id => document.getElementById(id);
const $all = sel => document.querySelectorAll(sel);

// ========================================
// Local Storage Helper
// ========================================
const store = {
  get: key => { try { return localStorage.getItem(key); } catch(e) { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, val); } catch(e) {} }
};

// ========================================
// Config
// ========================================
const GAME_BASE = 'https://gms.parcoil.com';

const cloakConfig = {
  default: { title: 'sight.w', favicon: 'https://image2url.com/r2/default/images/1772114193046-733bfa71-77a7-4fdc-bce4-d3e8ebe17a29.png' },
  canvas: { title: 'Canvas LMS', favicon: 'https://canvas.instructure.com/favicon.ico' },
  google: { title: 'Google', favicon: 'https://www.google.com/favicon.ico' },
  drive: { title: 'Google Drive', favicon: 'https://drive.google.com/favicon.ico' }
};

let currentGameUrl = '';
let gamesData = [];

// ========================================
// Initialize App
// ========================================
document.addEventListener('DOMContentLoaded', async () => {
  await loadGamesData();
  initTheme();
  initCloak();
  initSettings();
  initGames();
  initNav();
  initKeys();
  initStats();
  updateTime();
  setInterval(updateTime, 1000);
  setTimeout(() => $('loadingScreen').classList.add('hidden'), 1200);
});

// ========================================
// Load Games Data
// ========================================
async function loadGamesData() {
  try {
    const response = await fetch('data/games.json');
    gamesData = await response.json();
  } catch (e) {
    console.error('Failed to load games data:', e);
    gamesData = [];
  }
}

// ========================================
// Theme
// ========================================
function initTheme() {
  const theme = store.get('theme') || 'dark';
  document.body.setAttribute('data-theme', theme);
  updateThemeBtns(theme);
  
  $all('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.body.setAttribute('data-theme', btn.dataset.theme);
      store.set('theme', btn.dataset.theme);
      updateThemeBtns(btn.dataset.theme);
    });
  });
}

function updateThemeBtns(active) {
  $all('.theme-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.theme === active));
}

// ========================================
// Tab Cloak
// ========================================
function initCloak() {
  const cloak = store.get('cloak') || 'default';
  applyCloak(cloak);
  
  $all('.cloak-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      applyCloak(btn.dataset.cloak);
      store.set('cloak', btn.dataset.cloak);
      $all('.cloak-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
}

function applyCloak(cloak) {
  const c = cloakConfig[cloak];
  if (c) {
    document.title = c.title;
    const link = document.createElement('link');
    link.id = 'favicon';
    link.rel = 'icon';
    link.href = c.favicon;
    document.head.appendChild(link);
  }
}

// ========================================
// Settings
// ========================================
function initSettings() {
  // FPS Booster
  const fps = store.get('fpsBooster') !== 'false';
  $('toggleFpsBooster').classList.toggle('on', fps);
  document.body.classList.toggle('fps-boost-mode', fps);
  $('toggleFpsBooster').onclick = () => {
    const on = $('toggleFpsBooster').classList.toggle('on');
    document.body.classList.toggle('fps-boost-mode', on);
    store.set('fpsBooster', on);
  };

  // Stats
  const stats = store.get('showStats') === 'true';
  $('toggleStats').classList.toggle('on', stats);
  $('statsOverlay').classList.toggle('visible', stats);
  $('toggleStats').onclick = () => {
    const on = $('toggleStats').classList.toggle('on');
    $('statsOverlay').classList.toggle('visible', on);
    store.set('showStats', on);
  };

  // Blur
  const blur = store.get('blur') !== 'false';
  $('toggleBlur').classList.toggle('on', blur);
  document.body.setAttribute('data-blur', blur ? 'true' : 'false');
  $('toggleBlur').onclick = () => {
    const on = $('toggleBlur').classList.toggle('on');
    document.body.setAttribute('data-blur', on ? 'true' : 'false');
    store.set('blur', on);
  };

  // Bypass buttons
  $('aboutBlankBtn').onclick = () => {
    const win = window.open('about:blank', '_blank');
    if (win) {
      win.document.write(`<!DOCTYPE html><html><head><title>Classroom</title></head><body style="margin:0"><iframe src="${location.href}" style="width:100%;height:100vh;border:none"></iframe></body></html>`);
      win.document.close();
    }
  };

  $('panicBtn').onclick = triggerPanic;

  // Modals
  $('embedClose').onclick = () => $('embedModal').classList.remove('active');
  $('creditsClose').onclick = () => $('creditsModal').classList.remove('active');
  $('legalClose').onclick = () => $('legalModal').classList.remove('active');

  $('copyEmbedBtn').onclick = () => {
    navigator.clipboard.writeText($('embedCode').value);
    $('copyEmbedBtn').textContent = 'Copied!';
    setTimeout(() => $('copyEmbedBtn').textContent = 'Copy to Clipboard', 1500);
  };

  $all('.legal-tab').forEach(tab => {
    tab.onclick = () => {
      $all('.legal-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      $('tosContent').style.display = tab.dataset.tab === 'tos' ? 'block' : 'none';
      $('privacyContent').style.display = tab.dataset.tab === 'privacy' ? 'block' : 'none';
    };
  });
}

// ========================================
// Panic
// ========================================
function triggerPanic() {
  $('panicOverlay').classList.add('active');
  setTimeout(() => location.href = 'https://classroom.google.com', 800);
}

// ========================================
// Games
// ========================================
function initGames() {
  renderGames();

  $('gamesSearchInput').oninput = (e) => {
    const q = e.target.value.toLowerCase();
    $all('.game-card').forEach(card => {
      card.style.display = card.querySelector('p').textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  };

  $('firstGamesBtn').onclick = () => {
    $('gamesMenu').style.display = 'none';
    $('gamesHeader').style.display = 'flex';
    $('gamesIframeContainer').style.display = 'block';
    $('gamesBack').style.display = 'flex';
    $('gamesReload').style.display = 'flex';
    $('gamesIframe').src = 'https://tight-breeze-9313.brayyy316.workers.dev/';
  };

  $('secondGamesBtn').onclick = () => {
    $('gamesMenu').style.display = 'none';
    $('secondGamesContainer').style.display = 'block';
    $('gamesHeader').style.display = 'flex';
    $('gamesBack').style.display = 'flex';
  };

  $('gamePlayerBack').onclick = () => {
    $('gamePlayerView').classList.remove('active');
    $('secondGamesContainer').style.display = 'block';
    $('gamePlayerIframe').src = '';
  };

  $('gamePlayerReload').onclick = () => $('gamePlayerIframe').src = $('gamePlayerIframe').src;

  $('gamePlayerEmbed').onclick = () => {
    $('embedModal').classList.add('active');
    $('embedCode').value = `<iframe src="${GAME_BASE}/${currentGameUrl}/" width="100%" height="600" frameborder="0" allowfullscreen></iframe>`;
  };

  $('gamePlayerIframe').onload = () => setTimeout(() => $('gamePlayerLoading').classList.add('hidden'), 500);

  $('gamesBack').onclick = () => {
    $('gamesIframeContainer').style.display = 'none';
    $('secondGamesContainer').style.display = 'none';
    $('gamesHeader').style.display = 'none';
    $('gamesMenu').style.display = 'flex';
    $('gamesBack').style.display = 'none';
    $('gamesReload').style.display = 'none';
    $('gamesIframe').src = '';
  };

  $('gamesReload').onclick = () => $('gamesIframe').src = $('gamesIframe').src;
}

function renderGames() {
  $('gamesGrid').innerHTML = gamesData.map(g => `
    <div class="game-card" data-url="${g.url}" data-name="${g.name}">
      <img src="${GAME_BASE}/${g.url}/${g.image}" alt="${g.name}" loading="lazy" onerror="this.style.display='none'">
      <p>${g.name}</p>
    </div>
  `).join('');

  $all('.game-card').forEach(card => {
    card.onclick = () => {
      currentGameUrl = card.dataset.url;
      $('gamePlayerTitle').textContent = card.dataset.name;
      $('secondGamesContainer').style.display = 'none';
      $('gamePlayerView').classList.add('active');
      $('gamePlayerLoading').classList.remove('hidden');
      $('gamePlayerIframe').src = `${GAME_BASE}/${currentGameUrl}/`;
    };
  });
}

// ========================================
// Navigation
// ========================================
function initNav() {
  function show(page) {
    $('homePage').style.display = 'none';
    $('gamesPage').classList.remove('active');
    $('moviesPage').classList.remove('active');
    $('partnersPage').classList.remove('active');
    $('settingsPage').classList.remove('active');
    $all('.nav-link').forEach(l => l.classList.remove('active'));

    if (page === 'home') { 
      $('homePage').style.display = 'flex'; 
      $('homeLink').classList.add('active'); 
    }
    else if (page === 'games') {
      $('gamesPage').classList.add('active');
      $('gamesLink').classList.add('active');
      $('gamesMenu').style.display = 'flex';
      $('gamesHeader').style.display = 'none';
      $('gamesIframeContainer').style.display = 'none';
      $('secondGamesContainer').style.display = 'none';
      $('gamePlayerView').classList.remove('active');
    }
    else if (page === 'movies') { 
      $('moviesPage').classList.add('active'); 
      $('moviesLink').classList.add('active'); 
      $('moviesIframe').src = 'https://www.fmovies.gd/home'; 
    }
    else if (page === 'partners') { 
      $('partnersPage').classList.add('active'); 
      $('partnersLink').classList.add('active'); 
    }
    else if (page === 'settings') { 
      $('settingsPage').classList.add('active'); 
    }
  }

  $('homeLink').onclick = () => show('home');
  $('gamesLink').onclick = () => show('games');
  $('moviesLink').onclick = () => show('movies');
  $('partnersLink').onclick = () => show('partners');
  $('settingsLink').onclick = () => show('settings');

  $('gamesHome').onclick = () => show('home');
  $('moviesHome').onclick = () => show('home');
  $('partnersBack').onclick = () => show('home');
  $('settingsBack').onclick = () => show('home');

  $('creditsLink').onclick = () => $('creditsModal').classList.add('active');
  $('legalLink').onclick = () => $('legalModal').classList.add('active');

  $('sidebarCloseBtn').onclick = () => { 
    $('sidebar').classList.add('collapsed'); 
    $('sidebarOpenBtn').classList.add('visible'); 
    $('mainWrapper').classList.add('expanded'); 
  };
  
  $('sidebarOpenBtn').onclick = () => { 
    $('sidebar').classList.remove('collapsed'); 
    $('sidebarOpenBtn').classList.remove('visible'); 
    $('mainWrapper').classList.remove('expanded'); 
  };

  if (window.innerWidth <= 768) { 
    $('sidebar').classList.add('collapsed'); 
    $('sidebarOpenBtn').classList.add('visible'); 
    $('mainWrapper').classList.add('expanded'); 
  }
}

// ========================================
// Keyboard Shortcuts
// ========================================
function initKeys() {
  document.onkeydown = (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key.toLowerCase() === 'a') $('gamesLink').click();
    if (e.key.toLowerCase() === 'm') $('moviesLink').click();
    if (e.key.toLowerCase() === 'h') $('homeLink').click();
    if (e.key.toLowerCase() === 'p') triggerPanic();
  };
}

// ========================================
// Stats
// ========================================
function initStats() {
  let last = performance.now(), frames = 0;
  
  function fps() {
    frames++;
    const now = performance.now();
    if (now - last >= 1000) {
      const f = Math.round(frames * 1000 / (now - last));
      $('fpsValue').textContent = f;
      $('fpsValue').className = 'stat-value ' + (f >= 50 ? 'good' : f >= 30 ? 'warn' : 'bad');
      frames = 0;
      last = now;
    }
    requestAnimationFrame(fps);
  }
  requestAnimationFrame(fps);

  setInterval(() => {
    const start = Date.now();
    fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-store' })
      .then(() => {
        const ping = Date.now() - start;
        $('pingValue').textContent = ping + 'ms';
        $('pingValue').className = 'stat-value ' + (ping < 100 ? 'good' : ping < 300 ? 'warn' : 'bad');
      }).catch(() => $('pingValue').textContent = '--');
  }, 5000);

  if (navigator.getBattery) {
    navigator.getBattery().then(b => {
      function bat() {
        const l = Math.round(b.level * 100);
        $('batteryValue').textContent = l + '%';
        $('batteryValue').className = 'stat-value ' + (l > 20 ? 'good' : 'bad');
      }
      bat();
      b.addEventListener('levelchange', bat);
    });
  }
}

// ========================================
// Time Update
// ========================================
function updateTime() {
  const now = new Date();
  $('time').textContent = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  $('date').textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
}

// ========================================
// Pointer Lock
// ========================================
document.addEventListener('pointerlockchange', () => $('pointerLockHint').classList.toggle('visible', !!document.pointerLockElement));
