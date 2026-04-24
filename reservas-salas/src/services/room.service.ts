// src/services/room.service.ts
import { roomRepository, type RoomFilters } from '@/repositories/room.repository';
import { reservationRepository } from '@/repositories/reservation.repository';
import { createRoomSchema, updateRoomSchema, updateRoomStatusSchema } from '@/lib/validations/room.schema';
import { audit } from '@/lib/audit';
import { AULAS_MAX_SALONES } from '@/lib/edificios';

/**
 * Valida que una ubicación con formato "Aulas N, Piso P, Salón XX" respete
 * el rango de salones permitido para ese piso. Si la ubicación no pertenece
 * a un edificio AULAS reconocido, no aplica validación.
 *
 * Cuando `checkCount` es true, además consulta cuántos salones ya existen en
 * ese piso y rechaza si se alcanzó el límite (uso típico en `create`).
 */
async function validateAulasSalonRange(
  ubicacion: string,
  options: { checkCount: boolean }
): Promise<void> {
  const matchUbicacion = ubicacion.match(/^(Aulas\s+\d+),\s+Piso\s+(\d+),/i);
  if (!matchUbicacion) return;

  const edificioLabel = matchUbicacion[1];
  const piso = Number(matchUbicacion[2]);
  const limiteMax = AULAS_MAX_SALONES[piso];
  if (limiteMax === undefined) return;

  const matchSalon = ubicacion.match(/,\s*Sal[oó]n\s+(\d+)$/i);
  const numSalon = matchSalon ? Number(matchSalon[1]) : 0;
  if (numSalon < 1 || numSalon > limiteMax) {
    throw new Error(
      `El piso ${piso} de ${edificioLabel} solo permite salones del 01 al ${String(limiteMax).padStart(2, '0')}`
    );
  }

  if (options.checkCount) {
    const actuales = await roomRepository.countByEdificioPiso(edificioLabel, piso);
    if (actuales >= limiteMax) {
      throw new Error(
        `El piso ${piso} de ${edificioLabel} ya alcanzó el límite de ${limiteMax} salones`
      );
    }
  }
}

export const roomService = {
  /** Listar salas de la facultad del usuario (con filtros opcionales) */
  async listByFacultad(facultadId: number, filters: RoomFilters = {}) {
    return roomRepository.findByFacultad(facultadId, filters);
  },

  /** Obtener sala por ID */
  async getById(id: number) {
    const sala = await roomRepository.findById(id);
    if (!sala) throw new Error('Sala no encontrada');
    return sala;
  },

  /** Crear sala (solo SECRETARIA) */
  async create(
    data: { nombre: string; ubicacion?: string; capacidad: number },
    facultadId: number,
    usuarioId: number,
    ip?: string
  ) {
    const validated = createRoomSchema.parse(data);

    const exists = await roomRepository.existsByNombreAndFacultad(validated.nombre, facultadId);
    if (exists) {
      throw new Error('Ya existe una sala con ese nombre en esta facultad');
    }

    if (validated.ubicacion) {
      await validateAulasSalonRange(validated.ubicacion, { checkCount: true });
    }

    const sala = await roomRepository.create({
      nombre: validated.nombre,
      ubicacion: validated.ubicacion || '',
      capacidad: validated.capacidad,
      facultadId,
    });

    await audit({
      usuarioId,
      accion: 'CREAR_SALA',
      entidad: 'SALA',
      entidadId: sala.id,
      datosNuevos: { nombre: sala.nombre, ubicacion: sala.ubicacion, capacidad: sala.capacidad },
      ipAddress: ip,
    });

    return sala;
  },

  /** Editar sala (solo SECRETARIA) */
  async update(
    id: number,
    data: { nombre?: string; ubicacion?: string; capacidad?: number },
    facultadId: number,
    usuarioId: number,
    ip?: string
  ) {
    const sala = await roomRepository.findById(id);
    if (!sala) throw new Error('Sala no encontrada');
    if (sala.facultadId !== facultadId) throw new Error('No tiene permiso para editar esta sala');

    const validated = updateRoomSchema.parse(data);

    if (validated.nombre) {
      const exists = await roomRepository.existsByNombreAndFacultad(validated.nombre, facultadId, id);
      if (exists) throw new Error('Ya existe una sala con ese nombre en esta facultad');
    }

    if (validated.ubicacion) {
      await validateAulasSalonRange(validated.ubicacion, { checkCount: false });
    }

    const datosAnteriores = { nombre: sala.nombre, ubicacion: sala.ubicacion, capacidad: sala.capacidad };
    const updated = await roomRepository.update(id, validated);

    await audit({
      usuarioId,
      accion: 'EDITAR_SALA',
      entidad: 'SALA',
      entidadId: id,
      datosAnteriores,
      datosNuevos: validated,
      ipAddress: ip,
    });

    return updated;
  },

  /** Habilitar/deshabilitar sala (solo SECRETARIA) */
  async updateStatus(
    id: number,
    habilitada: boolean,
    facultadId: number,
    usuarioId: number,
    ip?: string
  ) {
    const sala = await roomRepository.findById(id);
    if (!sala) throw new Error('Sala no encontrada');
    if (sala.facultadId !== facultadId) throw new Error('No tiene permiso para modificar esta sala');

    updateRoomStatusSchema.parse({ habilitada });

    const updated = await roomRepository.updateStatus(id, habilitada);

    // HU-06 E3: al deshabilitar, cancelar reservas futuras confirmadas (R-05)
    let reservasCanceladas = 0;
    if (!habilitada) {
      reservasCanceladas = await reservationRepository.cancelFutureByRoom(id, usuarioId);
    }

    await audit({
      usuarioId,
      accion: 'CAMBIAR_ESTADO_SALA',
      entidad: 'SALA',
      entidadId: id,
      datosAnteriores: { habilitada: sala.habilitada },
      datosNuevos: { habilitada, reservasCanceladas },
      ipAddress: ip,
    });

    return { ...updated, reservasCanceladas };
  },
};
