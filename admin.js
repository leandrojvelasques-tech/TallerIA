/**
 * CONFIGURACIÓN DEL SISTEMA
 * ------------------------------------------------------------------
 * SCRIPT_URL: Debe ser la misma URL configurada en app.js
 */
const SCRIPT_URL = '';
const ADMIN_PASSWORD = 'graduados2026';

document.addEventListener('DOMContentLoaded', () => {
  const loginView = document.getElementById('loginView');
  const dashboardView = document.getElementById('dashboardView');
  const loginForm = document.getElementById('loginForm');
  const passwordInput = document.getElementById('password');
  const logoutBtn = document.getElementById('logoutBtn');

  if (sessionStorage.getItem('admin_authenticated') === 'true') {
    showDashboard();
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const pass = passwordInput.value;

    if (pass === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_authenticated', 'true');
      document.getElementById('loginAlert').className = 'alert error hidden';
      passwordInput.value = '';
      showDashboard();
    } else {
      document.getElementById('loginAlert').className = 'alert error';
      passwordInput.focus();
    }
  });

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('admin_authenticated');
    dashboardView.classList.add('hidden');
    loginView.classList.remove('hidden');
  });

  function showDashboard() {
    loginView.classList.add('hidden');
    dashboardView.classList.remove('hidden');
    initDashboard();
  }
});

// Variables globales del dashboard
let allGuests = [];
let filteredGuests = [];
let isSimulation = false;

function initDashboard() {
  const searchInput = document.getElementById('searchInput');
  const filterMenu = document.getElementById('filterMenu');
  const filterEstado = document.getElementById('filterEstado');
  const exportCsvBtn = document.getElementById('exportCsvBtn');

  isSimulation = !SCRIPT_URL;
  document.getElementById('dataModeBadge').textContent = isSimulation ? 'Modo Simulador Local' : 'Conectado a Google Sheets';
  
  if (isSimulation) {
    document.getElementById('dataModeBadge').style.color = '#b45309';
    document.getElementById('dataModeBadge').style.borderColor = '#fde68a';
    document.getElementById('dataModeBadge').style.background = '#fffbeb';
  } else {
    document.getElementById('dataModeBadge').style.color = '#047481';
    document.getElementById('dataModeBadge').style.borderColor = '#b2f5ea';
    document.getElementById('dataModeBadge').style.background = '#e6fffa';
  }

  loadData();

  searchInput.addEventListener('input', applyFilters);
  filterMenu.addEventListener('change', applyFilters);
  filterEstado.addEventListener('change', applyFilters);

  exportCsvBtn.addEventListener('click', exportToCSV);
}

async function loadData() {
  showAdminAlert('Actualizando datos…', 'info');

  if (isSimulation) {
    setTimeout(() => {
      const localData = localStorage.getItem('cpce_guests');
      allGuests = localData ? JSON.parse(localData) : [];
      
      // Mapear los datos simulados por si hay campos faltantes
      allGuests = allGuests.map(g => ({
        timestamp: g.timestamp || new Date().toISOString(),
        nombre: g.nombre || 'Sin nombre',
        telefono: g.telefono || '-',
        email: g.email || '-',
        menu: g.menu || 'Tradicional',
        presente: g.presente || 'No',
        estado: g.estado || 'Confirmado',
        row: g.row || null
      }));

      filteredGuests = [...allGuests];
      renderDashboard();
      showAdminAlert('Datos locales actualizados.', 'success');
    }, 800);
    return;
  }

  try {
    const response = await fetch(`${SCRIPT_URL}?action=getGuests`);
    const data = await response.json();

    if (data.status === 'success') {
      allGuests = data.data;
      filteredGuests = [...allGuests];
      renderDashboard();
      showAdminAlert('Datos actualizados correctamente.', 'success');
    } else {
      showAdminAlert('Error al cargar los datos.', 'error');
      renderDashboard(true);
    }
  } catch (error) {
    showAdminAlert('No se pudo conectar con el servidor.', 'error');
    renderDashboard(true);
  }
}

function applyFilters() {
  const searchTerm = document.getElementById('searchInput').value.toLowerCase();
  const menuFilter = document.getElementById('filterMenu').value;
  const estadoFilter = document.getElementById('filterEstado').value;

  filteredGuests = allGuests.filter(guest => {
    const matchesSearch = 
      guest.nombre.toLowerCase().includes(searchTerm) ||
      guest.email.toLowerCase().includes(searchTerm) ||
      guest.telefono.toLowerCase().includes(searchTerm);
      
    const matchesMenu = menuFilter === 'todos' || guest.menu === menuFilter;
    const matchesEstado = estadoFilter === 'todos' || guest.estado === estadoFilter;

    return matchesSearch && matchesMenu && matchesEstado;
  });

  renderTable();
}

function renderDashboard(isError = false) {
  if (isError) {
    document.getElementById('guestsTableBody').innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:3rem; color:var(--text-muted);">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:1.5rem; display:block; margin-bottom:0.5rem; color:#c53030;"></i>
          No se pudieron cargar los datos. Revisá la configuración de la URL.
        </td>
      </tr>`;
    return;
  }

  // Calcular métricas
  const confirmados = allGuests.filter(g => g.estado === 'Confirmado').length;
  const interesados = allGuests.filter(g => g.estado === 'Interesado').length;
  const presentes = allGuests.filter(g => g.presente === 'Sí').length;
  const especiales = allGuests.filter(g => g.menu !== 'Tradicional').length;

  document.getElementById('metricConfirmados').textContent = confirmados;
  document.getElementById('metricInteresados').textContent = interesados;
  document.getElementById('metricPresent').textContent = presentes;
  document.getElementById('metricEspecial').textContent = especiales;

  const presentPct = confirmados > 0 ? Math.round((presentes / confirmados) * 100) : 0;
  document.getElementById('metricPresentPct').textContent = `${presentPct}% de confirmados`;

  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('guestsTableBody');
  tbody.innerHTML = '';

  if (filteredGuests.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" style="text-align:center; padding:3rem; color:var(--text-muted);">
          <i class="fa-regular fa-folder-open" style="font-size:1.5rem; display:block; margin-bottom:0.5rem;"></i>
          No se encontraron registros.
        </td>
      </tr>`;
    return;
  }

  filteredGuests.forEach((guest, index) => {
    const tr = document.createElement('tr');
    
    // Clases Badges
    let menuBadgeClass = 'badge-menu tradicional';
    if (guest.menu === 'Vegetariano') menuBadgeClass = 'badge-menu vegetariano';
    else if (guest.menu === 'Vegano') menuBadgeClass = 'badge-menu vegano';
    else if (guest.menu === 'Celíaco / Sin TACC') menuBadgeClass = 'badge-menu sintacc';

    let estadoBadgeClass = guest.estado === 'Confirmado' ? 'badge-status confirmado' : 'badge-status interesado';

    const isPresent = guest.presente === 'Sí';
    const checkinBtnClass = isPresent ? 'btn-checkin active' : 'btn-checkin';
    const checkinIcon = isPresent ? 'fa-solid fa-check-double' : 'fa-solid fa-check';
    const checkinText = isPresent ? 'Acreditado' : 'Acreditar';

    tr.innerHTML = `
      <td>
        <strong>${escapeHTML(guest.nombre)}</strong><br>
        <span style="font-size:0.8rem; color:var(--text-muted);">${escapeHTML(guest.email)}</span>
      </td>
      <td>${escapeHTML(guest.telefono)}</td>
      <td><span class="badge ${estadoBadgeClass}">${escapeHTML(guest.estado)}</span></td>
      <td><span class="badge ${menuBadgeClass}">${escapeHTML(guest.menu)}</span></td>
      <td style="text-align:center;">
        <button class="${checkinBtnClass}" data-index="${index}" data-row="${guest.row}" onclick="toggleCheckin(this)">
          <i class="${checkinIcon}"></i> ${checkinText}
        </button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

async function toggleCheckin(btn) {
  const originalHtml = btn.innerHTML;
  btn.innerHTML = `<span class="spin"></span>`;
  btn.disabled = true;

  const arrayIndex = btn.getAttribute('data-index');
  const guest = filteredGuests[arrayIndex];
  const newStatus = guest.presente === 'Sí' ? 'No' : 'Sí';

  if (isSimulation) {
    setTimeout(() => {
      guest.presente = newStatus;
      
      const realIndex = allGuests.findIndex(g => g.email === guest.email && g.nombre === guest.nombre);
      if (realIndex !== -1) {
        allGuests[realIndex].presente = newStatus;
      }
      
      localStorage.setItem('cpce_guests', JSON.stringify(allGuests));
      
      renderDashboard();
      showAdminAlert(newStatus === 'Sí' ? 'Invitado acreditado.' : 'Acreditación revocada.', 'success');
    }, 500);
    return;
  }

  // Petición real al backend
  const payload = {
    action: 'updatePresence',
    row: guest.row,
    presente: newStatus
  };

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      guest.presente = newStatus;
      
      const realIndex = allGuests.findIndex(g => g.row === guest.row);
      if (realIndex !== -1) {
        allGuests[realIndex].presente = newStatus;
      }
      
      renderDashboard();
      showAdminAlert(newStatus === 'Sí' ? 'Invitado acreditado.' : 'Acreditación revocada.', 'success');
    } else {
      throw new Error(data.message || 'Error desconocido');
    }
  } catch (error) {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
    showAdminAlert('Error al actualizar: ' + error.message, 'error');
  }
}

function exportToCSV() {
  if (allGuests.length === 0) {
    showAdminAlert('No hay datos para exportar.', 'error');
    return;
  }

  const headers = ['Nombre', 'Telefono', 'Email', 'Estado', 'Menu', 'Presente', 'Fecha Registro'];
  
  const rows = allGuests.map(g => [
    `"${g.nombre}"`,
    `"${g.telefono}"`,
    `"${g.email}"`,
    `"${g.estado}"`,
    `"${g.menu}"`,
    `"${g.presente}"`,
    `"${g.timestamp || ''}"`
  ]);

  const csvContent = "data:text/csv;charset=utf-8," 
    + headers.join(',') + "\n" 
    + rows.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "inscriptos_cpce_2026.csv");
  document.body.appendChild(link);
  
  link.click();
  document.body.removeChild(link);
}

function showAdminAlert(message, type = 'info') {
  const alertEl = document.getElementById('adminAlert');
  if (!alertEl) return;

  alertEl.className = `alert ${type === 'success' ? 'alert-success' : 'alert-error'}`;
  alertEl.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i> <span>${message}</span>`;
  alertEl.classList.remove('hidden');

  setTimeout(() => { alertEl.classList.add('hidden'); }, 4000);
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag])
  );
}
