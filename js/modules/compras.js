/**
 * EduERP - Compras Module
 * Módulo de Gestión de Compras (MM)
 */

const ComprasModule = {
    currentView: 'proveedores',

    async render(view = 'proveedores') {
        this.currentView = view;

        switch (view) {
            case 'proveedores': return await this.renderSuppliers();
            case 'ordenes-compra': return await this.renderPurchaseOrders();
            case 'facturas-proveedor': return await this.renderSupplierInvoices();
            default: return '<p>Vista no encontrada</p>';
        }
    },

    async renderSuppliers() {
        return `
            <div class="page-header">
                <h1 class="page-title">Proveedores</h1>
                <p class="page-subtitle">Gestión de proveedores y condiciones de compra</p>
            </div>
            <div class="toolbar">
                <div class="toolbar-left">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" class="form-control" placeholder="Buscar proveedor..." id="search-suppliers">
                    </div>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-primary" id="btn-new-supplier">
                        <i class="fas fa-plus"></i> Nuevo Proveedor
                    </button>
                </div>
            </div>
            <div id="suppliers-table"></div>
        `;
    },

    async renderPurchaseOrders() {
        return `
            <div class="page-header">
                <h1 class="page-title">Órdenes de Compra</h1>
                <p class="page-subtitle">Gestión de pedidos a proveedores</p>
            </div>
            <div class="toolbar">
                <div class="toolbar-left">
                    <input type="date" class="form-control" id="filter-date-from">
                    <input type="date" class="form-control" id="filter-date-to">
                    <select class="form-control" id="filter-status">
                        <option value="">Todos</option>
                        <option value="draft">Borrador</option>
                        <option value="approved">Aprobada</option>
                        <option value="received">Recibida</option>
                        <option value="cancelled">Anulada</option>
                    </select>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-primary" id="btn-new-order">
                        <i class="fas fa-plus"></i> Nueva Orden
                    </button>
                </div>
            </div>
            <div id="orders-table"></div>
        `;
    },

    async renderSupplierInvoices() {
        return `
            <div class="page-header">
                <h1 class="page-title">Facturas de Proveedor</h1>
                <p class="page-subtitle">Registro y control de facturas recibidas</p>
            </div>
            <div class="toolbar">
                <div class="toolbar-left">
                    <input type="date" class="form-control" id="filter-date-from">
                    <input type="date" class="form-control" id="filter-date-to">
                    <select class="form-control" id="filter-status">
                        <option value="">Todos</option>
                        <option value="pending">Pendiente</option>
                        <option value="posted">Contabilizada</option>
                        <option value="paid">Pagada</option>
                        <option value="cancelled">Anulada</option>
                    </select>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-primary" id="btn-new-invoice">
                        <i class="fas fa-plus"></i> Nueva Factura
                    </button>
                </div>
            </div>
            <div id="invoices-table"></div>
        `;
    },

    async init(view) {
        const company = CompanyService.getCurrent();
        if (!company) return;

        switch (view) {
            case 'proveedores':
                await this.initSuppliers();
                break;
            case 'ordenes-compra':
                await this.initPurchaseOrders();
                break;
            case 'facturas-proveedor':
                await this.initSupplierInvoices();
                break;
        }
    },

    async initSuppliers() {
        const company = CompanyService.getCurrent();
        const suppliers = await DB.getByIndex('suppliers', 'companyId', company.id);

        DataTable.create('suppliers-table', {
            columns: [
                { key: 'rut', label: 'RUT' },
                { key: 'name', label: 'Nombre' },
                { key: 'contact', label: 'Contacto' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Teléfono' },
                { key: 'balance', label: 'Saldo', format: 'currency', class: 'text-right' }
            ],
            data: suppliers,
            actions: [
                { name: 'edit', label: 'Editar', icon: 'fas fa-edit', handler: (row) => this.showSupplierModal(row.id) },
                { name: 'delete', label: 'Eliminar', icon: 'fas fa-trash', handler: (row) => this.deleteSupplier(row.id) }
            ],
            emptyMessage: 'No hay proveedores registrados'
        });

        document.getElementById('btn-new-supplier')?.addEventListener('click', () => this.showSupplierModal());
    },

    async showSupplierModal(supplierId = null) {
        const isEdit = !!supplierId;
        let data = {};

        if (isEdit) {
            data = await DB.get('suppliers', supplierId);
        }

        await Modal.form({
            title: isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor',
            fields: [
                { name: 'rut', label: 'RUT', required: true, placeholder: '76.123.456-7', default: data.rut },
                { name: 'name', label: 'Razón Social', required: true, placeholder: 'Nombre empresa', default: data.name },
                { name: 'contact', label: 'Contacto', placeholder: 'Nombre contacto', default: data.contact },
                { name: 'email', label: 'Email', type: 'email', placeholder: 'email@empresa.cl', default: data.email },
                { name: 'phone', label: 'Teléfono', placeholder: '+56 9 1234 5678', default: data.phone },
                { name: 'address', label: 'Dirección', placeholder: 'Dirección comercial', default: data.address }
            ],
            validate: (formData) => {
                if (!formData.name) return 'El nombre es requerido';
                if (!Helpers.validateRUT(formData.rut)) return 'RUT inválido';
                return true;
            },
            onSubmit: async (formData) => {
                const company = CompanyService.getCurrent();
                formData.rut = Helpers.formatRUT(formData.rut);

                if (isEdit) {
                    await DB.update('suppliers', { ...data, ...formData });
                    Toast.success('Proveedor actualizado');
                } else {
                    await DB.add('suppliers', { companyId: company.id, ...formData, status: 'active', balance: 0 });
                    Toast.success('Proveedor creado');
                }
                App.navigate('compras', 'proveedores');
            }
        });
    },

    async deleteSupplier(id) {
        const confirm = await Modal.confirm({
            title: 'Eliminar Proveedor',
            message: '¿Está seguro de eliminar este proveedor?',
            confirmText: 'Eliminar',
            confirmClass: 'btn-danger'
        });

        if (confirm) {
            await DB.delete('suppliers', id);
            Toast.success('Proveedor eliminado');
            App.navigate('compras', 'proveedores');
        }
    },

    async initPurchaseOrders() {
        const company = CompanyService.getCurrent();
        const allOrders = await DB.getByIndex('purchaseOrders', 'companyId', company.id);

        // Cargar nombres de proveedores para cada orden
        for (let order of allOrders) {
            const supplier = await DB.get('suppliers', order.supplierId);
            order.supplierName = supplier?.name || 'Proveedor desconocido';
        }

        // Función para aplicar filtros
        const applyFilters = () => {
            const dateFrom = document.getElementById('filter-date-from')?.value;
            const dateTo = document.getElementById('filter-date-to')?.value;
            const status = document.getElementById('filter-status')?.value;

            let filteredOrders = allOrders;

            if (dateFrom) {
                filteredOrders = filteredOrders.filter(o => o.date >= dateFrom);
            }
            if (dateTo) {
                filteredOrders = filteredOrders.filter(o => o.date <= dateTo);
            }
            if (status) {
                filteredOrders = filteredOrders.filter(o => o.status === status);
            }

            DataTable.create('orders-table', {
                columns: [
                    { key: 'number', label: 'Número' },
                    { key: 'date', label: 'Fecha', format: 'date' },
                    { key: 'supplierName', label: 'Proveedor' },
                    { key: 'total', label: 'Total', format: 'currency', class: 'text-right' },
                    { key: 'status', label: 'Estado', format: 'status' }
                ],
                data: filteredOrders,
                actions: [
                    { name: 'view', label: 'Ver', icon: 'fas fa-eye', handler: (row) => this.showOrderDetail(row) },
                    { name: 'edit', label: 'Editar', icon: 'fas fa-edit', handler: (row) => this.editPurchaseOrder(row) },
                    { name: 'approve', label: 'Aprobar', icon: 'fas fa-check', handler: (row) => this.approveOrder(row) },
                    { name: 'receive', label: 'Recibir', icon: 'fas fa-truck', handler: (row) => this.receiveOrder(row) },
                    { name: 'cancel', label: 'Anular', icon: 'fas fa-ban', handler: (row) => this.cancelPurchaseOrder(row) }
                ],
                emptyMessage: 'No hay órdenes de compra'
            });
        };

        // Renderizar tabla inicial
        applyFilters();

        // Agregar event listeners a los filtros
        document.getElementById('filter-date-from')?.addEventListener('change', applyFilters);
        document.getElementById('filter-date-to')?.addEventListener('change', applyFilters);
        document.getElementById('filter-status')?.addEventListener('change', applyFilters);

        document.getElementById('btn-new-order')?.addEventListener('click', () => {
            this.showPurchaseOrderModal();
        });
    },

    async showPurchaseOrderModal() {
        const company = CompanyService.getCurrent();
        const suppliers = await DB.getByIndex('suppliers', 'companyId', company.id);
        const products = await DB.getByIndex('products', 'companyId', company.id);

        if (suppliers.length === 0) {
            Toast.warning('Primero debe crear al menos un proveedor');
            return;
        }

        Modal.open({
            title: 'Nueva Orden de Compra',
            size: 'large',
            content: `
                <form id="purchase-order-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Proveedor <span class="text-danger">*</span></label>
                            <select class="form-control" name="supplierId" required>
                                <option value="">Seleccione proveedor...</option>
                                ${suppliers.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Fecha</label>
                            <input type="date" class="form-control" name="date" value="${Helpers.getCurrentDate()}" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Observaciones</label>
                        <textarea class="form-control" name="notes" rows="2" placeholder="Observaciones opcionales"></textarea>
                    </div>
                    
                    <h4 style="margin: var(--space-4) 0 var(--space-2);">Productos</h4>
                    <div class="table-container">
                        <table class="data-table" id="order-lines-table">
                            <thead>
                                <tr>
                                    <th style="width: 40%;">Producto</th>
                                    <th style="width: 15%;">Cantidad</th>
                                    <th style="width: 15%;">Precio Unit.</th>
                                    <th style="width: 20%;">Subtotal</th>
                                    <th style="width: 10%;"></th>
                                </tr>
                            </thead>
                            <tbody id="order-lines">
                                <tr class="order-line" data-idx="0">
                                    <td>
                                        <select class="form-control product-select" name="productId" required>
                                            <option value="">Seleccione...</option>
                                            ${products.map(p => `<option value="${p.id}" data-cost="${p.cost}">${p.code} - ${p.name}</option>`).join('')}
                                        </select>
                                    </td>
                                    <td><input type="number" class="form-control quantity-input" name="quantity" value="1" min="1" required></td>
                                    <td><input type="number" class="form-control price-input" name="price" value="0" min="0" required></td>
                                    <td class="text-right subtotal">$0</td>
                                    <td><button type="button" class="btn btn-icon btn-ghost remove-line"><i class="fas fa-times"></i></button></td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="3" class="text-right"><strong>TOTAL:</strong></td>
                                    <td class="text-right"><strong id="order-total">$0</strong></td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <button type="button" class="btn btn-outline" id="btn-add-line" style="margin-top: var(--space-2);">
                        <i class="fas fa-plus"></i> Agregar Producto
                    </button>
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-primary" id="btn-save-order"><i class="fas fa-save"></i> Guardar Orden</button>
            `
        });

        // Event listeners
        this.initOrderModalEvents(products);
    },

    initOrderModalEvents(products) {
        let lineIdx = 1;

        // Agregar línea
        document.getElementById('btn-add-line')?.addEventListener('click', () => {
            const tbody = document.getElementById('order-lines');
            const newRow = document.createElement('tr');
            newRow.className = 'order-line';
            newRow.dataset.idx = lineIdx++;
            newRow.innerHTML = `
                <td>
                    <select class="form-control product-select" name="productId" required>
                        <option value="">Seleccione...</option>
                        ${products.map(p => `<option value="${p.id}" data-cost="${p.cost}">${p.code} - ${p.name}</option>`).join('')}
                    </select>
                </td>
                <td><input type="number" class="form-control quantity-input" name="quantity" value="1" min="1" required></td>
                <td><input type="number" class="form-control price-input" name="price" value="0" min="0" required></td>
                <td class="text-right subtotal">$0</td>
                <td><button type="button" class="btn btn-icon btn-ghost remove-line"><i class="fas fa-times"></i></button></td>
            `;
            tbody.appendChild(newRow);
            this.bindOrderLineEvents();
        });

        this.bindOrderLineEvents();

        // Guardar orden
        document.getElementById('btn-save-order')?.addEventListener('click', async () => {
            await this.savePurchaseOrder();
        });
    },

    bindOrderLineEvents() {
        const self = this;

        // Cambio de producto
        document.querySelectorAll('.product-select').forEach(select => {
            // Remover listener anterior si existe
            select.removeEventListener('change', select._changeHandler);
            select._changeHandler = function () {
                const option = select.selectedOptions[0];
                const cost = parseFloat(option?.dataset.cost || 0);
                const row = select.closest('tr');
                row.querySelector('.price-input').value = cost;
                self.updateOrderTotals();
            };
            select.addEventListener('change', select._changeHandler);
        });

        // Cambio de cantidad o precio
        document.querySelectorAll('.quantity-input, .price-input').forEach(input => {
            // Remover listener anterior si existe
            input.removeEventListener('input', input._inputHandler);
            input._inputHandler = function () {
                self.updateOrderTotals();
            };
            input.addEventListener('input', input._inputHandler);
        });

        // Eliminar línea
        document.querySelectorAll('.remove-line').forEach(btn => {
            // Remover listener anterior si existe
            btn.removeEventListener('click', btn._clickHandler);
            btn._clickHandler = function () {
                const lines = document.querySelectorAll('.order-line');
                if (lines.length > 1) {
                    btn.closest('tr').remove();
                    self.updateOrderTotals();
                } else {
                    Toast.warning('Debe haber al menos una línea');
                }
            };
            btn.addEventListener('click', btn._clickHandler);
        });

        // Actualizar totales inmediatamente
        this.updateOrderTotals();
    },

    updateOrderTotals() {
        let total = 0;
        document.querySelectorAll('.order-line').forEach(row => {
            const qty = parseFloat(row.querySelector('.quantity-input')?.value) || 0;
            const price = parseFloat(row.querySelector('.price-input')?.value) || 0;
            const subtotal = qty * price;
            const subtotalEl = row.querySelector('.subtotal');
            if (subtotalEl) subtotalEl.textContent = Formatters.currency(subtotal);
            total += subtotal;
        });
        const totalEl = document.getElementById('order-total');
        if (totalEl) totalEl.textContent = Formatters.currency(total);
    },

    async savePurchaseOrder() {
        const form = document.getElementById('purchase-order-form');
        const formData = new FormData(form);

        const supplierId = formData.get('supplierId');
        if (!supplierId) {
            Toast.error('Seleccione un proveedor');
            return;
        }

        const lines = [];
        let total = 0;
        document.querySelectorAll('.order-line').forEach(row => {
            const productId = row.querySelector('.product-select').value;
            const quantity = parseFloat(row.querySelector('.quantity-input').value) || 0;
            const price = parseFloat(row.querySelector('.price-input').value) || 0;

            if (productId && quantity > 0) {
                const subtotal = quantity * price;
                lines.push({ productId, quantity, price, subtotal });
                total += subtotal;
            }
        });

        if (lines.length === 0) {
            Toast.error('Agregue al menos un producto');
            return;
        }

        const company = CompanyService.getCurrent();
        const orderNumber = await this.getNextOrderNumber();

        const order = {
            id: Helpers.generateId(),
            companyId: company.id,
            number: orderNumber,
            supplierId,
            date: formData.get('date'),
            notes: formData.get('notes'),
            status: 'draft',
            total,
            createdAt: new Date().toISOString()
        };

        try {
            await DB.add('purchaseOrders', order);

            // Guardar líneas
            for (const line of lines) {
                await DB.add('purchaseOrderLines', {
                    id: Helpers.generateId(),
                    orderId: order.id,
                    ...line
                });
            }

            Toast.success('Orden de compra creada');
            Modal.close();
            App.navigate('compras', 'ordenes-compra');
        } catch (err) {
            Toast.error('Error: ' + err.message);
        }
    },

    async getNextOrderNumber() {
        const company = CompanyService.getCurrent();
        const orders = await DB.getByIndex('purchaseOrders', 'companyId', company.id);
        const year = new Date().getFullYear();
        const prefix = `OC-${year}-`;
        const existingNumbers = orders
            .filter(o => {
                const numStr = String(o.number || '');
                return numStr.startsWith(prefix);
            })
            .map(o => parseInt(String(o.number || '').replace(prefix, '')) || 0);
        const nextNum = Math.max(0, ...existingNumbers) + 1;
        return `${prefix}${String(nextNum).padStart(4, '0')}`;
    },

    async showOrderDetail(order) {
        const supplier = await DB.get('suppliers', order.supplierId);
        const lines = await DB.getByIndex('purchaseOrderLines', 'orderId', order.id);

        // Cargar nombres de productos
        for (let line of lines) {
            const product = await DB.get('products', line.productId);
            line.productName = product?.name || 'Producto desconocido';
            line.productCode = product?.code || '';
        }

        const statusLabels = {
            draft: '<span class="badge badge-warning">Borrador</span>',
            approved: '<span class="badge badge-info">Aprobada</span>',
            received: '<span class="badge badge-success">Recibida</span>',
            cancelled: '<span class="badge badge-error">Cancelada</span>'
        };

        Modal.open({
            title: `Orden de Compra ${order.number}`,
            size: 'large',
            content: `
                <div style="margin-bottom: var(--space-4);">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4);">
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-tertiary);">Proveedor</label>
                            <strong>${supplier?.name || 'N/A'}</strong>
                        </div>
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-tertiary);">Fecha</label>
                            <strong>${Formatters.date(order.date)}</strong>
                        </div>
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-tertiary);">Estado</label>
                            ${statusLabels[order.status] || order.status}
                        </div>
                    </div>
                </div>
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Producto</th>
                                <th class="text-right">Cantidad</th>
                                <th class="text-right">Precio</th>
                                <th class="text-right">Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lines.map(l => `
                                <tr>
                                    <td><code>${l.productCode}</code></td>
                                    <td>${l.productName}</td>
                                    <td class="text-right">${l.quantity}</td>
                                    <td class="text-right">${Formatters.currency(l.price)}</td>
                                    <td class="text-right">${Formatters.currency(l.subtotal)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr style="font-weight: 600;">
                                <td colspan="4" class="text-right">TOTAL</td>
                                <td class="text-right">${Formatters.currency(order.total)}</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            `,
            footer: `<button class="btn btn-secondary" onclick="Modal.close()">Cerrar</button>`
        });
    },

    /**
     * Editar una orden de compra (solo si está en borrador)
     */
    async editPurchaseOrder(order) {
        // Solo se pueden editar órdenes en borrador
        if (order.status !== 'draft') {
            const statusName = {
                approved: 'aprobada',
                received: 'recibida',
                cancelled: 'anulada'
            }[order.status] || order.status;

            Toast.warning(`No se puede editar una orden ${statusName}. Solo las órdenes en borrador son editables.`);
            return;
        }

        const company = CompanyService.getCurrent();
        const suppliers = await DB.getByIndex('suppliers', 'companyId', company.id);
        const products = await DB.getByIndex('products', 'companyId', company.id);
        const existingLines = await DB.getByIndex('purchaseOrderLines', 'orderId', order.id);

        // Construir HTML de líneas existentes
        let linesHtml = '';
        for (let i = 0; i < existingLines.length; i++) {
            const line = existingLines[i];
            const product = products.find(p => p.id === line.productId);
            // Usar price en lugar de cost para compatibilidad con funciones existentes
            const linePrice = line.cost || line.price || 0;
            linesHtml += `
                <tr class="order-line" data-idx="${i}">
                    <td>
                        <select class="form-control product-select" name="productId" required>
                            <option value="">Seleccione...</option>
                            ${products.map(p => `<option value="${p.id}" data-cost="${p.cost}" ${p.id === line.productId ? 'selected' : ''}>${p.code} - ${p.name}</option>`).join('')}
                        </select>
                    </td>
                    <td><input type="number" class="form-control quantity-input" name="quantity" value="${line.quantity}" min="1" required></td>
                    <td><input type="number" class="form-control price-input" name="price" value="${linePrice}" min="0" required></td>
                    <td class="text-right subtotal">${Formatters.currency(line.subtotal)}</td>
                    <td><button type="button" class="btn btn-icon btn-ghost remove-line"><i class="fas fa-times"></i></button></td>
                </tr>
            `;
        }

        Modal.open({
            title: `Editar Orden ${order.number}`,
            size: 'large',
            content: `
                <form id="edit-order-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Proveedor <span class="text-error">*</span></label>
                            <select class="form-control" name="supplierId" required>
                                <option value="">Seleccione...</option>
                                ${suppliers.map(s => `<option value="${s.id}" ${s.id === order.supplierId ? 'selected' : ''}>${s.rut} - ${s.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Fecha</label>
                            <input type="date" class="form-control" name="date" value="${order.date}" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Observaciones</label>
                        <textarea class="form-control" name="notes" rows="2">${order.notes || ''}</textarea>
                    </div>
                    
                    <h4 style="margin: var(--space-4) 0 var(--space-2);">Productos</h4>
                    <div class="table-container">
                        <table class="data-table" id="order-lines-table">
                            <thead>
                                <tr>
                                    <th style="width: 40%;">Producto</th>
                                    <th style="width: 15%;">Cantidad</th>
                                    <th style="width: 20%;">Costo Unit.</th>
                                    <th style="width: 15%;">Subtotal</th>
                                    <th style="width: 10%;"></th>
                                </tr>
                            </thead>
                            <tbody id="order-lines">
                                ${linesHtml}
                            </tbody>
                        </table>
                    </div>
                    <button type="button" class="btn btn-outline btn-sm" id="btn-add-line" style="margin-top: var(--space-2);">
                        <i class="fas fa-plus"></i> Agregar línea
                    </button>
                    
                    <div class="order-totals" style="margin-top: var(--space-4); text-align: right;">
                        <div style="font-size: 1.2em;">Total: <strong id="order-total">$0</strong></div>
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-primary" id="btn-save-edit-order">Guardar Cambios</button>
            `
        });

        // Inicializar eventos usando las funciones existentes
        this.bindOrderLineEvents();
        this.updateOrderTotals();

        // Handler para agregar línea
        document.getElementById('btn-add-line')?.addEventListener('click', () => {
            const tbody = document.getElementById('order-lines');
            const idx = tbody.querySelectorAll('tr').length;
            const newRow = document.createElement('tr');
            newRow.className = 'order-line';
            newRow.dataset.idx = idx;
            newRow.innerHTML = `
                <td>
                    <select class="form-control product-select" name="productId" required>
                        <option value="">Seleccione...</option>
                        ${products.map(p => `<option value="${p.id}" data-cost="${p.cost}">${p.code} - ${p.name}</option>`).join('')}
                    </select>
                </td>
                <td><input type="number" class="form-control quantity-input" name="quantity" value="1" min="1" required></td>
                <td><input type="number" class="form-control price-input" name="price" value="0" min="0" required></td>
                <td class="text-right subtotal">$0</td>
                <td><button type="button" class="btn btn-icon btn-ghost remove-line"><i class="fas fa-times"></i></button></td>
            `;
            tbody.appendChild(newRow);
            this.bindOrderLineEvents();
        });

        // Handler para guardar cambios
        document.getElementById('btn-save-edit-order')?.addEventListener('click', async () => {
            await this.saveEditedPurchaseOrder(order);
        });
    },

    /**
     * Guardar cambios en una orden de compra editada
     */
    async saveEditedPurchaseOrder(originalOrder) {
        const form = document.getElementById('edit-order-form');
        const formData = new FormData(form);

        const supplierId = formData.get('supplierId');
        const date = formData.get('date');
        const notes = formData.get('notes');

        if (!supplierId) {
            Toast.error('Debe seleccionar un proveedor');
            return;
        }

        // Recopilar líneas
        const lines = [];
        document.querySelectorAll('#order-lines .order-line').forEach(row => {
            const productId = row.querySelector('.product-select')?.value;
            const quantity = parseFloat(row.querySelector('.quantity-input')?.value) || 0;
            const price = parseFloat(row.querySelector('.price-input')?.value) || 0;

            if (productId && quantity > 0) {
                lines.push({
                    productId,
                    quantity,
                    price,
                    cost: price, // Guardar también como cost para compatibilidad
                    subtotal: quantity * price
                });
            }
        });

        if (lines.length === 0) {
            Toast.error('Debe agregar al menos un producto');
            return;
        }

        try {
            const company = CompanyService.getCurrent();

            // Calcular totales
            const subtotal = lines.reduce((sum, l) => sum + l.subtotal, 0);
            const iva = Math.round(subtotal * 0.19);
            const total = subtotal + iva;

            // Actualizar la orden
            await DB.update('purchaseOrders', {
                ...originalOrder,
                supplierId,
                date,
                notes,
                subtotal,
                iva,
                total,
                updatedAt: new Date().toISOString()
            });

            // Eliminar líneas anteriores
            const oldLines = await DB.getByIndex('purchaseOrderLines', 'orderId', originalOrder.id);
            for (const oldLine of oldLines) {
                await DB.delete('purchaseOrderLines', oldLine.id);
            }

            // Crear nuevas líneas
            for (const line of lines) {
                await DB.add('purchaseOrderLines', {
                    id: Helpers.generateId(),
                    orderId: originalOrder.id,
                    companyId: company.id,
                    ...line
                });
            }

            Toast.success('Orden actualizada');
            Modal.close();
            App.navigate('compras', 'ordenes');
        } catch (err) {
            Toast.error('Error: ' + err.message);
        }
    },

    async approveOrder(order) {
        if (order.status !== 'draft') {
            Toast.warning('Solo se pueden aprobar órdenes en borrador');
            return;
        }

        const confirm = await Modal.confirm({
            title: 'Aprobar Orden',
            message: `¿Aprobar la orden ${order.number}?`,
            confirmText: 'Aprobar'
        });

        if (confirm) {
            await DB.update('purchaseOrders', { ...order, status: 'approved' });
            Toast.success('Orden aprobada');
            App.navigate('compras', 'ordenes-compra');
        }
    },

    async receiveOrder(order) {
        if (order.status !== 'approved' && order.status !== 'partial') {
            Toast.warning('Solo se pueden recibir órdenes aprobadas o parcialmente recibidas');
            return;
        }

        const company = CompanyService.getCurrent();
        const lines = await DB.getByIndex('purchaseOrderLines', 'orderId', order.id);
        const supplier = await DB.get('suppliers', order.supplierId);

        let pendingLinesCount = 0;
        let htmlLines = '';

        for (const line of lines) {
            const pending = line.quantity - (line.received || 0);
            if (pending <= 0) continue;

            pendingLinesCount++;
            const product = await DB.get('products', line.productId);
            const prodName = product ? `${product.code} - ${product.name}` : `Producto ${line.productId}`;

            htmlLines += `
                <div class="line-item" data-line-id="${line.id}" data-product-id="${line.productId}" data-pending="${pending}" data-price="${line.price}" style="padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 1rem;">
                    <div style="font-weight: 500; margin-bottom: 0.5rem;">${prodName} <span class="badge badge-neutral" style="float: right;">Pendiente: ${pending}</span></div>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label class="form-label">Recibir</label>
                            <input type="number" class="form-control to-receive" value="${pending}" max="${pending}" min="0" step="any">
                        </div>
                        <div class="form-group" style="flex: 2;">
                            <label class="form-label">Comentario (Diferencias)</label>
                            <input type="text" class="form-control comment" placeholder="Justificación si recibe menos de ${pending}">
                        </div>
                    </div>
                </div>
            `;
        }

        if (pendingLinesCount === 0) {
            Toast.info('Esta orden ya fue recibida en su totalidad');
            return;
        }

        Modal.open({
            title: `Recepción Guía de Despacho (OC ${order.number})`,
            size: 'large',
            content: `
                <div class="alert alert-info" style="margin-bottom: 1rem;">
                    Indique la cantidad real recibida. Las recepciones parciales mantendrán la orden abierta y permitirán su recepción futura.
                </div>
                <div id="receipt-lines-container">
                    ${htmlLines}
                </div>
                <div class="modal-footer" style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
                    <button class="btn btn-outline" onclick="Modal.close()">Cancelar</button>
                    <button class="btn btn-primary" id="btn-confirm-receipt"><i class="fas fa-check"></i> Confirmar Recepción</button>
                </div>
            `
        });

        document.getElementById('btn-confirm-receipt').addEventListener('click', async () => {
            const lineItems = Array.from(document.querySelectorAll('.line-item'));
            const receiptData = [];
            let hasErrors = false;
            let totalReceiptValueNet = 0;

            for (const item of lineItems) {
                const pending = parseFloat(item.dataset.pending);
                const toReceive = parseFloat(item.querySelector('.to-receive').value) || 0;
                const comment = item.querySelector('.comment').value.trim();
                const price = parseFloat(item.dataset.price) || 0;

                if (toReceive < 0 || toReceive > pending) {
                    Toast.error('La cantidad a recibir debe estar entre 0 y la cantidad pendiente');
                    hasErrors = true;
                    break;
                }

                if (toReceive > 0 && toReceive < pending && !comment) {
                    Toast.error('Debe ingresar un comentario para justificar la diferencia recibida');
                    hasErrors = true;
                    break;
                }

                if (toReceive > 0) {
                    receiptData.push({
                        lineId: item.dataset.lineId,
                        productId: item.dataset.productId,
                        pending,
                        toReceive,
                        comment,
                        price
                    });
                    totalReceiptValueNet += toReceive * price;
                }
            }

            if (hasErrors) return;

            if (receiptData.length === 0) {
                Toast.error('Debe recibir al menos una unidad para confirmar');
                return;
            }

            const loading = Toast.loading('Procesando recepción...');
            try {
                // La recepción solo actualiza stock e inventario físico.
                // La contabilización se hace con la factura del proveedor (un solo asiento).

                // Update inventory and order lines
                for (const data of receiptData) {
                    const product = await DB.get('products', data.productId);
                    if (product && !product.isService) {
                        const newStock = (product.stock || 0) + data.toReceive;
                        await DB.update('products', { ...product, stock: newStock });

                        await DB.add('stockMovements', {
                            id: Helpers.generateId(),
                            companyId: company.id,
                            productId: data.productId,
                            type: 'in',
                            quantity: data.toReceive,
                            unitCost: data.price,
                            date: Helpers.getCurrentDate(),
                            reference: order.number,
                            description: `Recepción ${data.toReceive < data.pending ? 'Parcial ' : ''}OC ${order.number}${data.comment ? ' - ' + data.comment : ''}`,
                            createdAt: new Date().toISOString()
                        });
                    }

                    const line = lines.find(l => l.id === data.lineId);
                    if (line) {
                        await DB.update('purchaseOrderLines', {
                            ...line,
                            received: (line.received || 0) + data.toReceive,
                            comment: data.comment || line.comment
                        });
                    }
                }

                // Update order status
                const updatedLines = await DB.getByIndex('purchaseOrderLines', 'orderId', order.id);
                const allReceived = updatedLines.every(l => (l.received || 0) >= l.quantity);

                await DB.update('purchaseOrders', {
                    ...order,
                    status: allReceived ? 'received' : 'partial',
                    receivedAt: new Date().toISOString()
                });

                loading.success('Recepción registrada y contabilizada exitosamente');
                Modal.close();
                App.navigate('compras', 'ordenes-compra');

            } catch (err) {
                loading.error('Error: ' + err.message);
                console.error(err);
            }
        });
    },

    async initSupplierInvoices() {
        const company = CompanyService.getCurrent();
        const invoices = await DB.getByIndex('supplierInvoices', 'companyId', company.id);

        // Cargar nombres de proveedores
        for (let inv of invoices) {
            const supplier = await DB.get('suppliers', inv.supplierId);
            inv.supplierName = supplier?.name || 'Proveedor desconocido';
        }

        DataTable.create('invoices-table', {
            columns: [
                { key: 'number', label: 'Número' },
                { key: 'date', label: 'Fecha', format: 'date' },
                { key: 'supplierName', label: 'Proveedor' },
                { key: 'dueDate', label: 'Vencimiento', format: 'date' },
                { key: 'total', label: 'Total', format: 'currency', class: 'text-right' },
                { key: 'status', label: 'Estado', format: 'statusInvoice' }
            ],
            data: invoices,
            actions: [
                { name: 'view', label: 'Ver', icon: 'fas fa-eye', handler: (row) => this.showInvoiceDetail(row) },
                { name: 'post', label: 'Contabilizar', icon: 'fas fa-book', handler: (row) => this.postSupplierInvoice(row) },
                { name: 'pay', label: 'Pagar', icon: 'fas fa-money-bill', handler: (row) => this.paySupplierInvoice(row) }
            ],
            emptyMessage: 'No hay facturas de proveedor'
        });

        document.getElementById('btn-new-invoice')?.addEventListener('click', () => {
            this.showInvoiceModal();
        });
    },

    async showInvoiceModal(preloadOrderId = null) {
        const company = CompanyService.getCurrent();
        const suppliers = await DB.getByIndex('suppliers', 'companyId', company.id);
        const products = await DB.getByIndex('products', 'companyId', company.id);

        if (suppliers.length === 0) {
            Toast.warning('Primero debe crear al menos un proveedor');
            return;
        }

        // OCs recibidas (parcial o total) disponibles para vincular
        const allOrders = await DB.getByIndex('purchaseOrders', 'companyId', company.id);
        const receivedOrders = allOrders.filter(o => o.status === 'received' || o.status === 'partial');

        // Pre-cargar proveedor si hay una OC
        let preloadOrder = null;
        if (preloadOrderId) {
            preloadOrder = await DB.get('purchaseOrders', preloadOrderId);
        }

        const ocOptions = receivedOrders.map(o => {
            const sup = suppliers.find(s => s.id === o.supplierId);
            return `<option value="${o.id}" ${o.id === preloadOrderId ? 'selected' : ''}>${o.number} - ${sup?.name || 'Proveedor'} (${o.status === 'partial' ? 'Parcial' : 'Recibida'})</option>`;
        }).join('');

        Modal.open({
            title: 'Registrar Factura de Proveedor',
            size: 'large',
            content: `
                <form id="supplier-invoice-form">
                    ${receivedOrders.length > 0 ? `
                    <div class="alert alert-info" style="margin-bottom: 1rem;">
                        <i class="fas fa-info-circle"></i>
                        <strong>Secuencia documental:</strong> Seleccione la Orden de Compra recibida para pre-completar los datos.
                        El asiento de esta factura será: <em>Mercaderías (D) + IVA CF (D) / Proveedores (C)</em>
                    </div>
                    <div class="form-group" style="margin-bottom: 1rem;">
                        <label class="form-label">Vincular con Orden de Compra recibida (opcional)</label>
                        <select class="form-control" id="oc-link-select">
                            <option value="">-- Sin vincular (ingreso manual) --</option>
                            ${ocOptions}
                        </select>
                    </div>
                    ` : ''}

                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Proveedor <span class="text-danger">*</span></label>
                            <select class="form-control" name="supplierId" id="invoice-supplier" required>
                                <option value="">Seleccione proveedor...</option>
                                ${suppliers.map(s => `<option value="${s.id}" ${s.id === preloadOrder?.supplierId ? 'selected' : ''}>${s.rut} - ${s.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Nº Factura <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="number" id="invoice-number" placeholder="Ej: 12345" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Fecha Emisión</label>
                            <input type="date" class="form-control" name="date" value="${Helpers.getCurrentDate()}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Fecha Vencimiento</label>
                            <input type="date" class="form-control" name="dueDate" value="${Helpers.getDatePlusDays(30)}" required>
                        </div>
                    </div>

                    <h4 style="margin: var(--space-4) 0 var(--space-2);">Detalle</h4>
                    <div class="table-container">
                        <table class="data-table" id="invoice-lines-table">
                            <thead>
                                <tr>
                                    <th style="width: 35%;">Producto/Servicio</th>
                                    <th style="width: 12%;">Cantidad</th>
                                    <th style="width: 15%;">Precio Neto</th>
                                    <th style="width: 15%;">IVA</th>
                                    <th style="width: 15%;">Total</th>
                                    <th style="width: 8%;"></th>
                                </tr>
                            </thead>
                            <tbody id="invoice-lines">
                                <tr class="invoice-line" data-idx="0">
                                    <td>
                                        <select class="form-control product-select" name="productId">
                                            <option value="">Seleccione...</option>
                                            ${products.map(p => `<option value="${p.id}" data-cost="${p.cost}">${p.code} - ${p.name}</option>`).join('')}
                                        </select>
                                    </td>
                                    <td><input type="number" class="form-control quantity-input" name="quantity" value="1" min="1"></td>
                                    <td><input type="number" class="form-control price-input" name="price" value="0" min="0"></td>
                                    <td class="text-right iva-amount">$0</td>
                                    <td class="text-right line-total">$0</td>
                                    <td><button type="button" class="btn btn-icon btn-ghost remove-line"><i class="fas fa-times"></i></button></td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="4" class="text-right">Subtotal Neto:</td>
                                    <td class="text-right" id="invoice-subtotal">$0</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colspan="4" class="text-right">IVA (19%):</td>
                                    <td class="text-right" id="invoice-iva">$0</td>
                                    <td></td>
                                </tr>
                                <tr style="font-weight: 600; font-size: 1.1em;">
                                    <td colspan="4" class="text-right">TOTAL:</td>
                                    <td class="text-right" id="invoice-total">$0</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    <button type="button" class="btn btn-outline" id="btn-add-invoice-line" style="margin-top: var(--space-2);">
                        <i class="fas fa-plus"></i> Agregar Línea
                    </button>
                    <input type="hidden" id="linked-order-id" value="${preloadOrderId || ''}">
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-outline" id="btn-save-invoice-draft"><i class="fas fa-save"></i> Guardar Borrador</button>
                <button class="btn btn-primary" id="btn-save-invoice-post"><i class="fas fa-book"></i> Guardar y Contabilizar</button>
            `
        });

        // Si hay una OC pre-cargada, rellenar líneas automáticamente
        if (preloadOrder) {
            await this.prefillInvoiceFromOrder(preloadOrder, products);
        }

        // Escuchar cambio de OC vinculada
        document.getElementById('oc-link-select')?.addEventListener('change', async (e) => {
            const orderId = e.target.value;
            document.getElementById('linked-order-id').value = orderId;
            if (orderId) {
                const order = await DB.get('purchaseOrders', orderId);
                if (order) {
                    await this.prefillInvoiceFromOrder(order, products);
                }
            }
        });

        this.initInvoiceModalEvents(products);
    },

    async prefillInvoiceFromOrder(order, products) {
        // Pre-seleccionar proveedor
        const supplierSelect = document.getElementById('invoice-supplier');
        if (supplierSelect) supplierSelect.value = order.supplierId;

        // Cargar líneas recibidas de la OC
        const orderLines = await DB.getByIndex('purchaseOrderLines', 'orderId', order.id);
        const tbody = document.getElementById('invoice-lines');
        if (!tbody) return;

        tbody.innerHTML = '';
        const IVA_RATE = 0.19;

        orderLines.forEach((line, idx) => {
            const qtyToInvoice = (line.received || line.quantity);
            const tr = document.createElement('tr');
            tr.className = 'invoice-line';
            tr.dataset.idx = idx;
            tr.innerHTML = `
                <td>
                    <select class="form-control product-select" name="productId">
                        <option value="">Seleccione...</option>
                        ${products.map(p => `<option value="${p.id}" data-cost="${p.cost}" ${p.id === line.productId ? 'selected' : ''}>${p.code} - ${p.name}</option>`).join('')}
                    </select>
                </td>
                <td><input type="number" class="form-control quantity-input" name="quantity" value="${qtyToInvoice}" min="1"></td>
                <td><input type="number" class="form-control price-input" name="price" value="${line.price || 0}" min="0"></td>
                <td class="text-right iva-amount">$0</td>
                <td class="text-right line-total">$0</td>
                <td><button type="button" class="btn btn-icon btn-ghost remove-line"><i class="fas fa-times"></i></button></td>
            `;
            tbody.appendChild(tr);
        });

        this.bindInvoiceLineEvents(IVA_RATE);
        this.updateInvoiceTotals(IVA_RATE);
    },



    initInvoiceModalEvents(products) {
        let lineIdx = 1;
        const IVA_RATE = 0.19;

        // Agregar línea
        document.getElementById('btn-add-invoice-line')?.addEventListener('click', () => {
            const tbody = document.getElementById('invoice-lines');
            const newRow = document.createElement('tr');
            newRow.className = 'invoice-line';
            newRow.dataset.idx = lineIdx++;
            newRow.innerHTML = `
                <td>
                    <select class="form-control product-select" name="productId">
                        <option value="">Seleccione...</option>
                        ${products.map(p => `<option value="${p.id}" data-cost="${p.cost}">${p.code} - ${p.name}</option>`).join('')}
                    </select>
                </td>
                <td><input type="number" class="form-control quantity-input" name="quantity" value="1" min="1"></td>
                <td><input type="number" class="form-control price-input" name="price" value="0" min="0"></td>
                <td class="text-right iva-amount">$0</td>
                <td class="text-right line-total">$0</td>
                <td><button type="button" class="btn btn-icon btn-ghost remove-line"><i class="fas fa-times"></i></button></td>
`;
            tbody.appendChild(newRow);
            this.bindInvoiceLineEvents(IVA_RATE);
        });

        this.bindInvoiceLineEvents(IVA_RATE);

        // Guardar borrador
        document.getElementById('btn-save-invoice-draft')?.addEventListener('click', async () => {
            await this.saveSupplierInvoice(false);
        });

        // Guardar y contabilizar
        document.getElementById('btn-save-invoice-post')?.addEventListener('click', async () => {
            await this.saveSupplierInvoice(true);
        });
    },

    bindInvoiceLineEvents(IVA_RATE) {
        // Cambio de producto
        document.querySelectorAll('#invoice-lines .product-select').forEach(select => {
            select.onchange = () => {
                const option = select.selectedOptions[0];
                const cost = parseFloat(option?.dataset.cost || 0);
                const row = select.closest('tr');
                row.querySelector('.price-input').value = cost;
                this.updateInvoiceTotals(IVA_RATE);
            };
        });

        // Cambio de cantidad o precio
        document.querySelectorAll('#invoice-lines .quantity-input, #invoice-lines .price-input').forEach(input => {
            input.oninput = () => this.updateInvoiceTotals(IVA_RATE);
        });

        // Eliminar línea
        document.querySelectorAll('#invoice-lines .remove-line').forEach(btn => {
            btn.onclick = () => {
                const lines = document.querySelectorAll('.invoice-line');
                if (lines.length > 1) {
                    btn.closest('tr').remove();
                    this.updateInvoiceTotals(IVA_RATE);
                } else {
                    Toast.warning('Debe haber al menos una línea');
                }
            };
        });
    },

    updateInvoiceTotals(IVA_RATE) {
        let subtotal = 0;
        let totalIva = 0;

        document.querySelectorAll('.invoice-line').forEach(row => {
            const qty = parseFloat(row.querySelector('.quantity-input').value) || 0;
            const price = parseFloat(row.querySelector('.price-input').value) || 0;
            const neto = qty * price;
            const iva = neto * IVA_RATE;
            const total = neto + iva;

            row.querySelector('.iva-amount').textContent = Formatters.currency(iva);
            row.querySelector('.line-total').textContent = Formatters.currency(total);

            subtotal += neto;
            totalIva += iva;
        });

        document.getElementById('invoice-subtotal').textContent = Formatters.currency(subtotal);
        document.getElementById('invoice-iva').textContent = Formatters.currency(totalIva);
        document.getElementById('invoice-total').textContent = Formatters.currency(subtotal + totalIva);
    },

    async saveSupplierInvoice(autoPost) {
        const form = document.getElementById('supplier-invoice-form');
        const formData = new FormData(form);

        const supplierId = formData.get('supplierId');
        const invoiceNumber = formData.get('number');

        if (!supplierId) {
            Toast.error('Seleccione un proveedor');
            return;
        }
        if (!invoiceNumber) {
            Toast.error('Ingrese el número de factura');
            return;
        }

        const IVA_RATE = 0.19;
        const lines = [];
        let subtotal = 0;
        let totalIva = 0;

        document.querySelectorAll('.invoice-line').forEach(row => {
            const productId = row.querySelector('.product-select').value;
            const quantity = parseFloat(row.querySelector('.quantity-input').value) || 0;
            const price = parseFloat(row.querySelector('.price-input').value) || 0;

            if (quantity > 0 && price > 0) {
                const neto = quantity * price;
                const iva = neto * IVA_RATE;
                lines.push({ productId, quantity, price, neto, iva, total: neto + iva });
                subtotal += neto;
                totalIva += iva;
            }
        });

        if (lines.length === 0) {
            Toast.error('Agregue al menos una línea con cantidad y precio');
            return;
        }

        const company = CompanyService.getCurrent();
        const supplier = await DB.get('suppliers', supplierId);
        const total = subtotal + totalIva;

        const invoice = {
            id: Helpers.generateId(),
            companyId: company.id,
            supplierId,
            number: invoiceNumber,
            date: formData.get('date'),
            dueDate: formData.get('dueDate'),
            subtotal,
            iva: totalIva,
            total,
            status: autoPost ? 'posted' : 'pending',
            createdAt: new Date().toISOString()
        };

        const loading = Toast.loading(autoPost ? 'Guardando y contabilizando...' : 'Guardando factura...');

        try {
            await DB.add('supplierInvoices', invoice);

            // Guardar líneas
            for (const line of lines) {
                await DB.add('supplierInvoiceLines', {
                    id: Helpers.generateId(),
                    invoiceId: invoice.id,
                    ...line
                });
            }

            // Si autoPost, crear asiento contable
            if (autoPost) {
                const accounts = await DB.getByIndex('accounts', 'companyId', company.id);

                // Buscar Mercaderías (Activo) - la compra activa inventario, NO es gasto
                let mercaderiasAccount = accounts.find(a =>
                    !a.isGroup && a.type === 'asset' && a.code === '1.1.30.01'
                );
                if (!mercaderiasAccount) {
                    mercaderiasAccount = accounts.find(a =>
                        !a.isGroup && a.type === 'asset' &&
                        (a.name?.toLowerCase().includes('mercadería') || a.name?.toLowerCase().includes('mercaderias'))
                    );
                }
                if (!mercaderiasAccount) {
                    mercaderiasAccount = accounts.find(a =>
                        !a.isGroup && a.type === 'asset' && a.code === '1.1.07'
                    );
                }
                if (!mercaderiasAccount) {
                    mercaderiasAccount = {
                        id: Helpers.generateId(),
                        companyId: company.id,
                        code: '1.1.30.01',
                        name: 'Mercaderías',
                        type: 'asset',
                        nature: 'debit',
                        level: 2,
                        isActive: true,
                        parentId: null
                    };
                    await DB.add('accounts', mercaderiasAccount);
                }

                // Buscar IVA Crédito Fiscal (Activo)
                let ivaCredAccount = accounts.find(a =>
                    !a.isGroup && a.type === 'asset' && a.code === '1.1.40.01'
                );
                if (!ivaCredAccount) {
                    ivaCredAccount = accounts.find(a =>
                        !a.isGroup && a.type === 'asset' &&
                        a.name?.toLowerCase().includes('iva') && a.name?.toLowerCase().includes('crédito')
                    );
                }
                if (!ivaCredAccount) {
                    ivaCredAccount = {
                        id: Helpers.generateId(),
                        companyId: company.id,
                        code: '1.1.40.01',
                        name: 'IVA Crédito Fiscal',
                        type: 'asset',
                        nature: 'debit',
                        level: 2,
                        isActive: true,
                        parentId: null
                    };
                    await DB.add('accounts', ivaCredAccount);
                }

                // Buscar Proveedores (Pasivo)
                let suppliersAccount = accounts.find(a =>
                    !a.isGroup && a.type === 'liability' && a.code === '2.1.10.01'
                );
                if (!suppliersAccount) {
                    suppliersAccount = accounts.find(a =>
                        !a.isGroup && a.type === 'liability' &&
                        a.name?.toLowerCase().includes('proveedor')
                    );
                }
                if (!suppliersAccount) {
                    suppliersAccount = {
                        id: Helpers.generateId(),
                        companyId: company.id,
                        code: '2.1.10.01',
                        name: 'Proveedores',
                        type: 'liability',
                        nature: 'credit',
                        level: 2,
                        isActive: true,
                        parentId: null
                    };
                    await DB.add('accounts', suppliersAccount);
                }

                console.log('[Factura Compra] Mercaderías:', mercaderiasAccount?.name, mercaderiasAccount?.code, 'ID:', mercaderiasAccount?.id);
                console.log('[Factura Compra] IVA CF:', ivaCredAccount?.name, ivaCredAccount?.code, 'ID:', ivaCredAccount?.id);
                console.log('[Factura Compra] Proveedores:', suppliersAccount?.name, suppliersAccount?.code, 'ID:', suppliersAccount?.id);

                // Asiento: Mercaderías (D) + IVA CF (D) / Proveedores (C)
                const transactionData = {
                    date: invoice.date,
                    description: `Factura ${invoiceNumber} - ${supplier?.name || 'Proveedor'}`,
                    reference: invoiceNumber,
                    sourceDocument: 'supplierInvoice',
                    sourceDocumentId: invoice.id,
                    autoPost: true,
                    lines: [
                        { accountId: mercaderiasAccount.id, description: `Mercaderías Fact.${invoiceNumber}`, debit: subtotal, credit: 0 },
                        { accountId: ivaCredAccount.id, description: `IVA CF Fact.${invoiceNumber}`, debit: totalIva, credit: 0 },
                        { accountId: suppliersAccount.id, description: `${supplier?.name || 'Proveedor'} - Fact.${invoiceNumber}`, debit: 0, credit: total }
                    ]
                };

                await AccountingService.registerTransaction('purchases', transactionData);

                // Actualizar saldo proveedor
                if (supplier) {
                    const newBalance = (supplier.balance || 0) + total;
                    await DB.update('suppliers', { ...supplier, balance: newBalance });
                }

                loading.success('Factura guardada y contabilizada');
            } else {
                loading.success('Factura guardada como borrador');
            }

            Modal.close();
            App.navigate('compras', 'facturas-proveedor');

        } catch (err) {
            loading.error('Error: ' + err.message);
            console.error(err);
        }
    },

    async showInvoiceDetail(invoice) {
        const supplier = await DB.get('suppliers', invoice.supplierId);
        const lines = await DB.getByIndex('supplierInvoiceLines', 'invoiceId', invoice.id);

        // Cargar nombres de productos
        for (let line of lines) {
            if (line.productId) {
                const product = await DB.get('products', line.productId);
                line.productName = product?.name || product?.description || line.description || 'Producto';
                line.productCode = product?.code || '-';
            } else {
                line.productName = line.description || 'Servicio/Gasto';
                line.productCode = '-';
            }
        }

        const statusLabels = {
            pending: '<span class="badge badge-neutral">Borrador</span>',
            posted: '<span class="badge badge-warning">Pendiente</span>',
            paid: '<span class="badge badge-success">Pagada</span>',
            partial: '<span class="badge badge-warning">Pago Parcial</span>'
        };

        Modal.open({
            title: `Factura ${invoice.number} `,
            size: 'large',
            content: `
        <div style="margin-bottom: var(--space-4);">
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4);">
                <div>
                    <label style="font-size: var(--font-size-xs); color: var(--text-tertiary);">Proveedor</label>
                    <strong>${supplier?.name || 'N/A'}</strong>
                </div>
                <div>
                    <label style="font-size: var(--font-size-xs); color: var(--text-tertiary);">Fecha</label>
                    <strong>${Formatters.date(invoice.date)}</strong>
                </div>
                <div>
                    <label style="font-size: var(--font-size-xs); color: var(--text-tertiary);">Vencimiento</label>
                    <strong>${Formatters.date(invoice.dueDate)}</strong>
                </div>
                <div>
                    <label style="font-size: var(--font-size-xs); color: var(--text-tertiary);">Estado</label>
                    ${statusLabels[invoice.status] || invoice.status}
                </div>
            </div>
        </div>
    <div class="table-container">
        <table class="data-table">
            <thead>
                <tr>
                    <th>Código</th>
                    <th>Descripción</th>
                    <th class="text-right">Cantidad</th>
                    <th class="text-right">Precio Neto</th>
                    <th class="text-right">IVA</th>
                    <th class="text-right">Total</th>
                </tr>
            </thead>
            <tbody>
                ${lines.map(l => `
                                <tr>
                                    <td><code>${l.productCode}</code></td>
                                    <td>${l.productName}</td>
                                    <td class="text-right">${l.quantity}</td>
                                    <td class="text-right">${Formatters.currency(l.neto || l.price * l.quantity)}</td>
                                    <td class="text-right">${Formatters.currency(l.iva || 0)}</td>
                                    <td class="text-right">${Formatters.currency(l.total || l.price * l.quantity)}</td>
                                </tr>
                            `).join('')}
            </tbody>
            <tfoot>
                <tr>
                    <td colspan="5" class="text-right">Subtotal Neto:</td>
                    <td class="text-right">${Formatters.currency(invoice.subtotal || (invoice.total / 1.19))}</td>
                </tr>
                <tr>
                    <td colspan="5" class="text-right">IVA (19%):</td>
                    <td class="text-right">${Formatters.currency(invoice.iva || (invoice.total - (invoice.total / 1.19)))}</td>
                </tr>
                <tr style="font-weight: 600; font-size: 1.1em;">
                    <td colspan="5" class="text-right">TOTAL:</td>
                    <td class="text-right">${Formatters.currency(invoice.total)}</td>
                </tr>
            </tfoot>
        </table>
    </div>
`,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cerrar</button>
                ${(invoice.status === 'posted' || invoice.status === 'partial') ? `<button class="btn btn-primary" onclick="Modal.close(); ComprasModule.paySupplierInvoice(ComprasModule._currentInvoice);"><i class="fas fa-money-bill-wave"></i> Pagar</button>` : ''}
            `
        });

        this._currentInvoice = invoice;
    },

    async postSupplierInvoice(invoice) {
        if (invoice.status !== 'pending') {
            Toast.warning('Esta factura ya está contabilizada o pagada');
            return;
        }

        const confirm = await Modal.confirm({
            title: 'Contabilizar Factura',
            message: `¿Contabilizar la factura ${invoice.number}?`,
            confirmText: 'Contabilizar'
        });

        if (!confirm) return;

        const loading = Toast.loading('Contabilizando...');

        try {
            const company = CompanyService.getCurrent();
            const supplier = await DB.get('suppliers', invoice.supplierId);
            const accounts = await DB.getByIndex('accounts', 'companyId', company.id);

            // Buscar Mercaderías (Activo) - Priorizar código exacto
            let inventoryAccount = accounts.find(a =>
                !a.isGroup && a.type === 'asset' && a.code === '1.1.30.01'
            );
            if (!inventoryAccount) {
                inventoryAccount = accounts.find(a =>
                    !a.isGroup && a.type === 'asset' &&
                    (a.name?.toLowerCase().includes('mercadería') || a.name?.toLowerCase().includes('mercaderias'))
                );
            }
            if (!inventoryAccount) {
                inventoryAccount = accounts.find(a =>
                    !a.isGroup && a.type === 'asset' && (a.code === '1.1.03.001' || a.code === '1.1.07')
                );
            }
            if (!inventoryAccount) {
                inventoryAccount = { id: Helpers.generateId(), companyId: company.id, code: '1.1.30.01', name: 'Mercaderías', type: 'asset', nature: 'debit', level: 2, isActive: true, parentId: null };
                await DB.add('accounts', inventoryAccount);
            }

            // Buscar IVA Crédito Fiscal (Activo)
            let ivaCredAccount = accounts.find(a =>
                !a.isGroup && a.type === 'asset' && a.code === '1.1.40.01'
            );
            if (!ivaCredAccount) {
                ivaCredAccount = accounts.find(a =>
                    !a.isGroup && a.type === 'asset' &&
                    a.name?.toLowerCase().includes('iva') && a.name?.toLowerCase().includes('crédito')
                );
            }
            if (!ivaCredAccount) {
                ivaCredAccount = { id: Helpers.generateId(), companyId: company.id, code: '1.1.40.01', name: 'IVA Crédito Fiscal', type: 'asset', nature: 'debit', level: 2, isActive: true, parentId: null };
                await DB.add('accounts', ivaCredAccount);
            }

            // Buscar Proveedores (Pasivo)
            let suppliersAccount = accounts.find(a =>
                !a.isGroup && a.type === 'liability' && a.code === '2.1.10.01'
            );
            if (!suppliersAccount) {
                suppliersAccount = accounts.find(a =>
                    !a.isGroup && a.type === 'liability' && a.name?.toLowerCase().includes('proveedor')
                );
            }
            if (!suppliersAccount) {
                suppliersAccount = { id: Helpers.generateId(), companyId: company.id, code: '2.1.10.01', name: 'Proveedores', type: 'liability', nature: 'credit', level: 2, isActive: true, parentId: null };
                await DB.add('accounts', suppliersAccount);
            }

            const subtotal = invoice.subtotal || (invoice.total / 1.19);
            const iva = invoice.iva || (invoice.total - subtotal);

            // Asiento: Mercaderías (D) + IVA CF (D) / Proveedores (C)
            const transactionData = {
                date: invoice.date,
                description: `Factura ${invoice.number} - ${supplier?.name || 'Proveedor'}`,
                reference: invoice.number,
                sourceDocument: 'supplierInvoice',
                sourceDocumentId: invoice.id,
                autoPost: true,
                lines: [
                    { accountId: inventoryAccount.id, description: `Mercaderías Fact.${invoice.number}`, debit: subtotal, credit: 0 },
                    { accountId: ivaCredAccount.id, description: `IVA CF Fact.${invoice.number}`, debit: iva, credit: 0 },
                    { accountId: suppliersAccount.id, description: `${supplier?.name || 'Proveedor'} - Fact.${invoice.number}`, debit: 0, credit: invoice.total }
                ]
            };

            await AccountingService.registerTransaction('purchases', transactionData);

            // Actualizar factura
            await DB.update('supplierInvoices', { ...invoice, status: 'posted' });

            // Actualizar saldo proveedor
            if (supplier) {
                await DB.update('suppliers', { ...supplier, balance: (supplier.balance || 0) + invoice.total });
            }

            loading.success('Factura contabilizada');
            App.navigate('compras', 'facturas-proveedor');

        } catch (err) {
            loading.error('Error: ' + err.message);
        }
    },

    async paySupplierInvoice(invoice) {
        if (invoice.status === 'pending') {
            Toast.warning('Primero debe contabilizar la factura');
            return;
        }
        if (invoice.status === 'paid') {
            Toast.warning('Esta factura ya está pagada');
            return;
        }

        const company = CompanyService.getCurrent();
        const accounts = await DB.getByIndex('accounts', 'companyId', company.id);

        // Buscar cuentas de banco/caja
        const bankAccounts = accounts.filter(a =>
            a.type === 'asset' && (a.code?.startsWith('1.1.01') || a.code?.startsWith('1.1.02') ||
                a.name?.toLowerCase().includes('caja') || a.name?.toLowerCase().includes('banco'))
        );

        if (bankAccounts.length === 0) {
            Toast.error('No hay cuentas de Banco/Caja configuradas');
            return;
        }

        const supplier = await DB.get('suppliers', invoice.supplierId);

        Modal.open({
            title: 'Registrar Pago',
            content: `
                <form id="payment-form">
                    <div class="form-group">
                        <label class="form-label">Factura</label>
                        <input type="text" class="form-control" value="${invoice.number} - ${supplier?.name}" disabled>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Monto a Pagar</label>
                        <input type="text" class="form-control" value="${Formatters.currency(invoice.total)}" disabled>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Cuenta de Pago <span class="text-danger">*</span></label>
                        <select class="form-control" name="accountId" required>
                            ${bankAccounts.map(a => `<option value="${a.id}">${a.code} - ${a.name}</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Fecha de Pago</label>
                        <input type="date" class="form-control" name="paymentDate" value="${Helpers.getCurrentDate()}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Referencia (Nº Cheque/Transferencia)</label>
                        <input type="text" class="form-control" name="reference" placeholder="Opcional">
                    </div>
                </form>
    `,
            footer: `
    < button class="btn btn-secondary" onclick = "Modal.close()" > Cancelar</button >
        <button class="btn btn-success" id="btn-confirm-payment"><i class="fas fa-check"></i> Confirmar Pago</button>
`
        });

        document.getElementById('btn-confirm-payment')?.addEventListener('click', async () => {
            const form = document.getElementById('payment-form');
            const formData = new FormData(form);

            const paymentAccountId = formData.get('accountId');
            const paymentDate = formData.get('paymentDate');
            const reference = formData.get('reference');

            const loading = Toast.loading('Registrando pago...');

            try {
                // Buscar cuenta de proveedores
                let suppliersAccount = accounts.find(a =>
                    a.type === 'liability' && (a.code?.includes('2.1.01') || a.name?.toLowerCase().includes('proveedor'))
                );

                if (!suppliersAccount) {
                    suppliersAccount = { id: Helpers.generateId(), companyId: company.id, code: '2.1.01', name: 'Proveedores', type: 'liability', nature: 'credit', level: 2, isActive: true };
                    await DB.add('accounts', suppliersAccount);
                }

                // Crear asiento de pago usando sistema dual
                const transactionData = {
                    date: paymentDate,
                    description: `Pago Factura ${invoice.number} - ${supplier?.name || 'Proveedor'} `,
                    reference: reference || `PAG - ${invoice.number} `,
                    sourceDocument: 'supplierPayment',
                    sourceDocumentId: invoice.id,
                    autoPost: true,
                    lines: [
                        // Débito: Proveedores (salda la deuda)
                        { accountId: suppliersAccount.id, description: `Pago Fact.${invoice.number} `, debit: invoice.total, credit: 0 },
                        // Crédito: Banco/Caja (sale el dinero)
                        { accountId: paymentAccountId, description: `Pago a ${supplier?.name || 'Proveedor'} `, debit: 0, credit: invoice.total }
                    ]
                };

                await AccountingService.registerTransaction('treasury', transactionData);

                // Actualizar factura a pagada
                await DB.update('supplierInvoices', {
                    ...invoice,
                    status: 'paid',
                    paidAt: new Date().toISOString(),
                    paymentReference: reference
                });

                // Actualizar saldo del proveedor (reducir deuda)
                if (supplier) {
                    const newBalance = (supplier.balance || 0) - invoice.total;
                    await DB.update('suppliers', { ...supplier, balance: newBalance });
                }

                Modal.close();
                loading.success(`Pago registrado y contabilizado`);
                App.navigate('compras', 'facturas-proveedor');

            } catch (err) {
                loading.error('Error: ' + err.message);
                console.error(err);
            }
        });
    },

    /**
     * Anular una orden de compra
     */
    async cancelPurchaseOrder(order) {
        if (order.status === 'cancelled') {
            Toast.warning('Esta orden ya está anulada');
            return;
        }

        const wasReceived = order.status === 'received';

        let message = `¿Está seguro de anular la orden ${order.number}?`;
        if (wasReceived) {
            message += `\n\n⚠️ Esta orden ya fue recibida.Al anularla: \n• Se reducirá el stock(devolución) \n• Se anularán los asientos contables\n• Se anulará la factura de proveedor asociada`;
        }

        const confirm = await Modal.confirm({
            title: 'Anular Orden de Compra',
            message: message,
            confirmText: 'Anular Orden',
            confirmClass: 'btn-danger'
        });

        if (!confirm) return;

        const loading = Toast.loading('Anulando orden...');

        try {
            const company = CompanyService.getCurrent();

            if (wasReceived) {
                // 1. Revertir stock (reducir porque se "devuelve")
                const lines = await DB.getByIndex('purchaseOrderLines', 'orderId', order.id);
                for (const line of lines) {
                    const product = await DB.get('products', line.productId);
                    if (product && !product.isService) {
                        const newStock = Math.max(0, (product.stock || 0) - line.quantity);
                        await DB.update('products', {
                            ...product,
                            stock: newStock
                        });

                        // Registrar movimiento de salida (reversión)
                        await DB.add('stockMovements', {
                            id: Helpers.generateId(),
                            companyId: company.id,
                            productId: line.productId,
                            type: 'out',
                            quantity: line.quantity,
                            reference: `ANULACIÓN ${order.number} `,
                            date: Helpers.getCurrentDate(),
                            notes: `Reversión por anulación de orden de compra ${order.number} `,
                            createdAt: new Date().toISOString()
                        });
                    }
                }

                // 2. Anular asientos contables relacionados
                const entries = await DB.getByIndex('journalEntries', 'companyId', company.id);
                const relatedEntries = entries.filter(e => e.reference === order.number);

                for (const entry of relatedEntries) {
                    // Crear asiento de reversión
                    const originalLines = await DB.getByIndex('journalLines', 'entryId', entry.id);
                    const reversalNumber = await AccountingService.getNextEntryNumber();

                    const reversalEntry = {
                        id: Helpers.generateId(),
                        companyId: company.id,
                        number: reversalNumber,
                        date: Helpers.getCurrentDate(),
                        description: `ANULACIÓN: ${entry.description} `,
                        reference: `ANUL - ${entry.reference} `,
                        status: 'posted',
                        totalDebit: entry.totalCredit,
                        totalCredit: entry.totalDebit,
                        createdAt: new Date().toISOString()
                    };
                    await DB.add('journalEntries', reversalEntry);

                    // Invertir líneas (débitos a créditos y viceversa)
                    for (const line of originalLines) {
                        await DB.add('journalLines', {
                            id: Helpers.generateId(),
                            entryId: reversalEntry.id,
                            accountId: line.accountId,
                            description: `Reversión: ${line.description} `,
                            debit: line.credit,
                            credit: line.debit
                        });
                    }

                    // Marcar asiento original como anulado
                    await DB.update('journalEntries', { ...entry, status: 'cancelled' });
                }

                // 3. Anular factura de proveedor si existe
                const invoices = await DB.getByIndex('supplierInvoices', 'companyId', company.id);
                const relatedInvoice = invoices.find(i => i.purchaseOrderId === order.id);
                if (relatedInvoice) {
                    await DB.update('supplierInvoices', { ...relatedInvoice, status: 'cancelled' });

                    // Revertir saldo del proveedor
                    const supplier = await DB.get('suppliers', order.supplierId);
                    if (supplier) {
                        await DB.update('suppliers', {
                            ...supplier,
                            balance: Math.max(0, (supplier.balance || 0) - relatedInvoice.total)
                        });
                    }
                }
            }

            // Actualizar estado de la orden
            await DB.update('purchaseOrders', {
                ...order,
                status: 'cancelled',
                cancelledAt: new Date().toISOString()
            });

            loading.success(`Orden ${order.number} anulada`);
            App.navigate('compras', 'ordenes');

        } catch (err) {
            loading.error('Error al anular: ' + err.message);
            console.error(err);
        }
    }
};

window.ComprasModule = ComprasModule;
