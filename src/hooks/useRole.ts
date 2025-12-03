'use client'

import { useAuth } from '@/providers/auth-provider'
import { RolUsuario } from '@prisma/client'

/**
 * Hook para verificación de rol del usuario
 */
export function useRole() {
  const { getUserRole } = useAuth()

  /**
   * Verifica si el usuario tiene un rol específico
   */
  const hasRole = (rol: RolUsuario): boolean => {
    const currentRole = getUserRole()
    return currentRole === rol
  }

  /**
   * Verifica si el usuario tiene alguno de los roles especificados
   */
  const hasAnyRole = (roles: RolUsuario[]): boolean => {
    const currentRole = getUserRole()
    return currentRole ? roles.includes(currentRole) : false
  }

  /**
   * Verifica si el usuario es ciudadano
   */
  const isCiudadano = (): boolean => {
    return hasRole('CIUDADANO')
  }

  /**
   * Verifica si el usuario es abogado
   */
  const isAbogado = (): boolean => {
    return hasRole('ABOGADO')
  }

  /**
   * Verifica si el usuario es secretario
   */
  const isSecretario = (): boolean => {
    return hasRole('SECRETARIO')
  }

  /**
   * Verifica si el usuario es juez
   */
  const isJuez = (): boolean => {
    return hasRole('JUEZ')
  }

  return {
    role: getUserRole(),
    hasRole,
    hasAnyRole,
    isCiudadano,
    isAbogado,
    isSecretario,
    isJuez,
  }
}
