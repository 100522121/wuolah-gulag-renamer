// Referencias a elementos del DOM
const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");
const tableBody = document.querySelector("#fileTable tbody");
const downloadBtn = document.getElementById("downloadBtn");

// Almacena los archivos cargados por el usuario
let uploadedFiles = [];

/**
 * Renombra un archivo eliminando prefijos y sufijos de Wuolah y Gulag
 *
 * @param {string} filename -> Nombre original del archivo.
 * @returns {string} -> Nombre transformado.
 */
function renameFile(filename) {
    return filename
        .replace(/^wuolah-free-/, "")
        .replace(/-gulag-free(?=\.[^.]+$)/, "");
}

/**
 * Procesa la lista de archivos del usuario y habilita la descarga.
 *
 * @param {FileList|File[]} files -> Archivos recibidos desde input
 * @returns {void}
 */
function processFiles(files) {
    uploadedFiles = [...files];
    // Limpia la tabla antes de renderizar nuevos datos
    tableBody.innerHTML = "";

    uploadedFiles.forEach(file => {
        const newName = renameFile(file.name);
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${file.name}</td>
            <td>${newName}</td>
        `;

        tableBody.appendChild(row);
    });

    // Muestra el botón únicamente si existen archivos cargados
    downloadBtn.style.display =
        uploadedFiles.length > 0
            ? "inline-block"
            : "none";
}

// Apertura del selector de archivos al pulsar la zona de carga
dropZone.addEventListener("click", () => {
    fileInput.click();
});

// Gestión de archivos seleccionados desde el explorador
fileInput.addEventListener("change", (event) => {
    processFiles(event.target.files);
});

// Resalta visualmente la zona de carga durante el arrastre
dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("dragover");
});

// Elimina el resaltado al abandonar la zona de carga
dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

// Procesa los archivos soltados mediante drag & drop
dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("dragover");
    processFiles(event.dataTransfer.files);
});

// Genera y descarga un ZIP con los archivos renombrados
downloadBtn.addEventListener("click", async () => {
    const zip = new JSZip();

    // Añade cada archivo al ZIP con su nuevo nombre
    for (const file of uploadedFiles) {
        const newName = renameFile(file.name);
        zip.file(newName, file);
    }

    const blob = await zip.generateAsync({
        type: "blob"
    });

    // Crea una descarga temporal del ZIP generado
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "archivos-renombrados.zip";

    document.body.appendChild(link);
    link.click();
    link.remove();

    // Libera el recurso temporal creado por el navegador
    URL.revokeObjectURL(link.href);
});