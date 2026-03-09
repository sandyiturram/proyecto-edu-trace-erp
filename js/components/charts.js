/**
 * EduERP - Charts Component
 * Componente para gráficos usando Chart.js
 */

const Charts = {
    instances: {},
    colors: {
        primary: 'rgba(10, 110, 209, 1)',
        primaryLight: 'rgba(10, 110, 209, 0.2)',
        success: 'rgba(16, 126, 62, 1)',
        successLight: 'rgba(16, 126, 62, 0.2)',
        warning: 'rgba(223, 110, 12, 1)',
        warningLight: 'rgba(223, 110, 12, 0.2)',
        error: 'rgba(187, 0, 0, 1)',
        errorLight: 'rgba(187, 0, 0, 0.2)',
        palette: [
            'rgba(10, 110, 209, 0.8)',
            'rgba(16, 126, 62, 0.8)',
            'rgba(223, 110, 12, 0.8)',
            'rgba(187, 0, 0, 0.8)',
            'rgba(156, 39, 176, 0.8)',
            'rgba(0, 188, 212, 0.8)',
            'rgba(255, 193, 7, 0.8)',
            'rgba(96, 125, 139, 0.8)'
        ]
    },

    /**
     * Configuración base para todos los gráficos
     */
    getBaseConfig() {
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: { family: "'Inter', sans-serif", size: 12 }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleFont: { family: "'Inter', sans-serif", size: 13, weight: '600' },
                    bodyFont: { family: "'Inter', sans-serif", size: 12 },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true
                }
            }
        };
    },

    /**
     * Crea un gráfico de líneas
     */
    line(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Destruir instancia anterior si existe
        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
        }

        const config = {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: data.datasets.map((ds, i) => ({
                    label: ds.label,
                    data: ds.data,
                    borderColor: ds.color || this.colors.palette[i],
                    backgroundColor: ds.fill ? (ds.backgroundColor || this.colors.primaryLight) : 'transparent',
                    fill: ds.fill || false,
                    tension: 0.4,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    borderWidth: 2
                }))
            },
            options: {
                ...this.getBaseConfig(),
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: "'Inter', sans-serif", size: 11 } }
                    },
                    y: {
                        beginAtZero: options.beginAtZero !== false,
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: {
                            font: { family: "'Inter', sans-serif", size: 11 },
                            callback: (value) => options.currency ? Formatters.currency(value, { showSymbol: false }) : Formatters.number(value)
                        }
                    }
                },
                ...options
            }
        };

        this.instances[canvasId] = new Chart(ctx, config);
        return this.instances[canvasId];
    },

    /**
     * Crea un gráfico de barras
     */
    bar(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
        }

        const config = {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: data.datasets.map((ds, i) => ({
                    label: ds.label,
                    data: ds.data,
                    backgroundColor: ds.colors || this.colors.palette[i],
                    borderColor: ds.borderColors || this.colors.palette[i],
                    borderWidth: 1,
                    borderRadius: 4
                }))
            },
            options: {
                ...this.getBaseConfig(),
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: { font: { family: "'Inter', sans-serif", size: 11 } }
                    },
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        ticks: {
                            font: { family: "'Inter', sans-serif", size: 11 },
                            callback: (value) => options.currency ? Formatters.currency(value, { showSymbol: false }) : value
                        }
                    }
                },
                ...options
            }
        };

        this.instances[canvasId] = new Chart(ctx, config);
        return this.instances[canvasId];
    },

    /**
     * Crea un gráfico de barras horizontales
     */
    horizontalBar(canvasId, data, options = {}) {
        return this.bar(canvasId, data, { ...options, indexAxis: 'y' });
    },

    /**
     * Crea un gráfico de dona/pie
     */
    doughnut(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
        }

        const config = {
            type: options.pie ? 'pie' : 'doughnut',
            data: {
                labels: data.labels,
                datasets: [{
                    data: data.values,
                    backgroundColor: data.colors || this.colors.palette,
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                ...this.getBaseConfig(),
                cutout: options.pie ? 0 : '65%',
                plugins: {
                    ...this.getBaseConfig().plugins,
                    tooltip: {
                        ...this.getBaseConfig().plugins.tooltip,
                        callbacks: {
                            label: (context) => {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return options.currency
                                    ? `${context.label}: ${Formatters.currency(value)} (${percentage}%)`
                                    : `${context.label}: ${Formatters.number(value)} (${percentage}%)`;
                            }
                        }
                    }
                },
                ...options
            }
        };

        this.instances[canvasId] = new Chart(ctx, config);
        return this.instances[canvasId];
    },

    /**
     * Crea un gráfico de área
     */
    area(canvasId, data, options = {}) {
        return this.line(canvasId, {
            ...data,
            datasets: data.datasets.map(ds => ({ ...ds, fill: true }))
        }, options);
    },

    /**
     * Crea un gráfico mixto (barras + línea)
     */
    mixed(canvasId, data, options = {}) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
        }

        const config = {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: data.datasets.map((ds, i) => ({
                    type: ds.type || 'bar',
                    label: ds.label,
                    data: ds.data,
                    backgroundColor: ds.type === 'line' ? 'transparent' : (ds.color || this.colors.palette[i]),
                    borderColor: ds.color || this.colors.palette[i],
                    borderWidth: ds.type === 'line' ? 2 : 1,
                    borderRadius: ds.type === 'line' ? 0 : 4,
                    tension: 0.4,
                    yAxisID: ds.yAxisID || 'y',
                    order: ds.type === 'line' ? 0 : 1
                }))
            },
            options: {
                ...this.getBaseConfig(),
                scales: {
                    x: { grid: { display: false } },
                    y: {
                        type: 'linear',
                        position: 'left',
                        beginAtZero: true,
                        grid: { color: 'rgba(0,0,0,0.05)' }
                    },
                    y1: options.dualAxis ? {
                        type: 'linear',
                        position: 'right',
                        beginAtZero: true,
                        grid: { display: false }
                    } : undefined
                },
                ...options
            }
        };

        this.instances[canvasId] = new Chart(ctx, config);
        return this.instances[canvasId];
    },

    /**
     * Actualiza datos de un gráfico existente
     */
    update(canvasId, newData) {
        const chart = this.instances[canvasId];
        if (!chart) return;

        if (newData.labels) {
            chart.data.labels = newData.labels;
        }

        if (newData.datasets) {
            newData.datasets.forEach((ds, i) => {
                if (chart.data.datasets[i]) {
                    chart.data.datasets[i].data = ds.data;
                    if (ds.label) chart.data.datasets[i].label = ds.label;
                }
            });
        }

        if (newData.values) {
            chart.data.datasets[0].data = newData.values;
        }

        chart.update();
    },

    /**
     * Destruye un gráfico
     */
    destroy(canvasId) {
        if (this.instances[canvasId]) {
            this.instances[canvasId].destroy();
            delete this.instances[canvasId];
        }
    },

    /**
     * Destruye todos los gráficos
     */
    destroyAll() {
        Object.keys(this.instances).forEach(id => this.destroy(id));
    },

    /**
     * Genera canvas para gráfico
     */
    createCanvas(containerId, canvasId, height = 300) {
        const container = document.getElementById(containerId);
        if (!container) return null;

        container.innerHTML = `
            <div style="height: ${height}px; position: relative;">
                <canvas id="${canvasId}"></canvas>
            </div>
        `;

        return document.getElementById(canvasId);
    }
};

// Hacer disponible globalmente
window.Charts = Charts;
