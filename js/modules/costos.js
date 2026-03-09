/**
 * EduERP - Costos Module
 * Módulo de Contabilidad de Costos (CO)
 */

const CostosModule = {
    currentView: 'centros-costo',

    async render(view = 'centros-costo') {
        this.currentView = view;

        switch (view) {
            case 'centros-costo': return await this.renderCostCenters();
            case 'ordenes-internas': return this.renderInternalOrders();
            case 'analisis-costos': return await this.renderCostAnalysis();
            default: return '<p>Vista no encontrada</p>';
        }
    },

    async renderCostCenters() {
        return `
            <div class="page-header">
                <h1 class="page-title">Centros de Costo</h1>
                <p class="page-subtitle">Estructura de centros de costo para distribución de gastos</p>
            </div>
            <div class="toolbar">
                <div class="toolbar-left">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" class="form-control" placeholder="Buscar..." id="search-cc">
                    </div>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-primary" id="btn-new-cc">
                        <i class="fas fa-plus"></i> Nuevo Centro de Costo
                    </button>
                </div>
            </div>
            <div id="cc-table"></div>
        `;
    },

    renderInternalOrders() {
        return `
            <div class="page-header">
                <h1 class="page-title">Órdenes Internas</h1>
                <p class="page-subtitle">Seguimiento de proyectos y actividades especiales</p>
            </div>
            <div class="toolbar">
                <div class="toolbar-left">
                    <select class="form-control" id="filter-status" style="width: 150px;">
                        <option value="">Todos</option>
                        <option value="open">Abiertas</option>
                        <option value="closed">Cerradas</option>
                    </select>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-primary" id="btn-new-order">
                        <i class="fas fa-plus"></i> Nueva Orden
                    </button>
                </div>
            </div>
            <div id="orders-table"></div>
        `;
    },

    async renderCostAnalysis() {
        const company = CompanyService.getCurrent();
        let costCenters = [];
        if (company) {
            costCenters = await DB.getByIndex('costCenters', 'companyId', company.id);
        }

        return `
            <div class="page-header">
                <h1 class="page-title">Análisis de Costos</h1>
                <p class="page-subtitle">Distribución y análisis de gastos por centro de costo</p>
            </div>
            
            <div class="dashboard-grid">
                ${costCenters.map(cc => `
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <div class="kpi-icon ${cc.type === 'overhead' ? 'warning' : 'primary'}">
                                <i class="fas fa-${cc.type === 'overhead' ? 'building' : 'cogs'}"></i>
                            </div>
                        </div>
                        <div class="kpi-value">${Formatters.currency(cc.actual || 0)}</div>
                        <div class="kpi-label">${cc.code} - ${cc.name}</div>
                        <div class="kpi-footer">
                            <span>Presupuesto: ${Formatters.currency(cc.budget || 0)}</span>
                            ${cc.budget > 0 ? `
                                <span class="kpi-trend ${cc.actual <= cc.budget ? 'up' : 'down'}">
                                    ${((cc.actual / cc.budget) * 100).toFixed(0)}%
                                </span>
                            ` : ''}
                        </div>
                    </div>
                `).join('') || `
                    <div class="empty-state span-4">
                        <i class="fas fa-sitemap"></i>
                        <h3>Sin centros de costo</h3>
                        <p>Cree centros de costo para distribuir y analizar gastos</p>
                    </div>
                `}
            </div>
            
            <div class="card" style="margin-top: var(--space-4);">
                <div class="card-header">
                    <div class="card-title"><i class="fas fa-chart-pie"></i> Distribución de Costos</div>
                </div>
                <div class="card-body">
                    <div style="display: flex; gap: var(--space-4);">
                        <div style="flex: 1; height: 300px;">
                            <canvas id="costs-chart"></canvas>
                        </div>
                        <div style="flex: 1; height: 300px;">
                            <canvas id="budget-chart"></canvas>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    async init(view) {
        const company = CompanyService.getCurrent();
        if (!company) return;

        switch (view) {
            case 'centros-costo': await this.initCostCenters(); break;
            case 'ordenes-internas': await this.initInternalOrders(); break;
            case 'analisis-costos': await this.initCostAnalysis(); break;
        }
    },

    async initCostCenters() {
        const company = CompanyService.getCurrent();
        const costCenters = await DB.getByIndex('costCenters', 'companyId', company.id);

        DataTable.create('cc-table', {
            columns: [
                { key: 'code', label: 'Código' },
                { key: 'name', label: 'Nombre' },
                {
                    key: 'type', label: 'Tipo', render: (v) => {
                        return v === 'overhead' ?
                            '<span class="badge badge-warning">Overhead</span>' :
                            '<span class="badge badge-primary">Operacional</span>';
                    }
                },
                { key: 'budget', label: 'Presupuesto', format: 'currency', class: 'text-right' },
                { key: 'actual', label: 'Real', format: 'currency', class: 'text-right' },
                {
                    key: 'variance', label: 'Variación', class: 'text-right', render: (v, row) => {
                        const variance = (row.budget || 0) - (row.actual || 0);
                        return `<span class="${variance >= 0 ? 'positive' : 'negative'}">${Formatters.currency(variance)}</span>`;
                    }
                }
            ],
            data: costCenters,
            actions: [
                { name: 'edit', label: 'Editar', icon: 'fas fa-edit', handler: (row) => this.showCostCenterModal(row.id) },
                { name: 'delete', label: 'Eliminar', icon: 'fas fa-trash', handler: (row) => this.deleteCostCenter(row.id) }
            ],
            emptyMessage: 'No hay centros de costo'
        });

        document.getElementById('btn-new-cc')?.addEventListener('click', () => this.showCostCenterModal());
    },

    async showCostCenterModal(ccId = null) {
        const isEdit = !!ccId;
        let data = {};

        if (isEdit) {
            data = await DB.get('costCenters', ccId);
        }

        await Modal.form({
            title: isEdit ? 'Editar Centro de Costo' : 'Nuevo Centro de Costo',
            fields: [
                { name: 'code', label: 'Código', required: true, placeholder: 'CC001', default: data.code },
                { name: 'name', label: 'Nombre', required: true, placeholder: 'Nombre del centro', default: data.name },
                {
                    name: 'type', label: 'Tipo', type: 'select', options: [
                        { value: 'operational', label: 'Operacional' },
                        { value: 'overhead', label: 'Overhead (Gastos Generales)' }
                    ], default: data.type || 'operational'
                },
                { name: 'budget', label: 'Presupuesto Mensual', type: 'number', default: data.budget || 0 }
            ],
            onSubmit: async (formData) => {
                const company = CompanyService.getCurrent();

                if (isEdit) {
                    await DB.update('costCenters', { ...data, ...formData });
                    Toast.success('Centro de costo actualizado');
                } else {
                    await DB.add('costCenters', { companyId: company.id, ...formData, actual: 0, status: 'active' });
                    Toast.success('Centro de costo creado');
                }
                App.navigate('costos', 'centros-costo');
            }
        });
    },

    async deleteCostCenter(id) {
        const confirm = await Modal.confirm({
            title: 'Eliminar Centro de Costo',
            message: '¿Está seguro de eliminar este centro de costo?',
            confirmText: 'Eliminar',
            confirmClass: 'btn-danger'
        });

        if (confirm) {
            await DB.delete('costCenters', id);
            Toast.success('Centro de costo eliminado');
            App.navigate('costos', 'centros-costo');
        }
    },

    async initInternalOrders() {
        const company = CompanyService.getCurrent();
        const orders = await DB.getByIndex('internalOrders', 'companyId', company.id);

        DataTable.create('orders-table', {
            columns: [
                { key: 'number', label: 'Número' },
                { key: 'description', label: 'Descripción' },
                { key: 'costCenterName', label: 'Centro de Costo' },
                { key: 'budget', label: 'Presupuesto', format: 'currency', class: 'text-right' },
                { key: 'actual', label: 'Ejecutado', format: 'currency', class: 'text-right' },
                { key: 'status', label: 'Estado', format: 'status' }
            ],
            data: orders,
            emptyMessage: 'No hay órdenes internas'
        });

        document.getElementById('btn-new-order')?.addEventListener('click', () => {
            Toast.info('Nueva orden interna');
        });
    },

    async initCostAnalysis() {
        const company = CompanyService.getCurrent();
        const costCenters = await DB.getByIndex('costCenters', 'companyId', company.id);

        if (costCenters.length > 0) {
            // Gráfico de distribución
            Charts.doughnut('costs-chart', {
                labels: costCenters.map(cc => cc.name),
                values: costCenters.map(cc => cc.actual || 0)
            }, { currency: true });

            // Gráfico de presupuesto vs real
            Charts.bar('budget-chart', {
                labels: costCenters.map(cc => cc.code),
                datasets: [
                    { label: 'Presupuesto', data: costCenters.map(cc => cc.budget || 0), color: Charts.colors.primary },
                    { label: 'Real', data: costCenters.map(cc => cc.actual || 0), color: Charts.colors.warning }
                ]
            }, { currency: true });
        }
    }
};

window.CostosModule = CostosModule;
