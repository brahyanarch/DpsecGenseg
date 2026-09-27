-- CreateTable
CREATE TABLE "usuario_sistema" (
    "idUsuarioSistema" SERIAL NOT NULL,
    "idUser" INTEGER NOT NULL,
    "idRol" INTEGER NOT NULL,
    "lActivo" BOOLEAN NOT NULL DEFAULT true,
    "lVigente" BOOLEAN NOT NULL DEFAULT true,
    "dCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dUpdatedAt" TIMESTAMP(3),

    CONSTRAINT "usuario_sistema_pkey" PRIMARY KEY ("idUsuarioSistema")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuario_sistema_user_rol_unique_constraint" ON "usuario_sistema"("idUser", "idRol");

-- AddForeignKey
ALTER TABLE "usuario_sistema" ADD CONSTRAINT "usuario_sistema_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "user"("idUser") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuario_sistema" ADD CONSTRAINT "usuario_sistema_idRol_fkey" FOREIGN KEY ("idRol") REFERENCES "rol"("idRol") ON DELETE CASCADE ON UPDATE CASCADE;
