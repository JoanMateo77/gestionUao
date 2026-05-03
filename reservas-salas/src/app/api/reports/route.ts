// src/app/api/reports/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/reports?tipo=reservas|horas|usuario&fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
 * Solo SECRETARIA (HU-14, HU-15, HU-16)
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
    }
    if (session.user.rol !== 'SECRETARIA') {
      return NextResponse.json({ error: 'Sin permiso' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const tipo = searchParams.get('tipo') ?? 'reservas';
    const fechaInicioStr = searchParams.get('fechaInicio');
    const fechaFinStr = searchParams.get('fechaFin');

    if (fechaInicioStr && fechaFinStr && fechaInicioStr > fechaFinStr) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
        { status: 400 }
      );
    }

    // Validar que el rango no sea un único domingo
    if (fechaInicioStr && fechaFinStr && fechaInicioStr === fechaFinStr) {
      const dia = new Date(fechaInicioStr + 'T12:00:00').getDay(); // 0 = domingo
      if (dia === 0) {
        return NextResponse.json(
          { error: 'Los domingos no tienen reservas. Por favor selecciona otro día.' },
          { status: 400 }
        );
      }
    }

    const fechaInicio = fechaInicioStr ? new Date(fechaInicioStr + 'T00:00:00.000Z') : undefined;
    const fechaFin = fechaFinStr ? new Date(fechaFinStr + 'T23:59:59.999Z') : undefined;

    const facultadId = session.user.facultadId;

    const whereBase = {
      sala: { facultadId },
      ...(fechaInicio || fechaFin
        ? { fecha: { ...(fechaInicio ? { gte: fechaInicio } : {}), ...(fechaFin ? { lte: fechaFin } : {}) } }
        : {}),
    };

    if (tipo === 'reservas') {
      // HU-14: número de reservas por sala
      const salas = await prisma.sala.findMany({
        where: { facultadId },
        select: { id: true, nombre: true, ubicacion: true },
        orderBy: { nombre: 'asc' },
      });

      const counts = await Promise.all(
        salas.map(async (sala) => {
          const total = await prisma.reserva.count({
            where: { ...whereBase, salaId: sala.id },
          });
          const confirmadas = await prisma.reserva.count({
            where: { ...whereBase, salaId: sala.id, estado: 'CONFIRMADA' },
          });
          const canceladas = await prisma.reserva.count({
            where: { ...whereBase, salaId: sala.id, estado: 'CANCELADA' },
          });
          return { sala: sala.nombre, ubicacion: sala.ubicacion, total, confirmadas, canceladas };
        })
      );

      const sorted = counts.sort((a, b) => b.total - a.total);
      return NextResponse.json({ tipo, datos: sorted });
    }

    if (tipo === 'horas') {
      // HU-15: horas reservadas por sala (solo CONFIRMADAS)
      const reservas = await prisma.reserva.findMany({
        where: { ...whereBase, estado: 'CONFIRMADA' },
        select: {
          salaId: true,
          horaInicio: true,
          horaFin: true,
          sala: { select: { nombre: true, ubicacion: true } },
        },
      });

      const mapaHoras: Record<number, { sala: string; ubicacion: string | null; minutos: number }> = {};
      for (const r of reservas) {
        const iniMin = r.horaInicio.getUTCHours() * 60 + r.horaInicio.getUTCMinutes();
        const finMin = r.horaFin.getUTCHours() * 60 + r.horaFin.getUTCMinutes();
        if (!mapaHoras[r.salaId]) {
          mapaHoras[r.salaId] = { sala: r.sala.nombre, ubicacion: r.sala.ubicacion, minutos: 0 };
        }
        mapaHoras[r.salaId].minutos += finMin - iniMin;
      }

      const datos = Object.values(mapaHoras)
        .map((v) => ({ sala: v.sala, ubicacion: v.ubicacion, horas: +(v.minutos / 60).toFixed(2) }))
        .sort((a, b) => b.horas - a.horas);

      return NextResponse.json({ tipo, datos });
    }

    if (tipo === 'usuario') {
      // HU-16: reservas por usuario con detalle de fecha y sala
      const reservas = await prisma.reserva.findMany({
        where: whereBase,
        select: {
          id: true,
          usuarioId: true,
          estado: true,
          fecha: true,
          horaInicio: true,
          horaFin: true,
          usuario: { select: { nombre: true, correoInstitucional: true, rol: true } },
          sala: { select: { nombre: true, ubicacion: true } },
        },
        orderBy: [{ usuarioId: 'asc' }, { fecha: 'desc' }],
      });

      const mapaUsuarios: Record<
        number,
        {
          nombre: string;
          correo: string;
          rol: string;
          total: number;
          confirmadas: number;
          canceladas: number;
          reservas: {
            id: number;
            fecha: string;
            horaInicio: string;
            horaFin: string;
            sala: string;
            ubicacion: string | null;
            estado: string;
          }[];
        }
      > = {};

      for (const r of reservas) {
        if (!mapaUsuarios[r.usuarioId]) {
          mapaUsuarios[r.usuarioId] = {
            nombre: r.usuario.nombre,
            correo: r.usuario.correoInstitucional,
            rol: r.usuario.rol,
            total: 0,
            confirmadas: 0,
            canceladas: 0,
            reservas: [],
          };
        }
        mapaUsuarios[r.usuarioId].total++;
        if (r.estado === 'CONFIRMADA') mapaUsuarios[r.usuarioId].confirmadas++;
        else if (r.estado === 'CANCELADA') mapaUsuarios[r.usuarioId].canceladas++;

        const pad = (n: number) => String(n).padStart(2, '0');
        const horaIni = `${pad(r.horaInicio.getUTCHours())}:${pad(r.horaInicio.getUTCMinutes())}`;
        const horaFin = `${pad(r.horaFin.getUTCHours())}:${pad(r.horaFin.getUTCMinutes())}`;

        mapaUsuarios[r.usuarioId].reservas.push({
          id: r.id,
          fecha: r.fecha.toISOString().split('T')[0],
          horaInicio: horaIni,
          horaFin: horaFin,
          sala: r.sala.nombre,
          ubicacion: r.sala.ubicacion,
          estado: r.estado,
        });
      }

      const datos = Object.values(mapaUsuarios).sort((a, b) => b.total - a.total);
      return NextResponse.json({ tipo, datos });
    }

    return NextResponse.json({ error: 'Tipo de reporte inválido' }, { status: 400 });
  } catch (error) {
    console.error('Error en reportes:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
