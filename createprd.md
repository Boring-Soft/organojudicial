# PRD - Sistema Integral de Gestión Procesal Judicial (SIGPJ)

## 1. VISIÓN DEL PRODUCTO
Digitalizar completamente el proceso ordinario del Órgano Judicial de Bolivia (Ley 439), eliminando expedientes físicos, automatizando plazos y permitiendo gestión 100% digital desde demanda hasta sentencia.

## 2. OBJETIVOS
- Reducir tiempo promedio de proceso ordinario en 40%
- Eliminar uso de papel en 95%
- Automatizar cálculo y alertas de plazos procesales
- Permitir acceso 24/7 a expedientes digitales
- Integrar con sistemas existentes (ÉFORO, SIREJ)

## 3. USUARIOS
- **Jueces**: Gestión de casos, emisión de resoluciones, audiencias
- **Secretarios**: Administración de expedientes, notificaciones
- **Abogados**: Presentación de escritos, seguimiento de casos
- **Partes**: Acceso a expediente, recepción de notificaciones
- **Oficiales de Diligencias**: Gestión de citaciones

## 4. MÓDULOS CORE

### 4.1 GESTIÓN DE PROCESOS
**Funcionalidades:**
- Dashboard con vista Kanban (Preliminar ’ Cautelares ’ Admisión ’ Citación ’ Audiencia Preliminar ’ Audiencia Complementaria ’ Sentencia)
- Timeline visual del expediente con todos los actos procesales
- Semáforo de plazos (Verde: >5 días, Amarillo: 2-5 días, Rojo: <2 días)
- Alertas automáticas 5 días antes de vencimiento
- Filtros: por estado, juez, tipo, demandante, demandado

**Reglas de negocio:**
- Estado inicial: "Borrador" ’ Pasa a "Admitido" tras decreto Art. 363
- Cada cambio de estado requiere resolución judicial
- Registro inmutable de todas las acciones con timestamp

### 4.2 PRESENTACIÓN DE DEMANDAS
**Funcionalidades:**
- Formulario guiado con validación en tiempo real (Art. 110)
- Campos obligatorios: designación del juez/tribunal, nombre/domicilio partes, objeto de la demanda, hechos, derecho, petitorio, valor, firma abogado
- Upload de anexos (PDF, máx 50MB por archivo)
- Vista previa de demanda antes de envío
- Estado: Borrador ’ Presentada ’ Observada (Art. 113) ’ Admitida (Art. 363)

**Validaciones automáticas:**
- Si falta algún requisito Art. 110 ’ Decreto defectuoso (3 días para subsanar)
- Si es manifiestamente improponible ’ Rechazo con resolución motivada
- Una vez completa ’ Decreto de admisión automático

### 4.3 MEDIDAS CAUTELARES
**Funcionalidades:**
- Solicitud antes o durante el proceso (Art. 310)
- Formulario específico: tipo de medida, fundamentación, prueba
- Timer automático: 30 días desde ejecución para presentar demanda principal
- Alerta al día 25 al solicitante
- Al día 30: levantamiento automático si no hay demanda

**Tipos soportados:**
- Anotación preventiva
- Embargo preventivo
- Intervención judicial
- Secuestro
- Prohibición de innovar y contratar

### 4.4 CITACIONES DIGITALES
**Funcionalidades:**
- **Citación personal digital**: Email + SMS con link único de confirmación + geolocalización
- **Citación por cédula 2.0**: QR code generado con validación de identidad (integración SEGIP)
- **Edictos digitales**: Publicación en portal web oficial (eliminar periódicos físicos)
- **Citación tácita**: Registro automático de primera actuación del demandado
- Registro de todos los intentos con fecha/hora/método

**Plazo:**
- 30 días para contestación desde citación válida (Art. 247-I)
- Contador regresivo visible para el demandado

### 4.5 CONTESTACIÓN Y EXCEPCIONES
**Funcionalidades:**
- Formulario de contestación con editor de texto enriquecido
- Opciones: Contestar, Allanarse, Reconvenir, Excepciones previas
- **Excepciones previas**: Incompetencia, litispendencia, falta de personería, etc. (15 días para traslado)
- **Reconvención**: Contra-demanda con requisitos Art. 110 (30 días para contestación de activo)
- Upload de prueba documental

**Reglas:**
- Si se allana (Art. 127-II) ’ Sentencia automática en 15 días
- Si no contesta en 30 días ’ Rebeldía automática (Art. 364)

### 4.6 AUDIENCIAS VIRTUALES
**Funcionalidades:**
- **Audiencia Preliminar (Art. 366)**: Se convoca automáticamente 5 días después de vencido plazo de contestación
  - Ratificación de demanda y contestación
  - Conciliación (el juez puede proponer acuerdo)
  - Prueba de excepciones
  - Saneamiento procesal
- **Audiencia Complementaria (Art. 368)**: Si no se completó prueba (15 días)
- Sala virtual integrada con grabación automática
- Transcripción en texto de toda la audiencia
- Presentación de pruebas digitales en pantalla compartida
- Registro de asistencia automático
- Reprogramación solo por fuerza mayor debidamente acreditada

**Reglas:**
- No se puede suspender audiencia complementaria (salvo fuerza mayor)
- Extensión única de 15 días si prueba externa pendiente

### 4.7 SENTENCIAS Y RESOLUCIONES
**Funcionalidades:**
- **Editor de sentencias** con plantilla obligatoria Art. 213:
  - Encabezamiento (proceso, partes, objeto)
  - Narrativa (exposición sucinta de hechos)
  - Motiva (estudio de hechos probados/no probados, valoración de prueba, citas legales)
  - Resolutiva (decisión sobre pretensiones)
- Asistente de jurisprudencia (búsqueda en base de datos de fallos similares)
- Firma digital certificada (integración AGETIC)
- Notificación automática a todas las partes

**Plazos:**
- Máximo 20 días para diferir fundamentación (Art. 216)
- Alerta al juez al día 15
- Registro de retraso para estadísticas (válida pero con sanción administrativa)

### 4.8 EXPEDIENTE DIGITAL ÚNICO
**Funcionalidades:**
- Vista cronológica de todos los actos procesales
- Cada documento con hash SHA-256 para verificación de integridad
- Control de acceso por rol:
  - Juez/Secretario: acceso total
  - Abogado de parte: solo documentos de expediente
  - Parte sin abogado: vista simplificada
- Histórico de accesos con IP y timestamp
- Descarga de expediente completo en PDF
- Sistema de versiones para resoluciones enmendadas

### 4.9 GESTIÓN DE PLAZOS AUTOMATIZADA
**Funcionalidades:**
- Calculadora automática de plazos procesales
- Considera días hábiles judiciales
- Excluye feriados nacionales y departamentales
- Dashboard de plazos por vencer para jueces/secretarios
- Notificaciones push/email/SMS configurables
- Reporte de incumplimiento de plazos por proceso/juez/materia

### 4.10 INTEROPERABILIDAD
**Integraciones necesarias:**
- **ÉFORO**: Recepción de casos por sorteo, envío de estados
- **SIREJ**: Sincronización de datos del proceso (NUREJ, WebID)
- **SEGIP**: Validación de identidad para citaciones y firmas
- **AGETIC**: Certificación de firma digital
- **Portal de Edictos Judiciales**: Publicación automática
- **Sistema de Notificaciones**: Email, SMS (integrar con proveedor)

## 5. ARQUITECTURA TÉCNICA

### Stack:
- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Backend**: Next.js API Routes + Prisma ORM
- **Base de datos**: PostgreSQL (Supabase)
- **Autenticación**: Supabase Auth
- **Storage**: Supabase Storage (documentos PDF)
- **UI**: Radix UI + Tailwind CSS
- **Firma digital**: Integración con AGETIC
- **Videoconferencia**: Jitsi Meet (self-hosted) o integración con Daily.co

### Modelos de datos principales:
```typescript
Proceso {
  id, nurej, tipo, estado, juzgado, materia, cuantia,
  fechaInicio, fechaEstimadaFin, partes[], plazos[],
  documentos[], audiencias[], resoluciones[]
}

Demanda {
  id, procesoId, demandante, demandado, objeto, hechos,
  derecho, petitorio, valor, anexos[], estado, fechaAdmision
}

Citacion {
  id, procesoId, demandadoId, tipo, intentos[],
  fechaValidacion, metodo, geolocalizacion, evidencia
}

Audiencia {
  id, procesoId, tipo, fecha, sala, asistentes[],
  grabacionUrl, transcripcion, pruebas[], estado
}

Sentencia {
  id, procesoId, fecha, narrativa, motiva, resolutiva,
  firmaDigital, estadoNotificacion
}

Plazo {
  id, procesoId, tipo, fechaInicio, fechaVencimiento,
  diasRestantes, estado, alertasEnviadas
}
```

## 6. ROLES Y PERMISOS

| Rol | Permisos |
|-----|----------|
| **Juez** | CRUD procesos, emitir resoluciones, dirigir audiencias, firmar sentencias |
| **Secretario** | CRUD expediente, notificaciones, citar partes, agendar audiencias |
| **Abogado** | Presentar escritos, ver expediente de sus casos, asistir audiencias |
| **Parte** | Ver su expediente, recibir notificaciones, aportar pruebas |
| **Oficial** | Ejecutar citaciones, reportar intentos, adjuntar evidencia |
| **Admin Sistema** | Gestión de usuarios, configuración, estadísticas globales |

## 7. MÉTRICAS DE ÉXITO

- **Tiempo promedio proceso ordinario**: < 180 días (objetivo: reducir de 300)
- **Tasa de digitalización**: 95% de documentos digitales
- **Cumplimiento de plazos**: >80% de resoluciones dentro de plazo
- **Satisfacción usuarios**: NPS >70
- **Adopción**: 100% juzgados civiles usando el sistema en 12 meses
- **Citaciones efectivas**: >90% en primer intento con sistema digital

## 8. FASES DE IMPLEMENTACIÓN

### FASE 1 - MVP (8 semanas)
- Módulo de procesos con dashboard Kanban
- Presentación de demandas digitales
- Gestión básica de expediente
- Sistema de usuarios y permisos
- Piloto con 3 juzgados civiles

### FASE 2 - Citaciones y Contestación (6 semanas)
- Sistema de citaciones digitales
- Formularios de contestación y excepciones
- Gestión de plazos automatizada
- Integración con SEGIP

### FASE 3 - Audiencias (6 semanas)
- Salas virtuales
- Grabación y transcripción
- Gestión de pruebas digitales
- Calendario de audiencias

### FASE 4 - Sentencias (4 semanas)
- Editor de sentencias
- Firma digital AGETIC
- Notificaciones automáticas
- Historial de resoluciones

### FASE 5 - Integraciones (6 semanas)
- ÉFORO, SIREJ
- Portal de edictos
- SMS/Email masivo
- API pública para abogados

### FASE 6 - Rollout Nacional (12 semanas)
- Capacitación masiva
- Despliegue departamental escalonado
- Soporte y monitoreo 24/7

## 9. CONSIDERACIONES LEGALES

- Cumplimiento Ley 439 (Código Procesal Civil)
- Ley 1173 (Abreviación Procesal y Digitalización)
- Decreto Supremo firma digital AGETIC
- Reglamento de protección de datos personales
- Protocolos de aplicación del Tribunal Supremo de Justicia

## 10. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Resistencia al cambio de jueces | Alta | Alto | Capacitación intensiva, soporte dedicado, embajadores internos |
| Baja conectividad en áreas rurales | Media | Alto | Modo offline, sincronización posterior, híbrido papel-digital |
| Falta de infraestructura tecnológica | Media | Medio | Partnership con AGETIC, equipamiento gradual |
| Brecha digital en usuarios | Alta | Medio | Interfaz simplificada, asistencia telefónica, videos tutoriales |
| Integración con sistemas legacy | Alta | Alto | APIs robustas, equipo dedicado de integración |

---

**Aprobado por**: [Pending]
**Fecha**: 2025-12-01
**Versión**: 1.0
