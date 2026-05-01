// src/repositories/resource.repository.ts
import { prisma } from '@/lib/prisma';

export const resourceRepository = {
  /** Listar todos los recursos tecnológicos disponibles */
  async findAll() {
    return prisma.recursoTecnologico.findMany({
      orderBy: { nombre: 'asc' },
    });
  },

  /** Listar recursos asignados a una sala */
  async findBySala(salaId: number) {
    return prisma.salaRecurso.findMany({
      where: { salaId },
      include: { recurso: true },
    });
  },

  /** Verificar si un recurso ya está asignado a una sala */
  async existsInSala(salaId: number, recursoId: number) {
    const count = await prisma.salaRecurso.count({
      where: { salaId, recursoId },
    });
    return count > 0;
  },

  /** Agregar recurso a sala */
  async addToSala(salaId: number, recursoId: number, cantidad: number) {
    return prisma.salaRecurso.create({
      data: { salaId, recursoId, cantidad },
      include: { recurso: true },
    });
  },

  /** Actualizar cantidad de un recurso asignado */
  async updateCantidad(id: number, cantidad: number) {
    return prisma.salaRecurso.update({
      where: { id },
      data: { cantidad },
      include: { recurso: true },
    });
  },

  /** Retirar recurso de sala */
  async removeFromSala(id: number) {
    return prisma.salaRecurso.delete({
      where: { id },
    });
  },

  /** Buscar asignación por ID */
  async findAssignmentById(id: number) {
    return prisma.salaRecurso.findUnique({
      where: { id },
      include: { recurso: true },
    });
  },
};
