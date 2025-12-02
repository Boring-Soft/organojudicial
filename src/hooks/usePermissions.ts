'use client'

import { useRole } from './useRole'

/**
 * Hook para verificar permisos específicos del usuario
 */
export function usePermissions() {
  const { isJuez, isSecretario, isAbogado, isCiudadano } = useRole()

  /**
   * Verificar si el usuario puede ver un proceso
   */
  const canViewProcess = (): boolean => {
    // Jueces y secretarios pueden ver todos los procesos de su juzgado
    if (isJuez() || isSecretario()) return true
    
    // Abogados y ciudadanos solo pueden ver sus propios procesos
    // Esto debe verificarse con el ID del proceso en la BD
    return isAbogado() || isCiudadano()
  }

  /**
   * Verificar si el usuario puede editar un proceso
   */
  const canEditProcess = (): boolean => {
    // Solo jueces y secretarios pueden editar procesos
    return isJuez() || isSecretario()
  }

  /**
   * Verificar si el usuario puede crear una demanda
   */
  const canCreateDemanda = (): boolean => {
    // Solo abogados pueden crear demandas
    return isAbogado()
  }

  /**
   * Verificar si el usuario puede emitir sentencias
   */
  const canIssueSentence = (): boolean => {
    // Solo jueces pueden emitir sentencias
    return isJuez()
  }

  /**
   * Verificar si el usuario puede gestionar citaciones
   */
  const canManageCitaciones = (): boolean => {
    // Solo secretarios pueden gestionar citaciones
    return isSecretario()
  }

  /**
   * Verificar si el usuario puede programar audiencias
   */
  const canScheduleAudiencias = (): boolean => {
    // Secretarios y jueces pueden programar audiencias
    return isSecretario() || isJuez()
  }

  /**
   * Verificar si el usuario puede vincular con abogado
   */
  const canLinkWithAbogado = (): boolean => {
    // Solo ciudadanos pueden solicitar vinculación con abogados
    return isCiudadano()
  }

  /**
   * Verificar si el usuario puede aceptar clientes
   */
  const canAcceptClients = (): boolean => {
    // Solo abogados pueden aceptar clientes
    return isAbogado()
  }

  /**
   * Verificar si el usuario puede crear usuarios (admin)
   */
  const canCreateUsers = (): boolean => {
    // Por ahora, solo jueces pueden crear secretarios
    // Esto se puede ajustar cuando haya un rol ADMIN
    return isJuez()
  }

  /**
   * Verificar si el usuario puede subir documentos a un proceso
   */
  const canUploadDocuments = (): boolean => {
    // Jueces, secretarios y abogados pueden subir documentos
    return isJuez() || isSecretario() || isAbogado()
  }

  return {
    canViewProcess,
    canEditProcess,
    canCreateDemanda,
    canIssueSentence,
    canManageCitaciones,
    canScheduleAudiencias,
    canLinkWithAbogado,
    canAcceptClients,
    canCreateUsers,
    canUploadDocuments,
  }
}
