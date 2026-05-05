/* api.js — Central API helper for all frontend pages */

const API_BASE = '/api';

const api = {
  async get(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`, { credentials: 'include' });
    if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
    return res.json();
  },
  async post(endpoint, data) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
    return res.json();
  },
  async put(endpoint, data) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      credentials: 'include'
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
    return res.json();
  },
  async del(endpoint) {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Request failed');
    return res.json();
  }
};

/* ── Toast notifications ── */
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(60px)'; toast.style.transition = 'all 0.3s'; setTimeout(() => toast.remove(), 300); }, 3500);
}

/* ── Auth state ── */
async function getAuthStatus() {
  try { return await api.get('/auth/status'); }
  catch { return { loggedIn: false }; }
}

/* ── Set active nav link ── */
function setActiveNav() {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ── Render shared sidebar ── */
async function renderSidebar(containerId = 'sidebar') {
  const auth = await getAuthStatus();
  const el = document.getElementById(containerId);
  if (!el) return;

  const role = auth.user ? auth.user.role : 'User';
  const isAdmin = role === 'Admin';
  const isManager = role === 'Station Manager' || isAdmin;

  el.innerHTML = `
    <div class="sidebar-logo">
      <div class="logo-icon">🚄</div>
      <div class="logo-text">Railway Pro<span>Management System</span></div>
    </div>
    <nav>
      <div class="nav-section">
        <div class="nav-section-label">Main Console</div>
        <a href="index.html"           class="nav-link" id="nav-home"><span class="icon">🏠</span> Home</a>
        <a href="dashboard.html"       class="nav-link" id="nav-dashboard"><span class="icon">📊</span> Dashboard</a>
      </div>
      <div class="nav-section">
        <div class="nav-section-label">Core Data</div>
        <a href="trains.html"          class="nav-link" id="nav-trains"><span class="icon">🚂</span> All Trains</a>
        <a href="stations.html"        class="nav-link" id="nav-stations"><span class="icon">🏢</span> Stations</a>
        <a href="delay_stats.html"     class="nav-link" id="nav-delay_stats"><span class="icon">⏱️</span> Delay Analytics</a>
        <a href="delay_percentage.html" class="nav-link" id="nav-delay_percentage"><span class="icon">📈</span> Performance</a>
        <a href="update_log.html"      class="nav-link" id="nav-update_log"><span class="icon">📋</span> System Logs</a>
      </div>
      ${isManager ? `
      <div class="nav-section">
        <div class="nav-section-label">Administration</div>
        <a href="admin.html" class="nav-link" id="nav-admin"><span class="icon">⚙️</span> Control Panel</a>
      </div>` : ''}
    </nav>
    <div class="sidebar-footer">
      ${auth.loggedIn
        ? `<div class="admin-badge">
             <div class="admin-dot"></div>
             <div style="overflow:hidden">
               <div style="font-weight:700;font-size:14px;color:var(--text-primary);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${auth.user.username}</div>
               <div style="font-size:11px;color:var(--text-muted)">${role}</div>
             </div>
           </div>
           <button class="btn-logout" onclick="handleLogout()">🔓 Sign Out</button>`
        : `<a href="login.html" class="btn btn-primary w-full" style="justify-content:center; margin-top:0">🔑 Admin Login</a>`
      }
    </div>
  `;
  setActiveNav();
}

async function handleLogout() {
  await api.post('/auth/logout', {});
  showToast('Logged out successfully', 'info');
  setTimeout(() => window.location.href = 'index.html', 800);
}

/* ── Delay severity helper ── */
function delayClass(minutes) {
  if (minutes <= 10) return 'delay-low';
  if (minutes <= 30) return 'delay-medium';
  return 'delay-high';
}

function getSeverityAlert(avgDelay) {
  if (avgDelay > 30) return { class: 'alert-high', message: '⚠️ High System Delay Detected: Average delay is over 30 minutes!' };
  if (avgDelay > 10) return { class: 'alert-medium', message: '⚡ Moderate Delay Warning: System experiencing average delays above 10 minutes.' };
  return { class: 'alert-low', message: '✅ System Status Normal: All operations within expected timeframes.' };
}

/* ── Shared Modal System ── */
function showQuickModal(title, bodyHtml, onSave) {
  let modal = document.getElementById('quick-modal-overlay');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quick-modal-overlay';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3 id="qm-title"></h3>
          <button class="modal-close" onclick="closeQuickModal()">×</button>
        </div>
        <div id="qm-body" style="padding:20px"></div>
        <div class="modal-footer">
          <button class="btn btn-secondary" onclick="closeQuickModal()">Cancel</button>
          <button class="btn btn-primary" id="qm-save-btn">Save Changes</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
  }
  
  document.getElementById('qm-title').textContent = title;
  document.getElementById('qm-body').innerHTML = bodyHtml;
  const saveBtn = document.getElementById('qm-save-btn');
  
  // Clone button to remove old listeners
  const newSaveBtn = saveBtn.cloneNode(true);
  saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
  
  newSaveBtn.onclick = async () => {
    newSaveBtn.disabled = true;
    newSaveBtn.innerHTML = '<div class="loading-spinner" style="width:16px;height:16px;border-width:2px"></div>';
    try {
      await onSave();
      closeQuickModal();
    } catch(e) { 
      showToast(e.message, 'error');
      newSaveBtn.disabled = false;
      newSaveBtn.textContent = 'Save Changes';
    }
  };
  
  modal.classList.add('active');
}

function closeQuickModal() {
  const modal = document.getElementById('quick-modal-overlay');
  if (modal) modal.classList.remove('active');
}

/* ── Format datetime ── */
function formatDT(dt) {
  return new Date(dt).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
