// src/app/api/auth/register/route.ts
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/validations/auth.schema';
import { audit } from '@/lib/audit';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    // Verificar que el correo no esté registrado
    const existingUser = await prisma.usuario.findUnique({
      where: { correoInstitucional: validated.correo },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Este correo ya está registrado' },
        { status: 409 }
      );
    }

    // Verificar que la facultad exista
    const facultad = await prisma.facultad.findUnique({
      where: { id: validated.facultadId },
    });

    if (!facultad) {
      return NextResponse.json(
        { error: 'Facultad no encontrada' },
        { status: 400 }
      );
    }

    // Determinar rol: consultar lista blanca (RF-03, R-08, R-09)
    const enListaBlanca = await prisma.listaBlanca.findUnique({
      where: { correoInstitucional: validated.correo },
    });

    const rol = enListaBlanca ? 'SECRETARIA' : 'DOCENTE';

    // Hash de contraseña
    const passwordHash = await bcrypt.hash(validated.password, 12);

    // Crear usuario
    const usuario = await prisma.usuario.create({
      data: {
        nombre: validated.nombre,
        correoInstitucional: validated.correo,
        passwordHash,
        rol,
        facultadId: validated.facultadId,
      },
    });

    // Auditoría (RF-16)
    await audit({
      usuarioId: usuario.id,
      accion: 'REGISTRO_USUARIO',
      entidad: 'USUARIO',
      entidadId: usuario.id,
      datosNuevos: {
        nombre: usuario.nombre,
        correo: usuario.correoInstitucional,
        rol: usuario.rol,
        facultadId: usuario.facultadId,
      },
      ipAddress: req.headers.get('x-forwarded-for') ?? 'unknown',
    });

    return NextResponse.json(
      {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correoInstitucional,
        rol: usuario.rol,
        facultadId: usuario.facultadId,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Datos inválidos', details: error }, { status: 400 });
    }
    console.error('Error en registro:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
