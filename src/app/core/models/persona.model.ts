export interface Persona {
  id: number;
  nombre: string;
  edad: number;
  genero: 'masculino' | 'femenino';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePersonaRequest {
  nombre: string;
  edad: string;
  genero: 'masculino' | 'femenino';
}

export interface UpdatePersonaRequest {
  nombre?: string;
  edad?: string;
  genero?: 'masculino' | 'femenino';
}
