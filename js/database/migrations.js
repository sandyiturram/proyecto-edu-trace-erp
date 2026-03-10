/**
 * EduERP - Database Migrations
 * Datos iniciales y plan de cuentas por defecto
 */

const Migrations = {
    /**
     * Plan de cuentas estándar chileno IFRS
     */
    defaultChartOfAccounts: [
        // ACTIVOS
        { code: '1', name: 'ACTIVOS', type: 'asset', level: 1, isGroup: true },
        { code: '1.1', name: 'Activos Corrientes', type: 'asset', level: 2, isGroup: true, parentCode: '1' },
        { code: '1.1.01', name: 'Efectivo y Equivalentes', type: 'asset', level: 3, isGroup: true, parentCode: '1.1' },
        { code: '1.1.01.001', name: 'Caja', type: 'asset', level: 4, parentCode: '1.1.01' },
        { code: '1.1.01.002', name: 'Banco Estado Cta Cte', type: 'asset', level: 4, parentCode: '1.1.01' },
        { code: '1.1.01.003', name: 'Banco Chile Cta Cte', type: 'asset', level: 4, parentCode: '1.1.01' },
        { code: '1.1.01.004', name: 'Fondo Fijo', type: 'asset', level: 4, parentCode: '1.1.01' },
        { code: '1.1.02', name: 'Cuentas por Cobrar', type: 'asset', level: 3, isGroup: true, parentCode: '1.1' },
        { code: '1.1.02.001', name: 'Clientes Nacionales', type: 'asset', level: 4, parentCode: '1.1.02' },
        { code: '1.1.02.002', name: 'Documentos por Cobrar', type: 'asset', level: 4, parentCode: '1.1.02' },
        { code: '1.1.02.003', name: 'Deudores Varios', type: 'asset', level: 4, parentCode: '1.1.02' },
        { code: '1.1.02.004', name: 'Estimación Deudores Incobrables', type: 'asset', level: 4, parentCode: '1.1.02', isContra: true },
        { code: '1.1.03', name: 'Inventarios', type: 'asset', level: 3, isGroup: true, parentCode: '1.1' },
        { code: '1.1.03.001', name: 'Mercaderías', type: 'asset', level: 4, parentCode: '1.1.03' },
        { code: '1.1.03.002', name: 'Materias Primas', type: 'asset', level: 4, parentCode: '1.1.03' },
        { code: '1.1.03.003', name: 'Productos en Proceso', type: 'asset', level: 4, parentCode: '1.1.03' },
        { code: '1.1.03.004', name: 'Productos Terminados', type: 'asset', level: 4, parentCode: '1.1.03' },
        { code: '1.1.04', name: 'Impuestos por Recuperar', type: 'asset', level: 3, isGroup: true, parentCode: '1.1' },
        { code: '1.1.04.001', name: 'IVA Crédito Fiscal', type: 'asset', level: 4, parentCode: '1.1.04' },
        { code: '1.1.04.002', name: 'PPM por Recuperar', type: 'asset', level: 4, parentCode: '1.1.04' },
        { code: '1.1.05', name: 'Gastos Anticipados', type: 'asset', level: 3, isGroup: true, parentCode: '1.1' },
        { code: '1.1.05.001', name: 'Seguros Pagados por Anticipado', type: 'asset', level: 4, parentCode: '1.1.05' },
        { code: '1.1.05.002', name: 'Arriendos Pagados por Anticipado', type: 'asset', level: 4, parentCode: '1.1.05' },

        { code: '1.2', name: 'Activos No Corrientes', type: 'asset', level: 2, isGroup: true, parentCode: '1' },
        { code: '1.2.01', name: 'Propiedades, Planta y Equipo', type: 'asset', level: 3, isGroup: true, parentCode: '1.2' },
        { code: '1.2.01.001', name: 'Terrenos', type: 'asset', level: 4, parentCode: '1.2.01' },
        { code: '1.2.01.002', name: 'Edificios', type: 'asset', level: 4, parentCode: '1.2.01' },
        { code: '1.2.01.003', name: 'Maquinaria y Equipos', type: 'asset', level: 4, parentCode: '1.2.01' },
        { code: '1.2.01.004', name: 'Vehículos', type: 'asset', level: 4, parentCode: '1.2.01' },
        { code: '1.2.01.005', name: 'Muebles y Enseres', type: 'asset', level: 4, parentCode: '1.2.01' },
        { code: '1.2.01.006', name: 'Equipos Computacionales', type: 'asset', level: 4, parentCode: '1.2.01' },
        { code: '1.2.01.099', name: 'Depreciación Acumulada', type: 'asset', level: 4, parentCode: '1.2.01', isContra: true },
        { code: '1.2.02', name: 'Activos Intangibles', type: 'asset', level: 3, isGroup: true, parentCode: '1.2' },
        { code: '1.2.02.001', name: 'Software', type: 'asset', level: 4, parentCode: '1.2.02' },
        { code: '1.2.02.002', name: 'Licencias', type: 'asset', level: 4, parentCode: '1.2.02' },
        { code: '1.2.02.099', name: 'Amortización Acumulada', type: 'asset', level: 4, parentCode: '1.2.02', isContra: true },

        // PASIVOS
        { code: '2', name: 'PASIVOS', type: 'liability', level: 1, isGroup: true },
        { code: '2.1', name: 'Pasivos Corrientes', type: 'liability', level: 2, isGroup: true, parentCode: '2' },
        { code: '2.1.01', name: 'Cuentas por Pagar', type: 'liability', level: 3, isGroup: true, parentCode: '2.1' },
        { code: '2.1.01.001', name: 'Proveedores Nacionales', type: 'liability', level: 4, parentCode: '2.1.01' },
        { code: '2.1.01.002', name: 'Documentos por Pagar', type: 'liability', level: 4, parentCode: '2.1.01' },
        { code: '2.1.01.003', name: 'Acreedores Varios', type: 'liability', level: 4, parentCode: '2.1.01' },
        { code: '2.1.02', name: 'Obligaciones Laborales', type: 'liability', level: 3, isGroup: true, parentCode: '2.1' },
        { code: '2.1.02.001', name: 'Remuneraciones por Pagar', type: 'liability', level: 4, parentCode: '2.1.02' },
        { code: '2.1.02.002', name: 'Retenciones por Pagar', type: 'liability', level: 4, parentCode: '2.1.02' },
        { code: '2.1.02.003', name: 'AFP por Pagar', type: 'liability', level: 4, parentCode: '2.1.02' },
        { code: '2.1.02.004', name: 'Isapre/Fonasa por Pagar', type: 'liability', level: 4, parentCode: '2.1.02' },
        { code: '2.1.02.005', name: 'Provisión Vacaciones', type: 'liability', level: 4, parentCode: '2.1.02' },
        { code: '2.1.02.006', name: 'Provisión Indemnización', type: 'liability', level: 4, parentCode: '2.1.02' },
        { code: '2.1.03', name: 'Impuestos por Pagar', type: 'liability', level: 3, isGroup: true, parentCode: '2.1' },
        { code: '2.1.03.001', name: 'IVA Débito Fiscal', type: 'liability', level: 4, parentCode: '2.1.03' },
        { code: '2.1.03.002', name: 'IVA por Pagar', type: 'liability', level: 4, parentCode: '2.1.03' },
        { code: '2.1.03.003', name: 'PPM por Pagar', type: 'liability', level: 4, parentCode: '2.1.03' },
        { code: '2.1.03.004', name: 'Impuesto Renta por Pagar', type: 'liability', level: 4, parentCode: '2.1.03' },
        { code: '2.1.04', name: 'Obligaciones Financieras CP', type: 'liability', level: 3, isGroup: true, parentCode: '2.1' },
        { code: '2.1.04.001', name: 'Préstamos Bancarios CP', type: 'liability', level: 4, parentCode: '2.1.04' },

        { code: '2.2', name: 'Pasivos No Corrientes', type: 'liability', level: 2, isGroup: true, parentCode: '2' },
        { code: '2.2.01', name: 'Obligaciones Financieras LP', type: 'liability', level: 3, isGroup: true, parentCode: '2.2' },
        { code: '2.2.01.001', name: 'Préstamos Bancarios LP', type: 'liability', level: 4, parentCode: '2.2.01' },
        { code: '2.2.01.002', name: 'Obligaciones por Leasing', type: 'liability', level: 4, parentCode: '2.2.01' },

        // PATRIMONIO
        { code: '3', name: 'PATRIMONIO', type: 'equity', level: 1, isGroup: true },
        { code: '3.1', name: 'Capital', type: 'equity', level: 2, isGroup: true, parentCode: '3' },
        { code: '3.1.01', name: 'Capital Pagado', type: 'equity', level: 3, parentCode: '3.1' },
        { code: '3.1.02', name: 'Capital por Pagar', type: 'equity', level: 3, parentCode: '3.1' },
        { code: '3.2', name: 'Reservas', type: 'equity', level: 2, isGroup: true, parentCode: '3' },
        { code: '3.2.01', name: 'Reserva Legal', type: 'equity', level: 3, parentCode: '3.2' },
        { code: '3.2.02', name: 'Otras Reservas', type: 'equity', level: 3, parentCode: '3.2' },
        { code: '3.3', name: 'Resultados', type: 'equity', level: 2, isGroup: true, parentCode: '3' },
        { code: '3.3.01', name: 'Resultados Acumulados', type: 'equity', level: 3, parentCode: '3.3' },
        { code: '3.3.02', name: 'Resultado del Ejercicio', type: 'equity', level: 3, parentCode: '3.3' },

        // INGRESOS
        { code: '4', name: 'INGRESOS', type: 'revenue', level: 1, isGroup: true },
        { code: '4.1', name: 'Ingresos Operacionales', type: 'revenue', level: 2, isGroup: true, parentCode: '4' },
        { code: '4.1.01', name: 'Ventas', type: 'revenue', level: 3, isGroup: true, parentCode: '4.1' },
        { code: '4.1.01.001', name: 'Ventas de Mercaderías', type: 'revenue', level: 4, parentCode: '4.1.01' },
        { code: '4.1.01.002', name: 'Ventas de Servicios', type: 'revenue', level: 4, parentCode: '4.1.01' },
        { code: '4.1.01.003', name: 'Descuentos sobre Ventas', type: 'revenue', level: 4, parentCode: '4.1.01', isContra: true },
        { code: '4.1.01.004', name: 'Devoluciones sobre Ventas', type: 'revenue', level: 4, parentCode: '4.1.01', isContra: true },
        { code: '4.2', name: 'Otros Ingresos', type: 'revenue', level: 2, isGroup: true, parentCode: '4' },
        { code: '4.2.01', name: 'Ingresos Financieros', type: 'revenue', level: 3, parentCode: '4.2' },
        { code: '4.2.02', name: 'Otros Ingresos No Operacionales', type: 'revenue', level: 3, parentCode: '4.2' },

        // COSTOS
        { code: '5', name: 'COSTOS', type: 'expense', level: 1, isGroup: true },
        { code: '5.1', name: 'Costo de Ventas', type: 'expense', level: 2, isGroup: true, parentCode: '5' },
        { code: '5.1.01', name: 'Costo de Mercaderías Vendidas', type: 'expense', level: 3, parentCode: '5.1' },
        { code: '5.1.02', name: 'Costo de Servicios', type: 'expense', level: 3, parentCode: '5.1' },

        // GASTOS
        { code: '6', name: 'GASTOS', type: 'expense', level: 1, isGroup: true },
        { code: '6.1', name: 'Gastos de Administración', type: 'expense', level: 2, isGroup: true, parentCode: '6' },
        { code: '6.1.01', name: 'Remuneraciones Administración', type: 'expense', level: 3, parentCode: '6.1' },
        { code: '6.1.02', name: 'Arriendos', type: 'expense', level: 3, parentCode: '6.1' },
        { code: '6.1.03', name: 'Servicios Básicos', type: 'expense', level: 3, parentCode: '6.1' },
        { code: '6.1.04', name: 'Depreciación', type: 'expense', level: 3, parentCode: '6.1' },
        { code: '6.1.05', name: 'Gastos Generales', type: 'expense', level: 3, parentCode: '6.1' },
        { code: '6.2', name: 'Gastos de Ventas', type: 'expense', level: 2, isGroup: true, parentCode: '6' },
        { code: '6.2.01', name: 'Remuneraciones Ventas', type: 'expense', level: 3, parentCode: '6.2' },
        { code: '6.2.02', name: 'Comisiones', type: 'expense', level: 3, parentCode: '6.2' },
        { code: '6.2.03', name: 'Publicidad y Marketing', type: 'expense', level: 3, parentCode: '6.2' },
        { code: '6.3', name: 'Gastos Financieros', type: 'expense', level: 2, isGroup: true, parentCode: '6' },
        { code: '6.3.01', name: 'Intereses Bancarios', type: 'expense', level: 3, parentCode: '6.3' },
        { code: '6.3.02', name: 'Comisiones Bancarias', type: 'expense', level: 3, parentCode: '6.3' },
        { code: '6.4', name: 'Otros Gastos', type: 'expense', level: 2, isGroup: true, parentCode: '6' },
        { code: '6.4.01', name: 'Pérdidas por Castigo de Activos', type: 'expense', level: 3, parentCode: '6.4' },
        { code: '6.4.02', name: 'Otros Gastos No Operacionales', type: 'expense', level: 3, parentCode: '6.4' }
    ],

    /**
     * Crear empresa con datos iniciales
     */
    async createCompanyWithDefaults(companyData) {
        // Crear empresa
        const company = await DB.add('companies', {
            ...companyData,
            fiscalYear: companyData.fiscalYear || new Date().getFullYear(),
            currency: 'CLP',
            status: 'active'
        });

        // Crear plan de cuentas
        const accountIdMap = {};
        for (const account of this.defaultChartOfAccounts) {
            const parentId = account.parentCode ? accountIdMap[account.parentCode] : null;
            const newAccount = await DB.add('accounts', {
                companyId: company.id,
                code: account.code,
                name: account.name,
                type: account.type,
                level: account.level,
                parentId,
                isGroup: account.isGroup || false,
                isContra: account.isContra || false,
                balance: 0,
                active: true
            });
            accountIdMap[account.code] = newAccount.id;
        }

        // Crear configuración inicial
        await DB.add('settings', {
            companyId: company.id,
            fiscalYear: company.fiscalYear,
            inventoryMethod: 'promedio', // promedio, fifo
            taxRate: 19, // IVA Chile
            incomeTaxRate: 27, // Primera categoría
            decimalPlaces: 0,
            dateFormat: 'dd/mm/yyyy'
        });

        // Registrar en log
        await DB.logAudit(company.id, 'CREATE', 'company', company.id, { name: company.name });

        return company;
    },

    /**
     * Crear datos de demostración
     */
    async createDemoData(companyId) {
        // Proveedores de ejemplo
        const suppliers = [
            { name: 'Distribuidora ABC Ltda.', rut: '76.123.456-7', contact: 'Juan Pérez', email: 'contacto@abc.cl', phone: '+56 2 2345 6789' },
            { name: 'Importadora XYZ S.A.', rut: '96.789.012-3', contact: 'María González', email: 'ventas@xyz.cl', phone: '+56 2 9876 5432' },
            { name: 'Servicios Tecnológicos SpA', rut: '77.456.789-0', contact: 'Pedro López', email: 'info@techserv.cl', phone: '+56 2 1234 5678' }
        ];

        for (const sup of suppliers) {
            await DB.add('suppliers', { companyId, ...sup, status: 'active', balance: 0 });
        }

        // Clientes de ejemplo
        const customers = [
            { name: 'Comercial Norte Ltda.', rut: '76.234.567-8', contact: 'Ana Torres', email: 'compras@norte.cl', phone: '+56 2 3456 7890', creditLimit: 5000000 },
            { name: 'Retail Sur S.A.', rut: '96.345.678-9', contact: 'Carlos Muñoz', email: 'pedidos@sur.cl', phone: '+56 2 4567 8901', creditLimit: 10000000 },
            { name: 'Servicios Centro SpA', rut: '77.567.890-1', contact: 'Laura Soto', email: 'admin@centro.cl', phone: '+56 2 5678 9012', creditLimit: 3000000 }
        ];

        for (const cust of customers) {
            await DB.add('customers', { companyId, ...cust, status: 'active', balance: 0 });
        }

        // Productos de ejemplo
        const products = [
            { code: 'PROD001', name: 'Laptop HP ProBook', category: 'Tecnología', unit: 'UN', cost: 450000, price: 599000, stock: 15, minStock: 5 },
            { code: 'PROD002', name: 'Monitor Dell 24"', category: 'Tecnología', unit: 'UN', cost: 120000, price: 159000, stock: 25, minStock: 10 },
            { code: 'PROD003', name: 'Teclado Logitech', category: 'Accesorios', unit: 'UN', cost: 25000, price: 35000, stock: 50, minStock: 20 },
            { code: 'PROD004', name: 'Mouse Inalámbrico', category: 'Accesorios', unit: 'UN', cost: 12000, price: 18000, stock: 80, minStock: 30 },
            { code: 'SERV001', name: 'Servicio de Instalación', category: 'Servicios', unit: 'HH', cost: 15000, price: 25000, stock: 0, minStock: 0, isService: true }
        ];

        for (const prod of products) {
            await DB.add('products', { companyId, ...prod, status: 'active' });
        }

        // Centros de costo
        const costCenters = [
            { code: 'CC001', name: 'Administración', type: 'overhead' },
            { code: 'CC002', name: 'Ventas', type: 'operational' },
            { code: 'CC003', name: 'Bodega', type: 'operational' },
            { code: 'CC004', name: 'Gerencia', type: 'overhead' }
        ];

        for (const cc of costCenters) {
            await DB.add('costCenters', { companyId, ...cc, status: 'active', budget: 0, actual: 0 });
        }

        // Empleados de ejemplo
        const employees = [
            { rut: '12.345.678-9', name: 'Roberto Sánchez', position: 'Gerente General', department: 'Gerencia', salary: 3500000, startDate: '2020-01-15' },
            { rut: '13.456.789-0', name: 'Carolina Vega', position: 'Contador', department: 'Administración', salary: 1800000, startDate: '2021-03-01' },
            { rut: '14.567.890-1', name: 'Felipe Rojas', position: 'Vendedor', department: 'Ventas', salary: 900000, startDate: '2022-06-15' },
            { rut: '15.678.901-2', name: 'Valentina Díaz', position: 'Bodeguero', department: 'Bodega', salary: 650000, startDate: '2023-02-01' }
        ];

        for (const emp of employees) {
            await DB.add('employees', { companyId, ...emp, status: 'active' });
        }

        // Cuenta bancaria
        const bankAccount = await DB.add('bankAccounts', {
            companyId,
            bank: 'Banco Estado',
            accountNumber: '12345678901',
            accountType: 'Cuenta Corriente',
            currency: 'CLP',
            balance: 5000000,
            status: 'active'
        });

        // --- NUEVO: Asientos Contables Iniciales para que los reportes tengan datos ---

        // 1. Obtener cuentas necesarias por código
        const accounts = await DB.getByIndex('accounts', 'companyId', companyId);
        const findAcc = (code) => accounts.find(a => a.code === code);

        const accCaja = findAcc('1.1.01.001');
        const accBanco = findAcc('1.1.01.002');
        const accMercaderia = findAcc('1.1.03.001');
        const accCapital = findAcc('3.1.01');
        const accProveedores = findAcc('2.1.01.001');
        const accIvaCredito = findAcc('1.1.04.001');

        if (accCaja && accBanco && accCapital) {
            // Asiento 1: Apertura / Aporte de Capital ($10.000.000)
            const entry1 = await DB.add('journalEntries', {
                companyId,
                number: 'AST-2024-0001',
                date: Helpers.getCurrentDate(),
                description: 'Asiento de apertura - Aporte de capital inicial',
                status: 'posted',
                type: 'opening',
                totalDebit: 10000000,
                totalCredit: 10000000
            });

            await DB.add('journalLines', { entryId: entry1.id, accountId: accBanco.id, debit: 10000000, credit: 0, description: 'Aporte socios' });
            await DB.add('journalLines', { entryId: entry1.id, accountId: accCapital.id, debit: 0, credit: 10000000, description: 'Capital inicial' });

            // Actualizar saldos
            accBanco.balance += 10000000;
            accCapital.balance += 10000000;
            await DB.update('accounts', accBanco);
            await DB.update('accounts', accCapital);
        }

        if (accMercaderia && accIvaCredito && accProveedores) {
            // Asiento 2: Compra de Mercadería Inicial ($2.000.000 + IVA)
            const neto = 2000000;
            const iva = Math.round(neto * 0.19);
            const total = neto + iva;

            const entry2 = await DB.add('journalEntries', {
                companyId,
                number: 'AST-2024-0002',
                date: Helpers.getCurrentDate(),
                description: 'Compra inicial de mercaderías según Factura 101',
                status: 'posted',
                type: 'manual',
                totalDebit: total,
                totalCredit: total
            });

            await DB.add('journalLines', { entryId: entry2.id, accountId: accMercaderia.id, debit: neto, credit: 0 });
            await DB.add('journalLines', { entryId: entry2.id, accountId: accIvaCredito.id, debit: iva, credit: 0 });
            await DB.add('journalLines', { entryId: entry2.id, accountId: accProveedores.id, debit: 0, credit: total });

            // Actualizar saldos
            accMercaderia.balance += neto;
            accIvaCredito.balance += iva;
            accProveedores.balance += total;
            await DB.update('accounts', accMercaderia);
            await DB.update('accounts', accIvaCredito);
            await DB.update('accounts', accProveedores);
        }

        return { success: true, message: 'Datos de demostración y asientos contables creados exitosamente' };
    }
};

// Hacer Migrations disponible globalmente
window.Migrations = Migrations;
