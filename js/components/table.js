/**
 * EduERP - Data Table Component
 * Tablas de datos con paginación, ordenamiento y filtros
 */

const DataTable = {
    instances: {},

    /**
     * Crea una nueva tabla de datos
     */
    create(containerId, options = {}) {
        const {
            columns = [],
            data = [],
            pageSize = 10,
            searchable = true,
            sortable = true,
            selectable = false,
            actions = [],
            emptyMessage = 'No hay datos para mostrar',
            onRowClick = null,
            onSelect = null
        } = options;

        const instance = {
            id: containerId,
            columns,
            allData: data,
            filteredData: data,
            currentPage: 1,
            pageSize,
            sortColumn: null,
            sortOrder: 'asc',
            searchTerm: '',
            selectedRows: new Set(),
            options: { searchable, sortable, selectable, actions, emptyMessage, onRowClick, onSelect }
        };

        this.instances[containerId] = instance;
        this.render(containerId);

        return {
            refresh: (newData) => this.setData(containerId, newData),
            getSelected: () => this.getSelected(containerId),
            clearSelection: () => this.clearSelection(containerId),
            destroy: () => delete this.instances[containerId]
        };
    },

    /**
     * Renderiza la tabla
     */
    render(containerId) {
        const instance = this.instances[containerId];
        if (!instance) return;

        const container = document.getElementById(containerId);
        if (!container) return;

        const { options, columns } = instance;

        // Aplicar filtros y ordenamiento
        this.applyFilters(containerId);
        this.applySort(containerId);

        // Calcular paginación
        const totalPages = Math.ceil(instance.filteredData.length / instance.pageSize);
        const startIdx = (instance.currentPage - 1) * instance.pageSize;
        const pageData = instance.filteredData.slice(startIdx, startIdx + instance.pageSize);

        // Construir HTML
        let html = `
            <div class="data-table-wrapper">
                ${options.searchable ? `
                    <div class="table-toolbar">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" class="form-control" placeholder="Buscar..." 
                                value="${instance.searchTerm}" data-table-search="${containerId}">
                        </div>
                        <div class="table-info">
                            ${instance.filteredData.length} registro${instance.filteredData.length !== 1 ? 's' : ''}
                        </div>
                    </div>
                ` : ''}
                
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                ${options.selectable ? `
                                    <th class="col-checkbox">
                                        <input type="checkbox" data-table-select-all="${containerId}">
                                    </th>
                                ` : ''}
                                ${columns.map(col => `
                                    <th class="${col.class || ''} ${options.sortable && col.sortable !== false ? 'sortable' : ''}"
                                        ${options.sortable && col.sortable !== false ? `data-table-sort="${containerId}" data-column="${col.key}"` : ''}>
                                        ${col.label}
                                        ${options.sortable && col.sortable !== false ? `
                                            <span class="sort-icon">
                                                ${instance.sortColumn === col.key ?
                    (instance.sortOrder === 'asc' ? '<i class="fas fa-sort-up"></i>' : '<i class="fas fa-sort-down"></i>') :
                    '<i class="fas fa-sort"></i>'
                }
                                            </span>
                                        ` : ''}
                                    </th>
                                `).join('')}
                                ${options.actions.length ? '<th class="col-actions">Acciones</th>' : ''}
                            </tr>
                        </thead>
                        <tbody>
        `;

        if (pageData.length === 0) {
            html += `
                <tr>
                    <td colspan="${columns.length + (options.selectable ? 1 : 0) + (options.actions.length ? 1 : 0)}">
                        <div class="table-empty">
                            <i class="fas fa-inbox"></i>
                            <p>${options.emptyMessage}</p>
                        </div>
                    </td>
                </tr>
            `;
        } else {
            pageData.forEach((row, idx) => {
                const isSelected = instance.selectedRows.has(row.id);
                html += `
                    <tr data-row-id="${row.id}" class="${isSelected ? 'selected' : ''}" 
                        ${options.onRowClick ? `data-table-row="${containerId}"` : ''}>
                        ${options.selectable ? `
                            <td class="col-checkbox">
                                <input type="checkbox" data-table-select="${containerId}" data-row-id="${row.id}" 
                                    ${isSelected ? 'checked' : ''}>
                            </td>
                        ` : ''}
                        ${columns.map(col => {
                    let value = Helpers.getNestedValue(row, col.key);

                    // Aplicar formato
                    if (col.render) {
                        value = col.render(value, row, idx);
                    } else if (col.format) {
                        switch (col.format) {
                            case 'currency': value = Formatters.currency(value); break;
                            case 'date': value = Formatters.date(value); break;
                            case 'datetime': value = Formatters.datetime(value); break;
                            case 'number': value = Formatters.number(value, col.decimals || 0); break;
                            case 'percentage': value = Formatters.percentage(value); break;
                            case 'status':
                                const status = Formatters.status(value);
                                value = `<span class="badge ${status.class}">${status.label}</span>`;
                                break;
                        }
                    }

                    return `<td class="${col.class || ''}">${value ?? '-'}</td>`;
                }).join('')}
                        ${options.actions.length ? `
                            <td class="col-actions">
                                <div class="actions">
                                    ${options.actions.map(action => `
                                        <button class="btn btn-icon btn-ghost" title="${action.label}"
                                            data-table-action="${containerId}" data-action="${action.name}" data-row-id="${row.id}">
                                            <i class="${action.icon}"></i>
                                        </button>
                                    `).join('')}
                                </div>
                            </td>
                        ` : ''}
                    </tr>
                `;
            });
        }

        html += `
                        </tbody>
                    </table>
                </div>
        `;

        // Paginación
        if (totalPages > 1) {
            html += `
                <div class="pagination">
                    <button class="page-btn" data-table-page="${containerId}" data-page="1" 
                        ${instance.currentPage === 1 ? 'disabled' : ''}>
                        <i class="fas fa-angle-double-left"></i>
                    </button>
                    <button class="page-btn" data-table-page="${containerId}" data-page="${instance.currentPage - 1}"
                        ${instance.currentPage === 1 ? 'disabled' : ''}>
                        <i class="fas fa-angle-left"></i>
                    </button>
                    <span class="page-info">Página ${instance.currentPage} de ${totalPages}</span>
                    <button class="page-btn" data-table-page="${containerId}" data-page="${instance.currentPage + 1}"
                        ${instance.currentPage === totalPages ? 'disabled' : ''}>
                        <i class="fas fa-angle-right"></i>
                    </button>
                    <button class="page-btn" data-table-page="${containerId}" data-page="${totalPages}"
                        ${instance.currentPage === totalPages ? 'disabled' : ''}>
                        <i class="fas fa-angle-double-right"></i>
                    </button>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;

        // Bind eventos
        this.bindEvents(containerId);
    },

    /**
     * Vincula eventos de la tabla
     */
    bindEvents(containerId) {
        const instance = this.instances[containerId];
        if (!instance) return;

        // Búsqueda
        const searchInput = document.querySelector(`[data-table-search="${containerId}"]`);
        if (searchInput) {
            searchInput.oninput = Helpers.debounce((e) => {
                instance.searchTerm = e.target.value;
                instance.currentPage = 1;
                this.render(containerId);
            }, 300);
        }

        // Ordenamiento
        document.querySelectorAll(`[data-table-sort="${containerId}"]`).forEach(th => {
            th.onclick = () => {
                const column = th.dataset.column;
                if (instance.sortColumn === column) {
                    instance.sortOrder = instance.sortOrder === 'asc' ? 'desc' : 'asc';
                } else {
                    instance.sortColumn = column;
                    instance.sortOrder = 'asc';
                }
                this.render(containerId);
            };
        });

        // Paginación
        document.querySelectorAll(`[data-table-page="${containerId}"]`).forEach(btn => {
            btn.onclick = () => {
                const page = parseInt(btn.dataset.page);
                if (page >= 1 && page <= Math.ceil(instance.filteredData.length / instance.pageSize)) {
                    instance.currentPage = page;
                    this.render(containerId);
                }
            };
        });

        // Selección individual
        document.querySelectorAll(`[data-table-select="${containerId}"]`).forEach(checkbox => {
            checkbox.onclick = (e) => {
                e.stopPropagation();
                const rowId = checkbox.dataset.rowId;
                if (checkbox.checked) {
                    instance.selectedRows.add(rowId);
                } else {
                    instance.selectedRows.delete(rowId);
                }
                if (instance.options.onSelect) {
                    instance.options.onSelect(Array.from(instance.selectedRows));
                }
                this.render(containerId);
            };
        });

        // Seleccionar todo
        const selectAll = document.querySelector(`[data-table-select-all="${containerId}"]`);
        if (selectAll) {
            selectAll.onclick = () => {
                const startIdx = (instance.currentPage - 1) * instance.pageSize;
                const pageData = instance.filteredData.slice(startIdx, startIdx + instance.pageSize);

                if (selectAll.checked) {
                    pageData.forEach(row => instance.selectedRows.add(row.id));
                } else {
                    pageData.forEach(row => instance.selectedRows.delete(row.id));
                }

                if (instance.options.onSelect) {
                    instance.options.onSelect(Array.from(instance.selectedRows));
                }
                this.render(containerId);
            };
        }

        // Acciones
        document.querySelectorAll(`[data-table-action="${containerId}"]`).forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const actionName = btn.dataset.action;
                const rowId = btn.dataset.rowId;
                const row = instance.allData.find(r => r.id === rowId);
                const action = instance.options.actions.find(a => a.name === actionName);
                if (action && action.handler) {
                    action.handler(row, rowId);
                }
            };
        });

        // Click en fila
        if (instance.options.onRowClick) {
            document.querySelectorAll(`[data-table-row="${containerId}"]`).forEach(tr => {
                tr.onclick = () => {
                    const rowId = tr.dataset.rowId;
                    const row = instance.allData.find(r => r.id === rowId);
                    instance.options.onRowClick(row, rowId);
                };
                tr.style.cursor = 'pointer';
            });
        }
    },

    applyFilters(containerId) {
        const instance = this.instances[containerId];
        if (!instance.searchTerm) {
            instance.filteredData = [...instance.allData];
            return;
        }

        const searchKeys = instance.columns.filter(c => c.searchable !== false).map(c => c.key);
        instance.filteredData = Helpers.filterBySearch(instance.allData, instance.searchTerm, searchKeys);
    },

    applySort(containerId) {
        const instance = this.instances[containerId];
        if (!instance.sortColumn) return;

        instance.filteredData = Helpers.sortBy(instance.filteredData, instance.sortColumn, instance.sortOrder);
    },

    setData(containerId, data) {
        const instance = this.instances[containerId];
        if (!instance) return;

        instance.allData = data;
        instance.currentPage = 1;
        instance.selectedRows.clear();
        this.render(containerId);
    },

    getSelected(containerId) {
        const instance = this.instances[containerId];
        if (!instance) return [];
        return Array.from(instance.selectedRows);
    },

    clearSelection(containerId) {
        const instance = this.instances[containerId];
        if (!instance) return;
        instance.selectedRows.clear();
        this.render(containerId);
    }
};

// Estilos adicionales para tabla
const tableStyles = document.createElement('style');
tableStyles.textContent = `
    .data-table-wrapper { background: var(--bg-secondary); border-radius: var(--radius-xl); overflow: hidden; }
    .table-toolbar { padding: var(--space-4); border-bottom: 1px solid var(--border-light); display: flex; align-items: center; justify-content: space-between; gap: var(--space-4); flex-wrap: wrap; }
    .table-info { font-size: var(--font-size-sm); color: var(--text-secondary); }
    .data-table th.sortable { cursor: pointer; user-select: none; }
    .data-table th.sortable:hover { background: var(--neutral-100); }
    .sort-icon { margin-left: var(--space-2); color: var(--text-tertiary); }
    .col-checkbox { width: 40px; text-align: center; }
    .col-actions { width: 100px; }
    .data-table tbody tr.selected { background: var(--primary-50); }
    .data-table tbody tr:hover { background: var(--neutral-50); }
`;
document.head.appendChild(tableStyles);

// Hacer disponible globalmente
window.DataTable = DataTable;
