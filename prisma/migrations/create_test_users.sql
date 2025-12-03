-- Script para crear 4 usuarios de prueba (uno por cada rol)
-- CREDENCIALES:
-- Email: ciudadano@sigpj.bo | Contraseña: Admin555$
-- Email: abogado@sigpj.bo   | Contraseña: Admin555$
-- Email: secretario@sigpj.bo | Contraseña: Admin555$
-- Email: juez@sigpj.bo       | Contraseña: Admin555$

-- PASO 1: Primero debes crear los usuarios en Supabase Auth manualmente
-- Ve a Authentication > Users > Add user (botón verde)
-- Crea cada usuario con su email y contraseña Admin555$
-- Desactiva "Auto Confirm User" para que puedan loguearse inmediatamente

-- PASO 2: Después de crear los usuarios en Auth, obtén sus IDs
-- Ejecuta esta query para ver los usuarios creados:
-- SELECT id, email FROM auth.users WHERE email LIKE '%sigpj.bo';

-- PASO 3: Reemplaza los UUIDs abajo con los IDs reales de los usuarios que creaste
-- y luego ejecuta el resto del script

-- Insertar en tabla usuarios (REEMPLAZA LOS UUIDs CON LOS REALES)
INSERT INTO usuarios ("userId", email, nombres, apellidos, ci, telefono, domicilio, rol)
VALUES
  -- Ciudadano
  ('REEMPLAZAR-CON-UUID-CIUDADANO', 'ciudadano@sigpj.bo', 'Juan', 'Pérez Gómez', '12345678-LP', '+59170000001', 'Av. 6 de Agosto #123, La Paz', 'CIUDADANO'),

  -- Abogado
  ('REEMPLAZAR-CON-UUID-ABOGADO', 'abogado@sigpj.bo', 'María', 'Rodríguez López', '87654321-SC', '+59170000002', NULL, 'ABOGADO'),

  -- Secretario
  ('REEMPLAZAR-CON-UUID-SECRETARIO', 'secretario@sigpj.bo', 'Carlos', 'Mamani Quispe', '11223344-CB', '+59170000003', NULL, 'SECRETARIO'),

  -- Juez
  ('REEMPLAZAR-CON-UUID-JUEZ', 'juez@sigpj.bo', 'Ana', 'Torres Vargas', '99887766-OR', '+59170000004', NULL, 'JUEZ');

-- Actualizar campos específicos por rol
UPDATE usuarios
SET registro_abogado = 'LP-12345'
WHERE email = 'abogado@sigpj.bo';

UPDATE usuarios
SET juzgado = 'Tribunal Departamental de Justicia - La Paz'
WHERE email IN ('secretario@sigpj.bo', 'juez@sigpj.bo');

-- Verificar que se crearon correctamente
SELECT id, "userId", email, nombres, apellidos, rol, activo
FROM usuarios
WHERE email LIKE '%sigpj.bo'
ORDER BY rol;
