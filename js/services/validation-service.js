/**
 * EDU-TRACE ERP - Validation Service
 * Servicio de validaciones contables y de flujo para uso pedagógico
 */

const ValidationService = {
    /**
     * Resultado de validación estándar
     */
    createResult(isValid, code, message, details = {}, severity = 'error') {
        return {
            isValid,
            code,
            message,
            details,
            severity, // 'error', 'warning', 'info'
            timestamp: new Date().toISOString()
        };
    },

    // ============================================
    // VALIDACIONES CONTABLES
    // ============================================

    /**
     * Valida que Debe = Haber (crítico)
     */
    validateDebitCreditBalance(lines) {
        const totalDebit = lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
        const totalCredit = lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
        const difference = Math.abs(totalDebit - totalCredit);
        const isBalanced = difference < 0.01;

        return this.createResult(
            isBalanced,
            'DEBIT_CREDIT_BALANCE',
            isBalanced
                ? `✅ Asiento cuadrado: Debe ($${this.formatNumber(totalDebit)}) = Haber ($${this.formatNumber(totalCredit)})`
                : `❌ Asiento descuadrado: Debe ($${this.formatNumber(totalDebit)}) ≠ Haber ($${this.formatNumber(totalCredit)}). Diferencia: $${this.formatNumber(difference)}`,
            { totalDebit, totalCredit, difference },
            isBalanced ? 'success' : 'error'
        );
    },

    /**
     * Valida que la cuenta existe en el plan de cuentas
     */
    async validateAccountExists(accountId) {
        if (!accountId) {
            return this.createResult(false, 'ACCOUNT_EXISTS', '❌ No se especificó cuenta', {});
        }

        const account = await DB.get('accounts', accountId);

        return this.createResult(
            !!account,
            'ACCOUNT_EXISTS',
            account
                ? `✅ Cuenta válida: ${account.code} - ${account.name}`
                : '❌ Cuenta no encontrada en el plan de cuentas',
            { accountId, account },
            account ? 'success' : 'error'
        );
    },

    /**
     * Valida que la cuenta existe por código
     */
    async validateAccountExistsByCode(code) {
        if (!code) {
            return this.createResult(false, 'ACCOUNT_EXISTS_BY_CODE', '❌ No se especificó código de cuenta', {});
        }

        const accounts = await AccountingService.getChartOfAccounts();
        const account = accounts.find(a => a.code === code);

        return this.createResult(
            !!account,
            'ACCOUNT_EXISTS_BY_CODE',
            account
                ? `✅ Cuenta válida: ${account.code} - ${account.name}`
                : `❌ Código de cuenta "${code}" no encontrado en el plan de cuentas`,
            { code, account },
            account ? 'success' : 'error'
        );
    },

    /**
     * Valida naturaleza de cuenta correcta (deudora/acreedora)
     */
    async validateAccountNature(accountId, debit, credit) {
        const account = await DB.get('accounts', accountId);
        if (!account) {
            return this.createResult(false, 'ACCOUNT_NATURE', '❌ Cuenta no encontrada', { accountId });
        }

        // Determinar naturaleza esperada
        const debitNature = ['asset', 'expense'].includes(account.type);
        const creditNature = ['liability', 'equity', 'revenue'].includes(account.type);

        const hasDebit = parseFloat(debit) > 0;
        const hasCredit = parseFloat(credit) > 0;

        // Validar movimiento según naturaleza
        let isNaturalMovement = true;
        let explanation = '';

        if (account.isContra) {
            // Cuentas contra-naturaleza (ej: Depreciación Acumulada, Descuentos)
            explanation = `Cuenta CONTRA (${account.type}): aumenta con ${debitNature ? 'crédito' : 'débito'}`;
        } else if (debitNature) {
            explanation = `Cuenta de naturaleza DEUDORA (${account.type}): aumenta con débito, disminuye con crédito`;
        } else {
            explanation = `Cuenta de naturaleza ACREEDORA (${account.type}): aumenta con crédito, disminuye con débito`;
        }

        const natureLabel = debitNature
            ? (account.isContra ? 'Contra-Deudora' : 'Deudora')
            : (account.isContra ? 'Contra-Acreedora' : 'Acreedora');

        return this.createResult(
            true, // Siempre válido, es informativo
            'ACCOUNT_NATURE',
            `📚 ${account.code} - ${account.name}\n   Naturaleza: ${natureLabel}\n   ${explanation}`,
            {
                account: account.name,
                type: account.type,
                isDebitNature: debitNature,
                isContra: account.isContra,
                debit,
                credit,
                explanation
            },
            'info'
        );
    },

    /**
     * Valida formato de RUT chileno
     */
    validateRUT(rut) {
        if (!rut) {
            return this.createResult(false, 'RUT_FORMAT', '❌ RUT no proporcionado', {});
        }

        // Limpiar RUT
        const cleanRut = rut.replace(/[.-]/g, '').toUpperCase();

        if (cleanRut.length < 2) {
            return this.createResult(false, 'RUT_FORMAT', '❌ RUT muy corto', { rut });
        }

        const body = cleanRut.slice(0, -1);
        const verifier = cleanRut.slice(-1);

        // Calcular dígito verificador
        let sum = 0;
        let multiplier = 2;

        for (let i = body.length - 1; i >= 0; i--) {
            sum += parseInt(body[i]) * multiplier;
            multiplier = multiplier === 7 ? 2 : multiplier + 1;
        }

        const remainder = 11 - (sum % 11);
        let expectedVerifier = '';

        if (remainder === 11) expectedVerifier = '0';
        else if (remainder === 10) expectedVerifier = 'K';
        else expectedVerifier = remainder.toString();

        const isValid = verifier === expectedVerifier;

        return this.createResult(
            isValid,
            'RUT_FORMAT',
            isValid
                ? `✅ RUT válido: ${this.formatRUT(rut)}`
                : `❌ RUT inválido. Dígito verificador esperado: ${expectedVerifier}, recibido: ${verifier}`,
            { rut, formattedRut: this.formatRUT(rut), expectedVerifier, receivedVerifier: verifier },
            isValid ? 'success' : 'error'
        );
    },

    /**
     * Valida fechas coherentes
     */
    validateDate(date, options = {}) {
        const {
            allowFuture = false,
            allowPast = true,
            checkPeriodOpen = true,
            periodStart = null,
            periodEnd = null
        } = options;

        if (!date) {
            return this.createResult(false, 'DATE_COHERENT', '❌ Fecha no proporcionada', {});
        }

        const inputDate = new Date(date);
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        const errors = [];
        const warnings = [];

        // Validar fecha futura
        if (!allowFuture && inputDate > today) {
            errors.push('La fecha es futura y no está permitida');
        }

        // Validar fecha pasada muy antigua (más de 2 años)
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        if (inputDate < twoYearsAgo) {
            warnings.push('La fecha es de hace más de 2 años');
        }

        // Validar período abierto
        if (checkPeriodOpen) {
            const fiscalYear = inputDate.getFullYear();
            const currentYear = today.getFullYear();

            if (fiscalYear < currentYear - 1) {
                errors.push(`El período fiscal ${fiscalYear} podría estar cerrado`);
            }
        }

        // Validar rango de período si se especifica
        if (periodStart && inputDate < new Date(periodStart)) {
            errors.push(`La fecha es anterior al período permitido (${periodStart})`);
        }
        if (periodEnd && inputDate > new Date(periodEnd)) {
            errors.push(`La fecha es posterior al período permitido (${periodEnd})`);
        }

        const isValid = errors.length === 0;
        const hasWarnings = warnings.length > 0;

        return this.createResult(
            isValid,
            'DATE_COHERENT',
            isValid
                ? (hasWarnings
                    ? `⚠️ Fecha aceptada con advertencias: ${warnings.join(', ')}`
                    : `✅ Fecha válida: ${this.formatDate(inputDate)}`)
                : `❌ Fecha inválida: ${errors.join(', ')}`,
            { date, inputDate: inputDate.toISOString(), errors, warnings },
            isValid ? (hasWarnings ? 'warning' : 'success') : 'error'
        );
    },

    /**
     * Valida que el Balance General cuadre: Activos = Pasivos + Patrimonio
     */
    async validateBalanceSheet() {
        const company = CompanyService.getCurrent();
        if (!company) {
            return this.createResult(false, 'BALANCE_SHEET', '❌ No hay empresa seleccionada', {});
        }

        const accounts = await AccountingService.getChartOfAccounts();

        // Sumar por tipo
        const assets = accounts.filter(a => a.type === 'asset' && !a.isGroup);
        const liabilities = accounts.filter(a => a.type === 'liability' && !a.isGroup);
        const equity = accounts.filter(a => a.type === 'equity' && !a.isGroup);
        const revenues = accounts.filter(a => a.type === 'revenue' && !a.isGroup);
        const expenses = accounts.filter(a => a.type === 'expense' && !a.isGroup);

        const totalAssets = assets.reduce((sum, a) => sum + (a.balance || 0), 0);
        const totalLiabilities = liabilities.reduce((sum, a) => sum + (a.balance || 0), 0);
        const totalEquity = equity.reduce((sum, a) => sum + (a.balance || 0), 0);
        const totalRevenues = revenues.reduce((sum, a) => sum + (a.balance || 0), 0);
        const totalExpenses = expenses.reduce((sum, a) => sum + (a.balance || 0), 0);
        const netIncome = totalRevenues - totalExpenses;

        const rightSide = totalLiabilities + totalEquity + netIncome;
        const difference = Math.abs(totalAssets - rightSide);
        const isBalanced = difference < 0.01;

        return this.createResult(
            isBalanced,
            'BALANCE_SHEET',
            isBalanced
                ? `✅ Balance General cuadrado:\n   Activos: $${this.formatNumber(totalAssets)}\n   Pasivos + Patrimonio + Resultado: $${this.formatNumber(rightSide)}`
                : `❌ Balance General DESCUADRADO:\n   Activos: $${this.formatNumber(totalAssets)}\n   Pasivo + Patrimonio + Resultado: $${this.formatNumber(rightSide)}\n   Diferencia: $${this.formatNumber(difference)}\n\n   💡 Esto puede deberse a datos de demostración pre-cargados con saldos iniciales que no cuadran. En un sistema real, todos los saldos deben provenir de asientos contables balanceados.`,
            {
                totalAssets,
                totalLiabilities,
                totalEquity,
                netIncome,
                rightSide,
                difference,
                breakdown: {
                    assets: { count: assets.length, total: totalAssets },
                    liabilities: { count: liabilities.length, total: totalLiabilities },
                    equity: { count: equity.length, total: totalEquity },
                    revenues: { count: revenues.length, total: totalRevenues },
                    expenses: { count: expenses.length, total: totalExpenses }
                }
            },
            isBalanced ? 'success' : 'error'
        );
    },

    // ============================================
    // VALIDACIONES DE FLUJO
    // ============================================

    /**
     * Valida que una venta genere asiento en GL
     */
    async validateSaleGeneratesEntry(invoiceId) {
        const invoice = await DB.get('customerInvoices', invoiceId);
        if (!invoice) {
            return this.createResult(false, 'SALE_GENERATES_ENTRY', '❌ Factura no encontrada', { invoiceId });
        }

        // Buscar asiento contable relacionado
        const company = CompanyService.getCurrent();
        const entries = await DB.getByIndex('journalEntries', 'companyId', company.id);
        const relatedEntry = entries.find(e =>
            e.sourceDocument === 'customerInvoice' && e.sourceDocumentId === invoiceId
        );

        const hasEntry = !!relatedEntry;

        return this.createResult(
            hasEntry,
            'SALE_GENERATES_ENTRY',
            hasEntry
                ? `✅ Venta ${invoice.number} generó asiento contable ${relatedEntry.number}`
                : `❌ Venta ${invoice.number} NO ha generado asiento contable`,
            { invoice, relatedEntry },
            hasEntry ? 'success' : 'warning'
        );
    },

    /**
     * Valida que una venta reduzca inventario en WM
     */
    async validateSaleReducesInventory(invoiceId) {
        const invoice = await DB.get('customerInvoices', invoiceId);
        if (!invoice) {
            return this.createResult(false, 'SALE_REDUCES_INVENTORY', '❌ Factura no encontrada', { invoiceId });
        }

        // Buscar movimientos de stock relacionados
        const company = CompanyService.getCurrent();
        const movements = await DB.getByIndex('stockMovements', 'companyId', company.id);
        const relatedMovements = movements.filter(m =>
            m.reference === invoice.number && m.type === 'sale'
        );

        const hasMovements = relatedMovements.length > 0;

        return this.createResult(
            hasMovements,
            'SALE_REDUCES_INVENTORY',
            hasMovements
                ? `✅ Venta ${invoice.number} generó ${relatedMovements.length} movimiento(s) de inventario (salida)`
                : `❌ Venta ${invoice.number} NO ha generado movimientos de inventario`,
            { invoice, relatedMovements },
            hasMovements ? 'success' : 'warning'
        );
    },

    /**
     * Valida que un cobro afecte tesorería en FI
     */
    async validatePaymentAffectsTreasury(paymentId) {
        const payment = await DB.get('customerPayments', paymentId);
        if (!payment) {
            return this.createResult(false, 'PAYMENT_AFFECTS_TREASURY', '❌ Pago no encontrado', { paymentId });
        }

        // Verificar si hay transacción bancaria relacionada
        const bankTransactions = await DB.getAll('bankTransactions');
        const relatedTransaction = bankTransactions.find(t =>
            t.reference === payment.reference || t.sourceDocumentId === paymentId
        );

        const hasTreasuryEffect = !!relatedTransaction;

        return this.createResult(
            hasTreasuryEffect,
            'PAYMENT_AFFECTS_TREASURY',
            hasTreasuryEffect
                ? `✅ Cobro afecta tesorería: ${relatedTransaction.description || 'Transacción bancaria registrada'}`
                : `⚠️ Cobro registrado pero sin movimiento bancario explícito`,
            { payment, relatedTransaction },
            hasTreasuryEffect ? 'success' : 'info'
        );
    },

    /**
     * Valida secuencia lógica (no puedes cobrar antes de vender)
     */
    async validateSequenceLogic(documentType, documentId) {
        const validations = [];

        switch (documentType) {
            case 'customerPayment':
                // Verificar que existe la factura primero
                const payment = await DB.get('customerPayments', documentId);
                if (payment && payment.invoiceId) {
                    const invoice = await DB.get('customerInvoices', payment.invoiceId);
                    if (invoice) {
                        const paymentDate = new Date(payment.date);
                        const invoiceDate = new Date(invoice.date);

                        if (paymentDate < invoiceDate) {
                            validations.push(this.createResult(
                                false,
                                'SEQUENCE_PAYMENT_AFTER_INVOICE',
                                `❌ Error de secuencia: Cobro (${payment.date}) es anterior a la factura (${invoice.date})`,
                                { payment, invoice },
                                'error'
                            ));
                        } else {
                            validations.push(this.createResult(
                                true,
                                'SEQUENCE_PAYMENT_AFTER_INVOICE',
                                `✅ Secuencia correcta: Factura (${invoice.date}) → Cobro (${payment.date})`,
                                { payment, invoice },
                                'success'
                            ));
                        }
                    }
                }
                break;

            case 'customerInvoice':
                // Verificar que existe el pedido primero (si aplica)
                const invoice = await DB.get('customerInvoices', documentId);
                if (invoice && invoice.salesOrderId) {
                    const order = await DB.get('salesOrders', invoice.salesOrderId);
                    if (order) {
                        const invoiceDate = new Date(invoice.date);
                        const orderDate = new Date(order.date);

                        if (invoiceDate < orderDate) {
                            validations.push(this.createResult(
                                false,
                                'SEQUENCE_INVOICE_AFTER_ORDER',
                                `❌ Error de secuencia: Factura (${invoice.date}) es anterior al pedido (${order.date})`,
                                { invoice, order },
                                'error'
                            ));
                        } else {
                            validations.push(this.createResult(
                                true,
                                'SEQUENCE_INVOICE_AFTER_ORDER',
                                `✅ Secuencia correcta: Pedido (${order.date}) → Factura (${invoice.date})`,
                                { invoice, order },
                                'success'
                            ));
                        }
                    }
                }
                break;
        }

        return validations.length > 0 ? validations : [this.createResult(true, 'SEQUENCE_OK', '✅ Secuencia lógica correcta', {}, 'success')];
    },

    // ============================================
    // VALIDACIONES PEDAGÓGICAS
    // ============================================

    /**
     * Obtiene el progreso de transacciones requeridas
     */
    async getTransactionProgress() {
        const company = CompanyService.getCurrent();
        if (!company) return { completed: 0, total: 6, transactions: [] };

        const transactions = [
            {
                id: 'create_customer',
                name: 'Crear Cliente',
                description: 'Registrar un cliente en el sistema',
                module: 'ventas',
                view: 'clientes',
                check: async () => {
                    const customers = await DB.getByIndex('customers', 'companyId', company.id);
                    return customers.length > 0;
                }
            },
            {
                id: 'create_sales_order',
                name: 'Crear Pedido de Venta',
                description: 'Registrar un pedido de venta (SD)',
                module: 'ventas',
                view: 'pedidos-venta',
                check: async () => {
                    const orders = await DB.getByIndex('salesOrders', 'companyId', company.id);
                    return orders.length > 0;
                }
            },
            {
                id: 'create_invoice',
                name: 'Emitir Factura',
                description: 'Generar factura de venta y asiento automático',
                module: 'ventas',
                view: 'facturas-cliente',
                check: async () => {
                    const invoices = await DB.getByIndex('customerInvoices', 'companyId', company.id);
                    return invoices.length > 0;
                }
            },
            {
                id: 'create_journal_entry',
                name: 'Crear Asiento Contable',
                description: 'Registrar transacción en el Libro Mayor (GL)',
                module: 'contabilidad',
                view: 'asientos',
                check: async () => {
                    const entries = await DB.getByIndex('journalEntries', 'companyId', company.id);
                    return entries.length > 0;
                }
            },
            {
                id: 'register_payment',
                name: 'Registrar Cobro',
                description: 'Registrar pago recibido del cliente (FI)',
                module: 'tesoreria',
                view: 'cuentas-cobrar',
                check: async () => {
                    const payments = await DB.getByIndex('customerPayments', 'companyId', company.id);
                    return payments && payments.length > 0;
                }
            },
            {
                id: 'view_balance',
                name: 'Consultar Balance',
                description: 'Visualizar el Balance General',
                module: 'reportes',
                view: 'balance-general',
                check: async () => {
                    // Se considera completado si hay al menos un asiento contabilizado
                    const entries = await DB.getByIndex('journalEntries', 'companyId', company.id);
                    return entries.some(e => e.status === 'posted');
                }
            }
        ];

        // Verificar cada transacción
        const results = [];
        for (const tx of transactions) {
            const completed = await tx.check();
            results.push({
                ...tx,
                completed,
                check: undefined // No serializar la función
            });
        }

        return {
            completed: results.filter(r => r.completed).length,
            total: results.length,
            percentage: Math.round((results.filter(r => r.completed).length / results.length) * 100),
            transactions: results
        };
    },

    /**
     * Valida el ciclo completo de una transacción
     */
    async validateCompleteTransaction(startDocType, startDocId) {
        const tracechain = [];
        const company = CompanyService.getCurrent();

        // Objeto para rastrear el flujo completo
        let currentDoc = { type: startDocType, id: startDocId };

        // Función para agregar al chain
        const addToChain = (step, status, details) => {
            tracechain.push({ step, status, details, timestamp: new Date().toISOString() });
        };

        try {
            switch (startDocType) {
                case 'salesOrder':
                    const order = await DB.get('salesOrders', startDocId);
                    if (!order) {
                        addToChain('Pedido de Venta', 'not_found', { id: startDocId });
                        break;
                    }
                    addToChain('Pedido de Venta', 'found', { number: order.number, status: order.status, total: order.total });

                    // Buscar entregas asociadas
                    const deliveries = await DB.getByIndex('deliveries', 'companyId', company.id);
                    const relatedDelivery = deliveries.find(d => d.salesOrderId === startDocId);
                    if (relatedDelivery) {
                        addToChain('Entrega', 'found', { number: relatedDelivery.number, status: relatedDelivery.status });
                    } else {
                        addToChain('Entrega', 'pending', { message: 'Aún no se ha procesado la entrega' });
                    }

                    // Buscar factura asociada
                    const invoices = await DB.getByIndex('customerInvoices', 'companyId', company.id);
                    const relatedInvoice = invoices.find(i => i.salesOrderId === startDocId);
                    if (relatedInvoice) {
                        addToChain('Factura de Venta', 'found', {
                            number: relatedInvoice.number,
                            status: relatedInvoice.status,
                            total: relatedInvoice.total
                        });

                        // Buscar asiento contable
                        const entries = await DB.getByIndex('journalEntries', 'companyId', company.id);
                        const relatedEntry = entries.find(e =>
                            e.sourceDocument === 'customerInvoice' && e.sourceDocumentId === relatedInvoice.id
                        );
                        if (relatedEntry) {
                            addToChain('Asiento Contable', 'found', {
                                number: relatedEntry.number,
                                status: relatedEntry.status,
                                totalDebit: relatedEntry.totalDebit
                            });
                        } else {
                            addToChain('Asiento Contable', 'pending', { message: 'Factura no contabilizada' });
                        }

                        // Buscar pagos asociados
                        const payments = await DB.getByIndex('customerPayments', 'companyId', company.id);
                        const relatedPayments = payments ? payments.filter(p => p.invoiceId === relatedInvoice.id) : [];
                        if (relatedPayments.length > 0) {
                            const totalPaid = relatedPayments.reduce((sum, p) => sum + p.amount, 0);
                            addToChain('Cobros', 'found', {
                                count: relatedPayments.length,
                                totalPaid,
                                balance: relatedInvoice.total - totalPaid
                            });
                        } else {
                            addToChain('Cobros', 'pending', { message: 'No hay cobros registrados' });
                        }
                    } else {
                        addToChain('Factura de Venta', 'pending', { message: 'Pedido aún no facturado' });
                    }
                    break;

                case 'customerInvoice':
                    // Similar al caso anterior pero empezando desde la factura
                    const inv = await DB.get('customerInvoices', startDocId);
                    if (!inv) {
                        addToChain('Factura de Venta', 'not_found', { id: startDocId });
                        break;
                    }
                    addToChain('Factura de Venta', 'found', { number: inv.number, status: inv.status, total: inv.total });

                    // ... resto de la lógica similar
                    break;
            }
        } catch (error) {
            addToChain('Error', 'error', { message: error.message });
        }

        return {
            startDocument: { type: startDocType, id: startDocId },
            tracechain,
            isComplete: tracechain.every(t => t.status === 'found'),
            summary: this.generateTraceSummary(tracechain)
        };
    },

    /**
     * Genera un resumen del trace
     */
    generateTraceSummary(tracechain) {
        const found = tracechain.filter(t => t.status === 'found').length;
        const pending = tracechain.filter(t => t.status === 'pending').length;
        const errors = tracechain.filter(t => t.status === 'error' || t.status === 'not_found').length;

        return {
            found,
            pending,
            errors,
            total: tracechain.length,
            completeness: Math.round((found / tracechain.length) * 100)
        };
    },

    // ============================================
    // UTILIDADES
    // ============================================

    formatNumber(num) {
        return new Intl.NumberFormat('es-CL').format(num);
    },

    formatRUT(rut) {
        const clean = rut.replace(/[.-]/g, '');
        const body = clean.slice(0, -1);
        const dv = clean.slice(-1).toUpperCase();
        return body.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
    },

    formatDate(date) {
        return new Intl.DateTimeFormat('es-CL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date);
    },

    /**
     * Ejecuta todas las validaciones contables para un asiento
     */
    async validateJournalEntry(entryData) {
        const results = [];

        // 1. Validar balance
        results.push(this.validateDebitCreditBalance(entryData.lines));

        // 2. Validar fecha
        results.push(this.validateDate(entryData.date));

        // 3. Validar cada cuenta
        for (const line of entryData.lines) {
            results.push(await this.validateAccountExists(line.accountId));
            results.push(await this.validateAccountNature(line.accountId, line.debit, line.credit));
        }

        return {
            isValid: results.every(r => r.isValid || r.severity !== 'error'),
            results,
            errors: results.filter(r => r.severity === 'error'),
            warnings: results.filter(r => r.severity === 'warning'),
            info: results.filter(r => r.severity === 'info' || r.severity === 'success')
        };
    },

    /**
     * Ejecuta validaciones de flujo completas
     */
    async validateBusinessFlow(documentType, documentId) {
        const results = [];

        switch (documentType) {
            case 'customerInvoice':
                results.push(await this.validateSaleGeneratesEntry(documentId));
                results.push(await this.validateSaleReducesInventory(documentId));
                results.push(...await this.validateSequenceLogic('customerInvoice', documentId));
                break;

            case 'customerPayment':
                results.push(await this.validatePaymentAffectsTreasury(documentId));
                results.push(...await this.validateSequenceLogic('customerPayment', documentId));
                break;
        }

        return {
            documentType,
            documentId,
            results,
            allValid: results.every(r => r.isValid || r.severity !== 'error')
        };
    }
};

// Hacer disponible globalmente
window.ValidationService = ValidationService;
