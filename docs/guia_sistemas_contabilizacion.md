# Guía Pedagógica: Sistemas de Contabilización

## 🎓 Introducción

EDU-TRACE ERP soporta dos sistemas de contabilización que reflejan diferentes métodos utilizados en la práctica contable real:

## 📘 Sistema Jornalizador (Diario Único)

### ¿Qué es?
El sistema jornalizador registra **todas las transacciones directamente** en el Libro Diario, sin importar su origen o módulo.

### Características
- ✅ Registro inmediato de cada operación
- ✅ Visualización directa en el Libro Diario
- ✅ Ideal para empresas pequeñas
- ✅ Más simple de entender para principiantes

### Ejemplo Práctico

**Venta al contado:**
```
Libro Diario - Asiento #001
Fecha: 15/03/2024
----------------------------
Caja              119,000 (D)
    Ventas                   100,000 (C)
    IVA Débito                19,000 (C)
```

**Compra a crédito:**
```
Libro Diario - Asiento #002  
Fecha: 16/03/2024
----------------------------
Mercaderías        50,000 (D)
IVA Crédito         9,500 (D)
    Proveedores              59,500 (C)
```

### Ventajas Pedagógicas
- **Claridad:** Cada transacción es visible inmediatamente
- **Simplicidad:** No requiere pasos adicionales
- **Seguimiento:** Fácil de auditar y revisar

## 📗 Sistema Centralizador (Libros Auxiliares)

### ¿Qué es?
El sistema centralizador registra las transacciones en **libros auxiliares por módulo** y luego las consolida mensualmente en el Libro Diario.

### Características
- ✅ Organización por módulos (Ventas, Compras, Tesorería)
- ✅ Centralización mensual
- ✅ Refleja práctica empresarial real
- ✅ Reduce volumen en Libro Diario

### Flujo de Trabajo

```
1. REGISTRO DIARIO
   ├─ Módulo Ventas → Libro Auxiliar de Ventas
   ├─ Módulo Compras → Libro Auxiliar de Compras
   └─ Módulo Tesorería → Libro Auxiliar de Tesorería

2. FIN DE MES
   └─ CENTRALIZACIÓN
      ├─ Consolida totales por cuenta
      └─ Genera 1 asiento resumen por módulo

3. LIBRO DIARIO
   └─ Solo contiene asientos centralizados
```

### Ejemplo Práctico

#### Durante el mes
**Libro Auxiliar de Ventas (Marzo 2024):**
```
15/03 - Factura #001: Caja 119,000 / Ventas 100,000 / IVA 19,000
18/03 - Factura #002: Banco 238,000 / Ventas 200,000 / IVA 38,000
22/03 - Factura #003: Caja 59,500 / Ventas 50,000 / IVA 9,500
...
```

#### Al fin de mes: Centralización
**Libro Diario - Asiento Resumen:**
```
Centralización Ventas - Marzo 2024
-----------------------------------
Caja               1,500,000 (D)
Banco              2,300,000 (D)
    Ventas                     3,200,000 (C)
    IVA Débito                   608,000 (C)
```

### Ventajas Pedagógicas
- **Realismo:** Así trabajan empresas medianas/grandes
- **Organización:** Información segregada por módulo
- **Eficiencia:** Menos volumen en Libro Diario
- **Análisis:** Facilita revisión por área de negocio

## 🔄 ¿Cuándo usar cada sistema?

### Usa Jornalizador si:
- ✅ Estás comenzando con contabilidad
- ✅ La empresa tiene pocas transacciones (< 50/mes)
- ✅ Quieres simpleza y visión directa
- ✅ Estás en etapa de aprendizaje inicial

### Usa Centralizador si:
- ✅ Ya dominas el Jornalizador
- ✅ La empresa tiene muchas transacciones (> 50/mes)
- ✅ Quieres aprender práctica empresarial real
- ✅ Necesitas organización por módulos

## 📊 Comparación Visual

| Aspecto | Jornalizador | Centralizador |
|---------|--------------|---------------|
| **Asientos/mes** | 1 por transacción | 3-5 consolidados |
| **Libro Diario** | Detallado | Resumido |
| **Complejidad** | ⭐ Baja | ⭐⭐⭐ Media |
| **Nivel** | Principiante | Intermedio/Avanzado |
| **Tiempo de registro** | Inmediato | Inmediato + centralización |
| **Análisis por módulo** | Manual | Automático |

## 💡 Ejercicio Práctico

### Escenario
Empresa con 3 transacciones en marzo:

1. **15/03:** Venta al contado $100,000 + IVA
2. **20/03:** Compra de mercadería a crédito $50,000 + IVA  
3. **25/03:** Pago de arriendo $200,000

### Con Jornalizador
**Resultado:** 3 asientos en Libro Diario

### Con Centralizador
**Resultado:**
- 1 transacción en Libro Auxiliar Ventas
- 1 transacción en Libro Auxiliar Compras
- 1 transacción en Libro Auxiliar Tesorería
- **Al 31/03:** 3 asientos resumen en Libro Diario (1 por módulo)

## 🎯 Recomendación Pedagógica

**Ruta de Aprendizaje Sugerida:**

1. **Semanas 1-4:** Jornalizador
   - Dominar partida doble
   - Entender débitos y créditos
   - Practicar asientos básicos

2. **Semanas 5-8:** Centralizador
   - Aprender organización por módulos
   - Practicar centralización
   - Entender informes por área

3. **Semanas 9+:** Comparar ambos  
   - Analizar ventajas/desventajas
   - Decidir según contexto empresarial
   - Aplicar en casos de estudio

## 🔧 Configuración en EDU-TRACE ERP

### Cambiar Sistema

1. Ve a **Administración** → **Configuración**
2. En "Parámetros Contables"
3. Selecciona "Sistema de Contabilización"
   - 🔵 **Jornalizador** (Diario Único)
   - 🟢 **Centralizador** (Libros Auxiliares)
4. Guarda los cambios

### Centralizar Libros Auxiliares (Modo Centralizador)

1. Ve a **Contabilidad** → **Libros Auxiliares**
2. Selecciona el mes a centralizar
3. Clic en "Centralizar" para cada módulo
4. Revisa el asiento resumen generado
5. Contabiliza el asiento

## � Flujo de Trabajo: Compras y Tesorería

Esta sección explica **cuándo y cómo** se generan las contabilizaciones en el módulo de Compras y Tesorería, para entender claramente el proceso.

### 📋 Ciclo de Compras Completo

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       FLUJO DE COMPRAS                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. ORDEN DE COMPRA          2. RECEPCIÓN            3. FACTURA        │
│  ┌─────────────────┐         ┌─────────────────┐     ┌─────────────────┐│
│  │   📝 Borrador   │   ──▶   │   📦 Recibida   │ ──▶ │  📄 Pendiente   ││
│  │   (draft)       │         │   (received)     │     │  (pending)      ││
│  │                 │         │                  │     │                 ││
│  │ ❌ Sin contab.  │         │ ❌ Sin contab.   │     │ ❌ Sin contab.  ││
│  └────────┬────────┘         └──────────────────┘     └────────┬────────┘│
│           │                                                    │        │
│           ▼                                                    ▼        │
│  ┌─────────────────┐                                 ┌─────────────────┐│
│  │   ✅ Aprobada   │                                 │  ✅ CONTABILIZAR││
│  │   (approved)    │                                 │   (posted)      ││
│  │                 │                                 │                 ││
│  │ ❌ Sin contab.  │                                 │ ✅ GENERA       ││
│  └─────────────────┘                                 │    ASIENTO      ││
│                                                      └────────┬────────┘│
│                                                               │        │
│                                                               ▼        │
│                                                      ┌─────────────────┐│
│                                                      │  💰 PAGAR       ││
│                                                      │   (paid)        ││
│                                                      │                 ││
│                                                      │ ✅ GENERA       ││
│                                                      │    ASIENTO      ││
│                                                      └─────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### 📊 Estados de la Orden de Compra

| Estado | Descripción | ¿Genera Contabilización? |
|--------|-------------|--------------------------|
| **Borrador** (draft) | Orden en preparación, editable | ❌ No |
| **Aprobada** (approved) | Orden autorizada para enviar al proveedor | ❌ No |
| **Recibida** (received) | Mercadería ya llegó al almacén | ❌ No |
| **Anulada** (cancelled) | Orden cancelada | ❌ No |

> ⚠️ **IMPORTANTE:** Las Órdenes de Compra **NO generan contabilización** porque representan intención de compra, no una obligación ni transferencia de propiedad.

### 📊 Estados de la Factura de Proveedor

| Estado | Descripción | ¿Genera Contabilización? |
|--------|-------------|--------------------------|
| **Pendiente** (pending) | Factura ingresada pero no contabilizada | ❌ No |
| **Contabilizada** (posted) | Factura registrada contablemente | ✅ **SÍ** - Asiento de compra |
| **Pagada** (paid) | Factura saldada completamente | ✅ **SÍ** - Asiento de pago |
| **Anulada** (cancelled) | Factura anulada | ❌ No |

### 💡 ¿Cuándo se genera el asiento contable?

#### 1️⃣ Al CONTABILIZAR la Factura de Proveedor

```
                    ASIENTO GENERADO
┌──────────────────────────────────────────────────────┐
│  Fecha: [Fecha de la factura]                        │
│  Descripción: Factura XXXX - [Nombre Proveedor]     │
├──────────────────────────────────────────────────────┤
│  CUENTA                        │  DEBE    │  HABER  │
├────────────────────────────────┼──────────┼─────────┤
│  5.1.01 Compras (Gasto)        │ $100.000 │         │
│  1.1.07 IVA Crédito Fiscal     │  $19.000 │         │
│  2.1.01 Proveedores (Pasivo)   │          │ $119.000│
├────────────────────────────────┼──────────┼─────────┤
│  TOTALES                       │ $119.000 │ $119.000│
└──────────────────────────────────────────────────────┘
```

**¿Dónde se registra este asiento?**
- **Jornalizador:** Directo al Libro Diario
- **Centralizador:** Libro Auxiliar de Compras

#### 2️⃣ Al PAGAR la Factura de Proveedor

```
                    ASIENTO GENERADO
┌──────────────────────────────────────────────────────┐
│  Fecha: [Fecha del pago]                             │
│  Descripción: Pago Factura XXXX - [Proveedor]       │
├──────────────────────────────────────────────────────┤
│  CUENTA                        │  DEBE    │  HABER  │
├────────────────────────────────┼──────────┼─────────┤
│  2.1.01 Proveedores (Pasivo)   │ $119.000 │         │
│  1.1.01 Banco/Caja (Activo)    │          │ $119.000│
├────────────────────────────────┼──────────┼─────────┤
│  TOTALES                       │ $119.000 │ $119.000│
└──────────────────────────────────────────────────────┘
```

**¿Dónde se registra este asiento?**
- **Jornalizador:** Directo al Libro Diario
- **Centralizador:** Libro Auxiliar de Tesorería

### 🛒 Procedimiento Paso a Paso

#### Para registrar una compra con contabilización:

1. **Crear Factura de Proveedor**
   - Ve a **Compras** → **Facturas de Proveedor**
   - Clic en "Nueva Factura"
   - Completa los datos (proveedor, productos, montos)
   - Selecciona **"Contabilizar automáticamente"** ✅

2. **Verificar en Libros Auxiliares** (si usas Centralizador)
   - Ve a **Contabilidad** → **Libros Auxiliares**
   - Selecciona el período actual
   - Verifica que aparezca en "Libro Auxiliar de Compras"

3. **Registrar el Pago** (cuando corresponda)
   - En la lista de facturas, busca la factura contabilizada
   - Clic en "Pagar"
   - Selecciona cuenta de pago (Banco/Caja)
   - Confirma el pago

4. **Verificar asiento de pago**
   - En **Libros Auxiliares**, el pago aparece en "Tesorería"
   - O en **Libro Diario** si usas Jornalizador

### ⚠️ Errores Comunes

| Error | Por qué ocurre | Solución |
|-------|----------------|----------|
| "No veo la transacción en Libros Auxiliares" | Sistema configurado como Jornalizador | Cambiar a Centralizador en Configuración |
| "Contabilicé la orden de compra" | Las OC no se contabilizan | Crear y contabilizar la Factura de Proveedor |
| "El asiento no aparece" | Factura en estado "Pendiente" | Contabilizar la factura |
| "No puedo pagar la factura" | Factura aún pendiente | Primero contabilizar, luego pagar |

### 📝 Resumen: ¿Qué genera contabilización?

| Documento | Acción | ¿Genera Asiento? | ¿Dónde? |
|-----------|--------|------------------|---------|
| Orden de Compra | Crear/Aprobar/Recibir | ❌ No | - |
| Factura Proveedor | **Contabilizar** | ✅ Sí | Compras |
| Factura Proveedor | **Pagar** | ✅ Sí | Tesorería |
| Pedido de Venta | Crear/Aprobar/Entregar | ❌ No | - |
| Factura Cliente | **Contabilizar** | ✅ Sí | Ventas |
| Factura Cliente | **Cobrar** | ✅ Sí | Tesorería |

---

## 🛍️ Flujo de Trabajo: Ventas y Cobros

Esta sección explica **cuándo y cómo** se generan las contabilizaciones en el módulo de Ventas y Tesorería.

### 📋 Ciclo de Ventas Completo

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       FLUJO DE VENTAS                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. PEDIDO DE VENTA          2. DESPACHO             3. FACTURA        │
│  ┌─────────────────┐         ┌─────────────────┐     ┌─────────────────┐│
│  │   📝 Borrador   │   ──▶   │   📦 Entregado  │ ──▶ │  📄 Pendiente   ││
│  │   (draft)       │         │   (delivered)    │     │  (pending)      ││
│  │                 │         │                  │     │                 ││
│  │ ❌ Sin contab.  │         │ ❌ Sin contab.   │     │ ❌ Sin contab.  ││
│  └────────┬────────┘         └──────────────────┘     └────────┬────────┘│
│           │                                                    │        │
│           ▼                                                    ▼        │
│  ┌─────────────────┐                                 ┌─────────────────┐│
│  │   ✅ Aprobado   │                                 │  ✅ CONTABILIZAR││
│  │   (approved)    │                                 │   (posted)      ││
│  │                 │                                 │                 ││
│  │ ❌ Sin contab.  │                                 │ ✅ GENERA       ││
│  └─────────────────┘                                 │    ASIENTO      ││
│                                                      └────────┬────────┘│
│                                                               │        │
│                                                               ▼        │
│                                                      ┌─────────────────┐│
│                                                      │  💰 COBRAR      ││
│                                                      │   (paid)        ││
│                                                      │                 ││
│                                                      │ ✅ GENERA       ││
│                                                      │    ASIENTO      ││
│                                                      └─────────────────┘│
└─────────────────────────────────────────────────────────────────────────┘
```

### 📊 Estados del Pedido de Venta

| Estado | Descripción | ¿Genera Contabilización? |
|--------|-------------|--------------------------|
| **Borrador** (draft) | Pedido en preparación, editable | ❌ No |
| **Aprobado** (approved) | Pedido confirmado por el cliente | ❌ No |
| **Entregado** (delivered) | Mercadería ya despachada | ❌ No |
| **Facturado** (invoiced) | Factura ya emitida | ❌ No (el pedido no, la factura sí) |
| **Anulado** (cancelled) | Pedido cancelado | ❌ No |

> ⚠️ **IMPORTANTE:** Los Pedidos de Venta **NO generan contabilización** porque representan un compromiso comercial, no una transferencia económica.

### 📊 Estados de la Factura de Venta (Cliente)

| Estado | Descripción | ¿Genera Contabilización? |
|--------|-------------|--------------------------|
| **Pendiente** (pending) | Factura emitida pero no contabilizada | ❌ No |
| **Contabilizada** (posted) | Factura registrada contablemente | ✅ **SÍ** - Asiento de venta |
| **Cobrada** (paid) | Factura cobrada completamente | ✅ **SÍ** - Asiento de cobro |
| **Anulada** (cancelled) | Factura anulada | ❌ No |

### 💡 ¿Cuándo se genera el asiento contable?

#### 1️⃣ Al CONTABILIZAR la Factura de Venta

```
                    ASIENTO GENERADO
┌──────────────────────────────────────────────────────┐
│  Fecha: [Fecha de la factura]                        │
│  Descripción: Factura XXXX - [Nombre Cliente]       │
├──────────────────────────────────────────────────────┤
│  CUENTA                        │  DEBE    │  HABER  │
├────────────────────────────────┼──────────┼─────────┤
│  1.1.05 Clientes (Activo)      │ $119.000 │         │
│  4.1.01 Ventas (Ingreso)       │          │ $100.000│
│  2.1.08 IVA Débito Fiscal      │          │  $19.000│
├────────────────────────────────┼──────────┼─────────┤
│  TOTALES                       │ $119.000 │ $119.000│
└──────────────────────────────────────────────────────┘
```

**¿Dónde se registra este asiento?**
- **Jornalizador:** Directo al Libro Diario
- **Centralizador:** Libro Auxiliar de Ventas

#### 2️⃣ Al COBRAR la Factura de Venta

```
                    ASIENTO GENERADO
┌──────────────────────────────────────────────────────┐
│  Fecha: [Fecha del cobro]                            │
│  Descripción: Cobro Factura XXXX - [Cliente]        │
├──────────────────────────────────────────────────────┤
│  CUENTA                        │  DEBE    │  HABER  │
├────────────────────────────────┼──────────┼─────────┤
│  1.1.01 Banco/Caja (Activo)    │ $119.000 │         │
│  1.1.05 Clientes (Activo)      │          │ $119.000│
├────────────────────────────────┼──────────┼─────────┤
│  TOTALES                       │ $119.000 │ $119.000│
└──────────────────────────────────────────────────────┘
```

**¿Dónde se registra este asiento?**
- **Jornalizador:** Directo al Libro Diario
- **Centralizador:** Libro Auxiliar de Tesorería

### 🏪 Procedimiento Paso a Paso (Ventas)

#### Para registrar una venta con contabilización:

1. **Crear Pedido de Venta** (opcional, pero recomendado)
   - Ve a **Ventas** → **Pedidos de Venta**
   - Clic en "Nuevo Pedido"
   - Completa datos del cliente y productos
   - Aprueba el pedido

2. **Realizar Despacho** (si hay inventario)
   - Desde el pedido, clic en "Despachar"
   - Confirma las cantidades entregadas
   - Esto actualiza el inventario

3. **Crear Factura de Venta**
   - Ve a **Ventas** → **Facturas de Cliente**
   - Crea la factura (puede ser desde el pedido o manual)
   - Selecciona **"Contabilizar automáticamente"** ✅

4. **Verificar en Libros Auxiliares** (si usas Centralizador)
   - Ve a **Contabilidad** → **Libros Auxiliares**
   - Verifica que aparezca en "Libro Auxiliar de Ventas"

5. **Registrar el Cobro** (cuando el cliente pague)
   - Ve a **Tesorería** → **Cuentas por Cobrar**
   - Busca la factura y clic en "Registrar Cobro"
   - Selecciona medio de pago y cuenta destino
   - Confirma el cobro

### ⚠️ Errores Comunes en Ventas

| Error | Por qué ocurre | Solución |
|-------|----------------|----------|
| "No veo la venta en Libros Auxiliares" | Sistema en modo Jornalizador | Cambiar a Centralizador |
| "Contabilicé el pedido de venta" | Los pedidos no se contabilizan | Crear y contabilizar la Factura |
| "El ingreso no aparece en resultados" | Factura en estado Pendiente | Contabilizar la factura |
| "No puedo cobrar la factura" | Factura aún no contabilizada | Primero contabilizar |
| "El cliente no aparece" | Cliente no existe en maestro | Crear cliente primero en Ventas → Clientes |

### 🔄 Diferencia entre Compras y Ventas

| Aspecto | Compras | Ventas |
|---------|---------|--------|
| **Documento origen** | Orden de Compra | Pedido de Venta |
| **Documento fiscal** | Factura Proveedor | Factura Cliente |
| **Cuenta tercero** | Proveedores (Pasivo) | Clientes (Activo) |
| **IVA** | Crédito Fiscal (a favor) | Débito Fiscal (a pagar) |
| **Resultado** | Gasto (Compras) | Ingreso (Ventas) |
| **Pago** | Nosotros pagamos | Nos pagan a nosotros |
| **Libro Auxiliar** | Compras | Ventas |

### 📊 Resumen Visual: Documentos vs Contabilización

```
┌────────────────────────────────────────────────────────────────────────┐
│                    DOCUMENTOS Y CONTABILIZACIÓN                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│   DOCUMENTOS OPERATIVOS              DOCUMENTOS CONTABLES              │
│   (NO contabilizan)                  (SÍ contabilizan)                 │
│   ┌──────────────────┐               ┌──────────────────┐              │
│   │ • Orden Compra   │               │ • Factura Prov.  │──▶ Compras   │
│   │ • Pedido Venta   │               │ • Factura Client │──▶ Ventas    │
│   │ • Cotizaciones   │               │ • Pago/Cobro     │──▶ Tesorería │
│   │ • Despachos      │               │                  │              │
│   └──────────────────┘               └──────────────────┘              │
│                                                                        │
│   💡 Los documentos operativos son de GESTIÓN                          │
│   💡 Los documentos contables generan ASIENTOS                         │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

## 📚 Referencias Normativas

- **NIC 1:** Presentación de Estados Financieros
- **Código de Comercio de Chile:** Art. 25-34 (Libros de contabilidad)
- **Práctica profesional:** Sistemas de información contable

---

**Versión:** 1.2  
**Fecha:** Enero 2026  
**Actualizaciones:**  
- v1.1: Agregada sección "Flujo de Trabajo: Compras y Tesorería"  
- v1.2: Agregada sección "Flujo de Trabajo: Ventas y Cobros"  
**Autor:** EDU-TRACE ERP - Sistema Educativo Contable
