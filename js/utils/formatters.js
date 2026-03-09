/**
 * EduERP - Formatters
 * Funciones de formateo para moneda, fechas, números
 */

const Formatters = {
    /**
     * Formatea número como moneda chilena (CLP)
     */
    currency(value, options = {}) {
        const { currency = 'CLP', decimals = 0, showSymbol = true } = options;
        const num = parseFloat(value) || 0;

        if (currency === 'CLP') {
            const formatted = num.toLocaleString('es-CL', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            });
            return showSymbol ? `$ ${formatted}` : formatted;
        }

        return num.toLocaleString('es-CL', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    /**
     * Formatea número con separadores de miles
     */
    number(value, decimals = 0) {
        const num = parseFloat(value) || 0;
        return num.toLocaleString('es-CL', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        });
    },

    /**
     * Formatea porcentaje
     */
    percentage(value, decimals = 1) {
        const num = parseFloat(value) || 0;
        return `${num.toFixed(decimals)}%`;
    },

    /**
     * Formatea fecha en formato chileno
     */
    date(dateString, format = 'short') {
        if (!dateString) return '-';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';

        const options = {
            short: { day: '2-digit', month: '2-digit', year: 'numeric' },
            medium: { day: '2-digit', month: 'short', year: 'numeric' },
            long: { day: '2-digit', month: 'long', year: 'numeric' },
            full: { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }
        };

        return date.toLocaleDateString('es-CL', options[format] || options.short);
    },

    /**
     * Formatea fecha y hora
     */
    datetime(dateString, showSeconds = false) {
        if (!dateString) return '-';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';

        const dateFormat = { day: '2-digit', month: '2-digit', year: 'numeric' };
        const timeFormat = { hour: '2-digit', minute: '2-digit' };
        if (showSeconds) timeFormat.second = '2-digit';

        return `${date.toLocaleDateString('es-CL', dateFormat)} ${date.toLocaleTimeString('es-CL', timeFormat)}`;
    },

    /**
     * Formatea tiempo relativo (hace X minutos, etc.)
     */
    relativeTime(dateString) {
        if (!dateString) return '-';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '-';

        const now = new Date();
        const diffMs = now - date;
        const diffSecs = Math.floor(diffMs / 1000);
        const diffMins = Math.floor(diffSecs / 60);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSecs < 60) return 'Hace un momento';
        if (diffMins < 60) return `Hace ${diffMins} min`;
        if (diffHours < 24) return `Hace ${diffHours}h`;
        if (diffDays < 7) return `Hace ${diffDays}d`;

        return this.date(dateString);
    },

    /**
     * Formatea nombre de cuenta contable
     */
    accountCode(code) {
        if (!code) return '';
        // Formato: 1.1.01.001
        const str = String(code).replace(/\D/g, '');
        if (str.length <= 1) return str;

        let result = str[0];
        if (str.length > 1) result += '.' + str[1];
        if (str.length > 2) result += '.' + str.substring(2, 4);
        if (str.length > 4) result += '.' + str.substring(4);

        return result;
    },

    /**
     * Trunca texto con ellipsis
     */
    truncate(text, maxLength = 50) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    },

    /**
     * Formatea tamaño de archivo
     */
    fileSize(bytes) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * Formatea número de documento
     */
    documentNumber(type, number) {
        const prefixes = {
            'invoice': 'FAC',
            'order': 'OC',
            'receipt': 'REC',
            'entry': 'AST',
            'payment': 'PAG'
        };
        const prefix = prefixes[type] || 'DOC';
        return `${prefix}-${String(number).padStart(6, '0')}`;
    },

    /**
     * Convierte número a palabras (para cheques)
     */
    numberToWords(num) {
        const units = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
        const teens = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
        const tens = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
        const hundreds = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

        if (num === 0) return 'cero';
        if (num === 100) return 'cien';

        let result = '';

        if (num >= 1000000) {
            const millions = Math.floor(num / 1000000);
            result += (millions === 1 ? 'un millón' : this.numberToWords(millions) + ' millones') + ' ';
            num %= 1000000;
        }

        if (num >= 1000) {
            const thousands = Math.floor(num / 1000);
            result += (thousands === 1 ? 'mil' : this.numberToWords(thousands) + ' mil') + ' ';
            num %= 1000;
        }

        if (num >= 100) {
            result += hundreds[Math.floor(num / 100)] + ' ';
            num %= 100;
        }

        if (num >= 20) {
            result += tens[Math.floor(num / 10)];
            if (num % 10 !== 0) result += ' y ' + units[num % 10];
        } else if (num >= 10) {
            result += teens[num - 10];
        } else if (num > 0) {
            result += units[num];
        }

        return result.trim();
    },

    /**
     * Formatea estado de documento
     */
    status(status) {
        const statusMap = {
            'draft': { label: 'Borrador', class: 'badge-neutral' },
            'pending': { label: 'Pendiente', class: 'badge-warning' },
            'approved': { label: 'Aprobado', class: 'badge-info' },
            'confirmed': { label: 'Confirmado', class: 'badge-info' },
            'delivered': { label: 'Entregado', class: 'badge-success' },
            'received': { label: 'Recibido', class: 'badge-success' },
            'posted': { label: 'Contabilizado', class: 'badge-success' },
            'paid': { label: 'Pagado', class: 'badge-success' },
            'partial': { label: 'Parcial', class: 'badge-warning' },
            'cancelled': { label: 'Anulado', class: 'badge-error' },
            'overdue': { label: 'Vencido', class: 'badge-error' }
        };
        return statusMap[status] || { label: status, class: 'badge-neutral' };
    }
};

// Hacer formatters disponibles globalmente
window.Formatters = Formatters;
