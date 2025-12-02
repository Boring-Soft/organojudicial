import { z } from 'zod'

/**
 * Schema de validación para registro de abogado
 */
export const abogadoRegistroSchema = z.object({
  // Número de registro profesional: LP-12345
  numeroRegistro: z
    .string()
    .min(1, 'El número de registro profesional es requerido')
    .regex(
      /^[A-Z]{2,3}-\d{4,6}$/,
      'Formato inválido. Ejemplo: LP-12345'
    ),
  
  ci: z
    .string()
    .min(1, 'La Cédula de Identidad es requerida')
    .regex(
      /^\d{6,8}-[A-Z]{2,3}$/,
      'Formato inválido. Ejemplo: 12345678-LP'
    ),
  
  nombres: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  
  apellidos: z
    .string()
    .min(2, 'Los apellidos deben tener al menos 2 caracteres')
    .max(100, 'Los apellidos no pueden exceder 100 caracteres'),
  
  email: z
    .string()
    .email('Email profesional inválido')
    .toLowerCase(),
  
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  
  confirmPassword: z.string(),
  
  telefono: z
    .string()
    .regex(
      /^\+591[67]\d{7}$/,
      'Formato inválido. Debe iniciar con +591 seguido de 8 dígitos'
    ),
  
  // Certificado de vigencia (se maneja como File)
  certificado: z
    .any()
    .refine((files) => files?.length > 0, 'El certificado de vigencia es requerido')
    .refine(
      (files) => files?.[0]?.size <= 5 * 1024 * 1024,
      'El archivo no debe exceder 5MB'
    )
    .refine(
      (files) => ['application/pdf'].includes(files?.[0]?.type),
      'Solo se permiten archivos PDF'
    ),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type AbogadoRegistroInput = z.infer<typeof abogadoRegistroSchema>
