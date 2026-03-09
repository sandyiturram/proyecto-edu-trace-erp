# 📋 Guía de Importación y Prueba del Sistema Dual de Contabilización

Esta guía te permitirá probar el nuevo sistema dual de contabilización (Jornalizador y Centralizador) que acabas de implementar en EDU-TRACE ERP.

---

## 🎯 Objetivo

Importar una empresa de demostración configurada con el **Sistema Centralizador** y realizar pruebas para entender la diferencia con el **Sistema Jornalizador**.

---

## 📦 Archivo de Importación

**Ubicación:** `data/caso_prueba_sistema_dual.json`

**Contenido:**
- ✅ 1 Empresa: **Comercial Moderno SpA** (configurada con `accountingSystem: "centralizer"`)
- ✅ Plan de Cuentas completo (27 cuentas incluyendo activos, pasivos, patrimonio, ingresos y gastos)
- ✅ 3 Productos de ejemplo
- ✅ 2 Proveedores
- ✅ 2 Clientes
- ✅ 1 Asiento de Apertura (2026-01-02)

---

## 📝 Pasos para Importar

### 1. Acceder al Sistema
```
http://localhost:8000
```

### 2. Navegar a Administración
- Click en el menú lateral: **⚙️ Administración**

### 3. Importar Datos
- En la sección **"Gestión de Empresas"**, busca el botón **"Importar Datos"** o **"Importar JSON"**
- Click en **"Seleccionar archivo"**
- Navega a: `c:\Users\ASUS\OneDrive - uv.cl\Aplicaciones\proyecto_ERP - respaldo\data\caso_prueba_sistema_dual.json`
- Click en **"Importar"**

### 4. Verificar la Importación
- El sistema debería mostrar un mensaje de éxito
- **"Comercial Moderno SpA - Centralizador"** debería aparecer en el selector de empresas

---

## 🧪 Pruebas a Realizar

### **PRUEBA 1: Verificar Configuración del Sistema**

1. **Ir a:** Administración → Configuración
2. **Buscar:** Sección "Parámetros Contables"
3. **Verificar:** El selector "Sistema de Contabilización" debe mostrar:
   - 🟢 **Centralizador (Libros Auxiliares)** ← SELECCIONADO
4. **Nota:** Puedes cambiar entre sistemas para comparar

---

### **PRUEBA 2: Probar Modo Jornalizador (Por Defecto)**

#### A. Cambiar Temporalmente al Modo Jornalizador
1. En Administración → Configuración
2. Cambiar selector a: 🔵 **Jornalizador (Diario Único)**
3. Guardar configuración

#### B. Crear una Transacción de Ventas
1. Ir a: **Ventas** → Nueva Venta
2. Crear una venta de ejemplo:
   - Cliente: Universidad de Valparaíso
   - Producto: Laptop Dell Latitude 5520
   - Cantidad: 2 unidades
   - Guardar como borrador o entregar

#### C. Verificar en el Libro Diario
1. Ir a: **Contabilidad** → Libro Diario
2. **Observar:** La transacción se registró **DIRECTAMENTE** en el Libro Diario
3. **Características:** 
   - Registro inmediato
   - Visible de inmediato en asientos contables

---

### **PRUEBA 3: Probar Modo Centralizador** ⭐

#### A. Cambiar al Modo Centralizador
1. Volver a: Administración → Configuración
2. Cambiar selector a: 🟢 **Centralizador (Libros Auxiliares)**
3. Guardar configuración

#### B. Crear una Transacción de Ventas
1. Ir a: **Ventas** → Nueva Venta
2. Crear una venta de ejemplo:
   - Cliente: ABC Consultores
   - Producto: Monitor LG 24" Full HD
   - Cantidad: 3 unidades

#### C. Usar la Consola del Navegador para Inspeccionar

Abre la **Consola del Desarrollador** (F12) y ejecuta:

```javascript
// Ver libros auxiliares del mes actual
const periodo = '2026-01';
const auxiliares = await AccountingService.getAuxiliaryJournals(periodo);
console.table(auxiliares);
```

**Observar:**
- ✅ La transacción **NO** aparece en el Libro Diario aún
- ✅ La transacción está en `auxiliaryJournals` con module: `'sales'`
- ✅ El libro auxiliar está en estado `'open'`

#### D. Centralizar el Libro Auxiliar

En la consola del navegador:

```javascript
// Centralizar libro auxiliar de Ventas de enero 2026
const resultado = await AccountingService.centralizeAuxiliaryJournal('sales', '2026-01');
console.log('Centralizado:', resultado);
```

#### E. Verificar en el Libro Diario
1. Ir a: **Contabilidad** → Libro Diario
2. **Observar:** Ahora hay un **ASIENTO RESUMEN** con:
   - Descripción: "Centralización - Libro Ventas - Enero 2026"
   - Tipo: `centralizer`
   - Todas las transacciones del mes consolidadas

---

### **PRUEBA 4: Comparar Ambos Métodos**

| Aspecto | Jornalizador | Centralizador |
|---------|--------------|---------------|
| **Registro** | Inmediato en Libro Diario | Primero en Libro Auxiliar |
| **Libro Diario** | Muchos asientos detallados | Pocos asientos resumen (mensuales) |
| **Complejidad** | Simple, ideal para principiantes | Avanzado, empresas grandes |
| **Trazabilidad** | Alta (transacción por transacción) | Alta (a través de libros auxiliares) |
| **Ideal para** | Microempresas, estudiantes | PYMEs y grandes empresas |

---

## 🔍 Verificación de Datos

### Plan de Cuentas Importado

Ir a: **Contabilidad** → Plan de Cuentas

Deberías ver:
- **1. ACTIVOS**
  - 1.1 Activo Corriente
    - 1.1.01 Caja: $5.000.000
    - 1.1.02 Banco Estado: $25.000.000
    - 1.1.04 IVA Crédito Fiscal: $950.000
    - 1.1.05 Mercaderías: $15.000.000
- **2. PASIVOS**
  - 2.1 Pasivo Corriente
    - 2.1.01 Proveedores: $12.000.000
    - 2.1.02 IVA Débito Fiscal: $1.520.000
- **3. PATRIMONIO**
  - 3.1.01 Capital Pagado: $40.000.000
  - 3.2.01 Resultados Acumulados: $430.000
- **4. INGRESOS** y **5. COSTOS**, **6. GASTOS** (según nomenclatura IFRS ✅)

---

## 🧠 Pruebas Pedagógicas Avanzadas

### Escenario Completo: Ciclo Mensual Centralizador

1. **Crear múltiples transacciones en enero 2026:**
   - 5 ventas diferentes
   - 3 compras diferentes
   - 2 movimientos de tesorería

2. **Al final del mes:**
   ```javascript
   // Centralizar todos los libros auxiliares
   await AccountingService.centralizeAuxiliaryJournal('sales', '2026-01');
   await AccountingService.centralizeAuxiliaryJournal('purchases', '2026-01');
   await AccountingService.centralizeAuxiliaryJournal('treasury', '2026-01');
   ```

3. **Verificar:**
   - Libro Diario tiene solo 3 asientos resumen (+ asiento apertura)
   - Cada libro auxiliar está marcado como `'centralized'`
   - Los saldos de cuentas son correctos

---

## 📚 Recursos Adicionales

- **Guía Pedagógica Completa:** `docs/guia_sistemas_contabilizacion.md`
- **Walkthrough Técnico:** Ver artifact `walkthrough.md`
- **Documentación IFRS:** Terminología actualizada en todo el sistema

---

## ⚠️ Notas Importantes

1. **Retrocompatibilidad:** Las empresas existentes seguirán usando el modo Jornalizador por defecto
2. **Migración de Módulos:** Los módulos de Ventas, Compras y Tesorería aún no usan `registerTransaction()` automáticamente. Se requiere actualización manual (ver `walkthrough.md`)
3. **Centralización Manual:** Por ahora, la centralización se hace manualmente desde la consola. Una interfaz gráfica puede ser implementada en el futuro

---

## 🎓 Propósito Pedagógico

Esta prueba permite a los estudiantes:
- ✅ Entender las **diferencias prácticas** entre ambos sistemas
- ✅ Visualizar cómo el **Centralizador** reduce el volumen del Libro Diario
- ✅ Comprender la **trazabilidad** desde libros auxiliares al libro mayor
- ✅ Experimentar con **metodologías contables reales** usadas en empresas

---

**¡Listo para probar!** 🚀

Si encuentras algún problema durante las pruebas, revisa la consola del navegador para mensajes de depuración.
