# 📘 Guía de Funcionalidades - SIGPJ
## Sistema Integrado de Gestión de Procesos Judiciales

---

## 🎯 Resumen Ejecutivo

El SIGPJ es un sistema judicial digital que permite la gestión completa de procesos judiciales desde la presentación de una demanda hasta la sentencia final, involucrando a 4 roles principales: **Ciudadano**, **Abogado**, **Secretario** y **Juez**.

---

## 👥 Roles y Funcionalidades

### 🧑 ROL: CIUDADANO

El ciudadano es principalmente un **rol de consulta y seguimiento**. No puede iniciar procesos directamente, sino que debe contratar un abogado.

#### ✅ Funcionalidades Disponibles:

1. **Dashboard Personal**
   - Ver resumen de sus procesos (como actor o demandado)
   - Notificaciones pendientes
   - Próximas audiencias
   - Documentos recientes

2. **Mis Procesos** (`/ciudadano/procesos`)
   - **Consultar** procesos donde es parte (actor o demandado)
   - Ver estado actual del proceso
   - Ver próximas acciones y plazos
   - Filtrar por estado y tipo
   - Ver detalles: NUREJ, materia, contraparte, cuantía

3. **Buscar y Contratar Abogado** (`/ciudadano/abogados/buscar`)
   - Buscar abogados por especialidad
   - Ver perfil completo del abogado
   - Ver calificaciones y casos ganados
   - **Enviar solicitud de representación**
   - Ver estado de solicitudes (pendiente/aceptada/rechazada)

4. **Mi Abogado** (`/ciudadano/mi-abogado`)
   - Ver datos del abogado asignado
   - Ver vinculaciones activas
   - Chat directo con el abogado
   - Ver histórico de casos

5. **Notificaciones** (`/ciudadano/notificaciones`)
   - Recibir notificaciones de:
     - Nuevas demandas en su contra
     - Admisión/rechazo de demandas
     - Citaciones
     - Audiencias programadas
     - Sentencias
     - Resoluciones
   - Marcar como leídas

6. **Documentos** (`/ciudadano/documentos`)
   - Ver documentos del proceso
   - Descargar sentencias
   - Descargar resoluciones
   - Ver decretos

7. **Perfil** (`/ciudadano/perfil`)
   - Actualizar datos personales
   - Cambiar contraseña
   - Ver historial de procesos

#### ⚠️ Limitaciones del Ciudadano:

- ❌ **NO puede crear demandas** (debe hacerlo su abogado)
- ❌ **NO puede presentar documentos** (lo hace su abogado)
- ❌ **NO puede contestar demandas** (lo hace su abogado)
- ❌ **NO puede asistir a audiencias directamente** (va con su abogado)
- ✅ **SÍ puede**: Consultar, recibir notificaciones, buscar abogado, seguir su proceso

---

### 👨‍💼 ROL: ABOGADO

El abogado es el **representante legal** del ciudadano y quien ejecuta todas las acciones procesales.

#### ✅ Funcionalidades Disponibles:

1. **Dashboard del Abogado**
   - Procesos activos
   - Plazos críticos
   - Próximas audiencias
   - Solicitudes de clientes pendientes

2. **Gestión de Solicitudes** (`/abogado/solicitudes`)
   - Ver solicitudes de representación de ciudadanos
   - **Aceptar o rechazar** solicitudes
   - Ver información del solicitante

3. **Crear Nueva Demanda** (`/abogado/demanda/nueva`)
   - **Paso 1**: Información del Proceso
     - Tipo de proceso (Civil, Familia, Laboral, Penal)
     - Materia
     - Vía procesal
   - **Paso 2**: Partes del Proceso
     - Agregar actor(es) - sus clientes
     - Agregar demandado(s)
     - Datos completos: CI, domicilio, teléfono, email
   - **Paso 3**: Contenido de la Demanda
     - Objeto de la demanda
     - Pretensión
     - Fundamentación (hechos)
     - Fundamentación legal (derecho)
     - Cuantía
   - **Paso 4**: Anexos
     - Cargar documentos PDF
     - Pruebas documentales
     - Poder del abogado
   - **Paso 5**: Revisión y Firma
     - Vista previa de la demanda
     - **Presentar oficialmente**

4. **Mis Procesos**
   - Ver procesos donde representa partes
   - Filtrar por cliente, estado, tipo
   - Acceso rápido a cada proceso

5. **Contestación de Demanda** (`/abogado/contestacion/[procesoId]`)
   - Si su cliente es demandado, puede:
     - **Allanarse** a la demanda
     - **Contestar** la demanda (admitir/negar hechos)
     - **Oponer excepciones** procesales
     - **Presentar reconvención** (contrademandar)

6. **Mis Documentos**
   - Ver documentos de todos sus procesos
   - Cargar nuevos documentos
   - Organizar por proceso

7. **Audiencias**
   - Ver audiencias de sus procesos
   - Unirse a salas virtuales (Jitsi Meet)

8. **Notificaciones**
   - Decretos del secretario
   - Resoluciones del juez
   - Fechas de audiencias
   - Sentencias

---

### 👔 ROL: SECRETARIO

El secretario **recepciona, valida y deriva** los procesos al juez correspondiente.

#### ✅ Funcionalidades Disponibles:

1. **Dashboard del Secretario**
   - Demandas pendientes de validación
   - Procesos del juzgado
   - Citaciones pendientes
   - Audiencias programadas

2. **Gestión de Demandas** (`/secretario/demandas`)
   - Ver demandas presentadas
   - **Validar según Art. 110 del Código Civil**:
     - Verificar datos completos
     - Verificar fundamentación
     - Verificar anexos
   - **Generar Decreto Judicial**:
     - ✅ **Admisión**: Si cumple requisitos
     - ⚠️ **Observación**: Si falta algo (plazo 3 días para subsanar)
     - ❌ **Rechazo**: Si no cumple requisitos esenciales
   - Asignar juez al proceso
   - Generar NUREJ automáticamente

3. **Gestión de Citaciones** (`/secretario/citaciones`)
   - Crear citaciones para demandados
   - Tipos de citación:
     - Personal
     - Por cédula
     - Por edicto
     - Tácita
   - Métodos:
     - Presencial
     - Email
     - Cédula
     - Edicto digital
   - Registrar intentos de citación
   - Validar citación exitosa

4. **Programación de Audiencias** (`/secretario/audiencias`)
   - Crear audiencias virtuales
   - Tipos:
     - Audiencia Preliminar
     - Audiencia Complementaria
   - Asignar sala virtual (Jitsi Meet)
   - Verificar disponibilidad del juez
   - Notificar a las partes

5. **Gestión de Procesos del Juzgado**
   - Ver todos los procesos del juzgado
   - Seguimiento de plazos
   - Generación de reportes

---

### ⚖️ ROL: JUEZ

El juez es quien **dirige el proceso y toma las decisiones judiciales**.

#### ✅ Funcionalidades Disponibles:

1. **Dashboard del Juez** (`/juez/dashboard`)
   - **Métricas Reales**:
     - Procesos activos
     - Sentencias emitidas
     - Cumplimiento de plazos
     - Plazos críticos
   - Procesos por etapa (Kanban visual)
   - Audiencias del día
   - Plazos próximos a vencer

2. **Mis Procesos** (`/juez/procesos`)
   - Ver procesos **asignados por el secretario**
   - Filtros por estado y búsqueda
   - Ver detalles completos:
     - Partes con sus abogados
     - Demanda completa
     - Plazos activos
     - Cuantía
   - Acciones rápidas:
     - Ver expediente
     - Ir a audiencias
     - Crear resolución
     - Emitir sentencia
   - **Tabs**:
     - Todos
     - Urgentes (plazos ≤ 3 días)
     - Activos

3. **Audiencias** (`/juez/audiencias`)
   - Ver audiencias asignadas
   - **Iniciar audiencia** en la hora programada
   - Unirse a sala virtual
   - Ver:
     - Hoy
     - Programadas
     - En curso
     - Finalizadas

4. **Resoluciones** (`/juez/resoluciones`)
   - **Crear resoluciones judiciales**:
     - **Providencia**: Decisión de trámite simple
     - **Auto Interlocutorio**: Resuelve incidente procesal
     - **Auto Definitivo**: Decide sobre cuestión de fondo
   - Seleccionar proceso
   - Redactar contenido completo
   - Registro automático en expediente
   - Notificación automática a las partes

5. **Sentencias** (`/juez/sentencias`)
   - **Emitir sentencias** según Art. 213:
     - Encabezamiento
     - Narrativa (hechos probados)
     - Motiva (fundamentos jurídicos)
     - Resolutiva (decisión)
   - Asignar resultado:
     - Favorable/Desfavorable/Parcial para actor
     - Favorable/Desfavorable/Parcial para demandado
   - Firma digital
   - Notificación simplificada a ciudadanos

6. **Gestión de Plazos**
   - El sistema calcula plazos automáticamente
   - Alertas de plazos críticos
   - Cumplimiento de plazos procesales

---

## 🔄 Flujo Completo de un Proceso Judicial

### Fase 1: Inicio del Proceso

```
CIUDADANO → busca ABOGADO → envía solicitud
    ↓
ABOGADO → acepta representación
    ↓
ABOGADO → crea DEMANDA (5 pasos)
    ↓
ABOGADO → presenta DEMANDA oficialmente
    ↓
Sistema → genera NUREJ automático
    ↓
DEMANDA → queda en estado BORRADOR
```

### Fase 2: Validación (Secretaría)

```
SECRETARIO → recibe demanda
    ↓
SECRETARIO → valida según Art. 110
    ↓
SECRETARIO → genera DECRETO:

    Opción A: ADMISIÓN
        ↓
        Asigna JUEZ
        ↓
        Estado: ADMITIDO
        ↓
        Crea CITACIÓN para demandado

    Opción B: OBSERVACIÓN
        ↓
        Plazo 3 días para subsanar
        ↓
        ABOGADO corrige
        ↓
        Vuelve a validación

    Opción C: RECHAZO
        ↓
        Proceso termina
        ↓
        Notifica a las partes
```

### Fase 3: Citación y Contestación

```
SECRETARIO → crea citación
    ↓
Sistema → notifica a DEMANDADO (su ciudadano)
    ↓
DEMANDADO → ve notificación
    ↓
DEMANDADO → contacta su ABOGADO
    ↓
ABOGADO del demandado → CONTESTA demanda:
    - Allanamiento
    - Contestación (admite/niega hechos)
    - Excepciones
    - Reconvención
    ↓
Plazo: 30 días hábiles
```

### Fase 4: Audiencia Preliminar

```
SECRETARIO → programa audiencia
    ↓
Sistema → crea sala virtual (Jitsi Meet)
    ↓
Sistema → notifica a JUEZ y ABOGADOS
    ↓
JUEZ → inicia audiencia en la fecha/hora
    ↓
ABOGADOS → se unen a la sala
    ↓
CIUDADANOS → pueden asistir con sus abogados
    ↓
JUEZ → dirige la audiencia
    ↓
Sistema → registra acta de audiencia
```

### Fase 5: Prueba (si aplica)

```
JUEZ → admite o rechaza pruebas
    ↓
ABOGADOS → presentan pruebas documentales
    ↓
SECRETARIO → programa audiencia complementaria
    ↓
JUEZ → valora las pruebas
```

### Fase 6: Sentencia

```
JUEZ → redacta sentencia (Art. 213):
    - Encabezamiento
    - Narrativa
    - Motiva
    - Resolutiva
    ↓
JUEZ → firma digitalmente
    ↓
Sistema → notifica a ABOGADOS
    ↓
ABOGADOS → notifican a sus CIUDADANOS
    ↓
CIUDADANOS → ven resultado en notificaciones
    ↓
Proceso → FINALIZADO
```

---

## 📊 Matriz de Permisos por Rol

| Funcionalidad | Ciudadano | Abogado | Secretario | Juez |
|--------------|-----------|---------|------------|------|
| **Ver sus procesos** | ✅ Solo lectura | ✅ Completo | ✅ Del juzgado | ✅ Asignados |
| **Crear demanda** | ❌ | ✅ | ❌ | ❌ |
| **Validar demanda** | ❌ | ❌ | ✅ | ❌ |
| **Generar decretos** | ❌ | ❌ | ✅ | ✅ |
| **Contestar demanda** | ❌ | ✅ | ❌ | ❌ |
| **Crear citaciones** | ❌ | ❌ | ✅ | ❌ |
| **Programar audiencias** | ❌ | ❌ | ✅ | ❌ |
| **Dirigir audiencias** | 👀 Observar | ✅ Participar | ❌ | ✅ Dirigir |
| **Crear resoluciones** | ❌ | ❌ | ✅ | ✅ |
| **Emitir sentencias** | ❌ | ❌ | ❌ | ✅ |
| **Ver documentos** | ✅ Del proceso | ✅ De sus casos | ✅ Del juzgado | ✅ Asignados |
| **Recibir notificaciones** | ✅ | ✅ | ✅ | ✅ |
| **Buscar abogado** | ✅ | ❌ | ❌ | ❌ |

---

## 🔔 Sistema de Notificaciones

### Ciudadano recibe notificaciones de:
- Nueva demanda en su contra
- Admisión de su demanda
- Rechazo de su demanda
- Citación (si es demandado)
- Audiencia programada
- Resoluciones del juez
- Sentencia final

### Abogado recibe notificaciones de:
- Nueva solicitud de cliente
- Decreto del secretario (admisión/observación/rechazo)
- Citación de su cliente (si es demandado)
- Audiencia programada
- Resoluciones del juez
- Sentencia
- Plazos próximos a vencer

### Secretario recibe notificaciones de:
- Nueva demanda presentada
- Subsanación de demanda observada
- Citación exitosa
- Documentos presentados

### Juez recibe notificaciones de:
- Nuevo proceso asignado
- Contestación de demanda recibida
- Documentos nuevos en el expediente
- Plazos próximos a vencer

---

## 📝 Estados de un Proceso

1. **BORRADOR** - Demanda creada pero no presentada
2. **PRESENTADO** - Demanda presentada, pendiente de validación
3. **EN_REVISION** - Secretario está validando
4. **OBSERVADO** - Secretario requiere correcciones
5. **ADMITIDO** - Secretario admitió la demanda
6. **RECHAZADO** - Secretario rechazó la demanda
7. **CITACION_PENDIENTE** - Esperando citación del demandado
8. **CONTESTACION_PENDIENTE** - Esperando contestación del demandado
9. **AUDIENCIA_PRELIMINAR** - En fase de audiencia preliminar
10. **AUDIENCIA_COMPLEMENTARIA** - En audiencia complementaria
11. **PRUEBA** - En fase de prueba
12. **SENTENCIA** - Pendiente de sentencia
13. **FINALIZADO** - Proceso terminado con sentencia

---

## 🎓 Guía Rápida por Rol

### Para CIUDADANOS:

1. **Registrarse** en el sistema
2. **Buscar un abogado** especializado
3. **Enviar solicitud** de representación
4. **Esperar** que el abogado acepte
5. El abogado creará la demanda en tu nombre
6. **Seguir el proceso** desde tu dashboard
7. **Recibir notificaciones** de cada etapa
8. **Ver documentos** cuando estén disponibles
9. **Asistir a audiencias** con tu abogado (opcional)
10. **Recibir la sentencia** final

### Para ABOGADOS:

1. **Aceptar solicitudes** de clientes
2. **Crear demandas** completas (5 pasos)
3. **Presentar demandas** oficialmente
4. Si tu cliente es demandado: **contestar la demanda**
5. **Cargar documentos** probatorios
6. **Asistir a audiencias** virtuales
7. **Seguir plazos** críticos
8. **Notificar a tu cliente** de cada etapa

### Para SECRETARIOS:

1. **Recibir demandas** presentadas
2. **Validar** según Art. 110
3. **Generar decreto** (admisión/observación/rechazo)
4. Si admite: **asignar juez**
5. **Crear citaciones** para demandados
6. **Programar audiencias** cuando corresponda
7. **Seguimiento** de procesos del juzgado

### Para JUECES:

1. **Ver procesos asignados** por el secretario
2. **Revisar expedientes** completos
3. **Dirigir audiencias** virtuales
4. **Emitir resoluciones** según necesidad
5. **Emitir sentencias** finales
6. **Cumplir plazos** procesales
7. **Monitorear métricas** de desempeño

---

## 🔐 Seguridad y Permisos

- ✅ Cada rol solo ve sus procesos correspondientes
- ✅ Los ciudadanos solo ven procesos donde son parte
- ✅ Los abogados solo ven procesos donde representan
- ✅ Los secretarios solo ven procesos de su juzgado
- ✅ Los jueces solo ven procesos asignados a ellos
- ✅ Todas las acciones están auditadas
- ✅ Firma digital en sentencias y resoluciones

---

## 📞 Soporte

Para más información sobre funcionalidades específicas, consultar:
- `PRD-SIGPJ-COMPLETO.md` - Especificación completa del sistema
- `TAREAS-SIGPJ.md` - Tareas implementadas por semana

---

**Versión:** 1.0
**Última actualización:** Diciembre 2024
**Sistema:** SIGPJ - Sistema Integrado de Gestión de Procesos Judiciales
