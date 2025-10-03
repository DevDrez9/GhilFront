import type { CategoriaResponseDto, CreateCategoriaDto, SubcategoriaResponseDto, CreateSubcategoriaDto } from "~/models/categoria";

const API_BASE_URL = 'http://localhost:3000';

type CategoriaApiResponse = {
  categorias: CategoriaResponseDto[];
  total: number;
};

export const categoriaService = {
  // Obtener todas las categorías
  getCategorias: async (search?: string): Promise<CategoriaApiResponse> => {
    let url = `${API_BASE_URL}/categorias/tienda/1`;

    if (search) {
      url += `?search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url, {
       method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
   

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }
    console.log("response"+response.json.toString)

    return response.json();
  },

  // Obtener una categoría por ID
  getCategoriaById: async (id: number): Promise<CategoriaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/categorias/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Crear una nueva categoría
  createCategoria: async (data: CreateCategoriaDto): Promise<CategoriaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/categorias`, {
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

  // Actualizar una categoría
  updateCategoria: async (id: number, data: Partial<CreateCategoriaDto>): Promise<CategoriaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/categorias/${id}`, {
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

  // Eliminar una categoría
  deleteCategoria: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/categorias/${id}`, {
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

  // **AGREGAR SUBCATEGORÍA**
  // Asumimos que esta acción crea la subcategoría y la asocia a la categoría
  addSubcategoria: async (data: CreateSubcategoriaDto): Promise<SubcategoriaResponseDto> => {
    
  
    
    const response = await fetch(`${API_BASE_URL}/subcategorias`, {
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

  // **QUITAR SUBCATEGORÍA**
  // Asumimos que esta acción elimina la subcategoría
  removeSubcategoria: async (subcategoriaId: number): Promise<void> => {
    // Nota: El endpoint real puede ser /subcategorias/:subcategoriaId
    const response = await fetch(`${API_BASE_URL}/subcategorias/${subcategoriaId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken') || ''}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
  }
};