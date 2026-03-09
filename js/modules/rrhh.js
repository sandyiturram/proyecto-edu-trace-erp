/**
 * EduERP - RRHH Module
 * Módulo de Recursos Humanos (HR)
 */

const RRHHModule = {
    currentView: 'empleados',

    async render(view = 'empleados') {
        this.currentView = view;

        switch (view) {
            case 'empleados': return await this.renderEmployees();
            case 'nomina': return await this.renderPayroll();
            case 'provisiones': return await this.renderProvisions();
            default: return '<p>Vista no encontrada</p>';
        }
    },

    async renderEmployees() {
        return `
            <div class="page-header">
                <h1 class="page-title">Empleados</h1>
                <p class="page-subtitle">Gestión de personal y datos laborales</p>
            </div>
            <div class="toolbar">
                <div class="toolbar-left">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" class="form-control" placeholder="Buscar empleado..." id="search-employees">
                    </div>
                    <select class="form-control" id="filter-department" style="width: 150px;">
                        <option value="">Todos los dptos.</option>
                    </select>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-primary" id="btn-new-employee">
                        <i class="fas fa-user-plus"></i> Nuevo Empleado
                    </button>
                </div>
            </div>
            <div id="employees-table"></div>
        `;
    },

    async renderPayroll() {
        return `
            <div class="page-header">
                <h1 class="page-title">Nómina</h1>
                <p class="page-subtitle">Liquidación de remuneraciones</p>
            </div>
            <div class="toolbar">
                <div class="toolbar-left">
                    <input type="month" class="form-control" id="payroll-period" value="${new Date().toISOString().slice(0, 7)}">
                    <button class="btn btn-primary" id="btn-calculate-payroll">
                        <i class="fas fa-calculator"></i> Calcular Nómina
                    </button>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-outline" id="btn-export-payroll">
                        <i class="fas fa-file-excel"></i> Exportar
                    </button>
                    <button class="btn btn-success" id="btn-post-payroll">
                        <i class="fas fa-check"></i> Contabilizar
                    </button>
                </div>
            </div>
            <div id="payroll-content">
                <div class="empty-state">
                    <i class="fas fa-file-invoice-dollar"></i>
                    <h3>Seleccione un período</h3>
                    <p>Elija el mes y haga clic en "Calcular Nómina"</p>
                </div>
            </div>
        `;
    },

    async renderProvisions() {
        return `
            <div class="page-header">
                <h1 class="page-title">Provisiones</h1>
                <p class="page-subtitle">Cálculo de provisiones laborales</p>
            </div>
            
            <div class="dashboard-grid">
                <div class="kpi-card">
                    <div class="kpi-header">
                        <div class="kpi-icon warning"><i class="fas fa-umbrella-beach"></i></div>
                    </div>
                    <div class="kpi-value" id="vacation-provision">$ 0</div>
                    <div class="kpi-label">Provisión Vacaciones</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-header">
                        <div class="kpi-icon error"><i class="fas fa-hand-holding-usd"></i></div>
                    </div>
                    <div class="kpi-value" id="severance-provision">$ 0</div>
                    <div class="kpi-label">Provisión Indemnización</div>
                </div>
                <div class="kpi-card span-2">
                    <div class="kpi-header">
                        <div class="kpi-icon primary"><i class="fas fa-coins"></i></div>
                    </div>
                    <div class="kpi-value" id="total-provision">$ 0</div>
                    <div class="kpi-label">Total Provisiones</div>
                </div>
            </div>
            
            <div class="card" style="margin-top: var(--space-4);">
                <div class="card-header">
                    <div class="card-title"><i class="fas fa-table"></i> Detalle por Empleado</div>
                    <button class="btn btn-outline btn-sm" id="btn-calculate-provisions">
                        <i class="fas fa-sync"></i> Recalcular
                    </button>
                </div>
                <div class="card-body" style="padding: 0;">
                    <div id="provisions-table"></div>
                </div>
            </div>
        `;
    },

    async init(view) {
        const company = CompanyService.getCurrent();
        if (!company) return;

        switch (view) {
            case 'empleados': await this.initEmployees(); break;
            case 'nomina': this.initPayroll(); break;
            case 'provisiones': await this.initProvisions(); break;
        }
    },

    async initEmployees() {
        const company = CompanyService.getCurrent();
        const employees = await DB.getByIndex('employees', 'companyId', company.id);

        // Obtener departamentos únicos
        const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];
        const deptSelect = document.getElementById('filter-department');
        departments.forEach(dept => {
            deptSelect.innerHTML += `<option value="${dept}">${dept}</option>`;
        });

        DataTable.create('employees-table', {
            columns: [
                { key: 'rut', label: 'RUT' },
                { key: 'name', label: 'Nombre' },
                { key: 'position', label: 'Cargo' },
                { key: 'department', label: 'Departamento' },
                { key: 'startDate', label: 'Ingreso', format: 'date' },
                { key: 'salary', label: 'Sueldo Base', format: 'currency', class: 'text-right' },
                { key: 'status', label: 'Estado', format: 'status' }
            ],
            data: employees,
            actions: [
                { name: 'edit', label: 'Editar', icon: 'fas fa-edit', handler: (row) => this.showEmployeeModal(row.id) },
                { name: 'payslip', label: 'Liquidación', icon: 'fas fa-file-invoice', handler: (row) => this.showPayslip(row.id) }
            ],
            emptyMessage: 'No hay empleados registrados'
        });

        document.getElementById('btn-new-employee')?.addEventListener('click', () => this.showEmployeeModal());
    },

    async showEmployeeModal(employeeId = null) {
        const isEdit = !!employeeId;
        let data = {};

        if (isEdit) {
            data = await DB.get('employees', employeeId);
        }

        await Modal.form({
            title: isEdit ? 'Editar Empleado' : 'Nuevo Empleado',
            fields: [
                { name: 'rut', label: 'RUT', required: true, placeholder: '12.345.678-9', default: data.rut },
                { name: 'name', label: 'Nombre Completo', required: true, placeholder: 'Nombre y apellidos', default: data.name },
                { name: 'position', label: 'Cargo', required: true, placeholder: 'Cargo', default: data.position },
                { name: 'department', label: 'Departamento', placeholder: 'Área de trabajo', default: data.department },
                { name: 'startDate', label: 'Fecha de Ingreso', type: 'date', required: true, default: data.startDate },
                { name: 'salary', label: 'Sueldo Base', type: 'number', required: true, default: data.salary || 0 },
                { name: 'email', label: 'Email', type: 'email', placeholder: 'email@empresa.cl', default: data.email },
                { name: 'phone', label: 'Teléfono', placeholder: '+56 9 1234 5678', default: data.phone }
            ],
            validate: (formData) => {
                if (!Helpers.validateRUT(formData.rut)) return 'RUT inválido';
                return true;
            },
            onSubmit: async (formData) => {
                const company = CompanyService.getCurrent();
                formData.rut = Helpers.formatRUT(formData.rut);

                if (isEdit) {
                    await DB.update('employees', { ...data, ...formData });
                    Toast.success('Empleado actualizado');
                } else {
                    await DB.add('employees', { companyId: company.id, ...formData, status: 'active' });
                    Toast.success('Empleado creado');
                }
                App.navigate('rrhh', 'empleados');
            }
        });
    },

    showPayslip(employeeId) {
        Toast.info('Ver liquidación de sueldo');
    },

    initPayroll() {
        document.getElementById('btn-calculate-payroll')?.addEventListener('click', async () => {
            await this.calculatePayroll();
        });

        document.getElementById('btn-post-payroll')?.addEventListener('click', () => {
            Toast.info('Contabilizar nómina');
        });

        document.getElementById('btn-export-payroll')?.addEventListener('click', () => {
            Toast.info('Exportar nómina');
        });
    },

    async calculatePayroll() {
        const period = document.getElementById('payroll-period').value;
        const company = CompanyService.getCurrent();
        const employees = await DB.getByIndex('employees', 'companyId', company.id);
        const activeEmployees = employees.filter(e => e.status === 'active');

        // Parámetros Chile 2024
        const UFM = 37000; // Valor UF mensual aproximado
        const salarioMinimo = 460000;
        const topeSeguros = 84.1 * UFM;
        const afpRate = 0.1144; // AFP promedio
        const saludRate = 0.07;
        const seguroCesantia = 0.006;

        const payrollData = activeEmployees.map(emp => {
            const bruto = emp.salary;
            const imponible = Math.min(bruto, topeSeguros);

            const afp = Math.round(imponible * afpRate);
            const salud = Math.round(imponible * saludRate);
            const cesantia = Math.round(imponible * seguroCesantia);
            const totalDescuentos = afp + salud + cesantia;
            const liquido = bruto - totalDescuentos;

            return {
                employeeId: emp.id,
                name: emp.name,
                rut: emp.rut,
                department: emp.department,
                bruto,
                afp,
                salud,
                cesantia,
                totalDescuentos,
                liquido
            };
        });

        const totals = {
            bruto: Helpers.sumBy(payrollData, 'bruto'),
            afp: Helpers.sumBy(payrollData, 'afp'),
            salud: Helpers.sumBy(payrollData, 'salud'),
            cesantia: Helpers.sumBy(payrollData, 'cesantia'),
            descuentos: Helpers.sumBy(payrollData, 'totalDescuentos'),
            liquido: Helpers.sumBy(payrollData, 'liquido')
        };

        document.getElementById('payroll-content').innerHTML = `
            <div class="dashboard-grid" style="margin-bottom: var(--space-4);">
                <div class="kpi-card">
                    <div class="kpi-value">${Formatters.currency(totals.bruto)}</div>
                    <div class="kpi-label">Total Bruto</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-value">${Formatters.currency(totals.descuentos)}</div>
                    <div class="kpi-label">Total Descuentos</div>
                </div>
                <div class="kpi-card span-2">
                    <div class="kpi-value">${Formatters.currency(totals.liquido)}</div>
                    <div class="kpi-label">Total Líquido a Pagar</div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><i class="fas fa-users"></i> Nómina ${period}</div>
                    <span class="badge badge-info">${payrollData.length} empleados</span>
                </div>
                <div class="card-body" style="padding: 0;">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Empleado</th>
                                    <th>Departamento</th>
                                    <th class="text-right">Bruto</th>
                                    <th class="text-right">AFP</th>
                                    <th class="text-right">Salud</th>
                                    <th class="text-right">Cesantía</th>
                                    <th class="text-right">Líquido</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${payrollData.map(row => `
                                    <tr>
                                        <td>
                                            <div style="font-weight: 500;">${row.name}</div>
                                            <div style="font-size: var(--font-size-xs); color: var(--text-tertiary);">${row.rut}</div>
                                        </td>
                                        <td>${row.department || '-'}</td>
                                        <td class="text-right">${Formatters.currency(row.bruto)}</td>
                                        <td class="text-right">${Formatters.currency(row.afp)}</td>
                                        <td class="text-right">${Formatters.currency(row.salud)}</td>
                                        <td class="text-right">${Formatters.currency(row.cesantia)}</td>
                                        <td class="text-right" style="font-weight: 600;">${Formatters.currency(row.liquido)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr style="font-weight: 700; background: var(--neutral-100);">
                                    <td colspan="2">TOTALES</td>
                                    <td class="text-right">${Formatters.currency(totals.bruto)}</td>
                                    <td class="text-right">${Formatters.currency(totals.afp)}</td>
                                    <td class="text-right">${Formatters.currency(totals.salud)}</td>
                                    <td class="text-right">${Formatters.currency(totals.cesantia)}</td>
                                    <td class="text-right">${Formatters.currency(totals.liquido)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        `;

        Toast.success('Nómina calculada');
    },

    async initProvisions() {
        await this.calculateProvisions();

        document.getElementById('btn-calculate-provisions')?.addEventListener('click', async () => {
            await this.calculateProvisions();
            Toast.success('Provisiones recalculadas');
        });
    },

    async calculateProvisions() {
        const company = CompanyService.getCurrent();
        const employees = await DB.getByIndex('employees', 'companyId', company.id);
        const activeEmployees = employees.filter(e => e.status === 'active');

        const today = new Date();

        const provisionsData = activeEmployees.map(emp => {
            const startDate = new Date(emp.startDate);
            const monthsWorked = Math.floor((today - startDate) / (1000 * 60 * 60 * 24 * 30));
            const yearsWorked = monthsWorked / 12;

            // Provisión vacaciones: 15 días por año / 12 meses * sueldo diario
            const dailySalary = emp.salary / 30;
            const vacationDays = (15 / 12) * monthsWorked;
            const vacationProvision = Math.round(vacationDays * dailySalary);

            // Provisión indemnización: 1 mes por año (tope 11 años)
            const severanceYears = Math.min(yearsWorked, 11);
            const severanceProvision = Math.round(severanceYears * emp.salary);

            return {
                name: emp.name,
                department: emp.department,
                monthsWorked,
                salary: emp.salary,
                vacationProvision,
                severanceProvision,
                total: vacationProvision + severanceProvision
            };
        });

        const totals = {
            vacation: Helpers.sumBy(provisionsData, 'vacationProvision'),
            severance: Helpers.sumBy(provisionsData, 'severanceProvision'),
            total: Helpers.sumBy(provisionsData, 'total')
        };

        document.getElementById('vacation-provision').textContent = Formatters.currency(totals.vacation);
        document.getElementById('severance-provision').textContent = Formatters.currency(totals.severance);
        document.getElementById('total-provision').textContent = Formatters.currency(totals.total);

        DataTable.create('provisions-table', {
            columns: [
                { key: 'name', label: 'Empleado' },
                { key: 'department', label: 'Departamento' },
                { key: 'monthsWorked', label: 'Meses', class: 'text-right' },
                { key: 'salary', label: 'Sueldo', format: 'currency', class: 'text-right' },
                { key: 'vacationProvision', label: 'Prov. Vacaciones', format: 'currency', class: 'text-right' },
                { key: 'severanceProvision', label: 'Prov. Indemnización', format: 'currency', class: 'text-right' },
                { key: 'total', label: 'Total', format: 'currency', class: 'text-right' }
            ],
            data: provisionsData,
            emptyMessage: 'No hay empleados para calcular provisiones'
        });
    }
};

window.RRHHModule = RRHHModule;
