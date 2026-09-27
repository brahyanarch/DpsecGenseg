ALTER TABLE "permiso"
ADD COLUMN "cTipoRol" "TipoRol" NOT NULL DEFAULT 'UNIVERSIDAD';

DELETE FROM "detallePermiso" AS detalle
USING "rol" AS rol, "permiso" AS permiso
WHERE detalle."idRol" = rol."idRol"
  AND detalle."idPermiso" = permiso."idPermiso"
  AND rol."cTipoRol" <> permiso."cTipoRol";
