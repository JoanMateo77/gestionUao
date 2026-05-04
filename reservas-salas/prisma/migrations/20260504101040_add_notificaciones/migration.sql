-- CreateEnum
CREATE TYPE "TipoNotificacion" AS ENUM ('RESERVA_CANCELADA_SALA_DESHABILITADA', 'RESERVA_AJUSTADA', 'RESERVA_CANCELADA_POR_SECRETARIA', 'GENERAL');

-- CreateTable
CREATE TABLE "notificacion" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoNotificacion" NOT NULL DEFAULT 'GENERAL',
    "titulo" VARCHAR(150) NOT NULL,
    "mensaje" VARCHAR(500) NOT NULL,
    "metadata" JSONB,
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "enviada_email" BOOLEAN NOT NULL DEFAULT false,
    "fecha_creacion" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_leida" TIMESTAMP(3),
    "usuario_id" INTEGER NOT NULL,

    CONSTRAINT "notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notificacion_usuario_id_leida_idx" ON "notificacion"("usuario_id", "leida");

-- CreateIndex
CREATE INDEX "notificacion_usuario_id_fecha_creacion_idx" ON "notificacion"("usuario_id", "fecha_creacion");

-- AddForeignKey
ALTER TABLE "notificacion" ADD CONSTRAINT "notificacion_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
