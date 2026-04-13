// src/repositories/reservation.repository.ts
import { prisma } from '@/lib/prisma';
import type { EstadoReserva } from '@prisma/client';

export const reservationRepository = {
  /** Listar reservas con filtros */
  async findAll(params: {
    facultadId: number;
    usuarioId?: number;
    estado?: EstadoReserva;
    salaId?: number;
    filtroUsuarioId?: number;
    fechaInicio?: Date;
    fechaFin?: Date;
    page?: number;
    limit?: number;
  }) {
    const { facultadId, usuarioId, estado, salaId, filtroUsuarioId, fechaInicio, fechaFin, page = 1, limit = 20 } = params;

    const where: Record<string, unknown> = {
      sala: { facultadId },
    };

    if (usuarioId) where.usuarioId = usuarioId;
    if (estado) where.estado = estado;
    if (salaId) where.salaId = salaId;
    if (filtroUsuarioId) where.usuarioId = filtroUsuarioId;
    if (fechaInicio || fechaFin) {
      where.fecha = {
        ...(fechaInicio ? { gte: fechaInicio } : {}),
        ...(fechaFin ? { lte: fechaFin } : {}),
      };
    }

    const [reservas, total] = await Promise.all([
      prisma.reserva.findMany({
        where,
        include: {
          sala: true,
          usuario: { select: { id: true, nombre: true, correoInstitucional: true } },
          cancelador: { select: { id: true, nombre: true } },
        },
        orderBy: [{ fecha: 'desc' }, { horaInicio: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reserva.count({ where }),
    ]);

    return { reservas, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  /** Buscar reserva por ID */
  async findById(id: number) {
    return prisma.reserva.findUnique({
      where: { id },
      include: {
        sala: { include: { facultad: true } },
        usuario: { select: { id: true, nombre: true, correoInstitucional: true } },
      },
    });
  },

  /** Verificar solapamiento de reservas (R-03, RF-11) */
  async checkOverlap(salaId: number, fecha: Date, horaInicio: Date, horaFin: Date, excludeId?: number) {
    const where: Record<string, unknown> = {
      salaId,
      fecha,
      estado: 'CONFIRMADA',
      // Solapamiento: la nueva reserva se solapa si:
      // horaInicio < existente.horaFin AND horaFin > existente.horaInicio
      horaInicio: { lt: horaFin },
      horaFin: { gt: horaInicio },
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const count = await prisma.reserva.count({ where });
    return count > 0;
  },

  /** Crear reserva */
  async create(data: {
    salaId: number;
    usuarioId: number;
    fecha: Date;
    horaInicio: Date;
    horaFin: Date;
    motivo?: string;
  }) {
    return prisma.reserva.create({
      data: {
        salaId: data.salaId,
        usuarioId: data.usuarioId,
        fecha: data.fecha,
        horaInicio: data.horaInicio,
        horaFin: data.horaFin,
        motivo: data.motivo || '',
        estado: 'CONFIRMADA',
      },
      include: {
        sala: true,
        usuario: { select: { id: true, nombre: true, correoInstitucional: true } },
      },
    });
  },

  /** Cancelar reserva (R-06: nunca eliminar, solo cancelar) */
  async cancel(id: number, canceladoPor: number) {
    return prisma.reserva.update({
      where: { id },
      data: {
        estado: 'CANCELADA',
        fechaCancelacion: new Date(),
        canceladoPor,
      },
    });
  },

  /** Actualizar reserva (HU-11: ajustar) */
  async update(id: number, data: {
    salaId?: number;
    fecha?: Date;
    horaInicio?: Date;
    horaFin?: Date;
    motivo?: string;
  }) {
    return prisma.reserva.update({
      where: { id },
      data,
      include: {
        sala: true,
        usuario: { select: { id: true, nombre: true, correoInstitucional: true } },
      },
    });
  },

  /** Cancelar todas las reservas futuras confirmadas de una sala (HU-06 E3) */
  async cancelFutureByRoom(salaId: number, canceladoPor: number) {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const afectadas = await prisma.reserva.findMany({
      where: { salaId, estado: 'CONFIRMADA', fecha: { gte: today } },
      select: { id: true },
    });

    if (afectadas.length > 0) {
      await prisma.reserva.updateMany({
        where: { salaId, estado: 'CONFIRMADA', fecha: { gte: today } },
        data: { estado: 'CANCELADA', fechaCancelacion: new Date(), canceladoPor },
      });
    }

    return afectadas.length;
  },

  /** Obtener reservas de una sala en una fecha (para calendario) */
  async findBySalaAndFecha(salaId: number, fecha: Date) {
    return prisma.reserva.findMany({
      where: {
        salaId,
        fecha,
        estado: 'CONFIRMADA',
      },
      include: {
        usuario: { select: { id: true, nombre: true } },
      },
      orderBy: { horaInicio: 'asc' },
    });
  },
};
