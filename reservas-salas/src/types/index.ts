// src/types/index.ts
import { type DefaultSession } from 'next-auth';

// Extiende los tipos de NextAuth para incluir campos personalizados
declare module 'next-auth' {
  interface Session {
    user: {
      id: number;
      rol: 'DOCENTE' | 'SECRETARIA';
      facultadId: number;
      nombre: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: number;
    rol: 'DOCENTE' | 'SECRETARIA';
    facultadId: number;
    nombre: string;
    correoInstitucional: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: number;
    rol: 'DOCENTE' | 'SECRETARIA';
    facultadId: number;
    nombre: string;
  }
}

// Tipos de API Response
export interface ApiError {
  error: string;
  code?: string;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}

// Tipos de formularios
export interface RegisterFormData {
  nombre: string;
  correo: string;
  password: string;
  confirmPassword: string;
  facultadId: number;
}

export interface LoginFormData {
  correo: string;
  password: string;
}

export interface RoomFormData {
  nombre: string;
  ubicacion: string;
  capacidad: number;
}

export interface ReservationFormData {
  salaId: number;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  motivo: string;
}
