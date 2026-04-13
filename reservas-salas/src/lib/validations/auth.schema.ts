// src/lib/validations/auth.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  correo: z
    .string()
    .email('Correo inválido')
    .refine(
      (val) => val.toLowerCase().endsWith('@uao.edu.co'),
      { message: 'Solo se permiten correos institucionales (@uao.edu.co)' }
    ),
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña no puede exceder 50 caracteres'),
  facultadId: z
    .number({ required_error: 'Seleccione una facultad' })
    .int()
    .positive('Seleccione una facultad válida'),
});

export const loginSchema = z.object({
  correo: z.string().email('Correo inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
