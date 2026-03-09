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
                    <h3>¿Qué es EDU-TRACE ERP?</h3>
                    <p>EDU-TRACE ERP es un <strong>sistema ERP educativo</strong> diseñado específicamente para estudiantes 
                    de auditoría y contabilidad. Simula las funcionalidades de sistemas empresariales, 
                    permitiendo aprender la lógica de procesos de negocio sin la complejidad de un sistema real.</p>
                    
                    <h3>Características Principales</h3>
                    <ul>
                        <li><strong>Empresas Virtuales:</strong> Cada estudiante puede crear y gestionar múltiples empresas</li>
                        <li><strong>Módulos Integrados:</strong> Contabilidad, Compras, Ventas, Inventario, Tesorería, Costos y RRHH</li>
                        <li><strong>Datos Offline:</strong> Todo se almacena localmente usando IndexedDB</li>
                        <li><strong>Importar/Exportar:</strong> Comparte casos de estudio en JSON o Excel</li>
                        <li><strong>Reportes:</strong> Genera estados financieros automáticamente</li>
                    </ul>
                    
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
                    <h3>Contabilidad General</h3>
                    <p>El módulo de Contabilidad (General Ledger - GL) es el núcleo del sistema ERP. 
                    Aquí se registran todas las transacciones financieras de la empresa.</p>
                    
                    <h4><i class="fas fa-sitemap"></i> Plan de Cuentas</h4>
                    <p>El plan de cuentas viene precargado con una estructura IFRS/PCGA chilena:</p>
                    <table class="help-table">
                        <tr><td><strong>1</strong></td><td>Activos</td><td>Bienes y derechos</td></tr>
                        <tr><td><strong>2</strong></td><td>Pasivos</td><td>Obligaciones</td></tr>
                        <tr><td><strong>3</strong></td><td>Patrimonio</td><td>Capital y resultados</td></tr>
                        <tr><td><strong>4</strong></td><td>Ingresos</td><td>Ventas y otros ingresos</td></tr>
                        <tr><td><strong>5</strong></td><td>Costos</td><td>Costo de ventas</td></tr>
                        <tr><td><strong>6</strong></td><td>Gastos</td><td>Gastos operacionales</td></tr>
                    </table>
                    
                    <h4><i class="fas fa-file-invoice"></i> Asientos Contables</h4>
                    <p>Para crear un asiento:</p>
                    <ol>
                        <li>Selecciona la fecha del documento</li>
                        <li>Ingresa una glosa descriptiva</li>
                        <li>Agrega líneas al Debe y al Haber</li>
                        <li>Verifica que <strong>Debe = Haber</strong></li>
                        <li>Guarda y contabiliza</li>
                    </ol>
                    
                    <div class="help-tip">
                        <i class="fas fa-lightbulb"></i>
                        <span>Los asientos deben estar balanceados. El sistema no permitirá guardar 
                        un asiento donde el total del Debe no sea igual al total del Haber.</span>
                    </div>
                    
                    <h4><i class="fas fa-book-open"></i> Libro Mayor</h4>
                    <p>Muestra todos los movimientos de una cuenta específica, 
                    con saldo inicial, movimientos y saldo final.</p>
                    
                    <h4><i class="fas fa-list"></i> Libro Diario</h4>
                    <p>Registro cronológico de todos los asientos contables, 
                    ordenados por fecha de operación.</p>
                </div>
            `
        },

        compras: {
            title: 'Módulo de Compras (MM)',
            icon: 'fa-shopping-cart',
            content: `
                <div class="help-section">
                    <h3>Gestión de Compras</h3>
                    <p>El módulo de Compras (Materials Management - MM) gestiona todo el proceso 
                    de adquisición de bienes y servicios.</p>
                    
                    <h4><i class="fas fa-users"></i> Proveedores</h4>
                    <p>Mantiene el registro de proveedores con:</p>
                    <ul>
                        <li>Datos fiscales (RUT, razón social)</li>
                        <li>Información de contacto</li>
                        <li>Condiciones de pago</li>
                        <li>Historial de transacciones</li>
                    </ul>
                    
                    <h4><i class="fas fa-file-alt"></i> Órdenes de Compra</h4>
                    <p>Documento que formaliza una solicitud de compra:</p>
                    <ol>
                        <li>Selecciona el proveedor</li>
                        <li>Agrega los productos o servicios</li>
                        <li>Define cantidades y precios</li>
                        <li>Aprueba la orden</li>
                    </ol>
                    
                    <h4><i class="fas fa-file-invoice-dollar"></i> Facturas de Proveedor</h4>
                    <p>Registro de documentos tributarios recibidos:</p>
                    <ul>
                        <li>Genera automáticamente cuentas por pagar</li>
                        <li>Registra el IVA crédito fiscal</li>
                        <li>Actualiza el inventario (si corresponde)</li>
                        <li>Crea el asiento contable automático</li>
                    </ul>
                    
                    <div class="help-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Las facturas de proveedor deben asociarse a una orden de compra 
                        para mantener la trazabilidad del proceso.</span>
                    </div>
                </div>
            `
        },

        ventas: {
            title: 'Módulo de Ventas (SD)',
            icon: 'fa-store',
            content: `
                <div class="help-section">
                    <h3>Gestión de Ventas</h3>
                    <p>El módulo de Ventas (Sales & Distribution - SD) gestiona todo el proceso 
                    comercial con clientes.</p>
                    
                    <h4><i class="fas fa-user-tie"></i> Clientes</h4>
                    <p>Registro maestro de clientes:</p>
                    <ul>
                        <li>Datos fiscales y comerciales</li>
                        <li>Límite de crédito</li>
                        <li>Condiciones de pago</li>
                        <li>Historial de ventas</li>
                    </ul>
                    
                    <h4><i class="fas fa-clipboard-list"></i> Pedidos de Venta</h4>
                    <p>Proceso de venta:</p>
                    <ol>
                        <li>Registra el pedido del cliente</li>
                        <li>Verifica disponibilidad de stock</li>
                        <li>Confirma precios y descuentos</li>
                        <li>Genera la factura</li>
                    </ol>
                    
                    <h4><i class="fas fa-file-invoice"></i> Facturas de Venta</h4>
                    <p>Documentos tributarios emitidos:</p>
                    <ul>
                        <li>Genera automáticamente cuentas por cobrar</li>
                        <li>Registra el IVA débito fiscal</li>
                        <li>Rebaja el inventario</li>
                        <li>Contabiliza el ingreso</li>
                    </ul>
                </div>
            `
        },

        inventario: {
            title: 'Módulo de Inventario (WM)',
            icon: 'fa-boxes',
            content: `
                <div class="help-section">
                    <h3>Gestión de Inventario</h3>
                    <p>El módulo de Inventario (Warehouse Management - WM) controla el stock 
                    de productos y su valorización.</p>
                    
                    <h4><i class="fas fa-box"></i> Productos</h4>
                    <p>Catálogo de productos y servicios:</p>
                    <ul>
                        <li>Código SKU único</li>
                        <li>Descripción y categoría</li>
                        <li>Unidad de medida</li>
                        <li>Costo promedio y precio de venta</li>
                        <li>Stock actual</li>
                    </ul>
                    
                    <h4><i class="fas fa-exchange-alt"></i> Movimientos de Stock</h4>
                    <p>Tipos de movimientos:</p>
                    <ul>
                        <li><strong>Entrada:</strong> Recepción de compras</li>
                        <li><strong>Salida:</strong> Despacho por ventas</li>
                        <li><strong>Ajuste (+):</strong> Corrección positiva</li>
                        <li><strong>Ajuste (-):</strong> Mermas, pérdidas</li>
                        <li><strong>Transferencia:</strong> Entre bodegas</li>
                    </ul>
                    
                    <h4><i class="fas fa-calculator"></i> Valorización</h4>
                    <p>Métodos de costeo disponibles:</p>
                    <ul>
                        <li><strong>Costo Promedio Ponderado:</strong> (Por defecto) Recalcula con cada entrada</li>
                        <li><strong>FIFO:</strong> Primero en entrar, primero en salir</li>
                        <li><strong>Costo Específico:</strong> Para items únicos</li>
                    </ul>
                </div>
            `
        },

        tesoreria: {
            title: 'Módulo de Tesorería (FI)',
            icon: 'fa-coins',
            content: `
                <div class="help-section">
                    <h3>Gestión de Tesorería</h3>
                    <p>El módulo de Tesorería (Financial - FI) controla el flujo de efectivo 
                    y las obligaciones financieras.</p>
                    
                    <h4><i class="fas fa-file-invoice-dollar"></i> Cuentas por Pagar</h4>
                    <p>Control de obligaciones con proveedores:</p>
                    <ul>
                        <li>Facturas pendientes de pago</li>
                        <li>Vencimientos y antigüedad</li>
                        <li>Estado de pagos parciales</li>
                    </ul>
                    
                    <h4><i class="fas fa-hand-holding-usd"></i> Cuentas por Cobrar</h4>
                    <p>Control de créditos con clientes:</p>
                    <ul>
                        <li>Facturas pendientes de cobro</li>
                        <li>Análisis de morosidad</li>
                        <li>Gestión de cobranza</li>
                    </ul>
                    
                    <h4><i class="fas fa-university"></i> Bancos</h4>
                    <p>Gestión de cuentas bancarias:</p>
                    <ul>
                        <li>Registro de cuentas corrientes</li>
                        <li>Movimientos bancarios</li>
                        <li>Saldos disponibles</li>
                    </ul>
                    
                    <h4><i class="fas fa-balance-scale"></i> Conciliación Bancaria</h4>
                    <p>Comparación entre libro banco y cartola:</p>
                    <ul>
                        <li>Identificar cheques pendientes</li>
                        <li>Detectar depósitos en tránsito</li>
                        <li>Cuadrar saldos contables con reales</li>
                    </ul>
                </div>
            `
        },

        costos: {
            title: 'Módulo de Costos (CO)',
            icon: 'fa-calculator',
            content: `
                <div class="help-section">
                    <h3>Contabilidad de Costos</h3>
                    <p>El módulo de Costos (Controlling - CO) permite analizar y controlar 
                    los costos de la organización.</p>
                    
                    <h4><i class="fas fa-sitemap"></i> Centros de Costo</h4>
                    <p>Unidades organizacionales para acumular costos:</p>
                    <ul>
                        <li>Departamentos (Ventas, Administración, Producción)</li>
                        <li>Sucursales o unidades de negocio</li>
                        <li>Proyectos específicos</li>
                    </ul>
                    
                    <h4><i class="fas fa-tasks"></i> Órdenes Internas</h4>
                    <p>Para control de costos específicos:</p>
                    <ul>
                        <li>Proyectos con presupuesto definido</li>
                        <li>Campañas de marketing</li>
                        <li>Mantenimiento de activos</li>
                    </ul>
                    
                    <h4><i class="fas fa-chart-pie"></i> Análisis de Costos</h4>
                    <p>Reportes de gestión:</p>
                    <ul>
                        <li>Presupuesto vs Real</li>
                        <li>Distribución de costos</li>
                        <li>Tendencias y variaciones</li>
                    </ul>
                </div>
            `
        },

        rrhh: {
            title: 'Módulo de RRHH (HR)',
            icon: 'fa-users',
            content: `
                <div class="help-section">
                    <h3>Recursos Humanos</h3>
                    <p>El módulo de RRHH (Human Resources - HR) gestiona el personal 
                    y la nómina de la empresa.</p>
                    
                    <h4><i class="fas fa-id-card"></i> Empleados</h4>
                    <p>Ficha del personal:</p>
                    <ul>
                        <li>Datos personales y contrato</li>
                        <li>Cargo y departamento</li>
                        <li>Remuneración pactada</li>
                        <li>Fechas de ingreso y términos</li>
                    </ul>
                    
                    <h4><i class="fas fa-money-check-alt"></i> Nómina</h4>
                    <p>Cálculo de remuneraciones (normativa chilena):</p>
                    <table class="help-table">
                        <tr><td>AFP</td><td>10.00% + comisión</td></tr>
                        <tr><td>Salud</td><td>7.00%</td></tr>
                        <tr><td>Seguro Cesantía</td><td>0.60%</td></tr>
                        <tr><td>Impuesto Único</td><td>Según tabla SII</td></tr>
                    </table>
                    
                    <h4><i class="fas fa-piggy-bank"></i> Provisiones</h4>
                    <p>Obligaciones laborales:</p>
                    <ul>
                        <li><strong>Vacaciones:</strong> 15 días hábiles al año</li>
                        <li><strong>Indemnización:</strong> Un mes por año de servicio</li>
                        <li><strong>Gratificación:</strong> 25% sobre sueldo con tope</li>
                    </ul>
                </div>
            `
        },

        reportes: {
            title: 'Reportes Financieros',
            icon: 'fa-chart-bar',
            content: `
                <div class="help-section">
                    <h3>Estados Financieros</h3>
                    <p>Genera los reportes contables y financieros de la empresa.</p>
                    
                    <h4><i class="fas fa-balance-scale-right"></i> Balance General</h4>
                    <p>Estado de situación financiera:</p>
                    <p style="text-align: center; padding: var(--space-3); background: var(--neutral-100); 
                        border-radius: var(--radius-md); font-weight: 600;">
                        Activos = Pasivos + Patrimonio
                    </p>
                    <p>Muestra los bienes, derechos y obligaciones a una fecha determinada.</p>
                    
                    <h4><i class="fas fa-chart-line"></i> Estado de Resultados</h4>
                    <p>Pérdidas y ganancias del período:</p>
                    <ul>
                        <li>(+) Ingresos operacionales</li>
                        <li>(-) Costos de venta</li>
                        <li>(=) Margen bruto</li>
                        <li>(-) Gastos operacionales</li>
                        <li>(=) Resultado operacional</li>
                        <li>(±) Otros ingresos/gastos</li>
                        <li>(=) Resultado antes de impuestos</li>
                    </ul>
                    
                    <h4><i class="fas fa-money-bill-wave"></i> Flujo de Caja</h4>
                    <p>Movimientos de efectivo clasificados:</p>
                    <ul>
                        <li><strong>Operación:</strong> Actividades del giro</li>
                        <li><strong>Inversión:</strong> Compra/venta de activos</li>
                        <li><strong>Financiamiento:</strong> Préstamos, aportes</li>
                    </ul>
                    
                    <div class="help-tip">
                        <i class="fas fa-download"></i>
                        <span>Todos los reportes pueden exportarse a PDF, Excel o CSV 
                        usando los botones en la barra superior.</span>
                    </div>
                </div>
            `
        },

        trazabilidad: {
            title: 'Módulo de Trazabilidad',
            icon: 'fa-search-dollar',
            content: `
                <div class="help-section">
                    <h3>Trazabilidad y Auditoría</h3>
                    <p>El módulo de Trazabilidad permite rastrear el origen y destino de cada 
                    transacción en el sistema, esencial para la auditoría.</p>
                    
                    <h4><i class="fas fa-link"></i> Seguimiento de Documentos</h4>
                    <p>Cada documento está vinculado a su origen:</p>
                    <ul>
                        <li><strong>Orden de Compra → Factura → Asiento</strong></li>
                        <li><strong>Pedido de Venta → Despacho → Factura → Asiento</strong></li>
                        <li><strong>Movimiento de Inventario → Asiento</strong></li>
                    </ul>
                    
                    <h4><i class="fas fa-check-double"></i> Validación de Datos</h4>
                    <p>El sistema valida automáticamente:</p>
                    <ul>
                        <li>Ecuación contable (Activos = Pasivos + Patrimonio)</li>
                        <li>Balance de asientos (Debe = Haber)</li>
                        <li>Integridad de referencias entre documentos</li>
                        <li>Consistencia de saldos de cuentas</li>
                    </ul>
                    
                    <h4><i class="fas fa-history"></i> Log de Auditoría</h4>
                    <p>Registro de todas las acciones del sistema:</p>
                    <ul>
                        <li>Creación de registros</li>
                        <li>Modificaciones y quién las realizó</li>
                        <li>Eliminaciones y motivos</li>
                        <li>Fecha y hora de cada acción</li>
                    </ul>
                    
                    <div class="help-tip">
                        <i class="fas fa-lightbulb"></i>
                        <span>La trazabilidad es fundamental para demostrar la integridad de los 
                        datos ante una auditoría externa.</span>
                    </div>
                </div>
            `
        },

        admin: {
            title: 'Administración del Sistema',
            icon: 'fa-cog',
            content: `
                <div class="help-section">
                    <h3>Administración</h3>
                    <p>Gestiona las empresas, configuración y datos del sistema.</p>
                    
                    <h4><i class="fas fa-building"></i> Gestión de Empresas</h4>
                    <p>Desde aquí puedes:</p>
                    <ul>
                        <li>Crear nuevas empresas virtuales</li>
                        <li>Editar datos de la empresa actual</li>
                        <li>Cambiar entre empresas</li>
                        <li>Eliminar empresas (con precaución)</li>
                    </ul>
                    
                    <h4><i class="fas fa-file-import"></i> Importar/Exportar</h4>
                    <p>Funciones de respaldo y transferencia:</p>
                    <ul>
                        <li><strong>Exportar JSON:</strong> Respaldo completo de la empresa</li>
                        <li><strong>Exportar Excel:</strong> Datos en hojas separadas</li>
                        <li><strong>Importar JSON:</strong> Restaurar respaldo o caso de estudio</li>
                    </ul>
                    
                    <h4><i class="fas fa-database"></i> Datos de Demostración</h4>
                    <p>Carga casos de estudio predefinidos:</p>
                    <ul>
                        <li><strong>Caso Comercial:</strong> Empresa de comercio con inventario</li>
                        <li><strong>Caso Servicios:</strong> Consultora de servicios profesionales</li>
                        <li><strong>Datos Básicos:</strong> Proveedores, clientes y productos de ejemplo</li>
                    </ul>
                    
                    <div class="help-warning">
                        <i class="fas fa-exclamation-triangle"></i>
                        <span>Recuerda hacer respaldos periódicos exportando tu empresa a JSON. 
                        Los datos solo se guardan en el navegador.</span>
                    </div>
                </div>
            `
        },

        diagrama: {
            title: 'Diagrama Contable Interactivo',
            icon: 'fa-project-diagram',
            content: `
                <div class="help-section">
                    <h3>Diagrama Contable</h3>
                    <p>Herramienta visual para entender el flujo de las transacciones contables.</p>
                    
                    <h4><i class="fas fa-exchange-alt"></i> Flujo de Transacción</h4>
                    <p>Visualiza cómo una operación afecta las cuentas:</p>
                    <ul>
                        <li>Documento origen (factura, nota, etc.)</li>
                        <li>Cuentas afectadas al Debe y Haber</li>
                        <li>Impacto en el Balance General</li>
                    </ul>
                    
                    <h4><i class="fas fa-balance-scale"></i> Ecuación Contable</h4>
                    <p>Muestra en tiempo real cómo se cumple:</p>
                    <p style="text-align: center; padding: var(--space-3); background: var(--success-50); 
                        border-radius: var(--radius-md); font-weight: 600; color: var(--success-600);">
                        ACTIVO = PASIVO + PATRIMONIO
                    </p>
                    
                    <h4><i class="fas fa-shopping-cart"></i> Ejemplos Interactivos</h4>
                    <p>Practica con transacciones comunes:</p>
                    <ul>
                        <li><strong>Compra a crédito:</strong> Aumenta inventario y proveedores</li>
                        <li><strong>Venta al contado:</strong> Aumenta caja e ingresos</li>
                        <li><strong>Pago a proveedor:</strong> Disminuye caja y proveedores</li>
                        <li><strong>Cobro a cliente:</strong> Aumenta caja, disminuye clientes</li>
                    </ul>
                    
                    <div class="help-tip">
                        <i class="fas fa-lightbulb"></i>
                        <span>Accede al Diagrama Contable desde el botón "Ver Diagrama Contable" 
                        en el Dashboard principal.</span>
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
            question: '¿Puedo compartir casos con compañeros?',
            answer: 'Sí, exporta tu empresa a JSON y comparte el archivo. Tu compañero puede importarlo en su navegador.'
        },
        {
            question: '¿Se generan asientos automáticos?',
            answer: 'Sí, al registrar facturas de compra, venta, pagos y otros documentos, el sistema genera automáticamente los asientos contables correspondientes.'
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

        // Bind navigation
        document.querySelectorAll('.help-nav li').forEach(li => {
            li.addEventListener('click', () => {
                const moduleId = li.dataset.module;
                const doc = this.documentation[moduleId];
                if (doc) {
                    document.querySelectorAll('.help-nav li').forEach(l => l.classList.remove('active'));
                    li.classList.add('active');
                    document.getElementById('help-content').innerHTML = doc.content;
                }
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
    
    .help-section h3 {
        margin: 0 0 var(--space-3);
        color: var(--text-primary);
        font-size: var(--font-size-lg);
    }
    
    .help-section h4 {
        margin: var(--space-5) 0 var(--space-2);
        color: var(--primary-600);
        font-size: var(--font-size-base);
        display: flex;
        align-items: center;
        gap: var(--space-2);
    }
    
    .help-section p {
        margin: 0 0 var(--space-3);
        line-height: 1.6;
        color: var(--text-secondary);
    }
    
    .help-section ul, .help-section ol {
        margin: var(--space-2) 0;
        padding-left: var(--space-5);
        color: var(--text-secondary);
    }
    
    .help-section li {
        margin-bottom: var(--space-1);
        line-height: 1.5;
    }
    
    .help-table {
        width: 100%;
        border-collapse: collapse;
        margin: var(--space-3) 0;
        font-size: var(--font-size-sm);
    }
    
    .help-table td {
        padding: var(--space-2) var(--space-3);
        border: 1px solid var(--border-light);
    }
    
    .help-table tr:nth-child(even) {
        background: var(--neutral-50);
    }
    
    .help-tip, .help-warning {
        display: flex;
        gap: var(--space-3);
        padding: var(--space-3);
        border-radius: var(--radius-md);
        margin: var(--space-4) 0;
        font-size: var(--font-size-sm);
    }
    
    .help-tip {
        background: var(--info-50);
        color: var(--info-500);
    }
    
    .help-warning {
        background: var(--warning-50);
        color: var(--warning-600);
    }
    
    .help-tip i, .help-warning i {
        font-size: var(--font-size-lg);
        flex-shrink: 0;
    }
    
    /* FAQ Styles */
    .faq-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-2);
    }
    
    .faq-item {
        border: 1px solid var(--border-light);
        border-radius: var(--radius-md);
        overflow: hidden;
    }
    
    .faq-question {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-4);
        cursor: pointer;
        font-weight: 500;
        background: var(--neutral-50);
        transition: all var(--transition-fast);
    }
    
    .faq-question:hover {
        background: var(--neutral-100);
    }
    
    .faq-question i {
        transition: transform var(--transition-fast);
        color: var(--text-tertiary);
    }
    
    .faq-item.open .faq-question i {
        transform: rotate(180deg);
    }
    
    .faq-answer {
        max-height: 0;
        overflow: hidden;
        transition: max-height var(--transition-normal);
    }
    
    .faq-item.open .faq-answer {
        max-height: 200px;
    }
    
    .faq-answer p {
        padding: var(--space-4);
        margin: 0;
        color: var(--text-secondary);
        border-top: 1px solid var(--border-light);
    }
    
    /* Shortcuts Styles */
    .shortcuts-list {
        display: flex;
        flex-direction: column;
        gap: var(--space-5);
    }
    
    .shortcut-group h4 {
        margin: 0 0 var(--space-3);
        font-size: var(--font-size-sm);
        color: var(--text-tertiary);
        text-transform: uppercase;
    }
    
    .shortcut-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-2) 0;
        border-bottom: 1px solid var(--border-light);
    }
    
    .shortcut-item:last-child {
        border-bottom: none;
    }
    
    .shortcut-keys {
        display: flex;
        gap: var(--space-1);
    }
    
    .shortcut-keys kbd {
        background: var(--neutral-100);
        border: 1px solid var(--border-medium);
        border-radius: var(--radius-sm);
        padding: var(--space-1) var(--space-2);
        font-family: monospace;
        font-size: var(--font-size-xs);
        box-shadow: 0 1px 0 var(--neutral-300);
    }
    
    .shortcut-desc {
        color: var(--text-secondary);
        font-size: var(--font-size-sm);
    }
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
