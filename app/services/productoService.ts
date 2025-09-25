import type { ProductoResponseDto, CreateProductoDto, UpdateProductoDto } from "~/models/producto.model";

const API_BASE_URL = 'http://localhost:3000';

type ProductosApiResponse = {
  productos: ProductoResponseDto[];
  total: number;
};

export const productoService = {
  // Obtener todos los productos
  getProductos: async (search?: string): Promise<ProductosApiResponse> => {
    let url = `${API_BASE_URL}/productos`;
    
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

  // Obtener un producto por ID
  getProductoById: async (id: number): Promise<ProductoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // Eliminar un producto
  deleteProducto: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
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

  // Crear un nuevo producto
  createProducto: async (data: CreateProductoDto): Promise<ProductoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/productos`, {
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

  // Actualizar un producto
  updateProducto: async (id: number, data: UpdateProductoDto): Promise<ProductoResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
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