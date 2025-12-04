/**
 * Script para crear usuarios de prueba para cada rol
 * Ejecutar con: npx tsx scripts/crear-usuarios-prueba.ts
 */

import prisma from '../src/lib/prisma';
import { createClient } from '@supabase/supabase-js';
import { RolUsuario } from '@prisma/client';

// Crear cliente de Supabase con credenciales de admin
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Usar service role key para crear usuarios
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Datos de usuarios de prueba
const testUsers = [
  {
    email: 'ciudadano@test.com',
    password: 'Test123456!',
    rol: 'CIUDADANO' as RolUsuario,
    nombres: 'Juan',
    apellidos: 'Pérez García',
    ci: '12345678-LP',
    telefono: '71234567',
    domicilio: 'Calle Comercio 123, La Paz',
  },
  {
    email: 'abogado@test.com',
    password: 'Test123456!',
    rol: 'ABOGADO' as RolUsuario,
    nombres: 'María',
    apellidos: 'González Rodríguez',
    ci: '87654321-LP',
    telefono: '77654321',
    domicilio: 'Av. Arce 456, La Paz',
    registroAbogado: 'LP-2024-001',
  },
  {
    email: 'secretario@test.com',
    password: 'Test123456!',
    rol: 'SECRETARIO' as RolUsuario,
    nombres: 'Carlos',
    apellidos: 'López Martínez',
    ci: '11223344-LP',
    telefono: '72345678',
    domicilio: 'Plaza Murillo 789, La Paz',
    juzgado: 'Juzgado 1ro de Instrucción',
  },
  {
    email: 'juez@test.com',
    password: 'Test123456!',
    rol: 'JUEZ' as RolUsuario,
    nombres: 'Ana',
    apellidos: 'Fernández Silva',
    ci: '55443322-LP',
    telefono: '78765432',
    domicilio: 'Zona Sur, La Paz',
    juzgado: 'Juzgado 1ro de Instrucción',
  },
];

async function createTestUsers() {
  console.log('🚀 Creando usuarios de prueba...\n');

  for (const userData of testUsers) {
    try {
      console.log(`Creando usuario ${userData.rol}: ${userData.email}`);

      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        email_confirm: true, // Auto-confirmar email para pruebas
        user_metadata: {
          nombres: userData.nombres,
          apellidos: userData.apellidos,
          rol: userData.rol,
          ci: userData.ci,
        },
      });

      if (authError) {
        console.error(`❌ Error creando usuario en Auth: ${authError.message}`);
        continue;
      }

      if (!authData.user) {
        console.error('❌ No se pudo crear el usuario en Auth');
        continue;
      }

      // 2. Crear usuario en base de datos
      const dbUser = await prisma.usuario.upsert({
        where: { email: userData.email },
        update: {
          // Actualizar si ya existe
          rol: userData.rol,
          nombres: userData.nombres,
          apellidos: userData.apellidos,
          ci: userData.ci,
          telefono: userData.telefono,
          domicilio: userData.domicilio,
          registroAbogado: userData.registroAbogado,
          juzgado: userData.juzgado,
          activo: true,
        },
        create: {
          userId: authData.user.id,
          email: userData.email,
          rol: userData.rol,
          nombres: userData.nombres,
          apellidos: userData.apellidos,
          ci: userData.ci,
          telefono: userData.telefono,
          domicilio: userData.domicilio,
          registroAbogado: userData.registroAbogado,
          juzgado: userData.juzgado,
          activo: true,
        },
      });

      console.log(`✅ Usuario ${userData.rol} creado exitosamente`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Password: ${userData.password}`);
      console.log(`   Dashboard: /${userData.rol.toLowerCase()}/dashboard\n`);
    } catch (error) {
      console.error(`❌ Error creando usuario ${userData.email}:`, error);
    }
  }

  console.log('\n✨ Proceso completado');
  console.log('\n📝 CREDENCIALES DE PRUEBA:');
  console.log('==========================');
  testUsers.forEach(user => {
    console.log(`\n${user.rol}:`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Password: ${user.password}`);
  });
}

// Ejecutar el script
createTestUsers()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    process.exit();
  });