import type { CompletarTrabajoDto, CreateTrabajoDto, TrabajoResponseDto } from "~/models/trabajo";


const API_BASE_URL = import.meta.env.VITE_API_URL;

type GetTrabajosFilters = {
  estado?: string; // El estado puede ser opcional
  search?: string; // Mantenemos la búsqueda que ya tenías
};

type TrabajoApiResponse = {
  trabajos: TrabajoResponseDto[];
  total: number;
};
export const trabajoService = {
  // Obtener todos los trabajos
 getTrabajos: async (filters: GetTrabajosFilters = {}): Promise<TrabajoApiResponse> => {
    // Usamos URLSearchParams para construir la query de forma segura
    const params = new URLSearchParams();

    if (filters.estado) {
      params.append('estado', filters.estado);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }

    const queryString = params.toString();
    let url = `${API_BASE_URL}/trabajos`;

    // Solo añadimos '?' si hay parámetros
    if (queryString) {
      url += `?${queryString}`;
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

  // Obtener un trabajo por ID
  getTrabajoById: async (id: number): Promise<TrabajoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/trabajos/${id}`);
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  // Eliminar un trabajo
  deleteTrabajo: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/trabajos/${id}`, {
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

  // Crear un nuevo trabajo
  createTrabajo: async (data: CreateTrabajoDto): Promise<TrabajoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/trabajos`, {
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

  // Actualizar un trabajo
  updateTrabajo: async (id: number, data: Partial<CreateTrabajoDto>): Promise<TrabajoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/trabajos/${id}`, {
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
  },

  // === NUEVA FUNCIÓN PARA INICIAR TRABAJO ===
  iniciarTrabajo: async (trabajoId: number): Promise<TrabajoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/trabajos/${trabajoId}/iniciar`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}`
        },
    });
     if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },

  // Completar un trabajo
  completeTrabajo: async (trabajoId: number, data: CompletarTrabajoDto): Promise<TrabajoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/trabajos/${trabajoId}/completar`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data),
    });

    console.log(data)
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
    return response.json();
  },
};