# Credenciales de Usuarios de Prueba

Todos los usuarios tienen la misma contraseña: **Admin555$**

## 👤 CIUDADANO
- **Email:** ciudadano@sigpj.bo
- **Contraseña:** Admin555$
- **Dashboard:** `/ciudadano/dashboard`
- **Datos:**
  - Nombre: Juan Pérez Gómez
  - CI: 12345678-LP
  - Teléfono: +59170000001

## ⚖️ ABOGADO
- **Email:** abogado@sigpj.bo
- **Contraseña:** Admin555$
- **Dashboard:** `/abogado/dashboard`
- **Datos:**
  - Nombre: María Rodríguez López
  - CI: 87654321-SC
  - Registro Profesional: LP-12345
  - Teléfono: +59170000002

## 📋 SECRETARIO
- **Email:** secretario@sigpj.bo
- **Contraseña:** Admin555$
- **Dashboard:** `/secretario/dashboard`
- **Datos:**
  - Nombre: Carlos Mamani Quispe
  - CI: 11223344-CB
  - Juzgado: Tribunal Departamental de Justicia - La Paz
  - Teléfono: +59170000003

## ⚖️ JUEZ
- **Email:** juez@sigpj.bo
- **Contraseña:** Admin555$
- **Dashboard:** `/juez/dashboard`
- **Datos:**
  - Nombre: Ana Torres Vargas
  - CI: 99887766-OR
  - Juzgado: Tribunal Departamental de Justicia - La Paz
  - Teléfono: +59170000004

---

## 📝 Instrucciones para crear los usuarios

### Paso 1: Crear usuarios en Supabase Auth
1. Ve a tu proyecto en Supabase
2. **Authentication** → **Users**
3. Click en **"Add user"** (botón verde)
4. Para cada usuario:
   - Email: (usar los emails de arriba)
   - Password: Admin555$
   - ✅ **Auto Confirm User** (marcar esto para que puedan loguearse sin confirmar email)
5. Crear los 4 usuarios

### Paso 2: Obtener los UUIDs de los usuarios creados
Ejecuta esta query en SQL Editor:
```sql
SELECT id, email FROM auth.users WHERE email LIKE '%sigpj.bo' ORDER BY email;
```

### Paso 3: Insertar en tabla usuarios
1. Copia los UUIDs obtenidos
2. Abre el archivo `create_test_users.sql`
3. Reemplaza los textos `REEMPLAZAR-CON-UUID-...` con los UUIDs reales
4. Ejecuta el script completo

### Paso 4: Verificar
```sql
SELECT id, userId, email, nombres, apellidos, rol, activo
FROM usuarios
WHERE email LIKE '%sigpj.bo'
ORDER BY rol;
```

Deberías ver los 4 usuarios creados correctamente.
