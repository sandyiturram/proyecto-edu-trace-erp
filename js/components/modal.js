/**
 * EduERP - Modal Component
 * Componente de ventanas modales
 */

const Modal = {
    container: null,
    modal: null,
    isOpen: false,
    onClose: null,

    init() {
        this.container = document.getElementById('modal-container');
        this.modal = document.getElementById('modal');

        // Cerrar con botón X
        document.getElementById('modal-close')?.addEventListener('click', () => this.close());

        // Cerrar con click en overlay
        document.querySelector('.modal-overlay')?.addEventListener('click', () => this.close());

        // Cerrar con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) this.close();
        });
    },

    /**
     * Abre modal con configuración
     */
    open(options = {}) {
        const {
            title = 'Modal',
            content = '',
            footer = '',
            size = 'medium',
            onClose = null,
            closeOnOverlay = true
        } = options;

        this.onClose = onClose;

        // Configurar tamaño
        this.modal.className = `modal modal-${size}`;

        // Configurar contenido
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = content;
        document.getElementById('modal-footer').innerHTML = footer;

        // Configurar overlay
        if (!closeOnOverlay) {
            document.querySelector('.modal-overlay').style.pointerEvents = 'none';
        }

        // Mostrar
        this.container.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        this.isOpen = true;

        // Animar entrada
        requestAnimationFrame(() => {
            this.modal.classList.add('modal-open');
        });

        return this;
    },

    /**
     * Cierra el modal
     */
    close() {
        if (!this.isOpen) return;

        this.modal.classList.remove('modal-open');

        setTimeout(() => {
            this.container.classList.add('hidden');
            document.body.style.overflow = '';
            this.isOpen = false;

            if (this.onClose) this.onClose();
        }, 200);
    },

    /**
     * Modal de confirmación
     */
    confirm(options = {}) {
        const {
            title = 'Confirmar',
            message = '¿Está seguro?',
            confirmText = 'Confirmar',
            cancelText = 'Cancelar',
            confirmClass = 'btn-primary',
            onConfirm = () => { },
            onCancel = () => { }
        } = options;

        return new Promise((resolve) => {
            this.open({
                title,
                content: `<p class="confirm-message">${message}</p>`,
                footer: `
                    <button class="btn btn-secondary" id="modal-cancel">${cancelText}</button>
                    <button class="btn ${confirmClass}" id="modal-confirm">${confirmText}</button>
                `,
                size: 'small',
                onClose: () => {
                    onCancel();
                    resolve(false);
                }
            });

            document.getElementById('modal-cancel').onclick = () => {
                this.close();
                onCancel();
                resolve(false);
            };

            document.getElementById('modal-confirm').onclick = () => {
                this.close();
                onConfirm();
                resolve(true);
            };
        });
    },

    /**
     * Modal de alerta
     */
    alert(options = {}) {
        const {
            title = 'Aviso',
            message = '',
            type = 'info',
            buttonText = 'Aceptar'
        } = options;

        const icons = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle'
        };

        return new Promise((resolve) => {
            this.open({
                title,
                content: `
                    <div class="alert-modal alert-${type}">
                        <i class="fas ${icons[type]}"></i>
                        <p>${message}</p>
                    </div>
                `,
                footer: `<button class="btn btn-primary" id="modal-accept">${buttonText}</button>`,
                size: 'small'
            });

            document.getElementById('modal-accept').onclick = () => {
                this.close();
                resolve(true);
            };
        });
    },

    /**
     * Modal de formulario
     */
    form(options = {}) {
        const {
            title = 'Formulario',
            fields = [],
            data = {},
            submitText = 'Guardar',
            cancelText = 'Cancelar',
            onSubmit = () => { },
            validate = () => true
        } = options;

        const fieldsHtml = fields.map(field => {
            const value = data[field.name] ?? field.default ?? '';
            const required = field.required ? 'required' : '';
            const requiredMark = field.required ? '<span class="text-error">*</span>' : '';

            let input = '';

            switch (field.type) {
                case 'select':
                    const optionsHtml = field.options.map(opt =>
                        `<option value="${opt.value}" ${opt.value == value ? 'selected' : ''}>${opt.label}</option>`
                    ).join('');
                    input = `<select class="form-control" name="${field.name}" id="field-${field.name}" ${required}>${optionsHtml}</select>`;
                    break;

                case 'textarea':
                    input = `<textarea class="form-control" name="${field.name}" id="field-${field.name}" rows="${field.rows || 3}" ${required}>${value}</textarea>`;
                    break;

                case 'number':
                    input = `<input type="number" class="form-control" name="${field.name}" id="field-${field.name}" value="${value}" 
                        ${field.min !== undefined ? `min="${field.min}"` : ''} 
                        ${field.max !== undefined ? `max="${field.max}"` : ''} 
                        ${field.step ? `step="${field.step}"` : ''} ${required}>`;
                    break;

                case 'date':
                    input = `<input type="date" class="form-control" name="${field.name}" id="field-${field.name}" value="${value}" ${required}>`;
                    break;

                case 'checkbox':
                    input = `<label class="checkbox-item"><input type="checkbox" name="${field.name}" id="field-${field.name}" ${value ? 'checked' : ''}> ${field.checkLabel || ''}</label>`;
                    break;

                default:
                    input = `<input type="${field.type || 'text'}" class="form-control" name="${field.name}" id="field-${field.name}" value="${value}" 
                        ${field.placeholder ? `placeholder="${field.placeholder}"` : ''} ${required}>`;
            }

            return `
                <div class="form-group">
                    <label class="form-label" for="field-${field.name}">${field.label} ${requiredMark}</label>
                    ${input}
                    ${field.hint ? `<span class="form-hint">${field.hint}</span>` : ''}
                </div>
            `;
        }).join('');

        return new Promise((resolve) => {
            this.open({
                title,
                content: `<form id="modal-form" class="modal-form">${fieldsHtml}</form>`,
                footer: `
                    <button type="button" class="btn btn-secondary" id="modal-cancel">${cancelText}</button>
                    <button type="submit" form="modal-form" class="btn btn-primary" id="modal-submit">${submitText}</button>
                `,
                size: 'medium',
                closeOnOverlay: false
            });

            document.getElementById('modal-cancel').onclick = () => {
                this.close();
                resolve(null);
            };

            document.getElementById('modal-form').onsubmit = async (e) => {
                e.preventDefault();

                const formData = new FormData(e.target);
                const result = {};

                fields.forEach(field => {
                    if (field.type === 'checkbox') {
                        result[field.name] = formData.has(field.name);
                    } else if (field.type === 'number') {
                        result[field.name] = parseFloat(formData.get(field.name)) || 0;
                    } else {
                        result[field.name] = formData.get(field.name);
                    }
                });

                // Validar
                const validationResult = await validate(result);
                if (validationResult !== true) {
                    Toast.show(validationResult || 'Error de validación', 'error');
                    return;
                }

                await onSubmit(result);
                this.close();
                resolve(result);
            };
        });
    },

    /**
     * Actualiza contenido del modal
     */
    setContent(content) {
        document.getElementById('modal-body').innerHTML = content;
    },

    /**
     * Actualiza footer del modal
     */
    setFooter(footer) {
        document.getElementById('modal-footer').innerHTML = footer;
    },

    /**
     * Modal personalizado con contenido y botones custom
     */
    custom(options = {}) {
        const {
            title = 'Modal',
            content = '',
            size = 'medium',
            buttons = [],
            onClose = null,
            closeOnOverlay = true
        } = options;

        // Mapear tamaños a clases CSS
        const sizeMap = {
            'sm': 'small',
            'md': 'medium',
            'lg': 'large',
            'xl': 'xlarge'
        };
        const modalSize = sizeMap[size] || size;

        return new Promise((resolve) => {
            // Generar botones
            const buttonsHtml = buttons.map((btn, idx) => {
                const btnClass = btn.class || 'btn-secondary';
                return `<button class="btn ${btnClass}" id="modal-custom-btn-${idx}">${btn.text || 'Botón'}</button>`;
            }).join('');

            this.open({
                title,
                content,
                footer: buttonsHtml || '<button class="btn btn-secondary" id="modal-custom-close">Cerrar</button>',
                size: modalSize,
                closeOnOverlay,
                onClose: () => {
                    if (onClose) onClose();
                    resolve(null);
                }
            });

            // Vincular eventos de botones
            buttons.forEach((btn, idx) => {
                const btnElement = document.getElementById(`modal-custom-btn-${idx}`);
                if (btnElement) {
                    btnElement.onclick = async () => {
                        if (btn.action === 'close') {
                            this.close();
                            resolve(null);
                        } else if (typeof btn.action === 'function') {
                            const result = await btn.action();
                            if (result !== false) {
                                // Solo cerrar si la acción no devuelve false explícitamente
                            }
                            resolve(result);
                        } else {
                            this.close();
                            resolve(btn.action);
                        }
                    };
                }
            });

            // Botón de cerrar por defecto si no hay botones
            const defaultCloseBtn = document.getElementById('modal-custom-close');
            if (defaultCloseBtn) {
                defaultCloseBtn.onclick = () => {
                    this.close();
                    resolve(null);
                };
            }
        });
    }
};

// CSS adicional para modales
const modalStyles = document.createElement('style');
modalStyles.textContent = `
    .modal-container { position: fixed; inset: 0; z-index: var(--z-modal); display: flex; align-items: center; justify-content: center; }
    .modal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(2px); }
    .modal { position: relative; background: var(--bg-secondary); border-radius: var(--radius-xl); box-shadow: var(--shadow-xl); max-height: 90vh; display: flex; flex-direction: column; transform: scale(0.95); opacity: 0; transition: all 0.2s ease; }
    .modal.modal-open { transform: scale(1); opacity: 1; }
    .modal-small { width: 400px; }
    .modal-medium { width: 600px; }
    .modal-large { width: 900px; }
    .modal-xlarge { width: 1200px; max-width: 95vw; }
    .modal-header { padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--border-light); display: flex; align-items: center; justify-content: space-between; }
    .modal-title { font-size: var(--font-size-lg); font-weight: 600; color: var(--text-primary); }
    .modal-close { background: none; border: none; font-size: var(--font-size-lg); color: var(--text-tertiary); cursor: pointer; padding: var(--space-2); border-radius: var(--radius-md); transition: all var(--transition-fast); }
    .modal-close:hover { background: var(--neutral-100); color: var(--text-primary); }
    .modal-body { padding: var(--space-5); overflow-y: auto; flex: 1; }
    .modal-footer { padding: var(--space-4) var(--space-5); border-top: 1px solid var(--border-light); display: flex; justify-content: flex-end; gap: var(--space-3); background: var(--neutral-50); border-radius: 0 0 var(--radius-xl) var(--radius-xl); }
    .confirm-message { font-size: var(--font-size-base); color: var(--text-primary); text-align: center; padding: var(--space-4) 0; }
    .alert-modal { text-align: center; padding: var(--space-4); }
    .alert-modal i { font-size: 3rem; margin-bottom: var(--space-4); }
    .alert-modal.alert-info i { color: var(--info-500); }
    .alert-modal.alert-success i { color: var(--success-500); }
    .alert-modal.alert-warning i { color: var(--warning-500); }
    .alert-modal.alert-error i { color: var(--error-500); }
    .alert-modal p { font-size: var(--font-size-base); color: var(--text-primary); }
`;
document.head.appendChild(modalStyles);

// Hacer disponible globalmente
window.Modal = Modal;
