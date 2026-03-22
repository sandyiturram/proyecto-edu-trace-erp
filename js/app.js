/**
 * ============================================================================
 * EDU-TRACE ERP – Sistema de Gestión Empresarial (ERP) Educativo con Trazabilidad Pedagógica Integrada
 * ============================================================================
 * 
 * Copyright (c) 2025 Sandy Iturra Mena
 * Universidad de Valparaíso - Escuela de Auditoría
 * Todos los derechos reservados.
 * 
 * AUTORA: Sandy Iturra Mena
 * 
 * Este software está protegido por la Ley N° 17.336 sobre Propiedad
 * Intelectual de Chile. Uso autorizado exclusivamente para fines
 * educativos dentro de la Escuela de Auditoría de la Universidad
 * de Valparaíso.
 * 
 * ============================================================================
 * EDU-TRACE ERP - Main Application
 * Orquestador principal de la aplicación
 * ============================================================================
 */

const App = {
    currentModule: 'dashboard',
    currentView: null,
    isInitialized: false,

    /**
     * Módulos disponibles y sus submódulos
     */
    modules: {
        'dashboard': {
            title: 'Dashboard',
            icon: 'fa-tachometer-alt',
            handler: DashboardModule
        },
        'contabilidad': {
            title: 'Contabilidad General',
            icon: 'fa-book',
            handler: ContabilidadModule,
            views: {
                'plan-cuentas': 'Plan de Cuentas',
                'asientos': 'Asientos Contables',
                'libro-mayor': 'Libro Mayor',
                'libro-diario': 'Libro Diario',
                'libros-auxiliares': 'Libros Auxiliares'
            }
        },
        'compras': {
            title: 'Compras',
            icon: 'fa-shopping-cart',
            handler: ComprasModule,
            views: {
                'proveedores': 'Proveedores',
                'ordenes-compra': 'Órdenes de Compra',
                'facturas-proveedor': 'Facturas Proveedor'
            }
        },
        'ventas': {
            title: 'Ventas',
            icon: 'fa-store',
            handler: VentasModule,
            views: {
                'clientes': 'Clientes',
                'pedidos-venta': 'Pedidos de Venta',
                'facturas-cliente': 'Facturas de Venta'
            }
        },
        'inventario': {
            title: 'Inventario',
            icon: 'fa-boxes',
            handler: InventarioModule,
            views: {
                'productos': 'Productos',
                'movimientos-stock': 'Movimientos',
                'valoracion': 'Valorización'
            }
        },
        'tesoreria': {
            title: 'Tesorería',
            icon: 'fa-coins',
            handler: TesoreriaModule,
            views: {
                'cuentas-pagar': 'Control de Pagos',
                'cuentas-cobrar': 'Control de Cobros',
                'bancos': 'Bancos',
                'conciliacion': 'Conciliación'
            }
        },
        'costos': {
            title: 'Costos',
            icon: 'fa-calculator',
            handler: CostosModule,
            disabled: true,  // ETAPA 2 - Deshabilitado temporalmente
            stage: 2,
            views: {
                'centros-costo': 'Centros de Costo',
                'ordenes-internas': 'Órdenes Internas',
                'analisis-costos': 'Análisis de Costos'
            }
        },
        'rrhh': {
            title: 'Recursos Humanos',
            icon: 'fa-users',
            handler: RRHHModule,
            disabled: true,  // ETAPA 2 - Deshabilitado temporalmente
            stage: 2,
            views: {
                'empleados': 'Empleados',
                'nomina': 'Nómina',
                'provisiones': 'Provisiones'
            }
        },
        'reportes': {
            title: 'Reportes',
            icon: 'fa-chart-bar',
            handler: ReportesModule,
            views: {
                'balance-general': 'Balance General',
                'balance-comprobacion': 'Balance de Comprobación',
                'estado-resultados': 'Estado de Resultados',
                'ratios-financieros': 'Ratios Financieros',
                'flujo-caja': 'Flujo de Caja',
                'analisis-cuentas': 'Análisis de Cuentas'
            }
        },
        'trazabilidad': {
            title: 'Trazabilidad Pedagógica',
            icon: 'fa-route',
            handler: TrazabilidadModule,
            disabled: true,  // ETAPA 2 - Deshabilitado temporalmente
            stage: 2,
            views: {
                'overview': 'Vista General',
                'trace-document': 'Trazar Documento',
                'flow-diagrams': 'Diagramas de Flujo',
                'validations': 'Validaciones',
                'progress': 'Progreso del Ejercicio'
            }
        },
        'admin': {
            title: 'Administración',
            icon: 'fa-cog',
            handler: AdminModule,
            views: {
                'empresas': 'Empresas',
                'import-export': 'Importar/Exportar',
                'configuracion': 'Configuración'
            }
        }
    },

    /**
     * Inicializa la aplicación
     */
    async init() {
        console.log('🚀 Iniciando EDU-TRACE ERP...');

        try {
            // Inicializar base de datos
            await DB.init();
            console.log('✅ Base de datos inicializada');

            // Inicializar componentes UI
            Toast.init();
            Modal.init();
            console.log('✅ Componentes UI inicializados');

            // Cargar empresa guardada
            await CompanyService.loadSavedCompany();
            console.log('✅ Empresa cargada');

            // Configurar navegación
            this.setupNavigation();
            this.setupSidebar();
            this.setupHeaderActions();
            this.setupTheme();

            // Ocultar pantalla de carga
            this.hideLoading();

            // Navegar a la vista inicial
            const hash = window.location.hash.slice(1);
            if (hash) {
                const parts = hash.split('/');
                this.navigate(parts[0] || 'dashboard', parts[1]);
            } else {
                this.navigate('dashboard');
            }

            this.isInitialized = true;
            console.log('✅ EDU-TRACE ERP iniciado correctamente');

        } catch (error) {
            console.error('❌ Error al iniciar:', error);
            this.showError('Error al iniciar la aplicación: ' + error.message);
        }
    },

    /**
     * Oculta la pantalla de carga y muestra la app
     */
    hideLoading() {
        const loading = document.getElementById('loading-screen');
        const app = document.getElementById('app');

        if (loading) {
            loading.classList.add('hidden');
            loading.style.opacity = '0';
            setTimeout(() => {
                loading.style.display = 'none';
            }, 300);
        }

        if (app) {
            app.classList.remove('hidden');
        }
    },

    /**
     * Configura la navegación
     */
    setupNavigation() {
        // Navegación por hash
        window.addEventListener('hashchange', () => {
            const hash = window.location.hash.slice(1);
            const parts = hash.split('/');
            this.navigate(parts[0] || 'dashboard', parts[1], false);
        });

        // Click en items de navegación
        document.querySelectorAll('.nav-item[data-module]').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const module = item.dataset.module;
                const view = item.dataset.view;
                this.navigate(module, view);
            });
        });

        // Click en submenús
        document.querySelectorAll('.submenu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const module = item.closest('.nav-item').dataset.module;
                const view = item.dataset.view;
                this.navigate(module, view);
            });
        });
    },

    /**
     * Configura el sidebar
     */
    setupSidebar() {
        // Toggle collapse
        const toggleBtn = document.getElementById('sidebar-toggle');
        const sidebar = document.getElementById('sidebar');

        toggleBtn?.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
        });

        // Restaurar estado
        if (localStorage.getItem('sidebar-collapsed') === 'true') {
            sidebar?.classList.add('collapsed');
        }

        // Toggle submenús
        document.querySelectorAll('.nav-item.has-submenu > a').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const navItem = item.closest('.nav-item');
                const wasExpanded = navItem.classList.contains('expanded');

                // Cerrar otros
                document.querySelectorAll('.nav-item.expanded').forEach(other => {
                    if (other !== navItem) other.classList.remove('expanded');
                });

                navItem.classList.toggle('expanded', !wasExpanded);
            });
        });

        // Selector de empresa
        const companyBtn = document.getElementById('company-selector');
        companyBtn?.addEventListener('click', () => this.showCompanySelector());
    },

    /**
     * Configura acciones del header
     */
    setupHeaderActions() {
        // Toggle tema
        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        // Entrada rápida
        document.getElementById('btn-quick-entry')?.addEventListener('click', () => {
            this.showQuickEntry();
        });

        // Notificaciones
        document.getElementById('notifications-btn')?.addEventListener('click', () => {
            this.showNotifications();
        });

        // Ayuda
        document.getElementById('help-btn')?.addEventListener('click', () => {
            this.showHelp();
        });

        // Dropdown de exportación
        const exportToggle = document.getElementById('export-dropdown-toggle');
        const exportDropdown = document.getElementById('export-dropdown');

        exportToggle?.addEventListener('click', (e) => {
            e.stopPropagation();
            exportDropdown?.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            exportDropdown?.classList.remove('show');
        });

        // Acciones de exportación
        document.querySelectorAll('[data-export]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const format = btn.dataset.export;
                await this.exportCurrentView(format);
            });
        });
    },

    /**
     * Configura el tema claro/oscuro
     */
    setupTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeIcon(savedTheme);
    },

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        this.updateThemeIcon(newTheme);
    },

    updateThemeIcon(theme) {
        const icon = document.querySelector('#theme-toggle i');
        if (icon) {
            icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        }
    },

    /**
     * Navega a un módulo/vista
     */
    async navigate(moduleName, viewName = null, updateHash = true) {
        const module = this.modules[moduleName];
        if (!module) {
            console.warn(`Módulo ${moduleName} no encontrado`);
            return;
        }

        // Verificar si el módulo está deshabilitado
        if (module.disabled) {
            Toast.info(`El módulo "${module.title}" estará disponible en la Etapa ${module.stage || 2}. ¡Próximamente!`);
            console.log(`⏳ Módulo ${moduleName} deshabilitado (Etapa ${module.stage})`);
            return;
        }

        // Actualizar hash sin trigger
        if (updateHash) {
            const hash = viewName ? `${moduleName}/${viewName}` : moduleName;
            history.pushState(null, '', `#${hash}`);
        }

        // Actualizar estado
        this.currentModule = moduleName;
        this.currentView = viewName;

        // Actualizar UI de navegación
        this.updateNavigation(moduleName, viewName);
        this.updateBreadcrumbs(module.title, viewName ? module.views?.[viewName] : null);

        // Renderizar contenido
        const contentWrapper = document.getElementById('content-wrapper');
        if (contentWrapper && module.handler) {
            try {
                contentWrapper.innerHTML = '<div class="loading-content"><div class="spinner"></div></div>';

                const html = await module.handler.render(viewName);
                contentWrapper.innerHTML = html;

                // Inicializar módulo
                if (module.handler.init) {
                    await module.handler.init(viewName);
                }

                // Inicializar gráficos si es dashboard
                if (moduleName === 'dashboard' && module.handler.initCharts) {
                    module.handler.initCharts();
                }

                // Vincular eventos
                if (module.handler.bindEvents) {
                    module.handler.bindEvents();
                }

            } catch (error) {
                console.error('Error al renderizar:', error);
                contentWrapper.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-exclamation-circle" style="color: var(--error-500);"></i>
                        <h3>Error al cargar</h3>
                        <p>${error.message}</p>
                        <button class="btn btn-primary" onclick="App.navigate('dashboard')">
                            Volver al Dashboard
                        </button>
                    </div>
                `;
            }
        }
    },

    /**
     * Actualiza la navegación activa
     */
    updateNavigation(moduleName, viewName) {
        // Remover activos
        document.querySelectorAll('.nav-item.active').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.submenu-item.active').forEach(el => el.classList.remove('active'));

        // Activar módulo
        const navItem = document.querySelector(`.nav-item[data-module="${moduleName}"]`);
        if (navItem) {
            navItem.classList.add('active');

            // Si tiene submenú, expandir y activar vista
            if (viewName && navItem.classList.contains('has-submenu')) {
                navItem.classList.add('expanded');
                const submenuItem = navItem.querySelector(`.submenu-item[data-view="${viewName}"]`);
                submenuItem?.classList.add('active');
            }
        }
    },

    /**
     * Actualiza los breadcrumbs
     */
    updateBreadcrumbs(moduleTitle, viewTitle) {
        const breadcrumbs = document.getElementById('breadcrumbs');
        if (!breadcrumbs) return;

        let html = '<a href="#dashboard" class="breadcrumb-item">Inicio</a>';

        if (moduleTitle && moduleTitle !== 'Dashboard') {
            html += `<span class="breadcrumb-separator">/</span>`;
            html += `<span class="breadcrumb-item">${moduleTitle}</span>`;
        }

        if (viewTitle) {
            html += `<span class="breadcrumb-separator">/</span>`;
            html += `<span class="breadcrumb-item active">${viewTitle}</span>`;
        }

        breadcrumbs.innerHTML = html;
    },

    /**
     * Muestra selector de empresa
     */
    async showCompanySelector() {
        const companies = await CompanyService.getAll();
        const current = CompanyService.getCurrent();

        if (companies.length === 0) {
            DashboardModule.showCreateCompanyModal();
            return;
        }

        Modal.open({
            title: 'Seleccionar Empresa',
            size: 'medium',
            content: `
                <div class="company-list">
                    ${companies.map(c => `
                        <div class="company-option ${c.id === current?.id ? 'active' : ''}" data-id="${c.id}">
                            <div class="avatar">${c.name.charAt(0).toUpperCase()}</div>
                            <div class="company-info">
                                <div class="company-name">${c.name}</div>
                                <div class="company-rut">${c.rut || 'Sin RUT'}</div>
                            </div>
                            ${c.id === current?.id ? '<i class="fas fa-check-circle" style="color: var(--success-500);"></i>' : ''}
                        </div>
                    `).join('')}
                </div>
            `,
            footer: `
                <button class="btn btn-outline" onclick="Modal.close(); DashboardModule.showCreateCompanyModal();">
                    <i class="fas fa-plus"></i> Nueva Empresa
                </button>
            `
        });

        // Bind click
        document.querySelectorAll('.company-option').forEach(opt => {
            opt.addEventListener('click', async () => {
                await CompanyService.setCurrent(opt.dataset.id);
                Modal.close();
                this.navigate('dashboard');
                Toast.success('Empresa seleccionada');
            });
        });
    },

    /**
     * Exporta la vista actual o datos de la empresa
     */
    async exportCurrentView(format) {
        const company = CompanyService.getCurrent();
        if (!company) {
            Toast.warning('Selecciona una empresa primero');
            return;
        }

        const loading = Toast.loading(`Exportando a ${format.toUpperCase()}...`);

        try {
            switch (format) {
                case 'json':
                    // Exportar backup completo
                    const backupData = await CompanyService.exportData();
                    await ExportService.toJSON(backupData, `${company.name}_backup_${Helpers.getCurrentDate()}`);
                    loading.success('Backup JSON descargado');
                    break;

                case 'excel':
                    // Exportar datos principales a Excel
                    await this.exportToExcel(company);
                    loading.success('Excel descargado');
                    break;

                case 'csv':
                    // Exportar vista actual a CSV
                    await this.exportToCSV(company);
                    loading.success('CSV descargado');
                    break;

                case 'pdf':
                    // Generar reporte PDF según módulo actual
                    await this.exportToPDF(company);
                    loading.success('PDF descargado');
                    break;

                default:
                    loading.error('Formato no soportado');
            }
        } catch (err) {
            console.error('Error al exportar:', err);
            loading.error('Error al exportar: ' + err.message);
        }
    },

    /**
     * Exporta datos a Excel con múltiples hojas incluyendo estados financieros
     */
    async exportToExcel(company) {
        const wb = XLSX.utils.book_new();

        // Identificar cuentas que han tenido movimientos
        const activeIds = new Set();
        if (company) {
            const entries = await DB.getByIndex('journalEntries', 'companyId', company.id);
            const postedEntries = entries.filter(e => e.status === 'posted');
            for (const e of postedEntries) {
                const lines = await DB.getByIndex('journalLines', 'entryId', e.id);
                if (lines) lines.forEach(l => activeIds.add(l.accountId));
            }
        }

        // === 1. BALANCE GENERAL ===
        try {
            const balanceData = await AccountingService.getBalanceSheet(Helpers.getCurrentDate());
            const balanceRows = [];

            // Encabezado
            balanceRows.push({ 'Concepto': 'BALANCE GENERAL', 'Monto': '' });
            balanceRows.push({ 'Concepto': `Al ${Formatters.date(balanceData.date || new Date())}`, 'Monto': '' });
            balanceRows.push({ 'Concepto': '', 'Monto': '' });

            // Activos
            balanceRows.push({ 'Concepto': 'ACTIVOS', 'Monto': '' });
            if (balanceData.assets?.items) {
                balanceData.assets.items.forEach(item => {
                    if (item.balance !== 0 || activeIds.has(item.id)) {
                        balanceRows.push({ 'Concepto': `  ${item.name}`, 'Monto': item.balance });
                    }
                });
            }
            balanceRows.push({ 'Concepto': 'Total Activos', 'Monto': balanceData.assets?.total || 0 });
            balanceRows.push({ 'Concepto': '', 'Monto': '' });

            // Pasivos
            balanceRows.push({ 'Concepto': 'PASIVOS', 'Monto': '' });
            if (balanceData.liabilities?.items) {
                balanceData.liabilities.items.forEach(item => {
                    if (item.balance !== 0 || activeIds.has(item.id)) {
                        balanceRows.push({ 'Concepto': `  ${item.name}`, 'Monto': item.balance });
                    }
                });
            }
            balanceRows.push({ 'Concepto': 'Total Pasivos', 'Monto': balanceData.liabilities?.total || 0 });
            balanceRows.push({ 'Concepto': '', 'Monto': '' });

            // Patrimonio
            balanceRows.push({ 'Concepto': 'PATRIMONIO', 'Monto': '' });
            if (balanceData.equity?.items) {
                balanceData.equity.items.forEach(item => {
                    if (item.balance !== 0 || activeIds.has(item.id)) {
                        balanceRows.push({ 'Concepto': `  ${item.name}`, 'Monto': item.balance });
                    }
                });
            }
            if (balanceData.netIncome) {
                balanceRows.push({ 'Concepto': '  Resultado del Ejercicio', 'Monto': balanceData.netIncome });
            }
            balanceRows.push({ 'Concepto': 'Total Patrimonio', 'Monto': (balanceData.equity?.total || 0) + (balanceData.netIncome || 0) });

            const wsBalance = XLSX.utils.json_to_sheet(balanceRows);
            wsBalance['!cols'] = [{ wch: 40 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(wb, wsBalance, 'Balance General');
        } catch (e) {
            console.log('No se pudo generar Balance:', e);
        }

        // === 2. ESTADO DE RESULTADOS ===
        try {
            const incomeData = await AccountingService.getIncomeStatement(
                Helpers.getFirstDayOfYear(),
                Helpers.getCurrentDate()
            );
            const incomeRows = [];

            incomeRows.push({ 'Concepto': 'ESTADO DE RESULTADOS', 'Monto': '' });
            incomeRows.push({ 'Concepto': `Del ${Formatters.date(incomeData.dateFrom)} al ${Formatters.date(incomeData.dateTo)}`, 'Monto': '' });
            incomeRows.push({ 'Concepto': '', 'Monto': '' });

            // Ingresos
            incomeRows.push({ 'Concepto': 'INGRESOS OPERACIONALES', 'Monto': '' });
            if (incomeData.revenue?.items) {
                incomeData.revenue.items.forEach(item => {
                    if (item.balance !== 0) {
                        incomeRows.push({ 'Concepto': `  ${item.name}`, 'Monto': Math.abs(item.balance) });
                    }
                });
            }
            incomeRows.push({ 'Concepto': 'Total Ingresos', 'Monto': incomeData.revenue?.total || 0 });
            incomeRows.push({ 'Concepto': '', 'Monto': '' });

            // Costos
            incomeRows.push({ 'Concepto': 'COSTOS DE VENTA', 'Monto': '' });
            if (incomeData.costOfSales?.items) {
                incomeData.costOfSales.items.forEach(item => {
                    if (item.balance !== 0) {
                        incomeRows.push({ 'Concepto': `  ${item.name}`, 'Monto': Math.abs(item.balance) });
                    }
                });
            }
            incomeRows.push({ 'Concepto': 'Total Costos', 'Monto': incomeData.costOfSales?.total || 0 });
            incomeRows.push({ 'Concepto': '', 'Monto': '' });

            incomeRows.push({ 'Concepto': 'MARGEN BRUTO', 'Monto': incomeData.grossMargin || 0 });
            incomeRows.push({ 'Concepto': '', 'Monto': '' });

            // Gastos
            incomeRows.push({ 'Concepto': 'GASTOS OPERACIONALES', 'Monto': '' });
            if (incomeData.expenses?.items) {
                incomeData.expenses.items.forEach(item => {
                    if (item.balance !== 0) {
                        incomeRows.push({ 'Concepto': `  ${item.name}`, 'Monto': Math.abs(item.balance) });
                    }
                });
            }
            incomeRows.push({ 'Concepto': 'Total Gastos', 'Monto': incomeData.expenses?.total || 0 });
            incomeRows.push({ 'Concepto': '', 'Monto': '' });

            incomeRows.push({ 'Concepto': 'RESULTADO OPERACIONAL', 'Monto': incomeData.operatingIncome || 0 });
            incomeRows.push({ 'Concepto': 'RESULTADO DEL EJERCICIO', 'Monto': incomeData.netIncome || 0 });

            const wsIncome = XLSX.utils.json_to_sheet(incomeRows);
            wsIncome['!cols'] = [{ wch: 40 }, { wch: 20 }];
            XLSX.utils.book_append_sheet(wb, wsIncome, 'Estado Resultados');
        } catch (e) {
            console.log('No se pudo generar Estado de Resultados:', e);
        }

        // === 3. ASIENTOS CONTABLES ===
        try {
            const entries = await DB.getByIndex('journalEntries', 'companyId', company.id);
            if (entries.length > 0) {
                const entryRows = [];

                for (const entry of entries) {
                    const lines = await AccountingService.getJournalLines(entry.id);

                    for (const line of lines) {
                        const account = await AccountingService.getAccount(line.accountId);
                        entryRows.push({
                            'Número': entry.number,
                            'Fecha': entry.date,
                            'Descripción': entry.description,
                            'Cuenta': account ? `${account.code} - ${account.name}` : line.accountId,
                            'Detalle Línea': line.description || '',
                            'Debe': line.debit || 0,
                            'Haber': line.credit || 0,
                            'Estado': entry.status === 'posted' ? 'Contabilizado' : entry.status === 'draft' ? 'Borrador' : 'Anulado'
                        });
                    }
                    // Línea en blanco entre asientos
                    entryRows.push({});
                }

                const wsEntries = XLSX.utils.json_to_sheet(entryRows);
                wsEntries['!cols'] = [
                    { wch: 12 }, { wch: 12 }, { wch: 30 },
                    { wch: 35 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
                ];
                XLSX.utils.book_append_sheet(wb, wsEntries, 'Asientos Contables');
            }
        } catch (e) {
            console.log('No se pudieron exportar asientos:', e);
        }

        // === 4. PLAN DE CUENTAS ===
        const accounts = await DB.getByIndex('accounts', 'companyId', company.id);
        if (accounts.length > 0) {
            const wsAccounts = XLSX.utils.json_to_sheet(accounts.map(a => ({
                'Código': a.code,
                'Nombre': a.name,
                'Tipo': a.type === 'asset' ? 'Activo' :
                    a.type === 'liability' ? 'Pasivo' :
                        a.type === 'equity' ? 'Patrimonio' :
                            a.type === 'revenue' ? 'Ingreso' : 'Gasto',
                'Es Grupo': a.isGroup ? 'Sí' : 'No',
                'Saldo': a.balance || 0,
                'Activa': a.isActive ? 'Sí' : 'No'
            })));
            wsAccounts['!cols'] = [{ wch: 12 }, { wch: 40 }, { wch: 12 }, { wch: 10 }, { wch: 15 }, { wch: 8 }];
            XLSX.utils.book_append_sheet(wb, wsAccounts, 'Plan de Cuentas');
        }

        // === 5. PROVEEDORES ===
        const suppliers = await DB.getByIndex('suppliers', 'companyId', company.id);
        if (suppliers.length > 0) {
            const wsSuppliers = XLSX.utils.json_to_sheet(suppliers.map(s => ({
                'RUT': s.rut,
                'Razón Social': s.name,
                'Contacto': s.contact || '',
                'Email': s.email || '',
                'Teléfono': s.phone || '',
                'Dirección': s.address || ''
            })));
            XLSX.utils.book_append_sheet(wb, wsSuppliers, 'Proveedores');
        }

        // === 6. CLIENTES ===
        const customers = await DB.getByIndex('customers', 'companyId', company.id);
        if (customers.length > 0) {
            const wsCustomers = XLSX.utils.json_to_sheet(customers.map(c => ({
                'RUT': c.rut,
                'Razón Social': c.name,
                'Contacto': c.contact || '',
                'Email': c.email || '',
                'Teléfono': c.phone || '',
                'Límite Crédito': c.creditLimit || 0
            })));
            XLSX.utils.book_append_sheet(wb, wsCustomers, 'Clientes');
        }

        // === 7. PRODUCTOS ===
        const products = await DB.getByIndex('products', 'companyId', company.id);
        if (products.length > 0) {
            const wsProducts = XLSX.utils.json_to_sheet(products.map(p => ({
                'Código': p.code,
                'Nombre': p.name,
                'Categoría': p.category || '',
                'Unidad': p.unit || 'UN',
                'Costo': p.cost || 0,
                'Precio Venta': p.price || 0,
                'Stock': p.stock || 0,
                'Valor Inventario': (p.stock || 0) * (p.cost || 0)
            })));
            XLSX.utils.book_append_sheet(wb, wsProducts, 'Productos');
        }

        // === 8. EMPLEADOS ===
        const employees = await DB.getByIndex('employees', 'companyId', company.id);
        if (employees.length > 0) {
            const wsEmployees = XLSX.utils.json_to_sheet(employees.map(e => ({
                'RUT': e.rut,
                'Nombre': e.name,
                'Cargo': e.position || '',
                'Departamento': e.department || '',
                'Sueldo Base': e.baseSalary || 0,
                'Fecha Ingreso': e.hireDate || ''
            })));
            XLSX.utils.book_append_sheet(wb, wsEmployees, 'Empleados');
        }

        // Descargar usando método nativo
        const fullFilename = `${company.name}_ERP_Completo_${Helpers.getCurrentDate()}.xlsx`;
        XLSX.writeFile(wb, fullFilename);
    },

    /**
     * Exporta datos a CSV
     */
    async exportToCSV(company) {
        // Según el módulo actual, exportar los datos relevantes
        let data = [];
        let filename = `${company.name}_export`;
        let headers = [];

        switch (this.currentModule) {
            case 'contabilidad':
                data = await DB.getByIndex('accounts', 'companyId', company.id);
                headers = [
                    { key: 'code', label: 'Código' },
                    { key: 'name', label: 'Nombre' },
                    { key: 'type', label: 'Tipo' },
                    { key: 'balance', label: 'Saldo' }
                ];
                filename = `${company.name}_plan_cuentas`;
                break;

            case 'compras':
                data = await DB.getByIndex('suppliers', 'companyId', company.id);
                headers = [
                    { key: 'rut', label: 'RUT' },
                    { key: 'name', label: 'Nombre' },
                    { key: 'email', label: 'Email' },
                    { key: 'phone', label: 'Teléfono' }
                ];
                filename = `${company.name}_proveedores`;
                break;

            case 'ventas':
                data = await DB.getByIndex('customers', 'companyId', company.id);
                headers = [
                    { key: 'rut', label: 'RUT' },
                    { key: 'name', label: 'Nombre' },
                    { key: 'email', label: 'Email' },
                    { key: 'creditLimit', label: 'Límite Crédito' }
                ];
                filename = `${company.name}_clientes`;
                break;

            case 'inventario':
                data = await DB.getByIndex('products', 'companyId', company.id);
                headers = [
                    { key: 'code', label: 'Código' },
                    { key: 'name', label: 'Nombre' },
                    { key: 'stock', label: 'Stock' },
                    { key: 'cost', label: 'Costo' },
                    { key: 'price', label: 'Precio' }
                ];
                filename = `${company.name}_productos`;
                break;

            default:
                // Exportar plan de cuentas por defecto
                data = await DB.getByIndex('accounts', 'companyId', company.id);
                headers = [
                    { key: 'code', label: 'Código' },
                    { key: 'name', label: 'Nombre' },
                    { key: 'type', label: 'Tipo' },
                    { key: 'balance', label: 'Saldo' }
                ];
                filename = `${company.name}_datos`;
        }

        await ExportService.toCSV(data, filename, { headers });
    },

    /**
     * Exporta a PDF según el módulo actual
     */
    async exportToPDF(company) {
        switch (this.currentModule) {
            case 'reportes':
                if (this.currentView === 'balance-general') {
                    const balance = await AccountingService.generateBalanceSheet();
                    await ExportService.balanceSheetPDF(balance, company.name);
                } else {
                    await this.generateGenericPDF(company, 'Reporte');
                }
                break;

            default:
                await this.generateGenericPDF(company, 'Datos');
        }
    },

    /**
     * Genera un PDF genérico con datos del módulo actual
     */
    async generateGenericPDF(company, title) {
        let data = [];
        let headers = [];
        let reportTitle = title;

        switch (this.currentModule) {
            case 'contabilidad':
                data = await DB.getByIndex('accounts', 'companyId', company.id);
                data = data.filter(a => !a.isGroup);
                headers = [
                    { key: 'code', label: 'Código' },
                    { key: 'name', label: 'Nombre' },
                    { key: 'type', label: 'Tipo' },
                    { key: 'balance', label: 'Saldo', format: 'currency' }
                ];
                reportTitle = 'Plan de Cuentas';
                break;

            case 'compras':
                data = await DB.getByIndex('suppliers', 'companyId', company.id);
                headers = [
                    { key: 'rut', label: 'RUT' },
                    { key: 'name', label: 'Razón Social' },
                    { key: 'email', label: 'Email' },
                    { key: 'phone', label: 'Teléfono' }
                ];
                reportTitle = 'Listado de Proveedores';
                break;

            case 'ventas':
                data = await DB.getByIndex('customers', 'companyId', company.id);
                headers = [
                    { key: 'rut', label: 'RUT' },
                    { key: 'name', label: 'Cliente' },
                    { key: 'email', label: 'Email' },
                    { key: 'creditLimit', label: 'Límite Crédito', format: 'currency' }
                ];
                reportTitle = 'Listado de Clientes';
                break;

            case 'inventario':
                data = await DB.getByIndex('products', 'companyId', company.id);
                headers = [
                    { key: 'code', label: 'Código' },
                    { key: 'name', label: 'Producto' },
                    { key: 'stock', label: 'Stock', format: 'number' },
                    { key: 'cost', label: 'Costo', format: 'currency' },
                    { key: 'price', label: 'Precio', format: 'currency' }
                ];
                reportTitle = 'Listado de Productos';
                break;

            case 'rrhh':
                data = await DB.getByIndex('employees', 'companyId', company.id);
                headers = [
                    { key: 'rut', label: 'RUT' },
                    { key: 'name', label: 'Nombre' },
                    { key: 'position', label: 'Cargo' },
                    { key: 'baseSalary', label: 'Sueldo', format: 'currency' }
                ];
                reportTitle = 'Listado de Empleados';
                break;

            default:
                data = await DB.getByIndex('accounts', 'companyId', company.id);
                headers = [
                    { key: 'code', label: 'Código' },
                    { key: 'name', label: 'Nombre' },
                    { key: 'balance', label: 'Saldo', format: 'currency' }
                ];
                reportTitle = 'Datos de la Empresa';
        }

        await ExportService.toPDF(data, `${company.name}_${this.currentModule}`, {
            title: reportTitle,
            subtitle: company.name,
            headers,
            companyName: company.name
        });
    },

    /**
     * Muestra ayuda
     */
    showHelp() {
        HelpSystem.show();
    },

    /**
     * Muestra error
     */
    showError(message) {
        const loading = document.getElementById('loading-screen');
        if (loading) {
            loading.innerHTML = `
                <div style="text-align: center; color: var(--error-500);">
                    <i class="fas fa-exclamation-circle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                    <h2>Error</h2>
                    <p>${message}</p>
                    <button class="btn btn-primary" onclick="location.reload()">Reintentar</button>
                </div>
            `;
        }
    },

    /**
     * Muestra panel de notificaciones
     */
    showNotifications() {
        const company = CompanyService.getCurrent();

        // Generar notificaciones de ejemplo basadas en datos reales
        const notifications = [
            {
                type: 'info',
                icon: 'fa-info-circle',
                title: 'Bienvenido a EDU-TRACE ERP',
                message: 'Sistema listo para usar',
                time: 'Ahora'
            }
        ];

        if (company) {
            notifications.push({
                type: 'success',
                icon: 'fa-building',
                title: 'Empresa activa',
                message: `Trabajando con ${company.name}`,
                time: 'Ahora'
            });
        } else {
            notifications.push({
                type: 'warning',
                icon: 'fa-exclamation-triangle',
                title: 'Sin empresa',
                message: 'Crea o selecciona una empresa para comenzar',
                time: 'Ahora',
                action: 'crear-empresa'
            });
        }

        Modal.open({
            title: '<i class="fas fa-bell"></i> Notificaciones',
            size: 'medium',
            content: `
                <div class="notifications-list">
                    ${notifications.length === 0 ? `
                        <div class="empty-state" style="padding: var(--space-6);">
                            <i class="fas fa-bell-slash" style="font-size: 2rem; color: var(--text-tertiary);"></i>
                            <p>No hay notificaciones</p>
                        </div>
                    ` : notifications.map(n => `
                        <div class="notification-item ${n.type}" ${n.action ? `data-action="${n.action}"` : ''}>
                            <div class="notification-icon">
                                <i class="fas ${n.icon}"></i>
                            </div>
                            <div class="notification-content">
                                <div class="notification-title">${n.title}</div>
                                <div class="notification-message">${n.message}</div>
                            </div>
                            <div class="notification-time">${n.time}</div>
                        </div>
                    `).join('')}
                </div>
            `,
            footer: `
                <button class="btn btn-outline" onclick="Modal.close()">Cerrar</button>
            `
        });

        // Bind actions
        document.querySelectorAll('.notification-item[data-action]').forEach(item => {
            item.style.cursor = 'pointer';
            item.addEventListener('click', () => {
                Modal.close();
                if (item.dataset.action === 'crear-empresa') {
                    DashboardModule.showCreateCompanyModal();
                }
            });
        });
    },

    /**
     * Muestra modal de entrada rápida
     */
    showQuickEntry() {
        const company = CompanyService.getCurrent();
        if (!company) {
            Toast.warning('Selecciona una empresa primero');
            return;
        }

        Modal.open({
            title: '<i class="fas fa-bolt"></i> Entrada Rápida',
            size: 'medium',
            content: `
                <div class="quick-entry-grid">
                    <div class="quick-entry-item" data-action="asiento">
                        <div class="quick-entry-icon" style="background: linear-gradient(135deg, #0a6ed1, #064280);">
                            <i class="fas fa-file-invoice"></i>
                        </div>
                        <span>Nuevo Asiento</span>
                    </div>
                    <div class="quick-entry-item" data-action="factura-venta">
                        <div class="quick-entry-icon" style="background: linear-gradient(135deg, #107e3e, #0d6630);">
                            <i class="fas fa-file-invoice-dollar"></i>
                        </div>
                        <span>Factura de Venta</span>
                    </div>
                    <div class="quick-entry-item" data-action="factura-compra">
                        <div class="quick-entry-icon" style="background: linear-gradient(135deg, #df6e0c, #c45f0a);">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <span>Factura de Compra</span>
                    </div>
                    <div class="quick-entry-item" data-action="pago">
                        <div class="quick-entry-icon" style="background: linear-gradient(135deg, #6c5ce7, #5f3dc4);">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                        <span>Registrar Pago</span>
                    </div>
                    <div class="quick-entry-item" data-action="cliente">
                        <div class="quick-entry-icon" style="background: linear-gradient(135deg, #00b894, #00a187);">
                            <i class="fas fa-user-plus"></i>
                        </div>
                        <span>Nuevo Cliente</span>
                    </div>
                    <div class="quick-entry-item" data-action="proveedor">
                        <div class="quick-entry-icon" style="background: linear-gradient(135deg, #e17055, #d35400);">
                            <i class="fas fa-truck"></i>
                        </div>
                        <span>Nuevo Proveedor</span>
                    </div>
                    <div class="quick-entry-item" data-action="producto">
                        <div class="quick-entry-icon" style="background: linear-gradient(135deg, #00cec9, #00b5ad);">
                            <i class="fas fa-box"></i>
                        </div>
                        <span>Nuevo Producto</span>
                    </div>
                    <div class="quick-entry-item" data-action="empleado">
                        <div class="quick-entry-icon" style="background: linear-gradient(135deg, #fd79a8, #e84393);">
                            <i class="fas fa-user-tie"></i>
                        </div>
                        <span>Nuevo Empleado</span>
                    </div>
                </div>
            `,
            footer: ''
        });

        // Bind actions
        document.querySelectorAll('.quick-entry-item').forEach(item => {
            item.addEventListener('click', () => {
                Modal.close();
                const action = item.dataset.action;

                switch (action) {
                    case 'asiento':
                        this.navigate('contabilidad', 'asientos');
                        break;
                    case 'factura-venta':
                        this.navigate('ventas', 'facturas-cliente');
                        break;
                    case 'factura-compra':
                        this.navigate('compras', 'facturas-proveedor');
                        break;
                    case 'pago':
                        this.navigate('tesoreria', 'bancos');
                        break;
                    case 'cliente':
                        this.navigate('ventas', 'clientes');
                        setTimeout(() => {
                            if (typeof VentasModule !== 'undefined' && VentasModule.showCustomerModal) {
                                VentasModule.showCustomerModal();
                            }
                        }, 300);
                        break;
                    case 'proveedor':
                        this.navigate('compras', 'proveedores');
                        setTimeout(() => {
                            if (typeof ComprasModule !== 'undefined' && ComprasModule.showSupplierModal) {
                                ComprasModule.showSupplierModal();
                            }
                        }, 300);
                        break;
                    case 'producto':
                        this.navigate('inventario', 'productos');
                        setTimeout(() => {
                            if (typeof InventarioModule !== 'undefined' && InventarioModule.showProductModal) {
                                InventarioModule.showProductModal();
                            }
                        }, 300);
                        break;
                    case 'empleado':
                        this.navigate('rrhh', 'empleados');
                        setTimeout(() => {
                            if (typeof RRHHModule !== 'undefined' && RRHHModule.showEmployeeModal) {
                                RRHHModule.showEmployeeModal();
                            }
                        }, 300);
                        break;
                }
            });
        });
    }
};

// Estilos adicionales para el selector de empresa y nuevos componentes
const appStyles = document.createElement('style');
appStyles.textContent = `
    .company-list { display: flex; flex-direction: column; gap: var(--space-2); }
    .company-option { display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); border-radius: var(--radius-lg); cursor: pointer; transition: all var(--transition-fast); border: 2px solid transparent; }
    .company-option:hover { background: var(--neutral-50); }
    .company-option.active { background: var(--primary-50); border-color: var(--primary-500); }
    .company-info { flex: 1; }
    .company-name { font-weight: 600; }
    .company-rut { font-size: var(--font-size-xs); color: var(--text-tertiary); }
    .loading-content { display: flex; justify-content: center; align-items: center; min-height: 300px; }
    
    /* Notifications */
    .notifications-list { display: flex; flex-direction: column; gap: var(--space-2); }
    .notification-item { display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-3); border-radius: var(--radius-md); background: var(--neutral-50); transition: all var(--transition-fast); }
    .notification-item:hover { background: var(--neutral-100); }
    .notification-icon { width: 36px; height: 36px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .notification-item.info .notification-icon { background: var(--info-100); color: var(--info-500); }
    .notification-item.success .notification-icon { background: var(--success-100); color: var(--success-500); }
    .notification-item.warning .notification-icon { background: var(--warning-100); color: var(--warning-500); }
    .notification-item.error .notification-icon { background: var(--error-100); color: var(--error-500); }
    .notification-content { flex: 1; min-width: 0; }
    .notification-title { font-weight: 600; font-size: var(--font-size-sm); margin-bottom: var(--space-1); }
    .notification-message { font-size: var(--font-size-xs); color: var(--text-secondary); }
    .notification-time { font-size: var(--font-size-xs); color: var(--text-tertiary); white-space: nowrap; }
    
    /* Quick Entry Grid */
    .quick-entry-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-3); }
    .quick-entry-item { display: flex; flex-direction: column; align-items: center; gap: var(--space-2); padding: var(--space-4); border-radius: var(--radius-lg); cursor: pointer; transition: all var(--transition-fast); text-align: center; }
    .quick-entry-item:hover { background: var(--neutral-50); transform: translateY(-2px); }
    .quick-entry-icon { width: 48px; height: 48px; border-radius: var(--radius-lg); display: flex; align-items: center; justify-content: center; color: white; font-size: var(--font-size-xl); }
    .quick-entry-item span { font-size: var(--font-size-xs); color: var(--text-secondary); font-weight: 500; }
    
    @media (max-width: 600px) {
        .quick-entry-grid { grid-template-columns: repeat(2, 1fr); }
    }
`;
document.head.appendChild(appStyles);

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => App.init());

// Hacer disponible globalmente
window.App = App;
