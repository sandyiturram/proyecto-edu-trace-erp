/**
 * EduERP - Reportes Module
 * Módulo de Reportes Financieros
 */

const ReportesModule = {
    currentView: 'balance-general',

    async render(view = 'balance-general') {
        this.currentView = view;

        switch (view) {
            case 'balance-general': return await this.renderBalanceSheet();
            case 'balance-comprobacion': return await this.renderTrialBalance();
            case 'estado-resultados': return await this.renderIncomeStatement();
            case 'ratios-financieros': return await this.renderFinancialRatios();
            case 'flujo-caja': return this.renderCashFlow();
            case 'analisis-cuentas': return await this.renderAccountAnalysis();
            default: return '<p>Vista no encontrada</p>';
        }
    },

    async renderBalanceSheet() {
        const company = CompanyService.getCurrent();
        if (!company) return '<p>Seleccione una empresa</p>';

        const balanceData = await AccountingService.getBalanceSheet(Helpers.getCurrentDate());

        return `
            <div class="page-header">
                <h1 class="page-title">Balance General</h1>
                <p class="page-subtitle">Estado de Situación Financiera al ${Formatters.date(new Date(), 'long')}</p>
            </div>
            
            <div class="toolbar">
                <div class="toolbar-left">
                    <input type="date" class="form-control" id="balance-date" value="${Helpers.getCurrentDate()}">
                    <button class="btn btn-primary" id="btn-generate-balance">
                        <i class="fas fa-sync"></i> Actualizar
                    </button>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-outline" id="btn-print-balance">
                        <i class="fas fa-print"></i> Imprimir
                    </button>
                    <button class="btn btn-outline" id="btn-export-balance-pdf">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                    <button class="btn btn-outline" id="btn-export-balance-excel">
                        <i class="fas fa-file-excel"></i> Excel
                    </button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-balance-scale"></i>
                        ${company.name}
                    </div>
                    <span class="badge ${balanceData.balanced ? 'badge-success' : 'badge-error'}">
                        ${balanceData.balanced
                ? 'Cuadrado'
                : `Descuadrado (${Formatters.currency(Math.abs(balanceData.difference || 0))})`}
                    </span>
                </div>
                <div class="card-body">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6);">
                        <!-- ACTIVOS -->
                        <div>
                            <h3 style="color: var(--primary-500); margin-bottom: var(--space-4); padding-bottom: var(--space-2); border-bottom: 2px solid var(--primary-500);">
                                ACTIVOS
                            </h3>
                            
                            <h4 style="color: var(--primary-600); margin-bottom: var(--space-2); font-size: var(--font-size-md);">Activos Corrientes</h4>
                            ${this.renderAccountGroup(balanceData.assets.current.items, 'asset')}
                            <div style="display: flex; justify-content: space-between; font-weight: 600; margin: var(--space-3) 0 var(--space-4); padding-bottom: var(--space-2); border-bottom: 1px dashed var(--border-medium);">
                                <span>Total Activos Corrientes</span>
                                <span>${Formatters.currency(balanceData.assets.current.total)}</span>
                            </div>

                            <h4 style="color: var(--primary-600); margin-bottom: var(--space-2); font-size: var(--font-size-md);">Activos No Corrientes</h4>
                            ${this.renderAccountGroup(balanceData.assets.nonCurrent.items, 'asset')}
                            <div style="display: flex; justify-content: space-between; font-weight: 600; margin: var(--space-3) 0 var(--space-4); padding-bottom: var(--space-2); border-bottom: 1px dashed var(--border-medium);">
                                <span>Total Activos No Corrientes</span>
                                <span>${Formatters.currency(balanceData.assets.nonCurrent.total)}</span>
                            </div>

                            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: var(--font-size-lg); margin-top: var(--space-4); padding-top: var(--space-2); border-top: 2px solid var(--border-medium);">
                                <span>TOTAL ACTIVOS</span>
                                <span>${Formatters.currency(balanceData.assets.total)}</span>
                            </div>
                        </div>
                        
                        <!-- PASIVOS Y PATRIMONIO -->
                        <div>
                            <h3 style="color: var(--error-500); margin-bottom: var(--space-4); padding-bottom: var(--space-2); border-bottom: 2px solid var(--error-500);">
                                PASIVOS
                            </h3>
                            
                            <h4 style="color: var(--error-600); margin-bottom: var(--space-2); font-size: var(--font-size-md);">Pasivos Corrientes</h4>
                            ${this.renderAccountGroup(balanceData.liabilities.current.items, 'liability')}
                            <div style="display: flex; justify-content: space-between; font-weight: 600; margin: var(--space-3) 0 var(--space-4); padding-bottom: var(--space-2); border-bottom: 1px dashed var(--border-medium);">
                                <span>Total Pasivos Corrientes</span>
                                <span>${Formatters.currency(balanceData.liabilities.current.total)}</span>
                            </div>

                            <h4 style="color: var(--error-600); margin-bottom: var(--space-2); font-size: var(--font-size-md);">Pasivos No Corrientes</h4>
                            ${this.renderAccountGroup(balanceData.liabilities.nonCurrent.items, 'liability')}
                            <div style="display: flex; justify-content: space-between; font-weight: 600; margin: var(--space-3) 0 var(--space-4); padding-bottom: var(--space-2); border-bottom: 1px dashed var(--border-medium);">
                                <span>Total Pasivos No Corrientes</span>
                                <span>${Formatters.currency(balanceData.liabilities.nonCurrent.total)}</span>
                            </div>

                            <div style="display: flex; justify-content: space-between; font-weight: 600; margin-top: var(--space-3);">
                                <span>Total Pasivos</span>
                                <span>${Formatters.currency(balanceData.liabilities.total)}</span>
                            </div>
                            
                            <h3 style="color: var(--success-500); margin: var(--space-6) 0 var(--space-4); padding-bottom: var(--space-2); border-bottom: 2px solid var(--success-500);">
                                PATRIMONIO
                            </h3>
                            ${this.renderAccountGroup(balanceData.equity.items, 'equity')}
                            ${balanceData.netIncome !== 0 ? `
                                <div style="display: flex; justify-content: space-between; padding: var(--space-2) 1rem var(--space-2) var(--space-4); color: ${balanceData.netIncome >= 0 ? 'var(--success-600)' : 'var(--error-600)'}; font-weight: 500; border-bottom: 1px dotted var(--border-light);">
                                    <span>Resultado del Ejercicio</span>
                                    <span>${Formatters.currency(balanceData.netIncome)}</span>
                                </div>
                            ` : ''}
                            <div style="display: flex; justify-content: space-between; font-weight: 600; margin-top: var(--space-3); padding-top: var(--space-2); border-top: 1px dashed var(--border-medium);">
                                <span>Total Patrimonio</span>
                                <span>${Formatters.currency(balanceData.equity.total)}</span>
                            </div>

                            <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: var(--font-size-lg); margin-top: var(--space-4); padding-top: var(--space-2); border-top: 2px solid var(--border-medium);">
                                <span>TOTAL PASIVO + PATRIMONIO</span>
                                <span>${Formatters.currency(balanceData.liabilities.total + balanceData.equity.total)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    renderAccountGroup(accounts, type) {
        const filtered = accounts.filter(a => a.balance !== 0);
        if (filtered.length === 0) {
            return '<p style="color: var(--text-tertiary); font-style: italic;">Sin movimientos</p>';
        }

        return filtered.map(acc => `
            <div style="display: flex; justify-content: space-between; padding: var(--space-2) 0 var(--space-2) var(--space-4); border-bottom: 1px dotted var(--border-light);">
                <span>${acc.code} ${acc.name}</span>
                <span style="font-weight: 500;">${Formatters.currency(Math.abs(acc.balance))}</span>
            </div>
        `).join('');
    },

    /**
     * Renderiza el Balance de Comprobación (Trial Balance)
     */
    async renderTrialBalance() {
        const company = CompanyService.getCurrent();
        if (!company) return '<p>Seleccione una empresa</p>';

        const accounts = await AccountingService.getChartOfAccounts();

        // Filtrar solo cuentas de detalle con movimientos
        const detailAccounts = accounts.filter(a => !a.isGroup);

        // Calcular totales
        let totalDebit = 0;
        let totalCredit = 0;

        detailAccounts.forEach(acc => {
            if (acc.balance > 0) {
                // Saldo deudor para activos y gastos, acreedor para pasivos, patrimonio e ingresos
                if (['asset', 'expense'].includes(acc.type)) {
                    totalDebit += acc.balance;
                } else {
                    totalCredit += acc.balance;
                }
            } else if (acc.balance < 0) {
                if (['asset', 'expense'].includes(acc.type)) {
                    totalCredit += Math.abs(acc.balance);
                } else {
                    totalDebit += Math.abs(acc.balance);
                }
            }
        });

        const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01;

        return `
            <div class="page-header">
                <h1 class="page-title">Balance de Comprobación</h1>
                <p class="page-subtitle">Al ${Formatters.date(new Date(), 'long')}</p>
            </div>
            
            <div class="toolbar">
                <div class="toolbar-left">
                    <input type="date" class="form-control" id="trial-balance-date" value="${Helpers.getCurrentDate()}">
                    <button class="btn btn-primary" id="btn-generate-trial">
                        <i class="fas fa-sync"></i> Actualizar
                    </button>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-outline" id="btn-print-trial">
                        <i class="fas fa-print"></i> Imprimir
                    </button>
                    <button class="btn btn-outline" id="btn-export-trial-pdf">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                    <button class="btn btn-outline" id="btn-export-trial-excel">
                        <i class="fas fa-file-excel"></i> Excel
                    </button>
                </div>
            </div>

            <div class="dashboard-grid" style="margin-bottom: var(--space-4);">
                <div class="kpi-card">
                    <div class="kpi-header">
                        <div class="kpi-icon error"><i class="fas fa-arrow-left"></i></div>
                    </div>
                    <div class="kpi-value">${Formatters.currency(totalDebit)}</div>
                    <div class="kpi-label">Total Débitos</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-header">
                        <div class="kpi-icon success"><i class="fas fa-arrow-right"></i></div>
                    </div>
                    <div class="kpi-value">${Formatters.currency(totalCredit)}</div>
                    <div class="kpi-label">Total Créditos</div>
                </div>
                <div class="kpi-card span-2 ${isBalanced ? 'success' : 'error'}">
                    <div class="kpi-header">
                        <div class="kpi-icon ${isBalanced ? 'success' : 'error'}">
                            <i class="fas fa-${isBalanced ? 'check-circle' : 'exclamation-triangle'}"></i>
                        </div>
                    </div>
                    <div class="kpi-value">${Formatters.currency(Math.abs(totalDebit - totalCredit))}</div>
                    <div class="kpi-label">${isBalanced ? 'Balance Cuadrado ✓' : 'Diferencia (Descuadre)'}</div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <div class="card-title">
                        <i class="fas fa-balance-scale-right"></i>
                        ${company.name} - Balance de Comprobación
                    </div>
                    <span class="badge ${isBalanced ? 'badge-success' : 'badge-error'}">
                        ${isBalanced ? 'Cuadrado' : 'Descuadrado'}
                    </span>
                </div>
                <div class="card-body">
                    <table class="data-table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th style="width: 100px;">Código</th>
                                <th>Cuenta</th>
                                <th style="width: 100px; text-align: center;">Tipo</th>
                                <th style="width: 150px; text-align: right;">Debe</th>
                                <th style="width: 150px; text-align: right;">Haber</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${detailAccounts.filter(a => a.balance !== 0).map(acc => {
            let debit = 0, credit = 0;
            if (acc.balance > 0) {
                if (['asset', 'expense'].includes(acc.type)) {
                    debit = acc.balance;
                } else {
                    credit = acc.balance;
                }
            } else if (acc.balance < 0) {
                if (['asset', 'expense'].includes(acc.type)) {
                    credit = Math.abs(acc.balance);
                } else {
                    debit = Math.abs(acc.balance);
                }
            }

            const typeLabels = {
                asset: 'Activo',
                liability: 'Pasivo',
                equity: 'Patrimonio',
                revenue: 'Ingreso',
                expense: 'Gasto'
            };
            const typeColors = {
                asset: 'var(--primary-500)',
                liability: 'var(--error-500)',
                equity: 'var(--success-500)',
                revenue: 'var(--info-500)',
                expense: 'var(--warning-500)'
            };

            return `
                                    <tr>
                                        <td><code>${acc.code}</code></td>
                                        <td>${acc.name}</td>
                                        <td style="text-align: center;">
                                            <span class="badge" style="background: ${typeColors[acc.type]}20; color: ${typeColors[acc.type]};">
                                                ${typeLabels[acc.type] || acc.type}
                                            </span>
                                        </td>
                                        <td style="text-align: right; color: var(--error-500); font-weight: ${debit > 0 ? '600' : '400'};">
                                            ${debit > 0 ? Formatters.currency(debit) : '-'}
                                        </td>
                                        <td style="text-align: right; color: var(--success-500); font-weight: ${credit > 0 ? '600' : '400'};">
                                            ${credit > 0 ? Formatters.currency(credit) : '-'}
                                        </td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                        <tfoot>
                            <tr style="background: var(--neutral-100); font-weight: 700; font-size: var(--font-size-lg);">
                                <td colspan="3" style="text-align: right; padding: var(--space-3);">TOTALES</td>
                                <td style="text-align: right; color: var(--error-600); padding: var(--space-3);">
                                    ${Formatters.currency(totalDebit)}
                                </td>
                                <td style="text-align: right; color: var(--success-600); padding: var(--space-3);">
                                    ${Formatters.currency(totalCredit)}
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>

            <div class="card" style="margin-top: var(--space-4);">
                <div class="card-header">
                    <div class="card-title"><i class="fas fa-info-circle"></i> ¿Qué es el Balance de Comprobación?</div>
                </div>
                <div class="card-body">
                    <p style="margin-bottom: var(--space-3);">
                        El <strong>Balance de Comprobación</strong> (o Balance de Sumas y Saldos) es un informe contable 
                        que lista todas las cuentas del libro mayor con sus saldos deudores y acreedores.
                    </p>
                    <ul style="list-style: disc; padding-left: var(--space-6);">
                        <li><strong>Propósito:</strong> Verificar que la suma de débitos sea igual a la suma de créditos (partida doble)</li>
                        <li><strong>Saldo Deudor:</strong> Activos y Gastos tienen saldo normal deudor</li>
                        <li><strong>Saldo Acreedor:</strong> Pasivos, Patrimonio e Ingresos tienen saldo normal acreedor</li>
                        <li><strong>Cuadre:</strong> Si Total Débitos = Total Créditos, el balance está "cuadrado"</li>
                    </ul>
                </div>
            </div>
        `;
    },

    /**
     * Renderiza los Ratios Financieros
     */
    async renderFinancialRatios() {
        const company = CompanyService.getCurrent();
        if (!company) return '<p>Seleccione una empresa</p>';

        const balanceData = await AccountingService.getBalanceSheet(Helpers.getCurrentDate());
        const range = Helpers.getYearRange();
        const incomeData = await AccountingService.getIncomeStatement(range.start, range.end);

        // Calcular componentes para ratios
        const totalAssets = balanceData.assets.total;
        const totalLiabilities = balanceData.liabilities.total;
        const totalEquity = balanceData.equity.total + balanceData.netIncome;
        const netIncome = incomeData.netIncome;
        const totalRevenue = incomeData.revenues.total;
        const totalExpenses = incomeData.expenses.total;

        // Calcular activos y pasivos corrientes (simplificado)
        const currentAssets = balanceData.assets.items
            .filter(a => ['1.1.1', '1.1.2', '1.1.3', '1.1.4', '1.1.5'].some(code => a.code.startsWith(code)))
            .reduce((sum, a) => sum + Math.abs(a.balance), 0) || totalAssets * 0.6;

        const currentLiabilities = balanceData.liabilities.items
            .filter(a => ['2.1'].some(code => a.code.startsWith(code)))
            .reduce((sum, a) => sum + Math.abs(a.balance), 0) || totalLiabilities * 0.5;

        const inventory = balanceData.assets.items
            .filter(a => a.code.startsWith('1.1.4'))
            .reduce((sum, a) => sum + Math.abs(a.balance), 0) || currentAssets * 0.3;

        // Calcular Ratios
        const ratios = {
            // Liquidez
            currentRatio: currentLiabilities > 0 ? currentAssets / currentLiabilities : 0,
            quickRatio: currentLiabilities > 0 ? (currentAssets - inventory) / currentLiabilities : 0,

            // Solvencia/Endeudamiento
            debtRatio: totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0,
            debtToEquity: totalEquity > 0 ? totalLiabilities / totalEquity : 0,
            equityRatio: totalAssets > 0 ? (totalEquity / totalAssets) * 100 : 0,

            // Rentabilidad
            roa: totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0,
            roe: totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0,
            netProfitMargin: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0,
            grossProfitMargin: totalRevenue > 0 ? ((totalRevenue - totalExpenses) / totalRevenue) * 100 : 0
        };

        // Función para evaluar el estado del ratio
        const getRatioStatus = (value, type) => {
            switch (type) {
                case 'currentRatio':
                    if (value >= 2) return { status: 'success', text: 'Excelente', icon: 'check-circle' };
                    if (value >= 1.5) return { status: 'warning', text: 'Bueno', icon: 'exclamation-circle' };
                    if (value >= 1) return { status: 'warning', text: 'Aceptable', icon: 'exclamation-circle' };
                    return { status: 'error', text: 'Bajo', icon: 'times-circle' };
                case 'quickRatio':
                    if (value >= 1) return { status: 'success', text: 'Excelente', icon: 'check-circle' };
                    if (value >= 0.7) return { status: 'warning', text: 'Aceptable', icon: 'exclamation-circle' };
                    return { status: 'error', text: 'Bajo', icon: 'times-circle' };
                case 'debtRatio':
                    if (value <= 40) return { status: 'success', text: 'Bajo riesgo', icon: 'check-circle' };
                    if (value <= 60) return { status: 'warning', text: 'Moderado', icon: 'exclamation-circle' };
                    return { status: 'error', text: 'Alto riesgo', icon: 'times-circle' };
                case 'roe':
                case 'roa':
                    if (value >= 15) return { status: 'success', text: 'Excelente', icon: 'check-circle' };
                    if (value >= 8) return { status: 'warning', text: 'Bueno', icon: 'exclamation-circle' };
                    if (value > 0) return { status: 'warning', text: 'Bajo', icon: 'exclamation-circle' };
                    return { status: 'error', text: 'Negativo', icon: 'times-circle' };
                default:
                    return { status: 'info', text: '-', icon: 'info-circle' };
            }
        };

        const currentStatus = getRatioStatus(ratios.currentRatio, 'currentRatio');
        const quickStatus = getRatioStatus(ratios.quickRatio, 'quickRatio');
        const debtStatus = getRatioStatus(ratios.debtRatio, 'debtRatio');
        const roeStatus = getRatioStatus(ratios.roe, 'roe');
        const roaStatus = getRatioStatus(ratios.roa, 'roa');

        return `
            <div class="page-header">
                <h1 class="page-title">Ratios Financieros</h1>
                <p class="page-subtitle">Análisis de Indicadores Financieros - ${company.name}</p>
            </div>
            
            <div class="toolbar">
                <div class="toolbar-left">
                    <input type="date" class="form-control" id="ratios-date" value="${Helpers.getCurrentDate()}">
                    <button class="btn btn-primary" id="btn-generate-ratios">
                        <i class="fas fa-sync"></i> Actualizar
                    </button>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-outline" id="btn-print-ratios">
                        <i class="fas fa-print"></i> Imprimir
                    </button>
                    <button class="btn btn-outline" id="btn-export-ratios-pdf">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                </div>
            </div>

            <!-- Ratios de Liquidez -->
            <div class="card" style="margin-bottom: var(--space-4);">
                <div class="card-header">
                    <div class="card-title"><i class="fas fa-tint"></i> Ratios de Liquidez</div>
                    <span class="badge badge-info">Capacidad de pago a corto plazo</span>
                </div>
                <div class="card-body">
                    <div class="dashboard-grid">
                        <div class="kpi-card ${currentStatus.status}">
                            <div class="kpi-header">
                                <div class="kpi-icon ${currentStatus.status}"><i class="fas fa-${currentStatus.icon}"></i></div>
                            </div>
                            <div class="kpi-value">${ratios.currentRatio.toFixed(2)}</div>
                            <div class="kpi-label">Razón Corriente</div>
                            <div class="kpi-change ${currentStatus.status}">${currentStatus.text}</div>
                        </div>
                        <div class="kpi-card ${quickStatus.status}">
                            <div class="kpi-header">
                                <div class="kpi-icon ${quickStatus.status}"><i class="fas fa-${quickStatus.icon}"></i></div>
                            </div>
                            <div class="kpi-value">${ratios.quickRatio.toFixed(2)}</div>
                            <div class="kpi-label">Prueba Ácida</div>
                            <div class="kpi-change ${quickStatus.status}">${quickStatus.text}</div>
                        </div>
                        <div class="kpi-card span-2">
                            <div class="kpi-header">
                                <div class="kpi-icon info"><i class="fas fa-info-circle"></i></div>
                            </div>
                            <div style="padding: var(--space-2); font-size: var(--font-size-sm);">
                                <p><strong>Razón Corriente:</strong> Activo Corr. / Pasivo Corr. (Ideal: ≥ 1.5)</p>
                                <p><strong>Prueba Ácida:</strong> (Activo Corr. - Inventario) / Pasivo Corr. (Ideal: ≥ 1)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Ratios de Solvencia -->
            <div class="card" style="margin-bottom: var(--space-4);">
                <div class="card-header">
                    <div class="card-title"><i class="fas fa-shield-alt"></i> Ratios de Solvencia / Endeudamiento</div>
                    <span class="badge badge-warning">Estructura de capital</span>
                </div>
                <div class="card-body">
                    <div class="dashboard-grid">
                        <div class="kpi-card ${debtStatus.status}">
                            <div class="kpi-header">
                                <div class="kpi-icon ${debtStatus.status}"><i class="fas fa-${debtStatus.icon}"></i></div>
                            </div>
                            <div class="kpi-value">${ratios.debtRatio.toFixed(1)}%</div>
                            <div class="kpi-label">Nivel de Endeudamiento</div>
                            <div class="kpi-change ${debtStatus.status}">${debtStatus.text}</div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-header">
                                <div class="kpi-icon info"><i class="fas fa-balance-scale"></i></div>
                            </div>
                            <div class="kpi-value">${ratios.debtToEquity.toFixed(2)}</div>
                            <div class="kpi-label">Deuda / Patrimonio</div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-header">
                                <div class="kpi-icon success"><i class="fas fa-percentage"></i></div>
                            </div>
                            <div class="kpi-value">${ratios.equityRatio.toFixed(1)}%</div>
                            <div class="kpi-label">Autonomía Financiera</div>
                        </div>
                        <div class="chart-card">
                            <div class="chart-header">
                                <div class="chart-title">Estructura de Capital</div>
                            </div>
                            <div class="chart-body" style="height: 200px;">
                                <canvas id="capital-structure-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Ratios de Rentabilidad -->
            <div class="card" style="margin-bottom: var(--space-4);">
                <div class="card-header">
                    <div class="card-title"><i class="fas fa-chart-line"></i> Ratios de Rentabilidad</div>
                    <span class="badge badge-success">Generación de resultados</span>
                </div>
                <div class="card-body">
                    <div class="dashboard-grid">
                        <div class="kpi-card ${roaStatus.status}">
                            <div class="kpi-header">
                                <div class="kpi-icon ${roaStatus.status}"><i class="fas fa-${roaStatus.icon}"></i></div>
                            </div>
                            <div class="kpi-value">${ratios.roa.toFixed(2)}%</div>
                            <div class="kpi-label">ROA (Retorno sobre Activos)</div>
                            <div class="kpi-change ${roaStatus.status}">${roaStatus.text}</div>
                        </div>
                        <div class="kpi-card ${roeStatus.status}">
                            <div class="kpi-header">
                                <div class="kpi-icon ${roeStatus.status}"><i class="fas fa-${roeStatus.icon}"></i></div>
                            </div>
                            <div class="kpi-value">${ratios.roe.toFixed(2)}%</div>
                            <div class="kpi-label">ROE (Retorno sobre Patrimonio)</div>
                            <div class="kpi-change ${roeStatus.status}">${roeStatus.text}</div>
                        </div>
                        <div class="kpi-card">
                            <div class="kpi-header">
                                <div class="kpi-icon info"><i class="fas fa-percentage"></i></div>
                            </div>
                            <div class="kpi-value">${ratios.netProfitMargin.toFixed(2)}%</div>
                            <div class="kpi-label">Margen de Resultado Neto</div>
                        </div>
                        <div class="chart-card">
                            <div class="chart-header">
                                <div class="chart-title">Indicadores de Rentabilidad</div>
                            </div>
                            <div class="chart-body" style="height: 200px;">
                                <canvas id="profitability-chart"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráfico Resumen -->
            <div class="dashboard-grid">
                <div class="chart-card span-2">
                    <div class="chart-header">
                        <div class="chart-title"><i class="fas fa-chart-radar"></i> Resumen de Ratios Financieros</div>
                    </div>
                    <div class="chart-body" style="height: 300px;">
                        <canvas id="ratios-summary-chart"></canvas>
                    </div>
                </div>
                <div class="chart-card span-2">
                    <div class="chart-header">
                        <div class="chart-title"><i class="fas fa-chart-bar"></i> Comparación de Indicadores</div>
                    </div>
                    <div class="chart-body" style="height: 300px;">
                        <canvas id="ratios-bar-chart"></canvas>
                    </div>
                </div>
            </div>

            <!-- Tabla Resumen -->
            <div class="card" style="margin-top: var(--space-4);">
                <div class="card-header">
                    <div class="card-title"><i class="fas fa-table"></i> Resumen de Indicadores</div>
                </div>
                <div class="card-body">
                    <table class="data-table" style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Categoría</th>
                                <th>Indicador</th>
                                <th>Fórmula</th>
                                <th style="text-align: right;">Valor</th>
                                <th style="text-align: center;">Interpretación</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td rowspan="2" style="font-weight: 600; background: var(--info-50);">Liquidez</td>
                                <td>Razón Corriente</td>
                                <td><code>Act. Corr. / Pas. Corr.</code></td>
                                <td style="text-align: right; font-weight: 600;">${ratios.currentRatio.toFixed(2)}</td>
                                <td style="text-align: center;"><span class="badge badge-${currentStatus.status}">${currentStatus.text}</span></td>
                            </tr>
                            <tr>
                                <td>Prueba Ácida</td>
                                <td><code>(Act. Corr. - Inv.) / Pas. Corr.</code></td>
                                <td style="text-align: right; font-weight: 600;">${ratios.quickRatio.toFixed(2)}</td>
                                <td style="text-align: center;"><span class="badge badge-${quickStatus.status}">${quickStatus.text}</span></td>
                            </tr>
                            <tr>
                                <td rowspan="3" style="font-weight: 600; background: var(--warning-50);">Solvencia</td>
                                <td>Endeudamiento</td>
                                <td><code>Pasivo / Activo × 100</code></td>
                                <td style="text-align: right; font-weight: 600;">${ratios.debtRatio.toFixed(1)}%</td>
                                <td style="text-align: center;"><span class="badge badge-${debtStatus.status}">${debtStatus.text}</span></td>
                            </tr>
                            <tr>
                                <td>Deuda/Patrimonio</td>
                                <td><code>Pasivo / Patrimonio</code></td>
                                <td style="text-align: right; font-weight: 600;">${ratios.debtToEquity.toFixed(2)}</td>
                                <td style="text-align: center;">-</td>
                            </tr>
                            <tr>
                                <td>Autonomía</td>
                                <td><code>Patrimonio / Activo × 100</code></td>
                                <td style="text-align: right; font-weight: 600;">${ratios.equityRatio.toFixed(1)}%</td>
                                <td style="text-align: center;">-</td>
                            </tr>
                            <tr>
                                <td rowspan="3" style="font-weight: 600; background: var(--success-50);">Rentabilidad</td>
                                <td>ROA</td>
                                <td><code>Resultado / Activo × 100</code></td>
                                <td style="text-align: right; font-weight: 600;">${ratios.roa.toFixed(2)}%</td>
                                <td style="text-align: center;"><span class="badge badge-${roaStatus.status}">${roaStatus.text}</span></td>
                            </tr>
                            <tr>
                                <td>ROE</td>
                                <td><code>Resultado / Patrimonio × 100</code></td>
                                <td style="text-align: right; font-weight: 600;">${ratios.roe.toFixed(2)}%</td>
                                <td style="text-align: center;"><span class="badge badge-${roeStatus.status}">${roeStatus.text}</span></td>
                            </tr>
                            <tr>
                                <td>Margen Neto</td>
                                <td><code>Utilidad / Ventas × 100</code></td>
                                <td style="text-align: right; font-weight: 600;">${ratios.netProfitMargin.toFixed(2)}%</td>
                                <td style="text-align: center;">-</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Información Educativa -->
            <div class="card" style="margin-top: var(--space-4);">
                <div class="card-header">
                    <div class="card-title"><i class="fas fa-graduation-cap"></i> ¿Cómo interpretar los Ratios Financieros?</div>
                </div>
                <div class="card-body">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-4);">
                        <div style="background: var(--info-50); padding: var(--space-4); border-radius: var(--radius-lg);">
                            <h4 style="color: var(--info-600); margin-bottom: var(--space-2);"><i class="fas fa-tint"></i> Liquidez</h4>
                            <p style="font-size: var(--font-size-sm);">Miden la capacidad de la empresa para cumplir con sus obligaciones a corto plazo. Una razón corriente > 1.5 indica buena liquidez.</p>
                        </div>
                        <div style="background: var(--warning-50); padding: var(--space-4); border-radius: var(--radius-lg);">
                            <h4 style="color: var(--warning-600); margin-bottom: var(--space-2);"><i class="fas fa-shield-alt"></i> Solvencia</h4>
                            <p style="font-size: var(--font-size-sm);">Miden el nivel de endeudamiento y la capacidad de pago a largo plazo. Un endeudamiento < 60% generalmente es aceptable.</p>
                        </div>
                        <div style="background: var(--success-50); padding: var(--space-4); border-radius: var(--radius-lg);">
                            <h4 style="color: var(--success-600); margin-bottom: var(--space-2);"><i class="fas fa-chart-line"></i> Rentabilidad</h4>
                            <p style="font-size: var(--font-size-sm);">Miden la eficiencia en la generación de resultados. Un ROE > 15% se considera excelente para la mayoría de industrias.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },


    async renderIncomeStatement() {
        const company = CompanyService.getCurrent();
        if (!company) return '<p>Seleccione una empresa</p>';

        const range = Helpers.getYearRange();
        const statement = await AccountingService.getIncomeStatement(range.start, range.end);

        return `
            <div class="page-header">
                <h1 class="page-title">Estado de Resultados (Utilidad o Pérdida del Ejercicio)</h1>
                <p class="page-subtitle">Del ${Formatters.date(range.start)} al ${Formatters.date(range.end)} - Formato por Función</p>
            </div>
            
            <div class="toolbar">
                <div class="toolbar-left">
                    <input type="date" class="form-control" id="date-from" value="${range.start}">
                    <input type="date" class="form-control" id="date-to" value="${range.end}">
                    <button class="btn btn-primary" id="btn-generate-statement">
                        <i class="fas fa-sync"></i> Generar
                    </button>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-outline" id="btn-export-statement">
                        <i class="fas fa-file-pdf"></i> PDF
                    </button>
                </div>
            </div>
            
            <div class="dashboard-grid" style="margin-bottom: var(--space-4);">
                <div class="kpi-card success">
                    <div class="kpi-header">
                        <div class="kpi-icon success"><i class="fas fa-arrow-up"></i></div>
                    </div>
                    <div class="kpi-value">${Formatters.currency(statement.revenues.total)}</div>
                    <div class="kpi-label">Ingresos Totales</div>
                </div>
                <div class="kpi-card error">
                    <div class="kpi-header">
                        <div class="kpi-icon error"><i class="fas fa-arrow-down"></i></div>
                    </div>
                    <div class="kpi-value">${Formatters.currency(statement.expenses.total)}</div>
                    <div class="kpi-label">Gastos Totales</div>
                </div>
                <div class="kpi-card span-2 ${statement.netIncome >= 0 ? 'success' : 'error'}">
                    <div class="kpi-header">
                        <div class="kpi-icon ${statement.netIncome >= 0 ? 'success' : 'error'}">
                            <i class="fas fa-${statement.netIncome >= 0 ? 'trophy' : 'exclamation-triangle'}"></i>
                        </div>
                        ${statement.isProvisional ? `
                            <div class="kpi-badge info" title="Incluye movimientos de libros auxiliares no centralizados">
                                <i class="fas fa-clock"></i> Provisional (Centralizador)
                            </div>
                        ` : ''}
                    </div>
                    <div class="kpi-value">${Formatters.currency(statement.netIncome)}</div>
                    <div class="kpi-label">${statement.netIncome >= 0 ? 'Utilidad Neta' : 'Pérdida Neta'}</div>
                </div>
            </div>
            
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><i class="fas fa-chart-line"></i> Detalle</div>
                </div>
                <div class="card-body">
                    <h4 style="color: var(--success-500); margin-bottom: var(--space-3);">INGRESOS OPERACIONALES</h4>
                    ${this.renderAccountGroup(statement.revenues.items, 'revenue')}
                    <div style="display: flex; justify-content: space-between; font-weight: 600; margin: var(--space-3) 0; padding: var(--space-2) 0; border-top: 1px solid var(--border-medium);">
                        <span>Total Ventas e Ingresos</span>
                        <span>${Formatters.currency(statement.revenues.total)}</span>
                    </div>
                    
                    <h4 style="color: var(--error-500); margin: var(--space-4) 0 var(--space-3);">COSTOS DE VENTAS</h4>
                    ${this.renderAccountGroup(statement.costOfSales.items, 'expense')}
                    <div style="display: flex; justify-content: space-between; font-weight: 600; margin: var(--space-3) 0; padding: var(--space-2) 0; border-top: 1px solid var(--border-medium); color: var(--error-600);">
                        <span>Menos: Total Costos de Ventas</span>
                        <span>(${Formatters.currency(statement.costOfSales.total)})</span>
                    </div>

                    <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: var(--font-size-md); margin-bottom: var(--space-4); padding: var(--space-3); background: var(--primary-50); border-radius: var(--radius-md);">
                        <span>MARGEN BRUTO (Resultado Operacional Libre)</span>
                        <span style="color: var(--primary-600);">
                            ${Formatters.currency(statement.grossProfit)}
                        </span>
                    </div>
                    
                    <h4 style="color: var(--warning-600); margin: var(--space-4) 0 var(--space-3);">OTROS GASTOS (Administración, Ventas y Financieros)</h4>
                    ${this.renderAccountGroup(statement.otherExpenses.items, 'expense')}
                    <div style="display: flex; justify-content: space-between; font-weight: 600; margin: var(--space-3) 0; padding: var(--space-2) 0; border-top: 1px solid var(--border-medium); color: var(--warning-600);">
                        <span>Total Otros Gastos</span>
                        <span>(${Formatters.currency(statement.otherExpenses.total)})</span>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; font-weight: 700; font-size: var(--font-size-lg); margin-top: var(--space-4); padding: var(--space-3); background: ${statement.netIncome >= 0 ? 'var(--success-50)' : 'var(--error-50)'}; border-radius: var(--radius-lg);">
                        <span>${statement.netIncome >= 0 ? 'UTILIDAD DEL EJERCICIO' : 'PÉRDIDA DEL EJERCICIO'}</span>
                        <span style="color: ${statement.netIncome >= 0 ? 'var(--success-500)' : 'var(--error-500)'}">
                            ${statement.netIncome >= 0 ? Formatters.currency(statement.netIncome) : `(${Formatters.currency(Math.abs(statement.netIncome))})`}
                        </span>
                    </div>
                </div>
            </div>
        `;
    },

    renderCashFlow() {
        return `
            <div class="page-header">
                <h1 class="page-title">Flujo de Caja</h1>
                <p class="page-subtitle">Estado de Flujos de Efectivo</p>
            </div>
            
            <div class="toolbar">
                <div class="toolbar-left">
                    <input type="date" class="form-control" id="date-from">
                    <input type="date" class="form-control" id="date-to">
                    <button class="btn btn-primary" id="btn-generate-cashflow">
                        <i class="fas fa-sync"></i> Generar
                    </button>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="empty-state">
                        <i class="fas fa-money-bill-wave"></i>
                        <h3>Flujo de Caja</h3>
                        <p>Seleccione un período para generar el estado de flujo de efectivo</p>
                    </div>
                </div>
            </div>
        `;
    },

    async renderAccountAnalysis() {
        const accounts = await AccountingService.getMovementAccounts();

        return `
            <div class="page-header">
                <h1 class="page-title">Análisis de Cuentas</h1>
                <p class="page-subtitle">Análisis detallado de saldos y movimientos</p>
            </div>
            
            <div class="toolbar">
                <div class="toolbar-left">
                    <select class="form-control" id="analysis-type" style="width: 200px;">
                        <option value="summary">Resumen de Saldos</option>
                        <option value="movements">Movimientos del Período</option>
                        <option value="comparison">Comparativo</option>
                    </select>
                    <input type="date" class="form-control" id="date-from">
                    <input type="date" class="form-control" id="date-to">
                    <button class="btn btn-primary" id="btn-analyze">
                        <i class="fas fa-chart-bar"></i> Analizar
                    </button>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-outline" id="btn-export-analysis">
                        <i class="fas fa-file-excel"></i> Exportar
                    </button>
                </div>
            </div>
            
            <div class="dashboard-grid">
                <div class="chart-card span-2">
                    <div class="chart-header">
                        <div class="chart-title">Composición del Activo</div>
                    </div>
                    <div class="chart-body">
                        <canvas id="assets-chart"></canvas>
                    </div>
                </div>
                <div class="chart-card span-2">
                    <div class="chart-header">
                        <div class="chart-title">Estructura Financiera</div>
                    </div>
                    <div class="chart-body">
                        <canvas id="structure-chart"></canvas>
                    </div>
                </div>
            </div>
            
            <div class="card" style="margin-top: var(--space-4);">
                <div class="card-header">
                    <div class="card-title"><i class="fas fa-list"></i> Detalle de Cuentas</div>
                </div>
                <div id="analysis-table"></div>
            </div>
        `;
    },

    async init(view) {
        switch (view) {
            case 'balance-general': this.initBalanceSheet(); break;
            case 'balance-comprobacion': this.initTrialBalance(); break;
            case 'estado-resultados': this.initIncomeStatement(); break;
            case 'ratios-financieros': await this.initFinancialRatios(); break;
            case 'flujo-caja': this.initCashFlow(); break;
            case 'analisis-cuentas': await this.initAccountAnalysis(); break;
        }
    },

    initBalanceSheet() {
        document.getElementById('btn-generate-balance')?.addEventListener('click', async () => {
            App.navigate('reportes', 'balance-general');
        });

        document.getElementById('btn-export-balance-pdf')?.addEventListener('click', async () => {
            const company = CompanyService.getCurrent();
            const balanceData = await AccountingService.getBalanceSheet(document.getElementById('balance-date').value);
            await ExportService.balanceSheetPDF(balanceData, company.name);
            Toast.success('PDF generado');
        });

        document.getElementById('btn-export-balance-excel')?.addEventListener('click', () => {
            Toast.info('Exportar a Excel');
        });
    },

    initTrialBalance() {
        document.getElementById('btn-generate-trial')?.addEventListener('click', async () => {
            App.navigate('reportes', 'balance-comprobacion');
        });

        document.getElementById('btn-print-trial')?.addEventListener('click', () => {
            window.print();
        });

        document.getElementById('btn-export-trial-pdf')?.addEventListener('click', async () => {
            Toast.info('Exportando a PDF...');
        });

        document.getElementById('btn-export-trial-excel')?.addEventListener('click', () => {
            Toast.info('Exportando a Excel...');
        });
    },

    async initFinancialRatios() {
        // Event listeners
        document.getElementById('btn-generate-ratios')?.addEventListener('click', async () => {
            App.navigate('reportes', 'ratios-financieros');
        });

        document.getElementById('btn-print-ratios')?.addEventListener('click', () => {
            window.print();
        });

        document.getElementById('btn-export-ratios-pdf')?.addEventListener('click', async () => {
            Toast.info('Exportando PDF...');
        });

        // Obtener datos para gráficas
        const balanceData = await AccountingService.getBalanceSheet(Helpers.getCurrentDate());
        const range = Helpers.getYearRange();
        const incomeData = await AccountingService.getIncomeStatement(range.start, range.end);

        const totalAssets = balanceData.assets.total;
        const totalLiabilities = balanceData.liabilities.total;
        const totalEquity = balanceData.equity.total + balanceData.netIncome;
        const netIncome = incomeData.netIncome;
        const totalRevenue = incomeData.revenues.total;

        // Gráfico de estructura de capital
        Charts.doughnut('capital-structure-chart', {
            labels: ['Pasivos', 'Patrimonio'],
            values: [totalLiabilities, totalEquity]
        }, {
            colors: ['#ef4444', '#22c55e'],
            currency: true
        });

        // Gráfico de rentabilidad
        const roa = totalAssets > 0 ? (netIncome / totalAssets) * 100 : 0;
        const roe = totalEquity > 0 ? (netIncome / totalEquity) * 100 : 0;
        const npm = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

        Charts.bar('profitability-chart', {
            labels: ['ROA', 'ROE', 'Margen Neto'],
            datasets: [{
                label: '%',
                data: [roa, roe, npm]
            }]
        }, {
            percentage: true,
            colors: ['#3b82f6', '#22c55e', '#f59e0b']
        });

        // Gráfico resumen (tipo radar simulado con bar horizontal)
        const currentAssets = balanceData.assets.items
            .filter(a => ['1.1.1', '1.1.2', '1.1.3', '1.1.4', '1.1.5'].some(code => a.code.startsWith(code)))
            .reduce((sum, a) => sum + Math.abs(a.balance), 0) || totalAssets * 0.6;
        const currentLiabilities = balanceData.liabilities.items
            .filter(a => ['2.1'].some(code => a.code.startsWith(code)))
            .reduce((sum, a) => sum + Math.abs(a.balance), 0) || totalLiabilities * 0.5;
        const inventory = currentAssets * 0.3;

        const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
        const quickRatio = currentLiabilities > 0 ? (currentAssets - inventory) / currentLiabilities : 0;
        const debtRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;

        Charts.doughnut('ratios-summary-chart', {
            labels: ['Liquidez', 'Solvencia', 'Rentabilidad'],
            values: [
                Math.min(currentRatio * 50, 100),
                Math.max(100 - debtRatio, 0),
                Math.min(Math.max(roe, 0) * 5, 100)
            ]
        }, {
            colors: ['#3b82f6', '#f59e0b', '#22c55e']
        });

        // Gráfico de barras comparativo
        Charts.bar('ratios-bar-chart', {
            labels: ['Razón Corriente', 'Prueba Ácida', 'Endeudamiento %', 'ROA %', 'ROE %'],
            datasets: [{
                label: 'Valor',
                data: [currentRatio, quickRatio, debtRatio, roa, roe]
            }]
        }, {
            horizontal: true
        });
    },

    initIncomeStatement() {
        document.getElementById('btn-generate-statement')?.addEventListener('click', async () => {
            App.navigate('reportes', 'estado-resultados');
        });
    },

    initCashFlow() {
        document.getElementById('btn-generate-cashflow')?.addEventListener('click', () => {
            Toast.info('Generar flujo de caja');
        });
    },

    async initAccountAnalysis() {
        const accounts = await AccountingService.getChartOfAccounts();

        // Gráfico de activos
        const assets = accounts.filter(a => a.type === 'asset' && !a.isGroup && a.balance > 0);
        if (assets.length > 0) {
            Charts.doughnut('assets-chart', {
                labels: assets.slice(0, 8).map(a => a.name),
                values: assets.slice(0, 8).map(a => a.balance)
            }, { currency: true });
        }

        // Gráfico de estructura
        const structure = [
            { type: 'Activos', value: Helpers.sumBy(accounts.filter(a => a.type === 'asset' && !a.isGroup), 'balance') },
            { type: 'Pasivos', value: Helpers.sumBy(accounts.filter(a => a.type === 'liability' && !a.isGroup), 'balance') },
            { type: 'Patrimonio', value: Helpers.sumBy(accounts.filter(a => a.type === 'equity' && !a.isGroup), 'balance') }
        ];

        Charts.bar('structure-chart', {
            labels: structure.map(s => s.type),
            datasets: [{ label: 'Saldo', data: structure.map(s => s.value) }]
        }, { currency: true });

        // Tabla de cuentas
        DataTable.create('analysis-table', {
            columns: [
                { key: 'code', label: 'Código' },
                { key: 'name', label: 'Cuenta' },
                {
                    key: 'type', label: 'Tipo', render: (v) => {
                        const labels = { asset: 'Activo', liability: 'Pasivo', equity: 'Patrimonio', revenue: 'Ingreso', expense: 'Gasto' };
                        return labels[v] || v;
                    }
                },
                { key: 'balance', label: 'Saldo', format: 'currency', class: 'text-right' }
            ],
            data: accounts.filter(a => !a.isGroup && a.balance !== 0),
            emptyMessage: 'No hay cuentas con saldo'
        });
    }
};

window.ReportesModule = ReportesModule;
