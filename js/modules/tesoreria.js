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
        if (!company) return;

        switch (view) {
            case 'cuentas-pagar': await this.initAccountsPayable(); break;
            case 'cuentas-cobrar': await this.initAccountsReceivable(); break;
            case 'bancos': await this.initBanks(); break;
            case 'conciliacion': this.initReconciliation(); break;
        }
    },

    async initAccountsPayable() {
        const company = CompanyService.getCurrent();
        const invoices = await DB.getByIndex('supplierInvoices', 'companyId', company.id);
        const pending = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled');

        // Enriquecer con nombre de proveedor
        for (const inv of pending) {
            if (!inv.supplierName) {
                const supplier = await DB.get('suppliers', inv.supplierId);
                inv.supplierName = supplier?.name || 'Proveedor desconocido';
            }
        }

        DataTable.create('payables-table', {
            columns: [
                { key: 'number', label: 'Factura' },
                { key: 'supplierName', label: 'Proveedor' },
                { key: 'date', label: 'Fecha', format: 'date' },
                { key: 'dueDate', label: 'Vencimiento', format: 'date' },
                { key: 'total', label: 'Total', format: 'currency', class: 'text-right' },
                { key: 'balance', label: 'Saldo', format: 'currency', class: 'text-right' },
                { key: 'status', label: 'Estado', format: 'status' },
                {
                    key: 'actions', label: '', render: (_, row) => `
                        <button class="btn btn-ghost btn-sm" onclick="TesoreriaModule.showPaymentModal('${row.id}')" title="Registrar Pago">
                            <i class="fas fa-money-bill-wave"></i>
                        </button>
                    `
                }
            ],
            data: pending,
            emptyMessage: 'No hay pagos pendientes'
        });

        document.getElementById('btn-register-payment')?.addEventListener('click', () => {
            this.showPaymentModal();
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
        const bankAccounts = await DB.getByIndex('bankAccounts', 'companyId', company.id);

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

        const bankOptions = `<option value="">Efectivo (Caja)</option>` +
            bankAccounts.map(a => `<option value="${a.id}">${a.bank} - ${a.accountNumber}</option>`).join('');

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
                    <select class="form-control pay-bank">${bankOptions}</select>
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
                const firstOption = bankSelect.options[0];
                if (method === 'check' || method === 'card') {
                    firstOption.textContent = 'Cuentas por Pagar (Pendiente)';
                } else {
                    firstOption.textContent = 'Efectivo (Caja)';
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
                    let srcAccount;

                    if (pl.method === 'check') {
                        // Cheques van a Cuentas por Pagar (Pasivo) hasta que se cobren
                        srcAccount = accounts.find(a => a.code === '2.1.03' || a.name?.toLowerCase().includes('cuentas por pagar')) ||
                            { id: Helpers.generateId(), companyId: company.id, code: '2.1.03', name: 'Cuentas por Pagar', type: 'liability', nature: 'credit', level: 2, isActive: true };

                        // NO se actualiza saldo de banco todavía
                    } else if (pl.bankId) {
                        const bankAccount = await DB.get('bankAccounts', pl.bankId);
                        if (bankAccount) {
                            await DB.update('bankAccounts', { ...bankAccount, balance: bankAccount.balance - pl.amount });
                        }
                        srcAccount = accounts.find(a => a.code === '1.1.01' || a.name?.toLowerCase() === 'banco') ||
                            { id: Helpers.generateId(), companyId: company.id, code: '1.1.01', name: 'Banco', type: 'asset', nature: 'debit', level: 2, isActive: true };
                    } else {
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
        const pending = invoices.filter(i => i.status !== 'paid' && i.status !== 'cancelled');

        // Enriquecer con nombre de cliente
        for (const inv of pending) {
            if (!inv.customerName) {
                const customer = await DB.get('customers', inv.customerId);
                inv.customerName = customer?.name || 'Cliente desconocido';
            }
        }

        DataTable.create('receivables-table', {
            columns: [
                { key: 'number', label: 'Factura' },
                { key: 'customerName', label: 'Cliente' },
                { key: 'date', label: 'Fecha', format: 'date' },
                { key: 'dueDate', label: 'Vencimiento', format: 'date' },
                { key: 'total', label: 'Total', format: 'currency', class: 'text-right' },
                { key: 'balance', label: 'Saldo', format: 'currency', class: 'text-right' },
                { key: 'status', label: 'Estado', format: 'status' },
                {
                    key: 'actions', label: '', render: (_, row) => `
                        <button class="btn btn-ghost btn-sm" onclick="TesoreriaModule.showCollectionModal('${row.id}')" title="Registrar Cobro">
                            <i class="fas fa-hand-holding-usd"></i>
                        </button>
                    `
                }
            ],
            data: pending,
            emptyMessage: 'No hay cobros pendientes'
        });

        document.getElementById('btn-register-collection')?.addEventListener('click', () => {
            this.showCollectionModal();
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
        const bankAccounts = await DB.getByIndex('bankAccounts', 'companyId', company.id);

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

        const bankOptions = `<option value="">Efectivo (Caja)</option>` +
            bankAccounts.map(a => `<option value="${a.id}">${a.bank} - ${a.accountNumber}</option>`).join('');

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
                    <select class="form-control col-bank">${bankOptions}</select>
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
                const firstOption = bankSelect.options[0];
                if (method === 'check' || method === 'card') {
                    firstOption.textContent = 'Cuentas por Cobrar (Pendiente)';
                } else {
                    firstOption.textContent = 'Efectivo (Caja)';
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
                let customersAccount = accounts.find(a => a.code === '1.1.05' || a.name?.toLowerCase().includes('clientes por cobrar'));
                if (!customersAccount) {
                    customersAccount = { id: Helpers.generateId(), companyId: company.id, code: '1.1.05', name: 'Clientes por Cobrar', type: 'asset', nature: 'debit', level: 2, isActive: true };
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
                    let destAccount;

                    if (pl.method === 'check') {
                        // Cheques van a Cuentas por Cobrar (Activo) hasta que se depositen
                        destAccount = accounts.find(a => a.code === '1.1.07' || a.name?.toLowerCase().includes('cuentas por cobrar')) ||
                            { id: Helpers.generateId(), companyId: company.id, code: '1.1.07', name: 'Cuentas por Cobrar', type: 'asset', nature: 'debit', level: 2, isActive: true };

                        // NO se actualiza saldo de banco todavía
                    } else if (pl.bankId) {
                        const bankAccount = await DB.get('bankAccounts', pl.bankId);
                        if (bankAccount) {
                            await DB.update('bankAccounts', { ...bankAccount, balance: bankAccount.balance + pl.amount });
                        }
                        // Default bank accounting account
                        destAccount = accounts.find(a => a.code === '1.1.01' || a.name?.toLowerCase() === 'banco') ||
                            { id: Helpers.generateId(), companyId: company.id, code: '1.1.01', name: 'Banco', type: 'asset', nature: 'debit', level: 2, isActive: true };
                    } else {
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
                await this.loadTransactions(e.target.value);
            }
        });
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
        Toast.info('Nuevo movimiento bancario');
    },

    async loadTransactions(accountId) {
        const transactions = await DB.getByIndex('bankTransactions', 'bankAccountId', accountId);

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
                { key: 'amount', label: 'Monto', format: 'currency', class: 'text-right' }
            ],
            data: transactions,
            emptyMessage: 'No hay movimientos en esta cuenta'
        });
    },

    initReconciliation() {
        document.getElementById('btn-start-reconciliation')?.addEventListener('click', () => {
            Toast.info('Iniciar conciliación bancaria');
        });
    }
};

window.TesoreriaModule = TesoreriaModule;
