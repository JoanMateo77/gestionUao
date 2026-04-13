// src/lib/validations/reservation.schema.ts
import { z } from 'zod';

export const createReservationSchema = z.object({
  salaId: z
    .number({ required_error: 'Seleccione una sala' })
    .int()
    .positive('Seleccione una sala válida'),
  fecha: z
    .string({ required_error: 'La fecha es requerida' })
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .refine(
      (val) => {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        return new Date(val + 'T00:00:00.000Z') >= today;
      },
      { message: 'No se pueden crear reservas en fechas pasadas' }
    ),
  horaInicio: z
    .string({ required_error: 'La hora de inicio es requerida' })
    .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  horaFin: z
    .string({ required_error: 'La hora de fin es requerida' })
    .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  motivo: z
    .string()
    .max(255, 'El motivo no puede exceder 255 caracteres')
    .optional()
    .default(''),
}).refine(
  (data) => {
    const [hI, mI] = data.horaInicio.split(':').map(Number);
    const [hF, mF] = data.horaFin.split(':').map(Number);
    const inicioMinutos = hI * 60 + mI;
    const finMinutos = hF * 60 + mF;
    return inicioMinutos < finMinutos;
  },
  { message: 'La hora de inicio debe ser anterior a la hora de fin', path: ['horaFin'] }
).refine(
  (data) => {
    const [h, m] = data.horaInicio.split(':').map(Number);
    const minutos = h * 60 + m;
    return minutos >= 7 * 60; // >= 07:00
  },
  { message: 'La hora de inicio no puede ser antes de las 7:00 AM (R-02)', path: ['horaInicio'] }
).refine(
  (data) => {
    const [h, m] = data.horaFin.split(':').map(Number);
    const minutos = h * 60 + m;
    return minutos <= 21 * 60 + 30; // <= 21:30
  },
  { message: 'La hora de fin no puede ser después de las 9:30 PM (R-02)', path: ['horaFin'] }
);

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

/** Schema para ajustar reserva (HU-11) — todos los campos opcionales */
export const adjustReservationSchema = z.object({
  salaId: z.number().int().positive().optional(),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha inválido (YYYY-MM-DD)')
    .refine(
      (val) => {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        return new Date(val + 'T00:00:00.000Z') >= today;
      },
      { message: 'No se pueden ajustar reservas a fechas pasadas' }
    )
    .optional(),
  horaInicio: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM').optional(),
  horaFin: z.string().regex(/^\d{2}:\d{2}$/, 'Formato HH:MM').optional(),
  motivo: z.string().max(255).optional(),
});

export type AdjustReservationInput = z.infer<typeof adjustReservationSchema>;
