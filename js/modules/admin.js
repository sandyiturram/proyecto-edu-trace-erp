/**
 * EDU-TRACE ERP - Admin Module
 * Módulo de Administración
 */

const AdminModule = {
    currentView: 'empresas',

    async render(view = 'empresas') {
        this.currentView = view;

        switch (view) {
            case 'empresas': return await this.renderCompanies();
            case 'import-export': return this.renderImportExport();
            case 'configuracion': return await this.renderSettings();
            default: return '<p>Vista no encontrada</p>';
        }
    },

    async renderCompanies() {
        const companies = await CompanyService.getAll();
        const currentCompany = CompanyService.getCurrent();

        return `
            <div class="page-header">
                <h1 class="page-title">Gestión de Empresas</h1>
                <p class="page-subtitle">Administre sus empresas virtuales</p>
            </div>
            
            <div class="toolbar">
                <div class="toolbar-right">
                    <button class="btn btn-primary" id="btn-new-company">
                        <i class="fas fa-plus"></i> Nueva Empresa
                    </button>
                </div>
            </div>
            
            <div class="dashboard-grid">
                ${companies.map(company => `
                    <div class="card ${currentCompany?.id === company.id ? 'active-company' : ''}" data-company-id="${company.id}">
                        <div class="card-body">
                            <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-3);">
                                <div class="avatar" style="background: linear-gradient(135deg, var(--primary-500), var(--primary-700)); color: white;">
                                    ${company.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h3 style="font-size: var(--font-size-base); font-weight: 600; margin: 0;">
                                        ${company.name}
                                    </h3>
                                    <p style="font-size: var(--font-size-xs); color: var(--text-tertiary); margin: 0;">
                                        ${company.rut || 'Sin RUT'}
                                    </p>
                                </div>
                                ${currentCompany?.id === company.id ? '<span class="badge badge-success">Activa</span>' : ''}
                            </div>
                            <div style="font-size: var(--font-size-xs); color: var(--text-secondary); margin-bottom: var(--space-3);">
                                <div><i class="fas fa-calendar" style="width: 16px;"></i> Año fiscal: ${company.fiscalYear || new Date().getFullYear()}</div>
                                <div><i class="fas fa-clock" style="width: 16px;"></i> Creada: ${Formatters.date(company.createdAt)}</div>
                            </div>
                            <div class="btn-group" style="width: 100%;">
                                ${currentCompany?.id !== company.id ? `
                                    <button class="btn btn-primary btn-sm" style="flex: 1;" data-action="select" data-id="${company.id}">
                                        <i class="fas fa-check"></i> Seleccionar
                                    </button>
                                ` : ''}
                                <button class="btn btn-outline btn-sm" data-action="export" data-id="${company.id}">
                                    <i class="fas fa-download"></i>
                                </button>
                                <button class="btn btn-outline btn-sm" data-action="edit" data-id="${company.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline btn-sm" style="color: var(--error-500);" data-action="delete" data-id="${company.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `).join('') || `
                    <div class="card span-4">
                        <div class="card-body">
                            <div class="empty-state">
                                <i class="fas fa-building"></i>
                                <h3>Sin empresas</h3>
                                <p>Cree su primera empresa virtual para comenzar</p>
                                <button class="btn btn-primary" id="btn-first-company">
                                    <i class="fas fa-plus"></i> Crear Empresa
                                </button>
                            </div>
                        </div>
                    </div>
                `}
            </div>
        `;
    },

    renderImportExport() {
        return `
            <div class="page-header">
                <h1 class="page-title">Importar / Exportar</h1>
                <p class="page-subtitle">Gestione los datos de su empresa</p>
            </div>
            
            <div class="dashboard-grid">
                <!-- Exportar -->
                <div class="card span-2">
                    <div class="card-header">
                        <div class="card-title"><i class="fas fa-file-export"></i> Exportar Datos</div>
                    </div>
                    <div class="card-body">
                        <p style="margin-bottom: var(--space-4); color: var(--text-secondary);">
                            Exporte todos los datos de la empresa actual para backup o compartir.
                        </p>
                        <div class="btn-group" style="flex-wrap: wrap;">
                            <button class="btn btn-primary" id="btn-export-json">
                                <i class="fas fa-file-code"></i> JSON (Backup Completo)
                            </button>
                            <button class="btn btn-outline" id="btn-export-excel">
                                <i class="fas fa-file-excel"></i> Excel
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Importar -->
                <div class="card span-4">
                    <div class="card-header">
                        <div class="card-title"><i class="fas fa-file-import"></i> Importar Datos</div>
                    </div>
                    <div class="card-body">
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6);">
                            <!-- Zona de carga -->
                            <div>
                                <h4 style="margin-bottom: var(--space-3); color: var(--text-primary);">
                                    <i class="fas fa-upload"></i> Cargar Archivo
                                </h4>
                                <div class="upload-zone" id="upload-zone" style="border: 2px dashed var(--border-medium); border-radius: var(--radius-lg); padding: var(--space-6); text-align: center; cursor: pointer; transition: all var(--transition-fast);">
                                    <i class="fas fa-cloud-upload-alt" style="font-size: 2rem; color: var(--primary-500); margin-bottom: var(--space-3);"></i>
                                    <p style="margin: 0; font-weight: 500;">Arrastre un archivo aquí o haga clic para seleccionar</p>
                                    <p style="margin: var(--space-2) 0 0; font-size: var(--font-size-xs); color: var(--text-tertiary);">
                                        Formatos soportados: JSON, Excel (.xlsx)
                                    </p>
                                    <input type="file" id="import-file" accept=".json,.xlsx" style="display: none;">
                                </div>
                                <div style="margin-top: var(--space-3); display: flex; gap: var(--space-2); flex-wrap: wrap;">
                                    <button class="btn btn-outline btn-sm" id="btn-download-template">
                                        <i class="fas fa-download"></i> Descargar Plantilla
                                    </button>
                                    <button class="btn btn-primary btn-sm" id="btn-generate-ai-prompt">
                                        <i class="fas fa-robot"></i> Generar con IA
                                    </button>
                                </div>
                            </div>
                            
                            <!-- Documentación de estructura -->
                            <div>
                                <h4 style="margin-bottom: var(--space-3); color: var(--text-primary);">
                                    <i class="fas fa-book"></i> Estructura del Archivo JSON
                                </h4>
                                <div style="background: var(--neutral-900); color: #e5e7eb; padding: var(--space-4); border-radius: var(--radius-lg); font-family: monospace; font-size: var(--font-size-xs); max-height: 300px; overflow-y: auto;">
<pre style="margin: 0; white-space: pre-wrap;">{
  "companies": [{
    "id": "uuid",
    "name": "Nombre Empresa",
    "rut": "76.123.456-7",
    "accountingSystem": "journalizer|centralizer"
  }],
  "accounts": [{
    "id": "uuid",
    "companyId": "uuid",
    "code": "1.1.01.001",
    "name": "Caja",
    "type": "asset|liability|equity|revenue|expense",
    "balance": 0
  }],
  "journalEntries": [{
    "id": "uuid",
    "companyId": "uuid",
    "number": 1,
    "date": "2024-01-15",
    "description": "Descripción",
    "lines": [...]
  }],
  "auxiliaryJournals": [{
    "id": "uuid",
    "module": "sales|purchases|treasury",
    "period": "2024-01",
    "status": "open|centralized",
    "transactions": [...]
  }],
  "suppliers": [...],
  "customers": [...],
  "products": [...]
}
}</pre>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Sección de referencia de campos -->
                        <div style="margin-top: var(--space-6);">
                            <h4 style="margin-bottom: var(--space-3); color: var(--text-primary);">
                                <i class="fas fa-list-alt"></i> Referencia de Entidades
                            </h4>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: var(--space-4);">
                                <!-- Empresas -->
                                <div style="background: var(--primary-50); padding: var(--space-3); border-radius: var(--radius-md); border-left: 4px solid var(--primary-500);">
                                    <h5 style="margin: 0 0 var(--space-2); color: var(--primary-700);"><i class="fas fa-building"></i> companies (Empresas)</h5>
                                    <ul style="margin: 0; padding-left: var(--space-4); font-size: var(--font-size-xs); color: var(--text-secondary);">
                                        <li><code>name</code>: Nombre de la empresa</li>
                                        <li><code>rut</code>: RUT único</li>
                                        <li><code>accountingSystem</code>: <b>journalizer</b> o <b>centralizer</b></li>
                                        <li><code>fiscalYear</code>: Año contable</li>
                                    </ul>
                                </div>

                                <!-- Cuentas -->
                                <div style="background: var(--info-50); padding: var(--space-3); border-radius: var(--radius-md); border-left: 4px solid var(--info-500);">
                                    <h5 style="margin: 0 0 var(--space-2); color: var(--info-700);"><i class="fas fa-book"></i> accounts (Cuentas)</h5>
                                    <ul style="margin: 0; padding-left: var(--space-4); font-size: var(--font-size-xs); color: var(--text-secondary);">
                                        <li><code>code</code>: Código único (ej: 1.1.01.001)</li>
                                        <li><code>name</code>: Nombre de la cuenta</li>
                                        <li><code>type</code>: asset, liability, equity, revenue, expense</li>
                                        <li><code>balance</code>: Saldo inicial</li>
                                        <li><code>isGroup</code>: true si es cuenta de grupo</li>
                                    </ul>
                                </div>
                                
                                <!-- Asientos -->
                                <div style="background: var(--success-50); padding: var(--space-3); border-radius: var(--radius-md); border-left: 4px solid var(--success-500);">
                                    <h5 style="margin: 0 0 var(--space-2); color: var(--success-700);"><i class="fas fa-edit"></i> journalEntries (Asientos)</h5>
                                    <ul style="margin: 0; padding-left: var(--space-4); font-size: var(--font-size-xs); color: var(--text-secondary);">
                                        <li><code>number</code>: Correlativo</li>
                                        <li><code>date</code>: Fecha (YYYY-MM-DD)</li>
                                        <li><code>lines</code>: Array de líneas contables</li>
                                        <li><code>status</code>: draft, posted, cancelled</li>
                                    </ul>
                                </div>

                                <!-- Auxiliares (SISTEMA DUAL) -->
                                <div style="background: var(--purple); background-color: #f5f3ff; padding: var(--space-3); border-radius: var(--radius-md); border-left: 4px solid var(--purple);">
                                    <h5 style="margin: 0 0 var(--space-2); color: #6d28d9;"><i class="fas fa-exchange-alt"></i> auxiliaryJournals (Auxiliares)</h5>
                                    <ul style="margin: 0; padding-left: var(--space-4); font-size: var(--font-size-xs); color: var(--text-secondary);">
                                        <li><code>module</code>: sales, purchases, treasury</li>
                                        <li><code>period</code>: Formato YYYY-MM</li>
                                        <li><code>status</code>: open, centralized</li>
                                        <li><code>transactions</code>: Detalle de transacciones</li>
                                    </ul>
                                </div>
                                
                                <!-- Proveedores -->
                                <div style="background: var(--warning-50); padding: var(--space-3); border-radius: var(--radius-md); border-left: 4px solid var(--warning-500);">
                                    <h5 style="margin: 0 0 var(--space-2); color: var(--warning-700);"><i class="fas fa-truck"></i> suppliers (Proveedores)</h5>
                                    <ul style="margin: 0; padding-left: var(--space-4); font-size: var(--font-size-xs); color: var(--text-secondary);">
                                        <li><code>name</code>: Razón social</li>
                                        <li><code>rut</code>: RUT del proveedor</li>
                                        <li><code>contact</code>: Nombre de contacto</li>
                                        <li><code>email</code>: Email de contacto</li>
                                    </ul>
                                </div>
                                
                                <!-- Clientes -->
                                <div style="background: #f0fdfa; padding: var(--space-3); border-radius: var(--radius-md); border-left: 4px solid #14b8a6;">
                                    <h5 style="margin: 0 0 var(--space-2); color: #0f766e;"><i class="fas fa-users"></i> customers (Clientes)</h5>
                                    <ul style="margin: 0; padding-left: var(--space-4); font-size: var(--font-size-xs); color: var(--text-secondary);">
                                        <li><code>name</code>: Razón social</li>
                                        <li><code>rut</code>: RUT del cliente</li>
                                        <li><code>creditLimit</code>: Límite de crédito</li>
                                        <li><code>email</code>, <code>phone</code>: Contacto</li>
                                    </ul>
                                </div>
                                
                                <!-- Productos -->
                                <div style="background: var(--error-50); padding: var(--space-3); border-radius: var(--radius-md); border-left: 4px solid var(--error-500);">
                                    <h5 style="margin: 0 0 var(--space-2); color: var(--error-700);"><i class="fas fa-box"></i> products (Productos)</h5>
                                    <ul style="margin: 0; padding-left: var(--space-4); font-size: var(--font-size-xs); color: var(--text-secondary);">
                                        <li><code>code</code>: SKU único</li>
                                        <li><code>name</code>: Nombre del producto</li>
                                        <li><code>cost</code>: Costo unitario</li>
                                        <li><code>price</code>: Precio de venta</li>
                                        <li><code>stock</code>: Stock actual</li>
                                    </ul>
                                </div>
                                
                                <!-- Empleados -->
                                <div style="background: var(--neutral-100); padding: var(--space-3); border-radius: var(--radius-md); border-left: 4px solid var(--neutral-500);">
                                    <h5 style="margin: 0 0 var(--space-2); color: var(--neutral-700);"><i class="fas fa-id-card"></i> employees (Empleados)</h5>
                                    <ul style="margin: 0; padding-left: var(--space-4); font-size: var(--font-size-xs); color: var(--text-secondary);">
                                        <li><code>rut</code>: RUT del empleado</li>
                                        <li><code>name</code>: Nombre completo</li>
                                        <li><code>position</code>: Cargo</li>
                                        <li><code>salary</code>: Sueldo bruto</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Notas importantes -->
                        <div class="alert alert-info" style="margin-top: var(--space-4);">
                            <i class="fas fa-lightbulb"></i>
                            <div class="alert-content">
                                <p style="margin: 0;"><strong>Consejos:</strong></p>
                                <ul style="margin: var(--space-2) 0 0; padding-left: var(--space-4); font-size: var(--font-size-sm);">
                                    <li>Todos los IDs deben ser UUIDs únicos (ej: "a1b2c3d4-e5f6-...")</li>
                                    <li>El campo <code>companyId</code> debe coincidir con el ID de la empresa</li>
                                    <li>Los asientos deben estar cuadrados: Σ Débitos = Σ Créditos</li>
                                    <li>Puede ver ejemplos en los archivos de caso de estudio incluidos</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Datos de demostración -->
                <div class="card span-2">
                    <div class="card-header">
                        <div class="card-title"><i class="fas fa-flask"></i> Datos de Demostración</div>
                    </div>
                    <div class="card-body">
                        <p style="margin-bottom: var(--space-4); color: var(--text-secondary);">
                            Genere datos de ejemplo para probar el sistema. Requiere tener una empresa seleccionada.
                        </p>
                        <div class="btn-group" style="flex-wrap: wrap; gap: var(--space-2);">
                            <button class="btn btn-primary" id="btn-create-demo">
                                <i class="fas fa-magic"></i> Crear Datos Básicos
                            </button>
                            <button class="btn btn-success" id="btn-load-case-study">
                                <i class="fas fa-briefcase"></i> Caso Comercial (Jornalizador)
                            </button>
                            <button class="btn btn-purple" id="btn-load-dual-case" style="background: var(--purple, #7c3aed); color: white;">
                                <i class="fas fa-exchange-alt"></i> Caso Sistema Dual (Centralizador)
                            </button>
                            <button class="btn btn-outline" id="btn-load-service-case">
                                <i class="fas fa-cogs"></i> Caso Servicios
                            </button>
                        </div>
                        <div style="margin-top: var(--space-4); padding: var(--space-3); background: var(--info-50); border-radius: var(--radius-md);">
                            <p style="font-size: var(--font-size-sm); margin: 0;"><i class="fas fa-info-circle" style="color: var(--info-500);"></i> 
                            <strong>Datos Básicos:</strong> Entidades iniciales y 2 asientos contables de apertura.<br>
                            <strong>Caso Comercial:</strong> Empresa completa con Libro Diario Único (Jornalizador).<br>
                            <strong>Caso Sistema Dual:</strong> Demostración de Libros Auxiliares y Centralización.<br>
                            <strong>Caso Servicios:</strong> Empresa de servicios con facturación y gastos.</p>
                        </div>
                    </div>
                </div>
                
                <!-- Limpiar datos -->
                <div class="card span-2">
                    <div class="card-header">
                        <div class="card-title"><i class="fas fa-eraser"></i> Limpiar Datos</div>
                    </div>
                    <div class="card-body">
                        <div class="alert alert-warning" style="margin-bottom: var(--space-4);">
                            <i class="fas fa-exclamation-triangle"></i>
                            <div class="alert-content">
                                <p><strong>Precaución:</strong> Esta acción eliminará todos los datos de la empresa actual.</p>
                            </div>
                        </div>
                        <button class="btn btn-danger" id="btn-clear-data">
                            <i class="fas fa-trash-alt"></i> Limpiar Todos los Datos
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    async renderSettings() {
        const company = CompanyService.getCurrent();
        const settings = company ? await CompanyService.getSettings() : null;

        return `
            <div class="page-header">
                <h1 class="page-title">Configuración</h1>
                <p class="page-subtitle">Ajustes de la empresa y parámetros del sistema</p>
            </div>
            
            ${!company ? `
                <div class="alert alert-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    <div class="alert-content">Seleccione una empresa para ver la configuración.</div>
                </div>
            ` : `
                <div class="card">
                    <div class="card-header">
                        <div class="card-title"><i class="fas fa-building"></i> Datos de la Empresa</div>
                    </div>
                    <div class="card-body">
                        <form id="company-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Nombre</label>
                                    <input type="text" class="form-control" name="name" value="${company.name}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">RUT</label>
                                    <input type="text" class="form-control" name="rut" value="${company.rut || ''}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Tipo de Sociedad</label>
                                    <select class="form-control" name="companyType">
                                        <option value="eirl" ${company.companyType === 'eirl' ? 'selected' : ''}>E.I.R.L. / Persona Natural</option>
                                        <option value="ltda" ${company.companyType === 'ltda' ? 'selected' : ''}>Soc. Responsabilidad Limitada (Ltda.)</option>
                                        <option value="spa" ${company.companyType === 'spa' ? 'selected' : ''}>Sociedades por Acciones (SpA)</option>
                                        <option value="sa" ${company.companyType === 'sa' ? 'selected' : ''}>Sociedad Anónima (S.A.)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Dirección</label>
                                    <input type="text" class="form-control" name="address" value="${company.address || ''}">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Teléfono</label>
                                    <input type="text" class="form-control" name="phone" value="${company.phone || ''}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Email</label>
                                    <input type="email" class="form-control" name="email" value="${company.email || ''}">
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Guardar Cambios
                            </button>
                        </form>
                    </div>
                </div>
                
                <div class="card" style="margin-top: var(--space-4);">
                    <div class="card-header">
                        <div class="card-title"><i class="fas fa-cog"></i> Parámetros Contables</div>
                    </div>
                    <div class="card-body">
                        <form id="settings-form">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Año Fiscal</label>
                                    <input type="number" class="form-control" name="fiscalYear" 
                                        value="${settings?.fiscalYear || new Date().getFullYear()}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">IVA (%)</label>
                                    <input type="number" class="form-control" name="taxRate" 
                                        value="${settings?.taxRate || 19}" step="0.1">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Impuesto Renta (%)</label>
                                    <input type="number" class="form-control" name="incomeTaxRate" 
                                        value="${settings?.incomeTaxRate || 27}" step="0.1">
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">Método de Inventario</label>
                                    <select class="form-control" name="inventoryMethod">
                                        <option value="promedio" ${settings?.inventoryMethod === 'promedio' ? 'selected' : ''}>Costo Promedio</option>
                                        <option value="fifo" ${settings?.inventoryMethod === 'fifo' ? 'selected' : ''}>FIFO (PEPS)</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">
                                        Sistema de Contabilización
                                        <i class="fas fa-info-circle" style="color: var(--info-500); cursor: help;" 
                                           title="Jornalizador: Registro directo en Libro Diario. Centralizador: Registro en libros auxiliares + centralización mensual."></i>
                                    </label>
                                    <select class="form-control" name="accountingSystem">
                                        <option value="journalizer" ${company.accountingSystem === 'journalizer' || !company.accountingSystem ? 'selected' : ''}>
                                            🔵 Jornalizador (Diario Único)
                                        </option>
                                        <option value="centralizer" ${company.accountingSystem === 'centralizer' ? 'selected' : ''}>
                                            🟢 Centralizador (Libros Auxiliares)
                                        </option>
                                    </select>
                                    <small class="form-text" style="color: var(--text-tertiary);">
                                        ${!company.accountingSystem || company.accountingSystem === 'journalizer'
                ? 'Modo actual: Registro directo (ideal para principiantes)'
                : 'Modo actual: Libros auxiliares (empresas avanzadas)'
            }
                                    </small>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Decimales</label>
                                    <select class="form-control" name="decimalPlaces">
                                        <option value="0" ${settings?.decimalPlaces === 0 ? 'selected' : ''}>Sin decimales</option>
                                        <option value="2" ${settings?.decimalPlaces === 2 ? 'selected' : ''}>2 decimales</option>
                                    </select>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary">
                                <i class="fas fa-save"></i> Guardar Configuración
                            </button>
                        </form>
                    </div>
                </div>
                
                <div class="card" style="margin-top: var(--space-4); border-color: var(--error-300);">
                    <div class="card-header" style="background: var(--error-50);">
                        <div class="card-title" style="color: var(--error-600);"><i class="fas fa-exclamation-triangle"></i> Zona de Peligro</div>
                    </div>
                    <div class="card-body">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4); padding-bottom: var(--space-4); border-bottom: 1px solid var(--border-light);">
                            <div>
                                <h4 style="margin: 0; font-size: var(--font-size-base);">Limpiar Datos</h4>
                                <p style="margin: var(--space-1) 0 0; font-size: var(--font-size-sm); color: var(--text-tertiary);">
                                    Elimina todos los datos de la empresa (cuentas, asientos, etc.) pero mantiene la empresa.
                                </p>
                            </div>
                            <button class="btn btn-outline" style="color: var(--error-500); border-color: var(--error-300);" id="btn-clear-company-data">
                                <i class="fas fa-eraser"></i> Limpiar Datos
                            </button>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h4 style="margin: 0; font-size: var(--font-size-base);">Eliminar Empresa</h4>
                                <p style="margin: var(--space-1) 0 0; font-size: var(--font-size-sm); color: var(--text-tertiary);">
                                    Elimina permanentemente la empresa y todos sus datos. Esta acción no se puede deshacer.
                                </p>
                            </div>
                            <button class="btn btn-danger" id="btn-delete-company">
                                <i class="fas fa-trash-alt"></i> Eliminar Empresa
                            </button>
                        </div>
                    </div>
                </div>
            `}
        `;
    },

    async init(view) {
        switch (view) {
            case 'empresas': this.initCompanies(); break;
            case 'import-export': this.initImportExport(); break;
            case 'configuracion': this.initSettings(); break;
        }
    },

    initCompanies() {
        // Nueva empresa
        document.getElementById('btn-new-company')?.addEventListener('click', () => {
            DashboardModule.showCreateCompanyModal();
        });

        document.getElementById('btn-first-company')?.addEventListener('click', () => {
            DashboardModule.showCreateCompanyModal();
        });

        // Acciones en empresas
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', async () => {
                const action = btn.dataset.action;
                const id = btn.dataset.id;

                switch (action) {
                    case 'select':
                        await CompanyService.setCurrent(id);
                        Toast.success('Empresa seleccionada');
                        App.navigate('dashboard');
                        break;
                    case 'edit':
                        Toast.info('Editar empresa');
                        break;
                    case 'export':
                        const loading = Toast.loading('Exportando...');
                        await CompanyService.setCurrent(id);
                        await CompanyService.exportData('json');
                        loading.success('Datos exportados');
                        break;
                    case 'delete':
                        const confirm = await Modal.confirm({
                            title: 'Eliminar Empresa',
                            message: '¿Está seguro de eliminar esta empresa? Se perderán todos los datos asociados.',
                            confirmText: 'Eliminar',
                            confirmClass: 'btn-danger'
                        });
                        if (confirm) {
                            await CompanyService.delete(id);
                            Toast.success('Empresa eliminada');
                            App.navigate('admin', 'empresas');
                        }
                        break;
                }
            });
        });
    },

    initImportExport() {
        // Exportar JSON
        document.getElementById('btn-export-json')?.addEventListener('click', async () => {
            const company = CompanyService.getCurrent();
            if (!company) {
                Toast.warning('Seleccione una empresa primero');
                return;
            }
            const loading = Toast.loading('Exportando...');
            await CompanyService.exportData('json');
            loading.success('Backup exportado correctamente');
        });

        // Exportar Excel
        document.getElementById('btn-export-excel')?.addEventListener('click', async () => {
            const company = CompanyService.getCurrent();
            if (!company) {
                Toast.warning('Seleccione una empresa primero');
                return;
            }
            const loading = Toast.loading('Exportando a Excel...');
            try {
                await App.exportToExcel(company);
                loading.success('Excel exportado correctamente');
            } catch (err) {
                loading.error('Error: ' + err.message);
            }
        });

        // Descargar plantilla
        document.getElementById('btn-download-template')?.addEventListener('click', () => {
            const template = {
                "_info": "Plantilla de importación EDU-TRACE ERP - Modifique los datos según su necesidad",
                "_instructions": [
                    "1. Todos los IDs deben ser UUIDs únicos",
                    "2. El companyId debe coincidir en todos los registros",
                    "3. Los asientos deben estar cuadrados (débitos = créditos)",
                    "4. Las fechas deben estar en formato YYYY-MM-DD",
                    "5. Los tipos de cuenta válidos: asset, liability, equity, revenue, expense"
                ],
                "companies": [{
                    "id": "empresa-001",
                    "name": "Mi Empresa SpA",
                    "rut": "76.000.000-0",
                    "address": "Av. Principal 123, Santiago",
                    "phone": "+56 2 1234 5678",
                    "email": "contacto@miempresa.cl",
                    "fiscalYear": 2024,
                    "accountingSystem": "journalizer"
                }],
                "accounts": [
                    { "id": "acc-001", "companyId": "empresa-001", "code": "1.1.01.001", "name": "Caja", "type": "asset", "balance": 1000000, "isGroup": false },
                    { "id": "acc-002", "companyId": "empresa-001", "code": "1.1.01.002", "name": "Banco Estado Cta Cte", "type": "asset", "balance": 5000000, "isGroup": false },
                    { "id": "acc-003", "companyId": "empresa-001", "code": "2.1.01.001", "name": "Proveedores", "type": "liability", "balance": 2000000, "isGroup": false },
                    { "id": "acc-004", "companyId": "empresa-001", "code": "3.1.01", "name": "Capital", "type": "equity", "balance": 4000000, "isGroup": false },
                    { "id": "acc-005", "companyId": "empresa-001", "code": "4.1.01.001", "name": "Ventas", "type": "revenue", "balance": 0, "isGroup": false },
                    { "id": "acc-006", "companyId": "empresa-001", "code": "5.1.01", "name": "Costo de Ventas", "type": "expense", "balance": 0, "isGroup": false }
                ],
                "suppliers": [
                    { "id": "sup-001", "companyId": "empresa-001", "name": "Proveedor Ejemplo Ltda.", "rut": "76.111.111-1", "contact": "Juan Pérez", "email": "contacto@proveedor.cl", "phone": "+56 2 1111 1111", "status": "active" }
                ],
                "customers": [
                    { "id": "cust-001", "companyId": "empresa-001", "name": "Cliente Ejemplo S.A.", "rut": "96.222.222-2", "contact": "María González", "email": "compras@cliente.cl", "phone": "+56 2 2222 2222", "creditLimit": 5000000, "status": "active" }
                ],
                "products": [
                    { "id": "prod-001", "companyId": "empresa-001", "code": "PROD001", "name": "Producto Ejemplo", "category": "General", "unit": "UN", "cost": 10000, "price": 15000, "stock": 100, "minStock": 10, "status": "active" }
                ],
                "employees": [
                    { "id": "emp-001", "companyId": "empresa-001", "rut": "12.345.678-9", "name": "Empleado Ejemplo", "position": "Contador", "department": "Administración", "salary": 1500000, "startDate": "2024-01-01", "status": "active" }
                ],
                "journalEntries": [
                    {
                        "id": "entry-001",
                        "companyId": "empresa-001",
                        "number": 1,
                        "date": "2024-01-15",
                        "description": "Asiento de ejemplo - Venta al contado",
                        "reference": "FAC-001",
                        "status": "posted",
                        "lines": [
                            { "id": "line-001", "entryId": "entry-001", "accountId": "acc-001", "accountCode": "1.1.01.001", "accountName": "Caja", "description": "Ingreso por venta", "debit": 119000, "credit": 0 },
                            { "id": "line-002", "entryId": "entry-001", "accountId": "acc-005", "accountCode": "4.1.01.001", "accountName": "Ventas", "description": "Venta de productos", "debit": 0, "credit": 100000 },
                            { "id": "line-003", "entryId": "entry-001", "accountId": "acc-iva", "accountCode": "2.1.03.001", "accountName": "IVA Débito", "description": "IVA 19%", "debit": 0, "credit": 19000 }
                        ]
                    }
                ]
            };

            const json = JSON.stringify(template, null, 2);
            Helpers.downloadFile(json, 'plantilla_importacion_edu_trace_erp.json', 'application/json');
            Toast.success('Plantilla descargada');
        });

        // Generar prompt para IA
        document.getElementById('btn-generate-ai-prompt')?.addEventListener('click', () => {
            const prompt = `Eres un experto en contabilidad y sistemas ERP. Necesito que generes un caso de estudio contable completo en formato JSON para importar a un sistema ERP educativo que soporta SISTEMA DUAL (Jornalizador y Centralizador).

## REQUISITOS CRÍTICOS:

1. **ECUACIÓN CONTABLE**: Los datos DEBEN cumplir: Activos = Pasivos + Patrimonio
2. **ASIENTOS CUADRADOS**: Cada asiento o transacción debe cumplir: Σ Débitos = Σ Créditos
3. **IDs ÚNICOS**: Usa UUIDs o identificadores únicos consistentes
4. **FORMATO DE FECHAS**: YYYY-MM-DD (ej: 2024-01-15)
5. **SISTEMA CONTABLE**: Define "accountingSystem" como "journalizer" (clásico) o "centralizer" (avanzado).

## INSTRUCCIONES DEL SISTEMA DUAL:

- Si "accountingSystem" es **journalizer**: Todas las transacciones van en "journalEntries" (Libro Diario).
- Si "accountingSystem" es **centralizer**: 
    - Las transacciones de Ventas, Compras y Tesorería deben ir en **"auxiliaryJournals"** (Libros Auxiliares).
    - Los asientos de apertura, ajustes y cierres siempre van en "journalEntries".

## CONTEXTO DEL CASO:

[DESCRIBE AQUÍ EL TIPO DE EMPRESA Y SITUACIÓN QUE DESEAS]

## ESTRUCTURA JSON REQUERIDA (Ejemplo]):

\`\`\`json
{
  "companies": [{
    "id": "uuid",
    "name": "Nombre Empresa SpA",
    "accountingSystem": "centralizer", // O "journalizer"
    "fiscalYear": 2024
  }],
  
  "accounts": [
    {"id": "acc-1", "companyId": "uuid", "code": "1.1.01.001", "name": "Caja", "type": "asset", "balance": 0}
  ],

  // Usar para: Apertura, Cierres, Ajustes, o TODO si es jornalizador
  "journalEntries": [
    {
      "id": "entry-1",
      "number": "ASI-001",
      "date": "2024-01-01",
      "description": "Asiento de Apertura",
      "lines": [...]
    }
  ],

  // Usar SOLO si el sistema es centralizer para Ventas, Compras y Tesorería
  "auxiliaryJournals": [
    {
      "id": "aux-1",
      "companyId": "uuid",
      "module": "sales", // "sales", "purchases" o "treasury"
      "period": "2024-01",
      "status": "open", // "open" o "centralized"
      "transactions": [
        {
          "transactionId": "t-1",
          "date": "2024-01-05",
          "description": "Venta Factura N° 101",
          "lines": [...] // Estructura idéntica a los asientos (debit/credit)
        }
      ]
    }
  ],
  
  "suppliers": [...],
  "customers": [...],
  "products": [...]
}
\`\`\`

## TRANSACCIONES A INCLUIR (mínimo 10):
1. Aporte de capital inicial.
2. Compra de mercadería y activos fijos.
3. Ventas con IVA (19%).
4. Pagos a proveedores y cobros a clientes.
5. Gastos operacionales y remuneraciones.

## VERIFICACIÓN FINAL:
- [ ] ¿Los asientos de "journalEntries" están cuadrados?
- [ ] ¿Las transacciones en "auxiliaryJournals" están cuadradas?
- [ ] ¿El catálogo de cuentas es coherente con los movimientos?
- [ ] ¿Los periodos de los auxiliares coinciden con las fechas de sus transacciones?

Genera el JSON completo y válido, listo para copiar e importar.`;

            // Crear modal con el prompt
            const modalHTML = `
                <div id="ai-prompt-modal" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: var(--space-4);">
                    <div style="background: var(--bg-primary); border-radius: var(--radius-xl); max-width: 900px; width: 100%; max-height: 90vh; display: flex; flex-direction: column; box-shadow: var(--shadow-xl);">
                        <div style="padding: var(--space-4); border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: center;">
                            <h3 style="margin: 0;"><i class="fas fa-robot" style="color: var(--primary-500);"></i> Prompt para Generar Datos con IA</h3>
                            <button id="close-ai-modal" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: var(--text-secondary);">&times;</button>
                        </div>
                        <div style="padding: var(--space-4); overflow-y: auto; flex: 1;">
                            <div class="alert alert-info" style="margin-bottom: var(--space-4);">
                                <i class="fas fa-lightbulb"></i>
                                <div class="alert-content">
                                    <p style="margin: 0;"><strong>Instrucciones:</strong></p>
                                    <ol style="margin: var(--space-2) 0 0; padding-left: var(--space-4); font-size: var(--font-size-sm);">
                                        <li>Copia el prompt de abajo</li>
                                        <li>Pégalo en ChatGPT, Claude, Gemini u otro chatbot</li>
                                        <li>Personaliza la sección "[DESCRIBE AQUÍ...]" con tu caso</li>
                                        <li>La IA generará un JSON válido</li>
                                        <li>Descarga o copia el JSON y súbelo aquí</li>
                                    </ol>
                                </div>
                            </div>
                            <div style="position: relative;">
                                <textarea id="ai-prompt-text" readonly style="width: 100%; height: 400px; font-family: monospace; font-size: var(--font-size-sm); padding: var(--space-4); border: 1px solid var(--border-medium); border-radius: var(--radius-lg); resize: vertical; background: var(--neutral-900); color: #e5e7eb;">${prompt.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</textarea>
                            </div>
                        </div>
                        <div style="padding: var(--space-4); border-top: 1px solid var(--border-light); display: flex; gap: var(--space-3); justify-content: flex-end;">
                            <button id="copy-ai-prompt" class="btn btn-primary">
                                <i class="fas fa-copy"></i> Copiar Prompt
                            </button>
                            <button id="close-ai-modal-btn" class="btn btn-outline">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            `;

            // Insertar modal
            document.body.insertAdjacentHTML('beforeend', modalHTML);

            // Event listeners del modal
            const modal = document.getElementById('ai-prompt-modal');
            const closeBtn = document.getElementById('close-ai-modal');
            const closeBtnAlt = document.getElementById('close-ai-modal-btn');
            const copyBtn = document.getElementById('copy-ai-prompt');
            const textarea = document.getElementById('ai-prompt-text');

            const closeModal = () => modal.remove();

            closeBtn.addEventListener('click', closeModal);
            closeBtnAlt.addEventListener('click', closeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });

            copyBtn.addEventListener('click', () => {
                textarea.select();
                navigator.clipboard.writeText(prompt).then(() => {
                    Toast.success('Prompt copiado al portapapeles');
                    copyBtn.innerHTML = '<i class="fas fa-check"></i> ¡Copiado!';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<i class="fas fa-copy"></i> Copiar Prompt';
                    }, 2000);
                }).catch(() => {
                    document.execCommand('copy');
                    Toast.success('Prompt copiado');
                });
            });
        });

        // Zona de upload
        const uploadZone = document.getElementById('upload-zone');
        const fileInput = document.getElementById('import-file');

        uploadZone?.addEventListener('click', () => fileInput?.click());

        uploadZone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--primary-500)';
            uploadZone.style.background = 'var(--primary-50)';
        });

        uploadZone?.addEventListener('dragleave', () => {
            uploadZone.style.borderColor = 'var(--border-medium)';
            uploadZone.style.background = 'transparent';
        });

        uploadZone?.addEventListener('drop', async (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--border-medium)';
            uploadZone.style.background = 'transparent';

            const file = e.dataTransfer.files[0];
            if (file) await this.handleImport(file);
        });

        fileInput?.addEventListener('change', async (e) => {
            if (e.target.files[0]) await this.handleImport(e.target.files[0]);
        });

        // Datos demo
        document.getElementById('btn-create-demo')?.addEventListener('click', async () => {
            const company = CompanyService.getCurrent();
            if (!company) {
                Toast.warning('Seleccione una empresa primero');
                return;
            }
            const loading = Toast.loading('Creando datos básicos...');
            try {
                await CompanyService.createDemoData();
                loading.success('Datos de demostración creados');
                App.navigate('admin', 'import-export');
            } catch (err) {
                loading.error(err.message);
            }
        });

        // Cargar caso de estudio comercial
        document.getElementById('btn-load-case-study')?.addEventListener('click', async () => {
            const loading = Toast.loading('Cargando caso de estudio comercial...');
            try {
                const response = await fetch('./data/caso_estudio_comercial.json');
                if (!response.ok) throw new Error('No se pudo cargar el archivo');
                const data = await response.json();
                await CompanyService.importData(data);
                loading.success('Caso de estudio comercial cargado exitosamente');
                App.navigate('dashboard');
            } catch (err) {
                // Verificar si es un error de CORS (típico en file://)
                if (window.location.protocol === 'file:') {
                    loading.error('Error CORS: Use un servidor web local');
                    Modal.alert({
                        title: 'Restricción de Seguridad del Navegador',
                        message: `<p>Para cargar archivos JSON, necesita ejecutar el sistema desde un servidor web local.</p>
                        <p style="margin-top: var(--space-3);"><strong>Opciones:</strong></p>
                        <ul style="margin: var(--space-2) 0; padding-left: var(--space-4);">
                            <li>Instale la extensión <strong>Live Server</strong> en VS Code</li>
                            <li>O ejecute: <code>npx http-server -o</code></li>
                            <li>O use la importación manual arrastrando el archivo JSON</li>
                        </ul>
                        <p style="margin-top: var(--space-3); color: var(--text-tertiary); font-size: var(--font-size-sm);">
                            El archivo está en: <code>data/caso_estudio_comercial.json</code>
                        </p>`
                    });
                } else {
                    loading.error('Error: ' + err.message);
                }
            }
        });

        // Cargar caso de sistema dual (Centralizador)
        document.getElementById('btn-load-dual-case')?.addEventListener('click', async () => {
            const loading = Toast.loading('Cargando caso de sistema dual...');
            try {
                const response = await fetch('./data/caso_prueba_sistema_dual.json');
                if (!response.ok) throw new Error('No se pudo cargar el archivo');
                const data = await response.json();
                const result = await CompanyService.importData(data);
                loading.success(`Caso dual cargado: ${result.success} registros importados.`);
                App.navigate('dashboard');
            } catch (err) {
                loading.error('Error: ' + err.message);
            }
        });

        // Cargar caso de estudio servicios
        document.getElementById('btn-load-service-case')?.addEventListener('click', async () => {
            const loading = Toast.loading('Cargando caso de estudio servicios...');
            try {
                const response = await fetch('./data/caso_estudio_servicios.json');
                if (!response.ok) throw new Error('No se pudo cargar el archivo');
                const data = await response.json();
                await CompanyService.importData(data);
                loading.success('Caso de estudio servicios cargado exitosamente');
                App.navigate('dashboard');
            } catch (err) {
                // Verificar si es un error de CORS (típico en file://)
                if (window.location.protocol === 'file:') {
                    loading.error('Error CORS: Use un servidor web local');
                    Modal.alert({
                        title: 'Restricción de Seguridad del Navegador',
                        message: `<p>Para cargar archivos JSON, necesita ejecutar el sistema desde un servidor web local.</p>
                        <p style="margin-top: var(--space-3);"><strong>Opciones:</strong></p>
                        <ul style="margin: var(--space-2) 0; padding-left: var(--space-4);">
                            <li>Instale la extensión <strong>Live Server</strong> en VS Code</li>
                            <li>O ejecute: <code>npx http-server -o</code></li>
                            <li>O use la importación manual arrastrando el archivo JSON</li>
                        </ul>
                        <p style="margin-top: var(--space-3); color: var(--text-tertiary); font-size: var(--font-size-sm);">
                            El archivo está en: <code>data/caso_estudio_servicios.json</code>
                        </p>`
                    });
                } else {
                    loading.error('Error: ' + err.message);
                }
            }
        });

        // Limpiar datos
        document.getElementById('btn-clear-data')?.addEventListener('click', async () => {
            const company = CompanyService.getCurrent();
            if (!company) {
                Toast.warning('Seleccione una empresa primero');
                return;
            }

            const confirm = await Modal.confirm({
                title: '¿Está seguro?',
                message: `Esta acción eliminará TODOS los datos de "${company.name}" (cuentas, asientos, proveedores, clientes, productos, empleados, etc.). La empresa en sí se mantendrá pero vacía. Esta acción NO se puede deshacer.`,
                confirmText: 'Sí, eliminar todo',
                confirmClass: 'btn-danger'
            });

            if (confirm) {
                const loading = Toast.loading('Limpiando datos...');
                try {
                    // Stores que tienen índice companyId
                    const storesWithCompanyId = [
                        'accounts', 'journalEntries', 'suppliers', 'customers', 'products',
                        'purchaseOrders', 'supplierInvoices', 'salesOrders', 'customerInvoices',
                        'stockMovements', 'bankAccounts', 'payments', 'costCenters',
                        'internalOrders', 'employees', 'payroll', 'sequences', 'settings', 'auditLog'
                    ];

                    let deleted = 0;

                    for (const storeName of storesWithCompanyId) {
                        try {
                            const records = await DB.getByIndex(storeName, 'companyId', company.id);
                            for (const record of records) {
                                await DB.delete(storeName, record.id);
                                deleted++;

                                // Si es un asiento, también eliminar sus líneas
                                if (storeName === 'journalEntries') {
                                    const lines = await DB.getByIndex('journalLines', 'entryId', record.id);
                                    for (const line of lines) {
                                        await DB.delete('journalLines', line.id);
                                        deleted++;
                                    }
                                }
                            }
                        } catch (storeErr) {
                            console.warn(`Error limpiando ${storeName}:`, storeErr.message);
                        }
                    }

                    loading.success(`Limpieza completada: ${deleted} registros eliminados`);

                    // Recargar la vista actual
                    App.navigate('admin', 'import-export');
                } catch (err) {
                    console.error('Error limpiando datos:', err);
                    loading.error('Error: ' + err.message);
                }
            }
        });
    },

    async handleImport(file) {
        const loading = Toast.loading('Importando datos...');

        try {
            let data;
            if (file.name.endsWith('.json')) {
                data = await ExportService.fromJSON(file);
            } else if (file.name.endsWith('.xlsx')) {
                data = await ExportService.fromExcel(file);
            } else {
                throw new Error('Formato de archivo no soportado');
            }

            const result = await CompanyService.importData(data);
            loading.success(`Importación completada: ${result.success} registros`);

            if (result.errors.length > 0) {
                Toast.warning(`${result.errors.length} errores durante la importación`);
            }
        } catch (err) {
            loading.error('Error: ' + err.message);
        }
    },

    initSettings() {
        document.getElementById('company-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            try {
                await CompanyService.update(CompanyService.getCurrent().id, data);
                Toast.success('Empresa actualizada');
            } catch (err) {
                Toast.error(err.message);
            }
        });

        document.getElementById('settings-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);

            // Datos de settings regulares
            const settingsData = {
                fiscalYear: parseInt(formData.get('fiscalYear')),
                taxRate: parseFloat(formData.get('taxRate')),
                incomeTaxRate: parseFloat(formData.get('incomeTaxRate')),
                inventoryMethod: formData.get('inventoryMethod'),
                decimalPlaces: parseInt(formData.get('decimalPlaces'))
            };

            // El accountingSystem es un campo de la empresa, no de settings
            const accountingSystem = formData.get('accountingSystem');

            try {
                // Guardar settings
                await CompanyService.updateSettings(settingsData);

                // Guardar accountingSystem en la empresa directamente
                const company = CompanyService.getCurrent();
                if (company && accountingSystem) {
                    company.accountingSystem = accountingSystem;
                    await CompanyService.update(company.id, { accountingSystem });

                    // Actualizar también en el objeto actual en memoria
                    CompanyService.currentCompany = company;

                    console.log(`✅ Sistema de contabilización cambiado a: ${accountingSystem}`);
                }

                Toast.success('Configuración guardada correctamente');

                // Mostrar mensaje adicional sobre el cambio de sistema
                if (accountingSystem === 'centralizer') {
                    Toast.info('📗 Sistema Centralizador activo. Las transacciones irán a Libros Auxiliares.');
                } else {
                    Toast.info('📘 Sistema Jornalizador activo. Las transacciones irán directo al Libro Diario.');
                }
            } catch (err) {
                Toast.error(err.message);
            }
        });

        // Limpiar datos de empresa
        document.getElementById('btn-clear-company-data')?.addEventListener('click', async () => {
            const company = CompanyService.getCurrent();
            if (!company) return;

            const confirm = await Modal.confirm({
                title: 'Limpiar Datos',
                message: `¿Está seguro de eliminar TODOS los datos de "${company.name}"? La empresa se mantendrá pero vacía. Esta acción NO se puede deshacer.`,
                confirmText: 'Sí, limpiar todo',
                confirmClass: 'btn-danger'
            });

            if (confirm) {
                const loading = Toast.loading('Limpiando datos...');
                try {
                    // Eliminar todos los registros de la empresa usando getAll y filtrado manual
                    const stores = ['accounts', 'journalEntries', 'journalLines', 'suppliers', 'customers',
                        'products', 'purchaseOrders', 'supplierInvoices', 'salesOrders', 'customerInvoices',
                        'stockMovements', 'bankAccounts', 'payments', 'costCenters', 'employees',
                        'payroll', 'sequences', 'settings', 'auditLog'];

                    let deleted = 0;

                    for (const storeName of stores) {
                        try {
                            const allRecords = await DB.getAll(storeName);
                            const companyRecords = allRecords.filter(r => r.companyId === company.id);
                            for (const record of companyRecords) {
                                await DB.delete(storeName, record.id);
                                deleted++;
                            }
                        } catch (e) {
                            console.warn(`Error en ${storeName}:`, e.message);
                        }
                    }

                    loading.success(`Limpieza completada: ${deleted} registros eliminados`);
                    App.navigate('admin', 'configuracion');
                } catch (err) {
                    loading.error('Error: ' + err.message);
                }
            }
        });

        // Eliminar empresa completamente
        document.getElementById('btn-delete-company')?.addEventListener('click', async () => {
            const company = CompanyService.getCurrent();
            if (!company) return;

            const confirm = await Modal.confirm({
                title: 'Eliminar Empresa',
                message: `¿Está ABSOLUTAMENTE seguro de eliminar "${company.name}" y TODOS sus datos? Esta acción es PERMANENTE y NO se puede deshacer.`,
                confirmText: 'Sí, eliminar permanentemente',
                confirmClass: 'btn-danger'
            });

            if (confirm) {
                const loading = Toast.loading('Eliminando empresa...');
                try {
                    await CompanyService.delete(company.id);
                    loading.success('Empresa eliminada');
                    App.navigate('admin', 'empresas');
                } catch (err) {
                    loading.error('Error: ' + err.message);
                }
            }
        });
    }
};

// Estilos adicionales
const adminStyles = document.createElement('style');
adminStyles.textContent = `
    .active-company { border: 2px solid var(--primary-500); background: var(--primary-50); }
    .btn-purple { background: #7c3aed; color: white; border: none; }
    .btn-purple:hover { background: #6d28d9; }
`;
document.head.appendChild(adminStyles);

window.AdminModule = AdminModule;
