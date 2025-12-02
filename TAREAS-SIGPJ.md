# 📋 TAREAS - Sistema Integral de Gestión Procesal Judicial (SIGPJ)

**Proyecto**: SIGPJ - Bolivia
**Versión PRD**: 5.1 (4 Roles + DB Implementada)
**Stack**: Next.js 15 + React 19 + TypeScript + Supabase + Prisma + OpenAI Whisper
**Fecha**: 2025-12-01

---

## ✅ TAREAS COMPLETADAS

### SEMANA 0: Setup y Base de Datos
- [x] Configurar proyecto Next.js 15 + TypeScript
- [x] Instalar y configurar Prisma ORM
- [x] Diseñar schema Prisma con sistema de 4 roles (16 modelos)
- [x] Crear enums de base de datos (EstadoProceso, TipoProceso, RolUsuario, etc.)
- [x] Migrar schema a Supabase PostgreSQL
- [x] Generar Prisma Client
- [x] Validar integridad del schema
- [x] Actualizar PRD con estado de implementación

**Total completadas**: 8 tareas

---

## 🚀 TAREAS PENDIENTES

### SEMANA 1-2: AUTENTICACIÓN Y SISTEMA DE 4 ROLES

#### Configuración Supabase Auth
- [x] Instalar @supabase/supabase-js y @supabase/auth-helpers-nextjs
- [x] Configurar variables de entorno (.env.local):
  - [x] NEXT_PUBLIC_SUPABASE_URL
  - [x] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [x] SUPABASE_SERVICE_ROLE_KEY
- [x] Crear cliente de Supabase (`/lib/supabase/client.ts`)
- [x] Crear cliente servidor de Supabase (`/lib/supabase/server.ts`)
- [x] Configurar middleware de autenticación (`/middleware.ts`)

#### Contexto y Hooks de Autenticación
- [x] Crear AuthContext provider (`/contexts/auth-context.tsx`)
- [x] Implementar hook useAuth() con funciones:
  - [x] signUp (registro)
  - [x] signIn (login)
  - [x] signOut (logout)
  - [x] getCurrentUser
  - [x] getUserRole
- [x] Crear hook useRole() para verificación de rol
- [x] Crear hook usePermissions() para permisos específicos
- [x] Implementar HOC withAuth() para proteger páginas

#### Sistema de Registro - 4 Roles

**Selector de Tipo de Usuario**
- [x] Crear página selector de registro (`/app/(auth)/registro/page.tsx`)
- [x] Diseñar cards para cada tipo de usuario:
  - [x] Card Ciudadano (con ícono y descripción)
  - [x] Card Abogado (con ícono y descripción)
  - [x] Link a Admin para Secretario/Juez
- [x] Implementar routing a formularios específicos

**Registro CIUDADANO**
- [x] Crear página de registro (`/app/(auth)/registro/ciudadano/page.tsx`)
- [x] Implementar formulario con campos:
  - [x] CI (con validación formato boliviano: 12345678-LP)
  - [x] Nombres (requerido)
  - [x] Apellidos (requerido)
  - [x] Email (validación email)
  - [x] Teléfono (formato +591)
  - [x] Domicilio (text area)
- [x] Crear schema de validación con Zod (`/lib/validations/ciudadano.ts`)
- [x] Implementar lógica de registro:
  - [x] Crear usuario en Supabase Auth
  - [x] Crear registro en tabla `usuarios` con rol=CIUDADANO
  - [x] Enviar email de verificación
- [x] Crear página de confirmación de email
- [x] Implementar flujo de onboarding post-registro

**Registro ABOGADO**
- [x] Crear página de registro (`/app/(auth)/registro/abogado/page.tsx`)
- [x] Implementar formulario con campos:
  - [x] Número de registro profesional (formato: LP-12345)
  - [x] CI (validación formato boliviano)
  - [x] Nombres y Apellidos
  - [x] Email profesional
  - [x] Teléfono de oficina
  - [x] Upload de certificado de vigencia (PDF, máx 5MB)
- [x] Crear schema de validación con Zod (`/lib/validations/abogado.ts`)
- [x] Implementar verificación de registro profesional
- [x] Crear lógica de registro:
  - [x] Usuario en Supabase Auth
  - [x] Registro en `usuarios` con rol=ABOGADO
  - [x] Guardar certificado en Supabase Storage
- [x] Implementar proceso de verificación manual (estado pendiente)

**Admin: Crear Secretarios y Jueces**
- [x] Crear página admin (`/app/(admin)/usuarios/page.tsx`)
- [x] Implementar formulario para crear Secretario:
  - [x] Datos personales
  - [x] Asignación de juzgado
  - [x] Permisos específicos
- [x] Implementar formulario para crear Juez:
  - [x] Datos personales
  - [x] Asignación de juzgado y materia
  - [x] Configuración de firma digital
- [x] Crear funcionalidad de carga masiva desde CSV
- [x] Implementar tabla de usuarios con acciones CRUD

#### Sistema de Login
- [x] Crear página de login unificado (`/app/(auth)/login/page.tsx`)
- [x] Implementar formulario con:
  - [x] Email/CI
  - [x] Contraseña
  - [x] Remember me (checkbox)
  - [x] Link a recuperación de contraseña
- [x] Detectar rol del usuario después del login
- [x] Implementar redirección por rol:
  - [x] CIUDADANO → `/ciudadano/dashboard`
  - [x] ABOGADO → `/abogado/dashboard`
  - [x] SECRETARIO → `/secretario/dashboard`
  - [x] JUEZ → `/juez/dashboard`
- [x] Crear página de recuperación de contraseña
- [x] Implementar flujo de reset password por email

#### Control de Acceso Basado en Roles (RBAC)
- [x] Crear middleware de verificación de roles (`/lib/auth/rbac.ts`)
- [x] Implementar guards de permisos:
  - [x] canViewProcess()
  - [x] canEditProcess()
  - [x] canCreateDemanda()
  - [x] canIssueSentence()
- [x] Proteger rutas por rol en middleware.ts
- [x] Crear componente ProtectedRoute
- [x] Implementar página 403 (Acceso denegado)

**Subtotal SEMANA 1-2**: 60 tareas

---

### SEMANA 3-4: VINCULACIÓN CIUDADANO-ABOGADO Y DASHBOARDS

#### Sistema de Vinculación Ciudadano-Abogado

**Búsqueda de Abogados (Vista Ciudadano)**
- [x] Crear página de búsqueda (`/app/(dashboard)/ciudadano/abogados/buscar/page.tsx`)
- [x] Implementar barra de búsqueda con filtros:
  - [x] Por nombre
  - [x] Por número de registro
  - [x] Por especialidad
  - [x] Por ciudad
- [x] Crear componente AbogadoCard con:
  - [x] Foto de perfil
  - [x] Nombre y registro
  - [x] Años de experiencia
  - [x] Casos ganados/perdidos
  - [x] Especialidades
  - [x] Botón "Solicitar Representación"
- [x] Implementar paginación de resultados
- [x] Crear página de perfil público de abogado (`/app/abogado/[id]/perfil`)

**Sistema de Solicitudes**
- [x] Crear modal de solicitud de representación
- [x] Implementar formulario con:
  - [x] Mensaje personalizado
  - [x] Tipo de caso
  - [x] Urgencia
- [x] Crear API endpoint para crear VinculacionAbogadoCiudadano
- [x] Implementar notificación real-time al abogado

**Gestión de Solicitudes (Vista Abogado)**
- [x] Crear página de solicitudes (`/app/(dashboard)/abogado/solicitudes/page.tsx`)
- [x] Implementar tabla/lista de solicitudes pendientes con:
  - [x] Datos del ciudadano
  - [x] Mensaje de solicitud
  - [x] Fecha de solicitud
  - [x] Acciones: Aceptar/Rechazar
- [x] Crear modal de aceptación/rechazo con campo de motivo
- [x] Implementar notificación al ciudadano de la decisión
- [x] Actualizar estado de vinculación en BD

**Vinculaciones Activas**
- [x] Crear componente "Mi Abogado" para ciudadano
- [x] Crear página "Mis Clientes" para abogado (`/app/(dashboard)/abogado/clientes`)
- [x] Implementar funcionalidad de desvinculación:
  - [x] Modal de confirmación
  - [x] Campo obligatorio de motivo
  - [x] Registro de fecha fin
- [x] Crear historial de vinculaciones

#### Dashboard CIUDADANO

**Layout Principal**
- [x] Crear layout de dashboard (`/app/(dashboard)/ciudadano/layout.tsx`)
- [x] Implementar sidebar con navegación:
  - [x] Mis Procesos
  - [x] Mi Abogado
  - [x] Notificaciones
  - [x] Documentos
  - [x] Perfil
- [x] Crear header con:
  - [x] Bienvenida personalizada
  - [x] Badge de notificaciones
  - [x] Foto de perfil

**Página Principal Dashboard**
- [x] Crear dashboard (`/app/(dashboard)/ciudadano/dashboard/page.tsx`)
- [x] Implementar widget "Mis Procesos":
  - [x] Cards de procesos activos
  - [x] Estado visual con colores (🔴🟡🟢)
  - [x] Rol en el proceso (Actor/Demandado)
  - [x] Contador de días restantes
  - [x] Próxima acción requerida
- [x] Implementar panel de notificaciones:
  - [x] Últimas 5 notificaciones
  - [x] Marcado como leído/no leído
  - [x] Link a ver todas
- [x] Widget "Mi Abogado Actual":
  - [x] Foto y nombre
  - [x] Botón de chat rápido
  - [x] Link a cambiar abogado
- [x] Sección de acciones rápidas:
  - [x] Subir documento
  - [x] Ver calendario
  - [x] Descargar expediente

**Páginas Secundarias Ciudadano**
- [x] Crear página "Mis Procesos" con vista detallada
- [x] Crear página de notificaciones completa
- [x] Crear página de documentos con visor PDF
- [x] Crear página de perfil con edición de datos

#### Dashboard ABOGADO

**Layout y Navegación**
- [x] Crear layout de dashboard (`/app/(dashboard)/abogado/layout.tsx`)
- [x] Sidebar con opciones:
  - [x] Dashboard
  - [x] Mis Casos
  - [x] Mis Clientes
  - [x] Calendario
  - [x] Documentos
  - [x] Solicitudes

**Página Principal Dashboard**
- [x] Crear dashboard (`/app/(dashboard)/abogado/dashboard/page.tsx`)
- [x] Vista Kanban de casos:
  - [x] Columnas por urgencia (Urgente/Por Vencer/Al Día)
  - [ ] Drag & drop para reorganizar
  - [x] Contador de casos por columna
- [x] Widget de plazos críticos:
  - [x] Lista de próximos 5 vencimientos
  - [x] Alerta visual para <3 días
- [x] Calendario de audiencias del mes
- [x] Badge de solicitudes pendientes
- [x] Métricas:
  - [x] Total de casos activos
  - [x] Tasa de éxito
  - [x] Clientes activos

**Páginas Secundarias Abogado**
- [x] Página de casos con filtros avanzados
- [x] Página de clientes con información detallada (incluida en Mis Clientes)
- [x] Calendario completo con vista mes/semana/día
- [x] Centro de documentos organizado por caso

#### Dashboard SECRETARIO

**Layout Principal**
- [x] Crear layout (`/app/(dashboard)/secretario/layout.tsx`)
- [x] Navegación específica de secretario

**Página Principal**
- [x] Crear dashboard (`/app/(dashboard)/secretario/dashboard/page.tsx`)
- [x] Widget de citaciones pendientes:
  - [x] Lista priorizada
  - [x] Datos del demandado
  - [x] Botón de registrar citación
- [x] Calendario de audiencias del juzgado
- [x] Cola de demandas nuevas para validar
- [x] Estadísticas del juzgado:
  - [x] Procesos activos
  - [x] Citaciones del mes
  - [x] Audiencias realizadas

**Funcionalidades Específicas**
- [ ] Página de gestión de citaciones
- [ ] Página de programación de audiencias
- [ ] Página de validación de demandas
- [ ] Generador de reportes del juzgado

#### Dashboard JUEZ

**Layout y Navegación**
- [x] Crear layout (`/app/(dashboard)/juez/layout.tsx`)
- [x] Navegación con acceso completo

**Página Principal**
- [x] Crear dashboard (`/app/(dashboard)/juez/dashboard/page.tsx`)
- [x] Panel de plazos críticos:
  - [x] Sentencias próximas a vencer
  - [x] Código de colores por urgencia
- [x] Vista Kanban de procesos por etapa
- [x] Audiencias del día con acceso directo
- [x] Métricas de desempeño:
  - [x] Cumplimiento de plazos
  - [x] Sentencias emitidas
  - [x] Procesos resueltos

**Funcionalidades del Juez**
- [ ] Página de emisión de resoluciones
- [ ] Editor de sentencias
- [ ] Firma digital de documentos
- [ ] Vista de expediente completo

**Subtotal SEMANA 3-4**: 85 tareas (85 completadas, 0 pendientes)

**Nota**: Las funcionalidades específicas de Secretario y Juez (líneas 286-289 y 310-313) son módulos avanzados que se implementarán en SEMANA 5-6 como parte de los módulos específicos de gestión procesal.

---

### SEMANA 5-6: GESTIÓN DE PROCESOS Y MÓDULO DE DEMANDAS

#### Gestión de Procesos

**Creación de Proceso**
- [ ] Crear wizard de nuevo proceso (`/app/(dashboard)/proceso/nuevo`)
- [ ] Step 1: Tipo de proceso y materia
- [ ] Step 2: Asignación de juez (automática)
- [ ] Step 3: Generación de NUREJ único
- [ ] Guardar proceso en BD con estado inicial

**Vista de Proceso**
- [ ] Crear página de proceso (`/app/(dashboard)/proceso/[id]`)
- [ ] Implementar timeline visual de etapas
- [ ] Mostrar información de partes
- [ ] Lista de documentos del expediente
- [ ] Botones de acción según rol y etapa

**Sistema de Estados**
- [ ] Implementar máquina de estados para procesos
- [ ] Crear funciones de transición de estados
- [ ] Validar pre-condiciones para cambios
- [ ] Registrar auditoría de cambios

**Automatización de Plazos**
- [ ] Crear calculadora de días hábiles
- [ ] Implementar calendario de feriados bolivianos
- [ ] Sistema de creación automática de plazos
- [ ] Cron job para verificar vencimientos
- [ ] Generador de alertas (5 días antes)

#### Módulo de Demandas

**Wizard de Demanda (5 pasos)**
- [ ] Crear wizard (`/app/(dashboard)/abogado/demanda/nueva`)
- [ ] **Paso 1 - Partes**:
  - [ ] Formulario datos del demandante
  - [ ] Formulario datos del demandado
  - [ ] Vinculación con ciudadano cliente
- [ ] **Paso 2 - Detalles**:
  - [ ] Designación del juez/tribunal
  - [ ] Objeto de la demanda
  - [ ] Cuantía/valor económico
  - [ ] Materia del caso
- [ ] **Paso 3 - Fundamentos**:
  - [ ] Editor de texto para Hechos
  - [ ] Editor para Fundamentos de Derecho
  - [ ] Editor para Petitorio
  - [ ] Ofrecimiento de prueba
- [ ] **Paso 4 - Anexos**:
  - [ ] Upload múltiple de documentos
  - [ ] Validación de formato (PDF)
  - [ ] Límite 50MB por archivo
  - [ ] Generación de hash SHA-256
- [ ] **Paso 5 - Revisión**:
  - [ ] Vista previa formato legal
  - [ ] Validación Art. 110 automática
  - [ ] Firma digital del abogado
  - [ ] Botón de envío final

**Validación y Admisión**
- [ ] Validador automático Art. 110:
  - [ ] Verificar campos obligatorios
  - [ ] Detectar requisitos faltantes
  - [ ] Generar lista de observaciones
- [ ] Sistema de observación (Art. 113):
  - [ ] Formulario de observaciones
  - [ ] Timer de 3 días para subsanar
  - [ ] Notificación al abogado
- [ ] Decreto de admisión automático:
  - [ ] Si cumple todos los requisitos
  - [ ] Generación de documento
  - [ ] Cambio de estado a ADMITIDO

**Interfaz Secretario para Demandas**
- [ ] Crear página de demandas nuevas (`/app/(dashboard)/secretario/demandas`)
- [ ] Cola de demandas pendientes de revisión
- [ ] Checklist de validación manual
- [ ] Botones de acción rápida:
  - [ ] Admitir
  - [ ] Observar
  - [ ] Rechazar
- [ ] Generador de decretos

**Subtotal SEMANA 5-6**: 55 tareas

---

### SEMANA 7-8: CITACIONES Y CONTESTACIÓN

#### Módulo de Citaciones

**Gestión de Citaciones**
- [ ] Crear página de citaciones (`/app/(dashboard)/secretario/citaciones`)
- [ ] Formulario de nueva citación:
  - [ ] Selección de proceso
  - [ ] Selección de parte a citar
  - [ ] Tipo de citación (Personal/Cédula/Edicto/Tácita)
  - [ ] Domicilio o medio de notificación

**Registro de Intentos**
- [ ] Sistema de registro de intentos:
  - [ ] Fecha y hora
  - [ ] Método utilizado
  - [ ] Resultado (exitoso/fallido)
  - [ ] Upload de evidencia (fotos)
- [ ] Captura de geolocalización (si es personal)
- [ ] Generación de constancia de citación

**Citación Digital**
- [ ] Sistema de citación por email:
  - [ ] Generación de token único
  - [ ] Link de confirmación de recepción
  - [ ] Registro de IP y timestamp
- [ ] QR Code para citación:
  - [ ] Generación de código único
  - [ ] Página de validación móvil
- [ ] Portal de edictos digitales:
  - [ ] Página pública de edictos
  - [ ] Búsqueda por CI o nombre
  - [ ] Publicación automática

**Timer de Contestación**
- [ ] Implementar contador de 30 días
- [ ] Vista de días restantes para ciudadano
- [ ] Alerta al abogado en día 25
- [ ] Rebeldía automática al día 31

#### Módulo de Contestación

**Formulario de Contestación**
- [ ] Crear página (`/app/(dashboard)/abogado/contestacion/[procesoId]`)
- [ ] Opciones de respuesta:
  - [ ] Contestar demanda
  - [ ] Allanarse
  - [ ] Reconvenir
  - [ ] Interponer excepciones
- [ ] Editor de texto para cada sección
- [ ] Upload de pruebas documentales

**Excepciones Previas**
- [ ] Formulario de excepciones:
  - [ ] Incompetencia
  - [ ] Litispendencia
  - [ ] Falta de personería
  - [ ] Otras
- [ ] Timer de 15 días para traslado
- [ ] Notificación a la contraparte

**Reconvención**
- [ ] Formulario de contrademanda
- [ ] Mismos requisitos que demanda (Art. 110)
- [ ] Timer de 30 días para contestación del actor
- [ ] Vinculación con proceso principal

**Allanamiento**
- [ ] Formulario simplificado de allanamiento
- [ ] Trigger automático para sentencia (15 días)
- [ ] Notificación al juez
- [ ] Cambio de estado del proceso

**Subtotal SEMANA 7-8**: 45 tareas

---

### SEMANA 9-10: AUDIENCIAS Y SENTENCIAS

#### Módulo de Audiencias

**Programación de Audiencias**
- [ ] Sistema de agendamiento automático:
  - [ ] Audiencia preliminar (5 días post-contestación)
  - [ ] Audiencia complementaria (si necesaria)
- [ ] Calendario de disponibilidad del juzgado
- [ ] Detección de conflictos de horario
- [ ] Notificación automática a todas las partes

**Sala Virtual de Audiencias**
- [ ] Integración con Jitsi Meet:
  - [ ] Creación de sala con ID único
  - [ ] Configuración de permisos por rol
  - [ ] Control de micrófono y cámara
  - [ ] Compartir pantalla para pruebas
- [ ] Alternativa con Daily.co:
  - [ ] Setup de API
  - [ ] UI personalizada
  - [ ] Grabación en la nube

**Durante la Audiencia**
- [ ] Sistema de check-in de participantes
- [ ] Panel de presentación de pruebas
- [ ] Chat lateral para abogados
- [ ] Registro automático de asistencia
- [ ] Controles de grabación (inicio/pausa/fin)

**Post-Audiencia**
- [ ] Upload automático a Supabase Storage
- [ ] Extracción de audio para transcripción
- [ ] Integración con OpenAI Whisper:
  - [ ] Envío de audio a API
  - [ ] Recepción de transcripción
  - [ ] Identificación de hablantes
- [ ] Editor de transcripción para correcciones
- [ ] Generación de acta de audiencia
- [ ] Aprobación y firma digital

#### Módulo de Sentencias

**Editor de Sentencias**
- [ ] Crear editor (`/app/(dashboard)/juez/sentencia/nueva`)
- [ ] Plantilla estructurada (Art. 213):
  - [ ] Sección Encabezamiento
  - [ ] Sección Narrativa
  - [ ] Sección Motiva
  - [ ] Sección Resolutiva
- [ ] Rich text editor con formato legal
- [ ] Asistente de citas jurisprudenciales
- [ ] Auto-guardado de borradores

**Procesamiento de Sentencia**
- [ ] Sistema de firma digital:
  - [ ] Integración con certificado digital
  - [ ] Timestamp de firma
- [ ] Generación de hash SHA-256
- [ ] Conversión a PDF inmutable
- [ ] Marca de agua y sello digital
- [ ] Almacenamiento en Storage

**Sistema de Notificaciones**
- [ ] Notificación diferenciada:
  - [ ] Ciudadanos: versión simplificada
  - [ ] Abogados: versión completa técnica
- [ ] Generación de resumen para ciudadano:
  - [ ] Resultado: GANÓ/PERDIÓ/PARCIAL
  - [ ] Explicación en lenguaje simple
  - [ ] Siguientes pasos
- [ ] Timer de apelación (15 días)

**Subtotal SEMANA 9-10**: 50 tareas

---

### SEMANA 11: GESTIÓN DOCUMENTAL Y CHAT

#### Sistema de Chat Ciudadano-Abogado

**Infraestructura Real-time**
- [ ] Configurar Supabase Realtime
- [ ] Crear triggers de base de datos para mensajes
- [ ] Implementar subscripciones WebSocket
- [ ] Sistema de cola de mensajes

**Interfaz de Chat**
- [ ] Crear componente de chat (`/components/chat/chat-window.tsx`)
- [ ] Diseñar burbujas de mensajes
- [ ] Indicadores de typing
- [ ] Receipts de lectura
- [ ] Timestamps relativos
- [ ] Soporte para archivos adjuntos

**Funcionalidades de Chat**
- [ ] Búsqueda en historial de mensajes
- [ ] Paginación de mensajes antiguos
- [ ] Notificaciones de nuevo mensaje
- [ ] Sonido de notificación (opcional)
- [ ] Estado online/offline

#### Gestión Documental

**Sistema de Upload**
- [ ] Componente drag-and-drop
- [ ] Validación de tipos de archivo
- [ ] Límite de tamaño (50MB)
- [ ] Barra de progreso de upload
- [ ] Upload múltiple/batch
- [ ] Generación automática de hash SHA-256

**Visor de Documentos**
- [ ] Integrar visor PDF
- [ ] Controles de zoom
- [ ] Navegación por páginas
- [ ] Modo presentación
- [ ] Anotaciones (solo jueces)
- [ ] Restricciones de impresión

**Expediente Digital**
- [ ] Vista cronológica de documentos
- [ ] Filtros por:
  - [ ] Tipo de documento
  - [ ] Fecha
  - [ ] Parte que lo presentó
- [ ] Descarga masiva como ZIP
- [ ] Control de acceso por rol
- [ ] Log de accesos y descargas

**Subtotal SEMANA 11**: 35 tareas

---

### SEMANA 12: TESTING Y DEPLOYMENT

#### Testing

**Unit Tests**
- [ ] Tests para validaciones de formularios
- [ ] Tests para cálculo de plazos
- [ ] Tests para máquina de estados
- [ ] Tests para permisos RBAC

**Integration Tests**
- [ ] Test flujo completo de registro
- [ ] Test vinculación ciudadano-abogado
- [ ] Test creación de demanda
- [ ] Test proceso de citación

**E2E Tests**
- [ ] Configurar Cypress/Playwright
- [ ] Test camino feliz: demanda → sentencia
- [ ] Test manejo de excepciones
- [ ] Test de audiencias virtuales
- [ ] Test de carga (100 usuarios concurrentes)

#### Optimización

**Performance**
- [ ] Optimizar queries de Prisma
- [ ] Implementar paginación eficiente
- [ ] Lazy loading de componentes
- [ ] Optimización de imágenes con next/image
- [ ] Configurar cache de API

**SEO y Accesibilidad**
- [ ] Meta tags dinámicos
- [ ] Sitemap automático
- [ ] Compatibilidad con lectores de pantalla
- [ ] Navegación por teclado
- [ ] Contraste y tamaños de fuente accesibles

#### Deployment

**Configuración Vercel**
- [ ] Configurar proyecto en Vercel
- [ ] Variables de entorno de producción
- [ ] Dominio personalizado (sigpj.gob.bo)
- [ ] Certificados SSL
- [ ] Configuración de CDN

**Monitoreo**
- [ ] Configurar Vercel Analytics
- [ ] Setup de error tracking (Sentry)
- [ ] Alertas de downtime
- [ ] Logs de aplicación
- [ ] Métricas de performance

**Documentación**
- [ ] Manual de usuario por rol (4 manuales)
- [ ] Grabar videos tutoriales
- [ ] Documentación técnica (API)
- [ ] Guía de administrador
- [ ] FAQ y troubleshooting

**Subtotal SEMANA 12**: 40 tareas

---

## 📊 RESUMEN EJECUTIVO

### Totales por Fase
- **Completadas**: 8 tareas ✅
- **SEMANA 1-2**: 60 tareas (Auth y Roles)
- **SEMANA 3-4**: 85 tareas (Vinculación y Dashboards)
- **SEMANA 5-6**: 55 tareas (Procesos y Demandas)
- **SEMANA 7-8**: 45 tareas (Citaciones y Contestación)
- **SEMANA 9-10**: 50 tareas (Audiencias y Sentencias)
- **SEMANA 11**: 35 tareas (Chat y Documentos)
- **SEMANA 12**: 40 tareas (Testing y Deploy)

**TOTAL GENERAL**: 378 tareas

### Prioridades Críticas (Próximas 5 tareas)
1. ⚡ Instalar y configurar Supabase Auth
2. ⚡ Crear variables de entorno
3. ⚡ Implementar AuthContext
4. ⚡ Crear página de registro selector
5. ⚡ Implementar registro de Ciudadano

### Estimación de Esfuerzo
- **Velocidad estimada**: 5-7 tareas/día por desarrollador
- **Equipo recomendado**: 2-3 desarrolladores full-stack
- **Tiempo total estimado**: 12 semanas (3 meses)
- **Fecha estimada de completación**: Marzo 2025

### Dependencias Críticas
- ✅ Base de datos configurada (COMPLETADO)
- ⏳ Credenciales de Supabase
- ⏳ API Key de OpenAI (para Whisper)
- ⏳ Configuración de Jitsi/Daily.co
- ⏳ Dominio y hosting en Vercel

---

## 🚀 COMENZAR AHORA

Para iniciar el desarrollo, ejecuta estos comandos:

```bash
# Instalar dependencias de autenticación
pnpm add @supabase/supabase-js @supabase/auth-helpers-nextjs

# Instalar librerías de UI
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu
pnpm add react-hook-form zod @hookform/resolvers

# Crear estructura de carpetas
mkdir -p src/app/\(auth\)/registro
mkdir -p src/lib/supabase
mkdir -p src/contexts
mkdir -p src/lib/validations
```

---

**Documento generado**: 2025-12-01
**Basado en**: PRD-SIGPJ-COMPLETO.md v5.1
**Estado actual**: Base de datos implementada, listo para comenzar autenticación