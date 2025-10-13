// En ~/utils/exportUtils.js

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Genera un PDF a partir del contenido de un elemento HTML proporcionado.
 * * @param {HTMLElement} inputElement - El elemento del DOM a capturar (referencia de un useRef).
 * @param {string} filename - Nombre del archivo PDF.
 * @param {boolean} [addTimestamp=true] - Añadir marca de tiempo al pie de página.
 */
export const exportToPDF = async (inputElement, filename, addTimestamp = true) => {
    
    // 🛑 CAMBIO CLAVE: Usar el elemento directamente
    if (!inputElement) {
        console.error("Elemento del DOM no proporcionado para la exportación a PDF.");
        return;
    }

    const canvas = await html2canvas(inputElement, {
        scale: 2, // Mejor calidad
        useCORS: true,
        logging: false,
        allowTaint: true,
    });

    const imgData = canvas.toDataURL('image/jpeg', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4'); 

    const imgWidth = 210; 
    const pageHeight = 297; 
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    // Agregar la imagen al PDF (manejo de múltiples páginas)
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
        position = heightLeft - pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    // Opcional: Añadir marca de tiempo/pie de página al final de la última página
    if (addTimestamp) {
        pdf.setFontSize(8);
        pdf.setTextColor(150); // Color gris
        const timestamp = `Reporte generado: ${new Date().toLocaleString()}`;
        pdf.text(timestamp, 10, pageHeight - 10); // 10mm desde la izquierda y 10mm desde el fondo
    }

    pdf.save(filename);
};

// Renombra y reexporta para claridad (o usa un nuevo nombre, como 'exportToPDF')
// export const exportProductoPerformanceToPDF = exportToPDF; // Si quieres mantener el nombre antiguo para compatibilidad
// exportToPDF está ahora disponible para cualquier componente