/**
 * Utilidades para exportar datos en diferentes formatos
 */

/**
 * Exporta datos a un archivo CSV
 * @param data Array de objetos a exportar
 * @param filename Nombre del archivo (sin extensión)
 */
export function exportToCSV(data: any[], filename: string): void {
  if (!data || !data.length) {
    console.error('No hay datos para exportar');
    return;
  }

  try {
    // Obtener encabezados (todas las claves únicas de todos los objetos)
    const headers = Array.from(
      new Set(
        data.reduce((keys, obj) => {
          return keys.concat(Object.keys(obj));
        }, [] as string[])
      )
    );

    // Crear contenido CSV
    const csvContent = [
      // Encabezados
      headers.join(','),
      // Filas de datos
      ...data.map(item => {
        return headers.map(header => {
          const value = item[header];
          // Manejar valores especiales
          if (value === null || value === undefined) {
            return '';
          }
          if (typeof value === 'string') {
            // Escapar comillas y encerrar en comillas si contiene comas o comillas
            const escaped = value.replace(/"/g, '""');
            return /[,"]/.test(escaped) ? `"${escaped}"` : escaped;
          }
          if (value instanceof Date) {
            return value.toISOString();
          }
          if (typeof value === 'object') {
            // Convertir objetos a JSON y encerrar en comillas
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          return String(value);
        }).join(',');
      })
    ].join('\n');

    // Crear blob y descargar
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error al exportar a CSV:', error);
  }
}

/**
 * Exporta datos a un archivo JSON
 * @param data Datos a exportar
 * @param filename Nombre del archivo (sin extensión)
 */
export function exportToJSON(data: any, filename: string): void {
  if (!data) {
    console.error('No hay datos para exportar');
    return;
  }

  try {
    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error al exportar a JSON:', error);
  }
}

/**
 * Exporta datos a un archivo PDF
 * @param content Datos a exportar
 * @param filename Nombre del archivo (sin extensión)
 */
export async function exportToPDF(content: any, filename: string): Promise<void> {
  try {
    // Intentar importar jsPDF dinámicamente
    const jsPDFModule = await import('jspdf').catch(() => null);

    if (jsPDFModule) {
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF();

      // Si es un array, intentar crear una tabla
      if (Array.isArray(content)) {
        try {
          // Intentar importar autotable
          const autoTableModule = await import('jspdf-autotable').catch(() => null);

          if (autoTableModule) {
            const autoTable = autoTableModule.default;

            // Obtener encabezados y filas
            const headers = Object.keys(content[0]);
            const rows = content.map(item => headers.map(key => item[key]));

            // Crear tabla
            autoTable(doc, {
              head: [headers],
              body: rows,
              startY: 20,
              theme: 'grid',
              styles: { fontSize: 8, cellPadding: 2 },
              headStyles: { fillColor: [66, 139, 202], textColor: 255 }
            });
          } else {
            // Fallback: Convertir a texto simple
            let text = '';
            content.forEach((item: any, index: number) => {
              text += `Item ${index + 1}:\n`;
              Object.entries(item).forEach(([key, value]) => {
                text += `  ${key}: ${value}\n`;
              });
              text += '\n';
            });
            doc.text(text, 10, 10);
          }
        } catch (error) {
          console.error('Error al crear tabla en PDF:', error);
          doc.text(JSON.stringify(content, null, 2), 10, 10);
        }
      } else {
        // Si no es un array, convertir a texto
        doc.text(JSON.stringify(content, null, 2), 10, 10);
      }

      // Guardar PDF
      doc.save(`${filename}.pdf`);
      return;
    }

    // Fallback si no se puede importar jsPDF
    console.warn('jsPDF no disponible, usando fallback JSON');
    exportToJSON(content, filename);
  } catch (error) {
    console.error('Error al exportar a PDF:', error);
    // Fallback a JSON
    exportToJSON(content, filename);
  }
}

// Función para compartir datos a través de la API Web Share
export const shareData = async (title: string, text: string, url?: string) => {
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url
      })
      return true
    } catch (error) {
      console.error('Error al compartir:', error)
      return false
    }
  } else {
    // Fallback para navegadores que no soportan Web Share API
    if (url) {
      // Copiar URL al portapapeles
      await navigator.clipboard.writeText(url)
      return true
    }
    return false
  }
}

// Función para generar un enlace compartible
export const generateShareableLink = (data: any, baseUrl: string = window.location.origin) => {
  // Codificar datos como parámetros de URL o token
  const token = btoa(JSON.stringify(data))
  return `${baseUrl}/share?token=${encodeURIComponent(token)}`
}

// Función para decodificar un enlace compartible
export const decodeShareableLink = (token: string) => {
  try {
    return JSON.parse(atob(token))
  } catch (error) {
    console.error('Error al decodificar token:', error)
    return null
  }
}

/**
 * Exporta datos de salud a un archivo en el formato especificado
 * @param data Datos de salud a exportar
 * @param format Formato de exportación ('csv', 'json', 'pdf')
 * @param filename Nombre base del archivo
 */
export async function exportHealthData(data: any[], format: 'csv' | 'json' | 'pdf' = 'csv', filename: string = 'health-data'): Promise<void> {
  if (!data || !data.length) {
    console.error('No hay datos para exportar');
    return;
  }

  const fullFilename = `${filename}-${new Date().toISOString().split('T')[0]}`;

  switch (format) {
    case 'json':
      exportToJSON(data, fullFilename);
      break;
    case 'pdf':
      await exportToPDF(data, fullFilename);
      break;
    case 'csv':
    default:
      exportToCSV(data, fullFilename);
      break;
  }
}
