// src/services/resource.service.ts
import { resourceRepository } from '@/repositories/resource.repository';
import { roomRepository } from '@/repositories/room.repository';
import { prisma } from '@/lib/prisma';
import { audit } from '@/lib/audit';

export const resourceService = {
  /** Listar todos los recursos tecnológicos disponibles */
  async listAll() {
    return resourceRepository.findAll();
  },

  /** Listar recursos de una sala */
  async listBySala(salaId: number) {
    return resourceRepository.findBySala(salaId);
  },

  /** Agregar recurso a sala (solo SECRETARIA) */
  async addToSala(
    salaId: number,
    recursoId: number,
    cantidad: number,
    facultadId: number,
    usuarioId: number,
    ip?: string
  ) {
    // Verificar que la sala existe y pertenece a la facultad
    const sala = await roomRepository.findById(salaId);
    if (!sala) throw new Error('Sala no encontrada');
    if (sala.facultadId !== facultadId) throw new Error('No tiene permiso para modificar esta sala');

    // Verificar que no esté ya asignado
    const exists = await resourceRepository.existsInSala(salaId, recursoId);
    if (exists) throw new Error('Este recurso ya está asignado a esta sala');

    // Validar cantidad máxima permitida para este recurso
    const recurso = await prisma.recursoTecnologico.findUnique({ where: { id: recursoId } });
    if (!recurso) throw new Error('Recurso no encontrado');
    if (cantidad > recurso.cantidadMaxima) {
      throw new Error(`La cantidad máxima permitida para "${recurso.nombre}" es ${recurso.cantidadMaxima}`);
    }

    const assignment = await resourceRepository.addToSala(salaId, recursoId, cantidad);

    await audit({
      usuarioId,
      accion: 'AGREGAR_RECURSO',
      entidad: 'SALA_RECURSO',
      entidadId: assignment.id,
      datosNuevos: { salaId, recursoId, cantidad, recursoNombre: assignment.recurso.nombre },
      ipAddress: ip,
    });

    return assignment;
  },

  /** Actualizar cantidad de un recurso asignado (solo SECRETARIA) */
  async updateCantidad(
    assignmentId: number,
    cantidad: number,
    facultadId: number,
    usuarioId: number,
    ip?: string
  ) {
    const assignment = await resourceRepository.findAssignmentById(assignmentId);
    if (!assignment) throw new Error('Asignación no encontrada');

    const sala = await roomRepository.findById(assignment.salaId);
    if (!sala) throw new Error('Sala no encontrada');
    if (sala.facultadId !== facultadId) throw new Error('No tiene permiso para modificar esta sala');

    // Validar cantidad máxima permitida
    const recurso = await prisma.recursoTecnologico.findUnique({ where: { id: assignment.recursoId } });
    if (!recurso) throw new Error('Recurso no encontrado');
    if (cantidad > recurso.cantidadMaxima) {
      throw new Error(`La cantidad máxima permitida para "${recurso.nombre}" es ${recurso.cantidadMaxima}`);
    }

    const updated = await resourceRepository.updateCantidad(assignmentId, cantidad);

    await audit({
      usuarioId,
      accion: 'ACTUALIZAR_CANTIDAD_RECURSO',
      entidad: 'SALA_RECURSO',
      entidadId: assignmentId,
      datosAnteriores: { cantidad: assignment.cantidad },
      datosNuevos: { cantidad },
      ipAddress: ip,
    });

    return updated;
  },

  /** Retirar recurso de sala (solo SECRETARIA) */
  async removeFromSala(
    assignmentId: number,
    facultadId: number,
    usuarioId: number,
    ip?: string
  ) {
    const assignment = await resourceRepository.findAssignmentById(assignmentId);
    if (!assignment) throw new Error('Asignación no encontrada');

    // Verificar permisos
    const sala = await roomRepository.findById(assignment.salaId);
    if (!sala) throw new Error('Sala no encontrada');
    if (sala.facultadId !== facultadId) throw new Error('No tiene permiso para modificar esta sala');

    await resourceRepository.removeFromSala(assignmentId);

    await audit({
      usuarioId,
      accion: 'RETIRAR_RECURSO',
      entidad: 'SALA_RECURSO',
      entidadId: assignmentId,
      datosAnteriores: { salaId: assignment.salaId, recursoId: assignment.recursoId },
      ipAddress: ip,
    });
  },
};
