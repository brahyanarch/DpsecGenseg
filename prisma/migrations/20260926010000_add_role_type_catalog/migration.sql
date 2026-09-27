-- Replace the role type lookup table with a PostgreSQL enum.
CREATE TYPE "TipoRol" AS ENUM ('UNIVERSIDAD', 'SISTEMA');

ALTER TABLE "rol"
ADD COLUMN "cTipoRol" "TipoRol" NOT NULL DEFAULT 'UNIVERSIDAD';
