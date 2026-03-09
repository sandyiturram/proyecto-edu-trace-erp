/**
 * EduERP - Toast Notifications
 * Sistema de notificaciones tipo toast
 */

const Toast = {
    container: null,
    queue: [],
    maxVisible: 5,

    init() {
        this.container = document.getElementById('toast-container');
        if (!this.container) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    },

    /**
     * Muestra una notificación toast
     */
    show(message, type = 'info', options = {}) {
        const {
            duration = 4000,
            title = null,
            dismissible = true,
            action = null,
            actionText = 'Deshacer'
        } = options;

        const icons = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-icon">
                <i class="fas ${icons[type]}"></i>
            </div>
            <div class="toast-content">
                ${title ? `<div class="toast-title">${title}</div>` : ''}
                <div class="toast-message">${message}</div>
                ${action ? `<button class="toast-action">${actionText}</button>` : ''}
            </div>
            ${dismissible ? `<button class="toast-close"><i class="fas fa-times"></i></button>` : ''}
            <div class="toast-progress"></div>
        `;

        // Agregar al contenedor
        this.container.appendChild(toast);

        // Animar entrada
        requestAnimationFrame(() => {
            toast.classList.add('toast-show');
        });

        // Configurar progreso
        const progress = toast.querySelector('.toast-progress');
        progress.style.animationDuration = `${duration}ms`;

        // Manejar cierre
        const close = () => {
            toast.classList.remove('toast-show');
            toast.classList.add('toast-hide');
            setTimeout(() => toast.remove(), 300);
        };

        // Auto cerrar
        const timeout = setTimeout(close, duration);

        // Cerrar manual
        if (dismissible) {
            toast.querySelector('.toast-close').onclick = () => {
                clearTimeout(timeout);
                close();
            };
        }

        // Acción
        if (action) {
            toast.querySelector('.toast-action').onclick = () => {
                clearTimeout(timeout);
                action();
                close();
            };
        }

        // Pausar en hover
        toast.addEventListener('mouseenter', () => {
            progress.style.animationPlayState = 'paused';
        });
        toast.addEventListener('mouseleave', () => {
            progress.style.animationPlayState = 'running';
        });

        return toast;
    },

    /**
     * Muestra toast de éxito
     */
    success(message, options = {}) {
        return this.show(message, 'success', options);
    },

    /**
     * Muestra toast de error
     */
    error(message, options = {}) {
        return this.show(message, 'error', { duration: 6000, ...options });
    },

    /**
     * Muestra toast de advertencia
     */
    warning(message, options = {}) {
        return this.show(message, 'warning', options);
    },

    /**
     * Muestra toast de información
     */
    info(message, options = {}) {
        return this.show(message, 'info', options);
    },

    /**
     * Muestra toast de carga
     */
    loading(message) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-loading';
        toast.innerHTML = `
            <div class="toast-icon">
                <div class="spinner"></div>
            </div>
            <div class="toast-content">
                <div class="toast-message">${message}</div>
            </div>
        `;

        this.container.appendChild(toast);
        requestAnimationFrame(() => toast.classList.add('toast-show'));

        return {
            update: (newMessage) => {
                toast.querySelector('.toast-message').textContent = newMessage;
            },
            success: (msg) => {
                toast.remove();
                this.success(msg);
            },
            error: (msg) => {
                toast.remove();
                this.error(msg);
            },
            close: () => {
                toast.classList.remove('toast-show');
                toast.classList.add('toast-hide');
                setTimeout(() => toast.remove(), 300);
            }
        };
    },

    /**
     * Limpia todos los toasts
     */
    clear() {
        this.container.innerHTML = '';
    }
};

// CSS para toasts
const toastStyles = document.createElement('style');
toastStyles.textContent = `
    .toast-container { position: fixed; top: var(--space-6); right: var(--space-6); z-index: var(--z-toast); display: flex; flex-direction: column; gap: var(--space-3); max-width: 400px; }
    .toast { display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-4); background: var(--bg-secondary); border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); border-left: 4px solid; transform: translateX(120%); opacity: 0; transition: all 0.3s ease; position: relative; overflow: hidden; }
    .toast.toast-show { transform: translateX(0); opacity: 1; }
    .toast.toast-hide { transform: translateX(120%); opacity: 0; }
    .toast-info { border-left-color: var(--info-500); }
    .toast-success { border-left-color: var(--success-500); }
    .toast-warning { border-left-color: var(--warning-500); }
    .toast-error { border-left-color: var(--error-500); }
    .toast-icon { font-size: var(--font-size-xl); flex-shrink: 0; }
    .toast-info .toast-icon { color: var(--info-500); }
    .toast-success .toast-icon { color: var(--success-500); }
    .toast-warning .toast-icon { color: var(--warning-500); }
    .toast-error .toast-icon { color: var(--error-500); }
    .toast-content { flex: 1; min-width: 0; }
    .toast-title { font-weight: 600; color: var(--text-primary); margin-bottom: var(--space-1); }
    .toast-message { font-size: var(--font-size-sm); color: var(--text-secondary); }
    .toast-action { background: none; border: none; color: var(--primary-500); font-weight: 500; cursor: pointer; padding: 0; margin-top: var(--space-2); font-size: var(--font-size-sm); }
    .toast-action:hover { text-decoration: underline; }
    .toast-close { background: none; border: none; color: var(--text-tertiary); cursor: pointer; padding: var(--space-1); font-size: var(--font-size-sm); flex-shrink: 0; }
    .toast-close:hover { color: var(--text-primary); }
    .toast-progress { position: absolute; bottom: 0; left: 0; height: 3px; background: currentColor; opacity: 0.3; animation: toast-progress linear forwards; }
    @keyframes toast-progress { from { width: 100%; } to { width: 0%; } }
    .toast-loading .toast-icon { display: flex; }
    .spinner { width: 20px; height: 20px; border: 2px solid var(--neutral-200); border-top-color: var(--primary-500); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 480px) { .toast-container { left: var(--space-4); right: var(--space-4); top: auto; bottom: var(--space-4); max-width: none; } }
`;
document.head.appendChild(toastStyles);

// Hacer disponible globalmente
window.Toast = Toast;
