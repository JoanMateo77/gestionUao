// src/repositories/room.repository.ts
import { prisma } from '@/lib/prisma';
import type { Sala } from '@prisma/client';

export const roomRepository = {
  /** Listar salas de una facultad */
  async findByFacultad(facultadId: number): Promise<Sala[]> {
    return prisma.sala.findMany({
      where: { facultadId },
      include: {
        salaRecursos: {
          include: { recurso: true },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  },

  /** Obtener sala por ID */
  async findById(id: number) {
    return prisma.sala.findUnique({
      where: { id },
      include: {
        salaRecursos: {
          include: { recurso: true },
        },
        facultad: true,
      },
    });
  },

  /** Verificar si existe una sala con el mismo nombre en la misma facultad */
  async existsByNombreAndFacultad(nombre: string, facultadId: number, excludeId?: number) {
    const where: Record<string, unknown> = {
      nombre: { equals: nombre, mode: 'insensitive' },
      facultadId,
    };
    if (excludeId) {
      where.id = { not: excludeId };
    }
    const count = await prisma.sala.count({ where });
    return count > 0;
  },

  /** Crear sala */
  async create(data: { nombre: string; ubicacion?: string; capacidad: number; facultadId: number }) {
    return prisma.sala.create({ data });
  },

  /** Actualizar sala */
  async update(id: number, data: { nombre?: string; ubicacion?: string; capacidad?: number }) {
    return prisma.sala.update({ where: { id }, data });
  },

  /** Cambiar estado habilitada/deshabilitada */
  async updateStatus(id: number, habilitada: boolean) {
    return prisma.sala.update({
      where: { id },
      data: { habilitada },
    });
  },

  /**
   * Contar salones registrados en un edificio y piso específicos.
   * Usa el prefijo de ubicación generado por `componerUbicacion`, e.g. "Aulas 3, Piso 2".
   */
  async countByEdificioPiso(edificioLabel: string, piso: number): Promise<number> {
    const prefijo = `${edificioLabel}, Piso ${piso}`;
    return prisma.sala.count({
      where: {
        ubicacion: { startsWith: prefijo, mode: 'insensitive' },
      },
    });
  },
};
