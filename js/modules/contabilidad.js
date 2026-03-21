/**
 * EduERP - Contabilidad Module
 * Módulo de Contabilidad General (GL)
 */

const ContabilidadModule = {
    currentView: 'plan-cuentas',
    table: null,

    /**
     * Renderiza el módulo según la vista
     */
    async render(view = 'plan-cuentas') {
        this.currentView = view;

        switch (view) {
            case 'plan-cuentas':
                return await this.renderChartOfAccounts();
            case 'asientos':
                return await this.renderJournalEntries();
            case 'libro-mayor':
                return await this.renderLedger();
            case 'libro-diario':
                return await this.renderJournal();
            case 'libros-auxiliares':
                return await this.renderAuxiliaryJournals();
            default:
                return '<p>Vista no encontrada</p>';
        }
    },

    /**
     * Renderiza Plan de Cuentas
     */
    async renderChartOfAccounts() {
        const accounts = await AccountingService.getChartOfAccounts();

        return `
            <div class="page-header">
                <h1 class="page-title">Plan de Cuentas</h1>
                <p class="page-subtitle">Estructura contable según normativa IFRS</p>
            </div>
            
            <div class="toolbar">
                <div class="toolbar-left">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" class="form-control" placeholder="Buscar cuenta..." id="search-accounts">
                    </div>
                    <select class="form-control" id="filter-type" style="width: 150px;">
                        <option value="">Todos los tipos</option>
                        <option value="asset">Activos</option>
                        <option value="liability">Pasivos</option>
                        <option value="equity">Patrimonio</option>
                        <option value="revenue">Ingresos</option>
                        <option value="expense">Gastos</option>
                    </select>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-outline" id="btn-recalculate-balances" title="Recalcula los saldos de todas las cuentas basándose en los asientos contables">
                        <i class="fas fa-sync-alt"></i> Recalcular Saldos
                    </button>
                    <button class="btn btn-outline" id="btn-expand-all">
                        <i class="fas fa-expand-alt"></i> Expandir
                    </button>
                    <button class="btn btn-primary" id="btn-new-account">
                        <i class="fas fa-plus"></i> Nueva Cuenta
                    </button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body" style="padding: 0;">
                    <div id="accounts-tree" class="accounts-tree">
                        ${this.renderAccountsTree(accounts)}
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza árbol de cuentas
     */
    renderAccountsTree(accounts, parentId = null, level = 0) {
        const children = accounts.filter(a => a.parentId === parentId);
        if (children.length === 0) return '';

        const typeLabels = {
            asset: 'Activo', liability: 'Pasivo', equity: 'Patrimonio',
            revenue: 'Ingreso', expense: 'Gasto'
        };

        const typeColors = {
            asset: 'primary', liability: 'error', equity: 'success',
            revenue: 'success', expense: 'warning'
        };

        return children.map(account => {
            const hasChildren = accounts.some(a => a.parentId === account.id);
            const indent = level * 24;

            return `
                <div class="account-row level-${level}" data-account-id="${account.id}" style="padding-left: ${indent + 16}px;">
                    <div class="account-info">
                        ${hasChildren ? `
                            <button class="tree-toggle" data-toggle="${account.id}">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        ` : '<span style="width: 24px;"></span>'}
                        <span class="account-code">${account.code}</span>
                        <span class="account-name ${account.isGroup ? 'is-group' : ''}">${account.name}</span>
                        ${account.isContra ? '<span class="badge badge-neutral">Contra</span>' : ''}
                    </div>
                    <div class="account-meta">
                        <span class="badge badge-${typeColors[account.type]}">${typeLabels[account.type]}</span>
                        ${!account.isGroup ? `
                            <span class="account-balance ${account.balance >= 0 ? 'positive' : 'negative'}">
                                ${Formatters.currency(Math.abs(account.balance))}
                            </span>
                        ` : ''}
                        <div class="account-actions">
                            <button class="btn btn-icon btn-ghost" title="Ver movimientos" data-action="ledger" data-id="${account.id}">
                                <i class="fas fa-list"></i>
                            </button>
                            <button class="btn btn-icon btn-ghost" title="Editar" data-action="edit" data-id="${account.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="account-children" data-parent="${account.id}" style="display: none;">
                    ${this.renderAccountsTree(accounts, account.id, level + 1)}
                </div>
            `;
        }).join('');
    },

    /**
     * Renderiza Asientos Contables
     */
    async renderJournalEntries() {
        return `
            <div class="page-header">
                <h1 class="page-title">Asientos Contables</h1>
                <p class="page-subtitle">Registro de operaciones contables</p>
            </div>
            
            <div class="toolbar">
                <div class="toolbar-left">
                    <input type="date" class="form-control" id="filter-date-from" style="width: 150px;" placeholder="Desde">
                    <input type="date" class="form-control" id="filter-date-to" style="width: 150px;" placeholder="Hasta">
                    <select class="form-control" id="filter-status" style="width: 150px;">
                        <option value="">Todos los estados</option>
                        <option value="draft">Borrador</option>
                        <option value="posted">Contabilizado</option>
                        <option value="cancelled">Anulado</option>
                    </select>
                    <button class="btn btn-ghost" id="btn-clear-filters" title="Limpiar filtros">
                        <i class="fas fa-times"></i> Limpiar
                    </button>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-outline" id="btn-export-entries">
                        <i class="fas fa-download"></i> Exportar
                    </button>
                    <button class="btn btn-primary" id="btn-new-entry">
                        <i class="fas fa-plus"></i> Nuevo Asiento
                    </button>
                </div>
            </div>
            
            <div id="entries-table"></div>
        `;
    },

    /**
     * Renderiza Libro Mayor
     */
    async renderLedger() {
        const accounts = await AccountingService.getMovementAccounts();

        return `
            <div class="page-header">
                <h1 class="page-title">Libro Mayor</h1>
                <p class="page-subtitle">Movimientos por cuenta contable</p>
            </div>
            
            <div class="toolbar">
                <div class="toolbar-left">
                    <select class="form-control" id="ledger-account" style="width: 300px;">
                        <option value="">Seleccione una cuenta...</option>
                        ${accounts.map(a => `<option value="${a.id}">${a.code} - ${a.name}</option>`).join('')}
                    </select>
                    <input type="date" class="form-control" id="ledger-from" style="width: 150px;">
                    <input type="date" class="form-control" id="ledger-to" style="width: 150px;">
                    <button class="btn btn-primary" id="btn-view-ledger">
                        <i class="fas fa-search"></i> Consultar
                    </button>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-outline" id="btn-export-ledger">
                        <i class="fas fa-download"></i> Exportar
                    </button>
                </div>
            </div>
            
            <div id="ledger-content">
                <div class="empty-state">
                    <i class="fas fa-book"></i>
                    <h3>Seleccione una cuenta</h3>
                    <p>Elija una cuenta contable para ver sus movimientos</p>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza Libro Diario
     */
    async renderJournal() {
        return `
            <div class="page-header">
                <h1 class="page-title">Libro Diario</h1>
                <p class="page-subtitle">Registro cronológico de transacciones</p>
            </div>
            
            <div class="toolbar">
                <div class="toolbar-left">
                    <input type="date" class="form-control" id="journal-from" style="width: 150px;">
                    <input type="date" class="form-control" id="journal-to" style="width: 150px;">
                    <button class="btn btn-primary" id="btn-view-journal">
                        <i class="fas fa-search"></i> Consultar
                    </button>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-outline" id="btn-export-journal-excel">
                        <i class="fas fa-file-excel"></i> Excel
                    </button>
                    <button class="btn btn-outline" id="btn-export-journal-pdf">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                    <button class="btn btn-outline" id="btn-print-journal">
                        <i class="fas fa-print"></i> Imprimir
                    </button>
                </div>
            </div>
            
            <div id="journal-content"></div>
        `;
    },

    /**
     * Inicializa después de renderizar
     */
    async init(view) {
        switch (view) {
            case 'plan-cuentas':
                this.initChartOfAccounts();
                break;
            case 'asientos':
                await this.initJournalEntries();
                break;
            case 'libro-mayor':
                this.initLedger();
                break;
            case 'libro-diario':
                this.initJournal();
                break;
            case 'libros-auxiliares':
                await this.initAuxiliaryJournals();
                break;
        }
    },

    /**
     * Inicializa Plan de Cuentas
     */
    initChartOfAccounts() {
        // Toggle árbol
        document.querySelectorAll('.tree-toggle').forEach(btn => {
            btn.onclick = () => {
                const id = btn.dataset.toggle;
                const children = document.querySelector(`[data-parent="${id}"]`);
                const icon = btn.querySelector('i');

                if (children.style.display === 'none') {
                    children.style.display = 'block';
                    icon.classList.replace('fa-chevron-right', 'fa-chevron-down');
                } else {
                    children.style.display = 'none';
                    icon.classList.replace('fa-chevron-down', 'fa-chevron-right');
                }
            };
        });

        // Expandir todo
        document.getElementById('btn-expand-all')?.addEventListener('click', () => {
            document.querySelectorAll('.account-children').forEach(el => el.style.display = 'block');
            document.querySelectorAll('.tree-toggle i').forEach(i => i.classList.replace('fa-chevron-right', 'fa-chevron-down'));
        });

        // Búsqueda
        document.getElementById('search-accounts')?.addEventListener('input', Helpers.debounce((e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('.account-row').forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(term) ? 'flex' : 'none';
                if (text.includes(term)) {
                    // Mostrar padres
                    let parent = row.parentElement;
                    while (parent && parent.classList.contains('account-children')) {
                        parent.style.display = 'block';
                        parent = parent.parentElement;
                    }
                }
            });
        }, 300));

        // Filtro por tipo
        document.getElementById('filter-type')?.addEventListener('change', async (e) => {
            const type = e.target.value;
            if (!type) {
                // Mostrar todo
                document.querySelectorAll('.account-row').forEach(row => row.style.display = 'flex');
                document.querySelectorAll('.account-children').forEach(el => el.style.display = 'none');
            } else {
                const typeMap = {
                    'asset': 'Activo', 'liability': 'Pasivo', 'equity': 'Patrimonio',
                    'revenue': 'Ingreso', 'expense': 'Gasto'
                };
                const typeLabel = typeMap[type];
                document.querySelectorAll('.account-row').forEach(row => {
                    const badge = row.querySelector('.badge');
                    const matchesType = badge && badge.textContent === typeLabel;
                    row.style.display = matchesType ? 'flex' : 'none';
                    if (matchesType) {
                        let parent = row.parentElement;
                        while (parent && parent.classList.contains('account-children')) {
                            parent.style.display = 'block';
                            parent = parent.parentElement;
                        }
                    }
                });
            }
        });

        // Nueva cuenta
        document.getElementById('btn-new-account')?.addEventListener('click', () => {
            this.showAccountModal();
        });

        // Recalcular saldos
        document.getElementById('btn-recalculate-balances')?.addEventListener('click', async () => {
            const confirm = await Modal.confirm({
                title: 'Recalcular Saldos de Cuentas',
                message: `¿Desea recalcular todos los saldos de las cuentas contables?

Esto procesará todos los asientos contabilizados y actualizará los saldos de las cuentas según los movimientos registrados.

<strong>Útil cuando:</strong>
• Se importaron datos históricos
• Se detectan inconsistencias en los saldos
• Se realizaron correcciones directas en la base de datos`,
                confirmText: 'Recalcular',
                confirmClass: 'btn-primary'
            });

            if (!confirm) return;

            const loading = Toast.loading('Recalculando saldos...');

            try {
                const result = await AccountingService.recalculateAccountBalances();

                if (result.linesProcessed === 0) {
                    loading.error(`No se procesaron líneas de asientos. Asientos encontrados: ${result.entriesProcessed}. Ver consola (F12) para más detalles.`);
                } else {
                    loading.success(`Saldos recalculados: ${result.accountsUpdated} cuentas, ${result.entriesProcessed} asientos, ${result.linesProcessed} líneas`);
                }

                // Recargar la vista para mostrar los nuevos saldos
                App.navigate('contabilidad', 'plan-cuentas');
            } catch (err) {
                loading.error('Error: ' + err.message);
            }
        });

        // Acciones
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.onclick = () => {
                const action = btn.dataset.action;
                const id = btn.dataset.id;
                if (action === 'edit') this.showAccountModal(id);
                if (action === 'ledger') App.navigate('contabilidad', 'libro-mayor');
            };
        });
    },

    /**
     * Inicializa Asientos Contables
     */
    async initJournalEntries() {
        const entries = await AccountingService.getJournalEntries();

        // Cargar líneas para cada asiento
        for (let entry of entries) {
            entry.lines = await AccountingService.getJournalLines(entry.id);
        }

        // Guardar referencia a los datos originales para filtrado
        this.allEntries = entries;

        this.table = DataTable.create('entries-table', {
            columns: [
                { key: 'number', label: 'Número', sortable: true },
                { key: 'date', label: 'Fecha', format: 'date', sortable: true },
                { key: 'description', label: 'Descripción' },
                { key: 'totalDebit', label: 'Debe', format: 'currency', class: 'text-right' },
                { key: 'totalCredit', label: 'Haber', format: 'currency', class: 'text-right' },
                { key: 'status', label: 'Estado', format: 'status' }
            ],
            data: entries,
            actions: [
                { name: 'view', label: 'Ver detalle', icon: 'fas fa-eye', handler: (row) => this.showEntryDetail(row) },
                { name: 'post', label: 'Contabilizar', icon: 'fas fa-check', handler: (row) => this.postEntry(row) },
                { name: 'cancel', label: 'Anular', icon: 'fas fa-times', handler: (row) => this.cancelEntry(row) }
            ],
            emptyMessage: 'No hay asientos contables',
            onRowClick: (row) => this.showEntryDetail(row)
        });

        // Función para aplicar filtros
        const applyFilters = () => {
            const dateFrom = document.getElementById('filter-date-from')?.value;
            const dateTo = document.getElementById('filter-date-to')?.value;
            const status = document.getElementById('filter-status')?.value;

            let filtered = [...this.allEntries];

            // Filtrar por fecha desde
            if (dateFrom) {
                filtered = filtered.filter(e => e.date >= dateFrom);
            }

            // Filtrar por fecha hasta
            if (dateTo) {
                filtered = filtered.filter(e => e.date <= dateTo);
            }

            // Filtrar por estado
            if (status) {
                filtered = filtered.filter(e => e.status === status);
            }

            // Actualizar la tabla usando el método refresh o directamente DataTable.setData
            if (this.table && this.table.refresh) {
                this.table.refresh(filtered);
            } else {
                DataTable.setData('entries-table', filtered);
            }
        };

        // Event listeners para filtros
        document.getElementById('filter-date-from')?.addEventListener('change', applyFilters);
        document.getElementById('filter-date-to')?.addEventListener('change', applyFilters);
        document.getElementById('filter-status')?.addEventListener('change', applyFilters);

        // Limpiar filtros
        document.getElementById('btn-clear-filters')?.addEventListener('click', () => {
            document.getElementById('filter-date-from').value = '';
            document.getElementById('filter-date-to').value = '';
            document.getElementById('filter-status').value = '';
            applyFilters();
        });

        // Nuevo asiento
        document.getElementById('btn-new-entry')?.addEventListener('click', () => {
            this.showEntryModal();
        });

        // Exportar con detalle completo
        document.getElementById('btn-export-entries')?.addEventListener('click', async () => {
            const loading = Toast.loading('Generando Excel con detalle...');

            try {
                // Preparar datos expandidos con líneas de cada asiento
                const exportRows = [];

                for (const entry of entries) {
                    // Cargar líneas si no están cargadas
                    let lines = entry.lines;
                    if (!lines || lines.length === 0) {
                        lines = await AccountingService.getJournalLines(entry.id);
                    }

                    // Fila de encabezado del asiento
                    exportRows.push({
                        'Asiento': entry.number,
                        'Fecha': entry.date,
                        'Referencia': entry.reference || '',
                        'Estado': entry.status === 'posted' ? 'Contabilizado' :
                            entry.status === 'draft' ? 'Borrador' : 'Anulado',
                        'Código': '',
                        'Cuenta': '',
                        'Descripción': entry.description,
                        'Debe': '',
                        'Haber': ''
                    });

                    // Filas de líneas del asiento
                    for (const line of lines) {
                        const account = await AccountingService.getAccount(line.accountId);
                        exportRows.push({
                            'Asiento': '',
                            'Fecha': '',
                            'Referencia': '',
                            'Estado': '',
                            'Código': account?.code || '',
                            'Cuenta': account?.name || '',
                            'Descripción': line.description || '',
                            'Debe': line.debit > 0 ? line.debit : '',
                            'Haber': line.credit > 0 ? line.credit : ''
                        });
                    }

                    // Fila de totales
                    const totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
                    const totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
                    exportRows.push({
                        'Asiento': '',
                        'Fecha': '',
                        'Referencia': '',
                        'Estado': '',
                        'Código': '',
                        'Cuenta': '',
                        'Descripción': 'TOTALES',
                        'Debe': totalDebit,
                        'Haber': totalCredit
                    });

                    // Fila vacía entre asientos
                    exportRows.push({
                        'Asiento': '', 'Fecha': '', 'Referencia': '', 'Estado': '',
                        'Código': '', 'Cuenta': '', 'Descripción': '', 'Debe': '', 'Haber': ''
                    });
                }

                // Crear workbook con SheetJS
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.json_to_sheet(exportRows);

                // Ajustar anchos de columnas
                ws['!cols'] = [
                    { wch: 15 }, // Asiento
                    { wch: 12 }, // Fecha
                    { wch: 15 }, // Referencia
                    { wch: 12 }, // Estado
                    { wch: 10 }, // Código
                    { wch: 25 }, // Cuenta
                    { wch: 40 }, // Descripción
                    { wch: 15 }, // Debe
                    { wch: 15 }  // Haber
                ];

                XLSX.utils.book_append_sheet(wb, ws, 'Libro Diario');
                XLSX.writeFile(wb, `libro_diario_${Helpers.getCurrentDate()}.xlsx`);

                loading.success('Excel exportado correctamente');
            } catch (err) {
                loading.error('Error: ' + err.message);
            }
        });
    },

    /**
     * Inicializa Libro Mayor
     */
    initLedger() {
        // Variable para guardar los datos actuales del libro mayor
        this.currentLedgerData = null;

        document.getElementById('btn-view-ledger')?.addEventListener('click', async () => {
            const accountId = document.getElementById('ledger-account').value;
            if (!accountId) {
                Toast.warning('Seleccione una cuenta');
                return;
            }

            const dateFrom = document.getElementById('ledger-from').value;
            const dateTo = document.getElementById('ledger-to').value;

            const movements = await AccountingService.getLedger(accountId, dateFrom, dateTo);
            const account = await AccountingService.getAccount(accountId);

            // Guardar datos para exportación
            this.currentLedgerData = { account, movements, dateFrom, dateTo };

            this.renderLedgerContent(account, movements);
        });

        document.getElementById('btn-export-ledger')?.addEventListener('click', async () => {
            if (!this.currentLedgerData) {
                Toast.warning('Primero consulte una cuenta');
                return;
            }

            const { account, movements, dateFrom, dateTo } = this.currentLedgerData;
            const loading = Toast.loading('Generando Excel...');

            try {
                // Calcular saldos
                let balance = 0;
                const isDebitNature = ['asset', 'expense'].includes(account.type);

                const exportRows = [];

                // Encabezado con información de la cuenta
                exportRows.push({
                    'Fecha': 'LIBRO MAYOR',
                    'Asiento': '',
                    'Descripción': account.code + ' - ' + account.name,
                    'Debe': '',
                    'Haber': '',
                    'Saldo': ''
                });

                if (dateFrom || dateTo) {
                    exportRows.push({
                        'Fecha': 'Período:',
                        'Asiento': '',
                        'Descripción': `${dateFrom || 'Inicio'} al ${dateTo || 'Hoy'}`,
                        'Debe': '',
                        'Haber': '',
                        'Saldo': ''
                    });
                }

                // Fila vacía
                exportRows.push({ 'Fecha': '', 'Asiento': '', 'Descripción': '', 'Debe': '', 'Haber': '', 'Saldo': '' });

                // Encabezados
                exportRows.push({
                    'Fecha': 'Fecha',
                    'Asiento': 'Asiento',
                    'Descripción': 'Descripción',
                    'Debe': 'Debe',
                    'Haber': 'Haber',
                    'Saldo': 'Saldo'
                });

                // Movimientos
                for (const mov of movements) {
                    if (isDebitNature) {
                        balance += (mov.debit || 0) - (mov.credit || 0);
                    } else {
                        balance += (mov.credit || 0) - (mov.debit || 0);
                    }

                    exportRows.push({
                        'Fecha': mov.date,
                        'Asiento': mov.entryNumber || '',
                        'Descripción': mov.description || '',
                        'Debe': mov.debit > 0 ? mov.debit : '',
                        'Haber': mov.credit > 0 ? mov.credit : '',
                        'Saldo': balance
                    });
                }

                // Totales
                const totalDebit = movements.reduce((sum, m) => sum + (m.debit || 0), 0);
                const totalCredit = movements.reduce((sum, m) => sum + (m.credit || 0), 0);

                exportRows.push({ 'Fecha': '', 'Asiento': '', 'Descripción': '', 'Debe': '', 'Haber': '', 'Saldo': '' });
                exportRows.push({
                    'Fecha': '',
                    'Asiento': '',
                    'Descripción': 'TOTALES',
                    'Debe': totalDebit,
                    'Haber': totalCredit,
                    'Saldo': balance
                });

                // Crear workbook
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.json_to_sheet(exportRows, { skipHeader: true });

                // Ajustar anchos
                ws['!cols'] = [
                    { wch: 12 }, // Fecha
                    { wch: 15 }, // Asiento
                    { wch: 40 }, // Descripción
                    { wch: 15 }, // Debe
                    { wch: 15 }, // Haber
                    { wch: 15 }  // Saldo
                ];

                XLSX.utils.book_append_sheet(wb, ws, 'Libro Mayor');
                XLSX.writeFile(wb, `libro_mayor_${account.code}_${Helpers.getCurrentDate()}.xlsx`);

                loading.success('Excel exportado correctamente');
            } catch (err) {
                loading.error('Error: ' + err.message);
            }
        });
    },

    /**
     * Renderiza contenido del libro mayor
     */
    renderLedgerContent(account, movements) {
        let balance = 0;
        const isDebitNature = ['asset', 'expense'].includes(account.type);

        const content = document.getElementById('ledger-content');
        content.innerHTML = `
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-list"></i>
                        ${account.code} - ${account.name}
                    </div>
                    <span class="badge badge-primary">${movements.length} movimientos</span>
                </div>
                <div class="card-body" style="padding: 0;">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Asiento</th>
                                    <th>Descripción</th>
                                    <th class="text-right">Debe</th>
                                    <th class="text-right">Haber</th>
                                    <th class="text-right">Saldo</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${movements.length === 0 ? `
                                    <tr><td colspan="6" class="table-empty">Sin movimientos en el período</td></tr>
                                ` : movements.map(m => {
            balance += isDebitNature ? (m.debit - m.credit) : (m.credit - m.debit);
            return `
                                        <tr>
                                            <td>${Formatters.date(m.date)}</td>
                                            <td>${m.entryNumber}</td>
                                            <td>${m.description}</td>
                                            <td class="text-right">${m.debit > 0 ? Formatters.currency(m.debit) : '-'}</td>
                                            <td class="text-right">${m.credit > 0 ? Formatters.currency(m.credit) : '-'}</td>
                                            <td class="text-right ${balance >= 0 ? 'positive' : 'negative'}">${Formatters.currency(balance)}</td>
                                        </tr>
                                    `;
        }).join('')}
                            </tbody>
                            <tfoot>
                                <tr style="font-weight: 600; background: var(--neutral-100);">
                                    <td colspan="3">TOTALES</td>
                                    <td class="text-right">${Formatters.currency(Helpers.sumBy(movements, 'debit'))}</td>
                                    <td class="text-right">${Formatters.currency(Helpers.sumBy(movements, 'credit'))}</td>
                                    <td class="text-right">${Formatters.currency(balance)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    /**
     * Inicializa Libro Diario
     */
    initJournal() {
        // Variable para guardar los datos del libro diario
        this.currentJournalData = null;

        document.getElementById('btn-view-journal')?.addEventListener('click', async () => {
            const dateFrom = document.getElementById('journal-from').value;
            const dateTo = document.getElementById('journal-to').value;

            const entries = await AccountingService.getJournalEntries({
                status: 'posted',
                dateFrom,
                dateTo
            });

            // Cargar líneas para cada asiento
            for (let entry of entries) {
                entry.lines = await AccountingService.getJournalLines(entry.id);
                // Cargar nombres de cuentas para cada línea
                for (let line of entry.lines) {
                    const account = await AccountingService.getAccount(line.accountId);
                    line.accountCode = account?.code || '';
                    line.accountName = account?.name || '';
                }
            }

            // Guardar datos para exportación
            this.currentJournalData = { entries, dateFrom, dateTo };

            this.renderJournalContent(entries);
        });

        // Exportar a Excel
        document.getElementById('btn-export-journal-excel')?.addEventListener('click', async () => {
            if (!this.currentJournalData) {
                Toast.warning('Primero consulte el libro diario');
                return;
            }

            const { entries, dateFrom, dateTo } = this.currentJournalData;
            const loading = Toast.loading('Generando Excel...');

            try {
                const exportRows = [];

                for (const entry of entries) {
                    // Fila del asiento
                    exportRows.push({
                        'Fecha': entry.date,
                        'Asiento': entry.number,
                        'Referencia': entry.reference || '',
                        'Código': '',
                        'Cuenta': '',
                        'Descripción': entry.description,
                        'Debe': '',
                        'Haber': ''
                    });

                    // Líneas del asiento
                    for (const line of entry.lines || []) {
                        exportRows.push({
                            'Fecha': '',
                            'Asiento': '',
                            'Referencia': '',
                            'Código': line.accountCode,
                            'Cuenta': line.accountName,
                            'Descripción': line.description || '',
                            'Debe': line.debit > 0 ? line.debit : '',
                            'Haber': line.credit > 0 ? line.credit : ''
                        });
                    }

                    // Totales
                    const totalDebit = (entry.lines || []).reduce((s, l) => s + (l.debit || 0), 0);
                    const totalCredit = (entry.lines || []).reduce((s, l) => s + (l.credit || 0), 0);
                    exportRows.push({
                        'Fecha': '', 'Asiento': '', 'Referencia': '', 'Código': '', 'Cuenta': '',
                        'Descripción': 'TOTALES',
                        'Debe': totalDebit,
                        'Haber': totalCredit
                    });

                    // Línea vacía
                    exportRows.push({ 'Fecha': '', 'Asiento': '', 'Referencia': '', 'Código': '', 'Cuenta': '', 'Descripción': '', 'Debe': '', 'Haber': '' });
                }

                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.json_to_sheet(exportRows);
                ws['!cols'] = [
                    { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
                    { wch: 25 }, { wch: 40 }, { wch: 15 }, { wch: 15 }
                ];

                XLSX.utils.book_append_sheet(wb, ws, 'Libro Diario');
                XLSX.writeFile(wb, `libro_diario_${Helpers.getCurrentDate()}.xlsx`);

                loading.success('Excel exportado correctamente');
            } catch (err) {
                loading.error('Error: ' + err.message);
            }
        });

        // Exportar a PDF
        document.getElementById('btn-export-journal-pdf')?.addEventListener('click', async () => {
            if (!this.currentJournalData) {
                Toast.warning('Primero consulte el libro diario');
                return;
            }

            const { entries, dateFrom, dateTo } = this.currentJournalData;
            const loading = Toast.loading('Generando PDF...');

            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('landscape', 'mm', 'letter');

                // Título
                doc.setFontSize(16);
                doc.text('LIBRO DIARIO', 140, 15, { align: 'center' });
                doc.setFontSize(10);
                const company = CompanyService.getCurrent();
                doc.text(company?.name || '', 140, 22, { align: 'center' });
                if (dateFrom || dateTo) {
                    doc.text(`Período: ${dateFrom || 'Inicio'} al ${dateTo || 'Hoy'}`, 140, 28, { align: 'center' });
                }

                // Preparar datos para autoTable
                const tableData = [];
                for (const entry of entries) {
                    // Fila del asiento
                    tableData.push([
                        entry.date, entry.number, entry.reference || '', '', '', entry.description, '', ''
                    ]);
                    // Líneas
                    for (const line of entry.lines || []) {
                        tableData.push([
                            '', '', '', line.accountCode, line.accountName, line.description || '',
                            line.debit > 0 ? Formatters.number(line.debit, 0) : '',
                            line.credit > 0 ? Formatters.number(line.credit, 0) : ''
                        ]);
                    }
                    // Totales
                    const totalDebit = (entry.lines || []).reduce((s, l) => s + (l.debit || 0), 0);
                    const totalCredit = (entry.lines || []).reduce((s, l) => s + (l.credit || 0), 0);
                    tableData.push(['', '', '', '', '', 'TOTALES', Formatters.number(totalDebit, 0), Formatters.number(totalCredit, 0)]);
                    tableData.push(['', '', '', '', '', '', '', '']);
                }

                doc.autoTable({
                    head: [['Fecha', 'Asiento', 'Ref.', 'Código', 'Cuenta', 'Descripción', 'Debe', 'Haber']],
                    body: tableData,
                    startY: 35,
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [66, 139, 202] }
                });

                doc.save(`libro_diario_${Helpers.getCurrentDate()}.pdf`);
                loading.success('PDF generado correctamente');
            } catch (err) {
                loading.error('Error: ' + err.message);
            }
        });

        // Imprimir
        document.getElementById('btn-print-journal')?.addEventListener('click', () => {
            if (!this.currentJournalData) {
                Toast.warning('Primero consulte el libro diario');
                return;
            }

            const content = document.getElementById('journal-content');
            if (!content) return;

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                <head>
                    <title>Libro Diario</title>
                    <style>
                        body { font-family: Arial, sans-serif; padding: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
                        th { background: #f0f0f0; }
                        .text-right { text-align: right; }
                        h1, h2 { text-align: center; }
                        @media print {
                            button { display: none; }
                        }
                    </style>
                </head>
                <body>
                    <h1>LIBRO DIARIO</h1>
                    <h2>${CompanyService.getCurrent()?.name || ''}</h2>
                    ${content.innerHTML}
                    <script>setTimeout(() => window.print(), 500);<\/script>
                </body>
                </html>
            `);
            printWindow.document.close();
        });
    },

    /**
     * Renderiza contenido del libro diario
     */
    async renderJournalContent(entries) {
        const content = document.getElementById('journal-content');

        if (entries.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <h3>Sin asientos en el período</h3>
                    <p>No hay asientos contabilizados en el rango de fechas seleccionado</p>
                </div>
            `;
            return;
        }

        let html = '<div class="journal-entries">';

        for (const entry of entries) {
            const lines = await AccountingService.getJournalLines(entry.id);

            html += `
                <div class="card" style="margin-bottom: var(--space-4);">
                    <div class="card-header">
                        <div class="card-title">${entry.number}</div>
                        <span>${Formatters.date(entry.date, 'long')}</span>
                    </div>
                    <div class="card-body" style="padding: 0;">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Cuenta</th>
                                    <th>Descripción</th>
                                    <th class="text-right">Debe</th>
                                    <th class="text-right">Haber</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${await Promise.all(lines.map(async line => {
                const account = await AccountingService.getAccount(line.accountId);
                return `
                                        <tr>
                                            <td>${account?.code} - ${account?.name}</td>
                                            <td>${line.description}</td>
                                            <td class="text-right">${line.debit > 0 ? Formatters.currency(line.debit) : ''}</td>
                                            <td class="text-right">${line.credit > 0 ? Formatters.currency(line.credit) : ''}</td>
                                        </tr>
                                    `;
            })).then(rows => rows.join(''))}
                            </tbody>
                            <tfoot>
                                <tr style="font-weight: 600;">
                                    <td colspan="2">${entry.description}</td>
                                    <td class="text-right">${Formatters.currency(entry.totalDebit)}</td>
                                    <td class="text-right">${Formatters.currency(entry.totalCredit)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            `;
        }

        html += '</div>';
        content.innerHTML = html;
    },

    /**
     * Modal para nuevo/editar asiento
     */
    async showEntryModal(entryId = null) {
        const accounts = await AccountingService.getMovementAccounts();
        const isEdit = !!entryId;
        let lines = [{ accountId: '', description: '', debit: 0, credit: 0 }];
        let entryData = { date: Helpers.getCurrentDate(), description: '' };

        if (isEdit) {
            entryData = await DB.get('journalEntries', entryId);
            lines = await AccountingService.getJournalLines(entryId);
        }

        const accountOptions = accounts.map(a =>
            `<option value="${a.id}">${a.code} - ${a.name}</option>`
        ).join('');

        Modal.open({
            title: isEdit ? 'Editar Asiento' : 'Nuevo Asiento Contable',
            size: 'xlarge',
            content: `
                <form id="entry-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label required">Fecha</label>
                            <input type="date" class="form-control" name="date" value="${entryData.date}" required>
                        </div>
                        <div class="form-group" style="flex: 2;">
                            <label class="form-label required">Descripción</label>
                            <input type="text" class="form-control" name="description" value="${entryData.description}" 
                                placeholder="Glosa del asiento" required>
                        </div>
                    </div>
                    
                    <div class="section-title">Detalle del Asiento</div>
                    
                    <div class="table-container">
                        <table class="data-table" id="entry-lines-table">
                            <thead>
                                <tr>
                                    <th style="width: 40%;">Cuenta</th>
                                    <th>Descripción</th>
                                    <th style="width: 120px;">Debe</th>
                                    <th style="width: 120px;">Haber</th>
                                    <th style="width: 50px;"></th>
                                </tr>
                            </thead>
                            <tbody id="entry-lines">
                                ${lines.map((line, idx) => this.renderEntryLine(line, idx, accountOptions)).join('')}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="2">
                                        <button type="button" class="btn btn-ghost btn-sm" id="btn-add-line">
                                            <i class="fas fa-plus"></i> Agregar línea
                                        </button>
                                    </td>
                                    <td class="text-right" id="total-debit" style="font-weight: 600;">$ 0</td>
                                    <td class="text-right" id="total-credit" style="font-weight: 600;">$ 0</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colspan="2"></td>
                                    <td colspan="2" class="text-center" id="balance-status">
                                        <span class="badge badge-warning">Descuadrado</span>
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </form>
            `,
            footer: `
                <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button type="button" class="btn btn-outline" id="btn-save-draft">Guardar Borrador</button>
                <button type="button" class="btn btn-primary" id="btn-save-post">Guardar y Contabilizar</button>
            `
        });

        // Inicializar eventos del modal
        this.initEntryModalEvents(accountOptions);
        this.updateEntryTotals();
    },

    renderEntryLine(line, idx, accountOptions) {
        return `
            <tr class="entry-line" data-idx="${idx}">
                <td>
                    <select class="form-control line-account" name="lines[${idx}][accountId]" required>
                        <option value="">Seleccione...</option>
                        ${accountOptions.replace(`value="${line.accountId}"`, `value="${line.accountId}" selected`)}
                    </select>
                </td>
                <td>
                    <input type="text" class="form-control" name="lines[${idx}][description]" 
                        value="${line.description || ''}" placeholder="Descripción">
                </td>
                <td>
                    <input type="number" class="form-control line-debit text-right" name="lines[${idx}][debit]" 
                        value="${line.debit || 0}" min="0" step="1">
                </td>
                <td>
                    <input type="number" class="form-control line-credit text-right" name="lines[${idx}][credit]" 
                        value="${line.credit || 0}" min="0" step="1">
                </td>
                <td>
                    <button type="button" class="btn btn-icon btn-ghost btn-remove-line" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    },

    initEntryModalEvents(accountOptions) {
        let lineCount = document.querySelectorAll('.entry-line').length;

        // Agregar línea
        document.getElementById('btn-add-line').onclick = () => {
            const tbody = document.getElementById('entry-lines');
            const newRow = document.createElement('tr');
            newRow.className = 'entry-line';
            newRow.dataset.idx = lineCount;
            newRow.innerHTML = this.renderEntryLine({ accountId: '', description: '', debit: 0, credit: 0 }, lineCount, accountOptions)
                .replace(/<tr[^>]*>|<\/tr>/g, '');
            tbody.appendChild(newRow);
            lineCount++;
            this.bindLineEvents();
        };

        this.bindLineEvents();

        // Guardar borrador
        document.getElementById('btn-save-draft').onclick = () => this.saveEntry(false);

        // Guardar y contabilizar
        document.getElementById('btn-save-post').onclick = () => this.saveEntry(true);
    },

    bindLineEvents() {
        // Eliminar línea
        document.querySelectorAll('.btn-remove-line').forEach(btn => {
            btn.onclick = () => {
                if (document.querySelectorAll('.entry-line').length > 1) {
                    btn.closest('tr').remove();
                    this.updateEntryTotals();
                }
            };
        });

        // Actualizar totales al cambiar valores
        document.querySelectorAll('.line-debit, .line-credit').forEach(input => {
            input.oninput = () => this.updateEntryTotals();
        });
    },

    updateEntryTotals() {
        let totalDebit = 0, totalCredit = 0;

        document.querySelectorAll('.line-debit').forEach(input => {
            totalDebit += parseFloat(input.value) || 0;
        });
        document.querySelectorAll('.line-credit').forEach(input => {
            totalCredit += parseFloat(input.value) || 0;
        });

        document.getElementById('total-debit').textContent = Formatters.currency(totalDebit);
        document.getElementById('total-credit').textContent = Formatters.currency(totalCredit);

        const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;
        document.getElementById('balance-status').innerHTML = isBalanced
            ? '<span class="badge badge-success"><i class="fas fa-check"></i> Cuadrado</span>'
            : '<span class="badge badge-warning"><i class="fas fa-exclamation-triangle"></i> Descuadrado</span>';
    },

    async saveEntry(autoPost) {
        const form = document.getElementById('entry-form');
        const formData = new FormData(form);

        const lines = [];
        document.querySelectorAll('.entry-line').forEach(row => {
            const accountId = row.querySelector('.line-account').value;
            const description = row.querySelector('input[name*="description"]').value;
            const debit = parseFloat(row.querySelector('.line-debit').value) || 0;
            const credit = parseFloat(row.querySelector('.line-credit').value) || 0;

            if (accountId && (debit > 0 || credit > 0)) {
                lines.push({ accountId, description, debit, credit });
            }
        });

        if (lines.length < 2) {
            Toast.warning('El asiento debe tener al menos 2 líneas');
            return;
        }

        const loading = Toast.loading('Guardando asiento...');

        try {
            await AccountingService.createJournalEntry({
                date: formData.get('date'),
                description: formData.get('description'),
                lines,
                autoPost
            });

            loading.success(autoPost ? 'Asiento contabilizado' : 'Asiento guardado como borrador');
            Modal.close();
            App.navigate('contabilidad', 'asientos');
        } catch (err) {
            loading.error(err.message);
        }
    },

    async postEntry(entry) {
        if (entry.status !== 'draft') {
            Toast.warning('Solo se pueden contabilizar asientos en borrador');
            return;
        }

        const confirm = await Modal.confirm({
            title: 'Contabilizar Asiento',
            message: `¿Desea contabilizar el asiento ${entry.number}? Esta acción actualizará los saldos de las cuentas.`,
            confirmText: 'Contabilizar',
            confirmClass: 'btn-success'
        });

        if (confirm) {
            try {
                await AccountingService.postJournalEntry(entry.id);
                Toast.success('Asiento contabilizado');
                App.navigate('contabilidad', 'asientos');
            } catch (err) {
                Toast.error(err.message);
            }
        }
    },

    async cancelEntry(entry) {
        if (entry.status === 'cancelled') {
            Toast.warning('El asiento ya está anulado');
            return;
        }

        const confirm = await Modal.confirm({
            title: 'Anular Asiento',
            message: `¿Desea anular el asiento ${entry.number}? ${entry.status === 'posted' ? 'Se revertirán los saldos de las cuentas.' : ''}`,
            confirmText: 'Anular',
            confirmClass: 'btn-danger'
        });

        if (confirm) {
            try {
                await AccountingService.cancelJournalEntry(entry.id, 'Anulación manual');
                Toast.success('Asiento anulado');
                App.navigate('contabilidad', 'asientos');
            } catch (err) {
                Toast.error(err.message);
            }
        }
    },

    async showEntryDetail(entry) {
        // Cargar líneas si no están cargadas
        if (!entry.lines || entry.lines.length === 0) {
            entry.lines = await AccountingService.getJournalLines(entry.id);
        }

        // Cargar nombres de cuentas para cada línea
        const linesWithAccounts = await Promise.all(entry.lines.map(async line => {
            const account = await AccountingService.getAccount(line.accountId);
            return {
                ...line,
                accountCode: account?.code || '',
                accountName: account?.name || 'Cuenta desconocida'
            };
        }));

        const statusLabels = {
            draft: '<span class="badge badge-warning">Borrador</span>',
            posted: '<span class="badge badge-success">Contabilizado</span>',
            cancelled: '<span class="badge badge-error">Anulado</span>'
        };

        Modal.open({
            title: `Asiento ${entry.number}`,
            size: 'large',
            content: `
                <div style="margin-bottom: var(--space-4);">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); margin-bottom: var(--space-4);">
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-tertiary); display: block;">Fecha</label>
                            <strong>${Formatters.date(entry.date, 'long')}</strong>
                        </div>
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-tertiary); display: block;">Estado</label>
                            ${statusLabels[entry.status] || entry.status}
                        </div>
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-tertiary); display: block;">Referencia</label>
                            <strong>${entry.reference || '-'}</strong>
                        </div>
                    </div>
                    <div>
                        <label style="font-size: var(--font-size-xs); color: var(--text-tertiary); display: block;">Descripción</label>
                        <p style="margin: var(--space-1) 0 0; font-weight: 500;">${entry.description}</p>
                    </div>
                </div>
                
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Cuenta</th>
                                <th>Descripción</th>
                                <th class="text-right">Debe</th>
                                <th class="text-right">Haber</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${linesWithAccounts.map(line => `
                                <tr>
                                    <td><code>${line.accountCode}</code></td>
                                    <td>${line.accountName}</td>
                                    <td>${line.description || '-'}</td>
                                    <td class="text-right">${line.debit > 0 ? Formatters.currency(line.debit) : ''}</td>
                                    <td class="text-right">${line.credit > 0 ? Formatters.currency(line.credit) : ''}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr style="font-weight: 600; background: var(--neutral-100);">
                                <td colspan="3">TOTALES</td>
                                <td class="text-right">${Formatters.currency(entry.totalDebit || linesWithAccounts.reduce((s, l) => s + (l.debit || 0), 0))}</td>
                                <td class="text-right">${Formatters.currency(entry.totalCredit || linesWithAccounts.reduce((s, l) => s + (l.credit || 0), 0))}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                
                ${entry.createdAt ? `
                    <div style="margin-top: var(--space-4); font-size: var(--font-size-xs); color: var(--text-tertiary);">
                        Creado: ${Formatters.date(entry.createdAt, 'long')}
                        ${entry.updatedAt ? ` | Actualizado: ${Formatters.date(entry.updatedAt, 'long')}` : ''}
                    </div>
                ` : ''}
            `,
            footer: `
                ${entry.status === 'draft' ? `
                    <button class="btn btn-success" id="btn-post-entry-modal">
                        <i class="fas fa-check"></i> Contabilizar
                    </button>
                ` : ''}
                <button class="btn btn-secondary" onclick="Modal.close()">Cerrar</button>
            `
        });

        // Handler para contabilizar desde el modal
        document.getElementById('btn-post-entry-modal')?.addEventListener('click', async () => {
            Modal.close();
            await this.postEntry(entry);
        });
    },

    async showAccountModal(accountId = null) {
        const isEdit = !!accountId;
        let accountData = {
            code: '',
            name: '',
            type: 'asset',
            nature: 'debit',
            isGroup: false,
            parentId: null
        };

        if (isEdit) {
            accountData = await AccountingService.getAccount(accountId);
        }

        // Obtener cuentas "grupo" para el select de "Cuenta Padre"
        const allAccounts = await AccountingService.getChartOfAccounts();
        const parentOptions = allAccounts
            .filter(a => a.isGroup && a.id !== accountId) // Solo grupos y que no sea ella misma
            .map(a => `<option value="${a.id}" ${accountData.parentId === a.id ? 'selected' : ''}>${a.code} - ${a.name}</option>`)
            .join('');

        const typeOptions = [
            { value: 'asset', label: 'Activo' },
            { value: 'liability', label: 'Pasivo' },
            { value: 'equity', label: 'Patrimonio' },
            { value: 'revenue', label: 'Ingreso' },
            { value: 'expense', label: 'Gasto' }
        ].map(t => `<option value="${t.value}" ${accountData.type === t.value ? 'selected' : ''}>${t.label}</option>`).join('');

        const natureOptions = [
            { value: 'debit', label: 'Deudora' },
            { value: 'credit', label: 'Acreedora' }
        ].map(n => `<option value="${n.value}" ${accountData.nature === n.value ? 'selected' : ''}>${n.label}</option>`).join('');


        Modal.open({
            title: isEdit ? 'Editar Cuenta Contable' : 'Nueva Cuenta Contable',
            size: 'medium',
            content: `
                <div class="educational-help" style="margin-bottom: var(--space-4);">
                    <button class="btn btn-outline" type="button" onclick="document.getElementById('account-help-content').classList.toggle('hidden');" style="width: 100%; display: flex; justify-content: space-between; align-items: center; background: var(--warning-50); border-color: var(--warning-200);">
                        <span><i class="fas fa-lightbulb" style="color: var(--warning-500); margin-right: 8px;"></i> Ayuda Pedagógica: ¿Cómo crear una cuenta?</span>
                        <i class="fas fa-chevron-down" style="color: var(--warning-500);"></i>
                    </button>
                    <div id="account-help-content" class="hidden" style="background: var(--warning-50); border: 1px solid var(--warning-200); border-top: none; padding: var(--space-4); border-bottom-left-radius: var(--radius-md); border-bottom-right-radius: var(--radius-md); font-size: 0.85rem; color: var(--text-secondary);">
                        <p style="margin-bottom: var(--space-2);"><strong>1. Tipo de Cuenta:</strong><br>
                        - <strong style="color: var(--primary-600);">Imputable:</strong> Recibe movimientos y se usa en asientos contables (Ej: "Caja" o "Banco").<br>
                        - <strong style="color: var(--primary-600);">Agrupadora:</strong> Es una "carpeta" que suma el saldo de sus cuentas hijas. Nunca se usa en asientos (Ej: "Activo Corriente").</p>
                        
                        <p style="margin-bottom: var(--space-2);"><strong>2. Naturaleza y Clasificación:</strong><br>
                        - Las cuentas de <strong style="color: var(--primary-600);">Activo y Gasto</strong> generalmente son de naturaleza <strong>Deudora</strong> (Aumentan por el Debe, disminuyen por el Haber).<br>
                        - Las cuentas de <strong style="color: var(--primary-600);">Pasivo, Patrimonio e Ingreso</strong> generalmente son de naturaleza <strong>Acreedora</strong> (Aumentan por el Haber, disminuyen por el Debe).</p>
                        
                        <p><strong>3. Código (Jerarquía):</strong><br>
                        Sigue un orden jerárquico lógico. Por ejemplo, si "Activo" es <em>1</em>, "Activo Corriente" puede ser <em>1.1</em>, y "Caja" sería <em>1.1.01</em>.</p>
                    </div>
                </div>

                <form id="account-form">
                    <div class="form-group">
                        <label class="form-label required">Tipo de Cuenta (isGroup)</label>
                        <select class="form-control" id="account-is-group" name="isGroup" required>
                            <option value="false" ${!accountData.isGroup ? 'selected' : ''}>Cuenta Imputable (Mueve saldos)</option>
                            <option value="true" ${accountData.isGroup ? 'selected' : ''}>Cuenta Agrupadora (Título/Carpeta)</option>
                        </select>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label required">Código</label>
                            <input type="text" class="form-control" name="code" value="${accountData.code}" placeholder="Ej: 1.1.01.01" required>
                        </div>
                        <div class="form-group" style="flex: 2;">
                            <label class="form-label required">Nombre de la Cuenta</label>
                            <input type="text" class="form-control" name="name" value="${accountData.name}" placeholder="Ej: Banco Santander" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Cuenta Padre (Rubro/Subrubro)</label>
                        <select class="form-control" name="parentId">
                            <option value="">-- Ninguna (Cuenta Raíz) --</option>
                            ${parentOptions}
                        </select>
                    </div>

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label required">Clasificación</label>
                            <select class="form-control" name="type" required>
                                ${typeOptions}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label required">Naturaleza</label>
                            <select class="form-control" name="nature" required>
                                ${natureOptions}
                            </select>
                        </div>
                    </div>
                </form>
            `,
            footer: `
                <button type="button" class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btn-save-account">Guardar Cuenta</button>
            `
        });

        document.getElementById('btn-save-account').onclick = async () => {
            const form = document.getElementById('account-form');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const isGroup = formData.get('isGroup') === 'true';

            const newAccountData = {
                code: formData.get('code'),
                name: formData.get('name'),
                type: formData.get('type'),
                nature: formData.get('nature'),
                isGroup: isGroup,
                parentId: formData.get('parentId') || null,
            };

            const loading = Toast.loading('Guardando cuenta...');

            try {
                if (isEdit) {
                    await AccountingService.updateAccount(accountId, newAccountData);
                } else {
                    await AccountingService.createAccount(newAccountData);
                }

                loading.success('Cuenta guardada correctamente');
                Modal.close();
                App.navigate('contabilidad', 'plan-cuentas');

            } catch (err) {
                loading.error(err.message);
            }
        };
    }
};

// Estilos para árbol de cuentas
const treeStyles = document.createElement('style');
treeStyles.textContent = `
    .accounts-tree { font-size: var(--font-size-sm); }
    .account-row { display: flex; align-items: center; justify-content: space-between; padding: var(--space-2) var(--space-4); border-bottom: 1px solid var(--border-light); transition: background var(--transition-fast); }
    .account-row:hover { background: var(--neutral-50); }
    .account-info { display: flex; align-items: center; gap: var(--space-2); }
    .tree-toggle { background: none; border: none; cursor: pointer; padding: var(--space-1); color: var(--text-tertiary); }
    .account-code { font-family: monospace; color: var(--primary-500); font-weight: 500; min-width: 80px; }
    .account-name { color: var(--text-primary); }
    .account-name.is-group { font-weight: 600; }
    .account-meta { display: flex; align-items: center; gap: var(--space-3); }
    .account-balance { font-weight: 500; min-width: 100px; text-align: right; }
    .account-balance.positive { color: var(--text-primary); }
    .account-balance.negative { color: var(--error-500); }
    .account-actions { display: flex; gap: var(--space-1); opacity: 0; transition: opacity var(--transition-fast); }
    .account-row:hover .account-actions { opacity: 1; }
    .level-0 { font-weight: 700; background: var(--neutral-50); }
    .level-1 { font-weight: 600; }
    
    /* Estilos para Libros Auxiliares */
    .auxiliary-card { background: white; border-radius: var(--radius-lg); border: 1px solid var(--neutral-200); margin-bottom: var(--space-4); }
    .auxiliary-header { display: flex; justify-content: space-between; align-items: center; padding: var(--space-4); border-bottom: 1px solid var(--neutral-200); }
    .auxiliary-title { display: flex; align-items: center; gap: var(--space-2); font-weight: 600; color: var(--text-primary); }
    .auxiliary-transactions { padding: var(--space-4); }
    .aux-transaction { background: var(--neutral-50); padding: var(--space-3); border-radius: var(--radius-md); margin-bottom: var(--space-2); border-left: 3px solid var(--primary); }
    .aux-transaction-header { display: flex; justify-content: space-between; margin-bottom: var(--space-2); }
    .aux-transaction-date { color: var(--text-secondary); font-size: 0.875rem; }
    .aux-transaction-lines { font-size: 0.875rem; color: var(--text-tertiary); }
`;
document.head.appendChild(treeStyles);

// ============================================
// LIBROS AUXILIARES - Sistema Centralizador
// ============================================

/**
 * Renderiza vista de Libros Auxiliares
 */
ContabilidadModule.renderAuxiliaryJournals = async function () {
    const company = CompanyService.getCurrent();
    const accountingSystem = company?.accountingSystem || 'journalizer';

    // Obtener períodos disponibles
    const currentDate = new Date();
    const currentPeriod = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    return `
        <div class="page-header">
            <h1 class="page-title"><i class="fas fa-books"></i> Libros Auxiliares</h1>
            <p class="page-subtitle">Sistema Centralizador - Registro por módulos</p>
        </div>
        
        ${accountingSystem !== 'centralizer' ? `
            <div class="alert alert-warning" style="margin-bottom: var(--space-4);">
                <i class="fas fa-exclamation-triangle"></i>
                <div>
                    <strong>Sistema Jornalizador Activo</strong>
                    <p>Actualmente el sistema está configurado como <strong>Jornalizador</strong>. 
                    Los libros auxiliares solo se usan en el sistema <strong>Centralizador</strong>.</p>
                    <p style="margin-top: 0.5rem;">
                        <a href="#admin/configuracion" class="link-primary">Cambiar a Centralizador en Configuración →</a>
                    </p>
                </div>
            </div>
        ` : ''}
        
        <div class="toolbar">
            <div class="toolbar-left">
                <select class="form-control" id="aux-period" style="width: 180px;">
                    <option value="${currentPeriod}">Período Actual: ${currentPeriod}</option>
                    ${this.generatePeriodOptions(12)}
                </select>
                <button class="btn btn-primary" id="btn-load-aux">
                    <i class="fas fa-search"></i> Consultar
                </button>
            </div>
            <div class="toolbar-right">
                <span id="system-indicator" class="badge ${accountingSystem === 'centralizer' ? 'badge-success' : 'badge-warning'}">
                    ${accountingSystem === 'centralizer' ? '📗 Centralizador' : '📘 Jornalizador'}
                </span>
            </div>
        </div>
        
        <div id="auxiliary-content">
            <div class="empty-state">
                <i class="fas fa-layer-group"></i>
                <h3>Seleccione un período</h3>
                <p>Elija un período para ver los libros auxiliares</p>
            </div>
        </div>
    `;
};

/**
 * Genera opciones de períodos anteriores
 */
ContabilidadModule.generatePeriodOptions = function (months) {
    const options = [];
    const now = new Date();

    for (let i = 1; i <= months; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const label = date.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });
        options.push(`<option value="${period}">${label}</option>`);
    }

    return options.join('');
};

/**
 * Inicializa vista de Libros Auxiliares
 */
ContabilidadModule.initAuxiliaryJournals = async function () {
    document.getElementById('btn-load-aux')?.addEventListener('click', async () => {
        const period = document.getElementById('aux-period').value;
        await this.loadAuxiliaryJournals(period);
    });

    // Cargar período actual por defecto
    const period = document.getElementById('aux-period')?.value;
    if (period) {
        await this.loadAuxiliaryJournals(period);
    }
};

/**
 * Carga y muestra los libros auxiliares de un período
 */
ContabilidadModule.loadAuxiliaryJournals = async function (period) {
    const container = document.getElementById('auxiliary-content');
    if (!container) return;

    container.innerHTML = '<div class="loading">Cargando libros auxiliares...</div>';

    try {
        const journals = await AccountingService.getAuxiliaryJournals(period);

        const moduleNames = {
            sales: { name: 'Ventas', icon: 'fa-shopping-cart', color: 'success' },
            purchases: { name: 'Compras', icon: 'fa-truck', color: 'primary' },
            treasury: { name: 'Tesorería', icon: 'fa-wallet', color: 'warning' }
        };

        // Crear tarjetas para cada módulo (incluso si no hay transacciones)
        const modules = ['sales', 'purchases', 'treasury'];

        let html = `<div class="grid grid-cols-1 gap-4">`;

        for (const module of modules) {
            const journal = journals.find(j => j.module === module);
            const info = moduleNames[module];
            const transactionCount = journal?.transactions?.length || 0;
            let isCentralized = journal?.status === 'centralized';

            // Si está centralizado, verificar si el asiento fue anulado para permitir re-centralizar
            if (isCentralized && journal.centralizedEntryId) {
                const entry = await DB.get('journalEntries', journal.centralizedEntryId);
                if (entry && entry.status === 'cancelled') {
                    isCentralized = false;
                }
            }

            html += `
                <div class="auxiliary-card">
                    <div class="auxiliary-header">
                        <div class="auxiliary-title">
                            <i class="fas ${info.icon}" style="color: var(--${info.color})"></i>
                            <span>Libro Auxiliar de ${info.name}</span>
                            <span class="badge badge-neutral">${period}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: var(--space-2);">
                            ${isCentralized ? `
                                <span class="badge badge-success">
                                    <i class="fas fa-check"></i> Centralizado
                                </span>
                            ` : `
                                <span class="badge badge-warning">
                                    ${transactionCount} transacciones
                                </span>
                                ${transactionCount > 0 ? `
                                    <button class="btn btn-primary btn-sm" data-action="centralize" data-module="${module}" data-period="${period}">
                                        <i class="fas fa-compress-arrows-alt"></i> Centralizar
                                    </button>
                                ` : ''}
                            `}
                        </div>
                    </div>
                    <div class="auxiliary-transactions">
                        ${!journal || transactionCount === 0 ? `
                            <div style="text-align: center; color: var(--text-tertiary); padding: var(--space-4);">
                                <i class="fas fa-inbox" style="font-size: 2rem; opacity: 0.5;"></i>
                                <p>Sin transacciones en este período</p>
                            </div>
                        ` : journal.transactions.map(t => `
                            <div class="aux-transaction">
                                <div class="aux-transaction-header">
                                    <strong>${t.description}</strong>
                                    <span class="aux-transaction-date">${t.date}</span>
                                </div>
                                <div class="aux-transaction-lines">
                                    ${t.lines.map(l => `
                                        <span style="margin-right: 1rem;">
                                            ${l.debit > 0 ? `D: $${l.debit.toLocaleString()}` : `C: $${l.credit.toLocaleString()}`}
                                        </span>
                                    `).join('')}
                                </div>
                            </div>
                        `).join('')}
                        ${isCentralized && journal.centralizedEntryId ? `
                            <div style="margin-top: var(--space-3); padding: var(--space-3); background: var(--success-50); border-radius: var(--radius-md); border-left: 3px solid var(--success);">
                                <strong><i class="fas fa-check-circle" style="color: var(--success);"></i> Centralizado</strong>
                                <p style="margin: 0.5rem 0 0; font-size: 0.875rem; color: var(--text-secondary);">
                                    Asiento resumen generado el ${new Date(journal.centralizedAt).toLocaleDateString('es-CL')}
                                </p>
                                <a href="#contabilidad/asientos" class="link-primary" style="font-size: 0.875rem;">
                                    Ver asiento en Libro Diario →
                                </a>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;

        // Agregar listeners de centralización
        container.querySelectorAll('[data-action="centralize"]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const module = btn.dataset.module;
                const period = btn.dataset.period;
                await this.centralizeJournal(module, period);
            });
        });

    } catch (err) {
        container.innerHTML = `<div class="alert alert-error">Error: ${err.message}</div>`;
    }
};

/**
 * Centraliza un libro auxiliar
 */
ContabilidadModule.centralizeJournal = async function (module, period) {
    const moduleNames = { sales: 'Ventas', purchases: 'Compras', treasury: 'Tesorería' };

    const confirm = await Modal.confirm({
        title: `Centralizar ${moduleNames[module]}`,
        message: `¿Desea centralizar el libro auxiliar de <strong>${moduleNames[module]}</strong> para el período <strong>${period}</strong>?
        
        <div style="margin-top: 1rem; padding: 1rem; background: var(--warning-50); border-radius: 0.5rem; border-left: 3px solid var(--warning);">
            <strong>⚠️ Esta acción:</strong>
            <ul style="margin: 0.5rem 0 0; padding-left: 1.5rem;">
                <li>Generará un asiento resumen en el Libro Diario</li>
                <li>Consolidará todas las transacciones del período</li>
                <li>No se puede revertir automáticamente</li>
            </ul>
        </div>`,
        confirmText: 'Centralizar',
        confirmClass: 'btn-primary'
    });

    if (!confirm) return;

    const loading = Toast.loading(`Centralizando ${moduleNames[module]}...`);

    try {
        const result = await AccountingService.centralizeAuxiliaryJournal(module, period);

        loading.success(`¡Centralizado! Se generó asiento resumen con ${result.linesConsolidated} líneas.`);

        // Recargar la vista
        await this.loadAuxiliaryJournals(period);

    } catch (err) {
        loading.error('Error: ' + err.message);
    }
};

// Hacer disponible globalmente
window.ContabilidadModule = ContabilidadModule;

