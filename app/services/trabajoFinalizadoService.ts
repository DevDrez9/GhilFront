import type { CreateTrabajoFinalizadoDto, TrabajoFinalizadoResponseDto } from "~/models/trabajos-finalizados";


const API_BASE_URL = 'http://localhost:3000';

type TrabajosFinalizadosApiResponse = {
  trabajos: TrabajoFinalizadoResponseDto[];
  total: number;
};

export const trabajoFinalizadoService = {
  // Obtener todos los trabajos terminados
  getTrabajosFinalizados: async (search?: string): Promise<TrabajosFinalizadosApiResponse> => {
    let url = `${API_BASE_URL}/trabajos-finalizados`;

    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Obtener un trabajo terminado por ID
  getTrabajoFinalizadoById: async (id: number): Promise<TrabajoFinalizadoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/trabajos-finalizados/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Eliminar un trabajo terminado
  deleteTrabajoFinalizado: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/trabajos-finalizados/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
  },

  // Crear un nuevo trabajo terminado
  createTrabajoFinalizado: async (data: CreateTrabajoFinalizadoDto): Promise<TrabajoFinalizadoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/trabajos-finalizados`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Actualizar un trabajo terminado
  updateTrabajoFinalizado: async (id: number, data: Partial<CreateTrabajoFinalizadoDto>): Promise<TrabajoFinalizadoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/trabajos-finalizados/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
};