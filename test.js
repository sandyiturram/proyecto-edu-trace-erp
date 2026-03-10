
        // Tab switching
        window.showTab = function (tabId) {
            document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

            const targetContent = document.getElementById('tab-' + tabId);
            if (targetContent) targetContent.classList.add('active');

            // Find the button that corresponds to this tabId and make it active
            document.querySelectorAll('.tab-btn').forEach(btn => {
                const attr = btn.getAttribute('onclick');
                if (attr && attr.includes("('" + tabId + "')")) {
                    btn.classList.add('active');
                }
            });
        };

        // Navigate to module in main system
        window.goToModule = function (module, view) {
            // Build the target URL with hash
            const targetHash = `#${module}/${view}`;

            // Avoid Blocked frame origin errors when using file:// protocol locally
            const isLocal = window.location.protocol === 'file:';

            // Try to use opener window if available and not local
            if (!isLocal && window.opener && !window.opener.closed) {
                try {
                    // Check if App is available in opener
                    if (window.opener.App && typeof window.opener.App.navigate === 'function') {
                        window.opener.App.navigate(module, view);
                        window.opener.focus();
                        return;
                    }
                } catch (e) {
                    console.log('Cannot access opener, redirecting...', e);
                }
            }

            // Get the base path (same directory as this file)
            const basePath = window.location.href.substring(0, window.location.href.lastIndexOf('/') + 1);
            const targetUrl = basePath + 'index.html' + targetHash;

            // Direct fallback: redirect current window to avoid popup blockers and origin issues
            window.location.href = targetUrl;
        };

        // Simulation navigation
        window.currentSimStep = 1;
        window.totalSimSteps = 8;

        // Data for Interactive Scale at each step
        window.eqData = {
            1: { activo: 10000000, pasivo: 0, patrimonio: 10000000, desc: "Capital Inicial" },
            2: { activo: 10000000, pasivo: 0, patrimonio: 10000000, desc: "Análisis" },
            3: { activo: 15950000, pasivo: 5950000, patrimonio: 10000000, desc: "Asiento de Compra" },
            4: { activo: 15950000, pasivo: 5950000, patrimonio: 10000000, desc: "Mayor (Compra)" },
            5: { activo: 15950000, pasivo: 5950000, patrimonio: 10000000, desc: "Análisis Venta" },
            6: { activo: 17912500, pasivo: 6662500, patrimonio: 11250000, desc: "Asiento de Venta" },
            7: { activo: 17912500, pasivo: 6662500, patrimonio: 11250000, desc: "Mayor (Venta)" },
            8: { activo: 17912500, pasivo: 6662500, patrimonio: 11250000, desc: "Estados Financieros" }
        };

        window.formatCurrency = function (amount) {
            return '$' + amount.toLocaleString('es-CL');
        };

        window.updateBalanceScale = function (step) {
            const data = eqData[step];
            if (!data) return;

            const eqDisplay = document.getElementById('eq-display');
            if (eqDisplay) {
                // Add highlight animation
                eqDisplay.classList.remove('active-animation');
                void eqDisplay.offsetWidth; // Trigger reflow
                eqDisplay.classList.add('active-animation');

                setTimeout(() => {
                    eqDisplay.classList.remove('active-animation');
                }, 800);
            }

            // Update scale numerical values
            document.getElementById('scale-activo-val').innerText = formatCurrency(data.activo);
            document.getElementById('scale-pasivo-pat-val').innerText = formatCurrency(data.pasivo + data.patrimonio);

            // Update equation string
            document.getElementById('eq-activo').innerText = formatCurrency(data.activo);
            document.getElementById('eq-pasivo').innerText = formatCurrency(data.pasivo);
            document.getElementById('eq-patrimonio').innerText = formatCurrency(data.patrimonio);

            // Animate scale beam (brief tilt to simulate weight drop, then balance)
            const beam = document.getElementById('scale-beam');
            const panLeft = document.getElementById('pan-left');
            const panRight = document.getElementById('pan-right');

            if (beam && panLeft && panRight) {
                // Remove inline style transitions to allow JS driven animation sequence
                beam.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
                panLeft.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
                panRight.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';

                // Tilt logic: alternate tilt direction slightly based on step odd/even or specific step to simulate loading
                let tiltAngle = (step % 2 === 0) ? 8 : -8;
                if (step === 1 || step === 8) tiltAngle = 0; // Starting and ending steps are perfectly still initially

                // Apply tilt
                beam.style.transform = `rotate(${tiltAngle}deg)`;
                panLeft.style.transform = `rotate(${-tiltAngle}deg)`;
                panRight.style.transform = `rotate(${-tiltAngle}deg)`;

                // Restore to balanced state after brief delay
                setTimeout(() => {
                    beam.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    panLeft.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
                    panRight.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';

                    beam.style.transform = 'rotate(0deg)';
                    panLeft.style.transform = 'rotate(0deg)';
                    panRight.style.transform = 'rotate(0deg)';
                }, 400); // Wait 400ms then swing back to 0
            }
        };

        window.goToSimStep = function (step) {
            window.currentSimStep = step;
            // Hide all steps
            document.querySelectorAll('.sim-step').forEach(s => s.classList.remove('active'));
            // Show current step
            document.getElementById('sim-step-' + step).classList.add('active');
            // Update progress
            document.querySelectorAll('.progress-step').forEach((p, i) => {
                p.classList.remove('active', 'completed');
                if (i + 1 < step) {
                    p.classList.add('completed');
                } else if (i + 1 === step) {
                    p.classList.add('active');
                }
            });

            // Update the interactive balance scale
            updateBalanceScale(step);
        }

        window.nextSimStep = function () {
            if (window.currentSimStep < window.totalSimSteps) {
                window.goToSimStep(window.currentSimStep + 1);
            }
        };

        window.prevSimStep = function () {
            if (window.currentSimStep > 1) {
                window.goToSimStep(window.currentSimStep - 1);
            }
        };

        // Modal content
        window.modalContent = {
            entrada: {
                title: '<i class="fas fa-sign-in-alt"></i> Etapa de Entrada',
                content: `
                    < div class="content-section" >
                        <h4>¿Qué es la Etapa de Entrada?</h4>
                        <p>Es la primera fase del proceso contable donde se recopilan y analizan los <strong>documentos mercantiles</strong> que respaldan las transacciones económicas.</p>
                        <ul>
                            <li><i class="fas fa-check"></i> <strong>Recopilar documentos:</strong> Facturas, boletas, notas de crédito, recibos, contratos de arriendo y contratos de servicios</li>
                            <li><i class="fas fa-check"></i> <strong>Verificar autenticidad:</strong> Comprobar que sean legítimos y legales</li>
                            <li><i class="fas fa-check"></i> <strong>Identificar el hecho:</strong> Determinar el tipo de transacción</li>
                            <li><i class="fas fa-check"></i> <strong>Clasificar cuentas:</strong> Identificar qué cuentas se afectarán</li>
                        </ul>
                    </div >
                    <button class="link-btn" onclick="goToModule('compras', 'facturas-proveedor')">
                        <i class="fas fa-external-link-alt"></i> Ver Facturas de Proveedor
                    </button>
                    <button class="link-btn success" onclick="goToModule('ventas', 'facturas-cliente')">
                        <i class="fas fa-external-link-alt"></i> Ver Facturas de Cliente
                    </button>
                `
            },
            documento: {
                title: '<i class="fas fa-file-invoice"></i> Documento Mercantil',
                content: `
                    < div class="content-section" >
                        <h4>¿Qué es un Documento Mercantil?</h4>
                        <p>Es cualquier documento escrito que sirve como <strong>comprobante o respaldo</strong> de una transacción comercial.</p>
                        <ul>
                            <li><i class="fas fa-file-invoice-dollar"></i> <strong>Factura:</strong> Detalla venta o compra con IVA</li>
                            <li><i class="fas fa-receipt"></i> <strong>Boleta:</strong> Comprobante para consumidor final</li>
                            <li><i class="fas fa-undo"></i> <strong>Nota de Crédito:</strong> Anula o reduce una factura</li>
                            <li><i class="fas fa-plus-circle"></i> <strong>Nota de Débito:</strong> Aumenta el monto de una factura</li>
                            <li><i class="fas fa-truck"></i> <strong>Guía de Despacho:</strong> Acredita traslado de mercaderías</li>
                            <li><i class="fas fa-file-contract"></i> <strong>Contrato de Arriendo:</strong> Acuerdo de uso de un bien físico</li>
                            <li><i class="fas fa-file-signature"></i> <strong>Contrato de Servicios:</strong> Acuerdo para la prestación de un servicio</li>
                        </ul>
                    </div >
                    `
            },
            elementos: {
                title: '<i class="fas fa-tags"></i> Elementos Contables',
                content: `
                    < div class="account-box" >
                        <h5>Los 5 Elementos Contables</h5>
                        <div class="account-grid">
                            <div class="account-item"><div class="label">ACTIVO</div><div class="value">Lo que TIENE</div></div>
                            <div class="account-item"><div class="label">PASIVO</div><div class="value">Lo que DEBE</div></div>
                            <div class="account-item"><div class="label">PATRIMONIO</div><div class="value">De los dueños</div></div>
                            <div class="account-item"><div class="label">INGRESO</div><div class="value">Lo que GANA</div></div>
                            <div class="account-item"><div class="label">GASTO</div><div class="value">Lo que GASTA</div></div>
                        </div>
                    </div >
                    <div class="content-section">
                        <h4>Ecuación Contable</h4>
                        <p style="font-size: 1.25rem; text-align: center; padding: 1rem; background: var(--primary-light); border-radius: 0.5rem;">
                            <strong>ACTIVO = PASIVO + PATRIMONIO</strong>
                        </p>
                    </div>
                    <button class="link-btn" onclick="goToModule('contabilidad', 'plan-cuentas')">
                        <i class="fas fa-external-link-alt"></i> Ver Plan de Cuentas
                    </button>
                `
            },
            registro: {
                title: '<i class="fas fa-book"></i> Reglas de Registro',
                content: `
                    < div class="content-section" >
                        <h4>Débito vs Crédito</h4>
                        <ul>
                            <li><i class="fas fa-arrow-up" style="color: #dc2626;"></i> <strong>ACTIVO aumenta:</strong> Se DEBITA</li>
                            <li><i class="fas fa-arrow-down" style="color: #16a34a;"></i> <strong>ACTIVO disminuye:</strong> Se ACREDITA</li>
                            <li><i class="fas fa-arrow-up" style="color: #16a34a;"></i> <strong>PASIVO aumenta:</strong> Se ACREDITA</li>
                            <li><i class="fas fa-arrow-down" style="color: #dc2626;"></i> <strong>PASIVO disminuye:</strong> Se DEBITA</li>
                            <li><i class="fas fa-arrow-up" style="color: #16a34a;"></i> <strong>INGRESO aumenta:</strong> Se ACREDITA</li>
                            <li><i class="fas fa-arrow-up" style="color: #dc2626;"></i> <strong>GASTO aumenta:</strong> Se DEBITA</li>
                        </ul>
                    </div >
                    <div class="t-account">
                        <div class="t-account-header">Cuenta T - Ejemplo: CAJA</div>
                        <div class="t-account-body">
                            <div class="t-account-side debit"><h6>DEBE</h6><div class="amount">+ Aumenta</div></div>
                            <div class="t-account-side credit"><h6>HABER</h6><div class="amount">- Disminuye</div></div>
                        </div>
                    </div>
                `
            },
            proceso: {
                title: '<i class="fas fa-cogs"></i> Etapa de Proceso',
                content: `
                    < div class="content-section" >
                        <h4>¿Qué es el Registro Contable?</h4>
                        <p>Es la fase donde las transacciones se <strong>registran formalmente</strong> en los libros contables, siguiendo la <strong>partida doble</strong>.</p>
                    </div >
                    <div class="content-section">
                        <h4>Libros Contables</h4>
                        <ul>
                            <li><i class="fas fa-book"></i> <strong>Libro Diario:</strong> Registro cronológico de todas las transacciones</li>
                            <li><i class="fas fa-columns"></i> <strong>Libro Mayor:</strong> Agrupa movimientos por cuenta</li>
                            <li><i class="fas fa-list-check"></i> <strong>Balance de Comprobación:</strong> Actúa como el nexo contable comprobatorio entre los módulos y la posterior preparación de los Estados Financieros</li>
                        </ul>
                    </div>
                    <button class="link-btn" onclick="goToModule('contabilidad', 'asientos')">
                        <i class="fas fa-external-link-alt"></i> Ver Libro Diario
                    </button>
                    <button class="link-btn success" onclick="goToModule('contabilidad', 'libro-mayor')">
                        <i class="fas fa-external-link-alt"></i> Ver Libro Mayor
                    </button>
                    <button class="link-btn" style="background-color: var(--purple);" onclick="goToModule('reportes', 'balance-comprobacion')">
                        <i class="fas fa-external-link-alt"></i> Ver Balance de Comprobación
                    </button>
                `
            },
            salida: {
                title: '<i class="fas fa-file-export"></i> Etapa de Salida',
                content: `
                    < div class="content-section" >
                        <h4>Estados Financieros</h4>
                        <ul>
                            <li><i class="fas fa-chart-pie"></i> <strong>Estado de Situación (Balance General):</strong> Activos, Pasivos y Patrimonio</li>
                            <li><i class="fas fa-chart-line"></i> <strong>Estado de Resultados:</strong> Ingresos y Gastos</li>
                        </ul>
                    </div >
                    <button class="link-btn" onclick="goToModule('reportes', 'balance-general')">
                        <i class="fas fa-external-link-alt"></i> Ver Balance General
                    </button>
                    <button class="link-btn success" onclick="goToModule('reportes', 'estado-resultados')">
                        <i class="fas fa-external-link-alt"></i> Ver Estado de Resultados
                    </button>
                `
            },
            balance: {
                title: '<i class="fas fa-balance-scale"></i> Balance de Comprobación',
                content: `
                    < div class="content-section" >
                        <h4>¿Qué es?</h4>
                        <p>Lista TODAS las cuentas con sus saldos deudores y acreedores. Objetivo: actuar como nexo contable y revisar que la suma de débitos sea idéntica a créditos previo a armar Estados Financieros.</p>
                    </div >
                    <div class="t-account">
                        <div class="t-account-header">Ejemplo: Cuenta CAJA</div>
                        <div class="t-account-body">
                            <div class="t-account-side debit"><h6>DEBE</h6><div class="amount">$5.000.000</div></div>
                            <div class="t-account-side credit"><h6>HABER</h6><div class="amount">$2.000.000</div></div>
                        </div>
                    </div>
                    <p style="text-align: center; font-size: 1.1rem;"><strong>Saldo Deudor: $3.000.000</strong></p>
                    <button class="link-btn" onclick="goToModule('reportes', 'balance-comprobacion')">
                        <i class="fas fa-external-link-alt"></i> Ver Balance de Comprobación
                    </button>
                `
            },
            situacion: {
                title: '<i class="fas fa-chart-pie"></i> Estado de Situación Financiera',
                content: `
                    < div class="content-section" >
                        <h4>¿Qué es?</h4>
                        <p>También llamado <strong>Balance General</strong>. Una "fotografía" de la empresa: qué tiene (Activos), qué debe (Pasivos) y cuánto pertenece a los dueños (Patrimonio).</p>
                    </div >
                    <div class="account-box">
                        <h5>Estructura</h5>
                        <div class="account-grid">
                            <div class="account-item"><div class="label">ACTIVOS</div><div class="value">$18.000.000</div></div>
                            <div class="account-item"><div class="label">PASIVOS</div><div class="value">$8.000.000</div></div>
                            <div class="account-item"><div class="label">PATRIMONIO</div><div class="value">$10.000.000</div></div>
                        </div>
                        <p style="text-align: center; margin-top: 0.75rem; font-size: 0.9rem;">
                            <strong>Activo ($18M) = Pasivo ($8M) + Patrimonio ($10M) ✓</strong>
                        </p>
                    </div>
                    <button class="link-btn" onclick="goToModule('reportes', 'balance-general')">
                        <i class="fas fa-external-link-alt"></i> Ver Balance General
                    </button>
                `
            },
            resultados: {
                title: '<i class="fas fa-chart-line"></i> Estado de Resultados',
                content: `
                    < div class="content-section" >
                        <h4>¿Qué es?</h4>
                        <p>Muestra el <strong>rendimiento económico</strong> de la empresa durante un período. Indica si ganó o perdió dinero.</p>
                    </div >
                    <div class="flow-example">
                        <h5><i class="fas fa-calculator"></i> Estructura del Estado de Resultados</h5>
                        <div class="flow-steps">
                            <div class="flow-step"><div class="step-number">+</div><div class="step-content">Ingresos por Ventas: <strong>$15.000.000</strong></div></div>
                            <div class="flow-step"><div class="step-number">-</div><div class="step-content">Costo de Ventas: <strong>($9.000.000)</strong></div></div>
                            <div class="flow-step" style="background: #f3f4f630; margin: 0.5rem 0; border-left: 4px solid #10b981;">
                                <div class="step-number">=</div>
                                <div class="step-content" style="color: #10b981; font-weight: 700;">Resultado Operacional (Margen Bruto): $6.000.000</div>
                            </div>
                            <div class="flow-step"><div class="step-number">+</div><div class="step-content">Otros Ingresos: <strong>$500.000</strong></div></div>
                            <div class="flow-step"><div class="step-number">-</div><div class="step-content">Gastos de Administración: <strong>($2.000.000)</strong></div></div>
                            <div class="flow-step"><div class="step-number">-</div><div class="step-content">Gastos de Ventas: <strong>($800.000)</strong></div></div>
                            <div class="flow-step"><div class="step-number">-</div><div class="step-content">Gastos Financieros: <strong>($200.000)</strong></div></div>
                            <div class="flow-step" style="background: #10b98120; margin-top: 0.5rem; border-left: 4px solid #16a34a; padding: 1rem;">
                                <div class="step-number" style="background: #16a34a;">=</div>
                                <div class="step-content" style="color: #16a34a; font-weight: 700; font-size: 1.1rem;">Resultado Neto del Ejercicio (Ganancia): $3.500.000</div>
                            </div>
                        </div>
                        <p style="margin-top: 1rem; padding: 0.75rem; background: #f0fdf4; border-left: 4px solid #16a34a; border-radius: 0.5rem; font-size: 0.9rem;">
                            <i class="fas fa-info-circle" style="color: #16a34a;"></i> <strong>Nota:</strong> Si el resultado es negativo, se denomina <strong>Pérdida del Ejercicio</strong>.
                        </p>
                    </div>
                    <button class="link-btn success" onclick="goToModule('reportes', 'estado-resultados')">
                        <i class="fas fa-external-link-alt"></i> Ver Estado de Resultados
                    </button>
                `
            },
            ratios: {
                title: '<i class="fas fa-chart-bar"></i> Ratios Financieros',
                content: `
                    < div class="content-section" >
                        <h4>¿Qué son los Ratios Financieros?</h4>
                        <p>Son <strong>indicadores numéricos</strong> calculados a partir de los estados financieros que permiten evaluar el desempeño, la salud financiera y la eficiencia de una empresa.</p>
                    </div >
                    <div class="flow-example">
                        <h5><i class="fas fa-tint"></i> Ratios de Liquidez</h5>
                        <div class="flow-steps">
                            <div class="flow-step"><div class="step-number">1</div><div class="step-content"><strong>Razón Corriente</strong> = Activo Corriente / Pasivo Corriente</div></div>
                            <div class="flow-step"><div class="step-number">2</div><div class="step-content"><strong>Prueba Ácida</strong> = (Act. Corr. - Inventario) / Pasivo Corriente</div></div>
                        </div>
                    </div>
                    <div class="flow-example">
                        <h5><i class="fas fa-chart-line"></i> Ratios de Rentabilidad</h5>
                        <div class="flow-steps">
                            <div class="flow-step"><div class="step-number">1</div><div class="step-content"><strong>ROA</strong> = Resultado del Ejercicio / Total Activos × 100</div></div>
                            <div class="flow-step"><div class="step-number">2</div><div class="step-content"><strong>ROE</strong> = Resultado del Ejercicio / Patrimonio × 100</div></div>
                            <div class="flow-step"><div class="step-number">3</div><div class="step-content"><strong>Margen Neto</strong> = Resultado del Ejercicio / Ventas × 100</div></div>
                        </div>
                    </div>
                    <div class="flow-example">
                        <h5><i class="fas fa-shield-alt"></i> Ratios de Solvencia</h5>
                        <div class="flow-steps">
                            <div class="flow-step"><div class="step-number">1</div><div class="step-content"><strong>Endeudamiento</strong> = Total Pasivos / Total Activos × 100</div></div>
                            <div class="flow-step"><div class="step-number">2</div><div class="step-content"><strong>Autonomía</strong> = Patrimonio / Total Activos × 100</div></div>
                        </div>
                    </div>
                    <button class="link-btn" style="background: #f59e0b;" onclick="goToModule('reportes', 'ratios-financieros')">
                        <i class="fas fa-external-link-alt"></i> Ver Ratios Financieros en el Sistema
                    </button>
                `
            },
            sistemas: {
                title: '<i class="fas fa-book"></i> Guía: Sistemas de Contabilización',
                content: `
                    < div class="content-section" >
                        <h4>¿Qué son?</h4>
                        <p>EDU-TRACE ERP soporta <strong>dos sistemas de contabilización</strong> que determinan cómo se registran las transacciones contables:</p>
                    </div >
                    <div class="flow-example">
                        <h5><i class="fas fa-book"></i> 1. Jornalizador (Diario Único)</h5>
                        <div class="flow-steps">
                            <div class="flow-step"><div class="step-number">✓</div><div class="step-content">Todas las transacciones se registran <strong>directamente</strong> en el Libro Diario</div></div>
                            <div class="flow-step"><div class="step-number">✓</div><div class="step-content">Ideal para <strong>microempresas y estudiantes</strong></div></div>
                            <div class="flow-step"><div class="step-number">✓</div><div class="step-content">Simple, directo, visibilidad inmediata</div></div>
                        </div>
                    </div>
                    <div class="flow-example">
                        <h5><i class="fas fa-books"></i> 2. Centralizador (Libros Auxiliares)</h5>
                        <div class="flow-steps">
                            <div class="flow-step"><div class="step-number">1</div><div class="step-content">Las transacciones se registran primero en <strong>libros auxiliares</strong> por módulo (Ventas, Compras, etc.)</div></div>
                            <div class="flow-step"><div class="step-number">2</div><div class="step-content">Al final del mes, se <strong>centralizan</strong> (consolidan) en el Libro Diario</div></div>
                            <div class="flow-step"><div class="step-number">✓</div><div class="step-content">Ideal para <strong>PYMEs y grandes empresas</strong></div></div>
                            <div class="flow-step"><div class="step-number">✓</div><div class="step-content">Reduce volumen del Libro Diario, mejor organización</div></div>
                        </div>
                    </div>
                    <div style="padding: 1rem; background: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 0.5rem; margin-top: 1rem;">
                        <p style="margin: 0; font-size: 0.95rem;">
                            <i class="fas fa-cog" style="color: #3b82f6;"></i> <strong>Configuración:</strong>
                            El sistema se elige en <strong>Administración → Configuración → Sistema de Contabilización</strong>. 
                            Por defecto: <strong>Jornalizador</strong>.
                        </p>
                    </div>
                    <button class="link-btn" style="background: #3b82f6;" onclick="goToModule('admin', 'configuracion')">
                        <i class="fas fa-cog"></i> Ir a Configuración
                    </button>
                `
            }
        };

        window.openModal = function (topic) {
            const content = window.modalContent[topic];
            if (!content) return;
            document.getElementById('modal-title').innerHTML = content.title;
            document.getElementById('modal-body').innerHTML = content.content;
            document.getElementById('modal-overlay').classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        window.closeModal = function (event) {
            if (event && event.target !== event.currentTarget) return;
            document.getElementById('modal-overlay').classList.remove('active');
            document.body.style.overflow = '';
        };

        document.addEventListener('keydown', (e) => { if (e.key === 'Escape') window.closeModal(); });
    