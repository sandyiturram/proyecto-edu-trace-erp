/**
 * EDU-TRACE ERP - Accounting Service
 * Lógica de contabilización y asientos contables
 */

const AccountingService = {
    /**
     * Obtiene el plan de cuentas de la empresa actual
     */
    async getChartOfAccounts() {
        const company = CompanyService.getCurrent();
        if (!company) return [];

        const accounts = await DB.getByIndex('accounts', 'companyId', company.id);
        return Helpers.sortBy(accounts, 'code');
    },

    /**
     * Obtiene cuenta por ID
     */
    async getAccount(id) {
        return await DB.get('accounts', id);
    },

    /**
     * Obtiene cuenta por código
     */
    async getAccountByCode(code) {
        const accounts = await this.getChartOfAccounts();
        return accounts.find(a => a.code === code);
    },

    /**
     * Obtiene cuentas de movimiento (no grupos)
     */
    async getMovementAccounts() {
        const accounts = await this.getChartOfAccounts();
        return accounts.filter(a => !a.isGroup);
    },

    /**
     * Crea una nueva cuenta contable
     */
    async createAccount(data) {
        const company = CompanyService.getCurrent();
        if (!company) throw new Error('No hay empresa seleccionada');

        // Validar código único
        const existingCode = await this.getAccountByCode(data.code);
        if (existingCode) {
            throw new Error(`Ya existe una cuenta con el código ${data.code}`);
        }

        const account = {
            id: Helpers.generateId(),
            companyId: company.id,
            ...data,
            balance: 0,
            isActive: true,
            createdAt: new Date().toISOString()
        };

        const result = await DB.add('accounts', account);
        await DB.logAudit(company.id, 'Contabilidad', 'cuenta_creada', `Cuenta ${account.code} creada`, account.id);
        return result;
    },

    /**
     * Crea un nuevo asiento contable
     */
    async createJournalEntry(data) {
        const company = CompanyService.getCurrent();
        if (!company) throw new Error('No hay empresa seleccionada');

        // Validar que debitos = creditos
        const totalDebit = Helpers.sumBy(data.lines, 'debit');
        const totalCredit = Helpers.sumBy(data.lines, 'credit');

        if (Math.abs(totalDebit - totalCredit) > 0.01) {
            throw new Error(`El asiento no está cuadrado. Débitos: ${totalDebit}, Créditos: ${totalCredit}`);
        }

        // Obtener número de secuencia
        const number = await DB.getNextSequence(company.id, 'journalEntry');

        // Crear asiento
        const entry = await DB.add('journalEntries', {
            companyId: company.id,
            number: Helpers.generateDocNumber('AST', number),
            date: data.date || Helpers.getCurrentDate(),
            description: data.description,
            reference: data.reference || null,
            type: data.type || 'manual',
            status: data.autoPost ? 'posted' : 'draft',
            totalDebit,
            totalCredit,
            sourceDocument: data.sourceDocument || null,
            sourceDocumentId: data.sourceDocumentId || null
        });

        // Crear líneas del asiento
        for (const line of data.lines) {
            await DB.add('journalLines', {
                entryId: entry.id,
                accountId: line.accountId,
                description: line.description || data.description,
                debit: line.debit || 0,
                credit: line.credit || 0,
                costCenterId: line.costCenterId || null
            });

            // Actualizar saldo de cuenta si está contabilizado
            if (entry.status === 'posted') {
                await this.updateAccountBalance(line.accountId, line.debit, line.credit);
            }
        }

        await DB.logAudit(company.id, 'CREATE', 'journalEntry', entry.id, { number: entry.number });
        return entry;
    },

    /**
     * Contabiliza un asiento (cambia de draft a posted)
     */
    async postJournalEntry(entryId) {
        const entry = await DB.get('journalEntries', entryId);
        if (!entry) throw new Error('Asiento no encontrado');
        if (entry.status === 'posted') throw new Error('El asiento ya está contabilizado');
        if (entry.status === 'cancelled') throw new Error('No se puede contabilizar un asiento anulado');

        // Actualizar saldos de cuentas
        const lines = await DB.getByIndex('journalLines', 'entryId', entryId);
        for (const line of lines) {
            await this.updateAccountBalance(line.accountId, line.debit, line.credit);
        }

        // Actualizar estado
        entry.status = 'posted';
        entry.postedAt = new Date().toISOString();
        await DB.update('journalEntries', entry);

        await DB.logAudit(entry.companyId, 'POST', 'journalEntry', entry.id, { number: entry.number });
        return entry;
    },

    /**
     * Anula un asiento
     */
    async cancelJournalEntry(entryId, reason) {
        const entry = await DB.get('journalEntries', entryId);
        if (!entry) throw new Error('Asiento no encontrado');
        if (entry.status === 'cancelled') throw new Error('El asiento ya está anulado');

        // Si estaba contabilizado, revertir saldos
        if (entry.status === 'posted') {
            const lines = await DB.getByIndex('journalLines', 'entryId', entryId);
            for (const line of lines) {
                // Revertir: el débito se convierte en crédito y viceversa
                await this.updateAccountBalance(line.accountId, -line.debit, -line.credit);
            }
        }

        entry.status = 'cancelled';
        entry.cancelledAt = new Date().toISOString();
        entry.cancelReason = reason;
        await DB.update('journalEntries', entry);

        await DB.logAudit(entry.companyId, 'CANCEL', 'journalEntry', entry.id, { reason });
        return entry;
    },

    /**
     * Actualiza saldo de una cuenta
     */
    async updateAccountBalance(accountId, debit, credit) {
        const account = await DB.get('accounts', accountId);
        if (!account) return;

        // Determinar naturaleza de la cuenta
        const debitNature = ['asset', 'expense'].includes(account.type);

        if (account.isContra) {
            // Cuentas contra tienen naturaleza opuesta
            account.balance += debitNature ? (credit - debit) : (debit - credit);
        } else {
            account.balance += debitNature ? (debit - credit) : (credit - debit);
        }

        await DB.update('accounts', account);
    },

    /**
     * Recalcula todos los saldos de cuentas basándose en las líneas de asientos contables
     * Útil para corregir saldos después de importación o migración de datos
     */
    async recalculateAccountBalances() {
        const company = CompanyService.getCurrent();
        if (!company) throw new Error('No hay empresa seleccionada');

        // Obtener todas las cuentas
        const accounts = await DB.getByIndex('accounts', 'companyId', company.id);
        console.log(`[Recálculo] Cuentas encontradas: ${accounts.length}`);

        // Obtener todos los asientos contabilizados
        const entries = await DB.getByIndex('journalEntries', 'companyId', company.id);
        const postedEntries = entries.filter(e => e.status === 'posted');
        console.log(`[Recálculo] Asientos totales: ${entries.length}, Contabilizados: ${postedEntries.length}`);

        // Obtener TODAS las líneas de asientos de una vez
        const allLines = await DB.getAll('journalLines');
        console.log(`[Recálculo] Total de líneas en BD: ${allLines.length}`);

        // Crear un mapa de cuentas por ID para acceso rápido
        const accountsMap = new Map();
        for (const account of accounts) {
            account.balance = 0; // Resetear saldo
            accountsMap.set(account.id, account);
        }

        // Recalcular saldos desde las líneas de asientos
        let processedLines = 0;
        let linesNotFound = 0;
        let accountsNotFound = 0;

        for (const entry of postedEntries) {
            // Buscar líneas por entryId
            const lines = allLines.filter(l => l.entryId === entry.id);

            if (lines.length === 0) {
                linesNotFound++;
                console.log(`[Recálculo] Asiento ${entry.number || entry.id} no tiene líneas`);
            }

            for (const line of lines) {
                const account = accountsMap.get(line.accountId);
                if (!account) {
                    accountsNotFound++;
                    console.log(`[Recálculo] Cuenta no encontrada para línea:`, line.accountId);
                    continue;
                }

                // Determinar naturaleza de la cuenta
                const debitNature = ['asset', 'expense'].includes(account.type);
                const debit = line.debit || 0;
                const credit = line.credit || 0;

                if (debitNature) {
                    account.balance += (debit - credit);
                } else {
                    account.balance += (credit - debit);
                }
                processedLines++;
            }
        }

        console.log(`[Recálculo] Líneas procesadas: ${processedLines}, Asientos sin líneas: ${linesNotFound}, Cuentas no encontradas: ${accountsNotFound}`);

        // Si no se procesaron líneas pero hay asientos, hay un problema de vinculación
        if (processedLines === 0 && postedEntries.length > 0) {
            console.warn('[Recálculo] ADVERTENCIA: Se encontraron asientos pero no se procesaron líneas. Verificar vinculación de journalLines.');
        }

        // Guardar todos los saldos actualizados
        for (const account of accounts) {
            await DB.update('accounts', account);
        }

        return {
            accountsUpdated: accounts.length,
            entriesProcessed: postedEntries.length,
            linesProcessed: processedLines,
            linesNotFound,
            accountsNotFound
        };
    },

    /**
     * Obtiene libro mayor de una cuenta
     */
    async getLedger(accountId, dateFrom, dateTo) {
        const entries = await this.getJournalEntries({ status: 'posted', dateFrom, dateTo });
        const movements = [];

        for (const entry of entries) {
            const lines = await DB.getByIndex('journalLines', 'entryId', entry.id);
            const accountLines = lines.filter(l => l.accountId === accountId);

            for (const line of accountLines) {
                movements.push({
                    date: entry.date,
                    entryNumber: entry.number,
                    description: line.description || entry.description,
                    debit: line.debit,
                    credit: line.credit,
                    reference: entry.reference
                });
            }
        }

        return Helpers.sortBy(movements, 'date');
    },

    /**
     * Genera el siguiente número de asiento contable
     */
    async getNextEntryNumber() {
        const company = CompanyService.getCurrent();
        if (!company) return 'AST-0001';

        const entries = await DB.getByIndex('journalEntries', 'companyId', company.id);
        const year = new Date().getFullYear();
        const prefix = `AST-${year}-`;

        const existingNumbers = entries
            .filter(e => {
                const numStr = String(e.number || '');
                return numStr.startsWith(prefix) || numStr.startsWith('AST-');
            })
            .map(e => {
                const numStr = String(e.number || '');
                const match = numStr.match(/(\d+)$/);
                return match ? parseInt(match[1]) : 0;
            });

        const nextNum = Math.max(0, ...existingNumbers) + 1;
        return `${prefix}${String(nextNum).padStart(4, '0')}`;
    },

    /**
     * Obtiene asientos contables
     */
    async getJournalEntries(filters = {}) {
        const company = CompanyService.getCurrent();
        if (!company) return [];

        let entries = await DB.getByIndex('journalEntries', 'companyId', company.id);

        // Aplicar filtros
        if (filters.status) {
            entries = entries.filter(e => e.status === filters.status);
        }
        if (filters.dateFrom) {
            entries = entries.filter(e => e.date >= filters.dateFrom);
        }
        if (filters.dateTo) {
            entries = entries.filter(e => e.date <= filters.dateTo);
        }
        if (filters.type) {
            entries = entries.filter(e => e.type === filters.type);
        }

        return Helpers.sortBy(entries, 'date', 'desc');
    },

    /**
     * Obtiene líneas de un asiento
     */
    async getJournalLines(entryId) {
        return await DB.getByIndex('journalLines', 'entryId', entryId);
    },

    /**
     * Calcula Balance General
     */
    async getBalanceSheet(date) {
        const accounts = await this.getChartOfAccounts();

        const assets = accounts.filter(a => a.type === 'asset' && !a.isGroup);
        const liabilities = accounts.filter(a => a.type === 'liability' && !a.isGroup);

        // Función helper para identificar si una cuenta es de "Resultado del Ejercicio" (no acumulados)
        const isCurrentPeriodResultAccount = (acc) => {
            const nameLower = acc.name.toLowerCase();
            // Es cuenta de resultado del ejercicio actual si:
            // - Contiene "resultado del ejercicio" pero NO "acumulado"
            // - O usa código específico 3.3.02 o 3.2.02
            const isResultDelEjercicio = nameLower.includes('resultado del ejercicio') && !nameLower.includes('acumulad');
            const isSpecificCode = acc.code === '3.3.02' || acc.code === '3.2.02';
            return isResultDelEjercicio || isSpecificCode;
        };

        // Excluir solo la cuenta de "Resultado del Ejercicio ACTUAL" del patrimonio 
        // (no los resultados acumulados, que son parte del patrimonio permanente)
        const equityExcludingCurrentResult = accounts.filter(a =>
            a.type === 'equity' &&
            !a.isGroup &&
            !isCurrentPeriodResultAccount(a)
        );

        // Cuentas de resultado del ejercicio actual para mostrar separadas
        const currentResultAccounts = accounts.filter(a =>
            a.type === 'equity' &&
            !a.isGroup &&
            isCurrentPeriodResultAccount(a)
        );

        const totalAssets = Helpers.sumBy(assets, 'balance');
        const totalLiabilities = Helpers.sumBy(liabilities, 'balance');
        const totalEquityExcludingCurrentResult = Helpers.sumBy(equityExcludingCurrentResult, 'balance');
        const totalCurrentResultAccounts = Helpers.sumBy(currentResultAccounts, 'balance');

        // Calcular resultado del ejercicio actual (Ingresos - Gastos)
        const result = await this.getNetIncome(date);

        // El patrimonio total es: patrimonio base + cuentas de resultado acumulado
        // Si ya hay saldo en cuenta de resultado del ejercicio actual, usarlo
        // Si no, usar el netIncome calculado dinámicamente
        const displayNetIncome = totalCurrentResultAccounts !== 0 ? totalCurrentResultAccounts : result.netIncome;
        const totalEquity = totalEquityExcludingCurrentResult + displayNetIncome;

        // Calcular diferencia para determinar si está cuadrado
        const difference = totalAssets - (totalLiabilities + totalEquity);
        const balanced = Math.abs(difference) < 0.01;

        // Clasificar activos en corrientes (1.1) y no corrientes (1.2)
        const currentAssets = assets.filter(a => a.code.startsWith('1.1'));
        const nonCurrentAssets = assets.filter(a => a.code.startsWith('1.2') || (!a.code.startsWith('1.1') && !a.code.startsWith('1.2')));

        // Clasificar pasivos en corrientes (2.1) y no corrientes (2.2)
        const currentLiabilities = liabilities.filter(l => l.code.startsWith('2.1'));
        const nonCurrentLiabilities = liabilities.filter(l => l.code.startsWith('2.2') || (!l.code.startsWith('2.1') && !l.code.startsWith('2.2')));

        const totalCurrentAssets = Helpers.sumBy(currentAssets, 'balance');
        const totalNonCurrentAssets = Helpers.sumBy(nonCurrentAssets, 'balance');
        const totalCurrentLiabilities = Helpers.sumBy(currentLiabilities, 'balance');
        const totalNonCurrentLiabilities = Helpers.sumBy(nonCurrentLiabilities, 'balance');

        return {
            date,
            assets: {
                items: assets,
                current: { items: currentAssets, total: totalCurrentAssets },
                nonCurrent: { items: nonCurrentAssets, total: totalNonCurrentAssets },
                total: totalAssets
            },
            liabilities: {
                items: liabilities,
                current: { items: currentLiabilities, total: totalCurrentLiabilities },
                nonCurrent: { items: nonCurrentLiabilities, total: totalNonCurrentLiabilities },
                total: totalLiabilities
            },
            equity: {
                items: equityExcludingCurrentResult.concat(currentResultAccounts),
                total: totalEquity
            },
            netIncome: displayNetIncome,
            difference: difference,
            balanced: balanced
        };
    },

    /**
     * Calcula Estado de Resultados
     */
    async getIncomeStatement(dateFrom, dateTo) {
        const accounts = await this.getChartOfAccounts();

        const revenues = accounts.filter(a => a.type === 'revenue' && !a.isGroup);
        const expenses = accounts.filter(a => a.type === 'expense' && !a.isGroup);

        let totalRevenue = Helpers.sumBy(revenues, 'balance');
        let totalExpenses = Helpers.sumBy(expenses, 'balance');

        // LÓGICA SISTEMA CENTRALIZADOR: Incluir movimientos de libros auxiliares que aún no se centralizan
        const company = CompanyService.getCurrent();
        if (company && company.accountingSystem === 'centralizer') {
            const auxiliaryJournals = await DB.getByIndex('auxiliaryJournals', 'companyId', company.id);
            const openJournals = auxiliaryJournals.filter(j => j.status === 'open');

            for (const journal of openJournals) {
                for (const trans of journal.transactions) {
                    // Filtrar por fecha si aplica
                    if (dateFrom && trans.date < dateFrom) continue;
                    if (dateTo && trans.date > dateTo) continue;

                    for (const line of trans.lines) {
                        const account = revenues.find(a => a.id === line.accountId) ||
                            expenses.find(a => a.id === line.accountId);

                        if (!account) continue;

                        const amount = (['revenue', 'liability', 'equity'].includes(account.type))
                            ? (line.credit - line.debit)
                            : (line.debit - line.credit);

                        if (account.type === 'revenue') {
                            totalRevenue += amount;
                        } else {
                            totalExpenses += amount;
                        }

                        // Actualizar el saldo en el objeto para que el detalle del reporte sea consistente
                        account.balance = (account.balance || 0) + amount;
                    }
                }
            }
        }

        const netIncome = totalRevenue - totalExpenses;

        const isProvisional = company && company.accountingSystem === 'centralizer';

        // Clasificar específicamente el Costo de Ventas (generalmente códigos que empiezan con 5)
        const costOfSalesItems = expenses.filter(e => e.code.startsWith('5') && e.balance !== 0);
        const totalCostOfSales = Helpers.sumBy(costOfSalesItems, 'balance');

        // El resto son Gastos de Administración, Ventas y otros
        const otherExpenseItems = expenses.filter(e => !e.code.startsWith('5') && e.balance !== 0);
        const totalOtherExpenses = Helpers.sumBy(otherExpenseItems, 'balance');

        return {
            period: { from: dateFrom, to: dateTo },
            isProvisional,
            revenues: { items: revenues.filter(r => r.balance !== 0), total: totalRevenue },
            expenses: { items: expenses.filter(e => e.balance !== 0), total: totalExpenses },
            costOfSales: { items: costOfSalesItems, total: totalCostOfSales },
            otherExpenses: { items: otherExpenseItems, total: totalOtherExpenses },
            grossProfit: totalRevenue - totalCostOfSales,
            operatingIncome: totalRevenue - Helpers.sumBy(expenses.filter(e => e.code.startsWith('5') || e.code.startsWith('6.1') || e.code.startsWith('6.2')), 'balance'),
            netIncome
        };
    },

    /**
     * Obtiene resultado neto
     */
    async getNetIncome(date) {
        const statement = await this.getIncomeStatement(null, date);
        return { netIncome: statement.netIncome };
    },

    /**
     * Genera asiento de cierre
     */
    async generateClosingEntry(fiscalYear) {
        const statement = await this.getIncomeStatement(`${fiscalYear}-01-01`, `${fiscalYear}-12-31`);

        const lines = [];

        // Cerrar cuentas de ingresos (débito)
        for (const revenue of statement.revenues.items) {
            if (revenue.balance > 0) {
                lines.push({ accountId: revenue.id, debit: revenue.balance, credit: 0 });
            }
        }

        // Cerrar cuentas de gastos (crédito)
        for (const expense of statement.expenses.items) {
            if (expense.balance > 0) {
                lines.push({ accountId: expense.id, debit: 0, credit: expense.balance });
            }
        }

        // Resultado a Resultados Acumulados o del Ejercicio
        const resultAccount = await this.getAccountByCode('3.3.02');
        if (resultAccount) {
            if (statement.netIncome > 0) {
                lines.push({ accountId: resultAccount.id, debit: 0, credit: statement.netIncome });
            } else {
                lines.push({ accountId: resultAccount.id, debit: Math.abs(statement.netIncome), credit: 0 });
            }
        }

        return await this.createJournalEntry({
            date: `${fiscalYear}-12-31`,
            description: `Asiento de cierre ejercicio ${fiscalYear}`,
            type: 'closing',
            lines,
        });
    },

    // ========================================
    // SISTEMA DUAL: Jornalizador + Centralizador
    // ========================================

    /**
     * Registra una transacción según el sistema de contabilización configurado
     * @param {string} moduleSource - Origen: 'sales', 'purchases', 'treasury'
     * @param {object} transactionData - Datos de la transacción
     */
    async registerTransaction(moduleSource, transactionData) {
        const company = CompanyService.getCurrent();
        if (!company) throw new Error('No hay empresa seleccionada');

        // Determinar sistema: por defecto 'journalizer' para retrocompatibilidad
        const accountingSystem = company.accountingSystem || 'journalizer';

        if (accountingSystem === 'centralizer') {
            // Sistema centralizador: registrar en libro auxiliar
            return await this.addToAuxiliaryJournal(moduleSource, transactionData);
        } else {
            // Sistema jornalizador: registrar directo en Libro Diario
            return await this.createJournalEntry(transactionData);
        }
    },

    /**
     * Agrega transacción al libro auxiliar correspondiente
     * @param {string} module - 'sales', 'purchases', 'treasury'
     * @param {object} transactionData - Datos de la transacción
     */
    async addToAuxiliaryJournal(module, transactionData) {
        const company = CompanyService.getCurrent();
        if (!company) throw new Error('No hay empresa seleccionada');

        const period = transactionData.date.substring(0, 7); // YYYY-MM

        // Buscar o crear libro auxiliar para el módulo y período
        let auxiliaryJournal = await this.getAuxiliaryJournal(module, period);

        if (!auxiliaryJournal) {
            // Crear nuevo libro auxiliar
            auxiliaryJournal = await DB.add('auxiliaryJournals', {
                companyId: company.id,
                module,
                period,
                status: 'open',
                transactions: [],
                centralizedEntryId: null
            });
        }

        // Agregar transacción al libro auxiliar
        const transaction = {
            transactionId: Helpers.generateId(),
            date: transactionData.date,
            description: transactionData.description,
            reference: transactionData.reference || null,
            sourceDocument: transactionData.sourceDocument || null,
            sourceDocumentId: transactionData.sourceDocumentId || null,
            lines: transactionData.lines
        };

        auxiliaryJournal.transactions.push(transaction);
        await DB.update('auxiliaryJournals', auxiliaryJournal);

        await DB.logAudit(company.id, 'ADD_TO_AUXILIARY', module, transaction.transactionId, {
            module, period
        });

        return { auxiliaryJournal, transaction };
    },

    /**
     * Obtiene libro auxiliar por módulo y período
     * @param {string} module - 'sales', 'purchases', 'treasury'
     * @param {string} period - 'YYYY-MM'
     */
    async getAuxiliaryJournal(module, period) {
        const company = CompanyService.getCurrent();
        if (!company) return null;

        const journals = await DB.getByIndex('auxiliaryJournals', 'companyId', company.id);
        return journals.find(j => j.module === module && j.period === period);
    },

    /**
     * Obtiene todos los libros auxiliares de un período
     * @param {string} period - 'YYYY-MM'
     */
    async getAuxiliaryJournals(period = null) {
        const company = CompanyService.getCurrent();
        if (!company) return [];

        let journals = await DB.getByIndex('auxiliaryJournals', 'companyId', company.id);

        if (period) {
            journals = journals.filter(j => j.period === period);
        }

        return journals;
    },

    /**
     * Centraliza un libro auxiliar generando asiento resumen en el Libro Diario
     * @param {string} module - 'sales', 'purchases', 'treasury'
     * @param {string} period - 'YYYY-MM'
     */
    async centralizeAuxiliaryJournal(module, period) {
        const company = CompanyService.getCurrent();
        if (!company) throw new Error('No hay empresa seleccionada');

        const auxiliaryJournal = await this.getAuxiliaryJournal(module, period);
        if (!auxiliaryJournal) {
            throw new Error(`No se encontró libro auxiliar para ${module} en período ${period}`);
        }

        if (auxiliaryJournal.status === 'centralized') {
            // Verificar si el asiento centralizado fue anulado para permitir re-centralizar
            if (auxiliaryJournal.centralizedEntryId) {
                const prevEntry = await DB.get('journalEntries', auxiliaryJournal.centralizedEntryId);
                if (prevEntry && prevEntry.status === 'cancelled') {
                    // Resetear libro: el asiento fue anulado, se puede volver a centralizar
                    auxiliaryJournal.status = 'open';
                    auxiliaryJournal.centralizedEntryId = null;
                    auxiliaryJournal.centralizedAt = null;
                    await DB.update('auxiliaryJournals', auxiliaryJournal);
                } else {
                    throw new Error('Este libro auxiliar ya fue centralizado. Anule primero el asiento de centralización para volver a centralizar.');
                }
            } else {
                throw new Error('Este libro auxiliar ya fue centralizado.');
            }
        }

        // Consolidar líneas contables de todas las transacciones
        const consolidatedLines = {};

        for (const transaction of auxiliaryJournal.transactions) {
            for (const line of transaction.lines) {
                const key = line.accountId;
                if (!consolidatedLines[key]) {
                    consolidatedLines[key] = {
                        accountId: line.accountId,
                        debit: 0,
                        credit: 0
                    };
                }
                consolidatedLines[key].debit += (line.debit || 0);
                consolidatedLines[key].credit += (line.credit || 0);
            }
        }

        // Convertir a array y filtrar líneas con saldo 0
        const lines = Object.values(consolidatedLines).filter(l =>
            l.debit !== 0 || l.credit !== 0
        );

        // Nombres de módulos para descripción
        const moduleNames = {
            sales: 'Ventas',
            purchases: 'Compras',
            treasury: 'Tesorería'
        };

        // Crear asiento centralizado
        // Obtener último día del mes del período
        const [year, month] = period.split('-').map(Number);
        const lastDay = new Date(year, month, 0).getDate();  // Día 0 del mes siguiente = último día del mes actual
        const centralizedEntry = await this.createJournalEntry({
            date: `${period}-${String(lastDay).padStart(2, '0')}`,  // Último día del mes
            description: `Centralización ${moduleNames[module]} - ${period}`,
            reference: `CENTRAL-${module.toUpperCase()}-${period}`,
            type: 'centralization',
            sourceDocument: 'auxiliaryJournal',
            sourceDocumentId: auxiliaryJournal.id,
            lines,
            autoPost: false  // Requiere contabilización manual
        });

        // Actualizar libro auxiliar
        auxiliaryJournal.status = 'centralized';
        auxiliaryJournal.centralizedEntryId = centralizedEntry.id;
        auxiliaryJournal.centralizedAt = new Date().toISOString();
        await DB.update('auxiliaryJournals', auxiliaryJournal);

        await DB.logAudit(company.id, 'CENTRALIZE', module, auxiliaryJournal.id, {
            period, entryId: centralizedEntry.id, transactionCount: auxiliaryJournal.transactions.length
        });

        return {
            auxiliaryJournal,
            centralizedEntry,
            transactionCount: auxiliaryJournal.transactions.length,
            linesConsolidated: lines.length
        };
    }
};

// Hacer disponible globalmente
window.AccountingService = AccountingService;
