# SIGPJ - Sistema Integral de Gestión Procesal Judicial
## =Ë Development Tasks (4 Roles System)

**Project**: SIGPJ - Sistema de Gestión Procesal Judicial de Bolivia
**Stack**: Next.js 15 + React 19 + TypeScript + Supabase + Prisma + OpenAI Whisper
**Roles**: CIUDADANO, ABOGADO, SECRETARIO, JUEZ

---

##  COMPLETED TASKS

### Database & Schema
- [x] Setup Next.js 15 + TypeScript project
- [x] Configure Prisma ORM
- [x] Design Prisma schema with 4 roles system (16 models)
- [x] Create database enums (EstadoProceso, TipoProceso, RolUsuario, etc.)
- [x] Push schema to Supabase PostgreSQL
- [x] Generate Prisma Client
- [x] Validate schema integrity

---

## = IN PROGRESS TASKS

None currently

---

## =Ý PENDING TASKS

### PHASE 1: Authentication & User Management (Week 1-2)

#### 1.1 Supabase Auth Configuration
- [ ] Configure Supabase Auth in project
- [ ] Setup environment variables for Supabase
- [ ] Create auth context provider
- [ ] Configure auth middleware
- [ ] Setup protected routes

#### 1.2 Registration System (4 Roles)
- [ ] Create registration flow selector page (`/registro`)
- [ ] **Ciudadano Registration** (`/registro/ciudadano`)
  - [ ] Registration form with CI validation
  - [ ] Fields: CI, nombres, apellidos, email, telefono, domicilio
  - [ ] Bolivian CI format validation (12345678-LP)
  - [ ] Create Usuario with rol=CIUDADANO
  - [ ] Email verification flow
- [ ] **Abogado Registration** (`/registro/abogado`)
  - [ ] Registration form with professional license
  - [ ] Fields: registroAbogado, CI, nombres, apellidos, email, telefono
  - [ ] Professional license format validation (LP-12345)
  - [ ] Certificate upload (PDF)
  - [ ] Create Usuario with rol=ABOGADO
- [ ] **Secretary & Judge Registration** (`/admin/usuarios`)
  - [ ] Admin-only user creation interface
  - [ ] Assign to specific juzgado
  - [ ] Bulk user creation from CSV

#### 1.3 Login System
- [ ] Unified login page (`/login`)
- [ ] Role detection after login
- [ ] Redirect to appropriate dashboard based on role
- [ ] Remember me functionality
- [ ] Password recovery flow

#### 1.4 Role-Based Access Control (RBAC)
- [ ] Create role checking middleware
- [ ] Implement permission guards
- [ ] Setup route protection by role
- [ ] Create useRole() hook
- [ ] Create usePermissions() hook

---

### PHASE 2: Vinculación & Dashboards (Week 3-4)

#### 2.1 Ciudadano-Abogado Linking System
- [ ] **Search Lawyers** (`/abogados/buscar`)
  - [ ] Search interface with filters
  - [ ] Lawyer public profiles
  - [ ] Experience and specialization display
  - [ ] Success rate statistics
- [ ] **Request Representation**
  - [ ] Solicitud form with message
  - [ ] Create VinculacionAbogadoCiudadano record
  - [ ] Real-time notification to lawyer
- [ ] **Manage Requests** (`/abogado/solicitudes`)
  - [ ] List pending solicitudes
  - [ ] Accept/Reject with reason
  - [ ] Update vinculacion status
  - [ ] Notify citizen of decision
- [ ] **Active Vinculations**
  - [ ] Display current lawyer for citizen
  - [ ] Display client list for lawyer
  - [ ] Termination process with reason
  - [ ] Vinculación history

#### 2.2 Dashboard Ciudadano (`/ciudadano`)
- [ ] Main dashboard layout
- [ ] **My Processes** widget
  - [ ] Process cards with visual status
  - [ ] Countdown timers for deadlines
  - [ ] Next action indicators
  - [ ] Simple language (no legal terms)
- [ ] **Notifications** panel
  - [ ] Citation alerts
  - [ ] Document uploads by lawyer
  - [ ] Hearing reminders
  - [ ] Resolution notifications
- [ ] **My Lawyer** section
  - [ ] Current lawyer info
  - [ ] Quick chat access
  - [ ] Change lawyer button
- [ ] **Quick Actions**
  - [ ] Upload evidence
  - [ ] View calendar
  - [ ] Download documents

#### 2.3 Dashboard Abogado (`/abogado`)
- [ ] Main dashboard layout
- [ ] **Cases Overview** (Kanban view)
  - [ ] Urgent cases (red)
  - [ ] Upcoming deadlines (yellow)
  - [ ] On track (green)
- [ ] **Client List** widget
- [ ] **Deadline Calendar**
- [ ] **Representation Requests** badge
- [ ] **Quick Actions**
  - [ ] File new demanda
  - [ ] View all deadlines
  - [ ] Bulk document download

#### 2.4 Dashboard Secretario (`/secretario`)
- [ ] Main dashboard layout
- [ ] **Pending Citations** widget
- [ ] **Scheduled Hearings** calendar
- [ ] **New Demandas** for validation
- [ ] **Juzgado Statistics**
- [ ] **Quick Actions**
  - [ ] Register citation
  - [ ] Schedule hearing
  - [ ] Upload evidence

#### 2.5 Dashboard Juez (`/juez`)
- [ ] Main dashboard layout
- [ ] **Critical Deadlines** alert panel
- [ ] **Process Kanban** view
- [ ] **Today's Hearings**
- [ ] **Pending Sentences**
- [ ] **Performance Metrics**
- [ ] **Quick Actions**
  - [ ] Draft sentence
  - [ ] Enter virtual room
  - [ ] Sign resolutions

---

### PHASE 3: Chat System (Week 4)

#### 3.1 Real-time Chat Infrastructure
- [ ] Configure Supabase Realtime
- [ ] Create chat database triggers
- [ ] Setup WebSocket connections
- [ ] Implement message queue

#### 3.2 Chat Interface (`/chat/[procesoId]`)
- [ ] Chat UI component
- [ ] Message bubbles with timestamps
- [ ] File attachment support
- [ ] Typing indicators
- [ ] Read receipts
- [ ] Message search
- [ ] Chat history pagination

#### 3.3 Notifications
- [ ] New message indicators
- [ ] Desktop notifications (browser)
- [ ] Unread count badges
- [ ] Sound alerts (optional)

---

### PHASE 4: Process Management (Week 5-6)

#### 4.1 Process Creation & Management
- [ ] **New Process Wizard** (`/proceso/nuevo`)
  - [ ] Multi-step form
  - [ ] Auto-assign NUREJ
  - [ ] Judge assignment logic
  - [ ] Initial state setup
- [ ] **Process View** (`/proceso/[id]`)
  - [ ] Timeline visualization
  - [ ] Status indicator
  - [ ] Party information
  - [ ] Document list
  - [ ] Action buttons by role

#### 4.2 Process States & Transitions
- [ ] State machine implementation
- [ ] Automatic state transitions
- [ ] State change validations
- [ ] Audit log for changes

#### 4.3 Deadline Automation
- [ ] Automatic deadline calculation
- [ ] Business days calculator
- [ ] Holiday calendar integration
- [ ] Alert scheduling (5 days before)
- [ ] Deadline extension handling

---

### PHASE 5: Demanda Module (Week 6)

#### 5.1 Demanda Wizard (`/demanda/nueva`)
- [ ] **Step 1**: Party Information
  - [ ] Demandante data
  - [ ] Demandado data
  - [ ] Legal representation
- [ ] **Step 2**: Demanda Details
  - [ ] Designación del juez
  - [ ] Objeto de la demanda
  - [ ] Valor económico
- [ ] **Step 3**: Legal Foundation
  - [ ] Hechos (rich text editor)
  - [ ] Derecho aplicable
  - [ ] Petitorio
- [ ] **Step 4**: Evidence
  - [ ] Document upload (PDF)
  - [ ] File validation
  - [ ] SHA-256 hashing
- [ ] **Step 5**: Review & Submit
  - [ ] Preview in legal format
  - [ ] Art. 110 validation
  - [ ] Digital signature

#### 5.2 Demanda Validation
- [ ] Automatic Art. 110 compliance check
- [ ] Missing requirements detection
- [ ] Observation generation (Art. 113)
- [ ] 3-day correction timer
- [ ] Auto-admission if complete

#### 5.3 Secretary Review Interface
- [ ] New demandas queue
- [ ] Validation checklist
- [ ] Quick approve/observe buttons
- [ ] Observation form
- [ ] Admission decree generation

---

### PHASE 6: Citation Module (Week 7)

#### 6.1 Citation Management (`/citacion`)
- [ ] Citation creation form
- [ ] Citation types (Personal, Cédula, Edicto, Tácita)
- [ ] Attempt registration
- [ ] Evidence upload (photos)
- [ ] Geolocation capture
- [ ] Success/failure marking

#### 6.2 Digital Citation Methods
- [ ] **Personal Digital**
  - [ ] Email with confirmation link
  - [ ] Unique validation token
  - [ ] IP/timestamp logging
- [ ] **QR Code Citation**
  - [ ] QR generation
  - [ ] Mobile scanning app
  - [ ] Identity verification
- [ ] **Digital Edicts**
  - [ ] Public portal page
  - [ ] Search functionality
  - [ ] Auto-publication

#### 6.3 Response Period
- [ ] 30-day countdown timer
- [ ] Automatic rebeldía after expiry
- [ ] Response form for defendant
- [ ] Exception handling

---

### PHASE 7: Hearing Module (Week 8-9)

#### 7.1 Hearing Scheduling
- [ ] Calendar interface
- [ ] Automatic scheduling (5 days post-response)
- [ ] Conflict detection
- [ ] Rescheduling with justification
- [ ] Maximum 1 extension (15 days)

#### 7.2 Virtual Hearing Room (`/audiencia/[id]`)
- [ ] **Jitsi Meet Integration**
  - [ ] Room creation
  - [ ] Participant management
  - [ ] Screen sharing
  - [ ] Recording controls
- [ ] **Alternative: Daily.co**
  - [ ] API integration
  - [ ] Custom UI
  - [ ] Recording to cloud

#### 7.3 Hearing Features
- [ ] Participant check-in
- [ ] Evidence presentation screen
- [ ] Chat during hearing
- [ ] Attendance tracking
- [ ] Auto-save to Supabase Storage

#### 7.4 Transcription System
- [ ] **OpenAI Whisper Integration**
  - [ ] Audio extraction
  - [ ] API connection
  - [ ] Real-time transcription
  - [ ] Speaker identification
  - [ ] Transcript editing UI
  - [ ] Final transcript approval

---

### PHASE 8: Sentence Module (Week 10)

#### 8.1 Sentence Editor (`/sentencia/nueva`)
- [ ] **Template Structure (Art. 213)**
  - [ ] Encabezamiento section
  - [ ] Narrativa section
  - [ ] Motiva section
  - [ ] Resolutiva section
- [ ] Rich text editor
- [ ] Legal citation helper
- [ ] Jurisprudence search
- [ ] Auto-save drafts

#### 8.2 Sentence Processing
- [ ] Digital signature integration
- [ ] SHA-256 document hashing
- [ ] PDF generation
- [ ] Watermarking
- [ ] Immutable storage

#### 8.3 Notification System
- [ ] **For Citizens**
  - [ ] Simple language version
  - [ ] Result summary (WIN/LOSE/PARTIAL)
  - [ ] Next steps guide
- [ ] **For Lawyers**
  - [ ] Full technical version
  - [ ] Appeal deadline timer
  - [ ] Precedent analysis

---

### PHASE 9: Document Management (Week 11)

#### 9.1 Document Upload System
- [ ] Drag-and-drop interface
- [ ] Batch upload support
- [ ] File type validation
- [ ] Size limits (50MB)
- [ ] Virus scanning
- [ ] SHA-256 hash generation

#### 9.2 Document Viewer
- [ ] PDF viewer component
- [ ] Pagination
- [ ] Zoom controls
- [ ] Annotations (for judges)
- [ ] Download controls
- [ ] Print restrictions

#### 9.3 Digital Expediente
- [ ] Chronological document list
- [ ] Filter by type/date/party
- [ ] Bulk download as ZIP
- [ ] Access control by role
- [ ] Audit trail logging

---

### PHASE 10: Testing & Deployment (Week 12)

#### 10.1 Testing
- [ ] Unit tests for core functions
- [ ] Integration tests for workflows
- [ ] E2E tests for critical paths
  - [ ] Complete demanda flow
  - [ ] Citation process
  - [ ] Hearing participation
  - [ ] Sentence issuance
- [ ] Load testing (100 concurrent users)
- [ ] Security testing

#### 10.2 Performance Optimization
- [ ] Database query optimization
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Caching strategy

#### 10.3 Deployment
- [ ] Configure Vercel deployment
- [ ] Setup production environment
- [ ] Configure custom domain
- [ ] SSL certificates
- [ ] CDN configuration
- [ ] Monitoring setup
- [ ] Backup automation

#### 10.4 Documentation
- [ ] User manuals (per role)
- [ ] Video tutorials
- [ ] API documentation
- [ ] Admin guide
- [ ] Troubleshooting guide

---

### PHASE 11: Additional Features (Post-Launch)

#### 11.1 Analytics Dashboard
- [ ] Process duration metrics
- [ ] Compliance rates
- [ ] User activity stats
- [ ] Performance KPIs

#### 11.2 Mobile Responsiveness
- [ ] Responsive design audit
- [ ] Touch-optimized interfaces
- [ ] Mobile-specific features
- [ ] Progressive Web App

#### 11.3 Accessibility
- [ ] WCAG compliance
- [ ] Screen reader support
- [ ] Keyboard navigation
- [ ] High contrast mode
- [ ] Font size controls

#### 11.4 Advanced Features
- [ ] Bulk operations
- [ ] Export to Excel/CSV
- [ ] Advanced search
- [ ] Saved filters
- [ ] Email digest preferences

---

## =Ê TASK SUMMARY

**Total Tasks**: ~280
**Completed**: 7
**Pending**: ~273

### Priority Order:
1. **Critical**: Auth, Registration, RBAC (Phase 1)
2. **High**: Dashboards, Vinculación (Phase 2)
3. **High**: Demanda, Citation modules (Phase 5-6)
4. **Medium**: Chat, Hearings (Phase 3, 7)
5. **Low**: Analytics, Mobile (Phase 11)

### Estimated Timeline:
- **Week 1-2**: Auth & User Management
- **Week 3-4**: Dashboards & Vinculación
- **Week 5-6**: Process & Demanda
- **Week 7-8**: Citations & Contestation
- **Week 9-10**: Hearings & Sentences
- **Week 11-12**: Testing & Deployment

---

## <¯ NEXT IMMEDIATE TASKS

1. Configure Supabase Auth in project
2. Setup environment variables for Supabase
3. Create auth context provider
4. Build registration selector page
5. Implement Ciudadano registration form

---

**Note**: Tasks should be completed in order within each phase to maintain dependencies. Each completed task should be tested before moving to the next.