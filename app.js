/**
 * CONFIGURACIÓN DEL SISTEMA
 * ------------------------------------------------------------------
 * SCRIPT_URL: Pega aquí la URL del Web App de Google Apps Script
 * una vez que lo despliegues en tu Google Sheet.
 * Si está vacío, el sistema funcionará en MODO SIMULACIÓN usando LocalStorage.
 */
const SCRIPT_URL = ''; 

// Fecha del evento: Jueves 04 de Junio a las 20:30 hs (Zona Horaria Argentina: UTC-3)
const EVENT_DATE = new Date('2026-06-04T20:30:00-03:00').getTime();

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initCalendarSync();
  initRSVPForm();
});

/**
 * 1. CUENTA REGRESIVA
 */
function initCountdown() {
  const countdownContainer = document.getElementById('countdown');
  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  if (!countdownContainer) return;

  function updateTime() {
    const now = new Date().getTime();
    const distance = EVENT_DATE - now;

    if (distance < 0) {
      clearInterval(timerInterval);
      countdownContainer.innerHTML = `<div class="glass-card" style="grid-column: 1 / -1; padding: 1.5rem; border-color: var(--accent-gold); color: var(--accent-gold-light); font-family: var(--font-title); font-size: 1.5rem; letter-spacing: 1px;">
        🥂 ¡EL EVENTO HA COMENZADO! BIENVENIDOS colegas 👨🏻‍🎓👩🏻‍🎓
      </div>`;
      return;
    }

    // Cálculos de tiempo
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Renderizar con ceros a la izquierda
    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  // Ejecutar inmediatamente y luego cada segundo
  updateTime();
  const timerInterval = setInterval(updateTime, 1000);
}

/**
 * 2. AGENDAR EN CALENDARIO (.ICS)
 */
function initCalendarSync() {
  const calendarBtn = document.getElementById('addToCalendarBtn');
  if (!calendarBtn) return;

  calendarBtn.addEventListener('click', () => {
    // Generar formato iCalendar (.ics)
    const title = 'Día del Graduado en Ciencias Económicas';
    const description = 'Celebración del Día del Graduado con colegas. Delegación Comodoro Rivadavia.';
    const location = 'Delegación Comodoro Rivadavia, Calle Huergo 936, Comodoro Rivadavia, Chubut';
    
    // Fechas en formato UTC para .ics (2026-06-04 20:30 UTC-3 -> 23:30 UTC)
    // Fin estimado: 4 horas después (2026-06-05 03:30 UTC)
    const startDate = '20260604T233000Z'; 
    const endDate = '20260605T033000Z'; 

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:dia_graduado_cs_economicas_2026@cpcechubut',
      'DTSTAMP:20260528T230000Z',
      `DTSTART:${startDate}`,
      `DTEND:${endDate}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'SEQUENCE:0',
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    // Descargar el archivo al vuelo
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (navigator.msSaveBlob) { // Compatibilidad con IE/Edge
      navigator.msSaveBlob(blob, 'Dia_del_Graduado_CPCE.ics');
    } else {
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', 'Dia_del_Graduado_CPCE.ics');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  });
}

/**
 * 3. CONTROL DEL FORMULARIO RSVP
 */
function initRSVPForm() {
  const form = document.getElementById('rsvpForm');
  const alertEl = document.getElementById('formAlert');
  const submitBtn = document.getElementById('submitBtn');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Resetear alerta
    showAlert('', 'info', true);
    submitBtn.blur();

    // Obtener campos
    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const email = document.getElementById('email').value.trim();
    const menuEl = document.querySelector('input[name="menu"]:checked');
    const estadoEl = document.querySelector('input[name="estado"]:checked');
    const menu = menuEl ? menuEl.value : 'Tradicional';
    const estado = estadoEl ? estadoEl.value : 'Confirmado';

    // Validaciones básicas manuales para mejor feedback
    if (!nombre) {
      showAlert('Por favor, ingresa tu Nombre y Apellido.', 'error');
      document.getElementById('nombre').focus();
      return;
    }
    if (!telefono) {
      showAlert('Por favor, ingresa un Teléfono de contacto.', 'error');
      document.getElementById('telefono').focus();
      return;
    }
    if (!email || !validateEmail(email)) {
      showAlert('Por favor, ingresa un correo electrónico válido.', 'error');
      document.getElementById('email').focus();
      return;
    }

    // Cambiar estado del botón de envío
    const originalBtnContent = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spin"></span>&nbsp; Enviando…`;

    // Armar el payload
    const payload = {
      action: 'rsvp',
      nombre: nombre,
      telefono: telefono,
      email: email,
      menu: menu,
      estado: estado
    };

    try {
      if (!SCRIPT_URL) {
        // MODO SIMULACIÓN (LocalStorage)
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simular latencia de red
        
        let mockData = JSON.parse(localStorage.getItem('cpce_guests') || '[]');
        
        // Evitar duplicados por email en la simulación
        const exists = mockData.some(g => g.email.toLowerCase() === email.toLowerCase());
        if (exists) {
          throw new Error('Este correo electrónico ya está registrado en la lista de invitados.');
        }

        mockData.push({
          timestamp: new Date().toISOString(),
          nombre: nombre,
          telefono: telefono,
          email: email,
          menu: payload.menu,
          estado: payload.estado,
          presente: 'No'
        });

        localStorage.setItem('cpce_guests', JSON.stringify(mockData));

        showAlert('🎉 ¡Confirmación exitosa! Te hemos registrado en la lista del evento. (Modo Simulación: los datos se guardaron localmente)', 'success');
        form.reset();
      } else {
        // CONEXIÓN REAL CON GOOGLE APPS SCRIPT
        // Usamos URLSearchParams para mandar los datos estructurados en formato POST form-url-encoded
        const response = await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(payload)
        });

        const result = await response.json();

        if (result.status === 'success') {
          showAlert('🎉 ¡Confirmación exitosa! Tu asistencia ha sido registrada. ¡Nos vemos el Jueves 04/06!', 'success');
          form.reset();
        } else {
          throw new Error(result.message || 'Ocurrió un error al procesar tu registro. Por favor, intenta de nuevo.');
        }
      }
    } catch (error) {
      console.error(error);
      showAlert(`⚠️ Error: ${error.message || 'No pudimos conectar con el servidor. Inténtalo de nuevo.'}`, 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnContent;
    }
  });

  // Utilidad de alerta
  function showAlert(message, type = 'info', hide = false) {
    if (hide) {
      alertEl.className = 'form-alert hidden';
      return;
    }
    alertEl.className = `form-alert ${type}`;
    alertEl.innerHTML = `<i class="fa-solid ${type === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'}"></i> <span>${message}</span>`;
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Validar formato email
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }
}
