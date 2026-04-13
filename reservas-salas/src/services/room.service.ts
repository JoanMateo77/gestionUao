// src/services/room.service.ts
import { roomRepository } from '@/repositories/room.repository';
import { reservationRepository } from '@/repositories/reservation.repository';
import { createRoomSchema, updateRoomSchema, updateRoomStatusSchema } from '@/lib/validations/room.schema';
import { audit } from '@/lib/audit';

export const roomService = {
  /** Listar salas de la facultad del usuario */
  async listByFacultad(facultadId: number) {
    return roomRepository.findByFacultad(facultadId);
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
    // Validar datos
    const validated = createRoomSchema.parse(data);

    // Verificar nombre único en la facultad
    const exists = await roomRepository.existsByNombreAndFacultad(validated.nombre, facultadId);
    if (exists) {
      throw new Error('Ya existe una sala con ese nombre en esta facultad');
    }

    // Crear sala
    const sala = await roomRepository.create({
      nombre: validated.nombre,
      ubicacion: validated.ubicacion || '',
      capacidad: validated.capacidad,
      facultadId,
    });

    // Auditoría (RF-16)
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

    // Si cambia el nombre, verificar que no exista
    if (validated.nombre) {
      const exists = await roomRepository.existsByNombreAndFacultad(validated.nombre, facultadId, id);
      if (exists) throw new Error('Ya existe una sala con ese nombre en esta facultad');
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
