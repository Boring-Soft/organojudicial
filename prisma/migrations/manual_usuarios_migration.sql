-- Enable uuid extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Solo crear el tipo RolUsuario si no existe
DO $$ BEGIN
    CREATE TYPE "RolUsuario" AS ENUM ('CIUDADANO', 'ABOGADO', 'SECRETARIO', 'JUEZ');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Drop table if exists to recreate with correct schema
DROP TABLE IF EXISTS "usuarios" CASCADE;

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4()::text,
    "userId" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL,
    "ci" TEXT,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "registro_abogado" TEXT,
    "juzgado" TEXT,
    "domicilio" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_userId_key" ON "usuarios"("userId");
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
