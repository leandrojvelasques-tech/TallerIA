# 🥂 Sistema de RSVP & Control de Asistencia - Día del Graduado en Ciencias Económicas 🎓

Este proyecto es una aplicación web estática de alta calidad diseñada para gestionar las confirmaciones de asistencia (RSVP) al evento del **Día del Graduado en Ciencias Económicas** (Jueves 4 de Junio, 20:30 hs, Calle Huergo 936, Comodoro Rivadavia).

Cuenta con una **invitación pública** con cuenta regresiva, geolocalización, botón de calendario y formulario de registro; y un **panel de administración privado** protegido por contraseña para consultar estadísticas en tiempo real, filtrar invitados por menú, buscar nombres y acreditar su ingreso en la puerta (Check-in).

---

## 📂 Archivos del Proyecto

*   **`index.html`**: Página pública de la invitación y formulario RSVP.
*   **`admin.html`**: Panel de control administrativo para los organizadores.
*   **`style.css`**: Hoja de estilos premium con paleta de colores corporativa/gala (Azul marino, celeste y dorado) y efectos de glassmorphism.
*   **`app.js`**: Lógica de la interfaz pública (cuenta regresiva, calendario y envío de datos).
*   **`admin.js`**: Lógica del panel de administración (autenticación, filtros, estadísticas y check-in).
*   **`apps-script.js`**: El código que debes copiar en tu cuenta de Google Sheets para hacer la integración.

---

## ⚙️ Paso 1: Configurar la Base de Datos en Google Sheets (¡Gratis!)

Para que los registros se guarden automáticamente en una planilla de Excel en la nube de Google, sigue estos sencillos pasos:

1.  Crea una nueva hoja de cálculo en tu Google Drive.
2.  En la primera fila (fila 1), escribe exactamente estas cabeceras en las columnas **A, B, C, D, E y F**:
    *   **A1**: `Fecha`
    *   **B1**: `Nombre`
    *   **C1**: `Teléfono`
    *   **D1**: `Mail`
    *   **E1**: `Tipo de Menú`
    *   **F1**: `Acreditado`
3.  En el menú superior de la hoja de cálculo, haz clic en **Extensiones** ➡️ **Apps Script**.
4.  Borra el código que aparezca por defecto en el editor.
5.  Abre el archivo [apps-script.js](file:///c:/Users/Leandro%20Velasques/OneDrive/Documentos/DISE%C3%91O/TRABAJOS%20DISE%C3%91O/6%20Porter%20AI/2%20ANTIGRAVITY%20PROJECTS/After%20Agape/apps-script.js) de este proyecto, copia todo su contenido y pégalo en el editor de Apps Script de Google.
6.  Haz clic en el botón de **Guardar** (ícono de disco) en la barra de herramientas.

---

## 🚀 Paso 2: Publicar el Script de Google

1.  En la esquina superior derecha del editor de Apps Script, haz clic en el botón azul **Implementar** y selecciona **Nueva implementación**.
2.  Haz clic en el engranaje de configuración al lado de "Seleccionar tipo" y elige **Aplicación web**.
3.  Llena los campos con la siguiente configuración:
    *   **Descripción**: `RSVP Graduados`
    *   **Ejecutar como**: Selecciona tu cuenta de correo electrónico (ej. `tu-correo@gmail.com`).
    *   **Quién tiene acceso**: Selecciona **Cualquiera** (esto es crucial para que el navegador de los invitados pueda escribir en la hoja).
4.  Haz clic en **Implementar**.
5.  Si Google te solicita autorizar accesos, haz clic en **Autorizar acceso**, selecciona tu cuenta de correo, haz clic en **Avanzado** (abajo a la izquierda en la ventana pequeña) y luego en **Ir a Proyecto sin nombre (no seguro)**. Finalmente concede los permisos.
6.  Una vez completada la implementación, verás una ventana con la **URL de la aplicación web**. Cópiala.

---

## 🔗 Paso 3: Conectar la Web con tu Google Sheet

1.  Abre el archivo [app.js](file:///c:/Users/Leandro%20Velasques/OneDrive/Documentos/DISE%C3%91O/TRABAJOS%20DISE%C3%91O/6%20Porter%20AI/2%20ANTIGRAVITY%20PROJECTS/After%20Agape/app.js) y pega la URL copiada dentro de las comillas simples de la constante:
    ```javascript
    const SCRIPT_URL = 'AQUÍ_PEGA_TU_URL_DE_APPS_SCRIPT';
    ```
2.  Abre el archivo [admin.js](file:///c:/Users/Leandro%20Velasques/OneDrive/Documentos/DISE%C3%91O/TRABAJOS%20DISE%C3%91O/6%20Porter%20AI/2%20ANTIGRAVITY%20PROJECTS/After%20Agape/admin.js) y pega la misma URL en la constante del mismo nombre:
    ```javascript
    const SCRIPT_URL = 'AQUÍ_PEGA_TU_URL_DE_APPS_SCRIPT';
    ```
3.  ¡Listo! La web ahora está conectada en tiempo real. 

> [!NOTE]
> Mientras las variables `SCRIPT_URL` permanezcan vacías `''`, el sitio funcionará en **Modo Simulador**. En este modo, el formulario guardará los datos únicamente en el navegador actual (`LocalStorage`) y el panel de administración se pre-cargará con 5 invitados de demostración para que pruebes las búsquedas y acreditaciones antes de conectarlo a Google Sheets.

---

## 🔑 Panel de Control de Administración

*   **Ruta de acceso**: Abre el archivo `admin.html` en tu navegador o haz clic en el enlace "Acceso Organizador" en el pie de página de `index.html`.
*   **Contraseña de acceso por defecto**: `graduados2026`
*   **Cómo cambiar la contraseña**: Abre el archivo [admin.js](file:///c:/Users/Leandro%20Velasques/OneDrive/Documentos/DISE%C3%91O/TRABAJOS%20DISE%C3%91O/6%20Porter%20AI/2%20ANTIGRAVITY%20PROJECTS/After%20Agape/admin.js) y edita la constante:
    ```javascript
    const ADMIN_PASSWORD = 'tu_nueva_contrasenia_aqui';
    ```

---

## 🎨 Agregar el Logo del Consejo

1.  Consigue el archivo del logo oficial en formato PNG o JPG.
2.  Renómbralo como `logo.png`.
3.  Guárdalo en la misma carpeta raíz del proyecto. El sitio web lo detectará automáticamente y reemplazará el texto de fallback.

---

## 🌐 Cómo subirlo a Internet gratis

Puedes alojar este sitio de forma 100% gratuita y segura en minutos:
1.  **Netlify Drop (Recomendado):** Arrastra y suelta esta carpeta en [Netlify Drop](https://app.netlify.com/drop) y obtendrás un enlace público al instante.
2.  **Vercel:** Despliega de forma estática o arrastra la carpeta en la plataforma de Vercel.
3.  **GitHub Pages:** Crea un repositorio de GitHub, sube los archivos y activa GitHub Pages desde la pestaña *Settings*.
