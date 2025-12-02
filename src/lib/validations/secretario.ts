import { z } from 'zod'

/**
 * Schema de validación para registro de Secretario
 * Los secretarios son creados por administradores del sistema
 */
export const secretarioRegistroSchema = z
  .object({
    // Datos personales
    ci: z
      .string()
      .min(1, 'La cédula de identidad es requerida')
      .regex(
        /^\d{7,8}(-[A-Z]{2,3})?$/,
        'Formato inválido. Usa el formato: 12345678-LP'
      ),
    nombres: z
      .string()
      .min(2, 'Los nombres deben tener al menos 2 caracteres')
      .max(100, 'Los nombres no pueden exceder 100 caracteres'),
    apellidos: z
      .string()
      .min(2, 'Los apellidos deben tener al menos 2 caracteres')
      .max(100, 'Los apellidos no pueden exceder 100 caracteres'),
    email: z
      .string()
      .email('Email inválido')
      .min(1, 'El email es requerido'),
    telefono: z
      .string()
      .regex(/^\+591\d{8}$/, 'Formato inválido. Debe ser +591 seguido de 8 dígitos'),

    // Asignación de juzgado
    juzgado: z
      .string()
      .min(1, 'El juzgado es requerido')
      .max(200, 'El nombre del juzgado no puede exceder 200 caracteres'),

    // Contraseña inicial
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
      .regex(/[a-z]/, 'Debe contener al menos una minúscula')
      .regex(/[0-9]/, 'Debe contener al menos un número'),
    confirmPassword: z.string(),

    // Permisos específicos (opcional, por defecto tendrán permisos de secretario)
    permisos: z.array(z.string()).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  })

export type SecretarioRegistroInput = z.infer<typeof secretarioRegistroSchema>

/**
 * Schema de validación para actualización de Secretario
 */
export const secretarioUpdateSchema = z.object({
  ci: z
    .string()
    .regex(
      /^\d{7,8}(-[A-Z]{2,3})?$/,
      'Formato inválido. Usa el formato: 12345678-LP'
    )
    .optional(),
  nombres: z
    .string()
    .min(2, 'Los nombres deben tener al menos 2 caracteres')
    .max(100, 'Los nombres no pueden exceder 100 caracteres')
    .optional(),
  apellidos: z
    .string()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .max(100, 'Los apellidos no pueden exceder 100 caracteres')
    .optional(),
  telefono: z
    .string()
    .regex(/^\+591\d{8}$/, 'Formato inválido. Debe ser +591 seguido de 8 dígitos')
    .optional(),
  juzgado: z
    .string()
    .min(1, 'El juzgado es requerido')
    .max(200, 'El nombre del juzgado no puede exceder 200 caracteres')
    .optional(),
  activo: z.boolean().optional(),
  permisos: z.array(z.string()).optional(),
})

export type SecretarioUpdateInput = z.infer<typeof secretarioUpdateSchema>
