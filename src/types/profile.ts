import type { UserRole } from "@prisma/client";

export interface Profile {
  id: string;
  userId: string;
  avatarUrl?: string;
  birthDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
  firstName?: string;
  lastName?: string;
  role: UserRole;
}

// Usuario type from database
export interface Usuario {
  id: string;
  userId: string;
  rol: 'CIUDADANO' | 'ABOGADO' | 'SECRETARIO' | 'JUEZ';
  ci?: string;
  nombres: string;
  apellidos: string;
  email: string;
  telefono?: string;
  registro_abogado?: string;
  juzgado?: string;
  domicilio?: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
} 