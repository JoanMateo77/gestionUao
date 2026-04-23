// src/services/room.service.ts
import { roomRepository } from '@/repositories/room.repository';
import { reservationRepository } from '@/repositories/reservation.repository';
import { createRoomSchema, updateRoomSchema, updateRoomStatusSchema } from '@/lib/validations/room.schema';
import { audit } from '@/lib/audit';
import { AULAS_MAX_SALONES } from '@/lib/edificios';

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

    // -------------------------------------------------------
    // Validar límite de salones por piso (Aulas 1–4)
    // El nombre tiene la forma "Aulas N - PXX" y la ubicación
    // "Aulas N, Piso P, Salón XX".  Inferimos edificio y piso
    // desde la ubicación para no acoplarnos al formato del nombre.
    // -------------------------------------------------------
    if (validated.ubicacion) {
      // Detectar si pertenece a un edificio AULAS buscando en la ubicación
      // Formato esperado: "Aulas N, Piso P, Salón XX"
      const matchUbicacion = validated.ubicacion.match(
        /^(Aulas\s+\d+),\s+Piso\s+(\d+),/i
      );
      if (matchUbicacion) {
        const edificioLabel = matchUbicacion[1]; // e.g. "Aulas 3"
        const piso = Number(matchUbicacion[2]);   // e.g. 2
        const limiteMax = AULAS_MAX_SALONES[piso];
        if (limiteMax !== undefined) {
          // Extraer el número de salón desde la ubicación: "Aulas N, Piso P, Salón XX"
          const matchSalon = validated.ubicacion.match(/,\s*Sal[oó]n\s+(\d+)$/i);
          const numSalon = matchSalon ? Number(matchSalon[1]) : 0;
          if (numSalon < 1 || numSalon > limiteMax) {
            throw new Error(
              `El piso ${piso} de ${edificioLabel} solo permite salones del 01 al ${String(limiteMax).padStart(2, '0')}`
            );
          }
          const actuales = await roomRepository.countByEdificioPiso(edificioLabel, piso);
          if (actuales >= limiteMax) {
            throw new Error(
              `El piso ${piso} de ${edificioLabel} ya alcanzó el límite de ${limiteMax} salones`
            );
          }
        }
      }
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

    // Validar rango de sal\u00f3n si la ubicaci\u00f3n es de un edificio Aulas
    if (validated.ubicacion) {
      const matchUbicacion = validated.ubicacion.match(/^(Aulas\s+\d+),\s+Piso\s+(\d+),/i);
      if (matchUbicacion) {
        const edificioLabel = matchUbicacion[1];
        const piso = Number(matchUbicacion[2]);
        const limiteMax = AULAS_MAX_SALONES[piso];
        if (limiteMax !== undefined) {
          const matchSalon = validated.ubicacion.match(/,\s*Sal[oó]n\s+(\d+)$/i);
          const numSalon = matchSalon ? Number(matchSalon[1]) : 0;
          if (numSalon < 1 || numSalon > limiteMax) {
            throw new Error(
              `El piso ${piso} de ${edificioLabel} solo permite salones del 01 al ${String(limiteMax).padStart(2, '0')}`
            );
          }
        }
      }
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
