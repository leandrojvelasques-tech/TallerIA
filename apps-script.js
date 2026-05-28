/**
 * CÓDIGO PARA GOOGLE APPS SCRIPT
 * ---------------------------------------------------------------------------
 * Este código debe ser copiado en el editor de Apps Script de tu Google Sheet.
 * 
 * Instrucciones de instalación rápidas:
 * 1. Crea una nueva Google Sheet (Hoja de cálculo).
 * 2. Escribe en la primera fila (Cabecera) las siguientes columnas:
 *    A1: Fecha | B1: Nombre | C1: Teléfono | D1: Mail | E1: Tipo de Menú | F1: Acreditado
 * 3. Ve a "Extensiones" -> "Apps Script".
 * 4. Borra todo el código existente y pega este archivo completo.
 * 5. Haz clic en "Implementar" -> "Nueva implementación".
 * 6. Selecciona tipo: "Aplicación web".
 * 7. Configura:
 *    - Descripción: RSVP Graduados
 *    - Ejecutar como: "Yo" (tu cuenta de correo)
 *    - Quién tiene acceso: "Cualquiera" (esto es vital para que la web pueda enviar datos).
 * 8. Haz clic en "Implementar" y autoriza los permisos requeridos de Google.
 * 9. Copia la "URL de la aplicación web" provista y pégala en:
 *    - `app.js` (en la variable SCRIPT_URL)
 *    - `admin.js` (en la variable SCRIPT_URL)
 */

function doGet(e) {
  // Manejo de solicitudes GET para cargar la lista de invitados en el Dashboard
  var action = e.parameter.action;
  
  if (action === 'getGuests') {
    return getGuestsData();
  }
  
  return buildJsonResponse({ status: 'error', message: 'Acción no válida en la consulta GET.' });
}

function doPost(e) {
  // Detectar el formato de los datos (URLSearchParams o JSON)
  var params;
  if (e.postData && e.postData.type === "application/x-www-form-urlencoded") {
    params = e.parameter;
  } else if (e.postData && e.postData.contents) {
    try {
      params = JSON.parse(e.postData.contents);
    } catch (err) {
      params = e.parameter;
    }
  } else {
    params = e.parameter;
  }

  var action = params.action;

  if (action === 'rsvp') {
    return handleRsvp(params);
  } else if (action === 'checkin') {
    return handleCheckin(params);
  }

  return buildJsonResponse({ status: 'error', message: 'Acción no válida en la consulta POST.' });
}

/**
 * Retorna todos los invitados registrados
 */
function getGuestsData() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    
    // Si solo está la cabecera
    if (rows.length <= 1) {
      return buildJsonResponse({ status: 'success', data: [] });
    }
    
    var guests = [];
    
    // Empezamos en la fila index 1 (excluyendo cabecera)
    for (var i = 1; i < rows.length; i++) {
      var row = rows[i];
      // Si la fila está vacía (nombre vacío), ignorarla
      if (!row[1]) continue;
      
      guests.push({
        timestamp: row[0],
        nombre: row[1],
        telefono: String(row[2]),
        email: row[3],
        menu: row[4],
        presente: row[5] === 'Sí' ? 'Sí' : 'No'
      });
    }
    
    return buildJsonResponse({ status: 'success', data: guests });
  } catch (error) {
    return buildJsonResponse({ status: 'error', message: error.toString() });
  }
}

/**
 * Registra un nuevo RSVP en la hoja
 */
function handleRsvp(params) {
  var nombre = params.nombre;
  var telefono = params.telefono;
  var email = params.email;
  var menu = params.menu;

  if (!nombre || !telefono || !email || !menu) {
    return buildJsonResponse({ status: 'error', message: 'Faltan campos requeridos en el registro.' });
  }

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    
    // Validar si el mail ya se registró
    for (var i = 1; i < data.length; i++) {
      if (data[i][3] && data[i][3].toString().toLowerCase() === email.toLowerCase()) {
        return buildJsonResponse({ 
          status: 'error', 
          message: 'Este correo electrónico ya está registrado en la lista de invitados.' 
        });
      }
    }

    const timestamp = new Date();
    const estado = params.estado || "Confirmado";

    // Agregar fila: Fecha Registro, Nombre, Teléfono, Mail, Menú, Acreditado (No), Estado
    sheet.appendRow([timestamp, nombre, telefono, email, menu, "No", estado]);
    
    return buildJsonResponse({ status: 'success', message: 'Asistencia registrada con éxito.' });
  } catch (error) {
    return buildJsonResponse({ status: 'error', message: error.toString() });
  }
}

/**
 * Actualiza el estado de Check-in
 */
function handleCheckin(params) {
  var email = params.email;
  var presente = params.presente; // 'Sí' o 'No'

  if (!email || !presente) {
    return buildJsonResponse({ status: 'error', message: 'Faltan campos requeridos para la acreditación.' });
  }

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();
    var foundIndex = -1;

    // Buscar al invitado por email
    for (var i = 1; i < data.length; i++) {
      if (data[i][3] && data[i][3].toString().toLowerCase() === email.toLowerCase()) {
        foundIndex = i + 1; // Las filas en Sheets son 1-indexed, más cabecera
        break;
      }
    }

    if (foundIndex === -1) {
      return buildJsonResponse({ status: 'error', message: 'No se encontró al invitado registrado con este correo.' });
    }

    // Columna F (Acreditado) es la columna 6
    sheet.getRange(foundIndex, 6).setValue(presente === 'Sí' ? 'Sí' : 'No');

    return buildJsonResponse({ status: 'success', message: 'Acreditación actualizada con éxito.' });
  } catch (error) {
    return buildJsonResponse({ status: 'error', message: error.toString() });
  }
}

/**
 * Helper para construir respuesta JSON con cabeceras CORS
 */
function buildJsonResponse(response) {
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}
