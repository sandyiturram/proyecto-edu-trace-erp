/**
 * EduERP - Inventario Module
 * Módulo de Gestión de Inventario (WM)
 */

const InventarioModule = {
    currentView: 'productos',

    async render(view = 'productos') {
        this.currentView = view;

        switch (view) {
            case 'productos': return await this.renderProducts();
            case 'movimientos-stock': return await this.renderStockMovements();
            case 'valoracion': return await this.renderValuation();
            default: return '<p>Vista no encontrada</p>';
        }
    },

    async renderProducts() {
        return `
            <div class="page-header">
                <h1 class="page-title">Productos</h1>
                <p class="page-subtitle">Catálogo de productos y servicios</p>
            </div>
            <div class="toolbar">
                <div class="toolbar-left">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input type="text" class="form-control" placeholder="Buscar producto..." id="search-products">
                    </div>
                    <select class="form-control" id="filter-category" style="width: 150px;">
                        <option value="">Todas las categorías</option>
                    </select>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-outline" id="btn-import-products">
                        <i class="fas fa-upload"></i> Importar
                    </button>
                    <button class="btn btn-primary" id="btn-new-product">
                        <i class="fas fa-plus"></i> Nuevo Producto
                    </button>
                </div>
            </div>
            <div id="products-table"></div>
        `;
    },

    async renderStockMovements() {
        return `
            <div class="page-header">
                <h1 class="page-title">Movimientos de Stock</h1>
                <p class="page-subtitle">Registro de entradas y salidas de inventario</p>
            </div>
            <div class="toolbar">
                <div class="toolbar-left">
                    <input type="date" class="form-control" id="filter-date-from">
                    <input type="date" class="form-control" id="filter-date-to">
                    <select class="form-control" id="filter-type" style="width: 150px;">
                        <option value="">Todos</option>
                        <option value="in">Entradas</option>
                        <option value="out">Salidas</option>
                        <option value="adjustment">Ajustes</option>
                    </select>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-outline" id="btn-adjustment">
                        <i class="fas fa-balance-scale"></i> Ajuste de Inventario
                    </button>
                </div>
            </div>
            <div id="movements-table"></div>
        `;
    },

    async renderValuation() {
        return `
            <div class="page-header">
                <h1 class="page-title">Valorización de Inventario</h1>
                <p class="page-subtitle">Valoración del stock según método contable</p>
            </div>
            <div class="toolbar">
                <div class="toolbar-left">
                    <input type="date" class="form-control" id="valuation-date" value="${Helpers.getCurrentDate()}">
                    <select class="form-control" id="valuation-method" style="width: 180px;">
                        <option value="promedio">Costo Promedio</option>
                        <option value="fifo">FIFO (PEPS)</option>
                        <option value="lifo">LIFO (UEPS)</option>
                    </select>
                    <button class="btn btn-primary" id="btn-calculate">
                        <i class="fas fa-calculator"></i> Calcular
                    </button>
                </div>
                <div class="toolbar-right">
                    <button class="btn btn-outline" id="btn-export-valuation">
                        <i class="fas fa-file-excel"></i> Exportar
                    </button>
                </div>
            </div>
            <div id="valuation-content">
                ${await this.renderValuationTable()}
            </div>
        `;
    },

    async renderValuationTable(method = 'promedio') {
        const company = CompanyService.getCurrent();
        if (!company) return '';

        const products = await DB.getByIndex('products', 'companyId', company.id);
        const physicalProducts = products.filter(p => !p.isService && (p.stock || 0) > 0);
        const movements = await DB.getByIndex('stockMovements', 'companyId', company.id);

        // Calcular costo unitario según método
        const valuatedProducts = await Promise.all(physicalProducts.map(async (p) => {
            const productMovements = movements
                .filter(m => m.productId === p.id)
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            // Costo base del producto (siempre como fallback)
            const baseCost = p.cost || 0;
            let unitCost = baseCost;

            // Obtener solo movimientos de entrada
            const entries = productMovements.filter(m => m.type === 'in');

            if (method === 'promedio') {
                // Costo Promedio Ponderado
                if (entries.length > 0) {
                    const totalCost = entries.reduce((sum, m) => sum + (m.quantity * (m.unitCost || baseCost)), 0);
                    const totalQty = entries.reduce((sum, m) => sum + m.quantity, 0);
                    unitCost = totalQty > 0 ? totalCost / totalQty : baseCost;
                }
            } else if (method === 'fifo') {
                // FIFO: Primera Entrada, Primera Salida
                // El inventario restante tiene el costo de las ÚLTIMAS compras
                if (entries.length > 0) {
                    const reversedEntries = [...entries].reverse(); // Últimas compras primero
                    let remainingQty = p.stock || 0;
                    let totalCost = 0;

                    for (const entry of reversedEntries) {
                        if (remainingQty <= 0) break;
                        const entryQty = entry.quantity || 0;
                        const entryCost = entry.unitCost || baseCost;
                        const qtyToUse = Math.min(remainingQty, entryQty);
                        totalCost += qtyToUse * entryCost;
                        remainingQty -= qtyToUse;
                    }

                    // Si aún queda stock sin asignar, usar costo base
                    if (remainingQty > 0) {
                        totalCost += remainingQty * baseCost;
                    }

                    unitCost = (p.stock || 0) > 0 ? totalCost / p.stock : baseCost;
                }
            } else if (method === 'lifo') {
                // LIFO: Última Entrada, Primera Salida  
                // El inventario restante tiene el costo de las PRIMERAS compras
                if (entries.length > 0) {
                    let remainingQty = p.stock || 0;
                    let totalCost = 0;

                    for (const entry of entries) { // Primeras compras primero
                        if (remainingQty <= 0) break;
                        const entryQty = entry.quantity || 0;
                        const entryCost = entry.unitCost || baseCost;
                        const qtyToUse = Math.min(remainingQty, entryQty);
                        totalCost += qtyToUse * entryCost;
                        remainingQty -= qtyToUse;
                    }

                    // Si aún queda stock sin asignar, usar costo base
                    if (remainingQty > 0) {
                        totalCost += remainingQty * baseCost;
                    }

                    unitCost = (p.stock || 0) > 0 ? totalCost / p.stock : baseCost;
                }
            }

            return {
                ...p,
                valuatedCost: unitCost,
                totalValue: (p.stock || 0) * unitCost
            };
        }));

        const totalValue = valuatedProducts.reduce((sum, p) => sum + p.totalValue, 0);
        const totalUnits = valuatedProducts.reduce((sum, p) => sum + (p.stock || 0), 0);

        const methodNames = {
            promedio: 'Costo Promedio Ponderado',
            fifo: 'FIFO (Primera Entrada, Primera Salida)',
            lifo: 'LIFO (Última Entrada, Primera Salida)'
        };

        return `
            <div class="alert alert-info" style="margin-bottom: var(--space-4);">
                <i class="fas fa-info-circle"></i> 
                <strong>Método:</strong> ${methodNames[method] || method}
            </div>
            <div class="dashboard-grid" style="margin-bottom: var(--space-4);">
                <div class="kpi-card">
                    <div class="kpi-header">
                        <div class="kpi-icon primary"><i class="fas fa-boxes"></i></div>
                    </div>
                    <div class="kpi-value">${valuatedProducts.length}</div>
                    <div class="kpi-label">Productos en Stock</div>
                </div>
                <div class="kpi-card">
                    <div class="kpi-header">
                        <div class="kpi-icon success"><i class="fas fa-cubes"></i></div>
                    </div>
                    <div class="kpi-value">${Formatters.number(totalUnits)}</div>
                    <div class="kpi-label">Unidades Totales</div>
                </div>
                <div class="kpi-card span-2">
                    <div class="kpi-header">
                        <div class="kpi-icon warning"><i class="fas fa-dollar-sign"></i></div>
                    </div>
                    <div class="kpi-value">${Formatters.currency(totalValue)}</div>
                    <div class="kpi-label">Valor Total del Inventario</div>
                </div>
            </div>
            <div class="card">
                <div class="card-body" style="padding: 0;">
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Producto</th>
                                    <th>Categoría</th>
                                    <th class="text-right">Stock</th>
                                    <th class="text-right">Costo Unit. (${method.toUpperCase()})</th>
                                    <th class="text-right">Valor Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${valuatedProducts.length === 0 ? `
                                    <tr><td colspan="6" class="table-empty">No hay productos con stock</td></tr>
                                ` : valuatedProducts.map(p => `
                                    <tr>
                                        <td><code>${p.code}</code></td>
                                        <td>${p.name}</td>
                                        <td><span class="badge badge-neutral">${p.category || '-'}</span></td>
                                        <td class="text-right">${Formatters.number(p.stock || 0)} ${p.unit || 'UN'}</td>
                                        <td class="text-right">${Formatters.currency(p.valuatedCost)}</td>
                                        <td class="text-right" style="font-weight: 600;">${Formatters.currency(p.totalValue)}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                            <tfoot>
                                <tr style="font-weight: 700; background: var(--neutral-100);">
                                    <td colspan="5">TOTAL VALORIZACIÓN (${methodNames[method]})</td>
                                    <td class="text-right">${Formatters.currency(totalValue)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        `;
    },

    async init(view) {
        const company = CompanyService.getCurrent();
        if (!company) return;

        switch (view) {
            case 'productos': await this.initProducts(); break;
            case 'movimientos-stock': await this.initStockMovements(); break;
            case 'valoracion': this.initValuation(); break;
        }
    },

    async initProducts() {
        const company = CompanyService.getCurrent();
        const products = await DB.getByIndex('products', 'companyId', company.id);

        // Obtener categorías únicas
        const categories = [...new Set(products.map(p => p.category).filter(c => c))].sort();
        const categorySelect = document.getElementById('filter-category');
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Todas las categorías</option>' +
                categories.map(c => `<option value="${c}">${c}</option>`).join('');
        }

        // Guardar productos para filtrado
        this.allProducts = products;

        this.renderProductsTable(products);

        document.getElementById('btn-new-product')?.addEventListener('click', () => this.showProductModal());
        document.getElementById('btn-import-products')?.addEventListener('click', () => this.importProducts());

        // Filtro de búsqueda
        document.getElementById('search-products')?.addEventListener('input', (e) => {
            this.filterProducts();
        });

        // Filtro de categoría
        document.getElementById('filter-category')?.addEventListener('change', (e) => {
            this.filterProducts();
        });
    },

    filterProducts() {
        const search = (document.getElementById('search-products')?.value || '').toLowerCase();
        const category = document.getElementById('filter-category')?.value || '';

        let filtered = this.allProducts || [];

        if (search) {
            filtered = filtered.filter(p =>
                p.code?.toLowerCase().includes(search) ||
                p.name?.toLowerCase().includes(search) ||
                p.category?.toLowerCase().includes(search)
            );
        }

        if (category) {
            filtered = filtered.filter(p => p.category === category);
        }

        this.renderProductsTable(filtered);
    },

    renderProductsTable(products) {
        DataTable.create('products-table', {
            columns: [
                { key: 'code', label: 'Código' },
                { key: 'name', label: 'Nombre' },
                { key: 'category', label: 'Categoría' },
                { key: 'stock', label: 'Stock', class: 'text-right', render: (v, row) => row.isService ? '-' : Formatters.number(v || 0) },
                { key: 'cost', label: 'Costo', format: 'currency', class: 'text-right' },
                { key: 'price', label: 'Precio', format: 'currency', class: 'text-right' },
                {
                    key: 'margin', label: 'Margen', class: 'text-right', render: (v, row) => {
                        if (!row.price || row.price === 0) return '-';
                        const margin = ((row.price - row.cost) / row.price * 100);
                        return `<span class="${margin > 0 ? 'positive' : 'negative'}">${margin.toFixed(1)}%</span>`;
                    }
                }
            ],
            data: products,
            actions: [
                { name: 'edit', label: 'Editar', icon: 'fas fa-edit', handler: (row) => this.showProductModal(row.id) },
                { name: 'delete', label: 'Eliminar', icon: 'fas fa-trash', handler: (row) => this.deleteProduct(row.id) }
            ],
            emptyMessage: 'No hay productos registrados'
        });
    },

    async showProductModal(productId = null) {
        const isEdit = !!productId;
        let data = {};
        const company = CompanyService.getCurrent();

        if (isEdit) {
            data = await DB.get('products', productId);
        }

        // Obtener categorías existentes
        const allProducts = await DB.getByIndex('products', 'companyId', company.id);
        const categories = [...new Set(allProducts.map(p => p.category).filter(c => c))].sort();

        // Agregar categorías predefinidas si no existen
        const defaultCategories = ['Tecnología', 'Oficina', 'Materiales', 'Servicios', 'Otros'];
        defaultCategories.forEach(cat => {
            if (!categories.includes(cat)) categories.push(cat);
        });
        categories.sort();

        Modal.open({
            title: isEdit ? 'Editar Producto' : 'Nuevo Producto',
            content: `
                <form id="product-form">
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Código <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="code" placeholder="PROD001" value="${data.code || ''}" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Nombre <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" name="name" placeholder="Nombre del producto" value="${data.name || ''}" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Categoría</label>
                            <div style="display: flex; gap: var(--space-2);">
                                <select class="form-control" name="category" id="category-select" style="flex: 1;">
                                    <option value="">Sin categoría</option>
                                    ${categories.map(c => `<option value="${c}" ${data.category === c ? 'selected' : ''}>${c}</option>`).join('')}
                                    <option value="__new__">+ Agregar nueva...</option>
                                </select>
                            </div>
                            <input type="text" class="form-control" id="new-category-input" placeholder="Nueva categoría..." style="margin-top: var(--space-2); display: none;">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Unidad</label>
                            <select class="form-control" name="unit">
                                <option value="UN" ${(data.unit || 'UN') === 'UN' ? 'selected' : ''}>UN - Unidad</option>
                                <option value="KG" ${data.unit === 'KG' ? 'selected' : ''}>KG - Kilogramo</option>
                                <option value="LT" ${data.unit === 'LT' ? 'selected' : ''}>LT - Litro</option>
                                <option value="MT" ${data.unit === 'MT' ? 'selected' : ''}>MT - Metro</option>
                                <option value="CJ" ${data.unit === 'CJ' ? 'selected' : ''}>CJ - Caja</option>
                                <option value="PQ" ${data.unit === 'PQ' ? 'selected' : ''}>PQ - Paquete</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Costo <span class="text-danger">*</span></label>
                            <input type="number" class="form-control" name="cost" value="${data.cost || 0}" min="0" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Precio de Venta <span class="text-danger">*</span></label>
                            <input type="number" class="form-control" name="price" value="${data.price || 0}" min="0" step="0.01" required>
                        </div>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label class="form-label">Stock Inicial</label>
                            <input type="number" class="form-control" name="stock" value="${data.stock || 0}" min="0">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Stock Mínimo</label>
                            <input type="number" class="form-control" name="minStock" value="${data.minStock || 0}" min="0">
                        </div>
                    </div>
                    <div class="form-group">
                        <label class="form-check">
                            <input type="checkbox" name="isService" ${data.isService ? 'checked' : ''}>
                            <span>Es un servicio (sin control de stock)</span>
                        </label>
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-primary" id="btn-save-product"><i class="fas fa-save"></i> Guardar</button>
            `
        });

        // Mostrar/ocultar input de nueva categoría
        document.getElementById('category-select')?.addEventListener('change', (e) => {
            const newCatInput = document.getElementById('new-category-input');
            if (e.target.value === '__new__') {
                newCatInput.style.display = 'block';
                newCatInput.focus();
            } else {
                newCatInput.style.display = 'none';
            }
        });

        // Guardar producto
        document.getElementById('btn-save-product')?.addEventListener('click', async () => {
            const form = document.getElementById('product-form');
            const formData = new FormData(form);

            const code = formData.get('code');
            const name = formData.get('name');

            if (!code) { Toast.error('El código es requerido'); return; }
            if (!name) { Toast.error('El nombre es requerido'); return; }

            let category = formData.get('category');
            if (category === '__new__') {
                category = document.getElementById('new-category-input').value;
            }

            const productData = {
                code,
                name,
                category,
                unit: formData.get('unit'),
                cost: parseFloat(formData.get('cost')) || 0,
                price: parseFloat(formData.get('price')) || 0,
                stock: parseInt(formData.get('stock')) || 0,
                minStock: parseInt(formData.get('minStock')) || 0,
                isService: formData.get('isService') === 'on'
            };

            try {
                if (isEdit) {
                    await DB.update('products', { ...data, ...productData });
                    Toast.success('Producto actualizado');
                } else {
                    await DB.add('products', { companyId: company.id, ...productData, status: 'active' });
                    Toast.success('Producto creado');
                }
                Modal.close();
                App.navigate('inventario', 'productos');
            } catch (err) {
                Toast.error('Error: ' + err.message);
            }
        });
    },

    async deleteProduct(id) {
        const confirm = await Modal.confirm({
            title: 'Eliminar Producto',
            message: '¿Está seguro de eliminar este producto?',
            confirmText: 'Eliminar',
            confirmClass: 'btn-danger'
        });

        if (confirm) {
            await DB.delete('products', id);
            Toast.success('Producto eliminado');
            App.navigate('inventario', 'productos');
        }
    },

    async initStockMovements() {
        const company = CompanyService.getCurrent();
        const allMovements = await DB.getByIndex('stockMovements', 'companyId', company.id);

        // Cargar nombres de productos
        for (let mov of allMovements) {
            const product = await DB.get('products', mov.productId);
            mov.productName = product?.name || 'Producto eliminado';
            mov.productCode = product?.code || '-';
        }

        // Ordenar por fecha descendente
        allMovements.sort((a, b) => new Date(b.date) - new Date(a.date));

        // Guardar referencia para los filtros
        this.stockMovements = allMovements;

        // Función para aplicar filtros
        const self = this;
        const applyFilters = function () {
            const dateFrom = document.getElementById('filter-date-from')?.value || '';
            const dateTo = document.getElementById('filter-date-to')?.value || '';
            const typeFilter = document.getElementById('filter-type')?.value || '';

            let filteredMovements = [...self.stockMovements];

            if (dateFrom) {
                filteredMovements = filteredMovements.filter(m => m.date >= dateFrom);
            }
            if (dateTo) {
                filteredMovements = filteredMovements.filter(m => m.date <= dateTo);
            }
            if (typeFilter) {
                filteredMovements = filteredMovements.filter(m => m.type === typeFilter);
            }

            DataTable.create('movements-table', {
                columns: [
                    { key: 'date', label: 'Fecha', format: 'date' },
                    { key: 'productCode', label: 'Código' },
                    { key: 'productName', label: 'Producto' },
                    {
                        key: 'type', label: 'Tipo', render: (v) => {
                            const types = { in: 'Entrada', out: 'Salida', adjustment: 'Ajuste' };
                            const classes = { in: 'success', out: 'error', adjustment: 'warning' };
                            return `<span class="badge badge-${classes[v] || 'neutral'}">${types[v] || v}</span>`;
                        }
                    },
                    {
                        key: 'quantity', label: 'Cantidad', class: 'text-right',
                        render: (v, row) => {
                            const sign = row.type === 'in' ? '+' : (row.type === 'out' ? '-' : '');
                            const color = row.type === 'in' ? 'color: var(--success-500)' : (row.type === 'out' ? 'color: var(--error-500)' : '');
                            return `<span style="${color}; font-weight: 600;">${sign}${v}</span>`;
                        }
                    },
                    { key: 'reference', label: 'Referencia' },
                    { key: 'description', label: 'Descripción' }
                ],
                data: filteredMovements,
                emptyMessage: 'No hay movimientos de stock'
            });
        };

        // Renderizar tabla inicial
        applyFilters();

        // Agregar event listeners a los filtros
        const filterDateFrom = document.getElementById('filter-date-from');
        const filterDateTo = document.getElementById('filter-date-to');
        const filterType = document.getElementById('filter-type');

        if (filterDateFrom) {
            filterDateFrom.removeEventListener('change', filterDateFrom._handler);
            filterDateFrom._handler = applyFilters;
            filterDateFrom.addEventListener('change', applyFilters);
        }
        if (filterDateTo) {
            filterDateTo.removeEventListener('change', filterDateTo._handler);
            filterDateTo._handler = applyFilters;
            filterDateTo.addEventListener('change', applyFilters);
        }
        if (filterType) {
            filterType.removeEventListener('change', filterType._handler);
            filterType._handler = applyFilters;
            filterType.addEventListener('change', applyFilters);
        }

        document.getElementById('btn-adjustment')?.addEventListener('click', () => {
            this.showAdjustmentModal();
        });
    },

    async showAdjustmentModal() {
        const company = CompanyService.getCurrent();
        const products = await DB.getByIndex('products', 'companyId', company.id);
        const physicalProducts = products.filter(p => !p.isService);

        if (physicalProducts.length === 0) {
            Toast.warning('No hay productos físicos para ajustar');
            return;
        }

        Modal.open({
            title: 'Ajuste de Inventario',
            content: `
                <form id="adjustment-form">
                    <div class="form-group">
                        <label class="form-label">Producto <span class="text-danger">*</span></label>
                        <select class="form-control" name="productId" id="adjustment-product" required>
                            <option value="">Seleccione producto...</option>
                            ${physicalProducts.map(p => `<option value="${p.id}" data-stock="${p.stock || 0}">${p.code} - ${p.name} (Stock actual: ${p.stock || 0})</option>`).join('')}
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Stock Actual</label>
                        <input type="number" class="form-control" id="current-stock" disabled value="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Stock Real (Conteo Físico) <span class="text-danger">*</span></label>
                        <input type="number" class="form-control" name="newStock" id="new-stock" min="0" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Diferencia</label>
                        <input type="text" class="form-control" id="difference" disabled value="0">
                    </div>
                    <div class="form-group">
                        <label class="form-label">Motivo del Ajuste <span class="text-danger">*</span></label>
                        <select class="form-control" name="reason" required>
                            <option value="">Seleccione...</option>
                            <option value="Conteo físico">Conteo físico</option>
                            <option value="Merma">Merma / Deterioro</option>
                            <option value="Robo/Pérdida">Robo / Pérdida</option>
                            <option value="Error de registro">Error de registro previo</option>
                            <option value="Devolución">Devolución</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Descripción</label>
                        <textarea class="form-control" name="description" rows="2" placeholder="Detalles adicionales..."></textarea>
                    </div>
                </form>
            `,
            footer: `
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-primary" id="btn-save-adjustment"><i class="fas fa-save"></i> Guardar Ajuste</button>
            `
        });

        // Eventos del modal
        const productSelect = document.getElementById('adjustment-product');
        const currentStockInput = document.getElementById('current-stock');
        const newStockInput = document.getElementById('new-stock');
        const differenceInput = document.getElementById('difference');

        productSelect.addEventListener('change', () => {
            const stock = parseInt(productSelect.selectedOptions[0]?.dataset.stock || 0);
            currentStockInput.value = stock;
            newStockInput.value = stock;
            differenceInput.value = '0';
        });

        newStockInput.addEventListener('input', () => {
            const current = parseInt(currentStockInput.value) || 0;
            const newVal = parseInt(newStockInput.value) || 0;
            const diff = newVal - current;
            differenceInput.value = diff > 0 ? `+${diff}` : diff;
            differenceInput.style.color = diff > 0 ? 'var(--success-500)' : (diff < 0 ? 'var(--error-500)' : '');
        });

        document.getElementById('btn-save-adjustment')?.addEventListener('click', async () => {
            await this.saveAdjustment();
        });
    },

    async saveAdjustment() {
        const form = document.getElementById('adjustment-form');
        const formData = new FormData(form);

        const productId = formData.get('productId');
        const newStock = parseInt(formData.get('newStock'));
        const reason = formData.get('reason');
        const description = formData.get('description');

        if (!productId) { Toast.error('Seleccione un producto'); return; }
        if (isNaN(newStock) || newStock < 0) { Toast.error('Ingrese un stock válido'); return; }
        if (!reason) { Toast.error('Seleccione un motivo'); return; }

        const company = CompanyService.getCurrent();
        const product = await DB.get('products', productId);
        const currentStock = product.stock || 0;
        const difference = newStock - currentStock;

        if (difference === 0) {
            Toast.warning('No hay diferencia de stock');
            return;
        }

        const loading = Toast.loading('Registrando ajuste...');

        try {
            // Actualizar stock del producto
            await DB.update('products', { ...product, stock: newStock });

            const adjustmentRef = `AJ-${Date.now()}`;

            // Registrar movimiento de stock
            await DB.add('stockMovements', {
                id: Helpers.generateId(),
                companyId: company.id,
                productId,
                type: 'adjustment',
                quantity: Math.abs(difference),
                date: Helpers.getCurrentDate(),
                reference: adjustmentRef,
                description: `${reason}: ${description || 'Ajuste de inventario'}. Stock anterior: ${currentStock}, Stock nuevo: ${newStock}`,
                createdAt: new Date().toISOString()
            });

            // ==========================================
            // CONTABILIZACIÓN DEL AJUSTE
            // ==========================================
            const accounts = await DB.getByIndex('accounts', 'companyId', company.id);

            // Buscar cuenta de Mercaderías (Activo)
            const inventoryAccount = accounts.find(a =>
                a.type === 'asset' &&
                (a.name.toLowerCase().includes('mercadería') ||
                    a.name.toLowerCase().includes('inventario') ||
                    a.code === '1.1.07')
            );

            // Buscar cuenta de Pérdida/Ganancia por ajuste de inventario
            let adjustmentAccount;
            if (difference < 0) {
                // Pérdida - buscar cuenta de gasto
                adjustmentAccount = accounts.find(a =>
                    a.type === 'expense' &&
                    (a.name.toLowerCase().includes('pérdida') ||
                        a.name.toLowerCase().includes('merma') ||
                        a.name.toLowerCase().includes('ajuste'))
                );
                // Si no existe, buscar cualquier cuenta de gasto
                if (!adjustmentAccount) {
                    adjustmentAccount = accounts.find(a => a.type === 'expense');
                }
            } else {
                // Ganancia - buscar cuenta de ingreso
                adjustmentAccount = accounts.find(a =>
                    a.type === 'income' &&
                    (a.name.toLowerCase().includes('ganancia') ||
                        a.name.toLowerCase().includes('ajuste') ||
                        a.name.toLowerCase().includes('sobrante'))
                );
                // Si no existe, buscar cualquier cuenta de ingreso
                if (!adjustmentAccount) {
                    adjustmentAccount = accounts.find(a => a.type === 'income');
                }
            }

            if (inventoryAccount && adjustmentAccount) {
                // Calcular valor del ajuste (usando costo del producto)
                const adjustmentValue = Math.abs(difference) * (product.cost || 0);

                if (adjustmentValue > 0) {
                    const entryNumber = await AccountingService.getNextEntryNumber();

                    const journalEntry = {
                        id: Helpers.generateId(),
                        companyId: company.id,
                        number: entryNumber,
                        date: Helpers.getCurrentDate(),
                        description: `Ajuste de inventario: ${product.name} - ${reason}`,
                        reference: adjustmentRef,
                        status: 'posted',
                        totalDebit: adjustmentValue,
                        totalCredit: adjustmentValue,
                        createdAt: new Date().toISOString()
                    };
                    await DB.add('journalEntries', journalEntry);

                    // Crear líneas del asiento
                    if (difference < 0) {
                        // Pérdida: Débito a Gasto, Crédito a Mercaderías
                        await DB.add('journalLines', {
                            id: Helpers.generateId(),
                            entryId: journalEntry.id,
                            accountId: adjustmentAccount.id,
                            description: `Pérdida inventario: ${product.name}`,
                            debit: adjustmentValue,
                            credit: 0
                        });
                        await DB.add('journalLines', {
                            id: Helpers.generateId(),
                            entryId: journalEntry.id,
                            accountId: inventoryAccount.id,
                            description: `Baja inventario: ${product.name}`,
                            debit: 0,
                            credit: adjustmentValue
                        });
                    } else {
                        // Ganancia: Débito a Mercaderías, Crédito a Ingreso
                        await DB.add('journalLines', {
                            id: Helpers.generateId(),
                            entryId: journalEntry.id,
                            accountId: inventoryAccount.id,
                            description: `Alta inventario: ${product.name}`,
                            debit: adjustmentValue,
                            credit: 0
                        });
                        await DB.add('journalLines', {
                            id: Helpers.generateId(),
                            entryId: journalEntry.id,
                            accountId: adjustmentAccount.id,
                            description: `Ganancia inventario: ${product.name}`,
                            debit: 0,
                            credit: adjustmentValue
                        });
                    }
                }
            }

            Modal.close();
            loading.success(`Ajuste registrado: ${difference > 0 ? '+' : ''}${difference} unidades`);
            App.navigate('inventario', 'movimientos-stock');

        } catch (err) {
            loading.error('Error: ' + err.message);
        }
    },

    initValuation() {
        document.getElementById('btn-calculate')?.addEventListener('click', async () => {
            const method = document.getElementById('valuation-method')?.value || 'promedio';
            const content = document.getElementById('valuation-content');
            content.innerHTML = '<div style="text-align: center; padding: var(--space-8);"><i class="fas fa-spinner fa-spin fa-2x"></i><p>Calculando valorización...</p></div>';
            content.innerHTML = await this.renderValuationTable(method);
            Toast.success(`Valorización calculada (${method.toUpperCase()})`);
        });

        document.getElementById('btn-export-valuation')?.addEventListener('click', async () => {
            const method = document.getElementById('valuation-method')?.value || 'promedio';
            const company = CompanyService.getCurrent();
            const products = await DB.getByIndex('products', 'companyId', company.id);
            const movements = await DB.getByIndex('stockMovements', 'companyId', company.id);

            const methodNames = {
                promedio: 'Costo Promedio',
                fifo: 'FIFO',
                lifo: 'LIFO'
            };

            const data = products.filter(p => !p.isService && (p.stock || 0) > 0).map(p => {
                const productMovements = movements.filter(m => m.productId === p.id && m.type === 'in');
                let unitCost = p.cost || 0;

                if (method === 'promedio' && productMovements.length > 0) {
                    const totalCost = productMovements.reduce((sum, m) => sum + (m.quantity * (m.unitCost || p.cost)), 0);
                    const totalQty = productMovements.reduce((sum, m) => sum + m.quantity, 0);
                    unitCost = totalQty > 0 ? totalCost / totalQty : p.cost;
                }

                return {
                    codigo: p.code,
                    nombre: p.name,
                    categoria: p.category,
                    stock: p.stock || 0,
                    metodo: methodNames[method],
                    costo_unitario: unitCost,
                    valor_total: (p.stock || 0) * unitCost
                };
            });

            await ExportService.toExcel(data, `valorizacion_${method}_${Helpers.getCurrentDate()}`);
            Toast.success('Exportado correctamente');
        });
    },

    async importProducts() {
        Modal.open({
            title: 'Importar Productos desde Excel',
            size: 'large',
            content: `
                <div style="margin-bottom: var(--space-4);">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle"></i>
                        <strong>Formato requerido:</strong> El archivo Excel debe tener las siguientes columnas:
                        <ul style="margin-top: var(--space-2); margin-left: var(--space-4);">
                            <li><strong>codigo</strong> - Código único del producto (requerido)</li>
                            <li><strong>nombre</strong> - Nombre del producto (requerido)</li>
                            <li><strong>categoria</strong> - Categoría del producto</li>
                            <li><strong>unidad</strong> - Unidad de medida (UN, KG, LT, etc.)</li>
                            <li><strong>costo</strong> - Costo unitario</li>
                            <li><strong>precio</strong> - Precio de venta</li>
                            <li><strong>stock</strong> - Stock inicial</li>
                            <li><strong>stock_minimo</strong> - Stock mínimo</li>
                        </ul>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Seleccionar archivo Excel (.xlsx, .xls, .csv)</label>
                    <input type="file" class="form-control" id="import-file" accept=".xlsx,.xls,.csv">
                </div>
                <div id="import-preview" style="display: none;">
                    <h4 style="margin: var(--space-4) 0 var(--space-2);">Vista previa</h4>
                    <div class="table-container" style="max-height: 300px; overflow-y: auto;">
                        <table class="data-table" id="preview-table">
                            <thead></thead>
                            <tbody></tbody>
                        </table>
                    </div>
                    <div id="import-summary" style="margin-top: var(--space-3);"></div>
                </div>
            `,
            footer: `
                <button class="btn btn-outline" id="btn-download-template"><i class="fas fa-download"></i> Descargar Plantilla</button>
                <button class="btn btn-secondary" onclick="Modal.close()">Cancelar</button>
                <button class="btn btn-primary" id="btn-import" disabled><i class="fas fa-upload"></i> Importar</button>
            `
        });

        let importData = [];

        // Descargar plantilla
        document.getElementById('btn-download-template')?.addEventListener('click', async () => {
            const template = [
                { codigo: 'PROD001', nombre: 'Producto Ejemplo 1', categoria: 'Tecnología', unidad: 'UN', costo: 10000, precio: 15000, stock: 100, stock_minimo: 10 },
                { codigo: 'PROD002', nombre: 'Producto Ejemplo 2', categoria: 'Oficina', unidad: 'CJ', costo: 5000, precio: 8000, stock: 50, stock_minimo: 5 },
                { codigo: 'SERV001', nombre: 'Servicio Ejemplo', categoria: 'Servicios', unidad: 'UN', costo: 0, precio: 25000, stock: 0, stock_minimo: 0 }
            ];
            await ExportService.toExcel(template, 'plantilla_productos');
            Toast.success('Plantilla descargada');
        });

        // Procesar archivo
        document.getElementById('import-file')?.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const loading = Toast.loading('Procesando archivo...');

            try {
                const data = await this.readExcelFile(file);
                importData = this.validateImportData(data);

                // Mostrar vista previa
                const previewDiv = document.getElementById('import-preview');
                const thead = document.querySelector('#preview-table thead');
                const tbody = document.querySelector('#preview-table tbody');
                const summary = document.getElementById('import-summary');

                if (importData.valid.length > 0) {
                    thead.innerHTML = `<tr>
                        <th>Código</th>
                        <th>Nombre</th>
                        <th>Categoría</th>
                        <th>Unidad</th>
                        <th>Costo</th>
                        <th>Precio</th>
                        <th>Stock</th>
                        <th>Estado</th>
                    </tr>`;

                    tbody.innerHTML = importData.valid.slice(0, 20).map(p => `
                        <tr>
                            <td><code>${p.codigo}</code></td>
                            <td>${p.nombre}</td>
                            <td>${p.categoria || '-'}</td>
                            <td>${p.unidad || 'UN'}</td>
                            <td class="text-right">${Formatters.currency(p.costo || 0)}</td>
                            <td class="text-right">${Formatters.currency(p.precio || 0)}</td>
                            <td class="text-right">${p.stock || 0}</td>
                            <td><span class="badge badge-success">OK</span></td>
                        </tr>
                    `).join('');

                    if (importData.valid.length > 20) {
                        tbody.innerHTML += `<tr><td colspan="8" class="text-center">... y ${importData.valid.length - 20} productos más</td></tr>`;
                    }
                }

                summary.innerHTML = `
                    <div style="display: flex; gap: var(--space-4);">
                        <div class="badge badge-success" style="padding: var(--space-2) var(--space-3);">
                            <i class="fas fa-check"></i> ${importData.valid.length} productos válidos
                        </div>
                        ${importData.errors.length > 0 ? `
                            <div class="badge badge-error" style="padding: var(--space-2) var(--space-3);">
                                <i class="fas fa-times"></i> ${importData.errors.length} con errores
                            </div>
                        ` : ''}
                    </div>
                    ${importData.errors.length > 0 ? `
                        <div class="alert alert-warning" style="margin-top: var(--space-3);">
                            <strong>Errores encontrados:</strong>
                            <ul style="margin-top: var(--space-2); margin-left: var(--space-4);">
                                ${importData.errors.slice(0, 5).map(e => `<li>${e}</li>`).join('')}
                                ${importData.errors.length > 5 ? `<li>... y ${importData.errors.length - 5} errores más</li>` : ''}
                            </ul>
                        </div>
                    ` : ''}
                `;

                previewDiv.style.display = 'block';
                document.getElementById('btn-import').disabled = importData.valid.length === 0;
                loading.success(`${importData.valid.length} productos listos para importar`);

            } catch (err) {
                loading.error('Error al procesar archivo: ' + err.message);
            }
        });

        // Importar productos
        document.getElementById('btn-import')?.addEventListener('click', async () => {
            if (importData.valid.length === 0) return;

            const confirm = await Modal.confirm({
                title: 'Confirmar Importación',
                message: `¿Importar ${importData.valid.length} productos?`,
                confirmText: 'Importar'
            });

            if (!confirm) return;

            const loading = Toast.loading('Importando productos...');

            try {
                const company = CompanyService.getCurrent();
                let imported = 0;
                let updated = 0;

                for (const p of importData.valid) {
                    // Verificar si ya existe por código
                    const existing = (await DB.getByIndex('products', 'companyId', company.id))
                        .find(prod => prod.code === p.codigo);

                    const productData = {
                        code: p.codigo,
                        name: p.nombre,
                        category: p.categoria || '',
                        unit: p.unidad || 'UN',
                        cost: parseFloat(p.costo) || 0,
                        price: parseFloat(p.precio) || 0,
                        stock: parseInt(p.stock) || 0,
                        minStock: parseInt(p.stock_minimo) || 0,
                        isService: (p.unidad === 'SERV' || p.stock === 0 && p.costo === 0),
                        status: 'active'
                    };

                    if (existing) {
                        await DB.update('products', { ...existing, ...productData });
                        updated++;
                    } else {
                        await DB.add('products', { id: Helpers.generateId(), companyId: company.id, ...productData });
                        imported++;
                    }
                }

                Modal.close();
                loading.success(`Importación completada: ${imported} nuevos, ${updated} actualizados`);
                App.navigate('inventario', 'productos');

            } catch (err) {
                loading.error('Error: ' + err.message);
            }
        });
    },

    async readExcelFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    resolve(jsonData);
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    },

    validateImportData(data) {
        const valid = [];
        const errors = [];

        data.forEach((row, index) => {
            const rowNum = index + 2; // +2 porque Excel empieza en 1 y tiene header

            // Normalizar nombres de columnas (puede venir en español o inglés)
            const normalized = {
                codigo: row.codigo || row.code || row.Codigo || row.Code || row.CODIGO,
                nombre: row.nombre || row.name || row.Nombre || row.Name || row.NOMBRE,
                categoria: row.categoria || row.category || row.Categoria || row.Category || row.CATEGORIA,
                unidad: row.unidad || row.unit || row.Unidad || row.Unit || row.UNIDAD,
                costo: row.costo || row.cost || row.Costo || row.Cost || row.COSTO,
                precio: row.precio || row.price || row.Precio || row.Price || row.PRECIO,
                stock: row.stock || row.Stock || row.STOCK,
                stock_minimo: row.stock_minimo || row.stockMinimo || row.min_stock || row['Stock Mínimo'] || row.STOCK_MINIMO
            };

            // Validar campos requeridos
            if (!normalized.codigo) {
                errors.push(`Fila ${rowNum}: Código es requerido`);
                return;
            }
            if (!normalized.nombre) {
                errors.push(`Fila ${rowNum}: Nombre es requerido`);
                return;
            }

            valid.push(normalized);
        });

        return { valid, errors };
    },

    // Función para registrar movimiento de stock (usada por otros módulos)
    async registerStockMovement(productId, type, quantity, reference, description) {
        const company = CompanyService.getCurrent();

        await DB.add('stockMovements', {
            id: Helpers.generateId(),
            companyId: company.id,
            productId,
            type,
            quantity,
            date: Helpers.getCurrentDate(),
            reference,
            description,
            createdAt: new Date().toISOString()
        });
    }
};

window.InventarioModule = InventarioModule;
