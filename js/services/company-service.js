/**
 * EDU-TRACE ERP - Company Service
 * Gestión de empresas virtuales
 */

const CompanyService = {
    currentCompany: null,

    /**
     * Obtiene todas las empresas
     */
    async getAll() {
        return await DB.getAll('companies');
    },

    /**
     * Obtiene empresa por ID
     */
    async getById(id) {
        return await DB.get('companies', id);
    },

    /**
     * Crea una nueva empresa con datos por defecto
     */
    async create(data) {
        return await Migrations.createCompanyWithDefaults(data);
    },

    /**
     * Actualiza una empresa
     */
    async update(id, data) {
        const company = await this.getById(id);
        if (!company) throw new Error('Empresa no encontrada');

        const updated = { ...company, ...data };
        await DB.update('companies', updated);
        await DB.logAudit(id, 'UPDATE', 'company', id, data);

        if (this.currentCompany?.id === id) {
            this.currentCompany = updated;
            this.updateUI();
        }

        return updated;
    },

    /**
     * Elimina una empresa y todos sus datos
     */
    async delete(id) {
        // Eliminar todos los datos relacionados
        const stores = Object.keys(DB.stores).filter(s => s !== 'companies');

        for (const store of stores) {
            const records = await DB.getByIndex(store, 'companyId', id);
            for (const record of records) {
                await DB.delete(store, record.id);
            }
        }

        await DB.delete('companies', id);

        if (this.currentCompany?.id === id) {
            this.currentCompany = null;
            this.updateUI();
        }

        return true;
    },

    /**
     * Establece la empresa actual
     */
    async setCurrent(id) {
        const company = await this.getById(id);
        if (!company) throw new Error('Empresa no encontrada');

        this.currentCompany = company;
        localStorage.setItem('currentCompanyId', id);
        this.updateUI();

        // Disparar evento para actualizar vistas
        window.dispatchEvent(new CustomEvent('companyChanged', { detail: company }));

        return company;
    },

    /**
     * Obtiene la empresa actual
     */
    getCurrent() {
        return this.currentCompany;
    },

    /**
     * Verifica si hay empresa seleccionada
     */
    hasCompany() {
        return this.currentCompany !== null;
    },

    /**
     * Carga empresa guardada en localStorage
     */
    async loadSavedCompany() {
        const savedId = localStorage.getItem('currentCompanyId');
        if (savedId) {
            try {
                await this.setCurrent(savedId);
                return true;
            } catch (e) {
                localStorage.removeItem('currentCompanyId');
            }
        }
        return false;
    },

    /**
     * Actualiza UI con datos de empresa
     */
    updateUI() {
        const nameEl = document.getElementById('company-name');
        if (nameEl) {
            nameEl.textContent = this.currentCompany?.name || 'Sin empresa';
        }
    },

    /**
     * Exporta datos de la empresa actual
     */
    async exportData(format = 'json') {
        if (!this.currentCompany) throw new Error('No hay empresa seleccionada');

        const data = await DB.exportCompanyData(this.currentCompany.id);

        if (format === 'json') {
            const json = JSON.stringify(data, null, 2);
            Helpers.downloadFile(json, `${this.currentCompany.name}_backup.json`, 'application/json');
        }

        return data;
    },

    /**
 * Importa datos de empresa
 */
    async importData(jsonData) {
        const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
        const result = await DB.importCompanyData(data);

        // Si se importó una empresa, establecerla como actual
        if (data.companies && data.companies.length > 0) {
            const importedCompany = data.companies[0];
            await this.setCurrent(importedCompany.id);

            // Recargar las listas de empresas en el selector
            if (typeof App !== 'undefined' && App.updateCompanySelector) {
                await App.updateCompanySelector();
            }
        } else if (data.companyId) {
            // Si viene el ID de la empresa, intentar establecerla
            await this.setCurrent(data.companyId);
        }

        return result;
    },

    /**
     * Crea datos de demostración para la empresa actual
     */
    async createDemoData() {
        if (!this.currentCompany) throw new Error('No hay empresa seleccionada');
        return await Migrations.createDemoData(this.currentCompany.id);
    },

    /**
     * Obtiene configuración de la empresa
     */
    async getSettings() {
        if (!this.currentCompany) return null;
        const settings = await DB.getByIndex('settings', 'companyId', this.currentCompany.id);
        return settings[0] || null;
    },

    /**
     * Actualiza configuración
     */
    async updateSettings(data) {
        if (!this.currentCompany) throw new Error('No hay empresa seleccionada');

        let settings = await this.getSettings();
        if (settings) {
            settings = { ...settings, ...data };
            await DB.update('settings', settings);
        } else {
            settings = await DB.add('settings', { companyId: this.currentCompany.id, ...data });
        }

        return settings;
    },

    /**
     * Obtiene estadísticas de la empresa
     */
    async getStats() {
        if (!this.currentCompany) return null;

        const companyId = this.currentCompany.id;

        const [suppliers, customers, products, employees, entries] = await Promise.all([
            DB.getByIndex('suppliers', 'companyId', companyId),
            DB.getByIndex('customers', 'companyId', companyId),
            DB.getByIndex('products', 'companyId', companyId),
            DB.getByIndex('employees', 'companyId', companyId),
            DB.getByIndex('journalEntries', 'companyId', companyId)
        ]);

        return {
            suppliersCount: suppliers.length,
            customersCount: customers.length,
            productsCount: products.length,
            employeesCount: employees.length,
            entriesCount: entries.length,
            lastActivity: entries.length > 0 ? entries[entries.length - 1].createdAt : null
        };
    }
};

// Hacer disponible globalmente
window.CompanyService = CompanyService;
