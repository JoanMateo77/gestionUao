// src/repositories/room.repository.ts
import { prisma } from '@/lib/prisma';
import type { Prisma, Sala } from '@prisma/client';

export type RoomFilters = {
  capacidadMin?: number;
  capacidadMax?: number;
  edificio?: string;
  recursos?: number[];
  search?: string;
  soloHabilitadas?: boolean;
};

export const roomRepository = {
  /** Listar salas de una facultad con filtros opcionales */
  async findByFacultad(facultadId: number, filters: RoomFilters = {}): Promise<Sala[]> {
    const where: Prisma.SalaWhereInput = { facultadId };

    if (filters.soloHabilitadas) where.habilitada = true;

    const capacidad: Prisma.IntFilter = {};
    if (filters.capacidadMin != null) capacidad.gte = filters.capacidadMin;
    if (filters.capacidadMax != null) capacidad.lte = filters.capacidadMax;
    if (Object.keys(capacidad).length > 0) where.capacidad = capacidad;

    if (filters.edificio) {
      where.ubicacion = { contains: filters.edificio, mode: 'insensitive' };
    }
    if (filters.search) {
      where.OR = [
        { nombre: { contains: filters.search, mode: 'insensitive' } },
        { ubicacion: { contains: filters.search, mode: 'insensitive' } },
      ];
    }
    // AND por cada recurso: la sala debe contener TODOS los recursos pedidos
    if (filters.recursos && filters.recursos.length > 0) {
      where.AND = filters.recursos.map((rid) => ({
        salaRecursos: { some: { recursoId: rid } },
      }));
    }

    return prisma.sala.findMany({
      where,
      include: {
        salaRecursos: { include: { recurso: true } },
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
   * Usa el prefijo de ubicación generado por `componerUbicacion`, e.g. "Aulas 3, Piso 2,".
   * La coma final es necesaria para no contar "Piso 20" como "Piso 2".
   */
  async countByEdificioPiso(edificioLabel: string, piso: number): Promise<number> {
    const prefijo = `${edificioLabel}, Piso ${piso},`;
    return prisma.sala.count({
      where: {
        ubicacion: { startsWith: prefijo, mode: 'insensitive' },
      },
    });
  },
};
