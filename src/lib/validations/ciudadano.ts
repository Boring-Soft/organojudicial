import { z } from 'zod'

/**
 * Schema de validación para registro de ciudadano
 */
export const ciudadanoRegistroSchema = z.object({
  // CI con formato boliviano: 12345678-LP
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
    .email('Email inválido')
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
  
  domicilio: z
    .string()
    .min(10, 'El domicilio debe tener al menos 10 caracteres')
    .max(500, 'El domicilio no puede exceder 500 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
})

export type CiudadanoRegistroInput = z.infer<typeof ciudadanoRegistroSchema>
