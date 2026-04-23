-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('DOCENTE', 'SECRETARIA');

-- CreateEnum
CREATE TYPE "TipoUsuario" AS ENUM ('SECRETARIA');

-- CreateEnum
CREATE TYPE "EstadoReserva" AS ENUM ('CONFIRMADA', 'CANCELADA');

-- CreateTable
CREATE TABLE "facultad" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facultad_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "correo_institucional" VARCHAR(100) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'DOCENTE',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "facultad_id" INTEGER NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lista_blanca" (
    "correo_institucional" VARCHAR(100) NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "tipo_usuario" "TipoUsuario" NOT NULL DEFAULT 'SECRETARIA',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lista_blanca_pkey" PRIMARY KEY ("correo_institucional")
);

-- CreateTable
CREATE TABLE "sala" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "ubicacion" VARCHAR(200),
    "capacidad" INTEGER NOT NULL,
    "habilitada" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "facultad_id" INTEGER NOT NULL,

    CONSTRAINT "sala_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recurso_tecnologico" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(100) NOT NULL,
    "descripcion" VARCHAR(255),

    CONSTRAINT "recurso_tecnologico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sala_recurso" (
    "id" SERIAL NOT NULL,
    "sala_id" INTEGER NOT NULL,
    "recurso_id" INTEGER NOT NULL,

    CONSTRAINT "sala_recurso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reserva" (
    "id" SERIAL NOT NULL,
    "motivo" VARCHAR(255),
    "fecha" DATE NOT NULL,
    "hora_inicio" TIME NOT NULL,
    "hora_fin" TIME NOT NULL,
    "estado" "EstadoReserva" NOT NULL DEFAULT 'CONFIRMADA',
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_cancelacion" TIMESTAMP(3),
    "sala_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "cancelado_por" INTEGER,

    CONSTRAINT "reserva_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "log_auditoria" (
    "id" SERIAL NOT NULL,
    "accion" VARCHAR(50) NOT NULL,
    "entidad" VARCHAR(50) NOT NULL,
    "entidad_id" INTEGER NOT NULL,
    "datos_anteriores" JSONB,
    "datos_nuevos" JSONB,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(45),
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "log_auditoria_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "facultad_nombre_key" ON "facultad"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_institucional_key" ON "usuario"("correo_institucional");

-- CreateIndex
CREATE INDEX "usuario_facultad_id_idx" ON "usuario"("facultad_id");

-- CreateIndex
CREATE INDEX "usuario_rol_idx" ON "usuario"("rol");

-- CreateIndex
CREATE INDEX "sala_facultad_id_idx" ON "sala"("facultad_id");

-- CreateIndex
CREATE INDEX "sala_habilitada_idx" ON "sala"("habilitada");

-- CreateIndex
CREATE UNIQUE INDEX "recurso_tecnologico_nombre_key" ON "recurso_tecnologico"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "sala_recurso_sala_id_recurso_id_key" ON "sala_recurso"("sala_id", "recurso_id");

-- CreateIndex
CREATE INDEX "reserva_sala_id_fecha_estado_idx" ON "reserva"("sala_id", "fecha", "estado");

-- CreateIndex
CREATE INDEX "reserva_usuario_id_idx" ON "reserva"("usuario_id");

-- CreateIndex
CREATE INDEX "reserva_fecha_idx" ON "reserva"("fecha");

-- CreateIndex
CREATE INDEX "log_auditoria_entidad_entidad_id_idx" ON "log_auditoria"("entidad", "entidad_id");

-- CreateIndex
CREATE INDEX "log_auditoria_usuario_id_idx" ON "log_auditoria"("usuario_id");

-- CreateIndex
CREATE INDEX "log_auditoria_fecha_idx" ON "log_auditoria"("fecha");

-- AddForeignKey
ALTER TABLE "usuario" ADD CONSTRAINT "usuario_facultad_id_fkey" FOREIGN KEY ("facultad_id") REFERENCES "facultad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sala" ADD CONSTRAINT "sala_facultad_id_fkey" FOREIGN KEY ("facultad_id") REFERENCES "facultad"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sala_recurso" ADD CONSTRAINT "sala_recurso_sala_id_fkey" FOREIGN KEY ("sala_id") REFERENCES "sala"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sala_recurso" ADD CONSTRAINT "sala_recurso_recurso_id_fkey" FOREIGN KEY ("recurso_id") REFERENCES "recurso_tecnologico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_sala_id_fkey" FOREIGN KEY ("sala_id") REFERENCES "sala"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reserva" ADD CONSTRAINT "reserva_cancelado_por_fkey" FOREIGN KEY ("cancelado_por") REFERENCES "usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "log_auditoria" ADD CONSTRAINT "log_auditoria_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
