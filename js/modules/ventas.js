/**
 * EDU-TRACE ERP - Ventas Module
 * Módulo de Gestión de Ventas (SD)
 */

const VentasModule = {
    currentView: 'clientes',

    async render(view = 'clientes') {
        this.currentView = view;

        switch (view) {
            case 'clientes': return await this.renderCustomers();
            case 'pedidos-venta': return await this.renderSalesOrders();
            case 'facturas-cliente': return await this.renderCustomerInvoices();
            default: return '<p>Vista no encontrada</p>';
        }
    },

    async renderCustomers() {
        return `
            <div class="page-header">
                <h1 class="page-title">Clientes</h1>
                <p class="page-subtitle">Gestión de clientes y condiciones de venta</p>
            </div>
            <div class="toolbar">
                <div class="toolbar-left">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" class="form-control" placeholder="Buscar cliente..." id="search-customers">
                    </div>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-primary" id="btn-new-customer">
                        <i class="fas fa-plus"></i> Nuevo Cliente
                    </button>
                </div>
            </div>
            <div id="customers-table"></div>
        `;
    },

    async renderSalesOrders() {
        return `
            <div class="page-header">
                <h1 class="page-title">Pedidos de Venta</h1>
                <p class="page-subtitle">Gestión de pedidos de clientes</p>
            </div>
            <div class="toolbar">
                <div class="toolbar-left">
                    <input type="date" class="form-control" id="filter-date-from">
                    <input type="date" class="form-control" id="filter-date-to">
                    <select class="form-control" id="filter-status">
                        <option value="">Todos</option>
                        <option value="draft">Borrador</option>
                        <option value="confirmed">Confirmado</option>
                        <option value="delivered">Entregado</option>
                        <option value="cancelled">Anulado</option>
                    </select>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-primary" id="btn-new-order">
                        <i class="fas fa-plus"></i> Nuevo Pedido
                    </button>
                </div>
            </div>
            <div id="orders-table"></div>
        `;
    },

    async renderCustomerInvoices() {
        return `
            <div class="page-header">
                <h1 class="page-title">Facturas de Venta</h1>
                <p class="page-subtitle">Facturación y documentos tributarios</p>
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
            case 'clientes': await this.initCustomers(); break;
            case 'pedidos-venta': await this.initSalesOrders(); break;
            case 'facturas-cliente': await this.initCustomerInvoices(); break;
        }
    },

    async initCustomers() {
        const company = CompanyService.getCurrent();
        const customers = await DB.getByIndex('customers', 'companyId', company.id);

        DataTable.create('customers-table', {
            columns: [
                { key: 'rut', label: 'RUT' },
                { key: 'name', label: 'Nombre' },
                { key: 'contact', label: 'Contacto' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Teléfono' },
                { key: 'creditLimit', label: 'Límite Crédito', format: 'currency', class: 'text-right' },
                { key: 'balance', label: 'Saldo', format: 'currency', class: 'text-right' }
            ],
            data: customers,
            actions: [
                { name: 'edit', label: 'Editar', icon: 'fas fa-edit', handler: (row) => this.showCustomerModal(row.id) },
                { name: 'delete', label: 'Eliminar', icon: 'fas fa-trash', handler: (row) => this.deleteCustomer(row.id) }
            ],
            emptyMessage: 'No hay clientes registrados'
        });

        document.getElementById('btn-new-customer')?.addEventListener('click', () => this.showCustomerModal());
    },

    async showCustomerModal(customerId = null) {
        const isEdit = !!customerId;
        let data = {};

        if (isEdit) {
            data = await DB.get('customers', customerId);
        }

        await Modal.form({
            title: isEdit ? 'Editar Cliente' : 'Nuevo Cliente',
            fields: [
                { name: 'rut', label: 'RUT', required: true, placeholder: '76.123.456-7', default: data.rut },
                { name: 'name', label: 'Razón Social', required: true, placeholder: 'Nombre empresa', default: data.name },
                { name: 'contact', label: 'Contacto', placeholder: 'Nombre contacto', default: data.contact },
                { name: 'email', label: 'Email', type: 'email', placeholder: 'email@empresa.cl', default: data.email },
                { name: 'phone', label: 'Teléfono', placeholder: '+56 9 1234 5678', default: data.phone },
                { name: 'address', label: 'Dirección', placeholder: 'Dirección comercial', default: data.address },
                { name: 'creditLimit', label: 'Límite de Crédito', type: 'number', default: data.creditLimit || 0 }
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
                    await DB.update('customers', { ...data, ...formData });
                    Toast.success('Cliente actualizado');
                } else {
                    await DB.add('customers', { companyId: company.id, ...formData, status: 'active', balance: 0 });
                    Toast.success('Cliente creado');
                }
                App.navigate('ventas', 'clientes');
            }
        });
    },

    async deleteCustomer(id) {
        const confirm = await Modal.confirm({
            title: 'Eliminar Cliente',
            message: '¿Está seguro de eliminar este cliente?',
            confirmText: 'Eliminar',
            confirmClass: 'btn-danger'
        });

        if (confirm) {
            await DB.delete('customers', id);
            Toast.success('Cliente eliminado');
            App.navigate('ventas', 'clientes');
        }
    },

    async initSalesOrders() {
        const company = CompanyService.getCurrent();
        const allOrders = await DB.getByIndex('salesOrders', 'companyId', company.id);

        // Cargar nombres de clientes
        for (let order of allOrders) {
            const customer = await DB.get('customers', order.customerId);
            order.customerName = customer?.name || 'Cliente desconocido';
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
                    { key: 'customerName', label: 'Cliente' },
                    { key: 'total', label: 'Total', format: 'currency', class: 'text-right' },
                    { key: 'status', label: 'Estado', format: 'status' }
                ],
                data: filteredOrders,
                actions: [
                    { name: 'view', label: 'Ver', icon: 'fas fa-eye', handler: (row) => this.showOrderDetail(row) },
                    { name: 'edit', label: 'Editar', icon: 'fas fa-edit', handler: (row) => this.editSalesOrder(row) },
                    { name: 'confirm', label: 'Confirmar', icon: 'fas fa-check', handler: (row) => this.confirmOrder(row) },
                    { name: 'deliver', label: 'Entregar', icon: 'fas fa-truck', handler: (row) => this.deliverOrder(row) },
                    { name: 'invoice', label: 'Facturar', icon: 'fas fa-file-invoice', handler: (row) => this.invoiceOrder(row) },
                    { name: 'cancel', label: 'Anular', icon: 'fas fa-ban', handler: (row) => this.cancelSalesOrder(row) }
                ],
                emptyMessage: 'No hay pedidos de venta'
            });
        };

        // Renderizar tabla inicial
        applyFilters();

        // Agregar event listeners a los filtros
        document.getElementById('filter-date-from')?.addEventListener('change', applyFilters);
        document.getElementById('filter-date-to')?.addEventListener('change', applyFilters);
        document.getElementById('filter-status')?.addEventListener('change', applyFilters);

        document.getElementById('btn-new-order')?.addEventListener('click', () => {
            this.showSalesOrderModal();
        });
    },

    async showSalesOrderModal() {
        const company = CompanyService.getCurrent();
        const customers = await DB.getByIndex('customers', 'companyId', company.id);
        const products = await DB.getByIndex('products', 'companyId', company.id);

        if (customers.length === 0) {
            Toast.warning('Primero debe crear al menos un cliente');
            return;
        }

        Modal.open({
            title: 'Nuevo Pedido de Venta',
            size: 'large',
            content: `
                <form id="sales-order-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Cliente <span class="text-danger">*</span></label>
                            <select class="form-control" name="customerId" required>
                                <option value="">Seleccione cliente...</option>
                                ${customers.map(c => `<option value="${c.id}">${c.rut} - ${c.name}</option>`).join('')}
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
                                    <th style="width: 35%;">Producto</th>
                                    <th style="width: 10%;">Stock</th>
                                    <th style="width: 12%;">Cantidad</th>
                                    <th style="width: 15%;">Precio</th>
                                    <th style="width: 18%;">Subtotal</th>
                                    <th style="width: 10%;"></th>
                                </tr>
                            </thead>
                            <tbody id="order-lines">
                                <tr class="order-line" data-idx="0">
                                    <td>
                                        <select class="form-control product-select" name="productId" required>
                                            <option value="">Seleccione...</option>
                                            ${products.map(p => `<option value="${p.id}" data-price="${p.price}" data-stock="${p.stock || 0}">${p.code} - ${p.name}</option>`).join('')}
                                        </select>
                                    </td>
                                    <td class="text-right stock-display">-</td>
                                    <td><input type="number" class="form-control quantity-input" name="quantity" value="1" min="1" required></td>
                                    <td><input type="number" class="form-control price-input" name="price" value="0" min="0" required></td>
                                    <td class="text-right subtotal">$0</td>
                                    <td><button type="button" class="btn btn-icon btn-ghost remove-line"><i class="fas fa-times"></i></button></td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colspan="4" class="text-right">Subtotal Neto:</td>
                                    <td class="text-right" id="order-subtotal">$0</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colspan="4" class="text-right">IVA (19%):</td>
                                    <td class="text-right" id="order-iva">$0</td>
                                    <td></td>
                                </tr>
                                <tr style="font-weight: 600;">
                                    <td colspan="4" class="text-right">TOTAL:</td>
                                    <td class="text-right" id="order-total">$0</td>
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
                <button class="btn btn-primary" id="btn-save-order"><i class="fas fa-save"></i> Guardar Pedido</button>
            `
        });

        this.initSalesOrderModalEvents(products);
    },

    initSalesOrderModalEvents(products) {
        let lineIdx = 1;
        const IVA_RATE = 0.19;

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
                        ${products.map(p => `<option value="${p.id}" data-price="${p.price}" data-stock="${p.stock || 0}">${p.code} - ${p.name}</option>`).join('')}
                    </select>
                </td>
                <td class="text-right stock-display">-</td>
                <td><input type="number" class="form-control quantity-input" name="quantity" value="1" min="1" required></td>
                <td><input type="number" class="form-control price-input" name="price" value="0" min="0" required></td>
                <td class="text-right subtotal">$0</td>
                <td><button type="button" class="btn btn-icon btn-ghost remove-line"><i class="fas fa-times"></i></button></td>
            `;
            tbody.appendChild(newRow);
            this.bindSalesOrderLineEvents(IVA_RATE);
        });

        this.bindSalesOrderLineEvents(IVA_RATE);

        // Guardar orden
        document.getElementById('btn-save-order')?.addEventListener('click', async () => {
            await this.saveSalesOrder();
        });
    },

    bindSalesOrderLineEvents(IVA_RATE) {
        const self = this;

        // Cambio de producto
        document.querySelectorAll('#order-lines .product-select').forEach(select => {
            // Remover listener anterior si existe
            select.removeEventListener('change', select._changeHandler);
            select._changeHandler = function () {
                const option = select.selectedOptions[0];
                const price = parseFloat(option?.dataset.price || 0);
                const stock = parseInt(option?.dataset.stock || 0);
                const row = select.closest('tr');
                row.querySelector('.price-input').value = price;
                row.querySelector('.stock-display').textContent = stock;
                self.updateSalesOrderTotals(IVA_RATE);
                self.validateStockInRow(row, stock);
            };
            select.addEventListener('change', select._changeHandler);
        });

        // Cambio de cantidad o precio
        document.querySelectorAll('#order-lines .quantity-input, #order-lines .price-input').forEach(input => {
            // Remover listener anterior si existe
            input.removeEventListener('input', input._inputHandler);
            input._inputHandler = function () {
                self.updateSalesOrderTotals(IVA_RATE);
                // Validar stock cuando cambia la cantidad
                if (input.classList.contains('quantity-input')) {
                    const row = input.closest('tr');
                    const stockText = row.querySelector('.stock-display')?.textContent;
                    const stock = parseInt(stockText) || 0;
                    self.validateStockInRow(row, stock);
                }
            };
            input.addEventListener('input', input._inputHandler);
        });

        // Eliminar línea
        document.querySelectorAll('#order-lines .remove-line').forEach(btn => {
            // Remover listener anterior si existe
            btn.removeEventListener('click', btn._clickHandler);
            btn._clickHandler = function () {
                const lines = document.querySelectorAll('.order-line');
                if (lines.length > 1) {
                    btn.closest('tr').remove();
                    self.updateSalesOrderTotals(IVA_RATE);
                } else {
                    Toast.warning('Debe haber al menos una línea');
                }
            };
            btn.addEventListener('click', btn._clickHandler);
        });

        // Actualizar totales inmediatamente
        this.updateSalesOrderTotals(IVA_RATE);
    },

    updateSalesOrderTotals(IVA_RATE) {
        let subtotal = 0;
        document.querySelectorAll('.order-line').forEach(row => {
            const qty = parseFloat(row.querySelector('.quantity-input')?.value) || 0;
            const price = parseFloat(row.querySelector('.price-input')?.value) || 0;
            const lineSubtotal = qty * price;
            const subtotalEl = row.querySelector('.subtotal');
            if (subtotalEl) subtotalEl.textContent = Formatters.currency(lineSubtotal);
            subtotal += lineSubtotal;
        });

        const iva = subtotal * IVA_RATE;
        const subtotalEl = document.getElementById('order-subtotal');
        const ivaEl = document.getElementById('order-iva');
        const totalEl = document.getElementById('order-total');

        if (subtotalEl) subtotalEl.textContent = Formatters.currency(subtotal);
        if (ivaEl) ivaEl.textContent = Formatters.currency(iva);
        if (totalEl) totalEl.textContent = Formatters.currency(subtotal + iva);
    },

    /**
     * Valida visualmente si la cantidad excede el stock disponible en una fila
     */
    validateStockInRow(row, stock) {
        const quantityInput = row.querySelector('.quantity-input');
        const stockDisplay = row.querySelector('.stock-display');
        const quantity = parseFloat(quantityInput?.value) || 0;

        if (quantity > stock && stock >= 0) {
            // Marcar como error
            quantityInput?.classList.add('error');
            stockDisplay?.classList.add('text-danger');
            stockDisplay.style.fontWeight = 'bold';
        } else {
            // Quitar marcas de error
            quantityInput?.classList.remove('error');
            stockDisplay?.classList.remove('text-danger');
            stockDisplay.style.fontWeight = '';
        }
    },

    async saveSalesOrder() {
        const form = document.getElementById('sales-order-form');
        const formData = new FormData(form);

        const customerId = formData.get('customerId');
        if (!customerId) {
            Toast.error('Seleccione un cliente');
            return;
        }

        const IVA_RATE = 0.19;
        const lines = [];
        let subtotal = 0;

        document.querySelectorAll('.order-line').forEach(row => {
            const productId = row.querySelector('.product-select').value;
            const quantity = parseFloat(row.querySelector('.quantity-input').value) || 0;
            const price = parseFloat(row.querySelector('.price-input').value) || 0;

            if (productId && quantity > 0) {
                const lineSubtotal = quantity * price;
                lines.push({ productId, quantity, price, subtotal: lineSubtotal });
                subtotal += lineSubtotal;
            }
        });

        if (lines.length === 0) {
            Toast.error('Agregue al menos un producto');
            return;
        }

        // Validar stock disponible para cada producto
        const stockErrors = [];
        for (const line of lines) {
            const product = await DB.get('products', line.productId);
            if (product && !product.isService) {
                const availableStock = product.stock || 0;
                if (line.quantity > availableStock) {
                    stockErrors.push({
                        name: product.name || product.code,
                        requested: line.quantity,
                        available: availableStock
                    });
                }
            }
        }

        if (stockErrors.length > 0) {
            const errorMessages = stockErrors.map(e =>
                `• ${e.name}: solicita ${e.requested} pero solo hay ${e.available} disponibles`
            ).join('\n');
            Toast.error(`Stock insuficiente:\n${errorMessages}`);
            return;
        }

        const company = CompanyService.getCurrent();
        const iva = subtotal * IVA_RATE;
        const total = subtotal + iva;
        const orderNumber = await this.getNextSalesOrderNumber();

        const order = {
            id: Helpers.generateId(),
            companyId: company.id,
            number: orderNumber,
            customerId,
            date: formData.get('date'),
            notes: formData.get('notes'),
            status: 'draft',
            subtotal,
            iva,
            total,
            createdAt: new Date().toISOString()
        };

        try {
            await DB.add('salesOrders', order);

            for (const line of lines) {
                await DB.add('salesOrderLines', {
                    id: Helpers.generateId(),
                    orderId: order.id,
                    ...line
                });
            }

            Toast.success('Pedido de venta creado');
            Modal.close();
            App.navigate('ventas', 'pedidos-venta');
        } catch (err) {
            Toast.error('Error: ' + err.message);
        }
    },

    async getNextSalesOrderNumber() {
        const company = CompanyService.getCurrent();
        const orders = await DB.getByIndex('salesOrders', 'companyId', company.id);
        const year = new Date().getFullYear();
        const prefix = `PV-${year}-`;
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
        const customer = await DB.get('customers', order.customerId);
        const lines = await DB.getByIndex('salesOrderLines', 'orderId', order.id);

        for (let line of lines) {
            const product = await DB.get('products', line.productId);
            line.productName = product?.name || 'Producto';
            line.productCode = product?.code || '';
        }

        const statusLabels = {
            draft: '<span class="badge badge-warning">Borrador</span>',
            confirmed: '<span class="badge badge-info">Confirmado</span>',
            delivered: '<span class="badge badge-success">Entregado</span>',
            cancelled: '<span class="badge badge-error">Cancelado</span>'
        };

        Modal.open({
            title: `Pedido ${order.number}`,
            size: 'large',
            content: `
                <div style="margin-bottom: var(--space-4);">
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4);">
                        <div>
                            <label style="font-size: var(--font-size-xs); color: var(--text-tertiary);">Cliente</label>
                            <strong>${customer?.name || 'N/A'}</strong>
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
                            <tr>
                                <td colspan="4" class="text-right">Subtotal:</td>
                                <td class="text-right">${Formatters.currency(order.subtotal || 0)}</td>
                            </tr>
                            <tr>
                                <td colspan="4" class="text-right">IVA (19%):</td>
                                <td class="text-right">${Formatters.currency(order.iva || 0)}</td>
                            </tr>
                            <tr style="font-weight: 600;">
                                <td colspan="4" class="text-right">TOTAL:</td>
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
     * Editar un pedido de venta (solo si está en borrador)
     */
    async editSalesOrder(order) {
        // Solo se pueden editar pedidos en borrador
        if (order.status !== 'draft') {
            const statusName = {
                confirmed: 'confirmado',
                delivered: 'entregado',
                cancelled: 'anulado'
            }[order.status] || order.status;

            Toast.warning(`No se puede editar un pedido ${statusName}. Solo los pedidos en borrador son editables.`);
            return;
        }

        const company = CompanyService.getCurrent();
        const customers = await DB.getByIndex('customers', 'companyId', company.id);
        const products = await DB.getByIndex('products', 'companyId', company.id);
        const existingLines = await DB.getByIndex('salesOrderLines', 'orderId', order.id);

        // Construir HTML de líneas existentes
        let linesHtml = '';
        for (let i = 0; i < existingLines.length; i++) {
            const line = existingLines[i];
            const product = products.find(p => p.id === line.productId);
            linesHtml += `
                <tr class="order-line" data-idx="${i}">
                    <td>
                        <select class="form-control product-select" name="productId" required>
                            <option value="">Seleccione...</option>
                            ${products.map(p => `<option value="${p.id}" data-price="${p.price}" data-stock="${p.stock || 0}" ${p.id === line.productId ? 'selected' : ''}>${p.code} - ${p.name}</option>`).join('')}
                        </select>
                    </td>
                    <td class="text-right stock-display">${product?.stock || 0}</td>
                    <td><input type="number" class="form-control quantity-input" name="quantity" value="${line.quantity}" min="1" required></td>
                    <td><input type="number" class="form-control price-input" name="price" value="${line.price}" min="0" required></td>
                    <td class="text-right subtotal">${Formatters.currency(line.subtotal)}</td>
                    <td><button type="button" class="btn btn-icon btn-ghost remove-line"><i class="fas fa-times"></i></button></td>
                </tr>
            `;
        }

        Modal.open({
            title: `Editar Pedido ${order.number}`,
            size: 'large',
            content: `
                <form id="edit-order-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Cliente <span class="text-error">*</span></label>
                            <select class="form-control" name="customerId" required>
                                <option value="">Seleccione...</option>
                                ${customers.map(c => `<option value="${c.id}" ${c.id === order.customerId ? 'selected' : ''}>${c.rut} - ${c.name}</option>`).join('')}
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
                                    <th style="width: 35%;">Producto</th>
                                    <th style="width: 10%;">Stock</th>
                                    <th style="width: 12%;">Cantidad</th>
                                    <th style="width: 15%;">Precio</th>
                                    <th style="width: 18%;">Subtotal</th>
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
                        <div>Subtotal: <strong id="order-subtotal">$0</strong></div>
                        <div>IVA (19%): <strong id="order-iva">$0</strong></div>
                        <div style="font-size: 1.2em;">Total: <strong id="order-total">$0</strong></div>
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-primary" id="btn-save-edit-order">Guardar Cambios</button>
            `
        });

        const IVA_RATE = 0.19;

        // Reutilizar la lógica de eventos del modal de creación
        this.bindSalesOrderLineEvents(IVA_RATE);
        this.updateSalesOrderTotals(IVA_RATE);

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
                        ${products.map(p => `<option value="${p.id}" data-price="${p.price}" data-stock="${p.stock || 0}">${p.code} - ${p.name}</option>`).join('')}
                    </select>
                </td>
                <td class="text-right stock-display">-</td>
                <td><input type="number" class="form-control quantity-input" name="quantity" value="1" min="1" required></td>
                <td><input type="number" class="form-control price-input" name="price" value="0" min="0" required></td>
                <td class="text-right subtotal">$0</td>
                <td><button type="button" class="btn btn-icon btn-ghost remove-line"><i class="fas fa-times"></i></button></td>
            `;
            tbody.appendChild(newRow);
            this.bindSalesOrderLineEvents(IVA_RATE);
        });

        // Handler para guardar cambios
        document.getElementById('btn-save-edit-order')?.addEventListener('click', async () => {
            await this.saveEditedOrder(order);
        });
    },

    /**
     * Guardar cambios en un pedido editado
     */
    async saveEditedOrder(originalOrder) {
        const form = document.getElementById('edit-order-form');
        const formData = new FormData(form);

        const customerId = formData.get('customerId');
        const date = formData.get('date');
        const notes = formData.get('notes');

        if (!customerId) {
            Toast.error('Debe seleccionar un cliente');
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
                    subtotal: quantity * price
                });
            }
        });

        if (lines.length === 0) {
            Toast.error('Debe agregar al menos un producto');
            return;
        }

        // Validar stock disponible para cada producto
        const stockErrors = [];
        for (const line of lines) {
            const product = await DB.get('products', line.productId);
            if (product && !product.isService) {
                const availableStock = product.stock || 0;
                if (line.quantity > availableStock) {
                    stockErrors.push({
                        name: product.name || product.code,
                        requested: line.quantity,
                        available: availableStock
                    });
                }
            }
        }

        if (stockErrors.length > 0) {
            const errorMessages = stockErrors.map(e =>
                `• ${e.name}: solicita ${e.requested} pero solo hay ${e.available} disponibles`
            ).join('\n');
            Toast.error(`Stock insuficiente:\n${errorMessages}`);
            return;
        }

        try {
            const company = CompanyService.getCurrent();

            // Calcular totales
            const subtotal = lines.reduce((sum, l) => sum + l.subtotal, 0);
            const iva = Math.round(subtotal * 0.19);
            const total = subtotal + iva;

            // Actualizar el pedido
            await DB.update('salesOrders', {
                ...originalOrder,
                customerId,
                date,
                notes,
                subtotal,
                iva,
                total,
                updatedAt: new Date().toISOString()
            });

            // Eliminar líneas anteriores
            const oldLines = await DB.getByIndex('salesOrderLines', 'orderId', originalOrder.id);
            for (const oldLine of oldLines) {
                await DB.delete('salesOrderLines', oldLine.id);
            }

            // Crear nuevas líneas
            for (const line of lines) {
                await DB.add('salesOrderLines', {
                    id: Helpers.generateId(),
                    orderId: originalOrder.id,
                    companyId: company.id,
                    ...line
                });
            }

            Toast.success('Pedido actualizado');
            Modal.close();
            App.navigate('ventas', 'pedidos-venta');
        } catch (err) {
            Toast.error('Error: ' + err.message);
        }
    },

    async confirmOrder(order) {
        if (order.status !== 'draft') {
            Toast.warning('Solo se pueden confirmar pedidos en borrador');
            return;
        }

        const confirm = await Modal.confirm({
            title: 'Confirmar Pedido',
            message: `¿Confirmar el pedido ${order.number}?`,
            confirmText: 'Confirmar'
        });

        if (confirm) {
            await DB.update('salesOrders', { ...order, status: 'confirmed' });
            Toast.success('Pedido confirmado');
            App.navigate('ventas', 'pedidos-venta');
        }
    },

    async deliverOrder(order) {
        if (order.status !== 'confirmed' && order.status !== 'partial') {
            Toast.warning('Solo se pueden entregar pedidos confirmados o entregados parcialmente');
            return;
        }

        const company = CompanyService.getCurrent();
        const customer = await DB.get('customers', order.customerId);
        const lines = await DB.getByIndex('salesOrderLines', 'orderId', order.id);

        let pendingLinesCount = 0;
        let htmlLines = '';

        for (const line of lines) {
            const pending = line.quantity - (line.delivered || 0);
            if (pending <= 0) continue;

            pendingLinesCount++;
            const product = await DB.get('products', line.productId);
            const prodName = product ? `${product.code} - ${product.name}` : `Producto ${line.productId}`;

            htmlLines += `
                <div class="line-item" data-line-id="${line.id}" data-product-id="${line.productId}" data-pending="${pending}" data-price="${line.price}" data-cost="${product?.cost || 0}" style="padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 1rem;">
                    <div style="font-weight: 500; margin-bottom: 0.5rem;">${prodName} <span class="badge badge-neutral" style="float: right;">Pendiente: ${pending}</span></div>
                    <div class="form-row">
                        <div class="form-group" style="flex: 1;">
                            <label class="form-label">Entregar</label>
                            <input type="number" class="form-control to-deliver" value="${pending}" min="0" step="any">
                        </div>
                    </div>
                </div>
            `;
        }

        if (pendingLinesCount === 0) {
            Toast.info('Este pedido ya fue entregado en su totalidad');
            return;
        }

        Modal.open({
            title: `Generar Guía de Despacho (Pedido ${order.number})`,
            size: 'large',
            content: `
                <div class="alert alert-info" style="margin-bottom: 1rem;">
                    Indique la cantidad a entregar. Si necesita entregar más de lo solicitado, debe generar una nueva orden de venta por el excedente.
                </div>
                <div id="delivery-lines-container">
                    ${htmlLines}
                </div>
                <div class="modal-footer" style="margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.5rem;">
                    <button class="btn btn-outline" onclick="Modal.close()">Cancelar</button>
                    <button class="btn btn-primary" id="btn-confirm-delivery"><i class="fas fa-truck"></i> Confirmar Entrega</button>
                </div>
            `
        });

        document.getElementById('btn-confirm-delivery').addEventListener('click', async () => {
            const lineItems = Array.from(document.querySelectorAll('.line-item'));
            const deliveryData = [];
            let hasErrors = false;
            let totalCost = 0;
            let totalRevenueNet = 0;

            for (const item of lineItems) {
                const pending = parseFloat(item.dataset.pending);
                const toDeliver = parseFloat(item.querySelector('.to-deliver').value) || 0;
                const price = parseFloat(item.dataset.price) || 0;
                const cost = parseFloat(item.dataset.cost) || 0;

                if (toDeliver < 0) {
                    Toast.error('La cantidad a entregar no puede ser negativa');
                    hasErrors = true;
                    break;
                }

                if (toDeliver > pending) {
                    Toast.warning(`No puede entregar más de lo solicitado. Para excedentes (${toDeliver - pending} adicionales), debe generar una nueva Orden de Venta.`);
                    hasErrors = true;
                    break;
                }

                if (toDeliver > 0) {
                    deliveryData.push({
                        lineId: item.dataset.lineId,
                        productId: item.dataset.productId,
                        pending,
                        toDeliver,
                        price,
                        cost
                    });
                    totalCost += toDeliver * cost;
                    totalRevenueNet += toDeliver * price;
                }
            }

            if (hasErrors) return;

            if (deliveryData.length === 0) {
                Toast.error('Debe entregar al menos una unidad para confirmar');
                return;
            }

            const loading = Toast.loading('Procesando entrega y generando guía...');
            try {
                // 1. Update inventory
                for (const data of deliveryData) {
                    const product = await DB.get('products', data.productId);
                    if (product && !product.isService) {
                        const newStock = Math.max(0, (product.stock || 0) - data.toDeliver);
                        await DB.update('products', { ...product, stock: newStock });

                        await DB.add('stockMovements', {
                            id: Helpers.generateId(),
                            companyId: company.id,
                            productId: data.productId,
                            type: 'out',
                            quantity: data.toDeliver,
                            unitCost: data.cost,
                            date: Helpers.getCurrentDate(),
                            reference: order.number,
                            description: `Entrega ${data.toDeliver < data.pending ? 'Parcial ' : ''}Pedido ${order.number}`,
                            createdAt: new Date().toISOString()
                        });
                    }

                    // Update SO line
                    const line = lines.find(l => l.id === data.lineId);
                    if (line) {
                        await DB.update('salesOrderLines', {
                            ...line,
                            delivered: (line.delivered || 0) + data.toDeliver
                        });
                    }
                }

                // 2. Accounting: Clientes - Facturas por Emitir & Costo de Ventas vs Ventas & Mercaderías
                const accounts = await DB.getByIndex('accounts', 'companyId', company.id);

                let inventoryAccount = accounts.find(a =>
                    a.type === 'asset' && (a.name?.toLowerCase().includes('mercader') || a.name?.toLowerCase().includes('inventario'))
                ) || accounts.find(a => a.type === 'asset' && a.code === '1.1.07');

                let bridgeAccount = accounts.find(a =>
                    a.type === 'asset' && a.name?.toLowerCase().includes('facturas por emitir')
                ) || accounts.find(a => a.code === '1.1.06');

                let costOfSalesAccount = accounts.find(a =>
                    a.type === 'expense' && (a.code?.includes('5.1.02') || a.name?.toLowerCase().includes('costo de venta'))
                );

                let salesAccount = accounts.find(a =>
                    a.type === 'revenue' && a.name?.toLowerCase().includes('venta')
                ) || accounts.find(a => a.code?.startsWith('4.1'));

                if (!inventoryAccount) {
                    inventoryAccount = { id: Helpers.generateId(), companyId: company.id, code: '1.1.07', name: 'Mercaderías', type: 'asset', nature: 'debit', level: 2, isActive: true };
                    await DB.add('accounts', inventoryAccount);
                }
                if (!bridgeAccount) {
                    bridgeAccount = { id: Helpers.generateId(), companyId: company.id, code: '1.1.06', name: 'Clientes - Facturas por Emitir', type: 'asset', nature: 'debit', level: 2, isActive: true };
                    await DB.add('accounts', bridgeAccount);
                }
                if (!costOfSalesAccount) {
                    costOfSalesAccount = { id: Helpers.generateId(), companyId: company.id, code: '5.1.02', name: 'Costo de Ventas', type: 'expense', nature: 'debit', level: 2, isActive: true };
                    await DB.add('accounts', costOfSalesAccount);
                }
                if (!salesAccount) {
                    salesAccount = { id: Helpers.generateId(), companyId: company.id, code: '4.1.01', name: 'Ventas', type: 'revenue', nature: 'credit', level: 2, isActive: true };
                    await DB.add('accounts', salesAccount);
                }

                // Crear transacción múltiple (4 líneas: 2 cargos, 2 abonos)
                const transactionData = {
                    date: Helpers.getCurrentDate(),
                    description: `Guía de Despacho s/Pedido ${order.number} - ${customer?.name || 'Cliente'}`,
                    reference: `GD-${order.number}`,
                    sourceDocument: 'salesOrder',
                    sourceDocumentId: order.id,
                    autoPost: true,
                    lines: []
                };

                if (totalRevenueNet > 0) {
                    transactionData.lines.push({ accountId: bridgeAccount.id, description: `Provisión Facturas por Emitir s/Pedido ${order.number}`, debit: totalRevenueNet, credit: 0 });
                    transactionData.lines.push({ accountId: salesAccount.id, description: `Reconocimiento Venta (Neto) s/Pedido ${order.number}`, debit: 0, credit: totalRevenueNet });
                }

                if (totalCost > 0) {
                    transactionData.lines.push({ accountId: costOfSalesAccount.id, description: `Costo mercadería vendida s/Pedido ${order.number}`, debit: totalCost, credit: 0 });
                    transactionData.lines.push({ accountId: inventoryAccount.id, description: `Salida mercadería s/Pedido ${order.number}`, debit: 0, credit: totalCost });
                }

                if (transactionData.lines.length > 0) {
                    await AccountingService.registerTransaction('sales', transactionData);
                }

                // 3. Update Order Status
                const updatedLines = await DB.getByIndex('salesOrderLines', 'orderId', order.id);
                const allDelivered = updatedLines.every(l => (l.delivered || 0) >= l.quantity);

                await DB.update('salesOrders', {
                    ...order,
                    status: allDelivered ? 'delivered' : 'partial',
                    deliveredAt: new Date().toISOString()
                });

                loading.success('Guía de Despacho generada exitosamente. Recuerde emitir la factura.');
                Modal.close();
                App.navigate('ventas', 'pedidos-venta');

            } catch (err) {
                loading.error('Error: ' + err.message);
                console.error(err);
            }
        });
    },

    async invoiceOrder(order) {
        if (order.status !== 'delivered' && order.status !== 'partial') {
            Toast.warning('Solo se pueden facturar pedidos con entregas registradas');
            return;
        }

        const lines = await DB.getByIndex('salesOrderLines', 'orderId', order.id);
        const invoiceableLines = lines.filter(l => (l.delivered || 0) > (l.invoiced || 0));

        if (invoiceableLines.length === 0) {
            Toast.info('Todas las entregas de este pedido ya han sido facturadas');
            return;
        }

        const confirm = await Modal.confirm({
            title: 'Emitir Factura',
            message: `¿Generar factura por las cantidades entregadas y no facturadas del pedido ${order.number}?`,
            confirmText: 'Generar Factura',
            confirmClass: 'btn-primary'
        });

        if (!confirm) return;

        const loading = Toast.loading('Generando factura...');
        try {
            const company = CompanyService.getCurrent();
            const customer = await DB.get('customers', order.customerId);
            const accounts = await DB.getByIndex('accounts', 'companyId', company.id);

            // Generar factura
            const invoiceNumber = await this.getNextCustomerInvoiceNumber();
            let subtotal = 0;

            const invoice = {
                id: Helpers.generateId(),
                companyId: company.id,
                customerId: order.customerId,
                salesOrderId: order.id,
                number: invoiceNumber,
                date: Helpers.getCurrentDate(),
                dueDate: Helpers.getDatePlusDays(30),
                status: 'posted',
                createdAt: new Date().toISOString()
            };

            await DB.add('customerInvoices', invoice);

            for (const line of invoiceableLines) {
                const toInvoice = (line.delivered || 0) - (line.invoiced || 0);
                const lineNeto = toInvoice * line.price;
                subtotal += lineNeto;

                await DB.add('customerInvoiceLines', {
                    id: Helpers.generateId(),
                    invoiceId: invoice.id,
                    productId: line.productId,
                    quantity: toInvoice,
                    price: line.price,
                    neto: lineNeto,
                    iva: lineNeto * 0.19,
                    total: lineNeto * 1.19
                });

                await DB.update('salesOrderLines', {
                    ...line,
                    invoiced: (line.invoiced || 0) + toInvoice
                });
            }

            const iva = subtotal * 0.19;
            const total = subtotal + iva;

            await DB.update('customerInvoices', { ...invoice, subtotal, iva, total });

            // Contabilidad: Clientes vs Clientes-Facturas por Emitir & IVA DF
            let customersAccount = accounts.find(a =>
                a.name?.toLowerCase().includes('cliente') && !a.name?.toLowerCase().includes('banco')
            ) || accounts.find(a => a.code === '1.1.03' && !a.name?.toLowerCase().includes('banco'));

            let bridgeAccount = accounts.find(a =>
                a.type === 'asset' && a.name?.toLowerCase().includes('facturas por emitir')
            ) || accounts.find(a => a.code === '1.1.06');

            let ivaDebAccount = accounts.find(a =>
                a.name?.toLowerCase().includes('iva') &&
                (a.name?.toLowerCase().includes('débito') || a.name?.toLowerCase().includes('debito'))
            ) || accounts.find(a => a.code === '2.1.02');

            if (!customersAccount) {
                customersAccount = { id: Helpers.generateId(), companyId: company.id, code: '1.1.05', name: 'Clientes por Cobrar', type: 'asset', nature: 'debit', level: 2, isActive: true };
                await DB.add('accounts', customersAccount);
            }
            if (!bridgeAccount) {
                bridgeAccount = { id: Helpers.generateId(), companyId: company.id, code: '1.1.06', name: 'Clientes - Facturas por Emitir', type: 'asset', nature: 'debit', level: 2, isActive: true };
                await DB.add('accounts', bridgeAccount);
            }
            if (!ivaDebAccount) {
                ivaDebAccount = { id: Helpers.generateId(), companyId: company.id, code: '2.1.02', name: 'IVA Débito Fiscal', type: 'liability', nature: 'credit', level: 2, isActive: true };
                await DB.add('accounts', ivaDebAccount);
            }

            const salesTransactionData = {
                date: Helpers.getCurrentDate(),
                description: `Emisión Factura ${invoiceNumber} s/Pedido ${order.number} - ${customer?.name || 'Cliente'}`,
                reference: invoiceNumber,
                sourceDocument: 'customerInvoice',
                sourceDocumentId: invoice.id,
                autoPost: true,
                lines: [
                    { accountId: customersAccount.id, description: `${customer?.name} - Fact. ${invoiceNumber}`, debit: total, credit: 0 },
                    { accountId: bridgeAccount.id, description: `Facturación de entregas s/Fact. ${invoiceNumber}`, debit: 0, credit: subtotal },
                    { accountId: ivaDebAccount.id, description: `IVA DF Fact. ${invoiceNumber}`, debit: 0, credit: iva }
                ]
            };

            await AccountingService.registerTransaction('sales', salesTransactionData);

            if (customer) {
                await DB.update('customers', { ...customer, balance: (customer.balance || 0) + total });
            }

            loading.success('Factura generada y contabilizada exitosamente');

            Modal.info({
                title: 'Facturación Completada',
                message: `La Factura N° ${invoiceNumber} fue generada por el total de las entregas pendientes ($${total.toLocaleString('es-CL')}).`,
            });
            App.navigate('ventas', 'facturas-venta');

        } catch (err) {
            loading.error('Error: ' + err.message);
        }
    },

    async initCustomerInvoices() {
        const company = CompanyService.getCurrent();
        const invoices = await DB.getByIndex('customerInvoices', 'companyId', company.id);

        for (let inv of invoices) {
            const customer = await DB.get('customers', inv.customerId);
            inv.customerName = customer?.name || 'Cliente desconocido';
        }

        DataTable.create('invoices-table', {
            columns: [
                { key: 'number', label: 'Número' },
                { key: 'date', label: 'Fecha', format: 'date' },
                { key: 'customerName', label: 'Cliente' },
                { key: 'dueDate', label: 'Vencimiento', format: 'date' },
                { key: 'total', label: 'Total', format: 'currency', class: 'text-right' },
                { key: 'status', label: 'Estado', format: 'status' }
            ],
            data: invoices,
            actions: [
                { name: 'view', label: 'Ver', icon: 'fas fa-eye', handler: (row) => this.showCustomerInvoiceDetail(row) },
                { name: 'post', label: 'Contabilizar', icon: 'fas fa-book', handler: (row) => this.postCustomerInvoice(row) }
            ],
            emptyMessage: 'No hay facturas de venta'
        });

        document.getElementById('btn-new-invoice')?.addEventListener('click', () => {
            Modal.open({
                title: 'Crear Factura de Venta',
                content: `
                    <div style="text-align: center; padding: var(--space-4);">
                        <i class="fas fa-file-invoice" style="font-size: 48px; color: var(--primary-500); margin-bottom: var(--space-4);"></i>
                        <h3>Emisión desde Pedidos</h3>
                        <p style="margin-top: var(--space-3); color: var(--neutral-600);">
                            Para crear una factura de venta, siga la secuencia documental correcta:
                        </p>
                        <ol style="text-align: left; margin-top: var(--space-4); margin-left: var(--space-6);">
                            <li>Ir a <strong>Ventas → Pedidos de Venta</strong></li>
                            <li>Registrar la entrega del pedido (Guía de Despacho)</li>
                            <li>Hacer clic en la acción <strong>"Facturar"</strong> sobre el pedido entregado.</li>
                        </ol>
                        <p style="margin-top: var(--space-4); color: var(--neutral-600);">
                            Esto permite facturar entregas parciales y mantiene la trazabilidad.
                        </p>
                    </div>
                `,
                footer: `
                    <button class="btn btn-secondary" onclick="Modal.close()">Cerrar</button>
                    <button class="btn btn-primary" onclick="Modal.close(); App.navigate('ventas', 'pedidos-venta');"><i class="fas fa-arrow-right"></i> Ir a Pedidos</button>
                `
            });
        });
    },

    async showCustomerInvoiceModal() {
        const company = CompanyService.getCurrent();
        const customers = await DB.getByIndex('customers', 'companyId', company.id);
        const products = await DB.getByIndex('products', 'companyId', company.id);

        if (customers.length === 0) {
            Toast.warning('Primero debe crear al menos un cliente');
            return;
        }

        Modal.open({
            title: 'Nueva Factura de Venta',
            size: 'large',
            content: `
                <form id="customer-invoice-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Cliente <span class="text-danger">*</span></label>
                            <select class="form-control" name="customerId" required>
                                <option value="">Seleccione cliente...</option>
                                ${customers.map(c => `<option value="${c.id}">${c.rut} - ${c.name}</option>`).join('')}
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Fecha Emisión</label>
                            <input type="date" class="form-control" name="date" value="${Helpers.getCurrentDate()}" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Fecha Vencimiento</label>
                        <input type="date" class="form-control" name="dueDate" value="${Helpers.getDatePlusDays(30)}" required>
                    </div>
                    
                    <h4 style="margin: var(--space-4) 0 var(--space-2);">Detalle</h4>
                    <div class="table-container">
                        <table class="data-table">
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
                                        <select class="form-control product-select-inv" name="productId">
                                            <option value="">Seleccione...</option>
                                            ${products.map(p => `<option value="${p.id}" data-price="${p.price}">${p.code} - ${p.name}</option>`).join('')}
                                        </select>
                                    </td>
                                    <td><input type="number" class="form-control quantity-input-inv" value="1" min="1"></td>
                                    <td><input type="number" class="form-control price-input-inv" value="0" min="0"></td>
                                    <td class="text-right iva-amount-inv">$0</td>
                                    <td class="text-right line-total-inv">$0</td>
                                    <td><button type="button" class="btn btn-icon btn-ghost remove-line-inv"><i class="fas fa-times"></i></button></td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr><td colspan="4" class="text-right">Subtotal Neto:</td><td class="text-right" id="inv-subtotal">$0</td><td></td></tr>
                                <tr><td colspan="4" class="text-right">IVA (19%):</td><td class="text-right" id="inv-iva">$0</td><td></td></tr>
                                <tr style="font-weight: 600;"><td colspan="4" class="text-right">TOTAL:</td><td class="text-right" id="inv-total">$0</td><td></td></tr>
                            </tfoot>
                        </table>
                    </div>
                    <button type="button" class="btn btn-outline" id="btn-add-inv-line" style="margin-top: var(--space-2);"><i class="fas fa-plus"></i> Agregar Línea</button>
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-outline" id="btn-save-inv-draft"><i class="fas fa-save"></i> Guardar Borrador</button>
                <button class="btn btn-primary" id="btn-save-inv-post"><i class="fas fa-book"></i> Guardar y Contabilizar</button>
            `
        });

        this.initCustomerInvoiceModalEvents(products);
    },

    initCustomerInvoiceModalEvents(products) {
        let lineIdx = 1;
        const IVA_RATE = 0.19;

        document.getElementById('btn-add-inv-line')?.addEventListener('click', () => {
            const tbody = document.getElementById('invoice-lines');
            const newRow = document.createElement('tr');
            newRow.className = 'invoice-line';
            newRow.dataset.idx = lineIdx++;
            newRow.innerHTML = `
                <td><select class="form-control product-select-inv"><option value="">Seleccione...</option>${products.map(p => `<option value="${p.id}" data-price="${p.price}">${p.code} - ${p.name}</option>`).join('')}</select></td>
                <td><input type="number" class="form-control quantity-input-inv" value="1" min="1"></td>
                <td><input type="number" class="form-control price-input-inv" value="0" min="0"></td>
                <td class="text-right iva-amount-inv">$0</td>
                <td class="text-right line-total-inv">$0</td>
                <td><button type="button" class="btn btn-icon btn-ghost remove-line-inv"><i class="fas fa-times"></i></button></td>
            `;
            tbody.appendChild(newRow);
            this.bindCustomerInvoiceLineEvents(IVA_RATE);
        });

        this.bindCustomerInvoiceLineEvents(IVA_RATE);

        document.getElementById('btn-save-inv-draft')?.addEventListener('click', () => this.saveCustomerInvoice(false));
        document.getElementById('btn-save-inv-post')?.addEventListener('click', () => this.saveCustomerInvoice(true));
    },

    bindCustomerInvoiceLineEvents(IVA_RATE) {
        document.querySelectorAll('.product-select-inv').forEach(select => {
            select.onchange = () => {
                const price = parseFloat(select.selectedOptions[0]?.dataset.price || 0);
                select.closest('tr').querySelector('.price-input-inv').value = price;
                this.updateCustomerInvoiceTotals(IVA_RATE);
            };
        });

        document.querySelectorAll('.quantity-input-inv, .price-input-inv').forEach(input => {
            input.oninput = () => this.updateCustomerInvoiceTotals(IVA_RATE);
        });

        document.querySelectorAll('.remove-line-inv').forEach(btn => {
            btn.onclick = () => {
                if (document.querySelectorAll('.invoice-line').length > 1) {
                    btn.closest('tr').remove();
                    this.updateCustomerInvoiceTotals(IVA_RATE);
                }
            };
        });
    },

    updateCustomerInvoiceTotals(IVA_RATE) {
        let subtotal = 0, totalIva = 0;
        document.querySelectorAll('.invoice-line').forEach(row => {
            const qty = parseFloat(row.querySelector('.quantity-input-inv').value) || 0;
            const price = parseFloat(row.querySelector('.price-input-inv').value) || 0;
            const neto = qty * price;
            const iva = neto * IVA_RATE;
            row.querySelector('.iva-amount-inv').textContent = Formatters.currency(iva);
            row.querySelector('.line-total-inv').textContent = Formatters.currency(neto + iva);
            subtotal += neto;
            totalIva += iva;
        });
        document.getElementById('inv-subtotal').textContent = Formatters.currency(subtotal);
        document.getElementById('inv-iva').textContent = Formatters.currency(totalIva);
        document.getElementById('inv-total').textContent = Formatters.currency(subtotal + totalIva);
    },

    async saveCustomerInvoice(autoPost) {
        const form = document.getElementById('customer-invoice-form');
        const formData = new FormData(form);
        const customerId = formData.get('customerId');

        if (!customerId) { Toast.error('Seleccione un cliente'); return; }

        const IVA_RATE = 0.19;
        const lines = [];
        let subtotal = 0, totalIva = 0;

        document.querySelectorAll('.invoice-line').forEach(row => {
            const productId = row.querySelector('.product-select-inv').value;
            const quantity = parseFloat(row.querySelector('.quantity-input-inv').value) || 0;
            const price = parseFloat(row.querySelector('.price-input-inv').value) || 0;
            if (quantity > 0 && price > 0) {
                const neto = quantity * price;
                const iva = neto * IVA_RATE;
                lines.push({ productId, quantity, price, neto, iva, total: neto + iva });
                subtotal += neto;
                totalIva += iva;
            }
        });

        if (lines.length === 0) { Toast.error('Agregue al menos una línea'); return; }

        const company = CompanyService.getCurrent();
        const customer = await DB.get('customers', customerId);
        const total = subtotal + totalIva;
        const number = await this.getNextCustomerInvoiceNumber();

        const invoice = {
            id: Helpers.generateId(),
            companyId: company.id,
            customerId,
            number,
            date: formData.get('date'),
            dueDate: formData.get('dueDate'),
            subtotal, iva: totalIva, total,
            status: autoPost ? 'posted' : 'pending',
            createdAt: new Date().toISOString()
        };

        const loading = Toast.loading(autoPost ? 'Guardando y contabilizando...' : 'Guardando...');

        try {
            await DB.add('customerInvoices', invoice);
            for (const line of lines) {
                await DB.add('customerInvoiceLines', { id: Helpers.generateId(), invoiceId: invoice.id, ...line });
            }

            if (autoPost) {
                await this.createSalesJournalEntry(invoice, customer, subtotal, totalIva, total);
            }

            loading.success(autoPost ? 'Factura contabilizada' : 'Factura guardada');
            Modal.close();
            App.navigate('ventas', 'facturas-cliente');
        } catch (err) {
            loading.error('Error: ' + err.message);
        }
    },

    async getNextCustomerInvoiceNumber() {
        const company = CompanyService.getCurrent();
        const invoices = await DB.getByIndex('customerInvoices', 'companyId', company.id);
        const year = new Date().getFullYear();
        const prefix = `FV-${year}-`;
        const nums = invoices
            .filter(i => {
                const numStr = String(i.number || '');
                return numStr.startsWith(prefix);
            })
            .map(i => parseInt(String(i.number || '').replace(prefix, '')) || 0);
        return `${prefix}${String(Math.max(0, ...nums) + 1).padStart(4, '0')}`;
    },

    async createSalesJournalEntry(invoice, customer, subtotal, iva, total) {
        const company = CompanyService.getCurrent();
        const accounts = await DB.getByIndex('accounts', 'companyId', company.id);

        // Buscar cuentas - priorizar por nombre para evitar confusiones
        let customersAccount = accounts.find(a =>
            a.name?.toLowerCase().includes('cliente') &&
            !a.name?.toLowerCase().includes('banco')
        ) || accounts.find(a => a.code === '1.1.05');

        let salesAccount = accounts.find(a =>
            a.type === 'revenue' && a.name?.toLowerCase().includes('venta')
        ) || accounts.find(a => a.code?.startsWith('4.1'));

        let ivaDebAccount = accounts.find(a =>
            a.name?.toLowerCase().includes('iva') &&
            (a.name?.toLowerCase().includes('débito') || a.name?.toLowerCase().includes('debito'))
        ) || accounts.find(a => a.code === '2.1.02');

        if (!customersAccount) { customersAccount = { id: Helpers.generateId(), companyId: company.id, code: '1.1.05', name: 'Clientes por Cobrar', type: 'asset', nature: 'debit', level: 2, isActive: true }; await DB.add('accounts', customersAccount); }
        if (!salesAccount) { salesAccount = { id: Helpers.generateId(), companyId: company.id, code: '4.1.01', name: 'Ventas', type: 'revenue', nature: 'credit', level: 2, isActive: true }; await DB.add('accounts', salesAccount); }
        if (!ivaDebAccount) { ivaDebAccount = { id: Helpers.generateId(), companyId: company.id, code: '2.1.02', name: 'IVA Débito Fiscal', type: 'liability', nature: 'credit', level: 2, isActive: true }; await DB.add('accounts', ivaDebAccount); }

        // Preparar datos del asiento
        const transactionData = {
            date: invoice.date,
            description: `Factura ${invoice.number} - ${customer?.name}`,
            reference: invoice.number,
            sourceDocument: 'customerInvoice',
            sourceDocumentId: invoice.id,
            autoPost: true,  // Contabilizar automáticamente
            lines: [
                { accountId: customersAccount.id, description: `${customer?.name} - Fact. ${invoice.number}`, debit: total, credit: 0 },
                { accountId: salesAccount.id, description: `Ventas Fact. ${invoice.number}`, debit: 0, credit: subtotal },
                { accountId: ivaDebAccount.id, description: `IVA DF Fact. ${invoice.number}`, debit: 0, credit: iva }
            ]
        };

        // Usar el sistema dual: registerTransaction decide si va al Libro Diario o Libro Auxiliar
        // según la configuración de la empresa (jornalizador vs centralizador)
        await AccountingService.registerTransaction('sales', transactionData);

        // Actualizar saldo del cliente
        if (customer) {
            await DB.update('customers', { ...customer, balance: (customer.balance || 0) + total });
        }
    },

    async showCustomerInvoiceDetail(invoice) {
        const customer = await DB.get('customers', invoice.customerId);
        const lines = await DB.getByIndex('customerInvoiceLines', 'invoiceId', invoice.id);

        // Cargar nombres de productos
        for (let line of lines) {
            const product = await DB.get('products', line.productId);
            line.productName = product?.name || 'Producto';
            line.productCode = product?.code || '';
        }

        const statusLabels = { pending: 'Pendiente', posted: 'Contabilizada', paid: 'Pagada' };
        const statusClass = { pending: 'warning', posted: 'info', paid: 'success' };

        Modal.open({
            title: `Factura ${invoice.number}`,
            size: 'large',
            content: `
                <div class="invoice-detail">
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-4);">
                        <div>
                            <p><strong>Cliente:</strong> ${customer?.name || 'Cliente'}</p>
                            <p><strong>RUT:</strong> ${customer?.rut || '-'}</p>
                        </div>
                        <div style="text-align: right;">
                            <p><strong>Fecha:</strong> ${Formatters.date(invoice.date)}</p>
                            <p><strong>Vencimiento:</strong> ${Formatters.date(invoice.dueDate)}</p>
                            <p><span class="badge badge-${statusClass[invoice.status]}">${statusLabels[invoice.status]}</span></p>
                        </div>
                    </div>
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Producto</th>
                                <th class="text-right">Cantidad</th>
                                <th class="text-right">Precio</th>
                                <th class="text-right">Neto</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lines.map(l => `
                                <tr>
                                    <td><code>${l.productCode}</code></td>
                                    <td>${l.productName}</td>
                                    <td class="text-right">${l.quantity}</td>
                                    <td class="text-right">${Formatters.currency(l.price)}</td>
                                    <td class="text-right">${Formatters.currency(l.neto || l.quantity * l.price)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="4" class="text-right">Neto:</td>
                                <td class="text-right">${Formatters.currency(invoice.subtotal || 0)}</td>
                            </tr>
                            <tr>
                                <td colspan="4" class="text-right">IVA (19%):</td>
                                <td class="text-right">${Formatters.currency(invoice.iva || 0)}</td>
                            </tr>
                            <tr style="font-weight: 700; font-size: 1.1em;">
                                <td colspan="4" class="text-right">TOTAL:</td>
                                <td class="text-right">${Formatters.currency(invoice.total)}</td>
                            </tr>
                        </tfoot>
                    </table>
                    ${invoice.salesOrderId ? `<p style="margin-top: var(--space-3);"><small>Generada desde pedido de venta</small></p>` : ''}
                </div>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cerrar</button>
                ${invoice.status === 'posted' ? `<button class="btn btn-success" onclick="Modal.close(); VentasModule.collectCustomerInvoice(VentasModule._currentInvoice);"><i class="fas fa-money-bill"></i> Cobrar</button>` : ''}
            `
        });

        this._currentInvoice = invoice;
    },

    async postCustomerInvoice(invoice) {
        if (invoice.status !== 'pending') {
            Toast.warning('Esta factura ya está contabilizada');
            return;
        }

        const customer = await DB.get('customers', invoice.customerId);
        const subtotal = invoice.subtotal || invoice.total / 1.19;
        const iva = invoice.iva || invoice.total - subtotal;

        await this.createSalesJournalEntry(invoice, customer, subtotal, iva, invoice.total);
        await DB.update('customerInvoices', { ...invoice, status: 'posted' });

        Toast.success('Factura contabilizada');
        App.navigate('ventas', 'facturas-cliente');
    },

    async collectCustomerInvoice(invoice) {
        if (invoice.status === 'pending') {
            Toast.warning('Primero debe contabilizar la factura');
            return;
        }
        if (invoice.status === 'paid') {
            Toast.warning('Esta factura ya está pagada');
            return;
        }

        const customer = await DB.get('customers', invoice.customerId);
        const company = CompanyService.getCurrent();
        const accounts = await DB.getByIndex('accounts', 'companyId', company.id);

        // Buscar cuentas de pago
        const bankAccounts = accounts.filter(a =>
            a.type === 'asset' && (a.code?.startsWith('1.1.01') || a.code?.startsWith('1.1.02') ||
                a.name?.toLowerCase().includes('banco') || a.name?.toLowerCase().includes('caja'))
        );

        Modal.open({
            title: `Cobrar Factura ${invoice.number}`,
            content: `
                <form id="collect-form">
                    <div class="alert alert-info" style="margin-bottom: var(--space-4);">
                        <strong>Cliente:</strong> ${customer?.name || 'Cliente'}<br>
                        <strong>Total a cobrar:</strong> ${Formatters.currency(invoice.total)}
                    </div>
                    <div class="form-group">
                        <label class="form-label">Fecha de Cobro</label>
                        <input type="date" class="form-control" name="paymentDate" value="${Helpers.getCurrentDate()}" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Cuenta de Ingreso</label>
                        <select class="form-control" name="paymentAccountId" required>
                            ${bankAccounts.length > 0 ?
                    bankAccounts.map(a => `<option value="${a.id}">${a.code} - ${a.name}</option>`).join('') :
                    `<option value="__create_bank__">Banco (crear automáticamente)</option>
                                 <option value="__create_cash__">Caja (crear automáticamente)</option>`
                }
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Referencia / N° Operación</label>
                        <input type="text" class="form-control" name="reference" placeholder="N° transferencia, cheque, etc.">
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-success" id="btn-confirm-collect"><i class="fas fa-check"></i> Confirmar Cobro</button>
            `
        });

        document.getElementById('btn-confirm-collect')?.addEventListener('click', async () => {
            const form = document.getElementById('collect-form');
            const formData = new FormData(form);

            const paymentDate = formData.get('paymentDate');
            let paymentAccountId = formData.get('paymentAccountId');
            const reference = formData.get('reference');

            const loading = Toast.loading('Procesando cobro...');

            try {
                // Crear cuenta si es necesario
                if (paymentAccountId === '__create_bank__') {
                    const newAccount = { id: Helpers.generateId(), companyId: company.id, code: '1.1.01', name: 'Banco', type: 'asset', nature: 'debit', level: 2, isActive: true };
                    await DB.add('accounts', newAccount);
                    paymentAccountId = newAccount.id;
                } else if (paymentAccountId === '__create_cash__') {
                    const newAccount = { id: Helpers.generateId(), companyId: company.id, code: '1.1.02', name: 'Caja', type: 'asset', nature: 'debit', level: 2, isActive: true };
                    await DB.add('accounts', newAccount);
                    paymentAccountId = newAccount.id;
                }

                // Buscar cuenta de clientes (por cobrar)
                let customersAccount = accounts.find(a =>
                    a.name?.toLowerCase().includes('cliente') &&
                    !a.name?.toLowerCase().includes('banco')
                ) || accounts.find(a => a.code === '1.1.05');

                if (!customersAccount) {
                    customersAccount = { id: Helpers.generateId(), companyId: company.id, code: '1.1.05', name: 'Clientes por Cobrar', type: 'asset', nature: 'debit', level: 2, isActive: true };
                    await DB.add('accounts', customersAccount);
                }

                // Crear asiento de cobro
                const entryNumber = await AccountingService.getNextEntryNumber();
                const entry = {
                    id: Helpers.generateId(),
                    companyId: company.id,
                    number: entryNumber,
                    date: paymentDate,
                    description: `Cobro Factura ${invoice.number} - ${customer?.name || 'Cliente'}`,
                    reference: reference || `COB-${invoice.number}`,
                    status: 'posted',
                    totalDebit: invoice.total,
                    totalCredit: invoice.total,
                    createdAt: new Date().toISOString()
                };

                await DB.add('journalEntries', entry);

                // Débito: Banco/Caja (entra el dinero)
                await DB.add('journalLines', {
                    id: Helpers.generateId(),
                    entryId: entry.id,
                    accountId: paymentAccountId,
                    description: `Cobro Fact. ${invoice.number}`,
                    debit: invoice.total,
                    credit: 0
                });

                // Crédito: Clientes (se reduce la cuenta por cobrar)
                await DB.add('journalLines', {
                    id: Helpers.generateId(),
                    entryId: entry.id,
                    accountId: customersAccount.id,
                    description: `Cobro de ${customer?.name || 'Cliente'}`,
                    debit: 0,
                    credit: invoice.total
                });

                // Actualizar factura
                await DB.update('customerInvoices', {
                    ...invoice,
                    status: 'paid',
                    paidAt: new Date().toISOString(),
                    paymentReference: reference
                });

                // Actualizar saldo del cliente
                if (customer) {
                    await DB.update('customers', {
                        ...customer,
                        balance: Math.max(0, (customer.balance || 0) - invoice.total)
                    });
                }

                Modal.close();
                loading.success(`Cobro registrado: ${Formatters.currency(invoice.total)}`);
                App.navigate('ventas', 'facturas-cliente');

            } catch (err) {
                loading.error('Error: ' + err.message);
            }
        });
    },

    /**
     * Anular un pedido de venta
     */
    async cancelSalesOrder(order) {
        if (order.status === 'cancelled') {
            Toast.warning('Este pedido ya está anulado');
            return;
        }

        const wasDelivered = order.status === 'delivered';

        let message = `¿Está seguro de anular el pedido ${order.number}?`;
        if (wasDelivered) {
            message += `\n\n⚠️ Este pedido ya fue entregado. Al anularlo:\n• Se restaurará el stock\n• Se anularán los asientos contables\n• Se anulará la factura asociada`;
        }

        const confirm = await Modal.confirm({
            title: 'Anular Pedido de Venta',
            message: message,
            confirmText: 'Anular Pedido',
            confirmClass: 'btn-danger'
        });

        if (!confirm) return;

        const loading = Toast.loading('Anulando pedido...');

        try {
            const company = CompanyService.getCurrent();

            if (wasDelivered) {
                // 1. Restaurar stock
                const lines = await DB.getByIndex('salesOrderLines', 'orderId', order.id);
                for (const line of lines) {
                    const product = await DB.get('products', line.productId);
                    if (product && !product.isService) {
                        await DB.update('products', {
                            ...product,
                            stock: (product.stock || 0) + line.quantity
                        });

                        // Registrar movimiento de entrada (reversión)
                        await DB.add('stockMovements', {
                            id: Helpers.generateId(),
                            companyId: company.id,
                            productId: line.productId,
                            type: 'in',
                            quantity: line.quantity,
                            reference: `ANULACIÓN ${order.number}`,
                            date: Helpers.getCurrentDate(),
                            notes: `Reversión por anulación de pedido ${order.number}`,
                            createdAt: new Date().toISOString()
                        });
                    }
                }

                // 2. Anular asientos contables relacionados
                const entries = await DB.getByIndex('journalEntries', 'companyId', company.id);
                const relatedEntries = entries.filter(e => e.reference === order.number || e.reference === order.invoiceNumber);

                for (const entry of relatedEntries) {
                    // Crear asiento de reversión
                    const originalLines = await DB.getByIndex('journalLines', 'entryId', entry.id);
                    const reversalNumber = await AccountingService.getNextEntryNumber();

                    const reversalEntry = {
                        id: Helpers.generateId(),
                        companyId: company.id,
                        number: reversalNumber,
                        date: Helpers.getCurrentDate(),
                        description: `ANULACIÓN: ${entry.description}`,
                        reference: `ANUL-${entry.reference}`,
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
                            description: `Reversión: ${line.description}`,
                            debit: line.credit,
                            credit: line.debit
                        });
                    }

                    // Marcar asiento original como anulado
                    await DB.update('journalEntries', { ...entry, status: 'cancelled' });
                }

                // 3. Anular factura si existe
                if (order.invoiceId) {
                    const invoice = await DB.get('customerInvoices', order.invoiceId);
                    if (invoice) {
                        await DB.update('customerInvoices', { ...invoice, status: 'cancelled' });

                        // Revertir saldo del cliente si estaba contabilizado
                        if (invoice.status === 'posted' || invoice.status === 'paid') {
                            const customer = await DB.get('customers', order.customerId);
                            if (customer) {
                                await DB.update('customers', {
                                    ...customer,
                                    balance: Math.max(0, (customer.balance || 0) - invoice.total)
                                });
                            }
                        }
                    }
                }
            }

            // Actualizar estado del pedido
            await DB.update('salesOrders', {
                ...order,
                status: 'cancelled',
                cancelledAt: new Date().toISOString()
            });

            loading.success(`Pedido ${order.number} anulado`);
            App.navigate('ventas', 'pedidos-venta');

        } catch (err) {
            loading.error('Error al anular: ' + err.message);
            console.error(err);
        }
    }
};

window.VentasModule = VentasModule;
