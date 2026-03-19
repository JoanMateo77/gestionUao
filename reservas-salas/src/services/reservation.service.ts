// src/services/reservation.service.ts
import { reservationRepository } from '@/repositories/reservation.repository';
import { roomRepository } from '@/repositories/room.repository';
import { createReservationSchema } from '@/lib/validations/reservation.schema';
import { audit } from '@/lib/audit';
import type { EstadoReserva } from '@prisma/client';

/**
 * Convierte string "HH:MM" a un Date con solo la parte de tiempo.
 * Prisma @db.Time() usa Date pero solo importa la hora.
 */
function timeStringToDate(time: string): Date {
  const [h, m] = time.split(':').map(Number);
  const d = new Date('2000-01-01T00:00:00.000Z');
  d.setUTCHours(h, m, 0, 0);
  return d;
}

export const reservationService = {
  /** Listar reservas según el rol del usuario */
  async list(params: {
    facultadId: number;
    usuarioId: number;
    rol: 'DOCENTE' | 'SECRETARIA';
    estado?: EstadoReserva;
    page?: number;
    limit?: number;
  }) {
    return reservationRepository.findAll({
      facultadId: params.facultadId,
      // DOCENTE solo ve sus propias reservas, SECRETARIA ve todas las de la facultad
      usuarioId: params.rol === 'DOCENTE' ? params.usuarioId : undefined,
      estado: params.estado,
      page: params.page,
      limit: params.limit,
    });
  },

  /** Crear reserva (DOCENTE + SECRETARIA) */
  async create(
    data: { salaId: number; fecha: string; horaInicio: string; horaFin: string; motivo?: string },
    usuarioId: number,
    facultadId: number,
    ip?: string
  ) {
    // Validar datos con Zod (incluye R-02: franja 7:00-21:30)
    const validated = createReservationSchema.parse(data);

    // Verificar que la sala existe, está habilitada y pertenece a la facultad
    const sala = await roomRepository.findById(validated.salaId);
    if (!sala) throw new Error('Sala no encontrada');
    if (!sala.habilitada) throw new Error('La sala no está habilitada para reservas');
    if (sala.facultadId !== facultadId) throw new Error('No puede reservar salas de otra facultad');

    // Convertir strings a Date
    const fecha = new Date(validated.fecha + 'T00:00:00.000Z');
    const horaInicio = timeStringToDate(validated.horaInicio);
    const horaFin = timeStringToDate(validated.horaFin);

    // Verificar no solapamiento (R-03, RF-11)
    const hasOverlap = await reservationRepository.checkOverlap(
      validated.salaId,
      fecha,
      horaInicio,
      horaFin
    );
    if (hasOverlap) {
      throw new Error('Ya existe una reserva confirmada en ese horario para esta sala (R-03)');
    }

    // Crear reserva
    const reserva = await reservationRepository.create({
      salaId: validated.salaId,
      usuarioId,
      fecha,
      horaInicio,
      horaFin,
      motivo: validated.motivo,
    });

    // Auditoría (RF-16)
    await audit({
      usuarioId,
      accion: 'CREAR_RESERVA',
      entidad: 'RESERVA',
      entidadId: reserva.id,
      datosNuevos: {
        salaId: reserva.salaId,
        fecha: validated.fecha,
        horaInicio: validated.horaInicio,
        horaFin: validated.horaFin,
        motivo: reserva.motivo,
      },
      ipAddress: ip,
    });

    return reserva;
  },

  /** Cancelar reserva (R-06: nunca eliminar, solo cancelar) */
  async cancel(
    reservaId: number,
    usuarioId: number,
    rol: 'DOCENTE' | 'SECRETARIA',
    facultadId: number,
    ip?: string
  ) {
    const reserva = await reservationRepository.findById(reservaId);
    if (!reserva) throw new Error('Reserva no encontrada');

    // DOCENTE solo cancela sus propias reservas, SECRETARIA todas las de su facultad
    if (rol === 'DOCENTE' && reserva.usuarioId !== usuarioId) {
      throw new Error('Solo puede cancelar sus propias reservas');
    }
    if (rol === 'SECRETARIA' && reserva.sala.facultadId !== facultadId) {
      throw new Error('No puede cancelar reservas de otra facultad');
    }

    if (reserva.estado === 'CANCELADA') {
      throw new Error('La reserva ya está cancelada');
    }

    const cancelled = await reservationRepository.cancel(reservaId, usuarioId);

    await audit({
      usuarioId,
      accion: 'CANCELAR_RESERVA',
      entidad: 'RESERVA',
      entidadId: reservaId,
      datosAnteriores: { estado: 'CONFIRMADA' },
      datosNuevos: { estado: 'CANCELADA', canceladoPor: usuarioId },
      ipAddress: ip,
    });

    return cancelled;
  },
};
