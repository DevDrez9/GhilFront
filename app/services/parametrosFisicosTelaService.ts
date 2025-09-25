// src/services/parametrosFisicosTelaService.ts

import type { CreateParametrosFisicosTelaDto, ParametrosFisicosTelaFilters, ParametrosFisicosTelaResponseDto } from "~/models/parametrosFisicosTela";


const API_BASE_URL = 'http://localhost:3000';

export const parametrosFisicosTelaService = {
  // GET - Obtener todos los parámetros
  getParametrosFisicosTelas: async (
    
  ): Promise<ParametrosFisicosTelaResponseDto[]> => {
    

    const url = `${API_BASE_URL}/parametros-fisicos-tela`;
    
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

  // GET - Obtener un parámetro por ID
  getParametrosFisicosTelaById: async (
    id: number
  ): Promise<ParametrosFisicosTelaResponseDto> => {
    const response = await fetch(`${API_BASE_URL}/parametros-fisicos-tela/${id}`, {
      headers: {
        
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // POST - Crear nuevo parámetro
  createParametrosFisicosTela: async (
    data: CreateParametrosFisicosTelaDto
  ): Promise<ParametrosFisicosTelaResponseDto> => {

     // ✅ VALIDAR Y CONVERTIR LOS DATOS ANTES DE ENVIAR
    const validatedData = {
      nombre: data.nombre?.trim() || '',
      descripcion: data.descripcion?.trim() || undefined,
      anchoTela: Number(data.anchoTela) || 0, // ✅ Asegurar que es número
      tubular: Boolean(data.tubular),
      notasTela: data.notasTela?.trim() || undefined,
      
    };

    // ✅ Validación adicional
    if (validatedData.anchoTela < 0) {
      throw new Error('El ancho de tela no puede ser negativo');
    }

    const response = await fetch(`${API_BASE_URL}/parametros-fisicos-tela`, {
      method: 'POST',
      headers: {
        
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });

     // ✅ Leer el cuerpo del error para debuggear
      const responseText = await response.text();
      console.log('📄 Response text:', responseText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // PUT - Actualizar parámetro
  updateParametrosFisicosTela: async (
    id: number, 
    data: Partial<CreateParametrosFisicosTelaDto>
  ): Promise<ParametrosFisicosTelaResponseDto> => {

     const validatedDataUp = {
      nombre: data.nombre?.trim() || '',
      descripcion: data.descripcion?.trim() || undefined,
      anchoTela: Number(data.anchoTela) || 0, // ✅ Asegurar que es número
      tubular: Boolean(data.tubular),
      notasTela: data.notasTela?.trim() || undefined,
      
    };
    const response = await fetch(`${API_BASE_URL}/parametros-fisicos-tela/${id}`, {
      method: 'PATCH',
      headers: {
        
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedDataUp),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  },

  // DELETE - Eliminar parámetro
  deleteParametrosFisicosTela: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/parametros-fisicos-tela/${id}`, {
      method: 'DELETE',
      headers: {
        
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }
  }

  
};