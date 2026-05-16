const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// ========= TOAST =========
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  setTimeout(() => { t.className = 'toast'; }, 3500);
}

// ========= ROUTER =========
const pages = {
  dashboard: renderDashboard,
  donors: renderDonors,
  register: renderRegister,
  requests: renderRequests,
  'new-request': renderNewRequest,
  stock: renderStock,
  search: renderSearch,
  history: renderHistory
};

const titles = {
  dashboard: 'Dashboard',
  donors: 'Donor Registry',
  register: 'Register New Donor',
  requests: 'Blood Requests',
  'new-request': 'Submit Blood Request',
  stock: 'Blood Stock Management',
  search: 'Search Donors',
  history: 'Donation History'
};

let currentPage = 'dashboard';

function navigate(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  document.getElementById('pageTitle').textContent = titles[page] || page;
  document.getElementById('content').innerHTML = '<div class="loading">Loading...</div>';
  pages[page]();

  // Close sidebar on mobile
  document.getElementById('sidebar').classList.remove('open');
  document.querySelector('.overlay')?.classList.remove('show');
}

document.querySelectorAll('.nav-item').forEach(el => {
  el.addEventListener('click', e => {
    e.preventDefault();
    navigate(el.dataset.page);
  });
});

// Mobile menu
const menuBtn = document.getElementById('menuBtn');
const sidebar = document.getElementById('sidebar');

const overlay = document.createElement('div');
overlay.className = 'overlay';
document.body.appendChild(overlay);

menuBtn.addEventListener('click', () => {
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
});
overlay.addEventListener('click', () => {
  sidebar.classList.remove('open');
  overlay.classList.remove('show');
});

// ========= HELPERS =========
function bloodGroupOptions(selected = '') {
  return BLOOD_GROUPS.map(g =>
    `<option value="${g}" ${g === selected ? 'selected' : ''}>${g}</option>`
  ).join('');
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

// ========= DASHBOARD =========
async function renderDashboard() {
  const res = await api.get('/admin/stats');
  if (!res.success) {
    document.getElementById('content').innerHTML = `<p style="color:red">Failed to load stats.</p>`;
    return;
  }
  const { overview, stock, recentDonors, recentRequests } = res.data;

  document.getElementById('content').innerHTML = `
    <div class="stats-grid">
      <div class="stat-card red">
        <div class="stat-label">Total Donors</div>
        <div class="stat-value">${overview.totalDonors}</div>
        <div class="stat-sub">${overview.availableDonors} available now</div>
      </div>
      <div class="stat-card orange">
        <div class="stat-label">Pending Requests</div>
        <div class="stat-value">${overview.pendingRequests}</div>
        <div class="stat-sub">${overview.criticalRequests} critical</div>
      </div>
      <div class="stat-card green">
        <div class="stat-label">Fulfilled Requests</div>
        <div class="stat-value">${overview.fulfilledRequests}</div>
        <div class="stat-sub">Lives saved</div>
      </div>
      <div class="stat-card dark">
        <div class="stat-label">Blood Groups Tracked</div>
        <div class="stat-value">8</div>
        <div class="stat-sub">All groups monitored</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="card">
        <div class="card-header">
          <div class="card-title">Blood Stock Overview</div>
          <button class="btn btn-outline btn-sm" onclick="navigate('stock')">Manage →</button>
        </div>
        <div class="stock-grid">
          ${stock.map(s => {
            const pct = Math.min((s.unitsAvailable / 20) * 100, 100);
            const cls = s.unitsAvailable === 0 ? 'critical' : s.unitsAvailable < 5 ? 'low' : 'good';
            return `
              <div class="stock-item">
                <div class="stock-group">${s.bloodGroup}</div>
                <div class="stock-units">${s.unitsAvailable}</div>
                <div class="stock-label">units</div>
                <div class="stock-bar-wrap"><div class="stock-bar ${cls}" style="width:${pct}%"></div></div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="card-title">Recent Requests</div>
          <button class="btn btn-outline btn-sm" onclick="navigate('requests')">View all →</button>
        </div>
        <ul class="recent-list">
          ${recentRequests.length === 0
            ? `<li class="recent-item"><span style="color:var(--text-muted)">No requests yet</span></li>`
            : recentRequests.map(r => `
              <li class="recent-item">
                <div class="recent-item-left">
                  <div class="recent-avatar">${r.bloodGroup}</div>
                  <div>
                    <div style="font-weight:500">${r.patientName}</div>
                    <div style="font-size:12px;color:var(--text-muted)">${r.hospital}</div>
                  </div>
                </div>
                <span class="badge ${r.urgency === 'Critical' ? 'badge-red' : r.urgency === 'Urgent' ? 'badge-orange' : 'badge-gray'}">
                  ${r.urgency}
                </span>
              </li>
            `).join('')}
        </ul>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-title">Recent Donors</div>
        <button class="btn btn-outline btn-sm" onclick="navigate('donors')">View all →</button>
      </div>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Donor</th><th>Blood Group</th><th>City</th><th>Phone</th><th>Registered</th><th>Status</th></tr>
          </thead>
          <tbody>
            ${recentDonors.length === 0
              ? `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px">No donors yet</td></tr>`
              : recentDonors.map(d => `
                <tr>
                  <td><div style="display:flex;align-items:center;gap:10px">
                    <div class="recent-avatar">${initials(d.name)}</div>
                    <span>${d.name}</span>
                  </div></td>
                  <td><span class="bg-badge">${d.bloodGroup}</span></td>
                  <td>${d.city}</td>
                  <td>${d.phone}</td>
                  <td>${formatDate(d.createdAt)}</td>
                  <td><span class="badge ${d.isAvailable ? 'badge-green' : 'badge-gray'}">${d.isAvailable ? 'Available' : 'Unavailable'}</span></td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ========= DONORS =========
async function renderDonors() {
  const res = await api.get('/donors');
  const donors = res.success ? res.data : [];

  document.getElementById('content').innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">All Donors (${donors.length})</div>
        <button class="btn btn-primary btn-sm" onclick="navigate('register')">+ Add Donor</button>
      </div>
      <div class="search-bar">
        <input type="text" id="donorSearch" placeholder="Search by name or city..." oninput="filterDonors()">
        <select id="donorBGFilter" onchange="filterDonors()">
          <option value="">All Blood Groups</option>
          ${bloodGroupOptions()}
        </select>
        <select id="donorAvailFilter" onchange="filterDonors()">
          <option value="">All Status</option>
          <option value="true">Available</option>
          <option value="false">Unavailable</option>
        </select>
      </div>
      <div class="table-wrap" id="donorsTable">
        ${renderDonorsTable(donors)}
      </div>
    </div>
  `;
  window._allDonors = donors;
}

function renderDonorsTable(donors) {
  if (donors.length === 0) return `
    <div class="empty-state">
      <div class="empty-icon">♥</div>
      <p>No donors found</p>
    </div>`;
  return `
    <table>
      <thead>
        <tr><th>Name</th><th>Blood Group</th><th>Age</th><th>City</th><th>Phone</th><th>Donations</th><th>Status</th><th>Actions</th></tr>
      </thead>
      <tbody>
        ${donors.map(d => `
          <tr>
            <td><div style="display:flex;align-items:center;gap:10px">
              <div class="recent-avatar">${initials(d.name)}</div>
              <div>
                <div style="font-weight:500">${d.name}</div>
                <div style="font-size:12px;color:var(--text-muted)">${d.email}</div>
              </div>
            </div></td>
            <td><span class="bg-badge">${d.bloodGroup}</span></td>
            <td>${d.age}</td>
            <td>${d.city}</td>
            <td>${d.phone}</td>
            <td>${d.totalDonations}</td>
            <td><span class="badge ${d.isAvailable ? 'badge-green' : 'badge-gray'}">${d.isAvailable ? 'Available' : 'Unavailable'}</span></td>
            <td>
              <div style="display:flex;gap:6px">
                <button class="btn btn-success btn-sm" onclick="markDonation('${d._id}')">Donated</button>
                <button class="btn btn-danger btn-sm" onclick="deleteDonor('${d._id}')">Delete</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

function filterDonors() {
  const q = document.getElementById('donorSearch').value.toLowerCase();
  const bg = document.getElementById('donorBGFilter').value;
  const avail = document.getElementById('donorAvailFilter').value;

  let filtered = window._allDonors.filter(d => {
    const matchText = d.name.toLowerCase().includes(q) || d.city.toLowerCase().includes(q);
    const matchBG = !bg || d.bloodGroup === bg;
    const matchAvail = avail === '' || String(d.isAvailable) === avail;
    return matchText && matchBG && matchAvail;
  });
  document.getElementById('donorsTable').innerHTML = renderDonorsTable(filtered);
}

async function markDonation(id) {
  if (!confirm('Mark this donor as donated?')) return;
  const res = await api.patch(`/donors/${id}/donate`);
  if (res.success) { showToast('Donation recorded!'); renderDonors(); }
  else showToast(res.message, 'error');
}

async function deleteDonor(id) {
  if (!confirm('Remove this donor?')) return;
  const res = await api.delete(`/donors/${id}`);
  if (res.success) { showToast('Donor removed'); renderDonors(); }
  else showToast(res.message, 'error');
}

// ========= REGISTER DONOR =========
function renderRegister() {
  document.getElementById('content').innerHTML = `
    <div class="card" style="max-width:700px">
      <div class="card-header">
        <div class="card-title">Donor Registration Form</div>
      </div>
      <form id="donorForm" onsubmit="submitDonor(event)">
        <div class="form-grid">
          <div class="form-group">
            <label>Full Name *</label>
            <input type="text" name="name" placeholder="e.g. Ramesh Kumar" required>
          </div>
          <div class="form-group">
            <label>Age *</label>
            <input type="number" name="age" min="18" max="65" placeholder="18–65" required>
          </div>
          <div class="form-group">
            <label>Blood Group *</label>
            <select name="bloodGroup" required>
              <option value="">Select blood group</option>
              ${bloodGroupOptions()}
            </select>
          </div>
          <div class="form-group">
            <label>Phone Number *</label>
            <input type="tel" name="phone" placeholder="10-digit number" maxlength="10" required>
          </div>
          <div class="form-group">
            <label>Email Address *</label>
            <input type="email" name="email" placeholder="donor@email.com" required>
          </div>
          <div class="form-group">
            <label>City *</label>
            <input type="text" name="city" placeholder="e.g. Chennai" required>
          </div>
          <div class="form-group full">
            <label>Full Address</label>
            <textarea name="address" placeholder="Street, Area, City..."></textarea>
          </div>
        </div>
        <div style="margin-top:20px;display:flex;gap:12px">
          <button type="submit" class="btn btn-primary">Register Donor</button>
          <button type="reset" class="btn btn-outline">Clear Form</button>
        </div>
      </form>
    </div>
  `;
}

async function submitDonor(e) {
  e.preventDefault();
  const form = document.getElementById('donorForm');
  const data = Object.fromEntries(new FormData(form));
  data.age = parseInt(data.age);

  const res = await api.post('/donors', data);
  if (res.success) {
    showToast('Donor registered successfully! 🎉');
    form.reset();
  } else {
    showToast(res.message, 'error');
  }
}

// ========= BLOOD REQUESTS =========
async function renderRequests() {
  const res = await api.get('/requests');
  const requests = res.success ? res.data : [];

  document.getElementById('content').innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Blood Requests (${requests.length})</div>
        <button class="btn btn-primary btn-sm" onclick="navigate('new-request')">+ New Request</button>
      </div>
      <div class="search-bar">
        <select id="reqStatusFilter" onchange="filterRequests()">
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Fulfilled">Fulfilled</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <select id="reqUrgencyFilter" onchange="filterRequests()">
          <option value="">All Urgency</option>
          <option value="Critical">Critical</option>
          <option value="Urgent">Urgent</option>
          <option value="Normal">Normal</option>
        </select>
        <select id="reqBGFilter" onchange="filterRequests()">
          <option value="">All Blood Groups</option>
          ${bloodGroupOptions()}
        </select>
      </div>
      <div class="table-wrap" id="requestsTable">
        ${renderRequestsTable(requests)}
      </div>
    </div>
  `;
  window._allRequests = requests;
}

function renderRequestsTable(requests) {
  if (requests.length === 0) return `
    <div class="empty-state">
      <div class="empty-icon">⚡</div>
      <p>No blood requests found</p>
    </div>`;
  return `
    <table>
      <thead>
        <tr><th>Patient</th><th>Blood Group</th><th>Units</th><th>Hospital</th><th>Urgency</th><th>Status</th><th>Date</th><th>Actions</th></tr>
      </thead>
      <tbody>
        ${requests.map(r => `
          <tr>
            <td>
              <div style="font-weight:500">${r.patientName}</div>
              <div style="font-size:12px;color:var(--text-muted)">${r.contactNumber}</div>
            </td>
            <td><span class="bg-badge">${r.bloodGroup}</span></td>
            <td>${r.unitsRequired}</td>
            <td>${r.hospital}</td>
            <td><span class="urgency-${r.urgency.toLowerCase()}">${r.urgency}</span></td>
            <td><span class="badge ${r.status === 'Fulfilled' ? 'badge-green' : r.status === 'Pending' ? 'badge-orange' : 'badge-gray'}">${r.status}</span></td>
            <td>${formatDate(r.createdAt)}</td>
            <td>
              <div style="display:flex;gap:6px;flex-wrap:wrap">
                ${r.status === 'Pending' ? `<button class="btn btn-success btn-sm" onclick="updateRequest('${r._id}','Fulfilled')">Fulfill</button>` : ''}
                ${r.status === 'Pending' ? `<button class="btn btn-outline btn-sm" onclick="updateRequest('${r._id}','Cancelled')">Cancel</button>` : ''}
                <button class="btn btn-danger btn-sm" onclick="deleteRequest('${r._id}')">Del</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
}

function filterRequests() {
  const status = document.getElementById('reqStatusFilter').value;
  const urgency = document.getElementById('reqUrgencyFilter').value;
  const bg = document.getElementById('reqBGFilter').value;
  let filtered = window._allRequests.filter(r => {
    return (!status || r.status === status) &&
           (!urgency || r.urgency === urgency) &&
           (!bg || r.bloodGroup === bg);
  });
  document.getElementById('requestsTable').innerHTML = renderRequestsTable(filtered);
}

async function updateRequest(id, status) {
  const res = await api.patch(`/requests/${id}/status`, { status });
  if (res.success) { showToast(`Request marked as ${status}`); renderRequests(); }
  else showToast(res.message, 'error');
}

async function deleteRequest(id) {
  if (!confirm('Delete this request?')) return;
  const res = await api.delete(`/requests/${id}`);
  if (res.success) { showToast('Request deleted'); renderRequests(); }
  else showToast(res.message, 'error');
}

// ========= NEW REQUEST =========
function renderNewRequest() {
  document.getElementById('content').innerHTML = `
    <div class="card" style="max-width:700px">
      <div class="card-header">
        <div class="card-title">Submit Blood Request</div>
      </div>
      <form id="requestForm" onsubmit="submitRequest(event)">
        <div class="form-grid">
          <div class="form-group">
            <label>Patient Name *</label>
            <input type="text" name="patientName" placeholder="Full name" required>
          </div>
          <div class="form-group">
            <label>Blood Group Required *</label>
            <select name="bloodGroup" required>
              <option value="">Select blood group</option>
              ${bloodGroupOptions()}
            </select>
          </div>
          <div class="form-group">
            <label>Units Required *</label>
            <input type="number" name="unitsRequired" min="1" max="20" placeholder="e.g. 2" required>
          </div>
          <div class="form-group">
            <label>Contact Number *</label>
            <input type="tel" name="contactNumber" placeholder="10-digit number" maxlength="10" required>
          </div>
          <div class="form-group full">
            <label>Hospital Name *</label>
            <input type="text" name="hospital" placeholder="Hospital name and location" required>
          </div>
          <div class="form-group">
            <label>Urgency Level *</label>
            <select name="urgency">
              <option value="Normal">Normal</option>
              <option value="Urgent">Urgent</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div class="form-group full">
            <label>Additional Notes</label>
            <textarea name="notes" placeholder="Any additional information..."></textarea>
          </div>
        </div>
        <div style="margin-top:20px;display:flex;gap:12px">
          <button type="submit" class="btn btn-primary">Submit Request</button>
          <button type="reset" class="btn btn-outline">Clear</button>
        </div>
      </form>
    </div>
  `;
}

async function submitRequest(e) {
  e.preventDefault();
  const form = document.getElementById('requestForm');
  const data = Object.fromEntries(new FormData(form));
  data.unitsRequired = parseInt(data.unitsRequired);

  const res = await api.post('/requests', data);
  if (res.success) {
    showToast('Blood request submitted!');
    form.reset();
  } else {
    showToast(res.message, 'error');
  }
}

// ========= STOCK MANAGEMENT =========
async function renderStock() {
  const res = await api.get('/stock');
  const stock = res.success ? res.data : [];

  document.getElementById('content').innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Blood Stock Management</div>
        <div style="font-size:13px;color:var(--text-muted)">Update units available for each blood group</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px">
        ${stock.map(s => {
          const pct = Math.min((s.unitsAvailable / 20) * 100, 100);
          const cls = s.unitsAvailable === 0 ? 'critical' : s.unitsAvailable < 5 ? 'low' : 'good';
          return `
            <div class="card" style="padding:20px">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px">
                <span class="bg-badge" style="font-size:20px;padding:6px 16px">${s.bloodGroup}</span>
                <span class="badge ${s.unitsAvailable === 0 ? 'badge-red' : s.unitsAvailable < 5 ? 'badge-orange' : 'badge-green'}">
                  ${s.unitsAvailable === 0 ? 'Out of Stock' : s.unitsAvailable < 5 ? 'Low' : 'Adequate'}
                </span>
              </div>
              <div style="margin-bottom:12px">
                <div style="font-size:32px;font-family:'DM Serif Display',serif;font-weight:400">${s.unitsAvailable}</div>
                <div style="font-size:12px;color:var(--text-muted)">units available</div>
              </div>
              <div class="stock-bar-wrap" style="margin-bottom:16px">
                <div class="stock-bar ${cls}" style="width:${pct}%"></div>
              </div>
              <div style="display:flex;gap:8px;align-items:center">
                <input type="number" id="stock_${s.bloodGroup.replace('+','p').replace('-','m')}" 
                  value="${s.unitsAvailable}" min="0" max="999" style="width:80px">
                <button class="btn btn-primary btn-sm" onclick="updateStock('${s.bloodGroup}')">Update</button>
              </div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:8px">
                Last updated: ${formatDate(s.lastUpdated)}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

async function updateStock(bg) {
  const key = bg.replace('+', 'p').replace('-', 'm');
  const val = parseInt(document.getElementById(`stock_${key}`).value);
  if (isNaN(val) || val < 0) return showToast('Invalid units', 'error');
  const res = await api.put(`/stock/${encodeURIComponent(bg)}`, { unitsAvailable: val });
  if (res.success) showToast(`${bg} stock updated to ${val} units`);
  else showToast(res.message, 'error');
}

// ========= SEARCH =========
async function renderSearch() {
  document.getElementById('content').innerHTML = `
    <div class="card" style="max-width:700px;margin-bottom:20px">
      <div class="card-header">
        <div class="card-title">Find Blood Donors</div>
      </div>
      <div class="form-grid">
        <div class="form-group">
          <label>Blood Group</label>
          <select id="searchBG">
            <option value="">Any blood group</option>
            ${bloodGroupOptions()}
          </select>
        </div>
        <div class="form-group">
          <label>City</label>
          <input type="text" id="searchCity" placeholder="e.g. Bangalore">
        </div>
      </div>
      <div style="margin-top:16px;display:flex;gap:12px">
        <button class="btn btn-primary" onclick="doSearch()">Search Donors</button>
        <button class="btn btn-outline" onclick="clearSearch()">Clear</button>
      </div>
    </div>
    <div id="searchResults"></div>
  `;
}

async function doSearch() {
  const bg = document.getElementById('searchBG').value;
  const city = document.getElementById('searchCity').value;

  let url = '/donors?available=true';
  if (bg) url += `&bloodGroup=${encodeURIComponent(bg)}`;
  if (city) url += `&city=${encodeURIComponent(city)}`;

  document.getElementById('searchResults').innerHTML = '<div class="loading">Searching...</div>';
  const res = await api.get(url);
  const donors = res.success ? res.data : [];

  if (donors.length === 0) {
    document.getElementById('searchResults').innerHTML = `
      <div class="card">
        <div class="empty-state">
          <div class="empty-icon">🩸</div>
          <p>No available donors found for the selected criteria.</p>
        </div>
      </div>`;
    return;
  }

  document.getElementById('searchResults').innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="card-title">Found ${donors.length} Donor(s)</div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px">
        ${donors.map(d => `
          <div style="padding:16px;border:1px solid var(--border);border-radius:10px;background:var(--bg)">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px">
              <div class="recent-avatar" style="width:44px;height:44px;font-size:15px">${initials(d.name)}</div>
              <div>
                <div style="font-weight:500">${d.name}</div>
                <span class="bg-badge">${d.bloodGroup}</span>
              </div>
            </div>
            <div style="font-size:13px;color:var(--text-muted);display:grid;gap:6px">
              <div>📍 ${d.city}</div>
              <div>📞 ${d.phone}</div>
              <div>✉️ ${d.email}</div>
              <div>🩸 ${d.totalDonations} past donation(s)</div>
              ${d.lastDonated ? `<div>⏱ Last donated: ${formatDate(d.lastDonated)}</div>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function clearSearch() {
  document.getElementById('searchBG').value = '';
  document.getElementById('searchCity').value = '';
  document.getElementById('searchResults').innerHTML = '';
}

// ========= INIT =========
navigate('dashboard');

// ========= DONATION HISTORY =========
async function renderHistory() {
  document.getElementById('content').innerHTML = '<div class="loading">Loading History...</div>';
  const res = await api.get('/donors');
  const donors = res.success ? res.data : [];

  // Filter donors who have donated (totalDonations > 0 or lastDonated exists)
  // and sort by lastDonated descending. If lastDonated is missing but totalDonations > 0, 
  // we use createdAt or just skip.
  const historyDonors = donors
    .filter(d => d.totalDonations > 0 && d.lastDonated)
    .sort((a, b) => new Date(b.lastDonated) - new Date(a.lastDonated));

  if (historyDonors.length === 0) {
    document.getElementById('content').innerHTML = `
      <div class="card">
        <div class="card-header"><div class="card-title">Recent Donations</div></div>
        <div class="empty-state">
          <div class="empty-icon">◷</div>
          <p>No donation history found. Mark a donor as 'Donated' to see records here.</p>
        </div>
      </div>
    `;
    return;
  }

  document.getElementById('content').innerHTML = `
    <div class="card" style="max-width:800px; margin: 0 auto;">
      <div class="card-header">
        <div class="card-title">Recent Donations Log</div>
      </div>
      <div class="timeline">
        ${historyDonors.map(d => `
          <div class="timeline-item">
            <div class="timeline-date">${formatDate(d.lastDonated)}</div>
            <div class="timeline-content">
              <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <div style="display:flex; align-items:center; gap:16px;">
                  <div class="recent-avatar" style="width:48px; height:48px; font-size:16px;">${initials(d.name)}</div>
                  <div>
                    <div class="timeline-title">${d.name} donated blood</div>
                    <div style="font-size:14px; color:var(--text-muted);">
                      Registered City: ${d.city} &bull; Total Donations: ${d.totalDonations}
                    </div>
                  </div>
                </div>
                <div style="text-align:right;">
                  <span class="bg-badge" style="font-size:18px; padding:6px 16px;">${d.bloodGroup}</span>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
