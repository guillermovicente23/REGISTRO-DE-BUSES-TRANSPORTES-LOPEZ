let html5QrcodeScanner;
let busDetectado = "";
let actividadSeleccionada = "";

document.addEventListener("DOMContentLoaded", () => {
    // Inicializar el escáner QR
    html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
    );
    
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    // Asignar eventos de Entrada y Salida finales
    document.getElementById("btn-entrada").addEventListener("click", () => registrarMovimiento("ENTRADA"));
    document.getElementById("btn-salida").addEventListener("click", () => registrarMovimiento("SALIDA"));
});

// Cuando se lee el QR con éxito
function onScanSuccess(decodedText, decodedResult) {
    busDetectado = decodedText;
    document.getElementById("qr-data").innerText = decodedText;
    
    // Mostramos el contenedor y nos aseguramos de arrancar en el Paso 1 (Actividades)
    document.getElementById("result-container").classList.remove("hidden");
    regresarAPaso1();
}

function onScanFailure(error) {
    // Silencioso para evitar alertas infinitas en pantalla
}

// Paso 1: Guardar qué actividad se eligió y saltar a Entrada/Salida
function seleccionarActividad(actividad) {
    actividadSeleccionada = actividad;
    
    // Colocar el nombre de la actividad en la etiqueta de guía
    document.getElementById("actividad-seleccionada").innerText = actividad;
    
    // Intercambiar pantallas visuales
    document.getElementById("step-actividad").classList.add("hidden");
    document.getElementById("step-direccion").classList.remove("hidden");
}

// Permite al usuario volver atrás si se equivocó de botón de color
function regresarAPaso1() {
    actividadSeleccionada = "";
    document.getElementById("step-direccion").classList.add("hidden");
    document.getElementById("step-actividad").classList.remove("hidden");
}

// Paso 2: Registro definitivo e inserción en la tabla
function registrarMovimiento(tipoMovimiento) {
    if (!busDetectado || !actividadSeleccionada) return;

    const tablaBody = document.querySelector("#logs-table tbody");
    const ahora = new Date();
    const fechaHoraStr = ahora.toLocaleDateString() + " " + ahora.toLocaleTimeString();

    const nuevaFila = document.createElement("tr");
    
    // Colores visuales en la tabla según el tipo de movimiento
    const estiloMovimiento = tipoMovimiento === "ENTRADA" ? "color: #2f855a; font-weight: bold;" : "color: #c53030; font-weight: bold;";
    
    // Estilos sutiles para la columna de actividad en la tabla
    let badgeColor = "";
    if(actividadSeleccionada === 'RUTA') badgeColor = "color: #2e7d32;";
    if(actividadSeleccionada === 'TALLER') badgeColor = "color: #c62828;";
    if(actividadSeleccionada === 'VIAJE') badgeColor = "color: #1565c0;";

    nuevaFila.innerHTML = `
        <td>${fechaHoraStr}</td>
        <td><strong>${busDetectado}</strong></td>
        <td style="${badgeColor} font-weight: bold;">${actividadSeleccionada}</td>
        <td style="${estiloMovimiento}">${tipoMovimiento}</td>
    `;

    // Insertar arriba en la tabla de control
    tablaBody.insertBefore(nuevaFila, tablaBody.firstChild);

    // Resetear todo el formulario para el próximo bus
    document.getElementById("result-container").classList.add("hidden");
    busDetectado = "";
    actividadSeleccionada = "";
    
    alert(`Registrado con éxito.`);
}
