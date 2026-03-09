# 🎓 EDU-TRACE ERP

<div align="center">

![Versión](https://img.shields.io/badge/Versión-1.0-blue)
![Etapa](https://img.shields.io/badge/Etapa-1-green)
![Licencia](https://img.shields.io/badge/Licencia-Privada%20Educacional-red)
![Universidad](https://img.shields.io/badge/Universidad-Valparaíso-purple)

**Sistema de Gestión Empresarial (ERP) Educativo con Trazabilidad Pedagógica Integrada**

*Aprende ERP de forma práctica*

</div>

---

## 📋 Descripción

**EDU-TRACE ERP** es una aplicación web desarrollada como herramienta pedagógica para apoyar los procesos de enseñanza-aprendizaje en la asignatura de Contabilidad de la Escuela de Auditoría de la Universidad de Valparaíso.

Este sistema permite a los estudiantes experimentar y comprender el funcionamiento de un sistema ERP real, integrando los principales módulos de gestión empresarial con énfasis en los procesos contables.

---

## � Propuesta de Valor y Diferencial

A diferencia de soluciones comerciales como **Odoo** o **Axelor**, **EDU-TRACE ERP** está diseñado específicamente para el entorno académico:

- **🧠 Trazabilidad Pedagógica**: Visualiza el impacto contable de cada operación con explicaciones didácticas.
- **⚡ Cero Infraestructura**: Funciona 100% en el navegador (IndexedDB), sin necesidad de servidores o instalaciones complejas.
- **🛡️ Soberanía Académica**: Herramienta de propiedad de la Universidad de Valparaíso, adaptada a su currículo.
- **🎓 Enfoque en Auditoría**: Módulos especializados en la validación y seguimiento de la integridad de datos.

Para una comparativa detallada, ver [PROPUESTA_VALOR.md](PROPUESTA_VALOR.md).

---

## �👩‍💻 Autoría y Créditos

### Autora
**Sandy Iturra Mena**  
Universidad de Valparaíso  
Escuela de Auditoría

---

## 🎯 Objetivo

Validar el uso de este sistema ERP como herramienta efectiva para los procesos de enseñanza-aprendizaje en la asignatura de Contabilidad, proporcionando a los estudiantes una experiencia práctica con sistemas de gestión empresarial integrados.

---

## 🏗️ Módulos del Sistema

### Etapa 1 (Actual) ✅
| Módulo | Descripción |
|--------|-------------|
| 📈 **Dashboard** | Panel de control con indicadores clave y visualizaciones |
| 💰 **Ventas (SD)** | Gestión de pedidos de venta, clientes y facturación |
| 🛒 **Compras (MM)** | Gestión de órdenes de compra y proveedores |
| 📦 **Inventario (WM)** | Control de productos, stock y movimientos |
| 📊 **Contabilidad (GL)** | Plan de cuentas, asientos contables y libro mayor |
| 💵 **Tesorería (FI)** | Gestión de caja, bancos y flujo de efectivo |
| 📑 **Reportes** | Estados financieros: Balance General, Estado de Resultados |
| ⚙️ **Administración** | Configuración del sistema y gestión de datos |

### Etapa 2 (Próximamente) 🔒
| Módulo | Descripción |
|--------|-------------|
| 💹 **Costos (CO)** | Control y análisis de costos |
| 👥 **RRHH (HR)** | Gestión de empleados y nómina |
| 🔍 **Trazabilidad** | Seguimiento y auditoría de transacciones |

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Base de Datos**: IndexedDB (almacenamiento local en navegador)
- **Visualización**: Chart.js para gráficos y reportes
- **Diseño**: CSS moderno con variables, flexbox y grid

---

## 📁 Estructura del Proyecto

```
EDU-TRACE_ERP/
├── index.html              # Página principal
├── diagrama-contable.html  # Diagrama del flujo contable
├── css/
│   ├── main.css           # Estilos principales
│   ├── components.css     # Estilos de componentes
│   ├── dashboard.css      # Estilos del dashboard
│   └── trazabilidad.css   # Estilos de trazabilidad
├── js/
│   ├── app.js             # Aplicación principal
│   ├── components/        # Componentes reutilizables
│   ├── database/          # Gestión de base de datos
│   ├── modules/           # Módulos funcionales
│   ├── services/          # Servicios de negocio
│   └── utils/             # Utilidades y helpers
├── data/
│   └── casos_estudio/     # Datos de ejemplo
├── LICENSE                # Licencia de uso
├── README.md              # Este archivo
└── AUTHORS.md             # Información de autores
```

---

## 🚀 Instalación y Uso

### Requisitos
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Servidor web local (opcional, para desarrollo)

### Ejecución
1. Clonar o descargar el proyecto
2. Ejecutar `start-server.bat` para iniciar un servidor local
3. Abrir `index.html` en el navegador
4. ¡Listo para usar!

---

## 📚 Casos de Estudio Incluidos

El sistema incluye casos de estudio predefinidos para facilitar el aprendizaje:
- **Empresa Comercial**: Ejemplo de empresa de compra-venta
- **Empresa de Servicios**: Ejemplo de empresa prestadora de servicios

---

## 🔒 Licencia

Este software está protegido bajo una **Licencia de Uso Educacional Privado**.

- **Uso autorizado**: Exclusivamente para la Escuela de Auditoría de la Universidad de Valparaíso
- **Propósito**: Fines educativos y de investigación
- **Restricciones**: Prohibida la distribución, modificación o uso comercial sin autorización

Ver archivo [LICENSE](LICENSE) para más detalles.

---

## ⚖️ Propiedad Intelectual

© 2025 Sandy Iturra Mena. Todos los derechos reservados.

Este software está en proceso de registro ante el **Departamento de Derechos Intelectuales (DDI)** del Servicio Nacional del Patrimonio Cultural de Chile.

La reproducción, distribución o uso no autorizado de este software está prohibido y puede constituir una infracción a la Ley N° 17.336 sobre Propiedad Intelectual de Chile.

---

## 📞 Contacto

**Sandy Iturra Mena**
sandy.iturra@uv.cl  
Universidad de Valparaíso  
Escuela de Auditoría  
Chile

---

<div align="center">

**Desarrollado con ❤️ para la educación contable**

*EDU-TRACE ERP – Sistema de Gestión Empresarial (ERP) Educativo con Trazabilidad Pedagógica Integrada*

*Universidad de Valparaíso - Escuela de Auditoría*

</div>
