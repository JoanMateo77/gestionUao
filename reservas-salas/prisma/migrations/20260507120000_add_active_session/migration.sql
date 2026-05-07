-- AlterTable
ALTER TABLE "usuario" ADD COLUMN     "active_session_id" VARCHAR(64),
ADD COLUMN     "session_started_at" TIMESTAMP(3);
