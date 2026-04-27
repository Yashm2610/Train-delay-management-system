/* admin.js — Admin CRUD operations */

let currentTab = 'trains';
let editingId = null;

(async () => {
  const auth = await getAuthStatus();
  if (!auth.loggedIn || (auth.user.role !== 'Admin' && auth.user.role !== 'Station Manager')) {
    window.location.href = 'index.html';
    return;
  }
  await renderSidebar();
  loadTabData();
})();

function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.admin-tab').forEach(t => t.style.display = 'none');
  document.getElementById(`tab-${tab}`).style.display = 'block';
  document.querySelectorAll('.active-tab').forEach(b => b.classList.remove('active-tab'));
  event.target.classList.add('active-tab');
  loadTabData();
}

async function loadTabData() {
  const table = document.getElementById(`table-${currentTab}`);
  table.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px"><div class="loading-spinner"></div></td></tr>';

  try {
    if (currentTab === 'trains') {
      const data = await api.get('/trains');
      table.innerHTML = `<thead><tr><th>Num</th><th>Name</th><th>Source</th><th>Dest</th><th>Actions</th></tr></thead>
        <tbody>${data.map(t => `<tr><td><span class="train-badge">${t.train_num}</span></td><td>${t.train_name}</td><td>${t.source_station}</td><td>${t.destination_station}</td>
        <td><button class="btn btn-sm btn-secondary" onclick="openModal('train','${t.train_num}')">Edit</button> <button class="btn btn-sm btn-danger" onclick="deleteItem('train','${t.train_num}')">Del</button></td></tr>`).join('')}</tbody>`;
    } else if (currentTab === 'stations') {
      const data = await api.get('/stations');
      table.innerHTML = `<thead><tr><th>Code</th><th>Name</th><th>City</th><th>State</th><th>Actions</th></tr></thead>
        <tbody>${data.map(s => `<tr><td><span class="station-badge">${s.station_code}</span></td><td>${s.station_name}</td><td>${s.city}</td><td>${s.state}</td>
        <td><button class="btn btn-sm btn-secondary" onclick="openModal('station','${s.station_code}')">Edit</button> <button class="btn btn-sm btn-danger" onclick="deleteItem('station','${s.station_code}')">Del</button></td></tr>`).join('')}</tbody>`;
    } else if (currentTab === 'delays') {
      const data = await api.get('/delay-stats');
      table.innerHTML = `<thead><tr><th>Train</th><th>Station</th><th>Avg Delay</th><th>Actions</th></tr></thead>
        <tbody>${data.map(d => `<tr><td>${d.train_name}</td><td>${d.station_name}</td><td><span class="delay-pill ${delayClass(d.average_delay_minutes)}">${d.average_delay_minutes} min</span></td>
        <td><button class="btn btn-sm btn-secondary" onclick="openModal('delay','${d.stat_id}')">Edit</button> <button class="btn btn-sm btn-danger" onclick="deleteItem('delay','${d.stat_id}')">Del</button></td></tr>`).join('')}</tbody>`;
    } else if (currentTab === 'perf') {
      const data = await api.get('/delay-percentage');
      table.innerHTML = `<thead><tr><th>Train</th><th>Station</th><th>On-Time</th><th>Heavy Delay</th><th>Actions</th></tr></thead>
        <tbody>${data.map(p => `<tr><td>${p.train_name}</td><td>${p.station_name}</td><td>${p.pct_right_time}%</td><td>${p.pct_significant_delay}%</td>
        <td><button class="btn btn-sm btn-secondary" onclick="openModal('perf','${p.pct_id}')">Edit</button> <button class="btn btn-sm btn-danger" onclick="deleteItem('perf','${p.pct_id}')">Del</button></td></tr>`).join('')}</tbody>`;
    } else if (currentTab === 'logs') {
      const data = await api.get('/update-log');
      table.innerHTML = `<thead><tr><th>Train</th><th>Time</th><th>Actions</th></tr></thead>
        <tbody>${data.map(l => `<tr><td>${l.train_name} (${l.train_num})</td><td>${formatDT(l.scraped_at)}</td>
        <td><button class="btn btn-sm btn-danger" onclick="deleteItem('log','${l.log_id}')">Del</button></td></tr>`).join('')}</tbody>`;
    }
  } catch(e) { showToast(e.message, 'error'); }
}

async function openModal(type, id = null) {
  editingId = id;
  const overlay = document.getElementById('modal-overlay');
  const body = document.getElementById('modal-body');
  const title = document.getElementById('modal-title');
  title.textContent = (id ? 'Edit ' : 'Add ') + type.charAt(0).toUpperCase() + type.slice(1);
  
  let formHtml = '';
  if (type === 'train') {
    const d = id ? await api.get(`/trains/${id}`) : {};
    formHtml = `<div class="form-group"><label class="form-label">Train Num</label><input type="text" id="f-num" class="form-control" value="${d.train_num||''}" ${id?'disabled':''}></div>
                <div class="form-group"><label class="form-label">Train Name</label><input type="text" id="f-name" class="form-control" value="${d.train_name||''}"></div>
                <div class="form-group"><label class="form-label">Source Station</label><input type="text" id="f-src" class="form-control" value="${d.source_station||''}"></div>
                <div class="form-group"><label class="form-label">Dest Station</label><input type="text" id="f-dest" class="form-control" value="${d.destination_station||''}"></div>
                <div class="form-group"><label class="form-label">Total Stations</label><input type="number" id="f-total" class="form-control" value="${d.total_stations||1}"></div>`;
  } else if (type === 'station') {
    const d = id ? await api.get(`/stations/${id}`) : {};
    formHtml = `<div class="form-group"><label class="form-label">Station Code</label><input type="text" id="f-code" class="form-control" value="${d.station_code||''}" ${id?'disabled':''}></div>
                <div class="form-group"><label class="form-label">Name</label><input type="text" id="f-name" class="form-control" value="${d.station_name||''}"></div>
                <div class="form-group"><label class="form-label">City</label><input type="text" id="f-city" class="form-control" value="${d.city||''}"></div>
                <div class="form-group"><label class="form-label">State</label><input type="text" id="f-state" class="form-control" value="${d.state||''}"></div>`;
  } else if (type === 'delay') {
    const d = id ? (await api.get('/delay-stats')).find(x => x.stat_id == id) : {};
    formHtml = `<div class="form-group"><label class="form-label">Train Num</label><input type="text" id="f-tnum" class="form-control" value="${d.train_num||''}" ${id?'disabled':''}></div>
                <div class="form-group"><label class="form-label">Station Code</label><input type="text" id="f-scode" class="form-control" value="${d.station_code||''}" ${id?'disabled':''}></div>
                <div class="form-group"><label class="form-label">Avg Delay (min)</label><input type="number" id="f-delay" class="form-control" value="${d.average_delay_minutes||0}"></div>`;
  }

  body.innerHTML = formHtml;
  overlay.classList.add('active');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  editingId = null;
}

async function saveForm() {
  try {
    const type = currentTab;
    let url = type === 'delays' ? '/delay-stats' : type === 'perf' ? '/delay-percentage' : '/' + type;
    let method = editingId ? 'put' : 'post';
    let data = {};

    if (type === 'trains') {
      data = { train_num: document.getElementById('f-num').value, train_name: document.getElementById('f-name').value, source_station: document.getElementById('f-src').value, destination_station: document.getElementById('f-dest').value, total_stations: document.getElementById('f-total').value };
      if (editingId) url += '/' + editingId;
    } else if (type === 'stations') {
      data = { station_code: document.getElementById('f-code').value, station_name: document.getElementById('f-name').value, city: document.getElementById('f-city').value, state: document.getElementById('f-state').value };
      if (editingId) url += '/' + editingId;
    } else if (type === 'delays') {
      data = { train_num: document.getElementById('f-tnum').value, station_code: document.getElementById('f-scode').value, average_delay_minutes: document.getElementById('f-delay').value };
      if (editingId) url += '/' + editingId;
    }

    const res = await api[method](url, data);
    showToast(res.message, 'success');
    closeModal();
    loadTabData();
  } catch(e) { showToast(e.message, 'error'); }
}

async function deleteItem(type, id) {
  if (!confirm('Are you sure you want to delete this item?')) return;
  try {
    let url = type === 'train' ? '/trains' : type === 'station' ? '/stations' : type === 'delay' ? '/delay-stats' : type === 'perf' ? '/delay-percentage' : '/update-log';
    const res = await api.del(`${url}/${id}`);
    showToast(res.message, 'success');
    loadTabData();
  } catch(e) { showToast(e.message, 'error'); }
}
