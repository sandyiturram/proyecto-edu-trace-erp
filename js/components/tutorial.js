/**
 * EDU-TRACE ERP - Tutorial System
 * Sistema de tutorial interactivo paso a paso (CORREGIDO)
 */

const TutorialSystem = {
    isActive: false,
    currentStep: 0,
    steps: [],
    overlay: null,
    tooltip: null,

    /**
     * Define los pasos del tutorial
     */
    tutorials: {
        quickStart: {
            name: 'Tutorial Rápido',
            description: 'Aprende los conceptos básicos de EDU-TRACE ERP en 5 minutos',
            steps: [
                {
                    title: '¡Bienvenido a EDU-TRACE ERP!',
                    content: `
                        <p>EDU-TRACE ERP es un <strong>simulador de sistema ERP</strong> diseñado para que los estudiantes 
                        de auditoría comprendan cómo funcionan los sistemas empresariales.</p>
                        <p><strong>En este tutorial aprenderás:</strong></p>
                        <ul>
                            <li>Navegar por los módulos del sistema</li>
                            <li>Gestionar empresas virtuales</li>
                            <li>Registrar operaciones contables</li>
                            <li>Generar reportes financieros</li>
                            <li>Validar la integridad de los datos</li>
                        </ul>
                    `,
                    target: null,
                    position: 'center'
                },
                {
                    title: 'Menú de Navegación',
                    content: `
                        <p>El <strong>menú lateral</strong> contiene todos los módulos del ERP:</p>
                        <ul>
                            <li><strong>Dashboard:</strong> Panel principal con KPIs</li>
                            <li><strong>GL:</strong> Contabilidad General</li>
                            <li><strong>MM:</strong> Compras y Proveedores</li>
                            <li><strong>SD:</strong> Ventas y Clientes</li>
                            <li><strong>WM:</strong> Inventario</li>
                            <li><strong>FI:</strong> Tesorería</li>
                            <li><strong>CO:</strong> Costos</li>
                            <li><strong>HR:</strong> Recursos Humanos</li>
                        </ul>
                        <p>Haz clic en cada módulo para ver sus opciones.</p>
                    `,
                    target: '#sidebar',
                    position: 'right'
                },
                {
                    title: 'Selector de Empresa',
                    content: `
                        <p>Aquí puedes <strong>cambiar la empresa activa</strong>.</p>
                        <p>Cada estudiante puede crear múltiples empresas virtuales para practicar 
                        diferentes escenarios contables.</p>
                        <p><strong>Tip:</strong> Puedes importar casos de estudio predefinidos 
                        desde Administración → Importar/Exportar.</p>
                    `,
                    target: '#company-selector',
                    position: 'right'
                },
                {
                    title: 'Módulo de Contabilidad',
                    content: `
                        <p>El módulo de <strong>Contabilidad (GL)</strong> es el corazón del sistema:</p>
                        <ul>
                            <li><strong>Plan de Cuentas:</strong> Estructura IFRS/PCGA</li>
                            <li><strong>Asientos Contables:</strong> Registro de operaciones</li>
                            <li><strong>Libro Mayor:</strong> Movimientos por cuenta</li>
                            <li><strong>Libro Diario:</strong> Registro cronológico</li>
                        </ul>
                        <p>Todos los módulos generan asientos automáticos.</p>
                    `,
                    target: '[data-module="contabilidad"]',
                    position: 'right'
                },
                {
                    title: 'Reportes Financieros',
                    content: `
                        <p>En <strong>Reportes</strong> puedes generar:</p>
                        <ul>
                            <li><strong>Balance General:</strong> Situación patrimonial</li>
                            <li><strong>Estado de Resultados:</strong> Pérdidas y ganancias</li>
                            <li><strong>Flujo de Caja:</strong> Movimientos de efectivo</li>
                        </ul>
                        <p>Exporta a <strong>PDF</strong>, <strong>Excel</strong> o <strong>CSV</strong>.</p>
                    `,
                    target: '[data-module="reportes"]',
                    position: 'right'
                },
                {
                    title: 'Trazabilidad de Datos',
                    content: `
                        <p>La sección de <strong>Trazabilidad</strong> permite:</p>
                        <ul>
                            <li><strong>Auditar operaciones:</strong> Ver el origen de cada movimiento</li>
                            <li><strong>Validar datos:</strong> Detectar inconsistencias</li>
                            <li><strong>Seguir el flujo:</strong> Desde documento origen hasta asiento</li>
                        </ul>
                        <p>Esencial para auditoría y control interno.</p>
                    `,
                    target: '[data-module="trazabilidad"]',
                    position: 'right'
                },
                {
                    title: 'Administración',
                    content: `
                        <p>En <strong>Administración</strong> encontrarás:</p>
                        <ul>
                            <li><strong>Empresas:</strong> Crear y gestionar empresas</li>
                            <li><strong>Importar/Exportar:</strong> Cargar casos de estudio</li>
                            <li><strong>Datos Demo:</strong> Crear datos de ejemplo</li>
                            <li><strong>Configuración:</strong> Ajustes del sistema</li>
                        </ul>
                        <p>Aquí puedes cargar los <strong>casos de estudio</strong> predefinidos.</p>
                    `,
                    target: '[data-module="admin"]',
                    position: 'right'
                },
                {
                    title: 'Diagrama Contable',
                    content: `
                        <p>El <strong>Diagrama Contable Interactivo</strong> es una herramienta visual para:</p>
                        <ul>
                            <li>Ver el flujo de una transacción comercial</li>
                            <li>Entender la ecuación contable</li>
                            <li>Visualizar asientos de compra y venta</li>
                            <li>Comprender el impacto en estados financieros</li>
                        </ul>
                        <p>Accede desde el botón <strong>"Ver Diagrama Contable"</strong> en el Dashboard.</p>
                    `,
                    target: null,
                    position: 'center'
                },
                {
                    title: '¡Listo para comenzar!',
                    content: `
                        <p>Ahora conoces lo básico de EDU-TRACE ERP. Te recomendamos:</p>
                        <ol>
                            <li>Crear una empresa o cargar un caso de estudio</li>
                            <li>Explorar el plan de cuentas</li>
                            <li>Registrar un asiento contable</li>
                            <li>Ver el Balance General</li>
                            <li>Usar el Diagrama Contable para visualizar</li>
                        </ol>
                        <p><strong>¿Necesitas ayuda?</strong> Haz clic en el botón <i class="fas fa-question-circle"></i> 
                        en cualquier momento.</p>
                        <p style="margin-top: var(--space-3);">
                            <strong>¡Buena suerte en tu aprendizaje!</strong> 🎓
                        </p>
                    `,
                    target: null,
                    position: 'center'
                }
            ]
        },

        accounting: {
            name: 'Contabilidad Básica',
            description: 'Aprende a registrar asientos contables',
            steps: [
                {
                    title: 'Introducción a Contabilidad',
                    content: `
                        <p>En este tutorial aprenderás los fundamentos de la contabilidad en EDU-TRACE ERP.</p>
                        <p>Cubriremos:</p>
                        <ul>
                            <li>Estructura del plan de cuentas</li>
                            <li>Cómo crear asientos contables</li>
                            <li>La partida doble (Debe = Haber)</li>
                        </ul>
                    `,
                    target: null,
                    position: 'center'
                },
                {
                    title: 'Plan de Cuentas',
                    content: `
                        <p>El <strong>Plan de Cuentas</strong> es la estructura base de la contabilidad.</p>
                        <p>Se organiza jerárquicamente:</p>
                        <ul>
                            <li><strong>1:</strong> Activos (lo que tenemos)</li>
                            <li><strong>2:</strong> Pasivos (lo que debemos)</li>
                            <li><strong>3:</strong> Patrimonio (capital de los dueños)</li>
                            <li><strong>4:</strong> Ingresos (lo que ganamos)</li>
                            <li><strong>5:</strong> Costos y Gastos (lo que gastamos)</li>
                        </ul>
                    `,
                    target: null,
                    position: 'center'
                },
                {
                    title: 'Partida Doble',
                    content: `
                        <p>El principio fundamental de la contabilidad:</p>
                        <p style="text-align: center; font-size: 1.2em; font-weight: bold; 
                            padding: var(--space-4); background: var(--primary-50); border-radius: var(--radius-lg);">
                            DEBE = HABER
                        </p>
                        <p>Por cada operación:</p>
                        <ul>
                            <li><strong>Debe:</strong> Aumenta Activos o disminuye Pasivos/Patrimonio</li>
                            <li><strong>Haber:</strong> Disminuye Activos o aumenta Pasivos/Patrimonio</li>
                        </ul>
                    `,
                    target: null,
                    position: 'center'
                }
            ]
        }
    },

    /**
     * Inicia un tutorial
     */
    start(tutorialId = 'quickStart') {
        const tutorial = this.tutorials[tutorialId];
        if (!tutorial) {
            Toast.error('Tutorial no encontrado');
            return;
        }

        // Limpiar cualquier tutorial previo
        this.cleanup();

        this.steps = tutorial.steps;
        this.currentStep = 0;
        this.isActive = true;

        this.createOverlay();
        this.showStep(0);

        // Marcar como visto
        localStorage.setItem(`tutorial_${tutorialId}_seen`, 'true');
    },

    /**
     * Limpia el tutorial anterior
     */
    cleanup() {
        // Remover highlights
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });

        // Remover overlay y tooltip existentes
        document.querySelectorAll('.tutorial-overlay').forEach(el => el.remove());
        document.querySelectorAll('.tutorial-tooltip').forEach(el => el.remove());

        this.overlay = null;
        this.tooltip = null;
    },

    /**
     * Crea el overlay del tutorial
     */
    createOverlay() {
        // Overlay oscuro
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        this.overlay.innerHTML = '<div class="tutorial-backdrop"></div>';
        document.body.appendChild(this.overlay);

        // Tooltip
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'tutorial-tooltip';
        document.body.appendChild(this.tooltip);
    },

    /**
     * Muestra un paso del tutorial
     */
    showStep(index) {
        if (!this.isActive) return;

        if (index < 0 || index >= this.steps.length) {
            this.end();
            return;
        }

        this.currentStep = index;
        const step = this.steps[index];

        // Highlight del elemento target
        this.highlightElement(step.target);

        // Contenido del tooltip
        this.tooltip.innerHTML = `
            <div class="tutorial-header">
                <span class="tutorial-step-count">Paso ${index + 1} de ${this.steps.length}</span>
                <button class="tutorial-close" id="tutorial-close-btn" type="button">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <h3 class="tutorial-title">${step.title}</h3>
            <div class="tutorial-content">${step.content}</div>
            <div class="tutorial-footer">
                <div class="tutorial-progress">
                    ${this.steps.map((_, i) => `
                        <span class="tutorial-dot ${i === index ? 'active' : ''} ${i < index ? 'completed' : ''}"></span>
                    `).join('')}
                </div>
                <div class="tutorial-actions">
                    ${index > 0 ? `
                        <button class="btn btn-outline btn-sm" id="tutorial-prev-btn" type="button">
                            <i class="fas fa-arrow-left"></i> Anterior
                        </button>
                    ` : ''}
                    ${index < this.steps.length - 1 ? `
                        <button class="btn btn-primary btn-sm" id="tutorial-next-btn" type="button">
                            Siguiente <i class="fas fa-arrow-right"></i>
                        </button>
                    ` : `
                        <button class="btn btn-success btn-sm" id="tutorial-finish-btn" type="button">
                            <i class="fas fa-check"></i> Finalizar
                        </button>
                    `}
                </div>
            </div>
        `;

        // Posicionar tooltip
        this.positionTooltip(step.target, step.position);

        // Bind eventos después de crear el HTML
        this.bindStepEvents();
    },

    /**
     * Vincula eventos de los botones del paso actual
     */
    bindStepEvents() {
        const closeBtn = document.getElementById('tutorial-close-btn');
        const prevBtn = document.getElementById('tutorial-prev-btn');
        const nextBtn = document.getElementById('tutorial-next-btn');
        const finishBtn = document.getElementById('tutorial-finish-btn');

        if (closeBtn) {
            closeBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.end();
            };
        }

        if (prevBtn) {
            prevBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.prev();
            };
        }

        if (nextBtn) {
            nextBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.next();
            };
        }

        if (finishBtn) {
            finishBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.end();
            };
        }
    },

    /**
     * Resalta un elemento
     */
    highlightElement(selector) {
        // Remover highlights anteriores
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });

        if (!selector) {
            const backdrop = this.overlay?.querySelector('.tutorial-backdrop');
            if (backdrop) backdrop.style.opacity = '0.8';
            return;
        }

        const element = document.querySelector(selector);
        if (element) {
            element.classList.add('tutorial-highlight');
            const backdrop = this.overlay?.querySelector('.tutorial-backdrop');
            if (backdrop) backdrop.style.opacity = '0.7';

            // Scroll al elemento si es necesario
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    },

    /**
     * Posiciona el tooltip
     */
    positionTooltip(selector, position) {
        if (!this.tooltip) return;

        const tooltip = this.tooltip;
        tooltip.className = 'tutorial-tooltip';
        tooltip.style.top = '';
        tooltip.style.left = '';
        tooltip.style.right = '';
        tooltip.style.bottom = '';
        tooltip.style.transform = '';

        // Centrar si no hay selector o es posición center
        if (!selector || position === 'center') {
            tooltip.classList.add('center');
            tooltip.style.top = '50%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
            return;
        }

        const element = document.querySelector(selector);
        if (!element) {
            tooltip.classList.add('center');
            tooltip.style.top = '50%';
            tooltip.style.left = '50%';
            tooltip.style.transform = 'translate(-50%, -50%)';
            return;
        }

        const rect = element.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const padding = 20;
        const tooltipWidth = Math.min(480, viewportWidth * 0.9);
        const tooltipHeight = Math.min(tooltipRect.height || 400, viewportHeight * 0.85);

        tooltip.classList.add(position);

        let top, left;

        switch (position) {
            case 'right':
                top = rect.top + rect.height / 2;
                left = rect.right + padding;

                // Verificar si se sale por la derecha
                if (left + tooltipWidth > viewportWidth - padding) {
                    // Cambiar a izquierda o centrar
                    left = Math.max(padding, rect.left - tooltipWidth - padding);
                    tooltip.classList.remove('right');
                    tooltip.classList.add('left');
                }

                // Ajustar verticalmente si se sale
                if (top - tooltipHeight / 2 < padding) {
                    top = padding + tooltipHeight / 2;
                } else if (top + tooltipHeight / 2 > viewportHeight - padding) {
                    top = viewportHeight - padding - tooltipHeight / 2;
                }

                tooltip.style.top = `${top}px`;
                tooltip.style.left = `${left}px`;
                tooltip.style.transform = 'translateY(-50%)';
                break;

            case 'left':
                top = rect.top + rect.height / 2;
                left = rect.left - padding;

                // Verificar si se sale por la izquierda
                if (left - tooltipWidth < padding) {
                    left = rect.right + padding;
                    tooltip.classList.remove('left');
                    tooltip.classList.add('right');
                    tooltip.style.transform = 'translateY(-50%)';
                } else {
                    tooltip.style.transform = 'translate(-100%, -50%)';
                }

                // Ajustar verticalmente
                if (top - tooltipHeight / 2 < padding) {
                    top = padding + tooltipHeight / 2;
                } else if (top + tooltipHeight / 2 > viewportHeight - padding) {
                    top = viewportHeight - padding - tooltipHeight / 2;
                }

                tooltip.style.top = `${top}px`;
                tooltip.style.left = `${left}px`;
                break;

            case 'bottom':
                top = rect.bottom + padding;
                left = rect.left + rect.width / 2;

                // Verificar si se sale por abajo
                if (top + tooltipHeight > viewportHeight - padding) {
                    top = rect.top - tooltipHeight - padding;
                    tooltip.classList.remove('bottom');
                    tooltip.classList.add('top');
                }

                // Ajustar horizontalmente
                if (left - tooltipWidth / 2 < padding) {
                    left = padding + tooltipWidth / 2;
                } else if (left + tooltipWidth / 2 > viewportWidth - padding) {
                    left = viewportWidth - padding - tooltipWidth / 2;
                }

                tooltip.style.top = `${top}px`;
                tooltip.style.left = `${left}px`;
                tooltip.style.transform = 'translateX(-50%)';
                break;

            case 'top':
                top = rect.top - padding;
                left = rect.left + rect.width / 2;

                // Verificar si se sale por arriba
                if (top - tooltipHeight < padding) {
                    top = rect.bottom + padding;
                    tooltip.classList.remove('top');
                    tooltip.classList.add('bottom');
                    tooltip.style.transform = 'translateX(-50%)';
                } else {
                    tooltip.style.transform = 'translate(-50%, -100%)';
                }

                // Ajustar horizontalmente
                if (left - tooltipWidth / 2 < padding) {
                    left = padding + tooltipWidth / 2;
                } else if (left + tooltipWidth / 2 > viewportWidth - padding) {
                    left = viewportWidth - padding - tooltipWidth / 2;
                }

                tooltip.style.top = `${top}px`;
                tooltip.style.left = `${left}px`;
                break;
        }
    },

    /**
     * Siguiente paso
     */
    next() {
        if (this.isActive) {
            this.showStep(this.currentStep + 1);
        }
    },

    /**
     * Paso anterior
     */
    prev() {
        if (this.isActive) {
            this.showStep(this.currentStep - 1);
        }
    },

    /**
     * Finaliza el tutorial
     */
    end() {
        this.isActive = false;
        this.cleanup();
        Toast.success('¡Tutorial completado!');
    },

    /**
     * Muestra el selector de tutoriales
     */
    showTutorialSelector() {
        const tutorials = Object.entries(this.tutorials).map(([id, tutorial]) => ({
            id,
            ...tutorial,
            seen: localStorage.getItem(`tutorial_${id}_seen`) === 'true'
        }));

        Modal.open({
            title: '<i class="fas fa-graduation-cap"></i> Tutoriales Disponibles',
            size: 'medium',
            content: `
                <div class="tutorial-list">
                    ${tutorials.map(t => `
                        <div class="tutorial-card" data-tutorial="${t.id}">
                            <div class="tutorial-card-icon">
                                <i class="fas fa-graduation-cap"></i>
                            </div>
                            <div class="tutorial-card-content">
                                <h4>${t.name}</h4>
                                <p>${t.description}</p>
                                <span class="badge ${t.seen ? 'badge-success' : 'badge-primary'}">
                                    ${t.seen ? 'Completado' : `${t.steps.length} pasos`}
                                </span>
                            </div>
                            <button class="btn btn-primary btn-sm">
                                ${t.seen ? 'Repetir' : 'Iniciar'}
                            </button>
                        </div>
                    `).join('')}
                </div>
            `,
            footer: `
                <button class="btn btn-outline" onclick="Modal.close()">Cerrar</button>
            `
        });

        // Bind clicks
        setTimeout(() => {
            document.querySelectorAll('.tutorial-card').forEach(card => {
                card.onclick = () => {
                    Modal.close();
                    setTimeout(() => {
                        this.start(card.dataset.tutorial);
                    }, 350);
                };
            });
        }, 100);
    }
};

// Estilos del tutorial
const tutorialStyles = document.createElement('style');
tutorialStyles.textContent = `
    .tutorial-overlay {
        position: fixed;
        inset: 0;
        z-index: 9998;
        pointer-events: none;
    }
    
    .tutorial-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        transition: opacity var(--transition-normal);
    }
    
    .tutorial-highlight {
        position: relative;
        z-index: 9999 !important;
        box-shadow: 0 0 0 4px var(--primary-500), 0 0 20px rgba(10, 110, 209, 0.5) !important;
        border-radius: var(--radius-lg);
    }
    
    .tutorial-tooltip {
        position: fixed;
        z-index: 10000;
        background: var(--bg-secondary);
        border-radius: var(--radius-xl);
        box-shadow: var(--shadow-xl), 0 0 40px rgba(0, 0, 0, 0.3);
        max-width: 480px;
        min-width: 320px;
        width: 90%;
        max-height: 85vh;
        overflow-y: auto;
        pointer-events: auto;
        animation: tooltipIn 0.3s ease;
    }
    
    @keyframes tooltipIn {
        from { opacity: 0; transform: translateY(-50%) scale(0.95); }
        to { opacity: 1; transform: translateY(-50%) scale(1); }
    }
    
    .tutorial-tooltip.center {
        animation: tooltipCenter 0.3s ease forwards;
    }
    
    @keyframes tooltipCenter {
        from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
        to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
    }
    
    .tutorial-tooltip::before {
        content: '';
        position: absolute;
        width: 16px;
        height: 16px;
        background: var(--bg-secondary);
        transform: rotate(45deg);
    }
    
    .tutorial-tooltip.right::before { left: -8px; top: 50%; margin-top: -8px; }
    .tutorial-tooltip.left::before { right: -8px; top: 50%; margin-top: -8px; }
    .tutorial-tooltip.bottom::before { top: -8px; left: 50%; margin-left: -8px; }
    .tutorial-tooltip.top::before { bottom: -8px; left: 50%; margin-left: -8px; }
    .tutorial-tooltip.center::before { display: none; }
    
    .tutorial-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-3) var(--space-4);
        border-bottom: 1px solid var(--border-light);
    }
    
    .tutorial-step-count {
        font-size: var(--font-size-xs);
        color: var(--text-tertiary);
        font-weight: 500;
    }
    
    .tutorial-close {
        background: none;
        border: none;
        color: var(--text-tertiary);
        cursor: pointer;
        padding: var(--space-2);
        font-size: var(--font-size-lg);
        transition: color var(--transition-fast);
        border-radius: var(--radius-md);
    }
    
    .tutorial-close:hover { 
        color: var(--error-500); 
        background: var(--error-50);
    }
    
    .tutorial-title {
        margin: 0;
        padding: var(--space-4) var(--space-4) 0;
        font-size: var(--font-size-lg);
        font-weight: 600;
        color: var(--primary-600);
    }
    
    .tutorial-content {
        padding: var(--space-3) var(--space-4);
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        line-height: 1.6;
    }
    
    .tutorial-content p { margin: 0 0 var(--space-3); }
    .tutorial-content p:last-child { margin-bottom: 0; }
    .tutorial-content ul, .tutorial-content ol { 
        margin: var(--space-2) 0; 
        padding-left: var(--space-5); 
    }
    .tutorial-content li { margin-bottom: var(--space-1); }
    .tutorial-content strong { color: var(--text-primary); }
    
    .tutorial-footer {
        padding: var(--space-4);
        border-top: 1px solid var(--border-light);
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: var(--space-4);
    }
    
    .tutorial-progress {
        display: flex;
        gap: var(--space-1);
    }
    
    .tutorial-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: var(--neutral-300);
        transition: all var(--transition-fast);
    }
    
    .tutorial-dot.active { 
        background: var(--primary-500); 
        transform: scale(1.25);
    }
    
    .tutorial-dot.completed { background: var(--success-500); }
    
    .tutorial-actions {
        display: flex;
        gap: var(--space-2);
    }
    
    /* Tutorial selector styles */
    .tutorial-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-3);
    }
    
    .tutorial-card {
        display: flex;
        align-items: center;
        gap: var(--space-4);
        padding: var(--space-4);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-lg);
        cursor: pointer;
        transition: all var(--transition-fast);
    }
    
    .tutorial-card:hover {
        border-color: var(--primary-500);
        background: var(--primary-50);
    }
    
    .tutorial-card-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, var(--primary-500), var(--primary-700));
        border-radius: var(--radius-lg);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: var(--font-size-xl);
        flex-shrink: 0;
    }
    
    .tutorial-card-content {
        flex: 1;
    }
    
    .tutorial-card-content h4 {
        margin: 0 0 var(--space-1);
        font-size: var(--font-size-base);
        font-weight: 600;
    }
    
    .tutorial-card-content p {
        margin: 0 0 var(--space-2);
        font-size: var(--font-size-xs);
        color: var(--text-secondary);
    }
`;
document.head.appendChild(tutorialStyles);

// Hacer disponible globalmente
window.TutorialSystem = TutorialSystem;
