// src/lib/validations/room.schema.ts
import { z } from 'zod';

export const createRoomSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  ubicacion: z
    .string()
    .max(200, 'La ubicación no puede exceder 200 caracteres')
    .optional()
    .default(''),
  capacidad: z
    .number({ required_error: 'La capacidad es requerida' })
    .int('La capacidad debe ser un número entero')
    .min(2, 'La capacidad mínima es 2 personas')
    .max(100, 'La capacidad máxima es 100 personas'),
});

export const updateRoomSchema = z.object({
  nombre: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  ubicacion: z
    .string()
    .max(200, 'La ubicación no puede exceder 200 caracteres')
    .optional(),
  capacidad: z
    .number()
    .int('La capacidad debe ser un número entero')
    .min(2, 'La capacidad mínima es 2 personas')
    .max(100, 'La capacidad máxima es 100 personas')
    .optional(),
});

export const updateRoomStatusSchema = z.object({
  habilitada: z.boolean({ required_error: 'El estado es requerido' }),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type UpdateRoomStatusInput = z.infer<typeof updateRoomStatusSchema>;
