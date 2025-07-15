
document.addEventListener('DOMContentLoaded', () => {
    // 1. "Despertar" el backend al cargar
    wakeUpBackend();

const API_URL = 'https://web-corin-backend.onrender.com/login';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('error-message');
  const loginbutton = document.getElementById('login-button');

  const original_button_text = loginbutton.innerHTML;
  loginbutton.disabled = true;
  loginbutton.innerHTML = `
    <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
    Cargando...
  `;

  try {
    // 1. Limpiar mensajes anteriores
    errorMessage.style.display = 'none';

    // 2. Enviar datos al backend
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    // 3. Manejar respuesta
    if (response.ok) {
      // Autenticación exitosa
      loginbutton.disabled = false;
      loginbutton.innerHTML = 'Aceptar';
      alert(`✅ Autenticado como ${data.user.username}`);
            
      // Redirigir o guardar token
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('rol', data.user.rol);

      abrirInterfazAdmin();
      // window.location.href = '/dashboard.html'; // Ejemplo de redirección
    } else {
      // Mostrar error
      //errorMessage.textContent = `❌ ${data.error || 'Error de autenticación'}`;
      //errorMessage.style.display = 'block';
      alert(`❌ ${data.error || 'Error de autenticación'}`);
      loginbutton.disabled = false;
      loginbutton.innerHTML = 'Aceptar';
    }
  } catch (err) {
    // Error de conexión
    //errorMessage.textContent = '❌ Error al conectar con el servidor';
    //errorMessage.style.display = 'block';
    alert(`❌ Error al conectar con el servidor`);
    loginbutton.disabled = false;
    loginbutton.innerHTML = 'Aceptar';
    console.error('Error:', err);
    
  }
});
});

function abrirInterfazAdmin() {
    // Abrir una nueva ventana o mostrar una interfaz de administrador
    //window.open('mainpage.html', '_blank'); // Abre una nueva pestaña con la interfaz de admin
    //prueba
    //window.location.href = 'mainpage.html'; //abre la pestaña mainpage superpuesta sobre login page
    //prueba
    window.location.href = 'pagina_principal.html';

}

async function wakeUpBackend() {
    try {
        const response = await fetch('http://localhost:3000/ping', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Backend activo:', response.ok);
    } catch (error) {
        console.error('Error al activar el backend:', error);
    }
}