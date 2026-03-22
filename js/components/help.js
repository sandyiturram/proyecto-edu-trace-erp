/**
 * EDU-TRACE ERP - Help System
 * Sistema de ayuda contextual y documentación
 */

const HelpSystem = {
    /**
     * Documentación por módulo
     */
    documentation: {
        general: {
            title: 'Introducción a EDU-TRACE ERP',
            icon: 'fa-home',
            content: `
                <div class="help-section">
                    <div class="help-welcome">
                        <i class="fas fa-graduation-cap"></i>
                        <h3>¿Qué es EDU-TRACE ERP?</h3>
                    </div>
                    <p>EDU-TRACE ERP es un <strong>simulador de procesos de negocio</strong> diseñado para la enseñanza de auditoría y contabilidad. 
                    Permite a los estudiantes operar una empresa virtual, generando registros contables automáticos con trazabilidad total.</p>
                    
                    <div class="help-grid">
                        <div class="help-card">
                            <i class="fas fa-building"></i>
                            <h4>Empresas</h4>
                            <p>Gestión de múltiples entidades locales.</p>
                        </div>
                        <div class="help-card">
                            <i class="fas fa-project-diagram"></i>
                            <h4>Trazabilidad</h4>
                            <p>Vínculo directo entre documento y asiento.</p>
                        </div>
                        <div class="help-card">
                            <i class="fas fa-chart-pie"></i>
                            <h4>Reportes</h4>
                            <p>Estados financieros en tiempo real.</p>
                        </div>
                        <div class="help-card">
                            <i class="fas fa-shield-alt"></i>
                            <h4>Privacidad</h4>
                            <p>Datos 100% locales en tu navegador.</p>
                        </div>
                    </div>
                    
                    <div class="help-path">
                        <i class="fas fa-map-marked-alt"></i>
                        <span><strong>Ruta sugerida:</strong> Configurar Empresa <i class="fas fa-chevron-right"></i> Compras <i class="fas fa-chevron-right"></i> Ventas <i class="fas fa-chevron-right"></i> Reportes</span>
                    </div>
                    
                    <h3>Primeros Pasos</h3>
                    <ol>
                        <li>Crea tu primera empresa en <strong>Administración → Empresas</strong></li>
                        <li>Revisa el plan de cuentas en <strong>Contabilidad → Plan de Cuentas</strong></li>
                        <li>Registra tu primer asiento en <strong>Contabilidad → Asientos</strong></li>
                        <li>Genera el Balance General en <strong>Reportes → Balance General</strong></li>
                    </ol>
                </div>
            `
        },

        contabilidad: {
            title: 'Módulo de Contabilidad (GL)',
            icon: 'fa-book',
            content: `
                <div class="help-section">
                    <div class="help-module-header">
                        <i class="fas fa-book gl"></i>
                        <h3>Contabilidad (General Ledger)</h3>
                    </div>
                    
                    <div class="help-path-banner clickable" data-nav="contabilidad,plan-cuentas">
                        <i class="fas fa-folder-open"></i> Menú Lateral <i class="fas fa-chevron-right"></i> Contabilidad <i class="fas fa-external-link-alt"></i>
                    </div>

                    <div class="help-step-box">
                        <div class="help-step-item clickable" data-nav="contabilidad,plan-cuentas">
                            <div class="step-badge">1</div>
                            <div class="step-text">
                                <strong>Plan de Cuentas:</strong> Define la estructura IFRS. 
                                <span><i class="fas fa-mouse-pointer"></i> Ver <em>Plan de Cuentas</em></span>
                            </div>
                        </div>
                        <div class="help-step-item clickable" data-nav="contabilidad,asientos">
                            <div class="step-badge">2</div>
                            <div class="step-text">
                                <strong>Asientos:</strong> Registro manual de operaciones no operativas.
                                <span><i class="fas fa-plus-circle"></i> Ir a <em>Asientos Contables</em></span>
                            </div>
                        </div>
                        <div class="help-step-item clickable" data-nav="contabilidad,libro-diario">
                            <div class="step-badge">3</div>
                            <div class="step-text">
                                <strong>Libros:</strong> Visualiza el impacto acumulado.
                                <span><i class="fas fa-eye"></i> Ver <em>Libro Diario / Mayor</em></span>
                            </div>
                        </div>
                    </div>

                    <div class="help-info-block">
                        <h5><i class="fas fa-sync-alt"></i> Centralizador vs Jornalizador</h5>
                        <p>El sistema permite elegir entre dos metodologías contables (puedes cambiarlo en <a href="#" class="link-primary" data-nav="admin,configuracion">Administración > Configuración</a>):</p>
                        <ul>
                            <li><strong>Jornalizador:</strong> Cada transacción genera un asiento inmediato en el Libro Diario (ideal para aprendizaje inicial).</li>
                            <li><strong>Centralizador:</strong> Los movimientos se agrupan en libros auxiliares (Ventas, Compras, etc.) y se genera un único asiento resumen mensual (práctica profesional avanzada).</li>
                        </ul>
                    </div>

                    <div class="help-info-block">
                        <h5><i class="fas fa-balance-scale"></i> Ecuación de Control</h5>
                        <p>El sistema valida que <strong>Debe = Haber</strong> en tiempo real. No se permiten asientos descuadrados.</p>
                    </div>
                </div>
            `
        },

        compras: {
            title: 'Módulo de Compras (MM)',
            icon: 'fa-shopping-cart',
            content: `
                <div class="help-section">
                    <div class="help-module-header">
                        <i class="fas fa-shopping-cart mm"></i>
                        <h3>Compras y Abastecimiento (MM)</h3>
                    </div>
                    
                    <div class="help-path-banner clickable" data-nav="compras,ordenes-compra">
                        <i class="fas fa-folder-open"></i> Menú Lateral <i class="fas fa-chevron-right"></i> Compras <i class="fas fa-external-link-alt"></i>
                    </div>

                    <h5><i class="fas fa-project-diagram"></i> Lógica del Proceso (Ciclo Purchase-to-Pay)</h5>
                    <div class="logic-steps">
                        <div class="logic-step-item">
                            <i class="fas fa-file-signature"></i>
                            <div>
                                <strong>1. Orden de Compra:</strong> Documento de planificación. <strong>No genera contabilidad</strong>. Permite autorizar el pedido al proveedor.
                                <br><button class="btn btn-xs btn-outline" data-nav="compras,ordenes-compra">Ir a Órdenes</button>
                            </div>
                        </div>
                        <div class="logic-step-item">
                            <i class="fas fa-truck-loading"></i>
                            <div>
                                <strong>2. Recepción (Guía):</strong> Ingreso físico al inventario. Puede ser <strong>parcial</strong> o total.
                                <br><small>Solo actualiza stock. <strong>No genera asiento contable</strong> (se contabiliza con la factura).</small>
                            </div>
                        </div>
                        <div class="logic-step-item">
                            <i class="fas fa-file-invoice-dollar"></i>
                            <div>
                                <strong>3. Factura de Proveedor:</strong> Legalización de la deuda. Se vincula a la OC recibida.
                                <br><small>Contabilidad: Mercaderías (D) + IVA CF (D) / <strong>Proveedores (C)</strong>.</small>
                                <br><button class="btn btn-xs btn-outline" data-nav="compras,facturas-proveedor">Ir a Facturas</button>
                            </div>
                        </div>
                        <div class="logic-step-item">
                            <i class="fas fa-money-check-alt"></i>
                            <div>
                                <strong>4. Pago:</strong> Extinción de la deuda desde el módulo de <strong>Tesorería</strong>.
                                <br><button class="btn btn-xs btn-outline" data-nav="tesoreria,cuentas-pagar">Ir a Pagos</button>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },

        ventas: {
            title: 'Módulo de Ventas (SD)',
            icon: 'fa-store',
            content: `
                <div class="help-section">
                    <div class="help-module-header">
                        <i class="fas fa-store sd"></i>
                        <h3>Ventas y Distribución (SD)</h3>
                    </div>
                    
                    <div class="help-path-banner clickable" data-nav="ventas,pedidos-venta">
                        <i class="fas fa-folder-open"></i> Menú Lateral <i class="fas fa-chevron-right"></i> Ventas <i class="fas fa-external-link-alt"></i>
                    </div>

                    <h5><i class="fas fa-project-diagram"></i> Lógica del Proceso (Ciclo Order-to-Cash)</h5>
                    <div class="logic-steps">
                        <div class="logic-step-item">
                            <i class="fas fa-clipboard-list"></i>
                            <div>
                                <strong>1. Pedido de Venta:</strong> Reserva comercial de productos. <strong>No genera contabilidad</strong>.
                                <br><button class="btn btn-xs btn-outline" data-nav="ventas,pedidos-venta">Ir a Pedidos</button>
                            </div>
                        </div>
                        <div class="logic-step-item">
                            <i class="fas fa-truck"></i>
                            <div>
                                <strong>2. Entrega (Guía):</strong> Salida física de productos. Permite entregas <strong>parciales</strong>.
                                <br><small>Solo actualiza stock. <strong>No genera asiento contable</strong> (se contabiliza con la factura).</small>
                            </div>
                        </div>
                        <div class="logic-step-item">
                            <i class="fas fa-file-invoice"></i>
                            <div>
                                <strong>3. Facturación:</strong> Emisión del documento tributario legal. Genera 2 asientos contables.
                                <br><small><strong>Asiento 1:</strong> Clientes (D) / <strong>Ventas (C)</strong> + IVA DF (C) — reconocimiento venta a crédito.</small>
                                <br><small><strong>Asiento 2:</strong> Costo de Ventas (D) / Mercaderías (C) — salida del inventario.</small>
                                <br><button class="btn btn-xs btn-outline" data-nav="ventas,facturas-cliente">Ir a Facturas</button>
                            </div>
                        </div>
                        <div class="logic-step-item">
                            <i class="fas fa-cash-register"></i>
                            <div>
                                <strong>4. Cobro:</strong> Recepción del pago en el módulo de <strong>Tesorería</strong>.
                                <br><button class="btn btn-xs btn-outline" data-nav="tesoreria,cuentas-cobrar">Ir a Cobros</button>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },

        inventario: {
            title: 'Módulo de Inventario (WM)',
            icon: 'fa-boxes',
            content: `
                <div class="help-section">
                    <div class="help-module-header">
                        <i class="fas fa-boxes wm"></i>
                        <h3>Inventario y Bodega (WM)</h3>
                    </div>
                    
                    <div class="help-path-banner clickable" data-nav="inventario,productos">
                        <i class="fas fa-folder-open"></i> Menú Lateral <i class="fas fa-chevron-right"></i> Inventario <i class="fas fa-external-link-alt"></i>
                    </div>

                    <div class="help-grid">
                        <div class="help-card clickable" data-nav="inventario,productos">
                            <i class="fas fa-box"></i>
                            <h4>Maestro</h4>
                            <p>Registro de SKUs y Costos.</p>
                        </div>
                        <div class="help-card clickable" data-nav="inventario,movimientos-stock">
                            <i class="fas fa-exchange-alt"></i>
                            <h4>Movimientos</h4>
                            <p>Entradas/Salidas de stock.</p>
                        </div>
                    </div>

                    <div class="help-info-block">
                        <h5><i class="fas fa-calculator"></i> Valorización (PPP)</h5>
                        <p>El sistema utiliza <strong>Costo Promedio Ponderado</strong> para valorar las existencias automáticamente tras cada compra.</p>
                    </div>

                    <div class="help-path clickable" data-nav="inventario,valoracion">
                        <i class="fas fa-search"></i>
                        <span><strong>Consulta rápida:</strong> <em>Inventario > Stock Actual</em> <i class="fas fa-external-link-alt"></i></span>
                    </div>
                </div>
            `
        },

        tesoreria: {
            title: 'Módulo de Tesorería (FI)',
            icon: 'fa-coins',
            content: `
                <div class="help-section">
                    <div class="help-module-header">
                        <i class="fas fa-coins fi"></i>
                        <h3>Tesorería y Finanzas (FI)</h3>
                    </div>
                    
                    <div class="help-path-banner clickable" data-nav="tesoreria,bancos">
                        <i class="fas fa-folder-open"></i> Menú Lateral <i class="fas fa-chevron-right"></i> Tesorería <i class="fas fa-external-link-alt"></i>
                    </div>

                    <div class="help-grid">
                        <div class="help-card-sm clickable" data-nav="tesoreria,bancos">
                            <i class="fas fa-money-bill-wave"></i>
                            <strong>Efectivo</strong>
                            <span>Saldo Caja</span>
                        </div>
                        <div class="help-card-sm clickable" data-nav="tesoreria,bancos">
                            <i class="fas fa-university"></i>
                            <strong>Transf.</strong>
                            <span>Saldo Banco</span>
                        </div>
                        <div class="help-card-sm highlight clickable" data-nav="tesoreria,cuentas-pagar">
                            <i class="fas fa-money-check"></i>
                            <strong>Cheques</strong>
                            <span>Por cobrar/pagar</span>
                        </div>
                    </div>

                    <div class="help-info-block" style="margin-top: var(--space-4);">
                        <h5><i class="fas fa-map-signs"></i> Gestión de Pagos/Cobros</h5>
                        <ol>
                            <li>Ve a <strong>Tesorería > Control de Pagos</strong> (o Cobros).</li>
                            <li>Selecciona la factura pendiente en la lista.</li>
                            <li>Haz clic en el botón de la derecha para abrir el modal de registro.</li>
                            <li>Distribuye el pago (admite múltiples métodos como Cheque, Caja o Banco).</li>
                        </ol>
                    </div>
                    
                    <div class="help-tip">
                        <i class="fas fa-shield-alt"></i>
                        <span><strong>Trazabilidad:</strong> El sistema vincula el pago directamente con la factura, permitiendo ver el flujo desde el GL.</span>
                    </div>
                </div>
            `
        },

        costos: {
            title: 'Módulo de Costos (CO)',
            icon: 'fa-calculator',
            content: `
                <div class="help-section">
                    <div class="stage-2-banner">
                        <i class="fas fa-clock"></i>
                        <span>Etapa 2: Próximamente disponible</span>
                    </div>
                    <div class="help-module-header disabled">
                        <i class="fas fa-calculator co"></i>
                        <h3>Contabilidad de Costos (CO)</h3>
                    </div>
                    <p>Este módulo está planificado para la siguiente fase del proyecto EDU-TRACE ERP. 
                    Permitirá el análisis detallado por centros de costo y órdenes internas.</p>
                </div>
            `
        },

        rrhh: {
            title: 'Módulo de RRHH (HR)',
            icon: 'fa-users',
            content: `
                <div class="help-section">
                    <div class="stage-2-banner">
                        <i class="fas fa-clock"></i>
                        <span>Etapa 2: Próximamente disponible</span>
                    </div>
                    <div class="help-module-header disabled">
                        <i class="fas fa-users hr"></i>
                        <h3>Recursos Humanos (HR)</h3>
                    </div>
                    <p>La gestión de recursos humanos y el cálculo de remuneraciones según normativa chilena 
                    estarán disponibles en la Etapa 2.</p>
                </div>
            `
        },

        reportes: {
            title: 'Reportes Financieros',
            icon: 'fa-chart-bar',
            content: `
                <div class="help-section">
                    <div class="help-module-header">
                        <i class="fas fa-chart-bar rpts"></i>
                        <h3>Reportes y Estados Financieros</h3>
                    </div>
                    
                    <div class="help-path-banner">
                        <i class="fas fa-folder-open"></i> Menú Lateral <i class="fas fa-chevron-right"></i> Reportes
                    </div>

                    <div class="help-path-banner clickable" data-nav="reportes,balance-general">
                        <i class="fas fa-folder-open"></i> Menú Lateral <i class="fas fa-chevron-right"></i> Reportes <i class="fas fa-external-link-alt"></i>
                    </div>

                    <div class="help-grid">
                        <div class="help-card clickable" data-nav="reportes,balance-general">
                            <i class="fas fa-balance-scale"></i>
                            <h4>Balance</h4>
                            <p>Situación Financiera.</p>
                        </div>
                        <div class="help-card clickable" data-nav="reportes,estado-resultados">
                            <i class="fas fa-chart-line"></i>
                            <h4>Resultados</h4>
                            <p>Pérdidas y Ganancias.</p>
                        </div>
                    </div>

                    <div class="help-info-block">
                        <h5><i class="fas fa-file-export"></i> Exportación de Datos</h5>
                        <p>Todos los estados financieros pueden exportarse a <strong>PDF</strong> para presentaciones académicas.</p>
                        <span><i class="fas fa-mouse-pointer"></i> Busca el botón <i class="fas fa-download"></i> en la esquina superior de cada reporte.</span>
                    </div>
                </div>
            `
        },

        trazabilidad: {
            title: 'Módulo de Trazabilidad',
            icon: 'fa-search-dollar',
            content: `
                <div class="help-section">
                    <div class="stage-2-banner">
                        <i class="fas fa-clock"></i>
                        <span>Etapa 2: Próximamente disponible</span>
                    </div>
                    <div class="help-module-header disabled">
                        <i class="fas fa-project-diagram trace"></i>
                        <h3>Trazabilidad Avanzada</h3>
                    </div>
                    <p>Diagramas de flujo automáticos y validaciones en tiempo real para el seguimiento pedagógico estarán disponibles en la Etapa 2.</p>
                </div>
            `
        },

        admin: {
            title: 'Administración del Sistema',
            icon: 'fa-cog',
            content: `
                <div class="help-section">
                    <div class="help-module-header">
                        <i class="fas fa-cog admin"></i>
                        <h3>Administración y Casos</h3>
                    </div>
                    
                    <div class="help-path-banner clickable" data-nav="admin,empresas">
                        <i class="fas fa-folder-open"></i> Menú Lateral <i class="fas fa-chevron-right"></i> Administración <i class="fas fa-external-link-alt"></i>
                    </div>

                    <div class="help-info-block">
                        <h5><i class="fas fa-file-import"></i> Importar Casos de Estudio</h5>
                        <ol>
                            <li>Ve a <em>Administración > Importar/Exportar</em></li>
                            <li>Haz clic en "Seleccionar archivo .json"</li>
                            <li>Elige el archivo del caso entregado por el profesor.</li>
                        </ol>
                    </div>

                    <div class="help-info-block">
                        <h5><i class="fas fa-tools"></i> Configuración de Parámetros</h5>
                        <p>En el módulo de <strong>Configuración</strong> puedes ajustar:</p>
                        <ul>
                            <li class="clickable" data-nav="admin,configuracion"><i class="fas fa-building"></i> Nombre y RUT de la Empresa.</li>
                            <li class="clickable" data-nav="admin,configuracion"><i class="fas fa-calendar-alt"></i> Periodo Contable.</li>
                        </ul>
                    </div>

                    <div class="help-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Importar un caso **reemplaza** los datos actuales de la empresa. Asegúrate de respaldar antes mediante "Exportar JSON".</span>
                    </div>
                </div>
            `
        },

        casos: {
            title: 'Casos de Demostración',
            icon: 'fa-file-excel',
            content: `
                <div class="help-section">
                    <div class="help-module-header">
                        <i class="fas fa-file-excel cases"></i>
                        <h3>Casos de Demostración</h3>
                    </div>
                    
                    <p>Explora el funcionamiento del ERP mediante escenarios pre-configurados. Cada caso incluye un archivo Excel con la historia del negocio y un archivo JSON para cargar en el sistema.</p>

                    <div class="help-grid">
                        <div class="help-card-sm highlight" style="border-color: #27ae60; background: #f0fff4;">
                            <i class="fas fa-file-excel" style="color: #27ae60;"></i>
                            <strong>Caso 1: Comercial</strong>
                            <span>Retail y Ventas</span>
                            <a href="https://github.com/sandymena/proyecto-edu-trace-erp/raw/main/casos/Caso_1_Empresa_Comercial.xlsx" class="btn btn-xs" target="_blank" style="margin-top:5px; background:#27ae60; color:white; text-decoration:none;">Excel</a>
                        </div>
                        <div class="help-card-sm highlight" style="border-color: #27ae60; background: #f0fff4;">
                            <i class="fas fa-file-excel" style="color: #27ae60;"></i>
                            <strong>Caso 2: Servicios</strong>
                            <span>Honorarios y Gastos</span>
                            <a href="https://github.com/sandymena/proyecto-edu-trace-erp/raw/main/casos/Caso_2_Empresa_Servicios.xlsx" class="btn btn-xs" target="_blank" style="margin-top:5px; background:#27ae60; color:white; text-decoration:none;">Excel</a>
                        </div>
                    </div>

                    <div class="help-info-block" style="margin-top: var(--space-4);">
                        <h5><i class="fas fa-rocket"></i> ¿Cómo usar un caso?</h5>
                        <ol>
                            <li>Descarga y revisa el <strong>archivo Excel</strong> para entender el contexto del negocio.</li>
                            <li>En la misma carpeta de GitHub, busca el archivo <code>.json</code> correspondiente.</li>
                            <li>Ve a <strong class="clickable" data-nav="admin,empresas">Administración > Cargar</strong> y utiliza la opción de importar JSON.</li>
                        </ol>
                    </div>

                    <div class="help-tip">
                        <i class="fas fa-lightbulb"></i>
                        <span>Los archivos Excel contienen la "Memoria Explicativa", enunciados y la solución esperada para contrastar con el ERP.</span>
                    </div>
                </div>
            `
        },

        diagrama: {
            title: 'Diagrama Contable Interactivo',
            icon: 'fa-project-diagram',
            content: `
                <div class="help-section">
                    <div class="help-module-header">
                        <i class="fas fa-project-diagram gl"></i>
                        <h3>Diagrama Contable Interactivo</h3>
                    </div>

                    <div class="help-path-banner clickable" data-nav="dashboard,null">
                        <i class="fas fa-mouse-pointer"></i> Dashboard <i class="fas fa-chevron-right"></i> Ver Diagrama Contable <i class="fas fa-external-link-alt"></i>
                    </div>

                    <p>Herramienta visual para entender el flujo de las transacciones contables en tiempo real.</p>
                    
                    <div class="help-info-block">
                        <h5><i class="fas fa-exchange-alt"></i> Flujo de Transacción</h5>
                        <p>Visualiza cómo cada operación (Venta, Compra, Pago) impacta el Balance mediante animaciones que conectan documentos con cuentas contables.</p>
                    </div>
                    
                    <div class="help-info-block">
                        <h5><i class="fas fa-balance-scale"></i> Ecuación Dinámica</h5>
                        <p>Muestra cómo se mantiene el equilibrio: <strong>ACTIVO = PASIVO + PATRIMONIO</strong> tras cada registro.</p>
                    </div>
                    
                    <div class="help-tip">
                        <i class="fas fa-lightbulb"></i>
                        <span>Ideal para entender la metodología de <strong>Partida Doble</strong> de forma gráfica.</span>
                    </div>

                    <div class="help-path clickable" onclick="Modal.close(); window.location.href = 'diagrama-contable.html';">
                        <i class="fas fa-play-circle"></i>
                        <span><strong>Abrir Diagrama ahora</strong> <i class="fas fa-external-link-alt"></i></span>
                    </div>
                </div>
            `
        }
    },

    /**
     * FAQs
     */
    faqs: [
        {
            question: '¿Cómo creo una nueva empresa?',
            answer: 'Ve a <strong>Administración → Empresas</strong> y haz clic en "Nueva Empresa". Completa el formulario con el nombre, RUT y configuración inicial.'
        },
        {
            question: '¿Puedo exportar mis datos?',
            answer: 'Sí, puedes exportar todos los datos de tu empresa en formato JSON (respaldo completo) o Excel (tablas separadas) desde <strong>Administración → Importar/Exportar</strong>.'
        },
        {
            question: '¿Los datos se guardan automáticamente?',
            answer: 'Sí, todos los datos se guardan localmente en tu navegador usando IndexedDB. No requiere conexión a internet.'
        },
        {
            question: '¿Qué pasa si borro los datos del navegador?',
            answer: 'Los datos de EDU-TRACE ERP se perderán. Recomendamos hacer respaldos periódicos exportando la empresa a JSON.'
        },
        {
            question: '¿Por qué mi pago con cheque no aparece en el Banco?',
            answer: 'Por diseño pedagógico, los cheques se mantienen en cuentas transitorias hasta que se confirma su movimiento bancario real, permitiendo al alumno entender la diferencia entre el pago administrativo y el movimiento de fondos.'
        },
        {
            question: '¿Dónde puedo encontrar el manual completo?',
            answer: 'Existe un <strong>Manual de Capacitación interactivo</strong> externo con guías paso a paso detalladas por proceso lógico. Consulte con su profesor para obtener el enlace local o remoto.'
        },
        {
            question: '¿Qué normativa contable usa el sistema?',
            answer: 'EDU-TRACE ERP usa un plan de cuentas basado en IFRS adaptado a la normativa chilena, con IVA al 19%.'
        }
    ],

    /**
     * Muestra la ayuda principal
     */
    show(moduleId = null) {
        const currentModule = moduleId || App.currentModule || 'general';
        const doc = this.documentation[currentModule] || this.documentation.general;

        Modal.open({
            title: `<i class="fas ${doc.icon}"></i> ${doc.title}`,
            size: 'large',
            content: `
                <div class="help-container">
                    <div class="help-sidebar">
                        <h4>Módulos</h4>
                        <ul class="help-nav">
                            ${Object.entries(this.documentation).map(([id, d]) => `
                                <li class="${id === currentModule ? 'active' : ''}" data-module="${id}">
                                    <i class="fas ${d.icon}"></i>
                                    <span>${d.title.replace('Módulo de ', '').split(' (')[0]}</span>
                                </li>
                            `).join('')}
                        </ul>
                        
                        <h4>Accesos Rápidos</h4>
                        <ul class="help-quick">
                            <li onclick="Modal.close(); TutorialSystem.showTutorialSelector();">
                                <i class="fas fa-graduation-cap"></i> Tutoriales
                            </li>
                            <li onclick="HelpSystem.showFAQ()">
                                <i class="fas fa-question-circle"></i> FAQ
                            </li>
                            <li onclick="HelpSystem.showShortcuts()">
                                <i class="fas fa-keyboard"></i> Atajos
                            </li>
                        </ul>
                    </div>
                    <div class="help-content" id="help-content">
                        ${doc.content}
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-primary" onclick="Modal.close(); TutorialSystem.start();">
                    <i class="fas fa-play"></i> Iniciar Tutorial
                </button>
                <button class="btn btn-outline" onclick="Modal.close()">Cerrar</button>
            `
        });

        // Bind navigation between help topics
        document.querySelectorAll('.help-nav li').forEach(li => {
            li.addEventListener('click', () => {
                const moduleId = li.dataset.module;
                const doc = this.documentation[moduleId];
                if (doc) {
                    document.querySelectorAll('.help-nav li').forEach(l => l.classList.remove('active'));
                    li.classList.add('active');
                    document.getElementById('help-content').innerHTML = doc.content;
                    this.bindContentActions(); // Re-bind deep links
                }
            });
        });

        this.bindContentActions();
    },

    /**
     * Bind de acciones dentro del contenido de ayuda (Deep Links)
     */
    bindContentActions() {
        document.querySelectorAll('.help-content [data-nav]').forEach(el => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const [module, view] = el.dataset.nav.split(',');
                Modal.close();
                App.navigate(module, view);
            });
        });
    },

    /**
     * Muestra FAQ
     */
    showFAQ() {
        Modal.open({
            title: '<i class="fas fa-question-circle"></i> Preguntas Frecuentes',
            size: 'large',
            content: `
                <div class="faq-list">
                    ${this.faqs.map((faq, i) => `
                        <div class="faq-item">
                            <div class="faq-question" onclick="this.parentElement.classList.toggle('open')">
                                <span>${faq.question}</span>
                                <i class="fas fa-chevron-down"></i>
                            </div>
                            <div class="faq-answer">
                                <p>${faq.answer}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `,
            footer: `
                <button class="btn btn-outline" onclick="HelpSystem.show()">
                    <i class="fas fa-arrow-left"></i> Volver a Ayuda
                </button>
                <button class="btn btn-primary" onclick="Modal.close()">Cerrar</button>
            `
        });
    },

    /**
     * Muestra atajos de teclado
     */
    showShortcuts() {
        Modal.open({
            title: '<i class="fas fa-keyboard"></i> Atajos de Teclado',
            size: 'medium',
            content: `
                <div class="shortcuts-list">
                    <div class="shortcut-group">
                        <h4>Navegación</h4>
                        <div class="shortcut-item">
                            <span class="shortcut-keys"><kbd>Alt</kbd> + <kbd>D</kbd></span>
                            <span class="shortcut-desc">Ir al Dashboard</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-keys"><kbd>Alt</kbd> + <kbd>C</kbd></span>
                            <span class="shortcut-desc">Ir a Contabilidad</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-keys"><kbd>Alt</kbd> + <kbd>R</kbd></span>
                            <span class="shortcut-desc">Ir a Reportes</span>
                        </div>
                    </div>
                    
                    <div class="shortcut-group">
                        <h4>Acciones</h4>
                        <div class="shortcut-item">
                            <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>S</kbd></span>
                            <span class="shortcut-desc">Guardar</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>N</kbd></span>
                            <span class="shortcut-desc">Nuevo registro</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-keys"><kbd>Ctrl</kbd> + <kbd>F</kbd></span>
                            <span class="shortcut-desc">Buscar</span>
                        </div>
                    </div>
                    
                    <div class="shortcut-group">
                        <h4>Sistema</h4>
                        <div class="shortcut-item">
                            <span class="shortcut-keys"><kbd>Esc</kbd></span>
                            <span class="shortcut-desc">Cerrar modal/cancelar</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-keys"><kbd>F1</kbd></span>
                            <span class="shortcut-desc">Abrir ayuda</span>
                        </div>
                        <div class="shortcut-item">
                            <span class="shortcut-keys"><kbd>?</kbd></span>
                            <span class="shortcut-desc">Mostrar atajos</span>
                        </div>
                    </div>
                </div>
            `,
            footer: `
                <button class="btn btn-outline" onclick="HelpSystem.show()">
                    <i class="fas fa-arrow-left"></i> Volver
                </button>
                <button class="btn btn-primary" onclick="Modal.close()">Cerrar</button>
            `
        });
    }
};

// Estilos del sistema de ayuda
const helpStyles = document.createElement('style');
helpStyles.textContent = `
    .help-container {
        display: flex;
        gap: var(--space-6);
        min-height: 400px;
    }
    
    .help-sidebar {
        width: 200px;
        flex-shrink: 0;
        border-right: 1px solid var(--border-light);
        padding-right: var(--space-4);
    }
    
    .help-sidebar h4 {
        font-size: var(--font-size-xs);
        text-transform: uppercase;
        color: var(--text-tertiary);
        margin: 0 0 var(--space-2);
        padding-top: var(--space-3);
    }
    
    .help-sidebar h4:first-child { padding-top: 0; }
    
    .help-nav, .help-quick {
        list-style: none;
        margin: 0 0 var(--space-4);
        padding: 0;
    }
    
    .help-nav li, .help-quick li {
        display: flex;
        align-items: center;
        gap: var(--space-2);
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-md);
        cursor: pointer;
        font-size: var(--font-size-sm);
        color: var(--text-secondary);
        transition: all var(--transition-fast);
    }
    
    .help-nav li:hover, .help-quick li:hover {
        background: var(--neutral-100);
        color: var(--text-primary);
    }
    
    .help-nav li.active {
        background: var(--primary-50);
        color: var(--primary-600);
        font-weight: 500;
    }
    
    .help-nav li i, .help-quick li i {
        width: 16px;
        text-align: center;
    }
    
    .help-content {
        flex: 1;
        overflow-y: auto;
        max-height: 500px;
    }
    
    .help-welcome {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-4);
        color: var(--primary-600);
    }
    
    .help-welcome i { font-size: 2rem; }
    
    .help-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--space-3);
        margin: var(--space-4) 0;
    }
    
    .help-card {
        padding: var(--space-3);
        background: var(--neutral-50);
        border-radius: var(--radius-lg);
        border: 1px solid var(--border-light);
        text-align: center;
    }
    
    .help-card i { font-size: 1.5rem; color: var(--primary-500); margin-bottom: var(--space-2); }
    .help-card h4 { margin: 0 0 var(--space-1); font-size: var(--font-size-sm); }
    .help-card p { margin: 0; font-size: var(--font-size-xs); color: var(--text-tertiary); }
    
    .help-card-sm {
        padding: var(--space-2);
        background: white;
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        text-align: center;
        display: flex;
        flex-direction: column;
        gap: 2px;
    }
    
    .help-card-sm.highlight { border-color: var(--warning-400); background: var(--warning-50); }
    .help-card-sm strong { font-size: var(--font-size-xs); }
    .help-card-sm span { font-size: 10px; color: var(--text-tertiary); }
    
    .help-path {
        background: var(--neutral-800);
        color: white;
        padding: var(--space-3);
        border-radius: var(--radius-md);
        font-size: var(--font-size-sm);
        display: flex;
        align-items: center;
        gap: var(--space-3);
    }
    
    .help-path-banner {
        background: var(--neutral-100);
        padding: var(--space-2) var(--space-3);
        border-radius: var(--radius-sm);
        font-size: var(--font-size-xs);
        color: var(--text-secondary);
        margin-bottom: var(--space-4);
        border-left: 3px solid var(--primary-500);
    }

    .help-module-header {
        display: flex;
        align-items: center;
        gap: var(--space-3);
        margin-bottom: var(--space-2);
    }
    
    .help-module-header i {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--primary-500);
        color: white;
        border-radius: var(--radius-md);
        font-size: 1.25rem;
    }
    
    .help-module-header i.gl { background: linear-gradient(135deg, #0a6ed1, #064280); }
    .help-module-header i.mm { background: linear-gradient(135deg, #df6e0c, #c45f0a); }
    .help-module-header i.sd { background: linear-gradient(135deg, #107e3e, #0d6630); }
    .help-module-header i.fi { background: linear-gradient(135deg, #6c5ce7, #5f3dc4); }
    .help-module-header i.cases { background: linear-gradient(135deg, #27ae60, #1e8449); }

    .help-step-box {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
        margin: var(--space-4) 0;
    }
    
    .help-step-item {
        display: flex;
        gap: var(--space-3);
        align-items: flex-start;
    }
    
    .step-badge {
        width: 22px;
        height: 22px;
        background: var(--primary-500);
        color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        flex-shrink: 0;
        margin-top: 2px;
    }
    
    .step-text { font-size: var(--font-size-sm); }
    .step-text span { display: block; font-size: 11px; color: var(--text-tertiary); margin-top: 2px; }

    .process-flow {
        display: flex;
        align-items: center;
        justify-content: space-around;
        padding: var(--space-4);
        background: var(--neutral-50);
        border-radius: var(--radius-lg);
        margin: var(--space-4) 0;
    }
    
    .process-node { text-align: center; display: flex; flex-direction: column; gap: 4px; }
    .process-node i { font-size: 1.25rem; color: var(--primary-600); }
    .process-node span { font-size: var(--font-size-xs); font-weight: 600; }
    .process-node small { font-size: 10px; color: var(--text-tertiary); }
    .process-arrow { color: var(--neutral-300); }

    .help-info-block {
        padding: var(--space-3);
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        margin: var(--space-4) 0;
    }
    
    .help-info-block h5 { margin: 0 0 var(--space-2); font-size: var(--font-size-sm); color: var(--primary-600); }
    .help-info-block p, .help-info-block li { font-size: var(--font-size-sm); margin: 0; }
    .help-info-block ul { padding-left: var(--space-4); margin-top: var(--space-2); }
`;
document.head.appendChild(helpStyles);

// Atajos de teclado globales
document.addEventListener('keydown', (e) => {
    // F1 - Ayuda
    if (e.key === 'F1') {
        e.preventDefault();
        HelpSystem.show();
    }

    // ? - Atajos
    if (e.key === '?' && !e.ctrlKey && !e.altKey) {
        const activeElement = document.activeElement;
        if (!activeElement || !['INPUT', 'TEXTAREA'].includes(activeElement.tagName)) {
            HelpSystem.showShortcuts();
        }
    }
});

// Hacer disponible globalmente
window.HelpSystem = HelpSystem;
