/**
 * EduERP - Pedagogical Traceability Module
 * Módulo de Trazabilidad Pedagógica con visualización para enseñanza
 */

const TrazabilidadModule = {
    currentView: 'overview',

    /**
     * Renderiza el módulo
     */
    async render(view = 'overview') {
        this.currentView = view;

        const company = CompanyService.getCurrent();
        if (!company) {
            return this.renderNoCompany();
        }

        switch (view) {
            case 'overview':
                return await this.renderOverview();
            case 'trace-document':
                return await this.renderTraceDocument();
            case 'flow-diagrams':
                return await this.renderFlowDiagrams();
            case 'validations':
                return await this.renderValidations();
            case 'progress':
                return await this.renderProgress();
            default:
                return await this.renderOverview();
        }
    },

    /**
     * Vista sin empresa
     */
    renderNoCompany() {
        return `
            <div class="empty-state">
                <i class="fas fa-route"></i>
                <h3>Trazabilidad Pedagógica</h3>
                <p>Selecciona una empresa para acceder al módulo de trazabilidad.</p>
            </div>
        `;
    },

    /**
     * Vista principal - Overview
     */
    async renderOverview() {
        const progress = await ValidationService.getTransactionProgress();
        const integrity = await TraceabilityService.verifyDataIntegrity();
        const todayTx = await TraceabilityService.getTodayTransactions();

        return `
            <div class="trazabilidad-module">
                <!-- Header del módulo -->
                <div class="module-header glass-card">
                    <div class="header-content">
                        <div class="header-icon">
                            <i class="fas fa-route"></i>
                        </div>
                        <div class="header-text">
                            <h1>Trazabilidad Pedagógica</h1>
                            <p>Sigue cada transacción desde su origen hasta los estados financieros</p>
                        </div>
                    </div>
                    <div class="header-actions">
                        <button class="btn btn-primary" onclick="TrazabilidadModule.showQuickTrace()">
                            <i class="fas fa-search"></i> Trazar Documento
                        </button>
                    </div>
                </div>

                <!-- Grid principal -->
                <div class="trazabilidad-grid">
                    <!-- Progreso del ejercicio -->
                    <div class="card span-2 progress-card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-tasks"></i>
                                Progreso del Ejercicio
                            </div>
                            <span class="badge ${progress.percentage === 100 ? 'badge-success' : 'badge-warning'}">
                                ${progress.percentage}% Completado
                            </span>
                        </div>
                        <div class="card-body">
                            <div class="progress-overview">
                                <div class="progress-ring" style="--progress: ${progress.percentage}">
                                    <div class="progress-ring-inner">
                                        <span class="progress-value">${progress.completed}/${progress.total}</span>
                                        <span class="progress-label">Pasos</span>
                                    </div>
                                </div>
                                <div class="progress-steps">
                                    ${progress.transactions.map((tx, idx) => `
                                        <div class="progress-step ${tx.completed ? 'completed' : ''}" 
                                             onclick="App.navigate('${tx.module}', '${tx.view}')">
                                            <div class="step-indicator">
                                                ${tx.completed ? '<i class="fas fa-check"></i>' : idx + 1}
                                            </div>
                                            <div class="step-content">
                                                <div class="step-name">${tx.name}</div>
                                                <div class="step-desc">${tx.description}</div>
                                            </div>
                                            <i class="fas fa-chevron-right step-arrow"></i>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Integridad de datos -->
                    <div class="card span-2 integrity-card">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-shield-alt"></i>
                                Integridad de Datos
                            </div>
                            <span class="badge ${integrity.isHealthy ? 'badge-success' : 'badge-error'}">
                                ${integrity.isHealthy ? 'Saludable' : `${integrity.summary.errors} Errores`}
                            </span>
                        </div>
                        <div class="card-body">
                            ${integrity.issues.length === 0 ? `
                                <div class="integrity-healthy">
                                    <i class="fas fa-check-circle"></i>
                                    <p>Todos los datos están sincronizados correctamente entre módulos</p>
                                </div>
                            ` : `
                                <div class="integrity-issues">
                                    ${integrity.issues.slice(0, 5).map(issue => `
                                        <div class="issue-item ${issue.severity}">
                                            <i class="fas fa-${issue.severity === 'error' ? 'times-circle' : 'exclamation-triangle'}"></i>
                                            <span>${issue.message}</span>
                                        </div>
                                    `).join('')}
                                    ${integrity.issues.length > 5 ? `
                                        <button class="btn btn-link" onclick="TrazabilidadModule.showAllIssues()">
                                            Ver todos (${integrity.issues.length})
                                        </button>
                                    ` : ''}
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Transacciones recientes -->
                    <div class="card span-4">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-history"></i>
                                Transacciones de Hoy
                            </div>
                            <button class="btn btn-ghost btn-sm" onclick="TrazabilidadModule.refreshTransactions()">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                        <div class="card-body">
                            ${todayTx.length === 0 ? `
                                <div class="empty-transactions">
                                    <i class="fas fa-inbox"></i>
                                    <p>No hay transacciones registradas hoy</p>
                                    <button class="btn btn-outline btn-sm" onclick="App.showQuickEntry()">
                                        <i class="fas fa-plus"></i> Crear Primera Transacción
                                    </button>
                                </div>
                            ` : `
                                <div class="transactions-list">
                                    ${todayTx.slice(0, 10).map(tx => `
                                        <div class="transaction-item" onclick="TrazabilidadModule.traceDocument('${tx.type}', '${tx.document.id}')">
                                            <div class="tx-icon" style="background: ${tx.config.color}20; color: ${tx.config.color}">
                                                <i class="fas ${tx.config.icon}"></i>
                                            </div>
                                            <div class="tx-content">
                                                <div class="tx-title">${tx.config.name}</div>
                                                <div class="tx-number">${tx.document.number || '#' + tx.document.id}</div>
                                            </div>
                                            <div class="tx-meta">
                                                <span class="tx-module">${tx.config.module}</span>
                                                <button class="btn btn-ghost btn-icon btn-xs" title="Trazar">
                                                    <i class="fas fa-route"></i>
                                                </button>
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            `}
                        </div>
                    </div>

                    <!-- Flujos de negocio estándar -->
                    <div class="card span-4">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-project-diagram"></i>
                                Flujos de Negocio Estándar
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="business-flows">
                                ${Object.entries(TraceabilityService.standardFlows).map(([key, flow]) => `
                                    <div class="flow-card" onclick="TrazabilidadModule.showFlowDiagram('${key}')">
                                        <div class="flow-header">
                                            <h4>${flow.name}</h4>
                                            <span class="badge">${flow.steps.length} pasos</span>
                                        </div>
                                        <p class="flow-description">${flow.description}</p>
                                        <div class="flow-preview">
                                            ${flow.steps.slice(0, 4).map((step, idx) => `
                                                <div class="flow-step-mini">
                                                    <div class="step-dot" style="background: ${TraceabilityService.documentTypes[step.type]?.color || '#666'}"></div>
                                                    ${idx < 3 ? '<div class="step-line"></div>' : ''}
                                                </div>
                                            `).join('')}
                                            ${flow.steps.length > 4 ? `<span class="more-steps">+${flow.steps.length - 4}</span>` : ''}
                                        </div>
                                        <div class="flow-footer">
                                            <button class="btn btn-outline btn-sm">
                                                <i class="fas fa-eye"></i> Ver Diagrama
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Vista de trazado de documento
     */
    async renderTraceDocument() {
        return `
            <div class="trace-document-view">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-search"></i>
                            Trazar Documento
                        </div>
                    </div>
                    <div class="card-body">
                        <form id="trace-form" class="trace-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Tipo de Documento</label>
                                    <select id="trace-doc-type" class="form-control" required>
                                        <option value="">Seleccionar...</option>
                                        ${Object.entries(TraceabilityService.documentTypes).map(([key, dt]) => `
                                            <option value="${key}">${dt.name} (${dt.module})</option>
                                        `).join('')}
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Número o ID del Documento</label>
                                    <input type="text" id="trace-doc-id" class="form-control" 
                                           placeholder="Ej: FAC-2024-0001" required>
                                </div>
                                <div class="form-group form-actions">
                                    <button type="submit" class="btn btn-primary">
                                        <i class="fas fa-search"></i> Trazar
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Área de resultados -->
                <div id="trace-results" class="trace-results"></div>
            </div>
        `;
    },

    /**
     * Vista de diagramas de flujo
     */
    async renderFlowDiagrams() {
        return `
            <div class="flow-diagrams-view">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-project-diagram"></i>
                            Diagramas de Flujo ERP
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="flow-selector">
                            ${Object.entries(TraceabilityService.standardFlows).map(([key, flow]) => `
                                <button class="flow-tab" data-flow="${key}">
                                    ${flow.name}
                                </button>
                            `).join('')}
                        </div>
                        <div id="flow-diagram-container" class="flow-diagram-container">
                            <!-- El diagrama se cargará aquí -->
                            <div class="flow-placeholder">
                                <i class="fas fa-hand-pointer"></i>
                                <p>Selecciona un flujo para ver su diagrama</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Vista de validaciones
     */
    async renderValidations() {
        const company = CompanyService.getCurrent();
        const entries = await AccountingService.getJournalEntries({ status: 'draft' });

        return `
            <div class="validations-view">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-check-double"></i>
                            Centro de Validaciones
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="TrazabilidadModule.runAllValidations()">
                            <i class="fas fa-play"></i> Ejecutar Validaciones
                        </button>
                    </div>
                    <div class="card-body">
                        <!-- Panel de reglas -->
                        <div class="validation-rules">
                            <h4>Reglas de Validación Activas</h4>
                            <div class="rules-grid">
                                <div class="rule-card">
                                    <div class="rule-icon success">
                                        <i class="fas fa-balance-scale"></i>
                                    </div>
                                    <div class="rule-content">
                                        <h5>Debe = Haber</h5>
                                        <p>Verifica que todos los asientos estén cuadrados</p>
                                    </div>
                                    <span class="rule-status active">Activa</span>
                                </div>
                                <div class="rule-card">
                                    <div class="rule-icon success">
                                        <i class="fas fa-list-alt"></i>
                                    </div>
                                    <div class="rule-content">
                                        <h5>Cuenta en Plan</h5>
                                        <p>Verifica que las cuentas existan en el plan de cuentas</p>
                                    </div>
                                    <span class="rule-status active">Activa</span>
                                </div>
                                <div class="rule-card">
                                    <div class="rule-icon success">
                                        <i class="fas fa-arrows-alt-h"></i>
                                    </div>
                                    <div class="rule-content">
                                        <h5>Naturaleza Correcta</h5>
                                        <p>Verifica movimientos según naturaleza deudora/acreedora</p>
                                    </div>
                                    <span class="rule-status active">Activa</span>
                                </div>
                                <div class="rule-card">
                                    <div class="rule-icon success">
                                        <i class="fas fa-id-card"></i>
                                    </div>
                                    <div class="rule-content">
                                        <h5>RUT Válido</h5>
                                        <p>Valida formato y dígito verificador de RUT</p>
                                    </div>
                                    <span class="rule-status active">Activa</span>
                                </div>
                                <div class="rule-card">
                                    <div class="rule-icon success">
                                        <i class="fas fa-calendar-check"></i>
                                    </div>
                                    <div class="rule-content">
                                        <h5>Fechas Coherentes</h5>
                                        <p>Verifica fechas no futuras y en período abierto</p>
                                    </div>
                                    <span class="rule-status active">Activa</span>
                                </div>
                                <div class="rule-card">
                                    <div class="rule-icon success">
                                        <i class="fas fa-sort-numeric-down"></i>
                                    </div>
                                    <div class="rule-content">
                                        <h5>Secuencia Lógica</h5>
                                        <p>Verifica orden de operaciones (venta antes de cobro)</p>
                                    </div>
                                    <span class="rule-status active">Activa</span>
                                </div>
                            </div>
                        </div>

                        <!-- Resultados de validación -->
                        <div id="validation-results" class="validation-results">
                            <div class="results-placeholder">
                                <i class="fas fa-clipboard-check"></i>
                                <p>Ejecuta las validaciones para ver los resultados</p>
                            </div>
                        </div>

                        <!-- Asientos pendientes de validar -->
                        ${entries.length > 0 ? `
                            <div class="pending-entries">
                                <h4>Asientos en Borrador (${entries.length})</h4>
                                <div class="entries-list">
                                    ${entries.slice(0, 5).map(entry => `
                                        <div class="entry-item" onclick="TrazabilidadModule.validateEntry('${entry.id}')">
                                            <span class="entry-number">${entry.number}</span>
                                            <span class="entry-date">${entry.date}</span>
                                            <span class="entry-desc">${entry.description}</span>
                                            <button class="btn btn-ghost btn-xs">
                                                <i class="fas fa-check"></i> Validar
                                            </button>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Vista de progreso pedagógico
     */
    async renderProgress() {
        const progress = await ValidationService.getTransactionProgress();

        return `
            <div class="progress-view">
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">
                            <i class="fas fa-graduation-cap"></i>
                            Progreso del Ejercicio Pedagógico
                        </div>
                    </div>
                    <div class="card-body">
                        <!-- Progreso visual -->
                        <div class="progress-hero">
                            <div class="progress-circle-large" style="--progress: ${progress.percentage}">
                                <div class="circle-content">
                                    <span class="percentage">${progress.percentage}%</span>
                                    <span class="label">Completado</span>
                                </div>
                            </div>
                            <div class="progress-stats">
                                <div class="stat">
                                    <span class="stat-value">${progress.completed}</span>
                                    <span class="stat-label">Completados</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-value">${progress.total - progress.completed}</span>
                                    <span class="stat-label">Pendientes</span>
                                </div>
                                <div class="stat">
                                    <span class="stat-value">${progress.total}</span>
                                    <span class="stat-label">Total</span>
                                </div>
                            </div>
                        </div>

                        <!-- Timeline de pasos -->
                        <div class="progress-timeline">
                            ${progress.transactions.map((tx, idx) => `
                                <div class="timeline-item ${tx.completed ? 'completed' : (idx === progress.completed ? 'current' : 'pending')}">
                                    <div class="timeline-marker">
                                        ${tx.completed
                ? '<i class="fas fa-check"></i>'
                : (idx === progress.completed ? '<i class="fas fa-play"></i>' : idx + 1)}
                                    </div>
                                    <div class="timeline-connector"></div>
                                    <div class="timeline-content">
                                        <h4>${tx.name}</h4>
                                        <p>${tx.description}</p>
                                        ${!tx.completed ? `
                                            <button class="btn btn-sm ${idx === progress.completed ? 'btn-primary' : 'btn-outline'}"
                                                    onclick="App.navigate('${tx.module}', '${tx.view}')">
                                                ${idx === progress.completed ? 'Comenzar' : 'Ir al módulo'}
                                            </button>
                                        ` : `
                                            <span class="completed-badge">
                                                <i class="fas fa-check-circle"></i> Completado
                                            </span>
                                        `}
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        ${progress.completed === progress.total ? `
                            <div class="completion-message">
                                <div class="completion-icon">
                                    <i class="fas fa-trophy"></i>
                                </div>
                                <h3>¡Felicitaciones!</h3>
                                <p>Has completado todos los pasos del ejercicio pedagógico. 
                                   Ahora puedes revisar el Balance General para ver el resultado de todas las operaciones.</p>
                                <button class="btn btn-primary" onclick="App.navigate('reportes', 'balance-general')">
                                    <i class="fas fa-chart-bar"></i> Ver Estados Financieros
                                </button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Inicializa el módulo
     */
    init(view) {
        this.bindEvents();
    },

    /**
     * Vincula eventos
     */
    bindEvents() {
        // Form de trazado
        document.getElementById('trace-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const type = document.getElementById('trace-doc-type').value;
            const id = document.getElementById('trace-doc-id').value;
            await this.executeTrace(type, id);
        });

        // Tabs de flujo
        document.querySelectorAll('.flow-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.flow-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                this.showFlowDiagram(tab.dataset.flow);
            });
        });
    },

    /**
     * Muestra modal de trazado rápido
     */
    async showQuickTrace() {
        const company = CompanyService.getCurrent();
        if (!company) {
            Toast.warning('Selecciona una empresa primero');
            return;
        }

        // Obtener documentos recientes
        const invoices = await DB.getByIndex('customerInvoices', 'companyId', company.id);
        const orders = await DB.getByIndex('salesOrders', 'companyId', company.id);
        const entries = await DB.getByIndex('journalEntries', 'companyId', company.id);

        const recentDocs = [
            ...invoices.slice(-5).map(d => ({ type: 'customerInvoice', doc: d })),
            ...orders.slice(-5).map(d => ({ type: 'salesOrder', doc: d })),
            ...entries.slice(-5).map(d => ({ type: 'journalEntry', doc: d }))
        ].sort((a, b) => new Date(b.doc.date) - new Date(a.doc.date)).slice(0, 10);

        await Modal.custom({
            title: 'Trazar Documento',
            size: 'lg',
            content: `
                <div class="quick-trace-modal">
                    <div class="trace-search">
                        <div class="form-group">
                            <label>Tipo de Documento</label>
                            <select id="quick-trace-type" class="form-control">
                                ${Object.entries(TraceabilityService.documentTypes).map(([key, dt]) => `
                                    <option value="${key}">${dt.name}</option>
                                `).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label>ID del Documento</label>
                            <input type="text" id="quick-trace-id" class="form-control" 
                                   placeholder="ID numérico del documento">
                        </div>
                    </div>
                    
                    ${recentDocs.length > 0 ? `
                        <div class="recent-docs">
                            <h4>Documentos Recientes</h4>
                            <div class="docs-list">
                                ${recentDocs.map(item => {
                const config = TraceabilityService.documentTypes[item.type];
                return `
                                        <div class="doc-item" onclick="TrazabilidadModule.traceFromModal('${item.type}', '${item.doc.id}')">
                                            <div class="doc-icon" style="color: ${config.color}">
                                                <i class="fas ${config.icon}"></i>
                                            </div>
                                            <div class="doc-info">
                                                <span class="doc-name">${config.name}</span>
                                                <span class="doc-number">${item.doc.number || '#' + item.doc.id}</span>
                                            </div>
                                            <span class="doc-date">${item.doc.date || ''}</span>
                                        </div>
                                    `;
            }).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            `,
            buttons: [
                { text: 'Cancelar', class: 'btn-outline', action: 'close' },
                {
                    text: 'Trazar',
                    class: 'btn-primary',
                    action: async () => {
                        const type = document.getElementById('quick-trace-type').value;
                        const id = document.getElementById('quick-trace-id').value;
                        if (id) {
                            Modal.close();
                            // Esperar a que el modal se cierre completamente
                            await new Promise(resolve => setTimeout(resolve, 300));
                            await this.traceDocument(type, id);
                        }
                    }
                }
            ]
        });
    },

    /**
     * Traza desde el modal
     */
    async traceFromModal(type, id) {
        Modal.close();
        // Esperar a que el modal se cierre completamente antes de abrir el nuevo
        // El modal tiene una animación de 200ms, agregamos 100ms extra de margen
        await new Promise(resolve => setTimeout(resolve, 300));
        await this.traceDocument(type, id);
    },

    /**
     * Traza un documento y muestra resultados
     */
    async traceDocument(documentType, documentId) {
        const loading = Toast.loading('Generando trazabilidad...');

        try {
            const report = await TraceabilityService.generateTraceReport(documentType, documentId);

            if (!report || report.trace.error) {
                throw new Error(report?.trace?.error || 'Error al trazar documento');
            }

            loading.close();
            this.showTraceResults(report);

        } catch (error) {
            loading.error('Error: ' + error.message);
        }
    },

    /**
     * Muestra los resultados de la traza
     */
    async showTraceResults(report) {
        const { trace, visualization, summary, pedagogicalNotes } = report;

        await Modal.custom({
            title: 'Trazabilidad del Documento',
            size: 'xl',
            content: `
                <div class="trace-results-modal">
                    <!-- Summary -->
                    <div class="trace-summary">
                        <div class="summary-stat">
                            <span class="stat-label">Estado</span>
                            <span class="stat-value badge ${summary.status === 'Ciclo Completo' ? 'badge-success' : 'badge-warning'}">
                                ${summary.status}
                            </span>
                        </div>
                        <div class="summary-stat">
                            <span class="stat-label">Documentos</span>
                            <span class="stat-value">${summary.documentsCount}</span>
                        </div>
                        <div class="summary-stat">
                            <span class="stat-label">Módulos</span>
                            <span class="stat-value">${summary.modulesInvolved.join(', ')}</span>
                        </div>
                        ${summary.financials.totalDebit > 0 ? `
                            <div class="summary-stat">
                                <span class="stat-label">Total Débitos</span>
                                <span class="stat-value">${Formatters.currency(summary.financials.totalDebit)}</span>
                            </div>
                            <div class="summary-stat">
                                <span class="stat-label">Total Créditos</span>
                                <span class="stat-value">${Formatters.currency(summary.financials.totalCredit)}</span>
                            </div>
                        ` : ''}
                    </div>

                    <!-- Flow visualization -->
                    <div class="trace-flow">
                        <h4>Flujo de la Transacción</h4>
                        <div class="flow-visualization">
                            ${visualization.nodes.map((node, idx) => `
                                <div class="flow-node ${node.isOrigin ? 'origin' : ''}">
                                    <div class="node-icon" style="background: ${node.color}20; color: ${node.color}">
                                        <i class="fas ${node.icon}"></i>
                                    </div>
                                    <div class="node-content">
                                        <span class="node-label">${node.label}</span>
                                        <span class="node-number">${node.number}</span>
                                        <span class="node-module">${node.module}</span>
                                    </div>
                                </div>
                                ${idx < visualization.nodes.length - 1 ? `
                                    <div class="flow-arrow">
                                        <i class="fas fa-arrow-right"></i>
                                    </div>
                                ` : ''}
                            `).join('')}
                        </div>
                    </div>

                    <!-- Financial impact -->
                    ${trace.financialImpact.length > 0 ? `
                        <div class="financial-impact">
                            <h4>Impacto Financiero</h4>
                            <table class="table">
                                <thead>
                                    <tr>
                                        <th>Cuenta</th>
                                        <th class="text-right">Debe</th>
                                        <th class="text-right">Haber</th>
                                        <th>Descripción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${trace.financialImpact
                        .filter(i => i.debit !== undefined)
                        .map(impact => {
                            // La cuenta puede ser un objeto o un string
                            const accountDisplay = impact.account
                                ? (typeof impact.account === 'object'
                                    ? `${impact.account.code || ''} ${impact.account.name || ''}`.trim()
                                    : impact.account)
                                : 'N/A';
                            return `
                                            <tr>
                                                <td>${accountDisplay}</td>
                                                <td class="text-right">${impact.debit ? Formatters.currency(impact.debit) : '-'}</td>
                                                <td class="text-right">${impact.credit ? Formatters.currency(impact.credit) : '-'}</td>
                                                <td>${impact.description || ''}</td>
                                            </tr>
                                        `;
                        }).join('')}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <th>TOTALES</th>
                                        <th class="text-right">${Formatters.currency(summary.financials.totalDebit)}</th>
                                        <th class="text-right">${Formatters.currency(summary.financials.totalCredit)}</th>
                                        <th>
                                            ${summary.financials.isBalanced
                        ? '<span class="badge badge-success">Cuadrado</span>'
                        : '<span class="badge badge-error">Descuadrado</span>'}
                                        </th>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ` : ''}

                    <!-- Pedagogical notes -->
                    <div class="pedagogical-notes">
                        <h4><i class="fas fa-graduation-cap"></i> Notas Pedagógicas</h4>
                        <div class="notes-grid">
                            ${pedagogicalNotes.map(note => `
                                <div class="note-card">
                                    <h5>${note.title}</h5>
                                    <p>${note.content}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <!-- Timeline -->
                    <div class="trace-timeline">
                        <h4>Línea de Tiempo</h4>
                        <div class="timeline">
                            ${trace.timeline.map((item, idx) => {
                            const config = TraceabilityService.documentTypes[item.type];
                            return `
                                    <div class="timeline-item">
                                        <div class="timeline-dot" style="background: ${config?.color || '#666'}"></div>
                                        <div class="timeline-content">
                                            <span class="timeline-date">${item.date || ''}</span>
                                            <span class="timeline-desc">${item.description}</span>
                                        </div>
                                    </div>
                                `;
                        }).join('')}
                        </div>
                    </div>
                </div>
            `,
            buttons: [
                { text: 'Cerrar', class: 'btn-outline', action: 'close' },
                {
                    text: 'Exportar PDF',
                    class: 'btn-primary',
                    action: () => this.exportTraceToPDF(report)
                }
            ]
        });
    },

    /**
     * Muestra diagrama de flujo de negocio
     */
    async showFlowDiagram(flowKey) {
        const flow = TraceabilityService.standardFlows[flowKey];
        if (!flow) return;

        const container = document.getElementById('flow-diagram-container');
        if (!container) {
            // Si no hay contenedor, mostrar en modal
            await this.showFlowDiagramModal(flowKey, flow);
            return;
        }

        container.innerHTML = `
            <div class="flow-diagram">
                <div class="flow-header">
                    <h3>${flow.name}</h3>
                    <p>${flow.description}</p>
                </div>
                
                <div class="flow-steps-diagram">
                    ${flow.steps.map((step, idx) => {
            const docType = TraceabilityService.documentTypes[step.type];
            return `
                            <div class="diagram-step">
                                <div class="step-box" style="border-color: ${docType?.color || '#666'}">
                                    <div class="step-icon" style="background: ${docType?.color || '#666'}">
                                        <i class="fas ${docType?.icon || 'fa-file'}"></i>
                                    </div>
                                    <div class="step-info">
                                        <span class="step-label">${step.label}</span>
                                        <span class="step-module">${docType?.module || ''}</span>
                                    </div>
                                </div>
                                ${idx < flow.steps.length - 1 ? `
                                    <div class="step-connector">
                                        <div class="connector-line"></div>
                                        <div class="connector-arrow">
                                            <i class="fas fa-chevron-down"></i>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `;
        }).join('')}
                </div>

                <div class="flow-accounts">
                    <h4>Cuentas Afectadas</h4>
                    <div class="accounts-list">
                        ${flow.affectedAccounts.map(acc => `
                            <div class="account-item">
                                <span class="account-code">${acc.code}</span>
                                <span class="account-name">${acc.name}</span>
                                <span class="account-effect">${acc.effect}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Muestra diagrama de flujo en modal
     */
    async showFlowDiagramModal(flowKey, flow) {
        await Modal.custom({
            title: flow.name,
            size: 'xl',
            content: `
                <div class="flow-diagram-modal">
                    <p class="flow-description">${flow.description}</p>
                    
                    <div class="flow-visual">
                        ${flow.steps.map((step, idx) => {
                const docType = TraceabilityService.documentTypes[step.type];
                return `
                                <div class="flow-step-item">
                                    <div class="step-number">${idx + 1}</div>
                                    <div class="step-card" style="border-left-color: ${docType?.color || '#666'}">
                                        <div class="step-icon-wrapper" style="background: ${docType?.color || '#666'}20">
                                            <i class="fas ${docType?.icon || 'fa-file'}" style="color: ${docType?.color || '#666'}"></i>
                                        </div>
                                        <div class="step-details">
                                            <strong>${step.label}</strong>
                                            <span>${docType?.module || 'Módulo'}</span>
                                        </div>
                                    </div>
                                    ${idx < flow.steps.length - 1 ? '<div class="step-arrow"><i class="fas fa-arrow-down"></i></div>' : ''}
                                </div>
                            `;
            }).join('')}
                    </div>

                    <div class="affected-accounts">
                        <h4><i class="fas fa-book"></i> Impacto en Plan de Cuentas</h4>
                        <table class="table table-sm">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Cuenta</th>
                                    <th>Efecto</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${flow.affectedAccounts.map(acc => `
                                    <tr>
                                        <td><code>${acc.code}</code></td>
                                        <td>${acc.name}</td>
                                        <td>${acc.effect}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `,
            buttons: [
                { text: 'Cerrar', class: 'btn-outline', action: 'close' }
            ]
        });
    },

    /**
     * Ejecuta todas las validaciones
     */
    async runAllValidations() {
        const resultsContainer = document.getElementById('validation-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Ejecutando validaciones...</div>';

        try {
            const company = CompanyService.getCurrent();
            const results = [];

            // Validar todos los asientos
            const entries = await AccountingService.getJournalEntries();
            for (const entry of entries) {
                const lines = await AccountingService.getJournalLines(entry.id);
                const validation = await ValidationService.validateJournalEntry({
                    ...entry,
                    lines
                });

                if (!validation.isValid || validation.warnings.length > 0) {
                    results.push({
                        document: entry,
                        type: 'journalEntry',
                        validation
                    });
                }
            }

            // Validar facturas
            const invoices = await DB.getByIndex('customerInvoices', 'companyId', company.id);
            for (const invoice of invoices) {
                const flowValidation = await ValidationService.validateBusinessFlow('customerInvoice', invoice.id);
                if (!flowValidation.allValid) {
                    results.push({
                        document: invoice,
                        type: 'customerInvoice',
                        validation: flowValidation
                    });
                }
            }

            // Validar Balance General (Activos = Pasivos + Patrimonio)
            const balanceValidation = await ValidationService.validateBalanceSheet();
            const balanceIssue = !balanceValidation.isValid ? {
                document: { id: 'balance', number: 'Balance General' },
                type: 'balanceSheet',
                validation: {
                    errors: [balanceValidation],
                    warnings: [],
                    results: [balanceValidation]
                }
            } : null;

            // Agregar el problema del balance a los resultados si existe
            const allResults = balanceIssue ? [balanceIssue, ...results] : results;
            const totalIssues = allResults.length;

            resultsContainer.innerHTML = `
                <div class="validation-summary">
                    <div class="summary-icon ${totalIssues === 0 ? 'success' : 'warning'}">
                        <i class="fas fa-${totalIssues === 0 ? 'check-circle' : 'exclamation-triangle'}"></i>
                    </div>
                    <div class="summary-text">
                        ${totalIssues === 0
                    ? '<h4>¡Todas las validaciones pasaron!</h4><p>No se encontraron errores ni advertencias.</p>'
                    : `<h4>Se encontraron ${totalIssues} observación(es)</h4><p>Revisa los detalles a continuación.</p>`}
                    </div>
                </div>
                
                ${totalIssues > 0 ? `
                    <div class="validation-details">
                        ${allResults.map(r => `
                            <div class="validation-item">
                                <div class="item-header">
                                    <span class="item-type">${TraceabilityService.documentTypes[r.type]?.name || r.type}</span>
                                    <span class="item-number">${r.document.number || '#' + r.document.id}</span>
                                </div>
                                <div class="item-issues">
                                    ${r.validation.errors?.map(e => `
                                        <div class="issue error"><i class="fas fa-times-circle"></i> ${e.message}</div>
                                    `).join('') || ''}
                                    ${r.validation.warnings?.map(w => `
                                        <div class="issue warning"><i class="fas fa-exclamation-triangle"></i> ${w.message}</div>
                                    `).join('') || ''}
                                    ${r.validation.results?.filter(res => !res.isValid && res.severity === 'error').map(e => `
                                        <div class="issue error"><i class="fas fa-times-circle"></i> ${e.message}</div>
                                    `).join('') || ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            `;

        } catch (error) {
            resultsContainer.innerHTML = `
                <div class="validation-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Error al ejecutar validaciones: ${error.message}</p>
                </div>
            `;
        }
    },

    /**
     * Valida un asiento específico
     */
    async validateEntry(entryId) {
        const loading = Toast.loading('Validando asiento...');

        try {
            const entry = await DB.get('journalEntries', entryId);
            const lines = await AccountingService.getJournalLines(entryId);

            const validation = await ValidationService.validateJournalEntry({
                ...entry,
                lines
            });

            loading.close();

            await Modal.custom({
                title: `Validación: ${entry.number}`,
                size: 'lg',
                content: `
                    <div class="entry-validation-modal">
                        <div class="validation-status ${validation.isValid ? 'success' : 'error'}">
                            <i class="fas fa-${validation.isValid ? 'check-circle' : 'times-circle'}"></i>
                            <span>${validation.isValid ? 'Asiento válido' : 'Asiento con errores'}</span>
                        </div>
                        
                        <div class="validation-results-list">
                            ${validation.results.map(r => `
                                <div class="result-item ${r.severity}">
                                    <div class="result-header">
                                        <span class="result-code">${r.code}</span>
                                        <span class="result-severity badge badge-${r.severity}">${r.severity}</span>
                                    </div>
                                    <div class="result-message">${r.message}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `,
                buttons: [
                    { text: 'Cerrar', class: 'btn-outline', action: 'close' },
                    ...(validation.isValid ? [{
                        text: 'Contabilizar',
                        class: 'btn-primary',
                        action: async () => {
                            try {
                                await AccountingService.postJournalEntry(entryId);
                                Toast.success('Asiento contabilizado exitosamente');
                                Modal.close();
                                App.navigate('trazabilidad', 'validations');
                            } catch (e) {
                                Toast.error('Error: ' + e.message);
                            }
                        }
                    }] : [])
                ]
            });

        } catch (error) {
            loading.error('Error: ' + error.message);
        }
    },

    /**
     * Exporta traza a PDF
     */
    async exportTraceToPDF(report) {
        Toast.info('Funcionalidad de exportación PDF próximamente disponible');
    },

    /**
     * Refresca las transacciones
     */
    async refreshTransactions() {
        App.navigate('trazabilidad', 'overview');
    },

    /**
     * Muestra todos los issues de integridad
     */
    async showAllIssues() {
        const integrity = await TraceabilityService.verifyDataIntegrity();

        await Modal.custom({
            title: 'Problemas de Integridad de Datos',
            size: 'lg',
            content: `
                <div class="integrity-issues-modal">
                    ${integrity.issues.map(issue => `
                        <div class="issue-card ${issue.severity}">
                            <div class="issue-icon">
                                <i class="fas fa-${issue.severity === 'error' ? 'times-circle' : 'exclamation-triangle'}"></i>
                            </div>
                            <div class="issue-content">
                                <span class="issue-type">${issue.type}</span>
                                <p>${issue.message}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `,
            buttons: [
                { text: 'Cerrar', class: 'btn-outline', action: 'close' }
            ]
        });
    }
};

// Hacer disponible globalmente
window.TrazabilidadModule = TrazabilidadModule;
