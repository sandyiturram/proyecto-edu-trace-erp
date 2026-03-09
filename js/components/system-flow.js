/**
 * EduERP - System Flow Diagram
 * Diagrama interactivo del flujo del sistema y las relaciones entre módulos
 */

const SystemFlowDiagram = {
    /**
     * Muestra el diagrama de flujo del sistema
     */
    show() {
        Modal.open({
            title: '<i class="fas fa-project-diagram"></i> Diagrama de Flujo del Sistema',
            size: 'xlarge',
            content: this.render(),
            footer: `
                <button class="btn btn-outline" onclick="Modal.close()">Cerrar</button>
                <button class="btn btn-primary" onclick="SystemFlowDiagram.downloadPDF()">
                    <i class="fas fa-download"></i> Descargar PDF
                </button>
            `
        });

        // Inicializar interactividad después de renderizar
        setTimeout(() => this.initInteractivity(), 100);
    },

    /**
     * Renderiza el diagrama
     */
    render() {
        return `
            <div class="flow-diagram-container">
                <div class="flow-legend">
                    <h4><i class="fas fa-info-circle"></i> Guía del Diagrama</h4>
                    <p>Haz clic en cada módulo para ver más detalles. Las flechas muestran cómo fluye la información.</p>
                    <div class="legend-items">
                        <span><i class="fas fa-circle" style="color: var(--primary-500);"></i> Módulo Principal</span>
                        <span><i class="fas fa-arrow-right" style="color: var(--success-500);"></i> Genera asiento</span>
                        <span><i class="fas fa-arrow-right" style="color: var(--warning-500);"></i> Actualiza datos</span>
                    </div>
                </div>

                <div class="flow-diagram" id="flow-diagram">
                    <!-- Nivel 1: Punto de Entrada -->
                    <div class="flow-level">
                        <div class="flow-node entry-point" data-module="dashboard">
                            <div class="node-icon"><i class="fas fa-home"></i></div>
                            <div class="node-content">
                                <h4>Dashboard</h4>
                                <p>Vista general</p>
                            </div>
                        </div>
                    </div>

                    <!-- Nivel 2: Operaciones -->
                    <div class="flow-arrows-row">
                        <div class="arrow-down"><i class="fas fa-chevron-down"></i></div>
                    </div>

                    <div class="flow-level operations">
                        <div class="flow-node module-node" data-module="compras">
                            <div class="node-icon mm"><i class="fas fa-shopping-cart"></i></div>
                            <div class="node-content">
                                <h4>MM - Compras</h4>
                                <p>Órdenes de compra<br>Facturas proveedor</p>
                            </div>
                            <div class="node-badge">Proveedores</div>
                        </div>

                        <div class="flow-node module-node" data-module="ventas">
                            <div class="node-icon sd"><i class="fas fa-chart-line"></i></div>
                            <div class="node-content">
                                <h4>SD - Ventas</h4>
                                <p>Cotizaciones<br>Facturas cliente</p>
                            </div>
                            <div class="node-badge">Clientes</div>
                        </div>

                        <div class="flow-node module-node" data-module="rrhh">
                            <div class="node-icon hr"><i class="fas fa-users"></i></div>
                            <div class="node-content">
                                <h4>HR - RRHH</h4>
                                <p>Nómina<br>Liquidaciones</p>
                            </div>
                            <div class="node-badge">Empleados</div>
                        </div>

                        <div class="flow-node module-node" data-module="trazabilidad">
                            <div class="node-icon trace"><i class="fas fa-project-diagram"></i></div>
                            <div class="node-content">
                                <h4>Trazabilidad</h4>
                                <p>Auditoría<br>Validaciones</p>
                            </div>
                            <div class="node-badge">Control</div>
                        </div>
                    </div>

                    <!-- Flechas hacia Inventario y Tesorería -->
                    <div class="flow-arrows-row complex">
                        <div class="arrow-connector">
                            <svg viewBox="0 0 800 60" class="connector-svg">
                                <path d="M 130 0 L 130 30 L 270 30 L 270 60" stroke="var(--warning-500)" fill="none" stroke-width="2" marker-end="url(#arrowhead-warning)"/>
                                <path d="M 400 0 L 400 60" stroke="var(--success-500)" fill="none" stroke-width="2" marker-end="url(#arrowhead-success)"/>
                                <path d="M 670 0 L 670 30 L 530 30 L 530 60" stroke="var(--success-500)" fill="none" stroke-width="2" marker-end="url(#arrowhead-success)"/>
                                <defs>
                                    <marker id="arrowhead-warning" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="var(--warning-500)"/>
                                    </marker>
                                    <marker id="arrowhead-success" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                                        <polygon points="0 0, 10 3.5, 0 7" fill="var(--success-500)"/>
                                    </marker>
                                </defs>
                            </svg>
                        </div>
                    </div>

                    <!-- Nivel 3: Inventario y Tesorería -->
                    <div class="flow-level support">
                        <div class="flow-node module-node" data-module="inventario">
                            <div class="node-icon wm"><i class="fas fa-boxes"></i></div>
                            <div class="node-content">
                                <h4>WM - Inventario</h4>
                                <p>Stock<br>Valorización</p>
                            </div>
                            <div class="node-badge">Productos</div>
                        </div>

                        <div class="flow-node module-node" data-module="tesoreria">
                            <div class="node-icon fi"><i class="fas fa-landmark"></i></div>
                            <div class="node-content">
                                <h4>FI - Tesorería</h4>
                                <p>Bancos<br>Pagos y Cobros</p>
                            </div>
                            <div class="node-badge">Caja/Bancos</div>
                        </div>
                    </div>

                    <!-- Flechas hacia Contabilidad -->
                    <div class="flow-arrows-row final">
                        <div class="arrow-connector all-to-one">
                            <svg viewBox="0 0 800 80" class="connector-svg">
                                <path d="M 120 0 L 120 40 L 400 40 L 400 80" stroke="var(--success-500)" fill="none" stroke-width="2"/>
                                <path d="M 270 0 L 270 40" stroke="var(--success-500)" fill="none" stroke-width="2"/>
                                <path d="M 530 0 L 530 40" stroke="var(--success-500)" fill="none" stroke-width="2"/>
                                <path d="M 680 0 L 680 40 L 400 40" stroke="var(--success-500)" fill="none" stroke-width="2"/>
                                <circle cx="400" cy="40" r="5" fill="var(--success-500)"/>
                                <path d="M 400 40 L 400 80" stroke="var(--success-500)" fill="none" stroke-width="3" marker-end="url(#arrowhead-success-lg)"/>
                                <defs>
                                    <marker id="arrowhead-success-lg" markerWidth="12" markerHeight="9" refX="12" refY="4.5" orient="auto">
                                        <polygon points="0 0, 12 4.5, 0 9" fill="var(--success-500)"/>
                                    </marker>
                                </defs>
                            </svg>
                        </div>
                    </div>

                    <!-- Nivel 4: Contabilidad Central -->
                    <div class="flow-level central">
                        <div class="flow-node core-node" data-module="contabilidad">
                            <div class="node-icon gl"><i class="fas fa-book"></i></div>
                            <div class="node-content">
                                <h4>GL - Contabilidad</h4>
                                <p>Plan de Cuentas • Asientos • Libro Mayor • Libro Diario</p>
                                <span class="core-badge">Módulo Central</span>
                            </div>
                        </div>
                    </div>

                    <!-- Flecha hacia Reportes -->
                    <div class="flow-arrows-row">
                        <div class="arrow-down"><i class="fas fa-chevron-down"></i></div>
                    </div>

                    <!-- Nivel 5: Salidas -->
                    <div class="flow-level outputs">
                        <div class="flow-node output-node" data-module="reportes">
                            <div class="node-icon reports"><i class="fas fa-chart-pie"></i></div>
                            <div class="node-content">
                                <h4>Reportes Financieros</h4>
                                <p>Balance General • Estado de Resultados • Flujo de Caja</p>
                            </div>
                        </div>

                        <div class="flow-node output-node" data-module="costos">
                            <div class="node-icon co"><i class="fas fa-calculator"></i></div>
                            <div class="node-content">
                                <h4>CO - Costos</h4>
                                <p>Centros de Costo<br>Análisis de Rentabilidad</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Panel de detalles -->
                <div class="flow-details" id="flow-details">
                    <h4><i class="fas fa-mouse-pointer"></i> Selecciona un módulo</h4>
                    <p>Haz clic en cualquier módulo del diagrama para ver cómo se integra con el sistema.</p>
                </div>
            </div>
        `;
    },

    /**
     * Información detallada de cada módulo
     */
    moduleInfo: {
        dashboard: {
            title: 'Dashboard Principal',
            icon: 'fa-home',
            description: 'Vista centralizada de la situación financiera de la empresa.',
            inputs: [],
            outputs: ['KPIs financieros', 'Gráficos de tendencia', 'Alertas del sistema'],
            accounting: 'No genera asientos directamente, solo visualiza información consolidada.'
        },
        compras: {
            title: 'Módulo de Compras (MM)',
            icon: 'fa-shopping-cart',
            description: 'Gestiona las adquisiciones de bienes y servicios de la empresa.',
            inputs: ['Orden de compra', 'Factura de proveedor', 'Nota de crédito'],
            outputs: ['Actualiza inventario', 'Genera asiento contable', 'Crea cuenta por pagar'],
            accounting: 'Al registrar una compra se generan asientos que afectan Inventario, IVA Crédito y Proveedores.'
        },
        ventas: {
            title: 'Módulo de Ventas (SD)',
            icon: 'fa-chart-line',
            description: 'Administra el ciclo completo de ventas, desde cotizaciones hasta facturas.',
            inputs: ['Cotización', 'Pedido de venta', 'Factura a cliente'],
            outputs: ['Actualiza inventario (-)', 'Genera asiento contable', 'Crea cuenta por cobrar'],
            accounting: 'Al registrar una venta se generan asientos que afectan Clientes, Ingresos por Ventas, IVA Débito y actualizan Inventario.'
        },
        inventario: {
            title: 'Módulo de Inventario (WM)',
            icon: 'fa-boxes',
            description: 'Controla el stock de productos, ubicaciones y valorización.',
            inputs: ['Entrada de mercadería', 'Salida de mercadería', 'Ajuste de inventario'],
            outputs: ['Actualiza stock', 'Genera asiento de ajuste', 'Valorización FIFO/Promedio'],
            accounting: 'Los ajustes de inventario generan asientos que actualizan Inventario y registran ajustes o pérdidas.'
        },
        tesoreria: {
            title: 'Módulo de Tesorería (FI)',
            icon: 'fa-landmark',
            description: 'Gestiona la liquidez: cuentas bancarias, pagos, cobros y conciliaciones.',
            inputs: ['Pago a proveedor', 'Cobro a cliente', 'Transferencia bancaria'],
            outputs: ['Actualiza saldo bancario', 'Genera asiento contable', 'Conciliación bancaria'],
            accounting: 'Los pagos y cobros generan asientos que afectan Proveedores, Banco y Clientes según corresponda.'
        },
        rrhh: {
            title: 'Módulo de RRHH (HR)',
            icon: 'fa-users',
            description: 'Administra empleados, contratos, asistencia y remuneraciones.',
            inputs: ['Registro de empleado', 'Control de asistencia', 'Cálculo de nómina'],
            outputs: ['Liquidación de sueldo', 'Genera asiento de nómina', 'Provisiones laborales'],
            accounting: 'La nómina genera asientos que registran gastos de remuneraciones y pasivos por pagar (AFP, salud, impuestos).'
        },
        contabilidad: {
            title: 'Contabilidad General (GL)',
            icon: 'fa-book',
            description: 'Es el corazón del sistema. Todos los módulos generan asientos aquí.',
            inputs: ['Asientos de todos los módulos', 'Libros auxiliares (Centralizador)', 'Ajustes manuales', 'Cierre de período'],
            outputs: ['Libro Mayor', 'Libro Diario', 'Libros Auxiliares', 'Balances de comprobación (nexo hacia estados financieros)'],
            accounting: `
                <div class="central-module-info">
                    <p><strong>Sistemas de Contabilización:</strong></p>
                    <ul style="font-size: var(--font-size-sm); margin:var(--space-2) 0;">
                        <li><strong>Jornalizador:</strong> Registro directo en Libro Diario</li>
                        <li><strong>Centralizador:</strong> Registro en libros auxiliares + centralización mensual</li>
                    </ul>
                    <p><strong>Principio Fundamental:</strong></p>
                    <div class="equation">DEBE = HABER</div>
                    <p>Cada transacción afecta al menos dos cuentas, manteniendo siempre la ecuación contable:</p>
                    <div class="equation">ACTIVO = PASIVO + PATRIMONIO</div>
                </div>
            `
        },
        reportes: {
            title: 'Reportes Financieros',
            icon: 'fa-chart-pie',
            description: 'Genera los estados financieros a partir de los datos contables.',
            inputs: ['Datos del libro mayor', 'Balance de de comprobación (Nexo)'],
            outputs: ['Balance General', 'Estado de Resultados', 'Flujo de Caja', 'Análisis financiero'],
            accounting: `
                <div class="reports-info">
                    <p><strong>Estados Financieros Principales:</strong></p>
                    <ul>
                        <li><strong>Balance General:</strong> Activo = Pasivo + Patrimonio</li>
                        <li><strong>Estado de Resultados:</strong> Ingresos - Costos de Venta - Gastos = Resultado del Ejercicio (Utilidad o Pérdida)</li>
                        <li><strong>Flujo de Caja:</strong> Movimientos de efectivo del período</li>
                    </ul>
                </div>
            `
        },
        costos: {
            title: 'Módulo de Costos (CO)',
            icon: 'fa-calculator',
            description: 'Analiza costos por centro de costo, proyecto o producto.',
            inputs: ['Asignación de costos', 'Distribución de gastos'],
            outputs: ['Costeo por absorción', 'Costeo variable', 'Rentabilidad por producto'],
            accounting: 'El módulo de Costos permite analizar la distribución de costos por centro sin generar asientos contables.'
        },
        trazabilidad: {
            title: 'Módulo de Trazabilidad',
            icon: 'fa-project-diagram',
            description: 'Sistema de auditoría y seguimiento pedagógico de transacciones.',
            inputs: ['Todas las transacciones del sistema', 'Asientos contables', 'Documentos fuente'],
            outputs: ['Flujos de trazabilidad', 'Validaciones de integridad', 'Reportes de auditoría pedagógica'],
            accounting: `
                <div class="traceability-info">
                    <p><strong>Funciones Principales:</strong></p>
                    <ul>
                        <li><strong>Rastreo de documentos:</strong> Desde el documento origen hasta los estados financieros</li>
                        <li><strong>Validación de asientos:</strong> Verifica que DEBE = HABER y la correctitud contable</li>
                        <li><strong>Auditoría pedagógica:</strong> Permite a estudiantes entender el flujo completo de información</li>
                        <li><strong>Detección de inconsistencias:</strong> Identifica errores en la cadena contable</li>
                    </ul>
                    <p style="margin-top:var(--space-3);"><em>Este módulo es fundamental para el aprendizaje, ya que permite visualizar cómo cada transacción afecta los diferentes componentes del sistema contable.</em></p>
                </div>
            `
        }
    },

    /**
     * Inicializa la interactividad del diagrama
     */
    initInteractivity() {
        document.querySelectorAll('.flow-node').forEach(node => {
            node.addEventListener('click', () => {
                const moduleId = node.dataset.module;
                this.showModuleDetails(moduleId);

                // Highlight del nodo seleccionado
                document.querySelectorAll('.flow-node').forEach(n => n.classList.remove('selected'));
                node.classList.add('selected');
            });
        });
    },

    /**
     * Muestra detalles del módulo seleccionado
     */
    showModuleDetails(moduleId) {
        const info = this.moduleInfo[moduleId];
        if (!info) return;

        const details = document.getElementById('flow-details');
        details.innerHTML = `
                < div class= "module-detail" >
                <div class="detail-header">
                    <div class="detail-icon"><i class="fas ${info.icon}"></i></div>
                    <h4>${info.title}</h4>
                </div>
                <p class="detail-description">${info.description}</p>
                
                <div class="detail-section">
                    <h5><i class="fas fa-sign-in-alt"></i> Entradas (Inputs)</h5>
                    <ul>${info.inputs.map(i => `<li>${i}</li>`).join('')}</ul>
                </div>
                
                <div class="detail-section">
                    <h5><i class="fas fa-sign-out-alt"></i> Salidas (Outputs)</h5>
                    <ul>${info.outputs.map(o => `<li>${o}</li>`).join('')}</ul>
                </div>
                
                <div class="detail-section accounting-section">
                    <h5><i class="fas fa-file-invoice-dollar"></i> Impacto Contable</h5>
                    ${typeof info.accounting === 'string' ? info.accounting : ''}
                </div>
            </div >
    `;

        details.classList.add('active');
    },

    /**
     * Descarga el diagrama como PDF
     */
    async downloadPDF() {
        Toast.info('Generando PDF del diagrama...');

        try {
            const jsPDF = window.jspdf.jsPDF;
            const doc = new jsPDF('landscape', 'mm', 'letter');

            // Título
            doc.setFontSize(20);
            doc.setTextColor(10, 110, 209);
            doc.text('Diagrama de Flujo del Sistema ERP', 140, 20, { align: 'center' });

            // Subtítulo
            doc.setFontSize(12);
            doc.setTextColor(100);
            doc.text('Relaciones entre módulos y contabilizaciones', 140, 28, { align: 'center' });

            let yPos = 40;

            // Módulos y sus descripciones
            const modules = [
                { name: 'MM - Compras', desc: 'Órdenes de compra y facturas de proveedor -> Genera asiento de compra' },
                { name: 'SD - Ventas', desc: 'Cotizaciones y facturas a cliente -> Genera asiento de venta' },
                { name: 'WM - Inventario', desc: 'Control de stock y valorización -> Ajustes de inventario' },
                { name: 'FI - Tesorería', desc: 'Pagos y cobros -> Movimientos de caja y banco' },
                { name: 'HR - RRHH', desc: 'Nómina y liquidaciones -> Asiento de remuneraciones' },
                { name: 'GL - Contabilidad', desc: 'MÓDULO CENTRAL - Recibe todos los asientos automáticos' },
                { name: 'Reportes', desc: 'Balance General, Estado de Resultados, Flujo de Caja' },
                { name: 'CO - Costos', desc: 'Análisis de costos por centro' }
            ];

            doc.setFontSize(14);
            doc.setTextColor(30);

            modules.forEach((mod, i) => {
                doc.setFont(undefined, 'bold');
                doc.text(mod.name, 20, yPos);
                doc.setFont(undefined, 'normal');
                doc.text(mod.desc, 60, yPos);
                yPos += 10;
            });

            yPos += 10;

            // Ecuación contable
            doc.setFontSize(16);
            doc.setTextColor(10, 110, 209);
            doc.text('Principio Fundamental: DEBE = HABER', 140, yPos, { align: 'center' });

            yPos += 10;
            doc.setFontSize(14);
            doc.setTextColor(100);
            doc.text('ACTIVO = PASIVO + PATRIMONIO', 140, yPos, { align: 'center' });

            // Pie de página
            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(`EduERP - Generado el ${new Date().toLocaleDateString()} `, 140, 200, { align: 'center' });

            // Descargar usando método nativo
            doc.save('Diagrama_Flujo_ERP.pdf');

            Toast.success('PDF descargado');
        } catch (err) {
            console.error('Error generando PDF:', err);
            Toast.error('Error al generar PDF');
        }
    }
};

// Estilos del diagrama
const flowStyles = document.createElement('style');
flowStyles.textContent = `
    .flow - diagram - container {
    display: grid;
    grid - template - columns: 1fr 300px;
    gap: var(--space - 4);
    /* Allow full height and scrolling */
    height: auto;
    max - height: none;
    overflow - y: auto;
}

    .flow - legend {
    grid - column: 1 / -1;
    background: linear - gradient(135deg, var(--primary - 50), var(--info - 50));
    padding: var(--space - 3) var(--space - 4);
    border - radius: var(--radius - lg);
    margin - bottom: var(--space - 2);
}

    .flow - legend h4 {
    margin: 0 0 var(--space - 1);
    font - size: var(--font - size - sm);
    color: var(--primary - 700);
}

    .flow - legend p {
    margin: 0 0 var(--space - 2);
    font - size: var(--font - size - xs);
    color: var(--text - secondary);
}

    .legend - items {
    display: flex;
    gap: var(--space - 4);
    font - size: var(--font - size - xs);
}

    .legend - items span {
    display: flex;
    align - items: center;
    gap: var(--space - 2);
}

    .flow - diagram {
    display: flex;
    flex - direction: column;
    align - items: center;
    gap: var(--space - 2);
    overflow - y: auto;
    padding: var(--space - 2);
}

    .flow - level {
    display: flex;
    justify - content: center;
    gap: var(--space - 4);
    width: 100 %;
}

    .flow - node {
    background: var(--bg - secondary);
    border: 2px solid var(--border - light);
    border - radius: var(--radius - xl);
    padding: var(--space - 3);
    display: flex;
    align - items: center;
    gap: var(--space - 3);
    cursor: pointer;
    transition: all var(--transition - fast);
    position: relative;
    min - width: 180px;
}

    .flow - node:hover {
    border - color: var(--primary - 500);
    transform: translateY(-2px);
    box - shadow: var(--shadow - lg);
}

    .flow - node.selected {
    border - color: var(--primary - 500);
    background: var(--primary - 50);
    box - shadow: 0 0 0 4px rgba(10, 110, 209, 0.2);
}

    .node - icon {
    width: 40px;
    height: 40px;
    border - radius: var(--radius - lg);
    display: flex;
    align - items: center;
    justify - content: center;
    color: white;
    font - size: var(--font - size - lg);
    flex - shrink: 0;
}

    .node - icon.mm { background: linear - gradient(135deg, #df6e0c, #c45f0a); }
    .node - icon.sd { background: linear - gradient(135deg, #107e3e, #0d6630); }
    .node - icon.wm { background: linear - gradient(135deg, #00b894, #00a187); }
    .node - icon.fi { background: linear - gradient(135deg, #6c5ce7, #5f3dc4); }
    .node - icon.hr { background: linear - gradient(135deg, #fd79a8, #e84393); }
    .node - icon.gl { background: linear - gradient(135deg, #0a6ed1, #064280); }
    .node - icon.reports { background: linear - gradient(135deg, #00cec9, #00b5ad); }
    .node - icon.co { background: linear - gradient(135deg, #fdcb6e, #f39c12); }\r\n    .node - icon.trace { background: linear - gradient(135deg, #a29bfe, #6c5ce7); }

    .node - content h4 {
    margin: 0;
    font - size: var(--font - size - sm);
    font - weight: 600;
}

    .node - content p {
    margin: var(--space - 1) 0 0;
    font - size: var(--font - size - xs);
    color: var(--text - tertiary);
    line - height: 1.3;
}

    .node - badge {
    position: absolute;
    top: -8px;
    right: -8px;
    background: var(--neutral - 700);
    color: white;
    font - size: 10px;
    padding: 2px 8px;
    border - radius: var(--radius - full);
}

    .core - node {
    background: linear - gradient(135deg, var(--primary - 50), var(--primary - 100));
    border - color: var(--primary - 500);
    border - width: 3px;
    min - width: 350px;
}

    .core - node.node - icon {
    width: 50px;
    height: 50px;
    font - size: var(--font - size - xl);
}

    .core - badge {
    display: inline - block;
    background: var(--primary - 500);
    color: white;
    font - size: 10px;
    padding: 2px 8px;
    border - radius: var(--radius - full);
    margin - top: var(--space - 2);
}

    .output - node {
    border - style: dashed;
}

    .entry - point.node - icon {
    background: linear - gradient(135deg, var(--neutral - 600), var(--neutral - 800));
}

    .flow - arrows - row {
    display: flex;
    justify - content: center;
    padding: var(--space - 2) 0;
}

    .arrow - down {
    color: var(--primary - 500);
    font - size: var(--font - size - xl);
    animation: bounce 1s infinite;
}

@keyframes bounce {
    0 %, 100 % { transform: translateY(0); }
    50 % { transform: translateY(4px); }
}

    .arrow - connector {
    width: 100 %;
    max - width: 800px;
}

    .connector - svg {
    width: 100 %;
    height: 60px;
}

    .arrow - connector.all - to - one.connector - svg {
    height: 80px;
}

    /* Panel de detalles */
    .flow - details {
    background: var(--bg - tertiary);
    border - radius: var(--radius - xl);
    padding: var(--space - 4);
    overflow - y: auto;
}

    .flow - details h4 {
    margin: 0 0 var(--space - 2);
    color: var(--text - tertiary);
    font - size: var(--font - size - sm);
}

    .flow - details.active h4 {
    color: var(--primary - 600);
}

    .module - detail {
    animation: fadeIn 0.3s ease;
}

    .detail - header {
    display: flex;
    align - items: center;
    gap: var(--space - 3);
    margin - bottom: var(--space - 3);
}

    .detail - icon {
    width: 48px;
    height: 48px;
    background: var(--primary - 500);
    border - radius: var(--radius - lg);
    display: flex;
    align - items: center;
    justify - content: center;
    color: white;
    font - size: var(--font - size - xl);
}

    .detail - header h4 {
    margin: 0;
    font - size: var(--font - size - base);
    color: var(--text - primary);
}

    .detail - description {
    font - size: var(--font - size - sm);
    color: var(--text - secondary);
    margin - bottom: var(--space - 4);
}

    .detail - section {
    margin - bottom: var(--space - 4);
}

    .detail - section h5 {
    margin: 0 0 var(--space - 2);
    font - size: var(--font - size - xs);
    color: var(--text - tertiary);
    text - transform: uppercase;
    letter - spacing: 0.5px;
}

    .detail - section ul {
    margin: 0;
    padding - left: var(--space - 4);
    font - size: var(--font - size - sm);
}

    .detail - section li {
    margin - bottom: var(--space - 1);
}

    .accounting - section {
    background: var(--bg - secondary);
    padding: var(--space - 3);
    border - radius: var(--radius - lg);
    border - left: 4px solid var(--success - 500);
}

    .accounting - example {
    width: 100 %;
    font - size: var(--font - size - xs);
    border - collapse: collapse;
}

    .accounting - example th {
    text - align: left;
    padding: var(--space - 2);
    background: var(--neutral - 100);
    font - weight: 600;
}

    .accounting - example td {
    padding: var(--space - 1) var(--space - 2);
    border - bottom: 1px solid var(--border - light);
}

    .accounting - example.debe {
    color: var(--info - 600);
    font - weight: 600;
}

    .accounting - example.haber {
    color: var(--success - 600);
    font - weight: 600;
}

    .accounting - example.separator {
    height: 10px;
    border: none;
}

    .central - module - info, .reports - info {
    font - size: var(--font - size - sm);
}

    .equation {
    text - align: center;
    font - size: var(--font - size - lg);
    font - weight: 700;
    color: var(--primary - 600);
    padding: var(--space - 3);
    background: var(--primary - 50);
    border - radius: var(--radius - lg);
    margin: var(--space - 3) 0;
}

    .reports - info ul {
    padding - left: var(--space - 4);
}

@keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
}

@media(max - width: 900px) {
        .flow - diagram - container {
        grid - template - columns: 1fr;
    }

        .flow - level.operations,
        .flow - level.support {
        flex - direction: column;
        align - items: center;
    }

        .connector - svg {
        display: none;
    }

        .flow - arrows - row.complex,
        .flow - arrows - row.final {
        display: none;
    }
}
`;
document.head.appendChild(flowStyles);

// Hacer disponible globalmente
window.SystemFlowDiagram = SystemFlowDiagram;
