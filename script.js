let html5QrcodeScanner;
let busDetectado = "";

// Esperar a que el HTML cargue por completo
document.addEventListener("DOMContentLoaded", () => {
    // Inicializar el escáner QR de la librería
    html5QrcodeScanner = new Html5QrcodeScanner(
        "reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
    );
    
    // Ejecutar funciones al detectar un código exitoso
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);

    // Asignar eventos a los botones de Entrada y Salida
    document.getElementById("btn-entrada").addEventListener("click", () => registrarMovimiento("ENTRADA"));
    document.getElementById("btn-salida").addEventListener("click", () => registrarMovimiento("SALIDA"));
});

// Qué pasa cuando se escanea exitosamente un QR
function onScanSuccess(decodedText, decodedResult) {
    busDetectado = decodedText; // Guardamos lo que dice el QR (Ej: "BUS-05")
    
    // Mostrar el contenedor de resultados y el nombre del bus
    document.getElementById("qr-data").innerText = decodedText;
    document.getElementById("result-container").classList.remove("hidden");
}

// Manejo de errores de lectura (pasa constantemente mientras busca códigos, se puede dejar vacío)
function onScanFailure(error) {
    // No ponemos alertas aquí para evitar saturar la pantalla de errores mientras busca.
}

// Función para registrar el movimiento en la tabla visual
function registrarMovimiento(tipo) {
    if (!busDetectado) return;

    const tablaBody = document.querySelector("#logs-table tbody");
    const ahora = new Date();
    
    // Formatear la fecha y hora de manera legible
    const fechaHoraStr = ahora.toLocaleDateString() + " " + ahora.toLocaleTimeString();

    // Crear una nueva fila en la tabla
    const nuevaFila = document.createElement("tr");
    
    // Aplicar un color sutil según el tipo de acción
    const estiloTipo = tipo === "ENTRADA" ? "color: #2f855a; font-weight: bold;" : "color: #c53030; font-weight: bold;";

    nuevaFila.innerHTML = `
        <td>${fechaHoraStr}</td>
        <td><strong>${busDetectado}</strong></td>
        <td style="${estiloTipo}">${tipo}</td>
    `;

    // Insertar el nuevo registro al principio de la tabla
    tablaBody.insertBefore(nuevaFila, tablaBody.firstChild);

    // Limpiar el escáner para el siguiente bus
    document.getElementById("result-container").classList.add("hidden");
    busDetectado = "";
    
    alert(`Movimiento de ${tipo} registrado con éxito.`);
}