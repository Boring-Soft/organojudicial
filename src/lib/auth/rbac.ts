import { RolUsuario } from '@prisma/client'
import { createClient } from '@/lib/supabase/client'

/**
 * Sistema de Control de Acceso Basado en Roles (RBAC)
 * Define permisos y validaciones para cada rol del sistema
 */

// Tipo para permisos del sistema
export type Permission =
  | 'view_process'
  | 'edit_process'
  | 'create_demanda'
  | 'edit_demanda'
  | 'delete_demanda'
  | 'view_all_processes'
  | 'assign_process'
  | 'create_citacion'
  | 'edit_citacion'
  | 'schedule_audiencia'
  | 'edit_audiencia'
  | 'issue_sentence'
  | 'edit_sentence'
  | 'view_expediente'
  | 'download_expediente'
  | 'upload_document'
  | 'delete_document'
  | 'manage_users'
  | 'view_reports'
  | 'send_notification'
  | 'chat_with_client'
  | 'chat_with_lawyer'
  | 'approve_lawyer'
  | 'link_to_lawyer'

// Mapa de permisos por rol
export const ROLE_PERMISSIONS: Record<RolUsuario, Permission[]> = {
  CIUDADANO: [
    'view_process', // Ver sus propios procesos
    'view_expediente', // Ver expediente de sus procesos
    'download_expediente', // Descargar documentos
    'upload_document', // Subir documentos a sus procesos
    'chat_with_lawyer', // Chat con su abogado
    'link_to_lawyer', // Solicitar vinculación con abogado
  ],
  ABOGADO: [
    'view_process', // Ver procesos de sus clientes
    'create_demanda', // Crear demandas
    'edit_demanda', // Editar sus demandas
    'view_expediente', // Ver expedientes
    'download_expediente', // Descargar documentos
    'upload_document', // Subir documentos
    'chat_with_client', // Chat con clientes
    'send_notification', // Enviar notificaciones a clientes
  ],
  SECRETARIO: [
    'view_all_processes', // Ver todos los procesos del juzgado
    'assign_process', // Asignar procesos
    'create_citacion', // Crear citaciones
    'edit_citacion', // Editar citaciones
    'schedule_audiencia', // Programar audiencias
    'edit_audiencia', // Editar audiencias
    'view_expediente', // Ver expedientes
    'download_expediente', // Descargar documentos
    'upload_document', // Subir documentos oficiales
    'send_notification', // Enviar notificaciones
    'view_reports', // Ver reportes del juzgado
  ],
  JUEZ: [
    'view_all_processes', // Ver todos los procesos
    'edit_process', // Editar estado de procesos
    'view_expediente', // Ver expedientes completos
    'download_expediente', // Descargar expedientes
    'upload_document', // Subir documentos
    'issue_sentence', // Emitir sentencias
    'edit_sentence', // Editar sentencias (borradores)
    'schedule_audiencia', // Programar audiencias
    'edit_audiencia', // Editar audiencias
    'send_notification', // Enviar notificaciones
    'view_reports', // Ver reportes
    'approve_lawyer', // Aprobar registro de abogados
  ],
}

/**
 * Verificar si un rol tiene un permiso específico
 */
export function hasPermission(rol: RolUsuario, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[rol]
  return permissions.includes(permission)
}

/**
 * Verificar si un rol tiene todos los permisos especificados
 */
export function hasAllPermissions(rol: RolUsuario, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(rol, permission))
}

/**
 * Verificar si un rol tiene al menos uno de los permisos especificados
 */
export function hasAnyPermission(rol: RolUsuario, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(rol, permission))
}

/**
 * Obtener el rol del usuario actual desde la base de datos
 */
export async function getCurrentUserRole(): Promise<RolUsuario | null> {
  try {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', user.id)
      .single()

    if (error || !data) {
      console.error('Error getting user role:', error)
      return null
    }

    return data.rol as RolUsuario
  } catch (error) {
    console.error('Error in getCurrentUserRole:', error)
    return null
  }
}

/**
 * Guards de permisos específicos
 */

/**
 * Verificar si el usuario puede ver un proceso
 */
export async function canViewProcess(userId: string, procesoId: string): Promise<boolean> {
  try {
    const supabase = createClient()

    // Obtener rol del usuario
    const { data: userData } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', userId)
      .single()

    if (!userData) return false

    const rol = userData.rol as RolUsuario

    // Jueces y Secretarios pueden ver todos los procesos
    if (hasPermission(rol, 'view_all_processes')) {
      return true
    }

    // Ciudadanos pueden ver procesos donde son parte
    if (rol === 'CIUDADANO') {
      const { data: proceso } = await supabase
        .from('procesos')
        .select('actor_id, demandado_id')
        .eq('id', procesoId)
        .single()

      return proceso
        ? proceso.actor_id === userId || proceso.demandado_id === userId
        : false
    }

    // Abogados pueden ver procesos de sus clientes
    if (rol === 'ABOGADO') {
      // Verificar si el abogado representa a alguna de las partes
      const { data: proceso } = await supabase
        .from('procesos')
        .select(
          `
          actor_id,
          demandado_id,
          actor:usuarios!procesos_actor_id_fkey(
            vinculaciones_ciudadano:vinculaciones_abogado_ciudadano!vinculaciones_abogado_ciudadano_ciudadano_id_fkey(
              abogado_id,
              activo
            )
          ),
          demandado:usuarios!procesos_demandado_id_fkey(
            vinculaciones_demandado:vinculaciones_abogado_ciudadano!vinculaciones_abogado_ciudadano_ciudadano_id_fkey(
              abogado_id,
              activo
            )
          )
        `
        )
        .eq('id', procesoId)
        .single()

      if (!proceso) return false

      // Verificar si el abogado tiene vinculación activa con alguna de las partes
      const actorVinculaciones =
        (proceso.actor as unknown as {
          vinculaciones_ciudadano: { abogado_id: string; activo: boolean }[]
        })?.vinculaciones_ciudadano || []
      const demandadoVinculaciones =
        (proceso.demandado as unknown as {
          vinculaciones_demandado: { abogado_id: string; activo: boolean }[]
        })?.vinculaciones_demandado || []

      const tieneVinculacion = [...actorVinculaciones, ...demandadoVinculaciones].some(
        (v) => v.abogado_id === userId && v.activo
      )

      return tieneVinculacion
    }

    return false
  } catch (error) {
    console.error('Error in canViewProcess:', error)
    return false
  }
}

/**
 * Verificar si el usuario puede editar un proceso
 */
export async function canEditProcess(userId: string, procesoId: string): Promise<boolean> {
  try {
    const supabase = createClient()

    const { data: userData } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', userId)
      .single()

    if (!userData) return false

    const rol = userData.rol as RolUsuario

    // Solo Jueces y Secretarios pueden editar procesos
    return hasPermission(rol, 'edit_process')
  } catch (error) {
    console.error('Error in canEditProcess:', error)
    return false
  }
}

/**
 * Verificar si el usuario puede crear una demanda
 */
export async function canCreateDemanda(userId: string): Promise<boolean> {
  try {
    const rol = await getCurrentUserRole()
    if (!rol) return false

    return hasPermission(rol, 'create_demanda')
  } catch (error) {
    console.error('Error in canCreateDemanda:', error)
    return false
  }
}

/**
 * Verificar si el usuario puede emitir una sentencia
 */
export async function canIssueSentence(userId: string, procesoId: string): Promise<boolean> {
  try {
    const supabase = createClient()

    const { data: userData } = await supabase
      .from('usuarios')
      .select('rol')
      .eq('id', userId)
      .single()

    if (!userData) return false

    const rol = userData.rol as RolUsuario

    // Solo los Jueces pueden emitir sentencias
    if (!hasPermission(rol, 'issue_sentence')) {
      return false
    }

    // Verificar que el juez está asignado al proceso
    const { data: proceso } = await supabase
      .from('procesos')
      .select('juez_id')
      .eq('id', procesoId)
      .single()

    return proceso ? proceso.juez_id === userId : false
  } catch (error) {
    console.error('Error in canIssueSentence:', error)
    return false
  }
}

/**
 * Verificar si un usuario tiene acceso a una ruta específica
 */
export function canAccessRoute(rol: RolUsuario, pathname: string): boolean {
  // Rutas públicas
  const publicRoutes = ['/login', '/registro', '/recuperar-contrasena', '/auth']
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return true
  }

  // Rutas por rol
  if (pathname.startsWith('/ciudadano') && rol === 'CIUDADANO') return true
  if (pathname.startsWith('/abogado') && rol === 'ABOGADO') return true
  if (pathname.startsWith('/secretario') && rol === 'SECRETARIO') return true
  if (pathname.startsWith('/juez') && rol === 'JUEZ') return true

  // Rutas compartidas
  if (pathname.startsWith('/proceso')) {
    return ['CIUDADANO', 'ABOGADO', 'SECRETARIO', 'JUEZ'].includes(rol)
  }

  return false
}

/**
 * Obtener la ruta del dashboard según el rol
 */
export function getDashboardRoute(rol: RolUsuario): string {
  const dashboardRoutes: Record<RolUsuario, string> = {
    CIUDADANO: '/ciudadano/dashboard',
    ABOGADO: '/abogado/dashboard',
    SECRETARIO: '/secretario/dashboard',
    JUEZ: '/juez/dashboard',
  }

  return dashboardRoutes[rol] || '/dashboard'
}
