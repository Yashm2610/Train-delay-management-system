/* quick-add.js — Handlers for quick data entry forms */

async function openAddTrainModal(onSuccess) {
  const bodyHtml = `
    <div class="form-group">
      <label class="form-label">Train Number</label>
      <input type="text" id="qm-tnum" class="form-control" placeholder="e.g., 12951">
    </div>
    <div class="form-group">
      <label class="form-label">Train Name</label>
      <input type="text" id="qm-tname" class="form-control" placeholder="e.g., Mumbai Rajdhani">
    </div>
    <div class="form-group">
      <label class="form-label">Source Station Code</label>
      <input type="text" id="qm-tsrc" class="form-control" placeholder="e.g., NDLS">
    </div>
    <div class="form-group">
      <label class="form-label">Destination Station Code</label>
      <input type="text" id="qm-tdest" class="form-control" placeholder="e.g., MMCT">
    </div>
    <div class="form-group">
      <label class="form-label">Total Stations</label>
      <input type="number" id="qm-ttotal" class="form-control" value="1">
    </div>
  `;

  showQuickModal('➕ Add New Train', bodyHtml, async () => {
    const data = {
      train_num: document.getElementById('qm-tnum').value,
      train_name: document.getElementById('qm-tname').value,
      source_station: document.getElementById('qm-tsrc').value,
      destination_station: document.getElementById('qm-tdest').value,
      total_stations: document.getElementById('qm-ttotal').value
    };

    if (!data.train_num || !data.train_name) throw new Error('Train number and name are required');

    const res = await api.post('/trains', data);
    showToast(res.message, 'success');
    if (onSuccess) onSuccess();
  });
}

async function openAddDelayModal(onSuccess) {
  const bodyHtml = `
    <div class="form-group">
      <label class="form-label">Train Number</label>
      <input type="text" id="qm-dtnum" class="form-control" placeholder="e.g., 12951">
    </div>
    <div class="form-group">
      <label class="form-label">Station Code</label>
      <input type="text" id="qm-dscode" class="form-control" placeholder="e.g., ADI">
    </div>
    <div class="form-group">
      <label class="form-label">Average Delay (minutes)</label>
      <input type="number" id="qm-ddelay" class="form-control" value="0">
    </div>
  `;

  showQuickModal('⏱️ Add Delay Statistic', bodyHtml, async () => {
    const data = {
      train_num: document.getElementById('qm-dtnum').value,
      station_code: document.getElementById('qm-dscode').value,
      average_delay_minutes: document.getElementById('qm-ddelay').value
    };

    if (!data.train_num || !data.station_code) throw new Error('Train number and station code are required');

    const res = await api.post('/delay-stats', data);
    showToast(res.message, 'success');
    if (onSuccess) onSuccess();
  });
}
