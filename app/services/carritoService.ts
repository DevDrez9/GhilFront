// En ~/services/carritoService.ts

import { CarritoResponseDto, CarritoEstado } from '~/models/carrito';

const API_BASE_URL = 'http://localhost:3000';

export const carritoService = {
    // 1. Obtener carritos filtrados
    findCarritosByTiendaAndState: async (
        tiendaId: number, 
        estadoFiltro: CarritoEstado
    ): Promise<CarritoResponseDto[]> => {
        const url = `${API_BASE_URL}/carritos/tienda/${tiendaId}?estado=${estadoFiltro}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error al obtener pedidos para la tienda ${tiendaId}.`);
        }
        const data = await response.json();
        // Mapear los datos brutos a DTOs
        return data.map((carrito: any) => new CarritoResponseDto(carrito));
    },

    // 2. Finalizar un pedido (mutación)
    complete: async (id: number): Promise<CarritoResponseDto> => {
        const response = await fetch(`${API_BASE_URL}/carritos/${id}/complete`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            throw new Error(`Error al finalizar el pedido ${id}.`);
        }
        
        const data = await response.json();
        return new CarritoResponseDto(data);
    },
};