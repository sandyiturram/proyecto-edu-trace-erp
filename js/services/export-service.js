/**
 * EDU-TRACE ERP - Export Service
 * Servicio de exportación a Excel, CSV, PDF, JSON
 */

const ExportService = {
    /**
     * Exporta a Excel usando SheetJS
     */
    async toExcel(data, filename, options = {}) {
        const { sheetName = 'Datos', headers = null, columnWidths = [] } = options;

        // Preparar datos
        let exportData = data;
        if (headers) {
            exportData = data.map(row => {
                const newRow = {};
                headers.forEach(h => {
                    // Usar directamente la clave especificada en el header
                    newRow[h.label] = row[h.key] ?? '';
                });
                return newRow;
            });
        }

        // Crear workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Aplicar anchos de columna
        if (columnWidths.length > 0) {
            ws['!cols'] = columnWidths.map(w => ({ wch: w }));
        }

        XLSX.utils.book_append_sheet(wb, ws, sheetName);

        // Descargar usando método nativo de la librería (maneja mejor los nombres)
        const fullFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
        XLSX.writeFile(wb, fullFilename);

        return true;
    },

    /**
     * Exporta a CSV
     */
    async toCSV(data, filename, options = {}) {
        const { separator = ';', headers = null } = options;

        if (data.length === 0) {
            Toast.show('No hay datos para exportar', 'warning');
            return false;
        }

        // Obtener encabezados
        const headerRow = headers
            ? headers.map(h => h.label)
            : Object.keys(data[0]);

        // Crear filas
        const rows = [headerRow.join(separator)];

        data.forEach(row => {
            const values = headers
                ? headers.map(h => this.formatCSVValue(row[h.key] ?? ''))
                : Object.values(row).map(v => this.formatCSVValue(v));
            rows.push(values.join(separator));
        });

        const csv = rows.join('\n');

        // Agregar BOM para Excel
        const bom = '\uFEFF';
        Helpers.downloadFile(bom + csv, `${filename}.csv`, 'text/csv;charset=utf-8');

        return true;
    },

    /**
     * Formatea valor para CSV
     */
    formatCSVValue(value) {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(';') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    },

    /**
     * Exporta a PDF usando jsPDF
     */
    async toPDF(data, filename, options = {}) {
        const {
            title = 'Reporte',
            subtitle = '',
            headers = null,
            orientation = 'portrait',
            pageSize = 'letter',
            companyName = '',
            date = new Date()
        } = options;

        const jsPDF = window.jspdf.jsPDF;
        const doc = new jsPDF(orientation, 'mm', pageSize);

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        let yPos = margin;

        // Logo y encabezado de empresa
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(companyName || 'EDU-TRACE ERP', margin, yPos);

        // Línea decorativa
        yPos += 5;
        doc.setDrawColor(10, 110, 209);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos, pageWidth - margin, yPos);

        // Título del reporte
        yPos += 10;
        doc.setFontSize(14);
        doc.text(title, margin, yPos);

        // Subtítulo y fecha
        if (subtitle) {
            yPos += 6;
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(subtitle, margin, yPos);
        }

        yPos += 6;
        doc.setFontSize(9);
        doc.setTextColor(100);
        doc.text(`Generado: ${Formatters.datetime(date)}`, margin, yPos);
        doc.setTextColor(0);

        yPos += 10;

        // Tabla de datos
        if (data.length > 0) {
            const tableHeaders = headers
                ? headers.map(h => h.label)
                : Object.keys(data[0]);

            const tableData = data.map(row => {
                return headers
                    ? headers.map(h => {
                        const val = row[h.key];
                        if (h.format === 'currency') return Formatters.currency(val);
                        if (h.format === 'date') return Formatters.date(val);
                        if (h.format === 'number') return Formatters.number(val);
                        return val ?? '';
                    })
                    : Object.values(row);
            });

            const autoTableOptions = {
                startY: yPos,
                head: [tableHeaders],
                body: tableData,
                theme: 'striped',
                headStyles: {
                    fillColor: [10, 110, 209],
                    textColor: 255,
                    fontSize: 9,
                    fontStyle: 'bold'
                },
                bodyStyles: {
                    fontSize: 8
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                },
                margin: { left: margin, right: margin },
                styles: {
                    overflow: 'linebreak',
                    cellPadding: 2
                }
            };

            if (typeof doc.autoTable === 'function') {
                doc.autoTable(autoTableOptions);
            } else if (window.jspdf && typeof window.jspdf.autoTable === 'function') {
                window.jspdf.autoTable(doc, autoTableOptions);
            } else if (typeof autoTable === 'function') {
                autoTable(doc, autoTableOptions);
            } else {
                Toast.error('El complemento para generar tablas PDF no se ha cargado correctamente.');
                return false;
            }
        }

        // Pie de página
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text(
                `Página ${i} de ${pageCount}`,
                pageWidth / 2,
                doc.internal.pageSize.getHeight() - 10,
                { align: 'center' }
            );
        }

        // Descargar usando método nativo
        const fullFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
        doc.save(fullFilename);

        return true;
    },

    /**
     * Exporta a JSON
     */
    async toJSON(data, filename) {
        const json = JSON.stringify(data, null, 2);
        Helpers.downloadFile(json, `${filename}.json`, 'application/json');
        return true;
    },

    /**
     * Importa desde Excel
     */
    async fromExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });

                    const result = {};
                    workbook.SheetNames.forEach(sheetName => {
                        const sheet = workbook.Sheets[sheetName];
                        result[sheetName] = XLSX.utils.sheet_to_json(sheet);
                    });

                    resolve(result);
                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(file);
        });
    },

    /**
     * Importa desde CSV
     */
    async fromCSV(file, separator = ';') {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const lines = text.split('\n').filter(l => l.trim());

                    if (lines.length < 2) {
                        resolve([]);
                        return;
                    }

                    const headers = lines[0].split(separator).map(h => h.trim().replace(/^"|"$/g, ''));
                    const data = [];

                    for (let i = 1; i < lines.length; i++) {
                        const values = lines[i].split(separator).map(v => v.trim().replace(/^"|"$/g, ''));
                        const row = {};
                        headers.forEach((h, idx) => {
                            row[h] = values[idx] ?? '';
                        });
                        data.push(row);
                    }

                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsText(file, 'UTF-8');
        });
    },

    /**
     * Importa desde JSON
     */
    async fromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (err) {
                    reject(err);
                }
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsText(file, 'UTF-8');
        });
    },

    /**
     * Genera reporte de Balance General en PDF
     */
    async balanceSheetPDF(balanceData, companyName) {
        const jsPDF = window.jspdf.jsPDF;
        const doc = new jsPDF('portrait', 'mm', 'letter');

        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 20;
        let y = margin;

        // Encabezado
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(companyName, pageWidth / 2, y, { align: 'center' });

        y += 8;
        doc.setFontSize(14);
        doc.text('BALANCE GENERAL', pageWidth / 2, y, { align: 'center' });

        y += 6;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Al ${Formatters.date(balanceData.date, 'long')}`, pageWidth / 2, y, { align: 'center' });

        y += 10;
        doc.setDrawColor(10, 110, 209);
        doc.setLineWidth(0.5);
        doc.line(margin, y, pageWidth - margin, y);

        y += 10;

        // Identificar cuentas para retener cuentas en 0 que tuvieron movimientos
        const activeIds = new Set();
        const company = CompanyService.getCurrent();
        if (company) {
            const entries = await DB.getByIndex('journalEntries', 'companyId', company.id);
            const postedEntries = entries.filter(e => e.status === 'posted');
            for (const e of postedEntries) {
                const lines = await DB.getByIndex('journalLines', 'entryId', e.id);
                if (lines) lines.forEach(l => activeIds.add(l.accountId));
            }
        }

        // Helper para secciones
        const addSection = (title, items, total) => {
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(title, margin, y);
            y += 6;

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');

            items.filter(i => i.balance !== 0 || activeIds.has(i.id)).forEach(item => {
                doc.text(`    ${item.name}`, margin, y);
                doc.text(Formatters.currency(item.balance), pageWidth - margin - 40, y, { align: 'right' });
                y += 5;
            });

            y += 2;
            doc.setFont('helvetica', 'bold');
            doc.text(`Total ${title}`, margin + 10, y);
            doc.text(Formatters.currency(total), pageWidth - margin - 40, y, { align: 'right' });
            y += 8;
        };

        addSection('ACTIVOS', balanceData.assets.items, balanceData.assets.total);
        addSection('PASIVOS', balanceData.liabilities.items, balanceData.liabilities.total);
        addSection('PATRIMONIO', balanceData.equity.items, balanceData.equity.total);

        // Resultado del ejercicio
        if (balanceData.netIncome !== 0) {
            doc.text('    Resultado del Ejercicio', margin, y);
            doc.text(Formatters.currency(balanceData.netIncome), pageWidth - margin - 40, y, { align: 'right' });
            y += 8;
        }

        // Línea final
        doc.setDrawColor(0);
        doc.line(margin, y, pageWidth - margin, y);
        y += 5;

        // Verificación de cuadre
        const totalPassiveEquity = balanceData.liabilities.total + balanceData.equity.total + balanceData.netIncome;
        doc.setFontSize(10);
        doc.text('TOTAL ACTIVOS:', margin, y);
        doc.text(Formatters.currency(balanceData.assets.total), pageWidth / 2 - 10, y, { align: 'right' });

        y += 5;
        doc.text('TOTAL PASIVO + PATRIMONIO:', margin, y);
        doc.text(Formatters.currency(totalPassiveEquity), pageWidth / 2 - 10, y, { align: 'right' });

        // Descargar usando método nativo
        const fullFilename = `Balance_General_${Formatters.date(balanceData.date).replace(/\//g, '-')}.pdf`;
        doc.save(fullFilename);

        return true;
    }
};

// Hacer disponible globalmente
window.ExportService = ExportService;
