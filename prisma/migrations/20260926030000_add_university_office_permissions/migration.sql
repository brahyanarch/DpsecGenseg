INSERT INTO "permiso" ("cNombrePermiso", "cAbrevPermiso", "lActivo", "lVigente", "cTipoRol")
VALUES
    ('LISTAR_OFICINAS_PROPIAS', 'LISTAR_OFICINAS_PROPIAS', TRUE, TRUE, 'UNIVERSIDAD'),
    ('VER_OFICINA_PROPIA', 'VER_OFICINA_PROPIA', TRUE, TRUE, 'UNIVERSIDAD'),
    ('EDITAR_OFICINA_PROPIA', 'EDITAR_OFICINA_PROPIA', TRUE, TRUE, 'UNIVERSIDAD')
ON CONFLICT ("cNombrePermiso") DO NOTHING;

INSERT INTO "detallePermiso" ("idRol", "idPermiso", "lActivo", "lVigente")
SELECT rol."idRol", permiso."idPermiso", TRUE, TRUE
FROM "rol" AS rol
CROSS JOIN "permiso" AS permiso
WHERE rol."cTipoRol" = 'UNIVERSIDAD'
  AND rol."lActivo" = TRUE
  AND rol."lVigente" = TRUE
  AND permiso."cNombrePermiso" IN (
      'LISTAR_OFICINAS_PROPIAS',
      'VER_OFICINA_PROPIA',
      'EDITAR_OFICINA_PROPIA'
  )
  AND permiso."cTipoRol" = 'UNIVERSIDAD'
  AND permiso."lActivo" = TRUE
  AND permiso."lVigente" = TRUE
ON CONFLICT ("idRol", "idPermiso") DO NOTHING;
