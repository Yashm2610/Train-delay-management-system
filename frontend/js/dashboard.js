/* dashboard.js — Analytics and Charting */

(async () => {
  await renderSidebar();
  
  try {
    const d = await api.get('/summary');
    renderStats(d);
    renderAlerts(d.avgDelay);
    
    // Fetch data for charts
    const trainData = await api.get('/delay-stats');
    const perfData  = await api.get('/delay-percentage');
    const logsData  = await api.get('/update-log');
    
    initCharts(trainData, perfData, logsData);
    
  } catch(e) {
    showToast('Failed to load dashboard: ' + e.message, 'error');
  }
})();

function renderStats(d) {
  animateCount('val-trains', d.totalTrains);
  animateCount('val-stations', d.totalStations);
  document.getElementById('val-avg').textContent = d.avgDelay || '0';
  document.getElementById('val-ontime').textContent = (d.punctuality || 0) + '%';
  document.getElementById('val-cancelled').textContent = (d.cancelled || 0) + '%';
  
  document.getElementById('val-worst-train').textContent = d.maxDelayTrain 
    ? `${d.maxDelayTrain.train_name} (${d.maxDelayTrain.avg_delay}m)`
    : 'None';
    
  document.getElementById('val-worst-station').textContent = d.maxDelayStation
    ? `${d.maxDelayStation.station_name} (${d.maxDelayStation.avg_delay}m)`
    : 'None';
}

function renderAlerts(avgDelay) {
  const alert = getSeverityAlert(avgDelay);
  document.getElementById('alert-container').innerHTML = `
    <div class="alert-banner ${alert.class}">
      <span>${alert.message}</span>
    </div>
  `;
}

function animateCount(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let cur = 0;
  const step = Math.ceil(target / 20) || 1;
  const t = setInterval(() => {
    cur = Math.min(cur + step, target);
    el.textContent = cur;
    if (cur >= target) clearInterval(t);
  }, 50);
}

function initCharts(trainData, perfData, logsData) {
  // 1. Train-wise Delay Chart
  new Chart(document.getElementById('chart-train-delay'), {
    type: 'bar',
    data: {
      labels: trainData.slice(0, 10).map(t => t.train_num),
      datasets: [{
        label: 'Avg Delay (min)',
        data: trainData.slice(0, 10).map(t => t.average_delay_minutes),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: '#3b82f6',
        borderWidth: 1
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  // 2. Station-wise Delay Chart (Top 10)
  const stationAgg = {};
  trainData.forEach(d => {
    if (!stationAgg[d.station_name]) stationAgg[d.station_name] = [];
    stationAgg[d.station_name].push(parseFloat(d.average_delay_minutes));
  });
  const stationLabels = Object.keys(stationAgg).slice(0, 10);
  const stationValues = stationLabels.map(s => {
    const vals = stationAgg[s];
    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1);
  });

  new Chart(document.getElementById('chart-station-delay'), {
    type: 'line',
    data: {
      labels: stationLabels,
      datasets: [{
        label: 'Station Avg Delay',
        data: stationValues,
        borderColor: '#8b5cf6',
        tension: 0.4,
        fill: true,
        backgroundColor: 'rgba(139, 92, 246, 0.1)'
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  // 3. Performance Pie Chart
  const avgPerf = {
    ontime: 0,
    slight: 0,
    heavy: 0,
    other: 0
  };
  if (perfData.length > 0) {
    perfData.forEach(p => {
      avgPerf.ontime += parseFloat(p.pct_right_time);
      avgPerf.slight += parseFloat(p.pct_slight_delay);
      avgPerf.heavy += parseFloat(p.pct_significant_delay);
      avgPerf.other += parseFloat(p.pct_cancelled_unknown);
    });
    const len = perfData.length;
    avgPerf.ontime /= len; avgPerf.slight /= len; avgPerf.heavy /= len; avgPerf.other /= len;
  }

  new Chart(document.getElementById('chart-performance'), {
    type: 'doughnut',
    data: {
      labels: ['On Time', 'Slight Delay', 'Significant', 'Cancelled/Other'],
      datasets: [{
        data: [avgPerf.ontime, avgPerf.slight, avgPerf.heavy, avgPerf.other],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#94a3b8']
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });

  // 4. Daily Logs Trend
  const logCounts = {};
  logsData.forEach(l => {
    const date = new Date(l.scraped_at).toLocaleDateString();
    logCounts[date] = (logCounts[date] || 0) + 1;
  });

  new Chart(document.getElementById('chart-logs'), {
    type: 'bar',
    data: {
      labels: Object.keys(logCounts),
      datasets: [{
        label: 'Updates Count',
        data: Object.values(logCounts),
        backgroundColor: 'rgba(16, 185, 129, 0.5)'
      }]
    },
    options: { responsive: true, maintainAspectRatio: false }
  });
}
