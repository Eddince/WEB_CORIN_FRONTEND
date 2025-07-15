let calendar; // Para poder destruir y volver a crear el calendario

document.addEventListener('DOMContentLoaded', function() {

    wakeUpBackend();
    // Recupera datos del localStorage
  const username = localStorage.getItem('username');
  const rol = localStorage.getItem('rol');
  const token = localStorage.getItem('token');

  // Si no hay token, redirige al login
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  if (username && rol) {
        // Actualiza el saludo
        const greetingElement = document.getElementById('user-greeting');
        greetingElement.textContent = `Bienvenido, ${username} (${rol})`; // Ej: "Bienvenido, Carlos (admin)"
    } else {
        // Si no hay datos, redirige al login (opcional)
        window.location.href = 'index.html';
    }

    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        // Limpiar todo el almacenamiento local
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('rol');
        
        // Opcional: Limpiar también sessionStorage (si lo usas)
        sessionStorage.clear();

        // Redirigir a la página de login
        window.location.href = 'index.html';
    });

    



    // Navegación lateral
    document.querySelectorAll('.sidebar nav ul li a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            // Cambiar activo
            document.querySelectorAll('.sidebar nav ul li a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            // Mostrar sección correspondiente
            const section = this.getAttribute('data-section');
            document.getElementById('calendar-section').style.display = (section === 'calendar') ? '' : 'none';
            document.getElementById('clients-section').style.display = (section === 'clients') ? '' : 'none';
            document.getElementById('invoices-section').style.display = (section === 'invoices') ? '' : 'none';
            // Inicializar calendario solo si se muestra
            if (section === 'calendar') {
                if (!calendar) initCalendar();
            } else {
                if (calendar) {
                    calendar.destroy();
                    calendar = null;
                }
            }
        });
    });

    // Inicializar calendario al cargar
    initCalendar();

    // Añadir evento al calendario
    document.getElementById('add-event-btn').addEventListener('click', function() {
        Swal.fire({
            title: 'Agregar nuevo turno',
            html: `
                <input id="client-name" class="swal2-input" placeholder="Nombre del cliente">
                <input id="event-date" class="swal2-input" type="date">
                <input id="event-time" class="swal2-input" type="time">
            `,
            focusConfirm: false,
            preConfirm: () => {
                return {
                    title: document.getElementById('client-name').value,
                    date: document.getElementById('event-date').value,
                    time: document.getElementById('event-time').value
                }
            }
        }).then((result) => {
            if (result.value && calendar) {
                const startDate = new Date(`${result.value.date}T${result.value.time}`);
                const endDate = new Date(startDate.getTime() + 2 * 60 * 60 * 1000);
                calendar.addEvent({
                    title: `Sesión: ${result.value.title}`,
                    start: startDate,
                    end: endDate,
                    color: '#8e44ad'
                });
                Swal.fire({
                    title: 'Turno agregado!',
                    text: 'El turno se ha programado correctamente',
                    icon: 'success'
                });
            }
        });
    });

    // Añadir cliente (demo, solo agrega a la tabla)
    document.getElementById('add-client-btn').addEventListener('click', function() {
        Swal.fire({
            title: 'Agregar nuevo cliente',
            html: `
                <input id="swal-client-name" class="swal2-input" placeholder="Nombre">
                <input id="swal-client-phone" class="swal2-input" placeholder="Teléfono">
                <input id="swal-client-email" class="swal2-input" placeholder="Email">
            `,
            focusConfirm: false,
            preConfirm: () => {
                return {
                    nombre: document.getElementById('swal-client-name').value,
                    telefono: document.getElementById('swal-client-phone').value,
                    email: document.getElementById('swal-client-email').value
                }
            }
        }).then((result) => {
            if (result.value) {
                const tr = document.createElement('tr');
                tr.innerHTML = `<td>${result.value.nombre}</td><td>${result.value.telefono}</td><td>${result.value.email}</td>`;
                document.getElementById('clients-list').appendChild(tr);
                Swal.fire('Cliente agregado!', '', 'success');
            }
        });
    });

    // Tabs en facturación
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            if (this.getAttribute('data-tab') === 'create-client') {
                document.getElementById('create-client-tab').style.display = '';
                document.getElementById('finance-calc-tab').style.display = 'none';
            } else {
                document.getElementById('create-client-tab').style.display = 'none';
                document.getElementById('finance-calc-tab').style.display = '';
            }
        });
    });

    // Crear cliente desde formulario en facturación (demo)
    document.getElementById('create-client-form').addEventListener('submit', function(e) {
        e.preventDefault();
        Swal.fire('Cliente guardado!', '', 'success');
        this.reset();
    });

    // Cálculo financiero demo
    document.getElementById('finance-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const monto = parseFloat(this.monto.value);
        const interes = parseFloat(this.interes.value);
        const meses = parseInt(this.meses.value);
        if (isNaN(monto) || isNaN(interes) || isNaN(meses)) return;
        const total = monto * Math.pow(1 + interes / 100, meses);
        document.getElementById('finance-result').innerHTML = `<p>Total a pagar: <strong>$${total.toFixed(2)}</strong></p>`;
    });

    // 4. Opcional: Ping periódico cada 10 minutos (para mantener activo el backend)
    setInterval(wakeUpBackend, 5 * 60 * 1000); // 600,000 ms = 10 minutos



});

// Función para inicializar el calendario
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'es',
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        buttonText: {
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
        },
        events: [
            {
                title: 'Sesión: Ana López',
                start: new Date(),
                end: new Date(new Date().setHours(new Date().getHours() + 2)),
                color: '#8e44ad'
            },
            {
                title: 'Prueba de vestido: María García',
                start: new Date(new Date().setDate(new Date().getDate() + 2)),
                end: new Date(new Date().setDate(new Date().getDate() + 2)),
                color: '#9b59b6'
            },
            {
                title: 'Sesión: Luisa Martínez',
                start: new Date(new Date().setDate(new Date().getDate() + 5)),
                end: new Date(new Date().setDate(new Date().getDate() + 5)),
                color: '#3498db'
            }
        ],
        eventClick: function(info) {
            Swal.fire({
                title: info.event.title,
                html: `
                    <p><strong>Fecha:</strong> ${info.event.start.toLocaleDateString()}</p>
                    <p><strong>Hora:</strong> ${info.event.start.toLocaleTimeString()}</p>
                `,
                icon: 'info',
                confirmButtonColor: '#8e44ad'
            });
        }
    });
    calendar.render();
}

async function wakeUpBackend() {
    try {
        const response = await fetch('https://tu-api.com/ping', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Backend activo:', response.ok);
    } catch (error) {
        console.error('Error al activar el backend:', error);
    }
}