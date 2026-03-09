/**
 * EDU-TRACE ERP - Dashboard Module
 * Panel principal con KPIs y resumen
 */

const DashboardModule = {
    /**
     * Renderiza el dashboard
     */
    async render() {
        const company = CompanyService.getCurrent();

        if (!company) {
            return this.renderNoCompany();
        }

        // Obtener datos
        const stats = await this.getStats();

        return `
            <div class="dashboard">
                <!-- Banner de bienvenida -->
                ${this.renderWelcomeBanner(company)}
                
                <!-- KPIs principales -->
                <div class="dashboard-grid">
                    ${this.renderKPICards(stats)}
                </div>
                
                <!-- Gráficos y actividad -->
                <div class="dashboard-grid" style="margin-top: var(--space-4);">
                    <!-- Gráfico de ingresos vs gastos -->
                    <div class="chart-card span-2">
                        <div class="chart-header">
                            <div>
                                <div class="chart-title">Ingresos vs Gastos</div>
                                <div class="chart-subtitle">Últimos 6 meses</div>
                            </div>
                            <div class="period-selector">
                                <button class="period-btn active" data-period="6m">6M</button>
                                <button class="period-btn" data-period="1y">1A</button>
                            </div>
                        </div>
                        <div class="chart-body">
                            <canvas id="revenue-expenses-chart"></canvas>
                        </div>
                    </div>
                    
                    <!-- Distribución de gastos -->
                    <div class="chart-card span-2">
                        <div class="chart-header">
                            <div>
                                <div class="chart-title">Distribución de Gastos</div>
                                <div class="chart-subtitle">Por categoría</div>
                            </div>
                        </div>
                        <div class="chart-body" style="display: flex; align-items: center; justify-content: center;">
                            <div style="width: 250px; height: 250px;">
                                <canvas id="expenses-distribution-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-grid" style="margin-top: var(--space-4);">
                    <!-- Acciones rápidas -->
                    <div class="card span-2">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-bolt"></i>
                                Acciones Rápidas
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="quick-actions">
                                <a href="#" class="quick-action-btn" data-action="new-entry">
                                    <i class="fas fa-file-invoice"></i>
                                    <span>Nuevo Asiento</span>
                                </a>
                                <a href="#" class="quick-action-btn" data-action="new-sale">
                                    <i class="fas fa-shopping-cart"></i>
                                    <span>Nueva Venta</span>
                                </a>
                                <a href="#" class="quick-action-btn" data-action="new-purchase">
                                    <i class="fas fa-truck"></i>
                                    <span>Nueva Compra</span>
                                </a>
                                <a href="#" class="quick-action-btn" data-action="new-payment">
                                    <i class="fas fa-money-bill-wave"></i>
                                    <span>Registrar Pago</span>
                                </a>
                                <a href="#" class="quick-action-btn" data-action="reports">
                                    <i class="fas fa-chart-pie"></i>
                                    <span>Reportes</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Actividad reciente -->
                    <div class="card span-2">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-history"></i>
                                Actividad Reciente
                            </div>
                            <a href="#" class="btn btn-ghost btn-sm">Ver todo</a>
                        </div>
                        <div class="card-body">
                            ${await this.renderRecentActivity()}
                        </div>
                    </div>
                </div>
                
                <!-- Resumen financiero -->
                <div class="dashboard-grid" style="margin-top: var(--space-4);">
                    <div class="card span-4">
                        <div class="card-header">
                            <div class="card-title">
                                <i class="fas fa-balance-scale"></i>
                                Resumen Financiero
                            </div>
                            <span class="badge badge-info">Al día de hoy</span>
                        </div>
                        <div class="card-body">
                            ${await this.renderFinancialSummary(stats)}
                        </div>
                    </div>
                </div>
                
                <!-- Banner de Autoría -->
                <div class="authorship-banner" style="margin-top: var(--space-6);">
                    <div class="authorship-content">
                        <div class="authorship-logo">
                            <i class="fas fa-graduation-cap"></i>
                        </div>
                        <div class="authorship-info">
                            <div class="authorship-title">
                                <span class="system-name">EDU-TRACE ERP</span>
                                <span class="version-badge">v1.0 - Etapa 1</span>
                            </div>
                            <div class="authorship-subtitle">
                                Sistema de Gestión Empresarial (ERP) Educativo con Trazabilidad Pedagógica Integrada
                            </div>
                            <div class="authorship-credits">
                                <div class="credit-line">
                                    <i class="fas fa-user-edit"></i>
                                    <span><strong>Autora:</strong> Sandy Iturra Mena</span>
                                </div>
                            </div>
                        </div>
                        <div class="authorship-badge">
                            <div class="institution-logo-img">
                                <img src="https://www.uv.cl/images/descargas-corporativas/uv_logo_alta_rgba_blanco-2023.png" alt="Logo Universidad de Valparaíso" style="height: 50px; width: auto;">
                            </div>
                            <div class="institution-text">
                                <div class="institution-name">Universidad de Valparaíso</div>
                                <div class="institution-dept">Escuela de Auditoría</div>
                            </div>
                        </div>
                    </div>
                    <div class="authorship-footer">
                        <span>© 2025 Sandy Iturra Mena. Todos los derechos reservados.</span>
                        <span class="separator">|</span>
                        <span>Desarrollado para la enseñanza de Contabilidad</span>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza cuando no hay empresa seleccionada
     */
    renderNoCompany() {
        return `
            <div class="empty-state" style="padding: var(--space-16) var(--space-8);">
                <i class="fas fa-building"></i>
                <h3>Bienvenido a EDU-TRACE ERP</h3>
                <p>Para comenzar, crea tu primera empresa virtual o importa un caso de estudio existente.</p>
                <div class="btn-group" style="justify-content: center; margin-top: var(--space-4);">
                    <button class="btn btn-primary" id="btn-create-company">
                        <i class="fas fa-plus"></i> Crear Empresa
                    </button>
                    <button class="btn btn-outline" id="btn-import-company">
                        <i class="fas fa-file-import"></i> Importar Datos
                    </button>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza banner de bienvenida
     */
    renderWelcomeBanner(company) {
        const hour = new Date().getHours();
        let greeting = 'Buenos días';
        if (hour >= 12 && hour < 19) greeting = 'Buenas tardes';
        else if (hour >= 19) greeting = 'Buenas noches';

        return `
            <div class="welcome-banner">
                <div class="welcome-content">
                    <h1 class="welcome-title">${greeting}!</h1>
                    <p class="welcome-subtitle">
                        Estás trabajando con <strong>${company.name}</strong>. 
                        Aquí tienes un resumen de la situación actual.
                    </p>
                    <div class="welcome-actions">
                        <button class="welcome-btn primary" data-action="tutorial">
                            <i class="fas fa-play-circle"></i> Tutorial Rápido
                        </button>
                        <button class="welcome-btn" data-action="system-flow">
                            <i class="fas fa-project-diagram"></i> Diagrama del Sistema
                        </button>
                        <button class="welcome-btn" data-action="accounting-course">
                            <i class="fas fa-graduation-cap"></i> Curso de Contabilidad
                        </button>
                        <button class="welcome-btn" data-action="help">
                            <i class="fas fa-question-circle"></i> Ayuda
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza tarjetas KPI
     */
    renderKPICards(stats) {
        const kpis = [
            {
                label: 'Ingresos del Mes',
                value: Formatters.currency(stats.monthlyRevenue),
                icon: 'fa-arrow-trend-up',
                type: 'success',
                trend: stats.revenueTrend,
                trendLabel: 'vs mes anterior'
            },
            {
                label: 'Gastos del Mes',
                value: Formatters.currency(stats.monthlyExpenses),
                icon: 'fa-arrow-trend-down',
                type: 'error',
                trend: stats.expensesTrend,
                trendLabel: 'vs mes anterior'
            },
            {
                label: 'Cuentas por Cobrar',
                value: Formatters.currency(stats.accountsReceivable),
                icon: 'fa-file-invoice-dollar',
                type: 'warning',
                count: `${stats.pendingInvoices} facturas`
            },
            {
                label: 'Cuentas por Pagar',
                value: Formatters.currency(stats.accountsPayable),
                icon: 'fa-file-invoice',
                type: 'primary',
                count: `${stats.pendingBills} facturas`
            }
        ];

        return kpis.map(kpi => `
            <div class="kpi-card ${kpi.type}">
                <div class="kpi-header">
                    <div class="kpi-icon ${kpi.type}">
                        <i class="fas ${kpi.icon}"></i>
                    </div>
                    <button class="kpi-menu btn btn-ghost btn-icon">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                </div>
                <div class="kpi-value">${kpi.value}</div>
                <div class="kpi-label">${kpi.label}</div>
                <div class="kpi-footer">
                    ${kpi.trend !== undefined ? `
                        <span class="kpi-trend ${kpi.trend >= 0 ? 'up' : 'down'}">
                            <i class="fas fa-arrow-${kpi.trend >= 0 ? 'up' : 'down'}"></i>
                            ${Math.abs(kpi.trend).toFixed(1)}%
                        </span>
                        <span>${kpi.trendLabel}</span>
                    ` : ''}
                    ${kpi.count ? `<span>${kpi.count}</span>` : ''}
                </div>
            </div>
        `).join('');
    },

    /**
     * Renderiza actividad reciente
     */
    async renderRecentActivity() {
        const company = CompanyService.getCurrent();
        if (!company) return '<p class="text-muted">No hay actividad</p>';

        // Obtener últimas actividades del log
        const logs = await DB.getByIndex('auditLog', 'companyId', company.id);
        const recentLogs = logs.slice(-5).reverse();

        if (recentLogs.length === 0) {
            return `
                <div class="empty-state" style="padding: var(--space-4);">
                    <i class="fas fa-clock" style="font-size: 2rem;"></i>
                    <p>No hay actividad reciente</p>
                </div>
            `;
        }

        const activityTypes = {
            'CREATE': { icon: 'fa-plus-circle', class: 'success', label: 'Creación' },
            'UPDATE': { icon: 'fa-edit', class: 'info', label: 'Modificación' },
            'DELETE': { icon: 'fa-trash', class: 'error', label: 'Eliminación' },
            'POST': { icon: 'fa-check-circle', class: 'success', label: 'Contabilización' },
            'CANCEL': { icon: 'fa-times-circle', class: 'warning', label: 'Anulación' }
        };

        return `
            <div class="activity-list">
                ${recentLogs.map(log => {
            const type = activityTypes[log.action] || { icon: 'fa-circle', class: 'neutral', label: log.action };
            return `
                        <div class="activity-item">
                            <div class="activity-icon ${type.class}">
                                <i class="fas ${type.icon}"></i>
                            </div>
                            <div class="activity-content">
                                <div class="activity-title">${type.label} de ${log.entity}</div>
                                <div class="activity-desc">${JSON.stringify(log.details).substring(0, 50)}...</div>
                            </div>
                            <div class="activity-time">${Formatters.relativeTime(log.timestamp)}</div>
                        </div>
                    `;
        }).join('')}
            </div>
        `;
    },

    /**
     * Renderiza resumen financiero
     */
    async renderFinancialSummary(stats) {
        return `
            <div class="financial-summary">
                <div class="summary-item">
                    <div class="summary-value positive">
                        ${Formatters.currency(stats.totalAssets)}
                    </div>
                    <div class="summary-label">Total Activos</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value negative">
                        ${Formatters.currency(stats.totalLiabilities)}
                    </div>
                    <div class="summary-label">Total Pasivos</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value ${stats.netEquity >= 0 ? 'positive' : 'negative'}">
                        ${Formatters.currency(stats.netEquity)}
                    </div>
                    <div class="summary-label">Patrimonio Neto</div>
                </div>
            </div>
            <div class="divider"></div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: var(--space-2);">
                <div>
                    <span style="color: var(--text-secondary); font-size: var(--font-size-sm);">
                        Resultado del ejercicio:
                    </span>
                    <strong style="font-size: var(--font-size-lg); margin-left: var(--space-2); color: ${stats.netIncome >= 0 ? 'var(--success-500)' : 'var(--error-500)'}">
                        ${Formatters.currency(stats.netIncome)}
                    </strong>
                </div>
                <a href="#" class="btn btn-outline btn-sm" data-view="balance-general">
                    Ver Balance Completo <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
    },

    /**
     * Obtiene estadísticas del dashboard
     */
    async getStats() {
        const company = CompanyService.getCurrent();
        if (!company) return this.getEmptyStats();

        try {
            // Obtener cuentas y calcular totales
            const accounts = await AccountingService.getChartOfAccounts();

            const assets = accounts.filter(a => a.type === 'asset' && !a.isGroup);
            const liabilities = accounts.filter(a => a.type === 'liability' && !a.isGroup);
            const equity = accounts.filter(a => a.type === 'equity' && !a.isGroup);
            const revenues = accounts.filter(a => a.type === 'revenue' && !a.isGroup);
            const expenses = accounts.filter(a => a.type === 'expense' && !a.isGroup);

            const totalAssets = Helpers.sumBy(assets, 'balance');
            const totalLiabilities = Helpers.sumBy(liabilities, 'balance');
            const totalEquity = Helpers.sumBy(equity, 'balance');
            const totalRevenue = Helpers.sumBy(revenues, 'balance');
            const totalExpenses = Helpers.sumBy(expenses, 'balance');

            // Obtener facturas pendientes
            const customerInvoices = await DB.getByIndex('customerInvoices', 'companyId', company.id);
            const supplierInvoices = await DB.getByIndex('supplierInvoices', 'companyId', company.id);

            const pendingInvoices = customerInvoices.filter(i => i.status === 'pending' || i.status === 'partial');
            const pendingBills = supplierInvoices.filter(i => i.status === 'pending' || i.status === 'partial');

            return {
                monthlyRevenue: totalRevenue,
                monthlyExpenses: totalExpenses,
                revenueTrend: 5.2, // Demo data
                expensesTrend: -2.1, // Demo data
                accountsReceivable: Helpers.sumBy(pendingInvoices, 'balance'),
                accountsPayable: Helpers.sumBy(pendingBills, 'balance'),
                pendingInvoices: pendingInvoices.length,
                pendingBills: pendingBills.length,
                totalAssets,
                totalLiabilities,
                netEquity: totalEquity,
                netIncome: totalRevenue - totalExpenses
            };
        } catch (err) {
            console.error('Error getting stats:', err);
            return this.getEmptyStats();
        }
    },

    /**
     * Estadísticas vacías
     */
    getEmptyStats() {
        return {
            monthlyRevenue: 0, monthlyExpenses: 0, revenueTrend: 0, expensesTrend: 0,
            accountsReceivable: 0, accountsPayable: 0, pendingInvoices: 0, pendingBills: 0,
            totalAssets: 0, totalLiabilities: 0, netEquity: 0, netIncome: 0
        };
    },

    /**
     * Inicializa gráficos después de renderizar
     */
    initCharts() {
        const company = CompanyService.getCurrent();
        if (!company) return; // No hay gráficos si no hay empresa

        // Gráfico de ingresos vs gastos
        Charts.bar('revenue-expenses-chart', {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            datasets: [
                { label: 'Ingresos', data: [1200000, 1500000, 1300000, 1800000, 1600000, 2000000], color: Charts.colors.success },
                { label: 'Gastos', data: [800000, 900000, 850000, 950000, 880000, 920000], color: Charts.colors.error }
            ]
        }, { currency: true });

        // Gráfico de distribución de gastos
        Charts.doughnut('expenses-distribution-chart', {
            labels: ['Remuneraciones', 'Arriendos', 'Servicios', 'Marketing', 'Otros'],
            values: [45, 20, 15, 10, 10]
        }, { currency: false });
    },

    /**
     * Inicializa el módulo dashboard
     */
    init() {
        this.bindEvents();
        this.initCharts();
    },

    /**
     * Vincula eventos del dashboard
     */
    bindEvents() {
        // Botón crear empresa
        document.getElementById('btn-create-company')?.addEventListener('click', () => {
            this.showCreateCompanyModal();
        });

        // Botón importar
        document.getElementById('btn-import-company')?.addEventListener('click', () => {
            App.navigate('admin', 'import-export');
        });

        // Acciones rápidas
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.action;
                this.handleQuickAction(action);
            });
        });
    },

    /**
     * Muestra modal de crear empresa
     */
    async showCreateCompanyModal() {
        const result = await Modal.form({
            title: 'Crear Nueva Empresa',
            fields: [
                { name: 'name', label: 'Nombre de la Empresa', required: true, placeholder: 'Ej: Mi Empresa S.A.' },
                { name: 'rut', label: 'RUT', required: true, placeholder: 'Ej: 76.123.456-7' },
                { name: 'address', label: 'Dirección', placeholder: 'Dirección comercial' },
                { name: 'phone', label: 'Teléfono', placeholder: '+56 9 1234 5678' },
                { name: 'email', label: 'Email', type: 'email', placeholder: 'contacto@empresa.cl' },
                { name: 'fiscalYear', label: 'Año Fiscal', type: 'number', default: new Date().getFullYear() },
                {
                    name: 'createDemo', label: 'Datos de demostración', type: 'checkbox', default: true,
                    checkLabel: 'Crear datos de ejemplo (clientes, proveedores, productos)'
                }
            ],
            submitText: 'Crear Empresa',
            validate: (data) => {
                if (!data.name) return 'El nombre es requerido';
                if (!data.rut) return 'El RUT es requerido';
                if (!Helpers.validateRUT(data.rut)) return 'El RUT no es válido';
                return true;
            },
            onSubmit: async (data) => {
                const loading = Toast.loading('Creando empresa...');
                try {
                    const company = await CompanyService.create({
                        name: data.name,
                        rut: Helpers.formatRUT(data.rut),
                        address: data.address,
                        phone: data.phone,
                        email: data.email,
                        fiscalYear: data.fiscalYear
                    });

                    // Primero establecer la empresa como actual
                    await CompanyService.setCurrent(company.id);

                    // Luego crear datos de demo si se solicitó
                    if (data.createDemo) {
                        loading.update('Creando datos de demostración...');
                        await CompanyService.createDemoData();
                    }

                    loading.success('Empresa creada exitosamente');
                    App.navigate('dashboard');
                } catch (err) {
                    loading.error('Error al crear empresa: ' + err.message);
                }
            }
        });
    },

    /**
     * Maneja acciones rápidas
     */
    handleQuickAction(action) {
        switch (action) {
            case 'new-entry':
                App.navigate('contabilidad', 'asientos');
                break;
            case 'new-sale':
                App.navigate('ventas', 'facturas-cliente');
                break;
            case 'new-purchase':
                App.navigate('compras', 'facturas-proveedor');
                break;
            case 'new-payment':
                App.navigate('tesoreria', 'bancos');
                break;
            case 'reports':
                App.navigate('reportes', 'balance-general');
                break;
            case 'tutorial':
                TutorialSystem.start('quickStart');
                break;
            case 'help':
                HelpSystem.show();
                break;
            case 'system-flow':
                SystemFlowDiagram.show();
                break;
            case 'accounting-course':
                // Abrir curso de contabilidad en ventana separada
                window.open('diagrama-contable.html', 'CursoContabilidad', 'width=1400,height=900,scrollbars=yes,resizable=yes');
                break;
        }
    }
};

// Hacer disponible globalmente
window.DashboardModule = DashboardModule;
