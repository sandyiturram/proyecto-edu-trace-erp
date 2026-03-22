/**
 * EduERP - Tesorería Module
 * Módulo de Tesorería (FI)
 */

const TesoreriaModule = {
    currentView: 'cuentas-pagar',

    async render(view = null) {
        // Por defecto, ir a Pagos si no viene vista (evita "Vista no encontrada")
        const currentView = view || 'cuentas-pagar';
        this.currentView = currentView;

        switch (currentView) {
            case 'cuentas-pagar': return this.renderAccountsPayable();
            case 'cuentas-cobrar': return this.renderAccountsReceivable();
            case 'bancos': return await this.renderBanks();
            case 'conciliacion': return this.renderReconciliation();
            default: return '<p>Vista no encontrada</p>';
        }
    },

    renderAccountsPayable() {
        return `
            <div class="page-header">
                <h1 class="page-title">Control de Pagos</h1>
                <p class="page-subtitle">Control de obligaciones con proveedores</p>
            </div>
            <div class="toolbar">
                <div class="toolbar-left">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" class="form-control" placeholder="Buscar..." id="search-payables">
                    </div>
                    <select class="form-control" id="filter-status" style="width: 150px;">
                        <option value="">Todos</option>
                        <option value="pending">Pendientes</option>
                        <option value="overdue">Vencidas</option>
                        <option value="paid">Pagadas</option>
                    </select>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-primary" id="btn-register-payment">
                        <i class="fas fa-money-bill-wave"></i> Registrar Pago
                    </button>
                </div>
            </div>
            <div id="payables-table"></div>
        `;
    },

    renderAccountsReceivable() {
        return `
            <div class="page-header">
                <h1 class="page-title">Control de Cobros</h1>
                <p class="page-subtitle">Control de créditos con clientes</p>
            </div>
            <div class="toolbar">
                <div class="toolbar-left">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" class="form-control" placeholder="Buscar..." id="search-receivables">
                    </div>
                    <select class="form-control" id="filter-status" style="width: 150px;">
                        <option value="">Todos</option>
                        <option value="pending">Pendientes</option>
                        <option value="overdue">Vencidas</option>
                        <option value="paid">Cobradas</option>
                    </select>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-primary" id="btn-register-collection">
                        <i class="fas fa-hand-holding-usd"></i> Registrar Cobro
                    </button>
                </div>
            </div>
            <div id="receivables-table"></div>
        `;
    },

    async renderBanks() {
        const company = CompanyService.getCurrent();
        let accounts = [];
        if (company) {
            accounts = await DB.getByIndex('bankAccounts', 'companyId', company.id);
        }

        return `
            <div class="page-header">
                <h1 class="page-title">Bancos</h1>
                <p class="page-subtitle">Gestión de cuentas bancarias y movimientos</p>
            </div>

            <div class="card" style="margin-bottom: var(--space-4); border-left: 4px solid var(--primary);">
                <details>
                    <summary style="padding: var(--space-3); cursor: pointer; font-weight: 600; color: var(--primary); display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-question-circle"></i> ¿Cómo usar esta sección?
                    </summary>
                    <div style="padding: 0 var(--space-3) var(--space-3); font-size: 0.9rem; line-height: 1.6; color: var(--gray-600);">
                        <p style="margin-bottom: 0.75rem;">Esta sección permite administrar las <strong>cuentas bancarias</strong> de la empresa y registrar sus movimientos (depósitos y retiros).</p>
                        <ol style="padding-left: 1.25rem; margin: 0;">
                            <li style="margin-bottom: 0.5rem;"><strong>Crear una cuenta bancaria:</strong> Haga clic en <em>"+ Nueva Cuenta"</em> e ingrese los datos del banco, número de cuenta, tipo y saldo inicial.</li>
                            <li style="margin-bottom: 0.5rem;"><strong>Ver movimientos:</strong> Seleccione una cuenta en el desplegable <em>"Seleccione cuenta…"</em> para visualizar todos sus movimientos. Puede filtrar por rango de fechas.</li>
                            <li style="margin-bottom: 0.5rem;"><strong>Registrar un movimiento:</strong> Presione <em>"Nuevo Movimiento"</em>, seleccione la cuenta, el tipo (Depósito o Retiro), el monto, y opcionalmente una cuenta contable de contrapartida para generar el asiento automáticamente.</li>
                            <li style="margin-bottom: 0.5rem;"><strong>Saldos en tarjetas:</strong> Las tarjetas superiores muestran el saldo actual de cada cuenta bancaria registrada.</li>
                        </ol>
                        <p style="margin-top: 0.75rem; padding: 0.5rem; background: #f0f9ff; border-radius: 0.375rem;">
                            <i class="fas fa-lightbulb" style="color: #f59e0b;"></i>
                            <strong>Tip:</strong> Al seleccionar una cuenta contable de contrapartida al registrar un movimiento, el sistema genera automáticamente el asiento contable correspondiente en el Libro Diario.
                        </p>
                    </div>
                </details>
            </div>
            
            <div class="dashboard-grid" style="margin-bottom: var(--space-4);">
                ${accounts.map(acc => `
                    <div class="kpi-card">
                        <div class="kpi-header">
                            <div class="kpi-icon primary"><i class="fas fa-university"></i></div>
                            <button class="btn btn-ghost btn-icon"><i class="fas fa-ellipsis-v"></i></button>
                        </div>
                        <div class="kpi-value">${Formatters.currency(acc.balance)}</div>
                        <div class="kpi-label">${acc.bank} - ${acc.accountType}</div>
                        <div class="kpi-footer">
                            <span>N° ${acc.accountNumber}</span>
                        </div>
                    </div>
                `).join('') || `
                    <div class="kpi-card span-4">
                        <div class="kpi-header">
                            <div class="kpi-icon primary"><i class="fas fa-university"></i></div>
                        </div>
                        <div class="kpi-value">Sin cuentas</div>
                        <div class="kpi-label">Agregue una cuenta bancaria para comenzar</div>
                    </div>
                `}
            </div>
            
            <div class="toolbar">
                <div class="toolbar-left">
                    <select class="form-control" id="select-account" style="width: 250px;">
                        <option value="">Seleccione cuenta...</option>
                        ${accounts.map(acc => `<option value="${acc.id}">${acc.bank} - ${acc.accountNumber}</option>`).join('')}
                    </select>
                    <input type="date" class="form-control" id="filter-date-from">
                    <input type="date" class="form-control" id="filter-date-to">
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-outline" id="btn-new-account">
                        <i class="fas fa-plus"></i> Nueva Cuenta
                    </button>
                    <button class="btn btn-primary" id="btn-new-transaction">
                        <i class="fas fa-exchange-alt"></i> Nuevo Movimiento
                    </button>
                </div>
            </div>
            <div id="transactions-table"></div>
        `;
    },

    renderReconciliation() {
        return `
            <div class="page-header">
                <h1 class="page-title">Conciliación Bancaria</h1>
                <p class="page-subtitle">Concilie los movimientos bancarios con la contabilidad</p>
            </div>

            <div class="card" style="margin-bottom: var(--space-4); border-left: 4px solid var(--info);">
                <details>
                    <summary style="padding: var(--space-3); cursor: pointer; font-weight: 600; color: var(--info); display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-question-circle"></i> ¿Cómo usar esta sección?
                    </summary>
                    <div style="padding: 0 var(--space-3) var(--space-3); font-size: 0.9rem; line-height: 1.6; color: var(--gray-600);">
                        <p style="margin-bottom: 0.75rem;">La conciliación bancaria es el proceso de <strong>comparar los registros contables</strong> de la empresa (Libro Banco) con el <strong>estado de cuenta emitido por el banco</strong> (Cartola), para identificar diferencias y asegurar que ambos coincidan.</p>
                        <ol style="padding-left: 1.25rem; margin: 0;">
                            <li style="margin-bottom: 0.5rem;"><strong>Seleccionar cuenta y período:</strong> Elija la cuenta bancaria a conciliar y el mes correspondiente.</li>
                            <li style="margin-bottom: 0.5rem;"><strong>Ingresar saldo de cartola:</strong> Escriba el <em>saldo final</em> que aparece en la cartola bancaria (estado de cuenta del banco) para ese mes.</li>
                            <li style="margin-bottom: 0.5rem;"><strong>Iniciar conciliación:</strong> Presione el botón para generar la comparación. El sistema mostrará todos los movimientos del período.</li>
                            <li style="margin-bottom: 0.5rem;"><strong>Marcar movimientos conciliados:</strong> Active la casilla <em>"Conciliado (en Cartola)"</em> para cada movimiento que aparezca tanto en sus registros como en la cartola bancaria.</li>
                            <li style="margin-bottom: 0.5rem;"><strong>Verificar la diferencia:</strong> El panel superior muestra la diferencia entre el saldo de cartola ajustado y el saldo de libros. Cuando la diferencia es <strong>$0</strong>, la conciliación está completa.</li>
                            <li style="margin-bottom: 0.5rem;"><strong>Guardar:</strong> Presione <em>"Guardar Conciliación"</em> para persistir el estado de los movimientos conciliados.</li>
                        </ol>
                        <p style="margin-top: 0.75rem; padding: 0.5rem; background: #eff6ff; border-radius: 0.375rem;">
                            <i class="fas fa-info-circle" style="color: var(--info);"></i>
                            <strong>Concepto clave:</strong> Los movimientos <em>no marcados</em> son considerados <strong>"en tránsito"</strong> — es decir, están registrados en los libros de la empresa pero aún no aparecen en la cartola del banco (o viceversa). Ejemplos comunes: cheques girados no cobrados, depósitos en tránsito, comisiones bancarias no contabilizadas.
                        </p>
                    </div>
                </details>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><i class="fas fa-balance-scale"></i> Seleccionar Período</div>
                </div>
                <div class="card-body">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Cuenta Bancaria</label>
                            <select class="form-control" id="reconcile-account">
                                <option value="">Seleccione...</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Mes</label>
                            <input type="month" class="form-control" id="reconcile-month">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Saldo según Cartola</label>
                            <input type="number" class="form-control" id="bank-balance" placeholder="0">
                        </div>
                        <div class="form-group" style="display: flex; align-items: flex-end;">
                            <button class="btn btn-primary" id="btn-start-reconciliation">
                                <i class="fas fa-play"></i> Iniciar Conciliación
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div id="reconciliation-content" style="margin-top: var(--space-4);"></div>
        `;
    },

    async init(view) {
        const company = CompanyService.getCurrent();
        if (!company) {
            Toast.warning('Debe seleccionar una empresa para acceder a Tesorería');
            return;
        }

        switch (view) {
            case 'cuentas-pagar': await this.initAccountsPayable(); break;
            case 'cuentas-cobrar': await this.initAccountsReceivable(); break;
            case 'bancos': await this.initBanks(); break;
            case 'conciliacion': await this.initReconciliation(); break;
        }
    },

    async initAccountsPayable() {
        const company = CompanyService.getCurrent();
        const invoices = await DB.getByIndex('supplierInvoices', 'companyId', company.id);
        const allInvoices = invoices.filter(i => i.status !== 'cancelled');

        // Enriquecer con nombre de proveedor y calcular balance
        for (const inv of allInvoices) {
            if (!inv.supplierName) {
                const supplier = await DB.get('suppliers', inv.supplierId);
                inv.supplierName = supplier?.name || 'Proveedor desconocido';
            }
            if (inv.balance === undefined) {
                inv.balance = inv.total - (inv.paid || 0);
            }
        }

        // Ordenar por fecha descendente
        allInvoices.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.allPayables = allInvoices;

        this.renderPayablesTable(allInvoices);

        // Filtro de estado
        document.getElementById('filter-status')?.addEventListener('change', () => this.filterPayables());
        // Filtro de búsqueda
        document.getElementById('search-payables')?.addEventListener('input', () => this.filterPayables());

        document.getElementById('btn-register-payment')?.addEventListener('click', () => {
            this.showPaymentModal();
        });
    },

    filterPayables() {
        const statusFilter = document.getElementById('filter-status')?.value || '';
        const search = (document.getElementById('search-payables')?.value || '').toLowerCase();
        const today = Helpers.getCurrentDate();
        let filtered = [...(this.allPayables || [])];

        if (statusFilter === 'pending') {
            filtered = filtered.filter(i => i.status === 'pending' || i.status === 'partial');
        } else if (statusFilter === 'overdue') {
            filtered = filtered.filter(i => i.dueDate < today && i.status !== 'paid');
        } else if (statusFilter === 'paid') {
            filtered = filtered.filter(i => i.status === 'paid');
        }

        if (search) {
            filtered = filtered.filter(i =>
                i.number?.toLowerCase().includes(search) ||
                i.supplierName?.toLowerCase().includes(search)
            );
        }

        this.renderPayablesTable(filtered);
    },

    renderPayablesTable(data) {
        DataTable.create('payables-table', {
            columns: [
                { key: 'number', label: 'Factura' },
                { key: 'supplierName', label: 'Proveedor' },
                { key: 'date', label: 'Fecha', format: 'date' },
                { key: 'dueDate', label: 'Vencimiento', format: 'date' },
                { key: 'total', label: 'Total', format: 'currency', class: 'text-right' },
                { key: 'balance', label: 'Saldo', format: 'currency', class: 'text-right' },
                { key: 'status', label: 'Estado', format: 'statusInvoice' },
                {
                    key: 'actions', label: '', render: (_, row) => row.status !== 'paid' ? `
                        <button class="btn btn-ghost btn-sm" onclick="TesoreriaModule.showPaymentModal('${row.id}')" title="Registrar Pago">
                            <i class="fas fa-money-bill-wave"></i>
                        </button>
                    ` : ''
                }
            ],
            data: data,
            emptyMessage: 'No hay facturas registradas'
        });
    },

    async showPaymentModal(invoiceId = null) {
        const company = CompanyService.getCurrent();
        if (!company) {
            Toast.error('Seleccione una empresa primero');
            return;
        }

        const invoices = await DB.getByIndex('supplierInvoices', 'companyId', company.id);
        const pendingInvoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled');
        const allAccounts = await DB.getByIndex('accounts', 'companyId', company.id);
        const cashAccounts = allAccounts.filter(a => (a.code.startsWith('1.1.') || a.code.startsWith('2.1.')) && a.active !== false && a.isActive !== false && !a.isGroup).sort((a,b) => a.code.localeCompare(b.code));

        if (pendingInvoices.length === 0) {
            Toast.info('No hay facturas pendientes de pago');
            return;
        }

        // Enriquecer con nombre de proveedor
        for (const inv of pendingInvoices) {
            if (!inv.supplierName) {
                const supplier = await DB.get('suppliers', inv.supplierId);
                inv.supplierName = supplier?.name || 'Proveedor desconocido';
            }
        }

        const accountOptions = cashAccounts.map(a => `<option value="${a.id}">${a.code} - ${a.name}</option>`).join('');

        Modal.open({
            title: 'Registrar Pago Múltiple a Proveedor',
            size: 'large',
            content: `
                <div class="form-row">
                    <div class="form-group" style="flex: 2;">
                        <label class="form-label">Factura a Pagar <span class="text-danger">*</span></label>
                        <select class="form-control" id="pay-invoice-select" required>
                            <option value="">Seleccione factura...</option>
                            ${pendingInvoices.map(i => `<option value="${i.id}" data-pending="${i.total - (i.paid || 0)}" ${invoiceId === i.id ? 'selected' : ''}>${i.number} - ${i.supplierName} - PEND: ${Formatters.currency(i.total - (i.paid || 0))}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label">Fecha de Pago</label>
                        <input type="date" class="form-control" id="pay-date" value="${Helpers.getCurrentDate()}" required>
                    </div>
                </div>
                
                <div class="alert alert-info" style="margin: 1rem 0;">
                    Puede distribuir el pago combinando múltiples métodos y definiendo porcentajes.
                </div>

                <div class="table-container" style="margin-bottom: 1rem;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width: 25%">Método de Pago</th>
                                <th style="width: 25%">Cuenta Origen</th>
                                <th style="width: 15%">Porcentaje %</th>
                                <th style="width: 25%">Monto</th>
                                <th style="width: 10%"></th>
                            </tr>
                        </thead>
                        <tbody id="pay-payment-lines">
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-right"><strong>Distribuido / Pendiente:</strong></td>
                                <td colspan="2">
                                    <span id="pay-amount-paid" style="font-weight:bold; color: var(--primary-600)">$0</span> / 
                                    <span id="pay-amount-required" style="font-weight:bold;">$0</span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <button class="btn btn-outline btn-sm" id="btn-add-pay-line"><i class="fas fa-plus"></i> Añadir Línea de Pago</button>
                
                <div class="form-group" style="margin-top: 1rem;">
                    <label class="form-label">Notas o Referencia General</label>
                    <textarea class="form-control" id="pay-notes" rows="2" placeholder="Observaciones adicionales, n° comprobantes"></textarea>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-primary" id="btn-confirm-payment"><i class="fas fa-check"></i> Registrar Pago</button>
            `
        });

        let targetAmount = 0;

        const updateRowTotals = () => {
            let total = 0;
            const rows = document.querySelectorAll('.pay-payment-line');
            rows.forEach(row => {
                const amount = parseFloat(row.querySelector('.pay-amount').value) || 0;
                total += amount;

                const pctField = row.querySelector('.pay-percent');
                if (targetAmount > 0) {
                    if (document.activeElement === row.querySelector('.pay-amount')) {
                        pctField.value = ((amount / targetAmount) * 100).toFixed(2);
                    }
                }
            });
            document.getElementById('pay-amount-paid').textContent = Formatters.currency(total);
            const remaining = targetAmount - total;
            document.getElementById('pay-amount-required').innerHTML = `<span style="color: ${Math.abs(remaining) < 0.01 ? 'green' : 'red'}">${Formatters.currency(targetAmount)}</span>`;
        };

        const addLine = (monto = 0) => {
            const tbody = document.getElementById('pay-payment-lines');
            const tr = document.createElement('tr');
            tr.className = 'pay-payment-line';
            tr.innerHTML = `
                <td>
                    <select class="form-control pay-method">
                        <option value="transfer">Transferencia</option>
                        <option value="cash">Efectivo</option>
                        <option value="check">Cheque</option>
                        <option value="card">Tarjeta</option>
                    </select>
                </td>
                <td>
                    <select class="form-control pay-bank">${accountOptions}</select>
                </td>
                <td>
                    <input type="number" class="form-control pay-percent" min="0" max="100" step="any" placeholder="%">
                </td>
                <td>
                    <input type="number" class="form-control pay-amount" min="0" step="any" value="${monto || ''}">
                </td>
                <td>
                    <button class="btn btn-icon btn-ghost btn-remove-row"><i class="fas fa-trash text-danger"></i></button>
                </td>
            `;
            tbody.appendChild(tr);

            tr.querySelector('.btn-remove-row').onclick = () => {
                tr.remove();
                updateRowTotals();
            };

            const amtField = tr.querySelector('.pay-amount');
            const pctField = tr.querySelector('.pay-percent');

            amtField.oninput = updateRowTotals;

            pctField.oninput = () => {
                if (targetAmount > 0) {
                    const pct = parseFloat(pctField.value) || 0;
                    amtField.value = (targetAmount * (pct / 100)).toFixed(2);
                    updateRowTotals();
                }
            };

            if (monto > 0 && targetAmount > 0) {
                pctField.value = ((monto / targetAmount) * 100).toFixed(2);
            }

            // Lógica dinámica para etiquetas de cuenta
            const methodSelect = tr.querySelector('.pay-method');
            const bankSelect = tr.querySelector('.pay-bank');
            const updateAccountLabel = () => {
                const method = methodSelect.value;
                if (method === 'cash') {
                    const cajaOpt = Array.from(bankSelect.options).find(o => o.text.toLowerCase().includes('caja'));
                    if (cajaOpt) cajaOpt.selected = true;
                } else if (method === 'transfer') {
                    const bancoOpt = Array.from(bankSelect.options).find(o => o.text.toLowerCase().includes('banco'));
                    if (bancoOpt) bancoOpt.selected = true;
                } else if (method === 'check' || method === 'card') {
                    const docOpt = Array.from(bankSelect.options).find(o => o.text.toLowerCase().includes('documento') || o.text.toLowerCase().includes('por pagar'));
                    if (docOpt) docOpt.selected = true;
                }
            };

            methodSelect.addEventListener('change', updateAccountLabel);
            updateAccountLabel(); // Carga inicial
        };

        const onInvoiceChange = () => {
            const select = document.getElementById('pay-invoice-select');
            const option = select.selectedOptions[0];
            targetAmount = parseFloat(option?.dataset.pending) || 0;
            document.getElementById('pay-payment-lines').innerHTML = '';

            if (targetAmount > 0) {
                addLine(targetAmount); // Add initial line for 100%
            }
            updateRowTotals();
        };

        document.getElementById('pay-invoice-select').addEventListener('change', onInvoiceChange);
        document.getElementById('btn-add-pay-line').addEventListener('click', () => addLine(0));

        // Initialize state if invoice was pre-selected
        if (invoiceId) setTimeout(onInvoiceChange, 50);

        document.getElementById('btn-confirm-payment').addEventListener('click', async () => {
            const invoiceId = document.getElementById('pay-invoice-select').value;
            if (!invoiceId) {
                Toast.error('Debe seleccionar una factura');
                return;
            }

            const invoice = pendingInvoices.find(i => i.id === invoiceId);
            if (!invoice) return;

            const lines = Array.from(document.querySelectorAll('.pay-payment-line')).map(row => ({
                method: row.querySelector('.pay-method').value,
                bankId: row.querySelector('.pay-bank').value,
                amount: parseFloat(row.querySelector('.pay-amount').value) || 0
            })).filter(l => l.amount > 0);

            const totalPaid = lines.reduce((acc, l) => acc + l.amount, 0);

            if (totalPaid <= 0) {
                Toast.error('Debe ingresar un monto válido > 0');
                return;
            }

            if (totalPaid > parseFloat((invoice.total - (invoice.paid || 0)).toFixed(2)) + 0.1) {
                Toast.error('El monto a pagar supera el saldo de la factura');
                return;
            }

            const loading = Toast.loading('Registrando pagos múltiples...');

            try {
                const accounts = await DB.getByIndex('accounts', 'companyId', company.id);
                let suppliersAccount = accounts.find(a => a.code === '2.1.01' || a.name?.toLowerCase().includes('proveedor'));
                if (!suppliersAccount) {
                    suppliersAccount = { id: Helpers.generateId(), companyId: company.id, code: '2.1.01', name: 'Proveedores', type: 'liability', nature: 'credit', level: 2, isActive: true };
                    await DB.add('accounts', suppliersAccount);
                }

                const transactionData = {
                    date: document.getElementById('pay-date').value,
                    description: `Pago Fact ${invoice.number} (${lines.length} vías)`,
                    reference: `PAG-${invoice.number}`,
                    sourceDocument: 'supplierPayment',
                    sourceDocumentId: invoice.id,
                    autoPost: true,
                    lines: []
                };

                const supplier = await DB.get('suppliers', invoice.supplierId);

                // Add debit to Suppliers account for the total
                transactionData.lines.push({
                    accountId: suppliersAccount.id,
                    description: `Pago a ${supplier?.name || 'Proveedor'} Fact. ${invoice.number}`,
                    debit: totalPaid,
                    credit: 0
                });

                const currentDateIso = new Date().toISOString();

                // Process each payment line
                for (const pl of lines) {
                    await DB.add('supplierPayments', {
                        companyId: company.id,
                        invoiceId: invoice.id,
                        supplierId: invoice.supplierId,
                        date: transactionData.date,
                        amount: pl.amount,
                        paymentMethod: pl.method,
                        bankAccountId: pl.bankId || null,
                        reference: document.getElementById('pay-notes').value,
                        status: 'completed',
                        createdAt: currentDateIso
                    });

                    // Accounting for this line
                    let srcAccount = accounts.find(a => a.id === pl.bankId);
                    
                    if (!srcAccount) {
                        srcAccount = accounts.find(a => a.code === '1.1.02' || a.name?.toLowerCase() === 'caja') ||
                            { id: Helpers.generateId(), companyId: company.id, code: '1.1.02', name: 'Caja', type: 'asset', nature: 'debit', level: 2, isActive: true };
                    }

                    if (!srcAccount.id) await DB.add('accounts', srcAccount);

                    transactionData.lines.push({
                        accountId: srcAccount.id,
                        description: `Pago Fact. ${invoice.number} vía ${pl.method}${pl.method === 'check' ? ' (Cheque Pendiente)' : ' (Efectivo/Banco)'}`,
                        debit: 0,
                        credit: pl.amount
                    });
                }

                await AccountingService.registerTransaction('treasury', transactionData);

                // Update Invoice
                const newPaid = (invoice.paid || 0) + totalPaid;
                const newStatus = parseFloat(newPaid.toFixed(2)) >= parseFloat(invoice.total.toFixed(2)) ? 'paid' : 'partial';
                await DB.update('supplierInvoices', {
                    ...invoice,
                    paid: newPaid,
                    balance: invoice.total - newPaid,
                    status: newStatus
                });

                // Update Supplier balance
                if (supplier) {
                    await DB.update('suppliers', {
                        ...supplier,
                        balance: Math.max(0, (supplier.balance || 0) - totalPaid)
                    });
                }

                loading.success('Pagos registrados exitosamente');
                Modal.close();
                App.navigate('tesoreria', 'cuentas-pagar');

            } catch (err) {
                loading.error('Error: ' + err.message);
                console.error(err);
            }
        });
    },

    async initAccountsReceivable() {
        const company = CompanyService.getCurrent();
        const invoices = await DB.getByIndex('customerInvoices', 'companyId', company.id);
        const allInvoices = invoices.filter(i => i.status !== 'cancelled');

        // Enriquecer con nombre de cliente y calcular balance
        for (const inv of allInvoices) {
            if (!inv.customerName) {
                const customer = await DB.get('customers', inv.customerId);
                inv.customerName = customer?.name || 'Cliente desconocido';
            }
            if (inv.balance === undefined) {
                inv.balance = inv.total - (inv.paid || 0);
            }
        }

        // Ordenar por fecha descendente
        allInvoices.sort((a, b) => new Date(b.date) - new Date(a.date));
        this.allReceivables = allInvoices;

        this.renderReceivablesTable(allInvoices);

        // Filtro de estado
        document.getElementById('filter-status')?.addEventListener('change', () => this.filterReceivables());
        // Filtro de búsqueda
        document.getElementById('search-receivables')?.addEventListener('input', () => this.filterReceivables());

        document.getElementById('btn-register-collection')?.addEventListener('click', () => {
            this.showCollectionModal();
        });
    },

    filterReceivables() {
        const statusFilter = document.getElementById('filter-status')?.value || '';
        const search = (document.getElementById('search-receivables')?.value || '').toLowerCase();
        const today = Helpers.getCurrentDate();
        let filtered = [...(this.allReceivables || [])];

        if (statusFilter === 'pending') {
            filtered = filtered.filter(i => i.status === 'pending' || i.status === 'partial');
        } else if (statusFilter === 'overdue') {
            filtered = filtered.filter(i => i.dueDate < today && i.status !== 'paid');
        } else if (statusFilter === 'paid') {
            filtered = filtered.filter(i => i.status === 'paid');
        }

        if (search) {
            filtered = filtered.filter(i =>
                i.number?.toLowerCase().includes(search) ||
                i.customerName?.toLowerCase().includes(search)
            );
        }

        this.renderReceivablesTable(filtered);
    },

    renderReceivablesTable(data) {
        DataTable.create('receivables-table', {
            columns: [
                { key: 'number', label: 'Factura' },
                { key: 'customerName', label: 'Cliente' },
                { key: 'date', label: 'Fecha', format: 'date' },
                { key: 'dueDate', label: 'Vencimiento', format: 'date' },
                { key: 'total', label: 'Total', format: 'currency', class: 'text-right' },
                { key: 'balance', label: 'Saldo', format: 'currency', class: 'text-right' },
                { key: 'status', label: 'Estado', format: 'statusInvoice' },
                {
                    key: 'actions', label: '', render: (_, row) => row.status !== 'paid' ? `
                        <button class="btn btn-ghost btn-sm" onclick="TesoreriaModule.showCollectionModal('${row.id}')" title="Registrar Cobro">
                            <i class="fas fa-hand-holding-usd"></i>
                        </button>
                    ` : ''
                }
            ],
            data: data,
            emptyMessage: 'No hay facturas registradas'
        });
    },

    async showCollectionModal(invoiceId = null) {
        const company = CompanyService.getCurrent();
        if (!company) {
            Toast.error('Seleccione una empresa primero');
            return;
        }

        const invoices = await DB.getByIndex('customerInvoices', 'companyId', company.id);
        const pendingInvoices = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled');
        const allAccounts = await DB.getByIndex('accounts', 'companyId', company.id);
        const cashAccounts = allAccounts.filter(a => (a.code.startsWith('1.1.') || a.code.startsWith('2.1.')) && a.active !== false && a.isActive !== false && !a.isGroup).sort((a,b) => a.code.localeCompare(b.code));

        if (pendingInvoices.length === 0) {
            Toast.info('No hay facturas pendientes de cobro');
            return;
        }

        // Enriquecer con nombre de cliente
        for (const inv of pendingInvoices) {
            if (!inv.customerName) {
                const customer = await DB.get('customers', inv.customerId);
                inv.customerName = customer?.name || 'Cliente desconocido';
            }
        }

        const accountOptions = cashAccounts.map(a => `<option value="${a.id}">${a.code} - ${a.name}</option>`).join('');

        Modal.open({
            title: 'Registrar Cobro Multiple',
            size: 'large',
            content: `
                <div class="form-row">
                    <div class="form-group" style="flex: 2;">
                        <label class="form-label">Factura a Cobrar <span class="text-danger">*</span></label>
                        <select class="form-control" id="col-invoice-select" required>
                            <option value="">Seleccione factura...</option>
                            ${pendingInvoices.map(i => `<option value="${i.id}" data-pending="${i.total - (i.paid || 0)}" ${invoiceId === i.id ? 'selected' : ''}>${i.number} - ${i.customerName} - PEND: ${Formatters.currency(i.total - (i.paid || 0))}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group" style="flex: 1;">
                        <label class="form-label">Fecha de Cobro</label>
                        <input type="date" class="form-control" id="col-date" value="${Helpers.getCurrentDate()}" required>
                    </div>
                </div>
                
                <div class="alert alert-info" style="margin: 1rem 0;">
                    Puede distribuir el pago combinando múltiples métodos y definiendo porcentajes.
                </div>

                <div class="table-container" style="margin-bottom: 1rem;">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th style="width: 25%">Método de Pago</th>
                                <th style="width: 25%">Cuenta Destino</th>
                                <th style="width: 15%">Porcentaje %</th>
                                <th style="width: 25%">Monto</th>
                                <th style="width: 10%"></th>
                            </tr>
                        </thead>
                        <tbody id="col-payment-lines">
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" class="text-right"><strong>Distribuido / Pendiente:</strong></td>
                                <td colspan="2">
                                    <span id="col-amount-paid" style="font-weight:bold; color: var(--primary-600)">$0</span> / 
                                    <span id="col-amount-required" style="font-weight:bold;">$0</span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
                <button class="btn btn-outline btn-sm" id="btn-add-col-line"><i class="fas fa-plus"></i> Añadir Línea de Pago</button>
                
                <div class="form-group" style="margin-top: 1rem;">
                    <label class="form-label">Notas o Referencia General</label>
                    <textarea class="form-control" id="col-notes" rows="2" placeholder="Observaciones adicionales, n° comprobantes"></textarea>
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-primary" id="btn-confirm-collection"><i class="fas fa-check"></i> Registrar Cobro</button>
            `
        });

        let targetAmount = 0;

        const updateRowTotals = () => {
            let total = 0;
            const rows = document.querySelectorAll('.col-payment-line');
            rows.forEach(row => {
                const amount = parseFloat(row.querySelector('.col-amount').value) || 0;
                total += amount;

                const pctField = row.querySelector('.col-percent');
                if (targetAmount > 0) {
                    // Solo actualizar porcentaje si el usuario editó el monto directamente (evitar recálculos circulares)
                    if (document.activeElement === row.querySelector('.col-amount')) {
                        pctField.value = ((amount / targetAmount) * 100).toFixed(2);
                    }
                }
            });
            document.getElementById('col-amount-paid').textContent = Formatters.currency(total);
            const remaining = targetAmount - total;
            document.getElementById('col-amount-required').innerHTML = `<span style="color: ${Math.abs(remaining) < 0.01 ? 'green' : 'red'}">${Formatters.currency(targetAmount)}</span>`;
        };

        const addLine = (monto = 0) => {
            const tbody = document.getElementById('col-payment-lines');
            const tr = document.createElement('tr');
            tr.className = 'col-payment-line';
            tr.innerHTML = `
                <td>
                    <select class="form-control col-method">
                        <option value="transfer">Transferencia</option>
                        <option value="cash">Efectivo</option>
                        <option value="check">Cheque</option>
                        <option value="card">Tarjeta</option>
                    </select>
                </td>
                <td>
                    <select class="form-control col-bank">${accountOptions}</select>
                </td>
                <td>
                    <input type="number" class="form-control col-percent" min="0" max="100" step="any" placeholder="%">
                </td>
                <td>
                    <input type="number" class="form-control col-amount" min="0" step="any" value="${monto || ''}">
                </td>
                <td>
                    <button class="btn btn-icon btn-ghost btn-remove-row"><i class="fas fa-trash text-danger"></i></button>
                </td>
            `;
            tbody.appendChild(tr);

            tr.querySelector('.btn-remove-row').onclick = () => {
                tr.remove();
                updateRowTotals();
            };

            const amtField = tr.querySelector('.col-amount');
            const pctField = tr.querySelector('.col-percent');

            amtField.oninput = updateRowTotals;

            pctField.oninput = () => {
                if (targetAmount > 0) {
                    const pct = parseFloat(pctField.value) || 0;
                    amtField.value = (targetAmount * (pct / 100)).toFixed(2);
                    updateRowTotals();
                }
            };

            if (monto > 0 && targetAmount > 0) {
                pctField.value = ((monto / targetAmount) * 100).toFixed(2);
            }

            // Lógica dinámica para etiquetas de cuenta
            const methodSelect = tr.querySelector('.col-method');
            const bankSelect = tr.querySelector('.col-bank');
            const updateAccountLabel = () => {
                const method = methodSelect.value;
                if (method === 'cash') {
                    const cajaOpt = Array.from(bankSelect.options).find(o => o.text.toLowerCase().includes('caja'));
                    if (cajaOpt) cajaOpt.selected = true;
                } else if (method === 'transfer') {
                    const bancoOpt = Array.from(bankSelect.options).find(o => o.text.toLowerCase().includes('banco'));
                    if (bancoOpt) bancoOpt.selected = true;
                } else if (method === 'check' || method === 'card') {
                    const docOpt = Array.from(bankSelect.options).find(o => o.text.toLowerCase().includes('documento') || o.text.toLowerCase().includes('por cobrar'));
                    if (docOpt) docOpt.selected = true;
                }
            };

            methodSelect.addEventListener('change', updateAccountLabel);
            updateAccountLabel(); // Carga inicial
        };

        const onInvoiceChange = () => {
            const select = document.getElementById('col-invoice-select');
            const option = select.selectedOptions[0];
            targetAmount = parseFloat(option?.dataset.pending) || 0;
            document.getElementById('col-payment-lines').innerHTML = '';

            if (targetAmount > 0) {
                addLine(targetAmount); // Add initial line for 100%
            }
            updateRowTotals();
        };

        document.getElementById('col-invoice-select').addEventListener('change', onInvoiceChange);
        document.getElementById('btn-add-col-line').addEventListener('click', () => addLine(0));

        // Initialize state if invoice was pre-selected
        if (invoiceId) setTimeout(onInvoiceChange, 50);

        document.getElementById('btn-confirm-collection').addEventListener('click', async () => {
            const invoiceId = document.getElementById('col-invoice-select').value;
            if (!invoiceId) {
                Toast.error('Debe seleccionar una factura');
                return;
            }

            const invoice = pendingInvoices.find(i => i.id === invoiceId);
            if (!invoice) return;

            const lines = Array.from(document.querySelectorAll('.col-payment-line')).map(row => ({
                method: row.querySelector('.col-method').value,
                bankId: row.querySelector('.col-bank').value,
                amount: parseFloat(row.querySelector('.col-amount').value) || 0
            })).filter(l => l.amount > 0);

            const totalCollected = lines.reduce((acc, l) => acc + l.amount, 0);

            if (totalCollected <= 0) {
                Toast.error('Debe ingresar un monto válido > 0');
                return;
            }

            if (totalCollected > parseFloat((invoice.total - (invoice.paid || 0)).toFixed(2)) + 0.1) {
                Toast.error('El monto a cobrar supera el saldo de la factura');
                return;
            }

            const loading = Toast.loading('Registrando cobros múltiples...');

            try {
                const accounts = await DB.getByIndex('accounts', 'companyId', company.id);
                let customersAccount = accounts.find(a =>
                    (a.name?.toLowerCase() === 'clientes' || a.name?.toLowerCase() === 'clientes nacionales' || a.name?.toLowerCase().includes('cliente')) &&
                    !a.name?.toLowerCase().includes('banco') && !a.name?.toLowerCase().includes('factura')
                ) || accounts.find(a => a.code === '1.1.04');
                
                if (!customersAccount) {
                    customersAccount = { id: Helpers.generateId(), companyId: company.id, code: '1.1.04', name: 'Clientes', type: 'asset', nature: 'debit', level: 2, isActive: true };
                    await DB.add('accounts', customersAccount);
                }

                const transactionData = {
                    date: document.getElementById('col-date').value,
                    description: `Cobro Fact ${invoice.number} (${lines.length} vías)`,
                    reference: `MUL-${invoice.number}`,
                    sourceDocument: 'customerInvoice',
                    sourceDocumentId: invoice.id,
                    autoPost: true,
                    lines: []
                };

                const customer = await DB.get('customers', invoice.customerId);

                // Add credit to Customers account for the total
                transactionData.lines.push({
                    accountId: customersAccount.id,
                    description: `Cobro de ${customer?.name || 'Cliente'} Fact. ${invoice.number}`,
                    debit: 0,
                    credit: totalCollected
                });

                const currentDateIso = new Date().toISOString();

                // Process each payment line
                for (const pl of lines) {
                    await DB.add('customerPayments', {
                        companyId: company.id,
                        invoiceId: invoice.id,
                        customerId: invoice.customerId,
                        date: transactionData.date,
                        amount: pl.amount,
                        paymentMethod: pl.method,
                        bankAccountId: pl.bankId || null,
                        reference: document.getElementById('col-notes').value,
                        status: 'completed',
                        createdAt: currentDateIso
                    });

                    // Accounting for this line
                    let destAccount = accounts.find(a => a.id === pl.bankId);
                    
                    if (!destAccount) {
                        destAccount = accounts.find(a => a.code === '1.1.02' || a.name?.toLowerCase() === 'caja') ||
                            { id: Helpers.generateId(), companyId: company.id, code: '1.1.02', name: 'Caja', type: 'asset', nature: 'debit', level: 2, isActive: true };
                    }

                    if (!destAccount.id) await DB.add('accounts', destAccount);

                    transactionData.lines.push({
                        accountId: destAccount.id,
                        description: `Cobro Fact. ${invoice.number} vía ${pl.method}${pl.method === 'check' ? ' (Cheque Pendiente)' : ' (Efectivo/Banco)'}`,
                        debit: pl.amount,
                        credit: 0
                    });
                }

                await AccountingService.registerTransaction('treasury', transactionData);

                // Update Invoice
                const newPaid = (invoice.paid || 0) + totalCollected;
                const newStatus = parseFloat(newPaid.toFixed(2)) >= parseFloat(invoice.total.toFixed(2)) ? 'paid' : 'partial';
                await DB.update('customerInvoices', {
                    ...invoice,
                    paid: newPaid,
                    balance: invoice.total - newPaid,
                    status: newStatus
                });

                // Update Customer balance
                if (customer) {
                    await DB.update('customers', {
                        ...customer,
                        balance: Math.max(0, (customer.balance || 0) - totalCollected)
                    });
                }

                loading.success('Cobros registrados exitosamente');
                Modal.close();
                App.navigate('tesoreria', 'cuentas-cobrar');

            } catch (err) {
                loading.error('Error: ' + err.message);
                console.error(err);
            }
        });
    },

    async initBanks() {
        const company = CompanyService.getCurrent();

        document.getElementById('btn-new-account')?.addEventListener('click', () => this.showBankAccountModal());
        document.getElementById('btn-new-transaction')?.addEventListener('click', () => this.showTransactionModal());

        document.getElementById('select-account')?.addEventListener('change', async (e) => {
            if (e.target.value) {
                this._selectedBankAccountId = e.target.value;
                await this.loadTransactions(e.target.value);
            }
        });

        // Wire date filters
        const applyDateFilter = async () => {
            if (this._selectedBankAccountId) {
                await this.loadTransactions(this._selectedBankAccountId);
            }
        };
        document.getElementById('filter-date-from')?.addEventListener('change', applyDateFilter);
        document.getElementById('filter-date-to')?.addEventListener('change', applyDateFilter);
    },

    async showBankAccountModal(accountId = null) {
        const isEdit = !!accountId;
        let data = {};

        if (isEdit) {
            data = await DB.get('bankAccounts', accountId);
        }

        await Modal.form({
            title: isEdit ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria',
            fields: [
                { name: 'bank', label: 'Banco', required: true, placeholder: 'Ej: Banco Estado', default: data.bank },
                { name: 'accountNumber', label: 'Número de Cuenta', required: true, placeholder: '12345678901', default: data.accountNumber },
                {
                    name: 'accountType', label: 'Tipo de Cuenta', type: 'select', options: [
                        { value: 'Cuenta Corriente', label: 'Cuenta Corriente' },
                        { value: 'Cuenta Vista', label: 'Cuenta Vista' },
                        { value: 'Cuenta de Ahorro', label: 'Cuenta de Ahorro' }
                    ], default: data.accountType
                },
                { name: 'balance', label: 'Saldo Inicial', type: 'number', default: data.balance || 0 }
            ],
            onSubmit: async (formData) => {
                const company = CompanyService.getCurrent();

                if (isEdit) {
                    await DB.update('bankAccounts', { ...data, ...formData });
                    Toast.success('Cuenta actualizada');
                } else {
                    await DB.add('bankAccounts', { companyId: company.id, ...formData, currency: 'CLP', status: 'active' });
                    Toast.success('Cuenta creada');
                }
                App.navigate('tesoreria', 'bancos');
            }
        });
    },

    async showTransactionModal() {
        const company = CompanyService.getCurrent();
        if (!company) { Toast.error('Seleccione una empresa'); return; }

        const accounts = await DB.getByIndex('bankAccounts', 'companyId', company.id);
        if (accounts.length === 0) {
            Toast.warning('Debe crear una cuenta bancaria primero');
            return;
        }

        const chartAccounts = await DB.getByIndex('accounts', 'companyId', company.id);
        const contraAccounts = chartAccounts.filter(a => !a.isGroup && a.isActive !== false && a.active !== false).sort((a, b) => a.code.localeCompare(b.code));

        Modal.open({
            title: 'Nuevo Movimiento Bancario',
            content: `
                <form id="bank-tx-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Cuenta Bancaria <span class="text-danger">*</span></label>
                            <select class="form-control" name="bankAccountId" required>
                                <option value="">Seleccione...</option>
                                ${accounts.map(a => `<option value="${a.id}" ${a.id === this._selectedBankAccountId ? 'selected' : ''}>${a.bank} - ${a.accountNumber}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Tipo <span class="text-danger">*</span></label>
                            <select class="form-control" name="type" required>
                                <option value="deposit">Depósito</option>
                                <option value="withdrawal">Retiro / Egreso</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Fecha <span class="text-danger">*</span></label>
                            <input type="date" class="form-control" name="date" value="${Helpers.getCurrentDate()}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Monto <span class="text-danger">*</span></label>
                            <input type="number" class="form-control" name="amount" min="1" step="0.01" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Cuenta Contable Contrapartida</label>
                        <select class="form-control" name="contraAccountId">
                            <option value="">Seleccione...</option>
                            ${contraAccounts.map(a => `<option value="${a.id}">${a.code} - ${a.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Descripción <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="description" placeholder="Ej: Depósito venta, Pago arriendo..." required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Referencia</label>
                        <input type="text" class="form-control" name="reference" placeholder="N° comprobante, transferencia, etc.">
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-primary" id="btn-save-bank-tx"><i class="fas fa-save"></i> Guardar</button>
            `
        });

        document.getElementById('btn-save-bank-tx')?.addEventListener('click', async () => {
            const form = document.getElementById('bank-tx-form');
            const fd = new FormData(form);
            const bankAccountId = fd.get('bankAccountId');
            const type = fd.get('type');
            const date = fd.get('date');
            const amount = parseFloat(fd.get('amount'));
            const description = fd.get('description');
            const reference = fd.get('reference');
            const contraAccountId = fd.get('contraAccountId');

            if (!bankAccountId || !date || !amount || amount <= 0 || !description) {
                Toast.error('Complete todos los campos obligatorios');
                return;
            }

            const loading = Toast.loading('Registrando movimiento...');
            try {
                // Save bank transaction
                await DB.add('bankTransactions', {
                    id: Helpers.generateId(),
                    companyId: company.id,
                    bankAccountId,
                    type,
                    date,
                    amount,
                    description,
                    reference: reference || '',
                    reconciled: false,
                    createdAt: new Date().toISOString()
                });

                // Update bank account balance
                const bankAccount = await DB.get('bankAccounts', bankAccountId);
                if (bankAccount) {
                    const newBalance = type === 'deposit'
                        ? (bankAccount.balance || 0) + amount
                        : (bankAccount.balance || 0) - amount;
                    await DB.update('bankAccounts', { ...bankAccount, balance: newBalance });
                }

                // Create journal entry if contra account selected
                if (contraAccountId) {
                    // Find the chart account linked to this bank account
                    const allChartAccounts = await DB.getByIndex('accounts', 'companyId', company.id);
                    let bankChartAccount = allChartAccounts.find(a =>
                        a.name?.toLowerCase().includes('banco') && !a.isGroup
                    ) || allChartAccounts.find(a => a.code === '1.1.02');

                    if (bankChartAccount) {
                        const lines = type === 'deposit' ? [
                            { accountId: bankChartAccount.id, description, debit: amount, credit: 0 },
                            { accountId: contraAccountId, description, debit: 0, credit: amount }
                        ] : [
                            { accountId: contraAccountId, description, debit: amount, credit: 0 },
                            { accountId: bankChartAccount.id, description, debit: 0, credit: amount }
                        ];

                        await AccountingService.createJournalEntry({
                            date,
                            description: `Mov. bancario: ${description}`,
                            reference: reference || `BK-${Date.now()}`,
                            type: 'bank',
                            autoPost: true,
                            lines
                        });
                    }
                }

                loading.success('Movimiento registrado');
                Modal.close();
                App.navigate('tesoreria', 'bancos');
            } catch (err) {
                loading.error('Error: ' + err.message);
                console.error(err);
            }
        });
    },

    async loadTransactions(accountId) {
        let transactions = await DB.getByIndex('bankTransactions', 'bankAccountId', accountId);

        // Apply date filters
        const dateFrom = document.getElementById('filter-date-from')?.value || '';
        const dateTo = document.getElementById('filter-date-to')?.value || '';
        if (dateFrom) transactions = transactions.filter(t => t.date >= dateFrom);
        if (dateTo) transactions = transactions.filter(t => t.date <= dateTo);

        // Sort by date descending
        transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

        DataTable.create('transactions-table', {
            columns: [
                { key: 'date', label: 'Fecha', format: 'date' },
                { key: 'description', label: 'Descripción' },
                { key: 'reference', label: 'Referencia' },
                {
                    key: 'type', label: 'Tipo', render: (v) => {
                        return v === 'deposit' ? '<span class="badge badge-success">Depósito</span>' :
                            v === 'withdrawal' ? '<span class="badge badge-error">Retiro</span>' :
                                '<span class="badge badge-neutral">Otro</span>';
                    }
                },
                {
                    key: 'amount', label: 'Monto', class: 'text-right', render: (v, row) => {
                        const color = row.type === 'deposit' ? 'color: var(--success-500)' : 'color: var(--error-500)';
                        const sign = row.type === 'deposit' ? '+' : '-';
                        return `<span style="${color}; font-weight: 600;">${sign}${Formatters.currency(v)}</span>`;
                    }
                }
            ],
            data: transactions,
            emptyMessage: 'No hay movimientos en esta cuenta'
        });
    },

    async initReconciliation() {
        const company = CompanyService.getCurrent();
        if (!company) return;

        // Populate bank accounts dropdown
        const accounts = await DB.getByIndex('bankAccounts', 'companyId', company.id);
        const accountSelect = document.getElementById('reconcile-account');
        if (accountSelect) {
            accountSelect.innerHTML = '<option value="">Seleccione...</option>' +
                accounts.map(a => `<option value="${a.id}">${a.bank} - ${a.accountNumber}</option>`).join('');
        }

        // Set default month to current month
        const monthInput = document.getElementById('reconcile-month');
        if (monthInput) {
            const now = new Date();
            monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        }

        document.getElementById('btn-start-reconciliation')?.addEventListener('click', async () => {
            const accountId = document.getElementById('reconcile-account')?.value;
            const month = document.getElementById('reconcile-month')?.value;
            const bankBalance = parseFloat(document.getElementById('bank-balance')?.value) || 0;

            if (!accountId) { Toast.error('Seleccione una cuenta bancaria'); return; }
            if (!month) { Toast.error('Seleccione un mes'); return; }

            const loading = Toast.loading('Generando conciliación...');

            try {
                const bankAccount = await DB.get('bankAccounts', accountId);
                const bookBalance = bankAccount?.balance || 0;

                // Get bank transactions for the month
                const [year, mon] = month.split('-');
                const monthStart = `${year}-${mon}-01`;
                const lastDay = new Date(parseInt(year), parseInt(mon), 0).getDate();
                const monthEnd = `${year}-${mon}-${String(lastDay).padStart(2, '0')}`;

                let transactions = await DB.getByIndex('bankTransactions', 'bankAccountId', accountId);
                transactions = transactions.filter(t => t.date >= monthStart && t.date <= monthEnd);
                transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

                const totalDeposits = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + (t.amount || 0), 0);
                const totalWithdrawals = transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + (t.amount || 0), 0);
                let renderReconciliationState = () => {
                    const checkedIds = Array.from(content.querySelectorAll('.reconcile-check:checked')).map(c => c.dataset.txId);
                    
                    let reconciledDeposits = 0;
                    let reconciledWithdrawals = 0;
                    
                    transactions.forEach(t => {
                        if (checkedIds.includes(t.id)) {
                            if (t.type === 'deposit') reconciledDeposits += t.amount;
                            else if (t.type === 'withdrawal') reconciledWithdrawals += t.amount;
                        }
                    });

                    // For a simple reconciliation: 
                    // Let's assume the user wants to see what the Bank Statements should be based on checked items.
                    // Or they just want to see the difference between Book and Cartola, but adjusted by Transit.
                    // Transit = Unchecked items.
                    let transitDeposits = totalDeposits - reconciledDeposits;
                    let transitWithdrawals = totalWithdrawals - reconciledWithdrawals;
                    
                    // Adjusted Bank Balance = Bank Balance + Transit Deposits - Transit Withdrawals
                    // The adjusted bank balance should equal the book balance.
                    const adjustedBankBalance = bankBalance + transitDeposits - transitWithdrawals;
                    const difference = adjustedBankBalance - bookBalance;

                    const summaryDiv = document.getElementById('recon-summary-cards');
                    if (summaryDiv) {
                        summaryDiv.innerHTML = `
                            <div class="kpi-card">
                                <div class="kpi-header"><div class="kpi-icon primary"><i class="fas fa-university"></i></div></div>
                                <div class="kpi-value">${Formatters.currency(bankBalance)}</div>
                                <div class="kpi-label">Saldo según Cartola</div>
                            </div>
                            <div class="kpi-card">
                                <div class="kpi-header"><div class="kpi-icon info"><i class="fas fa-book"></i></div></div>
                                <div class="kpi-value">${Formatters.currency(bookBalance)}</div>
                                <div class="kpi-label">Saldo según Libros</div>
                            </div>
                            <div class="kpi-card span-2 ${Math.abs(difference) < 0.01 ? 'success' : 'error'}">
                                <div class="kpi-header">
                                    <div class="kpi-icon ${Math.abs(difference) < 0.01 ? 'success' : 'error'}">
                                        <i class="fas fa-${Math.abs(difference) < 0.01 ? 'check-circle' : 'exclamation-triangle'}"></i>
                                    </div>
                                    <div class="kpi-badge info" title="Diferencia = (Cartola + Depósitos Tránsito - Egresos Tránsito) - Libros">
                                        Fórmula
                                    </div>
                                </div>
                                <div class="kpi-value">${Formatters.currency(Math.abs(difference))}</div>
                                <div class="kpi-label">${Math.abs(difference) < 0.01 ? 'Conciliado ✓' : 'Diferencia por Conciliar'}</div>
                            </div>
                        `;
                    }
                };

                const content = document.getElementById('reconciliation-content');
                content.innerHTML = `
                    <div id="recon-summary-cards" class="dashboard-grid" style="margin-bottom: var(--space-4);">
                        <!-- Rendered by renderReconciliationState() -->
                    </div>

                    <div class="card" style="margin-bottom: var(--space-4);">
                        <div class="card-header">
                            <div class="card-title"><i class="fas fa-list"></i> Resumen del Período ${month}</div>
                        </div>
                        <div class="card-body">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
                                <div>
                                    <h4 style="color: var(--success-500); margin-bottom: var(--space-2);">Depósitos</h4>
                                    <p style="font-size: var(--font-size-lg); font-weight: 600; color: var(--success-600);">
                                        +${Formatters.currency(totalDeposits)} (${transactions.filter(t => t.type === 'deposit').length} movimientos)
                                    </p>
                                </div>
                                <div>
                                    <h4 style="color: var(--error-500); margin-bottom: var(--space-2);">Retiros/Egresos</h4>
                                    <p style="font-size: var(--font-size-lg); font-weight: 600; color: var(--error-600);">
                                        -${Formatters.currency(totalWithdrawals)} (${transactions.filter(t => t.type === 'withdrawal').length} movimientos)
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <div class="card-title"><i class="fas fa-exchange-alt"></i> Movimientos del Mes</div>
                        </div>
                        <div class="card-body" style="padding: 0;">
                            <div class="table-container">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Descripción</th>
                                            <th>Referencia</th>
                                            <th>Tipo</th>
                                            <th class="text-right">Monto</th>
                                            <th style="text-align: center;">Conciliado (en Cartola)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${transactions.length === 0 ? '<tr><td colspan="6" class="table-empty">No hay movimientos en este período</td></tr>' :
                                            transactions.map(t => `
                                                <tr>
                                                    <td>${Formatters.date(t.date)}</td>
                                                    <td>${t.description}</td>
                                                    <td>${t.reference || '-'}</td>
                                                    <td>${t.type === 'deposit' ? '<span class="badge badge-success">Depósito</span>' : '<span class="badge badge-error">Retiro</span>'}</td>
                                                    <td class="text-right" style="font-weight: 600; color: ${t.type === 'deposit' ? 'var(--success-500)' : 'var(--error-500)'}">
                                                        ${t.type === 'deposit' ? '+' : '-'}${Formatters.currency(t.amount)}
                                                    </td>
                                                    <td style="text-align: center;">
                                                        <input type="checkbox" ${t.reconciled ? 'checked' : ''} data-tx-id="${t.id}" class="reconcile-check">
                                                    </td>
                                                </tr>
                                            `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div class="card-footer" style="text-align: right; padding: var(--space-3);">
                            <button class="btn btn-primary" id="btn-save-reconciliation">
                                <i class="fas fa-save"></i> Guardar Conciliación
                            </button>
                        </div>
                    </div>
                `;

                // Initial render
                renderReconciliationState();

                // Handle reconcile checkboxes
                content.querySelectorAll('.reconcile-check').forEach(chk => {
                    chk.addEventListener('change', () => {
                        renderReconciliationState(); // Update UI live
                    });
                });

                // Save reconciliation button
                document.getElementById('btn-save-reconciliation')?.addEventListener('click', async () => {
                    const saveLoading = Toast.loading('Guardando conciliación...');
                    try {
                        const checks = content.querySelectorAll('.reconcile-check');
                        for (const chk of checks) {
                            const txId = chk.dataset.txId;
                            const tx = await DB.get('bankTransactions', txId);
                            if (tx) {
                                await DB.update('bankTransactions', { ...tx, reconciled: chk.checked });
                            }
                        }
                        saveLoading.success('Conciliación guardada exitosamente');
                    } catch (err) {
                        saveLoading.error('Error al guardar: ' + err.message);
                        console.error(err);
                    }
                });

                loading.success('Conciliación generada');
            } catch (err) {
                loading.error('Error: ' + err.message);
                console.error(err);
            }
        });
    }
};

window.TesoreriaModule = TesoreriaModule;
