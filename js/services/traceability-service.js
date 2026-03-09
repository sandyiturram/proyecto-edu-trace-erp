/**
 * EduERP - Traceability Service
 * Servicio de trazabilidad para seguir transacciones desde origen hasta estados financieros
 */

const TraceabilityService = {
    /**
     * Tipos de documentos en el sistema
     */
    documentTypes: {
        salesOrder: {
            name: 'Pedido de Venta',
            icon: 'fa-file-alt',
            color: '#3B82F6',
            module: 'SD (Ventas)',
            store: 'salesOrders'
        },
        delivery: {
            name: 'Entrega',
            icon: 'fa-truck',
            color: '#10B981',
            module: 'WM (Inventario)',
            store: 'deliveries'
        },
        customerInvoice: {
            name: 'Factura de Venta',
            icon: 'fa-file-invoice-dollar',
            color: '#F59E0B',
            module: 'SD (Ventas)',
            store: 'customerInvoices'
        },
        purchaseOrder: {
            name: 'Orden de Compra',
            icon: 'fa-shopping-cart',
            color: '#8B5CF6',
            module: 'MM (Compras)',
            store: 'purchaseOrders'
        },
        supplierInvoice: {
            name: 'Factura de Proveedor',
            icon: 'fa-file-invoice',
            color: '#EF4444',
            module: 'MM (Compras)',
            store: 'supplierInvoices'
        },
        journalEntry: {
            name: 'Asiento Contable',
            icon: 'fa-book',
            color: '#6366F1',
            module: 'GL (Contabilidad)',
            store: 'journalEntries'
        },
        customerPayment: {
            name: 'Cobro',
            icon: 'fa-hand-holding-usd',
            color: '#22C55E',
            module: 'FI (Tesorería)',
            store: 'customerPayments'
        },
        supplierPayment: {
            name: 'Pago a Proveedor',
            icon: 'fa-money-bill-wave',
            color: '#EC4899',
            module: 'FI (Tesorería)',
            store: 'supplierPayments'
        },
        stockMovement: {
            name: 'Movimiento de Stock',
            icon: 'fa-boxes',
            color: '#14B8A6',
            module: 'WM (Inventario)',
            store: 'stockMovements'
        },
        balanceSheet: {
            name: 'Balance General',
            icon: 'fa-balance-scale',
            color: '#DC2626',
            module: 'GL (Contabilidad)',
            store: null
        }
    },

    /**
     * Flujos de transacción estándar
     */
    standardFlows: {
        'order-to-cash': {
            name: 'Order-to-Cash (O2C)',
            description: 'Ciclo completo de venta: desde el pedido hasta el cobro',
            steps: [
                { type: 'salesOrder', label: 'Pedido de Venta' },
                { type: 'delivery', label: 'Entrega' },
                { type: 'stockMovement', label: 'Salida de Inventario' },
                { type: 'customerInvoice', label: 'Facturación' },
                { type: 'journalEntry', label: 'Asiento Contable' },
                { type: 'customerPayment', label: 'Cobro' },
                { type: 'journalEntry', label: 'Asiento de Cobro' }
            ],
            affectedAccounts: [
                { code: '1.1.02.001', name: 'Clientes Nacionales', effect: 'aumento → disminución' },
                { code: '4.1.01.001', name: 'Ventas de Mercaderías', effect: 'aumento' },
                { code: '1.1.03.001', name: 'Mercaderías', effect: 'disminución' },
                { code: '5.1.01', name: 'Costo de Mercaderías Vendidas', effect: 'aumento' },
                { code: '1.1.01.001', name: 'Caja/Banco', effect: 'aumento' },
                { code: '2.1.03.001', name: 'IVA Débito Fiscal', effect: 'aumento' }
            ]
        },
        'procure-to-pay': {
            name: 'Procure-to-Pay (P2P)',
            description: 'Ciclo completo de compra: desde la orden hasta el pago',
            steps: [
                { type: 'purchaseOrder', label: 'Orden de Compra' },
                { type: 'stockMovement', label: 'Entrada de Inventario' },
                { type: 'supplierInvoice', label: 'Factura de Proveedor' },
                { type: 'journalEntry', label: 'Asiento Contable' },
                { type: 'supplierPayment', label: 'Pago' },
                { type: 'journalEntry', label: 'Asiento de Pago' }
            ],
            affectedAccounts: [
                { code: '1.1.03.001', name: 'Mercaderías', effect: 'aumento' },
                { code: '2.1.01.001', name: 'Proveedores Nacionales', effect: 'aumento → disminución' },
                { code: '1.1.04.001', name: 'IVA Crédito Fiscal', effect: 'aumento' },
                { code: '1.1.01.001', name: 'Caja/Banco', effect: 'disminución' }
            ]
        }
    },

    /**
     * Obtiene la traza completa de un documento
     */
    async getDocumentTrace(documentType, documentId) {
        const company = CompanyService.getCurrent();
        if (!company) return null;

        const trace = {
            origin: { type: documentType, id: documentId, data: null },
            chain: [],
            financialImpact: [],
            timeline: [],
            status: 'incomplete'
        };

        try {
            // Obtener documento origen
            const typeInfo = this.documentTypes[documentType];
            if (!typeInfo) {
                throw new Error(`Tipo de documento desconocido: ${documentType}`);
            }

            const originDoc = await DB.get(typeInfo.store, documentId);
            if (!originDoc) {
                throw new Error(`Documento no encontrado: ${documentType} #${documentId}`);
            }

            trace.origin.data = originDoc;
            trace.timeline.push({
                type: documentType,
                document: originDoc,
                date: originDoc.date || originDoc.createdAt,
                description: `${typeInfo.name} ${originDoc.number || '#' + documentId}`
            });

            // Seguir la cadena según el tipo de documento
            await this.traceFromDocument(documentType, originDoc, trace, company);

            // Determinar estado
            trace.status = this.calculateTraceStatus(trace);

        } catch (error) {
            trace.error = error.message;
        }

        return trace;
    },

    /**
     * Sigue la traza desde un documento específico
     */
    async traceFromDocument(documentType, document, trace, company) {
        switch (documentType) {
            case 'salesOrder':
                await this.traceSalesOrderChain(document, trace, company);
                break;
            case 'customerInvoice':
                await this.traceCustomerInvoiceChain(document, trace, company);
                break;
            case 'purchaseOrder':
                await this.tracePurchaseOrderChain(document, trace, company);
                break;
            case 'journalEntry':
                await this.traceJournalEntryImpact(document, trace, company);
                break;
        }
    },

    /**
     * Traza la cadena de un pedido de venta
     */
    async traceSalesOrderChain(order, trace, company) {
        // 1. Buscar entregas
        const deliveries = await DB.getByIndex('deliveries', 'companyId', company.id);
        const relatedDeliveries = deliveries.filter(d => d.salesOrderId === order.id);

        for (const delivery of relatedDeliveries) {
            trace.chain.push({
                type: 'delivery',
                document: delivery,
                linkedBy: 'salesOrderId'
            });
            trace.timeline.push({
                type: 'delivery',
                document: delivery,
                date: delivery.date,
                description: `Entrega ${delivery.number}`
            });
        }

        // 2. Buscar movimientos de stock
        const movements = await DB.getByIndex('stockMovements', 'companyId', company.id);
        const relatedMovements = movements.filter(m =>
            m.reference === String(order.number) || m.salesOrderId === order.id ||
            (m.description && m.description.includes(String(order.number)))
        );

        for (const movement of relatedMovements) {
            // Agregar un número legible al movimiento
            movement.displayNumber = movement.reference || `Mov-${movement.type}`;
            trace.chain.push({
                type: 'stockMovement',
                document: movement,
                linkedBy: 'reference'
            });
        }

        // 3. Buscar asientos contables generados por la entrega (costo de venta)
        const allEntries = await DB.getByIndex('journalEntries', 'companyId', company.id);
        const deliveryEntries = allEntries.filter(e =>
            (e.sourceDocument === 'salesOrder' && e.sourceDocumentId === order.id) ||
            (e.description && e.description.includes(String(order.number))) ||
            (e.reference && e.reference.includes(String(order.number)))
        );

        for (const entry of deliveryEntries) {
            // Evitar duplicados
            if (!trace.chain.some(c => c.type === 'journalEntry' && c.document.id === entry.id)) {
                trace.chain.push({
                    type: 'journalEntry',
                    document: entry,
                    linkedBy: 'sourceDocumentId'
                });
                trace.timeline.push({
                    type: 'journalEntry',
                    document: entry,
                    date: entry.date,
                    description: `Asiento ${entry.number || '#' + entry.id.slice(0, 8)}`
                });

                // Agregar impacto financiero de este asiento
                const lines = await DB.getByIndex('journalLines', 'entryId', entry.id);
                for (const line of lines) {
                    const account = await DB.get('accounts', line.accountId);
                    trace.financialImpact.push({
                        type: 'accounting',
                        account: account ? `${account.code} - ${account.name}` : 'Cuenta desconocida',
                        debit: line.debit,
                        credit: line.credit,
                        description: line.description || entry.description
                    });
                }
            }
        }

        // 4. Buscar facturas
        const invoices = await DB.getByIndex('customerInvoices', 'companyId', company.id);
        const relatedInvoices = invoices.filter(i => i.salesOrderId === order.id);

        for (const invoice of relatedInvoices) {
            trace.chain.push({
                type: 'customerInvoice',
                document: invoice,
                linkedBy: 'salesOrderId'
            });
            trace.timeline.push({
                type: 'customerInvoice',
                document: invoice,
                date: invoice.date,
                description: `Factura ${invoice.number} - ${Formatters.currency(invoice.total)}`
            });

            // Seguir la cadena de la factura
            await this.traceCustomerInvoiceChain(invoice, trace, company);
        }
    },

    /**
     * Traza la cadena de una factura de cliente
     */
    async traceCustomerInvoiceChain(invoice, trace, company) {
        // 1. Buscar asiento contable
        const entries = await DB.getByIndex('journalEntries', 'companyId', company.id);
        const relatedEntry = entries.find(e =>
            e.sourceDocument === 'customerInvoice' && e.sourceDocumentId === invoice.id
        );

        if (relatedEntry) {
            trace.chain.push({
                type: 'journalEntry',
                document: relatedEntry,
                linkedBy: 'sourceDocumentId'
            });
            trace.timeline.push({
                type: 'journalEntry',
                document: relatedEntry,
                date: relatedEntry.date,
                description: `Asiento ${relatedEntry.number}`
            });

            // Agregar impacto financiero
            const lines = await DB.getByIndex('journalLines', 'entryId', relatedEntry.id);
            for (const line of lines) {
                const account = await DB.get('accounts', line.accountId);
                trace.financialImpact.push({
                    type: 'accounting',
                    account: account ? `${account.code} - ${account.name}` : 'Cuenta desconocida',
                    debit: line.debit,
                    credit: line.credit,
                    description: line.description
                });
            }
        }

        // 2. Buscar cobros
        const payments = await DB.getByIndex('customerPayments', 'companyId', company.id);
        const relatedPayments = payments ? payments.filter(p => p.invoiceId === invoice.id) : [];

        for (const payment of relatedPayments) {
            trace.chain.push({
                type: 'customerPayment',
                document: payment,
                linkedBy: 'invoiceId'
            });
            trace.timeline.push({
                type: 'customerPayment',
                document: payment,
                date: payment.date,
                description: `Cobro ${Formatters.currency(payment.amount)}`
            });
            trace.financialImpact.push({
                type: 'cash',
                description: `Ingreso de efectivo por cobro`,
                amount: payment.amount,
                direction: 'increase'
            });
        }
    },

    /**
     * Traza la cadena de una orden de compra
     */
    async tracePurchaseOrderChain(order, trace, company) {
        // 1. Buscar recepciones de mercadería
        const movements = await DB.getByIndex('stockMovements', 'companyId', company.id);
        const relatedMovements = movements.filter(m =>
            m.reference === order.number || m.purchaseOrderId === order.id
        );

        for (const movement of relatedMovements) {
            trace.chain.push({
                type: 'stockMovement',
                document: movement,
                linkedBy: 'reference'
            });
            trace.financialImpact.push({
                type: 'inventory',
                description: `Entrada de inventario: ${movement.quantity} unidades`,
                amount: movement.cost || 0,
                direction: 'increase'
            });
        }

        // 2. Buscar facturas de proveedor
        const invoices = await DB.getByIndex('supplierInvoices', 'companyId', company.id);
        const relatedInvoices = invoices.filter(i => i.purchaseOrderId === order.id);

        for (const invoice of relatedInvoices) {
            trace.chain.push({
                type: 'supplierInvoice',
                document: invoice,
                linkedBy: 'purchaseOrderId'
            });
            trace.timeline.push({
                type: 'supplierInvoice',
                document: invoice,
                date: invoice.date,
                description: `Factura Proveedor ${invoice.number} - ${Formatters.currency(invoice.total)}`
            });
        }
    },

    /**
     * Traza el impacto de un asiento contable en los estados financieros
     */
    async traceJournalEntryImpact(entry, trace, company) {
        const lines = await DB.getByIndex('journalLines', 'entryId', entry.id);

        for (const line of lines) {
            const account = await DB.get('accounts', line.accountId);
            if (!account) continue;

            const impact = {
                account,
                debit: line.debit,
                credit: line.credit,
                balanceEffect: 0,
                statements: []
            };

            // Calcular efecto en saldo
            const isDebitNature = ['asset', 'expense'].includes(account.type);
            if (account.isContra) {
                impact.balanceEffect = isDebitNature ? (line.credit - line.debit) : (line.debit - line.credit);
            } else {
                impact.balanceEffect = isDebitNature ? (line.debit - line.credit) : (line.credit - line.debit);
            }

            // Determinar estados financieros afectados
            if (['asset', 'liability', 'equity'].includes(account.type)) {
                impact.statements.push('Balance General');
            }
            if (['revenue', 'expense'].includes(account.type)) {
                impact.statements.push('Estado de Resultados');
            }
            if (account.code.startsWith('1.1.01')) {
                impact.statements.push('Flujo de Caja');
            }

            trace.financialImpact.push(impact);
        }
    },

    /**
     * Calcula el estado de una traza
     */
    calculateTraceStatus(trace) {
        if (trace.error) return 'error';
        if (trace.chain.length === 0) return 'origin_only';

        // Verificar si hay asiento contable
        const hasJournalEntry = trace.chain.some(c => c.type === 'journalEntry');
        const hasPayment = trace.chain.some(c =>
            c.type === 'customerPayment' || c.type === 'supplierPayment'
        );

        if (hasJournalEntry && hasPayment) return 'complete';
        if (hasJournalEntry) return 'accounted';
        return 'in_progress';
    },

    /**
     * Genera un reporte de trazabilidad visual
     */
    async generateTraceReport(documentType, documentId) {
        const trace = await this.getDocumentTrace(documentType, documentId);
        if (!trace) return null;

        return {
            trace,
            visualization: this.generateVisualization(trace),
            summary: this.generateSummary(trace),
            pedagogicalNotes: this.generatePedagogicalNotes(trace)
        };
    },

    /**
     * Genera datos para visualización
     */
    generateVisualization(trace) {
        const nodes = [];
        const edges = [];

        // Nodo origen
        const originType = this.documentTypes[trace.origin.type];
        nodes.push({
            id: `${trace.origin.type}_${trace.origin.id}`,
            label: originType.name,
            number: trace.origin.data?.number || `#${trace.origin.id}`,
            color: originType.color,
            icon: originType.icon,
            module: originType.module,
            isOrigin: true
        });

        // Nodos de la cadena
        let prevNodeId = `${trace.origin.type}_${trace.origin.id}`;
        for (const item of trace.chain) {
            const typeInfo = this.documentTypes[item.type];
            const nodeId = `${item.type}_${item.document.id}`;

            // Generar un número legible para los movimientos de stock
            let displayNumber = item.document.number;
            if (!displayNumber || displayNumber === item.document.id) {
                if (item.type === 'stockMovement') {
                    displayNumber = item.document.reference || item.document.displayNumber || `Mov-${item.document.type || 'stock'}`;
                } else {
                    displayNumber = `#${String(item.document.id).slice(0, 8)}`;
                }
            }

            nodes.push({
                id: nodeId,
                label: typeInfo.name,
                number: displayNumber,
                color: typeInfo.color,
                icon: typeInfo.icon,
                module: typeInfo.module
            });

            edges.push({
                from: prevNodeId,
                to: nodeId,
                label: item.linkedBy
            });

            prevNodeId = nodeId;
        }

        return { nodes, edges };
    },

    /**
     * Genera un resumen de la traza
     */
    generateSummary(trace) {
        const statusLabels = {
            'complete': 'Ciclo Completo',
            'accounted': 'Contabilizado',
            'in_progress': 'En Proceso',
            'origin_only': 'Solo Origen',
            'error': 'Error'
        };

        // Calcular totales de impacto
        let totalDebit = 0;
        let totalCredit = 0;
        let inventoryChange = 0;
        let cashChange = 0;

        for (const impact of trace.financialImpact) {
            if (impact.debit !== undefined) {
                totalDebit += impact.debit;
                totalCredit += impact.credit;
            }
            if (impact.type === 'inventory') {
                inventoryChange += impact.direction === 'increase' ? impact.amount : -impact.amount;
            }
            if (impact.type === 'cash') {
                cashChange += impact.direction === 'increase' ? impact.amount : -impact.amount;
            }
        }

        return {
            status: statusLabels[trace.status] || trace.status,
            documentsCount: trace.chain.length + 1,
            modulesInvolved: [...new Set([
                this.documentTypes[trace.origin.type]?.module,
                ...trace.chain.map(c => this.documentTypes[c.type]?.module)
            ].filter(Boolean))],
            financials: {
                totalDebit,
                totalCredit,
                isBalanced: Math.abs(totalDebit - totalCredit) < 0.01,
                inventoryChange,
                cashChange
            }
        };
    },

    /**
     * Genera notas pedagógicas basadas en la traza
     */
    generatePedagogicalNotes(trace) {
        const notes = [];

        // Nota sobre el origen
        notes.push({
            title: '📋 Documento Origen',
            content: `La transacción inicia en el módulo ${this.documentTypes[trace.origin.type]?.module}. ` +
                `Este es el punto de entrada del ciclo de negocio.`
        });

        // Nota sobre la integración
        if (trace.chain.length > 0) {
            const modules = [...new Set(trace.chain.map(c => this.documentTypes[c.type]?.module))];
            notes.push({
                title: '🔗 Integración de Módulos',
                content: `Esta transacción atraviesa ${modules.length} módulo(s) del ERP: ${modules.join(', ')}. ` +
                    `Esto demuestra la integración característica de un sistema ERP.`
            });
        }

        // Nota sobre contabilidad
        const hasAccounting = trace.chain.some(c => c.type === 'journalEntry');
        if (hasAccounting) {
            notes.push({
                title: '📚 Impacto Contable',
                content: `La transacción generó asiento(s) contable(s) automáticamente, ` +
                    `afectando el Libro Mayor (GL) y los estados financieros.`
            });

            // Verificar balance
            const summary = this.generateSummary(trace);
            if (summary.financials.isBalanced) {
                notes.push({
                    title: '✅ Partida Doble',
                    content: `El principio de partida doble se cumple: ` +
                        `Débitos (${Formatters.currency(summary.financials.totalDebit)}) = ` +
                        `Créditos (${Formatters.currency(summary.financials.totalCredit)})`
                });
            }
        } else {
            notes.push({
                title: '⚠️ Pendiente de Contabilización',
                content: `Esta transacción aún no ha generado asientos contables. ` +
                    `Para completar el ciclo, debe facturarse y contabilizarse.`
            });
        }

        // Nota sobre ciclo de negocio
        if (trace.status === 'complete') {
            notes.push({
                title: '🎯 Ciclo Completo',
                content: `¡Excelente! Esta transacción completó todo el ciclo de negocio, ` +
                    `desde el origen hasta el cobro/pago y su reflejo en estados financieros.`
            });
        }

        return notes;
    },

    /**
     * Obtiene todas las transacciones del día para seguimiento
     */
    async getTodayTransactions() {
        const company = CompanyService.getCurrent();
        if (!company) return [];

        const today = new Date().toISOString().split('T')[0];
        const transactions = [];

        // Obtener documentos del día
        for (const [type, config] of Object.entries(this.documentTypes)) {
            try {
                const docs = await DB.getByIndex(config.store, 'companyId', company.id);
                const todayDocs = docs.filter(d => d.date === today || d.createdAt?.startsWith(today));

                for (const doc of todayDocs) {
                    transactions.push({
                        type,
                        document: doc,
                        config
                    });
                }
            } catch (e) {
                // Algunos stores pueden no existir
            }
        }

        return transactions.sort((a, b) =>
            new Date(b.document.createdAt || b.document.date) -
            new Date(a.document.createdAt || a.document.date)
        );
    },

    /**
     * Verifica integridad de datos entre módulos
     */
    async verifyDataIntegrity() {
        const company = CompanyService.getCurrent();
        if (!company) return { issues: [], isHealthy: false };

        const issues = [];

        // 1. Verificar facturas sin asientos
        const invoices = await DB.getByIndex('customerInvoices', 'companyId', company.id);
        const entries = await DB.getByIndex('journalEntries', 'companyId', company.id);

        for (const invoice of invoices) {
            if (invoice.status === 'posted') {
                const hasEntry = entries.some(e =>
                    e.sourceDocument === 'customerInvoice' && e.sourceDocumentId === invoice.id
                );
                if (!hasEntry) {
                    issues.push({
                        type: 'missing_entry',
                        severity: 'warning',
                        document: invoice,
                        message: `Factura ${invoice.number} está contabilizada pero no tiene asiento`
                    });
                }
            }
        }

        // 2. Verificar asientos descuadrados
        for (const entry of entries) {
            if (Math.abs(entry.totalDebit - entry.totalCredit) > 0.01) {
                issues.push({
                    type: 'unbalanced_entry',
                    severity: 'error',
                    document: entry,
                    message: `Asiento ${entry.number} está descuadrado`
                });
            }
        }

        // 3. Verificar stock negativo
        const products = await DB.getByIndex('products', 'companyId', company.id);
        for (const product of products) {
            if (product.stock < 0) {
                issues.push({
                    type: 'negative_stock',
                    severity: 'warning',
                    document: product,
                    message: `Producto ${product.code} tiene stock negativo (${product.stock})`
                });
            }
        }

        return {
            issues,
            isHealthy: issues.filter(i => i.severity === 'error').length === 0,
            summary: {
                total: issues.length,
                errors: issues.filter(i => i.severity === 'error').length,
                warnings: issues.filter(i => i.severity === 'warning').length
            }
        };
    }
};

// Hacer disponible globalmente
window.TraceabilityService = TraceabilityService;
