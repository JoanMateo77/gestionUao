// src/services/resource.service.ts
import { resourceRepository } from '@/repositories/resource.repository';
import { roomRepository } from '@/repositories/room.repository';
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

    const assignment = await resourceRepository.addToSala(salaId, recursoId);

    await audit({
      usuarioId,
      accion: 'AGREGAR_RECURSO',
      entidad: 'SALA_RECURSO',
      entidadId: assignment.id,
      datosNuevos: { salaId, recursoId, recursoNombre: assignment.recurso.nombre },
      ipAddress: ip,
    });

    return assignment;
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
