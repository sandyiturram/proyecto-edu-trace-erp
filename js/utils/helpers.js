/**
 * EduERP - Helper Utilities
 * Funciones auxiliares para la aplicación
 */

const Helpers = {
    /**
     * Genera un ID único
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * Genera un número de documento secuencial
     */
    generateDocNumber(prefix, sequence) {
        const year = new Date().getFullYear();
        const seq = String(sequence).padStart(6, '0');
        return `${prefix}-${year}-${seq}`;
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Deep clone de un objeto
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Verifica si un objeto está vacío
     */
    isEmpty(obj) {
        if (obj === null || obj === undefined) return true;
        if (Array.isArray(obj)) return obj.length === 0;
        if (typeof obj === 'object') return Object.keys(obj).length === 0;
        if (typeof obj === 'string') return obj.trim() === '';
        return false;
    },

    /**
     * Capitaliza primera letra
     */
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    },

    /**
     * Slugify string
     */
    slugify(str) {
        return str
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    /**
     * Obtiene valor anidado de un objeto
     */
    getNestedValue(obj, path) {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    },

    /**
     * Ordena array de objetos
     */
    sortBy(array, key, order = 'asc') {
        return [...array].sort((a, b) => {
            const valA = this.getNestedValue(a, key);
            const valB = this.getNestedValue(b, key);

            if (valA < valB) return order === 'asc' ? -1 : 1;
            if (valA > valB) return order === 'asc' ? 1 : -1;
            return 0;
        });
    },

    /**
     * Filtra array de objetos por término de búsqueda
     */
    filterBySearch(array, searchTerm, keys) {
        if (!searchTerm) return array;
        const term = searchTerm.toLowerCase();
        return array.filter(item =>
            keys.some(key => {
                const value = this.getNestedValue(item, key);
                return value && String(value).toLowerCase().includes(term);
            })
        );
    },

    /**
     * Agrupa array por key
     */
    groupBy(array, key) {
        return array.reduce((acc, item) => {
            const groupKey = this.getNestedValue(item, key);
            if (!acc[groupKey]) acc[groupKey] = [];
            acc[groupKey].push(item);
            return acc;
        }, {});
    },

    /**
     * Suma valores de un array de objetos
     */
    sumBy(array, key) {
        return array.reduce((sum, item) => {
            const value = this.getNestedValue(item, key);
            return sum + (parseFloat(value) || 0);
        }, 0);
    },

    /**
     * Calcula porcentaje
     */
    percentage(value, total) {
        if (total === 0) return 0;
        return (value / total) * 100;
    },

    /**
     * Obtiene fecha actual formateada
     */
    getCurrentDate() {
        return new Date().toISOString().split('T')[0];
    },

    /**
     * Obtiene fecha más N días
     */
    getDatePlusDays(days) {
        const date = new Date();
        date.setDate(date.getDate() + days);
        return date.toISOString().split('T')[0];
    },

    /**
     * Obtiene primer y último día del mes
     */
    getMonthRange(date = new Date()) {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        return {
            start: firstDay.toISOString().split('T')[0],
            end: lastDay.toISOString().split('T')[0]
        };
    },

    /**
     * Obtiene primer y último día del año
     */
    getYearRange(year = new Date().getFullYear()) {
        return {
            start: `${year}-01-01`,
            end: `${year}-12-31`
        };
    },

    /**
     * Obtiene primer día del año actual
     */
    getFirstDayOfYear() {
        const year = new Date().getFullYear();
        return `${year}-01-01`;
    },

    /**
     * Valida RUT chileno
     */
    validateRUT(rut) {
        if (!rut || typeof rut !== 'string') return false;

        // Limpiar RUT: eliminar puntos, guiones y espacios
        const cleanRut = rut.replace(/[\.\-\s]/g, '').toUpperCase().trim();

        // Debe tener al menos 2 caracteres (cuerpo + dv)
        if (cleanRut.length < 2) return false;

        const body = cleanRut.slice(0, -1);
        const dv = cleanRut.slice(-1);

        // Verificar que el cuerpo sean solo números
        if (!/^\d+$/.test(body)) return false;

        // Verificar que el DV sea número o K
        if (!/^[\dK]$/.test(dv)) return false;

        // Calcular dígito verificador
        let sum = 0;
        let multiplier = 2;

        for (let i = body.length - 1; i >= 0; i--) {
            sum += parseInt(body[i], 10) * multiplier;
            multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }

        const remainder = sum % 11;
        const expectedDV = 11 - remainder;
        let calculatedDV;

        if (expectedDV === 11) {
            calculatedDV = '0';
        } else if (expectedDV === 10) {
            calculatedDV = 'K';
        } else {
            calculatedDV = String(expectedDV);
        }

        return dv === calculatedDV;
    },

    /**
     * Formatea RUT
     */
    formatRUT(rut) {
        if (!rut) return '';
        const cleanRut = rut.replace(/[.-]/g, '');
        const body = cleanRut.slice(0, -1);
        const dv = cleanRut.slice(-1);

        let formatted = '';
        for (let i = body.length - 1, j = 0; i >= 0; i--, j++) {
            if (j > 0 && j % 3 === 0) formatted = '.' + formatted;
            formatted = body[i] + formatted;
        }

        return `${formatted}-${dv}`;
    },

    /**
     * Valida email
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    /**
     * Espera ms milisegundos
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    },

    /**
     * Copia texto al portapapeles
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Error copying to clipboard:', err);
            return false;
        }
    },

    /**
     * Descarga archivo usando FileSaver.js para máxima compatibilidad
     */
    downloadFile(content, filename, mimeType = 'application/octet-stream') {
        const blob = new Blob([content], { type: mimeType });
        // Usar FileSaver.js saveAs() que funciona en todos los entornos
        if (typeof saveAs !== 'undefined') {
            saveAs(blob, filename);
        } else {
            // Fallback si FileSaver no está disponible
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
        }
    }
};

// Hacer helpers disponibles globalmente
window.Helpers = Helpers;
