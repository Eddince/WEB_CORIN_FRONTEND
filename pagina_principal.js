// Configuración de la API
const API_URL = 'https://web-corin-backend.onrender.com'; // Reemplaza con tu URL real
const API_ENDPOINTS = {
  AGENDA: `${API_URL}/agenda`,
  APPOINTMENTS: `${API_URL}/turno`,
  CLIENTES: `${API_URL}/lista_clientes`,
  FACTURAS: `${API_URL}/facturas`,
  EXTRAS: `${API_URL}/extras`,

};



//prueba


// Mapeo de ofertas visuales a IDs de backend
const OFERTAS_MAP = {
  '1': 1,  
  '2': 2, 
  '3': 3,  
  '4': 4,  
  '5': 5,  
  '6': 6,  
  'VIP': 7, 
    
};





// Mapeo de productos extras (checkbox values a extra_id)
const EXTRAS_MAP = {
  '12_postalitas': '95b45ac1-e8e9-4700-84b0-f9578fa7ad3b', 
  'llavero': '0631e4f9-faed-4de1-890e-9ed63cc0b305',
  'cuadro_acrilico': 'c2a92e21-8508-4fea-9627-d1cd51d372b0',
  'foto_10x15' : '27b87b1d-e766-40d5-8cfb-e152b194c14f',
  'foto_20x21' : '2364cbc8-078b-4138-b68a-f59374f00d26',
  'foto_21x39' : 'f07c8a7b-fd9e-47f4-af05-656a1ce05b4a',
  'foto_5x7' : 'd7bdd520-e921-4656-970d-5019d85479e5',
  'foto_digital' : '98d2cf71-f31b-4d46-aff5-389486a767f4',
  'fotos_atardecer' : '91b32893-3442-480b-972b-ccd6dee1956d',
  'fotos_fuera_SC' : '01296499-74e4-4591-9f98-2f807cc083fc',
  'iman' : '1c401971-63d0-4848-8ae6-6e2fa58d0fcd',
  'lienzo_30x45' : '079c3c11-4bf4-49b2-a2dd-5746c4f2371a',
  'lienzo_45x60' : '276ecb8d-b886-4922-a397-09aa39a43f8e',
  'lienzo_60x90' : '54781ff8-d090-452f-bbcb-1d3a302de520',
  'lienzo_80x120' : '02bf23ae-3386-4786-8005-d6b0264602f9',
  'lonas_45x60' : '31b10734-693e-4041-a017-8195c44af3b9',
  'lonas_60x90' : 'dfa4a7ce-814c-4843-bb97-c93711c5d8b7',
  'lonas_80x120' : 'bb3863c1-9cba-421a-ac1c-b128c5a81c0c',
  'lonas_90x150' : '79bf17a0-5a08-42a8-8bbe-1467291f082f',
  'maquillaje_familiares' : 'd20f0a48-4051-4101-a874-603cdece9f98',
  'photobook_12x16_123' : '9a196adb-5c3b-4646-97db-4785ebddb8a6',
  'photobook_12x16_4' : 'fdc32c45-bf7e-4f14-8445-45cc02ea3b58',
  'photobook_12x16_5' : '08d44a6a-182f-44fd-8fb0-be7474cc2a41',
  'photobook_12x16_6' : '2fe0b71a-5817-4fe8-9c84-0a43cb3cef92',
  'photobook_12x16_7' : 'eb661ca7-ac98-401e-945b-fa4ae2d6ef67',
  'revista' : '743ba302-2390-40bd-9597-669e93ea0e62',
  'video' : '5c2a480b-2090-427f-920d-4a087542d7bf',
  
};





//prueba
let calendar; // Variable global para la instancia del calendario
//variables globales para edicion financiera
let currentPrices = [];
let originalPrices = [];

// Elementos UI
const pricesTable = document.getElementById('prices-list');
const saveBtn = document.getElementById('save-prices-btn');
const refreshBtn = document.getElementById('refresh-prices-btn');

//

document.addEventListener('DOMContentLoaded', function() {
    // Mantengo tu código original de verificación de autenticación
    wakeUpBackend();
    const username = localStorage.getItem('username');
    const rol = localStorage.getItem('rol');
    const token = localStorage.getItem('token');

    if (!token) {
        window.location.href = 'index.html';
        return;
    }

    if (username && rol) {
        document.getElementById('user-greeting').textContent = `Bienvenido, ${username} (${rol})`;
    } else {
        window.location.href = 'index.html';
    }

    // Mantengo tu código original de logout
    const logoutBtn = document.getElementById('logout-btn');
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('username');
        localStorage.removeItem('rol');
        sessionStorage.clear();
        window.location.href = 'index.html';
    });


     /////financiero////
    refreshBtn.addEventListener('click', loadPrices);
    saveBtn.addEventListener('click', savePriceChanges);
    
    // Cargar datos al mostrar la sección
    document.querySelector('.tab-btn[data-tab="finance-calc"]').addEventListener('click', () => {
        if (currentPrices.length === 0) loadPrices();
    });
    ///////////////
    
    //transportacion de extras
    renderExtras();

    
    
    //prueba
    // Configurar el formulario de creación de cliente
    
    loadClients();
    setupClientForm();
    //prueba

    // Configuración de eventos del calendario
        
    // Inicialización del calendario
    initCalendar();
    setupCalendarEvents();
    
   
    

    // Ping periódico al backend
    setInterval(wakeUpBackend, 5 * 60 * 1000);
    
});

// Función para configurar eventos del calendario
function setupCalendarEvents() {

    // Ocultar/mostrar elementos según el rol al cargar la página
    const rol = localStorage.getItem('rol');
    const invoicesMenuItem = document.getElementById('invoices-menu-item');
    // Mostrar el menú de facturas solo para admin y recep
    if (['admin', 'recep'].includes(rol)) {
        invoicesMenuItem.style.display = 'block';
    }

    // Navegación lateral
    document.querySelectorAll('.sidebar nav ul li a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelectorAll('.sidebar nav ul li a').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            const section = this.getAttribute('data-section');
            document.getElementById('calendar-section').style.display = (section === 'calendar') ? '' : 'none';
            document.getElementById('clients-section').style.display = (section === 'clients') ? '' : 'none';
            document.getElementById('invoices-section').style.display = (section === 'invoices') ? '' : 'none';

            // Cargar clientes cuando se muestra la sección
            if (section === 'clients') {
                loadClients();
            }
            if (section === 'invoices') {
                loadPrices();
            }
            //
            
            if (section === 'calendar') {
                if (!calendar) initCalendar();
            } else if (calendar) {
                calendar.destroy();
                calendar = null;
            }
        });
    });

    // Botón para añadir nuevo turno
    document.getElementById('add-event-btn').addEventListener('click', handleAddEvent);

    // Modificación del botón para agregar nuevo cliente
    document.getElementById('add-client-btn').addEventListener('click', function() {
        //acceso restringido
        if (rol !== 'admin' && rol !== 'recep') {
        
        return; // Salir de la función si no es admin
    }
    //
        //cargando..
        const button = this;
        setButtonLoading(button, true);
        //cargando..


        // Navegar a la sección de facturación y activar la pestaña de crear cliente
      
        document.querySelector('.sidebar nav ul li a[data-section="invoices"]').click();
        document.querySelector('.tab-btn[data-tab="create-client"]').click();
 

        //cargando..
        setTimeout(() => {
        setButtonLoading(button, false);
    }, 500);
        //cargando
    });

    // Tabs en facturación (mantengo tu código original)
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

    //document.getElementById('create-client-form').addEventListener('submit', function(e) {
        //e.preventDefault();
       // Swal.fire('Cliente guardado!', '', 'success');
       // this.reset();
   // });

   

    document.getElementById('finance-form').addEventListener('submit', function(e) {
        e.preventDefault();
        const monto = parseFloat(this.monto.value);
        const interes = parseFloat(this.interes.value);
        const meses = parseInt(this.meses.value);
        if (isNaN(monto) || isNaN(interes) || isNaN(meses)) return;
        const total = monto * Math.pow(1 + interes / 100, meses);
        document.getElementById('finance-result').innerHTML = `<p>Total a pagar: <strong>$${total.toFixed(2)}</strong></p>`;
    });
}

// Función para inicializar el calendario (modificada para fechas fijas)
function initCalendar() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        locale: 'es',
        initialView: 'dayGridMonth',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
        },
        buttonText: {
            today: 'Hoy',
            month: 'Mes'
        },
        events: fetchAppointments,
        eventClick: handleCalendarEventClick,
        dateClick: handleDateClick
    });
    calendar.render();
}

// Función para obtener eventos (modificada para fechas fijas)
async function fetchAppointments(fetchInfo, successCallback, failureCallback) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.AGENDA, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            //throw new Error(`Error ${response.status}: ${errorText}`);
            Swal.fire('Error', errorText, 'error');
        }
        
        const eventos = await response.json();
        
        // Mapeo de eventos al formato que FullCalendar espera
        const events = eventos.map(evento => ({
            id: evento.id,
            title: `${evento.nombre} (${evento.telefono})`,
            start: evento.fecha, // Usamos directamente la fecha fija
            allDay: true, // Evento de todo el día
            color: '#8e44ad',
            extendedProps: {
                clientName: evento.nombre,
                clientPhone: evento.telefono,
            }
        }));
        
        successCallback(events);
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        failureCallback(error.message);
        Swal.fire('Error', error.message, 'error');
        
        
    }
}

// Handler para añadir nuevo evento
function handleAddEvent() {
    //Acceso restringido
    const rol = localStorage.getItem('rol');
    // Verificar si el usuario es admin
    if (rol !== 'admin' && rol !== 'recep') {
        
        return; // Salir de la función si no es admin
    }
    //
    Swal.fire({
        title: 'Agregar nuevo turno',
        html: `
            <input id="client-name" class="swal2-input" placeholder="Nombre del cliente" required>
            <input id="client-phone" class="swal2-input" placeholder="Teléfono del cliente" required>
            <input id="event-date" class="swal2-input" type="date" required>
            
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            return {
                clientName: document.getElementById('client-name').value,
                clientPhone: document.getElementById('client-phone').value,
                date: document.getElementById('event-date').value,
                
            };
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.isConfirmed) {
            createAppointment(result.value);
        }
    });
}

// Función para crear un nuevo turno (versión corregida)
async function createAppointment(appointmentData) {
    //cargando..
    const button = document.getElementById('add-event-btn');
    //


    try {
        //cargando..

        setButtonLoading(button,true);

        //
        const token = localStorage.getItem('token');
        
        // Preparar los datos en el formato exacto que espera el backend
        const requestBody = {
            nombre: appointmentData.clientName,
            telefono: appointmentData.clientPhone,
            fecha: appointmentData.date
        };

        console.log("Enviando datos al backend:", requestBody); // Para depuración

        const response = await fetch(API_ENDPOINTS.APPOINTMENTS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });
        
        // Verificar si la respuesta es OK antes de intentar parsear JSON
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }
        
        const data = await response.json();
        console.log("Respuesta del backend:", data); // Para depuración
        
        
            // Agregar el evento al calendario
        calendar.addEvent({
                id: data.id , // Usar ID del backend o uno temporal
                title: `${appointmentData.clientName} (${appointmentData.clientPhone})`,
                start: appointmentData.date,
                allDay: true,
                color: '#8e44ad',
                extendedProps: {
                    clientName: appointmentData.clientName,
                    clientPhone: appointmentData.clientPhone,
                    date: appointmentData.date
                }
            });
            
            Swal.fire('Turno creado', 'El turno se ha agendado correctamente', 'success');
        
    } catch (error) {
        console.error('Error al crear turno:', error);
        Swal.fire('Error', error.message , 'error');
    } finally {
        setButtonLoading(button,false);
    }
}

// Handler para clic en evento del calendario
function handleCalendarEventClick(info) {
    const event = info.event;
    Swal.fire({
        title: event.extendedProps.clientName,
        html: `
            <div style="text-align: left;">
                <p><strong>Teléfono:</strong> ${event.extendedProps.clientPhone}</p>
                <p><strong>Fecha:</strong> ${event.start.toLocaleDateString('es-ES', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                })}</p>
                
            </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'Eliminar',
        cancelButtonText: 'Cerrar',
        icon: 'info',
        confirmButtonColor: '#d33'
    }).then((result) => {
        if (result.isConfirmed) {
            deleteAppointment(event.id);
        }
    });
}

// Función para eliminar un turno
async function deleteAppointment(appointmentId) {

    //Acceso restringido
    const rol = localStorage.getItem('rol');
    // Verificar si el usuario es admin
    if (rol !== 'admin' && rol !== 'recep') {
        Swal.fire({
            title: 'Acceso restringido',
            text: 'Solo los administradores y recepcionistas pueden borrar turnos.',
            icon: 'error',
            confirmButtonText: 'Entendido'
        });
        return; // Salir de la función si no es admin
    }
    //


    //cargando..
    const button = document.getElementById('add-event-btn');
    //
    
    try {
        //cargando..

        setButtonLoading(button,true);

        //
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_ENDPOINTS.APPOINTMENTS}/${appointmentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (data.success) {
            const event = calendar.getEventById(appointmentId);
            if (event) event.remove();
            Swal.fire('Turno eliminado', '', 'success');
        } else {
            Swal.fire('Error', data.message || 'Error al eliminar el turno', 'error');
        }
    } catch (error) {
        Swal.fire('Error', error.message || 'No se pudo conectar al servidor', 'error');
    }finally{
        setButtonLoading(button, false)
    }
}

// Handler para clic en fecha del calendario
function handleDateClick(info) {
    document.getElementById('add-event-btn').click();
    setTimeout(() => {
        document.getElementById('event-date').value = info.dateStr;
    }, 100);
}

// Función para mantener activo el backend (mantengo tu código original)
async function wakeUpBackend() {
    try {
        const response = await fetch(`${API_URL}/ping`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        console.log('Backend activo:', response.ok);
        
    } catch (error) {
        console.error('Error al activar el backend:', error);
        
    }
}

//Funciones con la sesion de clientes
async function loadClients() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.CLIENTES, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar clientes');
        }
        
        const clients = await response.json();
        renderClients(clients);
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudieron cargar los clientes', error.message);
    }
}

// Función para renderizar clientes en la tabla
function renderClients(clients) {
    const clientsList = document.getElementById('clients-list');
    clientsList.innerHTML = '';
    
    clients.forEach(client => {
        const tr = document.createElement('tr');
        tr.dataset.clientId = client.id;
        tr.innerHTML = `
            <td>${client.nombre}</td>
            <td>${client.telefono}</td>
            <td>${client.fecha}</td>
            <td>
                <button class="btn btn-sm btn-view" data-id="${client.id}">
                    <i class="fas fa-file-invoice"></i> Factura
                </button>
                <button class="btn btn-sm btn-delete" data-id="${client.id}">
                <i class="fas fa-trash-alt"></i> Borrar
                </button>
            </td>
        `;
        clientsList.appendChild(tr);
    });
        
    // Agregar event listeners para ver facturas
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            showClientInvoice(e.target.dataset.id);
        });
    });

    // Agregar event listeners para borrar clientes
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteClient(e.target.dataset.id);
        });
    });
    
    // Agregar event listener para clic en fila
    document.querySelectorAll('#clients-list tr').forEach(row => {
        row.addEventListener('click', () => {
            showClientInvoice(row.dataset.clientId);
        });
    });
}

// Función para mostrar factura del cliente
async function showClientInvoice(clientId) {
    
    try {
        
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_ENDPOINTS.FACTURAS}/${clientId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error al cargar factura');
        }
        
        const facturaData = await response.json();
        
        // Extraer datos principales del cliente
        //const cliente = facturaData.datos_factura[0];
        const cliente = facturaData.datos_factura;
        const oferta = cliente.ofertas;

        //PRUEBAAAAAA

        const hasExtras = cliente.extras && cliente.extras.length > 0;
        
        //
        // Función para calcular totales
        const calculateTotals = () => {
            // Totales para la oferta
            const ofertaTotals = oferta.precios.reduce((acc, item) => {
                acc.impresion += item.subtotal_impresion || 0;
                acc.manoObra += item.subtotal_mano_obra || 0;
                acc.precioTotal += item.precio_total || 0;
                return acc;
            }, { impresion: 0, manoObra: 0, precioTotal: 0 });

            // Totales para extras
            const extrasTotals = hasExtras ? cliente.extras.reduce((acc, extra) => {
                acc.impresion += (extra.precios.subtotal_impresion || 0) * extra.cantidad;
                acc.manoObra += (extra.precios.subtotal_mano_obra || 0) * extra.cantidad;
                acc.precioTotal += (extra.precios.precio_total || 0) * extra.cantidad;
                return acc;
            }, { impresion: 0, manoObra: 0, precioTotal: 0 }):
             {impresion: 0, manoObra: 0, precioTotal: 0};

            // Totales generales
            return {
                impresion: ofertaTotals.impresion + extrasTotals.impresion,
                manoObra: ofertaTotals.manoObra + extrasTotals.manoObra,
                precioTotal: ofertaTotals.precioTotal + extrasTotals.precioTotal,
                ganancia: (ofertaTotals.precioTotal + extrasTotals.precioTotal) - 
                         (ofertaTotals.impresion + extrasTotals.impresion + 
                          ofertaTotals.manoObra + extrasTotals.manoObra)
            };
        };

        const totals = calculateTotals();

        //Prueba extras
        // Función para generar HTML de extras (maneja caso sin extras)
        const getExtrasDetails = () => {
            if (!hasExtras) {
                return `
                    <tr>
                        <td colspan="5" style="text-align: center; font-style: italic;">
                            No se seleccionaron productos extras
                        </td>
                    </tr>
                `;
            }
            
            return cliente.extras.map(extra => `
                <tr>
                    <td>${extra.precios.nombre_producto.replace(/_/g, ' ')} (x${extra.cantidad})</td>
                    <td>$${(extra.precios.precio_total * extra.cantidad).toFixed(2)}</td>
                    <td>$${(extra.precios.subtotal_impresion * extra.cantidad).toFixed(2)}</td>
                    <td>$${(extra.precios.subtotal_mano_obra * extra.cantidad).toFixed(2)}</td>
                    <td>$${(extra.precios.precio_total * extra.cantidad - 
                           extra.precios.subtotal_impresion * extra.cantidad - 
                           extra.precios.subtotal_mano_obra * extra.cantidad).toFixed(2)}</td>
                </tr>
            `).join('');
        };
        //


       // Función para generar HTML de la factura de control
        const getControlInvoiceHTML = () => {
            // Detalles de la oferta
            const ofertaDetails = oferta.precios.map(item => `
                <tr>
                    <td>${item.nombre_producto.replace(/_/g, ' ')}</td>
                    <td>$${item.precio_total.toFixed(2)}</td>
                    <td>$${item.subtotal_impresion.toFixed(2)}</td>
                    <td>$${item.subtotal_mano_obra.toFixed(2)}</td>
                    <td>$${(item.precio_total - item.subtotal_impresion - item.subtotal_mano_obra).toFixed(2)}</td>
                </tr>
            `).join('');

            // Detalles de extras

            const extrasSection = hasExtras ?  `
            <h5>Productos Extras:</h5>
        <table class="invoice-table">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th>Precio</th>
                    <th>Impresión</th>
                    <th>Mano Obra</th>
                    <th>Ganancia</th>
                </tr>
            </thead>
            <tbody>
                ${cliente.extras.map(extra => `
                    <tr>
                        <td>${extra.precios.nombre_producto.replace(/_/g, ' ')} (x${extra.cantidad})</td>
                        <td>$${(extra.precios.precio_total * extra.cantidad).toFixed(2)}</td>
                        <td>$${(extra.precios.subtotal_impresion * extra.cantidad).toFixed(2)}</td>
                        <td>$${(extra.precios.subtotal_mano_obra * extra.cantidad).toFixed(2)}</td>
                        <td>$${(extra.precios.precio_total * extra.cantidad - 
                               extra.precios.subtotal_impresion * extra.cantidad - 
                               extra.precios.subtotal_mano_obra * extra.cantidad).toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    ` : `           <h5>Productos Extras:</h5>
                    <div style="margin-bottom: 10px;"></div>
                    <tr>
                        <td colspan="5" style="text-align: center; font-style: italic;">
                            No se seleccionaron productos extras
                        </td>
                    </tr>
                    <div style="margin-bottom: 10px;"></div>
                ` ; // Si no hay extras, devuelve cadena


            return `
                <div style="text-align: left; max-height: 70vh; overflow-y: auto;">
                    <h4>Factura de Control - Detalles Financieros</h4>
                    
                    <h5>Oferta (#${oferta.numero_oferta}):</h5>
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Precio</th>
                                <th>Impresión</th>
                                <th>Mano Obra</th>
                                <th>Ganancia</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ofertaDetails}
                        </tbody>
                    </table>
                    
                    ${extrasSection}
                        
                    
                    
                    <h5>Resumen Financiero:</h5>
                    <table class="invoice-table">
                        <tr>
                            <td><strong>Total Impresión:</strong></td>
                            <td>$${totals.impresion.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Mano Obra:</strong></td>
                            <td>$${totals.manoObra.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Gastos:</strong></td>
                            <td>$${(totals.impresion + totals.manoObra).toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>Total Facturado:</strong></td>
                            <td>$${totals.precioTotal.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td><strong>Ganancia Neta:</strong></td>
                            <td>$${totals.ganancia.toFixed(2)}</td>
                        </tr>
                    </table>
                </div>
            `;
        };


        //
        
        // Calcular totales
        const totalExtras = hasExtras ? cliente.extras.reduce((sum, extra) => sum + extra.precios.precio_total * extra.cantidad, 0): 0;
        const totalOferta = oferta.precios.reduce((sum, item) => sum + item.precio_total, 0);
        const totalGeneral = totalOferta + totalExtras;
        
        // Formatear productos de la oferta
        const productosOfertaHTML = oferta.precios
            .filter(item => item.precio_total > 0) // Mostrar solo items con precio
            .map(item => `
                <tr>
                    <td>${item.nombre_producto.replace(/_/g, ' ')}</td>
                    
                    <td>$${item.precio_total.toFixed(2)}</td>
                </tr>
            `).join('');
        
        // Formatear productos extras
        const productosExtrasHTML = hasExtras ? cliente.extras.map(extra => `
            <tr>
                <td>${extra.precios.nombre_producto.replace(/_/g, ' ')}</td>
                <td>${extra.cantidad}</td>
                <td>$${(extra.precios.precio_total * extra.cantidad).toFixed(2)}</td>
            </tr>
        `).join('') :
        `<tr>
                <td colspan="3" style="text-align: center; font-style: italic;">
                    No se seleccionaron productos extras
                </td>
            </tr>`
        ;
        
        // Mostrar el modal con la factura
        const { isConfirmed } = await Swal.fire({
            title: `Factura del cliente ${cliente.nombre}`,
            html: `
                <div style="text-align: left; max-height: 70vh; overflow-y: auto;">
                    <h4>Información del cliente:</h4>
                    <p><strong>Nombre:</strong> ${cliente.nombre}</p>
                    <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
                    
                    <h4>Oferta contratada (#${oferta.numero_oferta}):</h4>
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                
                                <th>Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productosOfertaHTML}
                        </tbody>
                    </table>
                    
                    <h4>Detalles de la oferta:</h4>
                    <ul>
                        <li>Fotos incluidas: ${oferta.cantidad_fotos}</li>
                        <li>Cambios de ropa incluidos: ${oferta.cambios_ropa}</li>
                        ${oferta.maquillaje ? '<li>Incluye maquillaje</li>' : ''}
                        <li>Photobook de 8x12 de ${oferta.photobook_8x12_pliegos} pliegos</li>
                        ${oferta.photobook_6x8_pliegos ? `<li>Photbook de 6x8 de ${oferta.photobook_6x8_pliegos} pliegos</li>` : ''}
                        ${oferta.caja ? '<li>Incluye caja</li>' : ''}
                        <li>Incluye ${oferta.cant_lona_60x90} lona de 60x90 </li>
                        ${oferta.bolsa ? '<li>Incluye bolsa</li>' : ''}
                        ${oferta.postalitas ? `<li>${oferta.postalitas} postalitas</li>` : ''}
                        ${oferta.llavero ? '<li>Incluye llavero</li>' : ''}
                        ${oferta.gigantrografia ? '<li>Incluye gigantografia</li>' : ''}
                        ${oferta.cuadro_acrilico ? '<li>Incluye cuadro acrilico</li>' : ''}
                        ${oferta.revista ? '<li>Incluye revista</li>' : ''}
                    </ul>

                    <h4>Productos extras:</h4>
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${productosExtrasHTML}
                        </tbody>
                    </table>
                    
                    <h4>Resumen:</h4>
                    <p><strong>Total Oferta:</strong> $${totalOferta.toFixed(2)}</p>
                    <p><strong>Total Extras:</strong> $${totalExtras.toFixed(2)}</p>
                    <p><strong>Total General:</strong> $${totalGeneral.toFixed(2)}</p>
                    
                  
                </div>
            `,
            width: '800px',
            showConfirmButton: true,
            confirmButtonText: 'Cerrar',
            showCloseButton: true,
            //showDenyButton: true,
            //denyButtonText: 'Factura de Control',
            footer: `
        <div class="footer-buttons">
            <button id="control-invoice-btn" class="custom-footer-btn">
                <i class="fas fa-file-invoice-dollar"></i> Factura de Control
            </button>
        </div>
    `,
            customClass: {
                container: 'invoice-modal',
                popup: 'invoice-popup'
            },

            didOpen: () => {
        // Event listener para el botón personalizado
        document.getElementById('control-invoice-btn')
            .addEventListener('click', async () => {

                //Acceso restringido
                const rol = localStorage.getItem('rol');
                // Verificar si el usuario es admin
               if (rol !== 'admin') {
               Swal.fire({
               title: 'Acceso restringido',
               text: 'Solo los administradores pueden acceder a la factura de control.',
               icon: 'error',
            confirmButtonText: 'Entendido'
                });
                return; // Salir de la función si no es admin
                }
                 //
                await Swal.fire({
                    title: `Factura de Control - ${cliente.nombre}`,
                    html: getControlInvoiceHTML(),
                    width: '800px',
                    confirmButtonText: 'Cerrar',
                    //icon: 'success'
                });
            });
    }
            
        });

    

       


    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', error.message, 'error');
    }
}

//prueba
function setupClientForm() {
        
    const form = document.getElementById('create-client-form');
    
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
      
        //cargando

        const submitButton = this.querySelector('.btn-submit');

        //
        
        // Obtener valores del formulario
        const nombre = form.nombre.value.trim();
        const telefono = form.telefono.value.trim();
        const fecha = form.fecha.value;
        const ofertaSeleccionada = form.oferta.value;
        
        //


        // Validaciones básicas
        if (!nombre || !telefono || !fecha || !ofertaSeleccionada) {
            Swal.fire('Error', 'Por favor complete todos los campos', 'error');
            return;
        }

        // Crear objeto con los datos del cliente
        const clientData = {
            nombre: nombre,
            telefono: telefono,
            fecha: fecha,
            oferta_id: OFERTAS_MAP[ofertaSeleccionada] || 1 // Default a oferta 1 si no hay match
        };

        try {
            //cargando..
            setButtonLoading(submitButton, true);
            //
            // Crear el cliente en el backend
            const createdClient = await createClient(clientData);

            // 2. Obtener productos extras seleccionados
            const extrasSeleccionados = getSelectedExtras(form);

            if (extrasSeleccionados.length > 0) {
                await createClientExtras(createdClient.id, extrasSeleccionados);
            }
            // Crear factura
            crearFactura(createdClient.id)


            


            // Mostrar mensaje de éxito
            Swal.fire({
                title: 'Éxito',
                text: 'Cliente creado correctamente',
                icon: 'success'
            });

            // Actualizar lista de clientes
            loadClients();
            
            // Resetear formulario
            form.reset();
            
            
        } catch (error) {
            Swal.fire({
                title: 'Error',
                text: error.message,
                icon: 'error'
            });
        }finally{
            setButtonLoading(submitButton, false);
        }
    });

    // Configurar botón cancelar
    const cancelBtn = document.getElementById('cancel-client-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', function() {
            form.reset();
            // También puedes resetear las cantidades de extras aquí
            document.querySelectorAll('.qty-input').forEach(input => {
                input.value = '0';
                input.disabled = true;
            });
        });
    }

    setupExtrasQuantityControls();

}

// Función para crear cliente en el backend
async function createClient(clientData) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.CLIENTES, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(clientData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Error al crear cliente');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al crear cliente:', error);
        throw error;
    }
}

// Función para obtener los extras seleccionados del formulario
function getSelectedExtras(form) {
    const extras = [];
    
    // Recorrer todos los checkboxes de extras
    Array.from(form.elements['extra']).forEach(checkbox => {
        if (checkbox.checked) {
            const extraId = EXTRAS_MAP[checkbox.value];
            const cantidad = parseInt(form[`${checkbox.value}_qty`].value) || 1;
            
            
            if (extraId) {
                extras.push({
                    extra_id: extraId,
                    cantidad: cantidad
                });
            }
        }
    });
    


    
    return extras;
}


//


// Función para configurar los controles de cantidad de extras
function setupExtrasQuantityControls() {
    // Configurar botones +/- para cantidad
    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const target = this.getAttribute('data-target');
            const input = document.getElementsByName(target)[0];
            const currentValue = parseInt(input.value) || 0;
            
            if (this.classList.contains('minus')) {
                input.value = Math.max(0, currentValue - 1);
            } else {
                input.value = currentValue + 1;
            }
        });
    });

    // Habilitar/deshabilitar inputs de cantidad cuando se marca/desmarca el checkbox
    document.querySelectorAll('input[name="extra"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const target = `${this.value}_qty`;
            const input = document.getElementsByName(target)[0];
            input.disabled = !this.checked;
            if (!this.checked) input.value = '0';
        });
    });
}

// Función para crear los extras asociados a un cliente
async function createClientExtras(clienteId, extras) {
    try {
        const token = localStorage.getItem('token');
        
        // Crear cada extra asociado al cliente
        const promises = extras.map(extra => {
            const extraData = {
                cliente_id: clienteId,
                extra_id: extra.extra_id,
                cantidad: extra.cantidad
            };
            
            return fetch(API_ENDPOINTS.EXTRAS, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(extraData)
            });
        });
        
        // Esperar a que todas las creaciones terminen
        const responses = await Promise.all(promises);
        
        // Verificar si alguna respuesta falló
        for (const response of responses) {
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al crear algunos productos extras');
            }
        }
        
        return await Promise.all(responses.map(r => r.json()));
    } catch (error) {
        console.error('Error al crear extras:', error);
        throw error;
    }
}

//Crear factura
async function crearFactura(clienteId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/facturas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        cliente_id: clienteId // Solo enviamos el ID del cliente
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Error al crear factura');
    }

    const facturaCreada = await response.json();
    return facturaCreada;
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// Función para borrar un cliente y todos sus datos relacionados
async function deleteClient(clientId) {

    //Acceso restringido
                const rol = localStorage.getItem('rol');
                // Verificar si el usuario es admin
               if (rol !== 'admin') {
               return; // Salir de la función si no es admin
                }
                 //

    try {
        // Confirmación antes de borrar
        const { isConfirmed } = await Swal.fire({
            title: '¿Estás seguro?',
            text: "¡No podrás revertir esto! Se borrarán todos los datos relacionados con este cliente.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Sí, borrar',
            cancelButtonText: 'Cancelar'
        });
        
        if (!isConfirmed) return;

                
        const token = localStorage.getItem('token');
        
        // 1. borramos al cliente
        await fetch(`${API_URL}/cliente/${clientId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
            
       
        
        // Actualizar la lista de clientes
        await loadClients();
        
        Swal.fire(
            '¡Borrado!',
            'El cliente y todos sus datos relacionados han sido eliminados.',
            'success'
        );
        
    } catch (error) {
        console.error('Error al borrar cliente:', error);
        Swal.fire(
            'Error',
            'No se pudo borrar el cliente: ' + error.message,
            'error'
        );
    }
}

//prueba extrassss//

async function loadExtras() {
    try {
        const response = await fetch('partials/extras.html');
        if (!response.ok) throw new Error('No se pudo cargar los extras');
        
        const html = await response.text();
        document.getElementById('extras-container').innerHTML = html;
        
        // Configurar los eventos después de cargar
        setupExtrasEvents();
    } catch (error) {
        console.error('Error cargando extras:', error);
        // Puedes mostrar un mensaje al usuario si lo deseas
    }
}

// Función para configurar eventos (la que ya tenías)
function setupExtrasEvents() {
    // Configurar botones +/- para cantidad
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('qty-btn')) {
            const target = e.target.getAttribute('data-target');
            const input = document.querySelector(`input[name="${target}"]`);
            if (!input) return;

            const currentValue = parseInt(input.value) || 0;
            
            if (e.target.classList.contains('minus')) {
                input.value = Math.max(0, currentValue - 1);
            } else {
                input.value = currentValue + 1;
            }
        }
    });

    // Configurar eventos para los checkboxes
    document.querySelectorAll('input[name="extra"]').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const target = `${this.value}_qty`;
            const input = document.querySelector(`input[name="${target}"]`);
            if (input) {
                input.disabled = !this.checked;
                if (!this.checked) input.value = '0';
            }
        });
    });
}

////////////////////////////////financiero
// 1. Función para cargar los datos
async function loadPrices() {
    const button = document.getElementById('refresh-prices-btn');
    //Acceso restringido
    const rol = localStorage.getItem('rol');
     // Verificar si el usuario es admin
     if (rol !== 'admin') {
         return; // Salir de la función si no es admin
       }
                 //
    try {
        //cargando..
        setButtonLoading(button, true);
        //cargando
        showLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/precios`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error(`Error ${response.status}`);
        
        const data = await response.json();
        currentPrices = data.map(item => ({
            id: item.id,
            nombre: item.nombre_producto,
            precio: item.precio_producto,
            costo_impresion: item.pago_impresion,
            costo_mano_obra: item.pago_mano_obra,
            cantidad: item.cantidad,
            oferta_id: item.oferta_id
        }));
        originalPrices = JSON.parse(JSON.stringify(currentPrices)); // Copia profunda
        renderPricesTable();
        

        
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudieron cargar los precios', 'error');
    }finally {
        showLoading(false);
        setButtonLoading(button, false);
    }
}

// 2. Función para renderizar la tabla
function renderPricesTable() {
     pricesTable.innerHTML = '';
    
    currentPrices.forEach((item, index) => {
        const row = document.createElement('tr');
        row.dataset.id = item.id;
        row.dataset.index = index;
        
        const ganancia = (item.precio * item.cantidad) - 
                        (item.costo_impresion * item.cantidad) - 
                        (item.costo_mano_obra * item.cantidad);
        
        row.innerHTML = `
            <td>${item.oferta_id}</td>
            <td>${item.nombre}</td>
            <td>
                <input type="number" value="${item.precio}" 
                       data-field="precio" step="0.01" min="0">
            </td>
            <td>
                <input type="number" value="${item.costo_impresion}" 
                       data-field="costo_impresion" step="0.01" min="0">
            </td>
            <td>
                <input type="number" value="${item.costo_mano_obra}" 
                       data-field="costo_mano_obra" step="0.01" min="0">
            </td>
             <td>
                <input type="number" value="${item.cantidad}" 
                       data-field="cantidad" step="0.01" min="0">
            </td>            
            <td class="ganancia-cell">${ganancia.toFixed(2)}</td>
        `;
        
        pricesTable.appendChild(row);
    });
    
    setupInputEvents();
}


// 3. Configurar eventos de los inputs
function setupInputEvents() {
    document.querySelectorAll('#prices-list input').forEach(input => {
        input.addEventListener('input', function() {
            const row = this.closest('tr');
            const index = row.dataset.index;
            const field = this.dataset.field;
            const value = parseFloat(this.value) || 0;
            
            // Actualizar datos
            currentPrices[index][field] = value;
            
            // Recalcular ganancia
            const item = currentPrices[index];
            const ganancia = (item.precio * item.cantidad) - 
                           (item.costo_impresion * item.cantidad) - 
                           (item.costo_mano_obra * item.cantidad);
            row.querySelector('.ganancia-cell').textContent = ganancia.toFixed(2);
            
            // Verificar cambios
            checkForChanges();
        });
    });
}

// 4. Función para guardar cambios
async function savePriceChanges() {
    const button = document.getElementById('refresh-prices-btn');
    try {
        //cargando..
        setButtonLoading(button, true);
        //
        showLoading(true);
        saveBtn.disabled = true;
        // Filtrar solo los items que han cambiado
        const changes = currentPrices.filter((item, index) => 
            JSON.stringify(item) !== JSON.stringify(originalPrices[index])
        );
        
        if (changes.length === 0) {
            Swal.fire('Info', 'No hay cambios para guardar', 'info');
            return;
        }

        const cambiosParaBackend = changes.map(item => ({
            id: item.id,
            nombre_producto: item.nombre,
            precio_producto: item.precio,
            pago_impresion: item.costo_impresion,
            pago_mano_obra: item.costo_mano_obra,
            cantidad: item.cantidad,
            oferta_id: item.oferta_id
        }));
        
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/precios`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ cambios: cambiosParaBackend })
        });
        
        if (!response.ok) throw new Error(await response.text());


        const result = await response.json();
        showSuccess(result.message);
                
        // Actualizar los originales con los nuevos valores
        originalPrices = JSON.parse(JSON.stringify(currentPrices));
        
        
        
    } catch (error) {
        console.error('Error:', error);
        Swal.fire('Error', 'No se pudieron guardar los cambios', 'error');
    }finally {
        showLoading(false);
        setButtonLoading(button, false);
    }
}

// Helpers UI
function showLoading(loading) {
    if (loading) {
        document.body.classList.add('loading');
    } else {
        document.body.classList.remove('loading');
    }
}

function showSuccess(message) {
    Swal.fire('Éxito', message, 'success');
}

function showError(message) {
    Swal.fire('Error', message, 'error');
}

function showInfo(message) {
    Swal.fire('Información', message, 'info');
}

function checkForChanges() {
    const hasChanges = currentPrices.some((item, index) => 
        JSON.stringify(item) !== JSON.stringify(originalPrices[index])
    );
    saveBtn.disabled = !hasChanges;
}


//transportacion de extras
function renderExtras() {
    const container = document.getElementById('extras-container');
    container.innerHTML = '';

    // Convertir EXTRAS_MAP a un array de objetos con nombre y valor
    const extrasList = Object.entries(EXTRAS_MAP).map(([value, id]) => {
        // Convertir el value (como '12_postalitas') a un nombre legible
        const name = value.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        
        return {
            id: id,
            name: name,
            value: value
        };
    });

    // Generar el HTML para cada extra
    extrasList.forEach(extra => {
        const extraHTML = `
            <div class="extra-item">
                <div class="extra-control">
                    <label class="extra-checkbox">
                        <input type="checkbox" name="extra" value="${extra.value}">
                        <span class="custom-checkbox"></span>
                        <span class="extra-name">${extra.name}</span>
                    </label>
                    <div class="extra-qty">
                        <button type="button" class="qty-btn minus" data-target="${extra.value}_qty">-</button>
                        <input type="number" name="${extra.value}_qty" min="0" value="0" class="qty-input" disabled>
                        <button type="button" class="qty-btn plus" data-target="${extra.value}_qty">+</button>
                    </div>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', extraHTML);
    });

    // Configurar los eventos para los nuevos elementos
    //setupExtrasQuantityControls();
}

// Función para manejar estados de carga en botones
function setButtonLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${button.textContent.trim()}`;
    } else {
        button.disabled = false;
        // Restaurar el contenido original del botón
        if (button.id === 'add-event-btn') {
            button.innerHTML = '<i class="fas fa-plus"></i> Nuevo Turno';
        } else if (button.id === 'add-client-btn') {
            button.innerHTML = '<i class="fas fa-user-plus"></i> Nuevo Cliente';
        } else if (button.id === 'refresh-prices-btn') {
            button.innerHTML = '<i class="fas fa-sync-alt"></i> Actualizar Lista';
        } else if (button.id === 'save-prices-btn') {
            button.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
        } else if (button.classList.contains('btn-submit')) {
            button.innerHTML = '<i class="fas fa-check-circle"></i> Confirmar Factura';
        }
    }
}

//prueba