-- CreateEnum
CREATE TYPE "CategoriaRecurso" AS ENUM ('PROYECCION', 'COMPUTO', 'CONECTIVIDAD', 'AUDIO', 'ESCRITURA', 'CONFORT', 'ACCESIBILIDAD');

-- AlterTable
ALTER TABLE "recurso_tecnologico" ADD COLUMN     "categoria" "CategoriaRecurso" NOT NULL DEFAULT 'COMPUTO',
ADD COLUMN     "icono" VARCHAR(50) NOT NULL DEFAULT 'Box';

-- CreateIndex
CREATE INDEX "recurso_tecnologico_categoria_idx" ON "recurso_tecnologico"("categoria");
