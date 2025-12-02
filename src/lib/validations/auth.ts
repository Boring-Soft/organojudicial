import { z } from 'zod'

/**
 * Schema de validación para login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email o CI es requerido')
    .refine(
      (value) => {
        // Validar si es email o CI boliviano
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        const isCI = /^\d{7,8}(-[A-Z]{2,3})?$/.test(value)
        return isEmail || isCI
      },
      {
        message: 'Ingresa un email válido o CI boliviano (ej: 12345678-LP)',
      }
    ),
  password: z.string().min(1, 'La contraseña es requerida'),
  rememberMe: z.boolean().optional(),
})

export type LoginInput = z.infer<typeof loginSchema>

/**
 * Schema de validación para recuperación de contraseña
 */
export const resetPasswordRequestSchema = z.object({
  email: z.string().email('Ingresa un email válido'),
})

export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>

/**
 * Schema de validación para nueva contraseña
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
