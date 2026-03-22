/**
 * EDU-TRACE ERP - IndexedDB Database Manager
 * Gestiona la base de datos local para persistencia de datos
 */

const DB = {
    name: 'EDU_TRACE_ERP_DB',
    version: 3,  // Incrementado para agregar soporte de sistema dual
    db: null,

    // Definición de stores (tablas)
    stores: {
        companies: { keyPath: 'id', indexes: ['name', 'rut', 'createdAt'] },
        accounts: { keyPath: 'id', indexes: ['companyId', 'code', 'type', 'parentId'] },
        journalEntries: { keyPath: 'id', indexes: ['companyId', 'date', 'number', 'status'] },
        journalLines: { keyPath: 'id', indexes: ['entryId', 'accountId'] },
        auxiliaryJournals: { keyPath: 'id', indexes: ['companyId', 'module', 'period', 'status'] },  // NUEVO: Libros auxiliares para sistema centralizador
        suppliers: { keyPath: 'id', indexes: ['companyId', 'rut', 'name'] },
        customers: { keyPath: 'id', indexes: ['companyId', 'rut', 'name'] },
        products: { keyPath: 'id', indexes: ['companyId', 'code', 'name', 'category'] },
        purchaseOrders: { keyPath: 'id', indexes: ['companyId', 'supplierId', 'date', 'status'] },
        purchaseOrderLines: { keyPath: 'id', indexes: ['orderId', 'productId'] },
        supplierInvoices: { keyPath: 'id', indexes: ['companyId', 'supplierId', 'date', 'status', 'dueDate'] },
        supplierInvoiceLines: { keyPath: 'id', indexes: ['invoiceId', 'productId'] },
        salesOrders: { keyPath: 'id', indexes: ['companyId', 'customerId', 'date', 'status'] },
        salesOrderLines: { keyPath: 'id', indexes: ['orderId', 'productId'] },
        customerInvoices: { keyPath: 'id', indexes: ['companyId', 'customerId', 'date', 'status', 'dueDate'] },
        customerInvoiceLines: { keyPath: 'id', indexes: ['invoiceId', 'productId'] },
        stockMovements: { keyPath: 'id', indexes: ['companyId', 'productId', 'date', 'type'] },
        bankAccounts: { keyPath: 'id', indexes: ['companyId', 'accountNumber'] },
        bankTransactions: { keyPath: 'id', indexes: ['bankAccountId', 'date', 'type'] },
        payments: { keyPath: 'id', indexes: ['companyId', 'date', 'type', 'entityId'] },
        customerPayments: { keyPath: 'id', indexes: ['companyId', 'customerId', 'invoiceId', 'date'] },
        supplierPayments: { keyPath: 'id', indexes: ['companyId', 'supplierId', 'invoiceId', 'date'] },
        deliveries: { keyPath: 'id', indexes: ['companyId', 'salesOrderId', 'date', 'status'] },
        costCenters: { keyPath: 'id', indexes: ['companyId', 'code', 'parentId'] },
        internalOrders: { keyPath: 'id', indexes: ['companyId', 'costCenterId', 'status'] },
        employees: { keyPath: 'id', indexes: ['companyId', 'rut', 'department'] },
        payroll: { keyPath: 'id', indexes: ['companyId', 'employeeId', 'period'] },
        payrollLines: { keyPath: 'id', indexes: ['payrollId', 'type'] },
        sequences: { keyPath: 'id', indexes: ['companyId', 'type'] },
        settings: { keyPath: 'id', indexes: ['companyId'] },
        auditLog: { keyPath: 'id', indexes: ['companyId', 'timestamp', 'action', 'entity'] }
    },

    /**
     * Inicializa la base de datos
     */
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.name, this.version);

            request.onerror = () => {
                console.error('Error opening database:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Crear stores
                for (const [storeName, config] of Object.entries(this.stores)) {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, { keyPath: config.keyPath });

                        // Crear índices
                        if (config.indexes) {
                            config.indexes.forEach(indexName => {
                                store.createIndex(indexName, indexName, { unique: false });
                            });
                        }

                        console.log(`Store created: ${storeName}`);
                    }
                }
            };
        });
    },

    /**
     * Obtiene una transacción
     */
    getTransaction(storeNames, mode = 'readonly') {
        if (!this.db) throw new Error('Database not initialized');
        const names = Array.isArray(storeNames) ? storeNames : [storeNames];
        return this.db.transaction(names, mode);
    },

    /**
     * Obtiene un store
     */
    getStore(storeName, mode = 'readonly') {
        const transaction = this.getTransaction(storeName, mode);
        return transaction.objectStore(storeName);
    },

    /**
     * Agrega un registro
     */
    async add(storeName, data) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readwrite');
            const record = {
                ...data,
                id: data.id || Helpers.generateId(),
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            const request = store.add(record);
            request.onsuccess = () => resolve(record);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Actualiza un registro
     */
    async update(storeName, data) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readwrite');
            const record = {
                ...data,
                updatedAt: new Date().toISOString()
            };

            const request = store.put(record);
            request.onsuccess = () => resolve(record);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Elimina un registro
     */
    async delete(storeName, id) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readwrite');
            const request = store.delete(id);
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Obtiene un registro por ID
     */
    async get(storeName, id) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readonly');
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Obtiene todos los registros
     */
    async getAll(storeName) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readonly');
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Obtiene registros por índice
     */
    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            try {
                const store = this.getStore(storeName, 'readonly');

                // Verificar si el índice existe
                if (!store.indexNames.contains(indexName)) {
                    // Si no existe el índice, buscar manualmente filtrando todos los registros
                    const request = store.getAll();
                    request.onsuccess = () => {
                        const results = (request.result || []).filter(r => r[indexName] === value);
                        resolve(results);
                    };
                    request.onerror = () => reject(request.error);
                    return;
                }

                const index = store.index(indexName);
                const request = index.getAll(value);
                request.onsuccess = () => resolve(request.result || []);
                request.onerror = () => reject(request.error);
            } catch (err) {
                reject(err);
            }
        });
    },

    /**
     * Cuenta registros
     */
    async count(storeName) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readonly');
            const request = store.count();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Limpia un store
     */
    async clear(storeName) {
        return new Promise((resolve, reject) => {
            const store = this.getStore(storeName, 'readwrite');
            const request = store.clear();
            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    },

    /**
     * Obtiene el siguiente número de secuencia
     */
    async getNextSequence(companyId, type) {
        const sequences = await this.getByIndex('sequences', 'companyId', companyId);
        let seq = sequences.find(s => s.type === type);

        if (!seq) {
            seq = await this.add('sequences', {
                companyId,
                type,
                current: 1
            });
            return 1;
        }

        seq.current += 1;
        await this.update('sequences', seq);
        return seq.current;
    },

    /**
     * Exporta todos los datos de una empresa
     */
    async exportCompanyData(companyId) {
        const data = { exportDate: new Date().toISOString(), companyId };

        for (const storeName of Object.keys(this.stores)) {
            if (storeName === 'companies') {
                data[storeName] = [await this.get(storeName, companyId)];
            } else {
                const allRecords = await this.getAll(storeName);
                data[storeName] = allRecords.filter(r => r.companyId === companyId);
            }
        }

        return data;
    },

    /**
     * Normaliza tipo de cuenta de español a inglés
     */
    normalizeAccountType(type) {
        const typeMap = {
            'activo': 'asset',
            'pasivo': 'liability',
            'patrimonio': 'equity',
            'ingreso': 'revenue',
            'gasto': 'expense'
        };
        return typeMap[type] || type;
    },

    /**
     * Importa datos de una empresa
     */
    async importCompanyData(data) {
        const results = { success: 0, errors: [] };

        // Primero importar la empresa si existe
        if (data.companies && Array.isArray(data.companies)) {
            for (const company of data.companies) {
                try {
                    await this.update('companies', company);
                    results.success++;
                } catch (err) {
                    results.errors.push({ store: 'companies', record: company, error: err.message });
                }
            }
        }

        // Procesar cuentas - normalizar tipos y detectar cuentas contra
        if (data.accounts && Array.isArray(data.accounts)) {
            for (const account of data.accounts) {
                try {
                    // Normalizar tipo de cuenta (español -> inglés)
                    const normalizedType = this.normalizeAccountType(account.type);

                    // Detectar si es cuenta contra (contrapartida)
                    // Una cuenta de activo con naturaleza "credit" es contra (ej: Depreciación Acumulada)
                    // Una cuenta de pasivo/patrimonio con naturaleza "debit" sería contra
                    let isContra = account.isContra || false;
                    if (!isContra && account.nature) {
                        const isAssetExpense = ['asset', 'expense'].includes(normalizedType);
                        const isLiabilityEquityRevenue = ['liability', 'equity', 'revenue'].includes(normalizedType);

                        if (isAssetExpense && account.nature === 'credit') {
                            isContra = true;
                        } else if (isLiabilityEquityRevenue && account.nature === 'debit') {
                            isContra = true;
                        }
                    }

                    const normalizedAccount = {
                        ...account,
                        type: normalizedType,
                        isContra: isContra
                    };
                    await this.update('accounts', normalizedAccount);
                    results.success++;
                } catch (err) {
                    results.errors.push({ store: 'accounts', record: account, error: err.message });
                }
            }
        }

        // Procesar asientos contables con líneas embebidas
        if (data.journalEntries && Array.isArray(data.journalEntries)) {
            for (const entry of data.journalEntries) {
                try {
                    // Extraer líneas si están embebidas
                    const lines = entry.lines || [];
                    const entryWithoutLines = { ...entry };
                    delete entryWithoutLines.lines;

                    // Calcular totales si no existen
                    if (!entryWithoutLines.totalDebit) {
                        entryWithoutLines.totalDebit = lines.reduce((sum, l) => sum + (l.debit || 0), 0);
                    }
                    if (!entryWithoutLines.totalCredit) {
                        entryWithoutLines.totalCredit = lines.reduce((sum, l) => sum + (l.credit || 0), 0);
                    }

                    // Generar número de asiento si no existe
                    if (!entryWithoutLines.number) {
                        entryWithoutLines.number = `ASI-${entry.id}`;
                    }

                    // Guardar el asiento
                    await this.update('journalEntries', entryWithoutLines);
                    results.success++;

                    // Guardar cada línea
                    for (let i = 0; i < lines.length; i++) {
                        const line = lines[i];
                        const lineRecord = {
                            id: line.id || `${entry.id}-line-${i}`,
                            entryId: entry.id,
                            companyId: entry.companyId,
                            accountId: line.accountId,
                            description: line.description || '',
                            debit: line.debit || 0,
                            credit: line.credit || 0
                        };
                        await this.update('journalLines', lineRecord);
                        results.success++;
                    }
                } catch (err) {
                    results.errors.push({ store: 'journalEntries', record: entry, error: err.message });
                }
            }
        }

        // Procesar libros auxiliares (SISTEMA DUAL)
        if (data.auxiliaryJournals && Array.isArray(data.auxiliaryJournals)) {
            for (const journal of data.auxiliaryJournals) {
                try {
                    await this.update('auxiliaryJournals', journal);
                    results.success++;
                } catch (err) {
                    results.errors.push({ store: 'auxiliaryJournals', record: journal, error: err.message });
                }
            }
        }

        // Procesar el resto de stores
        for (const [storeName, records] of Object.entries(data)) {
            // Saltar los que ya procesamos o no son stores válidos
            if (storeName === 'exportDate' || storeName === 'companyId' || storeName === 'auxiliaryJournals') continue;
            if (storeName === 'companies' || storeName === 'journalEntries' || storeName === 'accounts') continue;
            if (!this.stores[storeName]) continue;
            if (!Array.isArray(records)) continue;

            for (const record of records) {
                try {
                    await this.update(storeName, record);
                    results.success++;
                } catch (err) {
                    results.errors.push({ store: storeName, record, error: err.message });
                }
            }
        }

        // Recalcular saldos después de importar si hay asientos
        if (data.journalEntries && data.journalEntries.length > 0) {
            console.log('Recalculando saldos tras importación...');
            const importedCompanyId = data.journalEntries[0].companyId;
            await AccountingService.recalculateAccountBalances(importedCompanyId);
        }

        return results;
    },

    /**
     * Registra acción en log de auditoría
     */
    async logAudit(companyId, action, entity, entityId, details = {}) {
        await this.add('auditLog', {
            companyId,
            timestamp: new Date().toISOString(),
            action,
            entity,
            entityId,
            details,
            user: window.currentUser || 'system'
        });
    }
};

// Hacer DB disponible globalmente
window.DB = DB;
