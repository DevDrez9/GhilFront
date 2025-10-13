// En ~/componentes/pedidos/ListadoPedidos.tsx

import { useState, useMemo } from 'react';
import ComboBox1 from '~/componentes/ComboBox1'; // Asume este componente existe
import Boton1 from '~/componentes/Boton1';   // Asume este componente existe
import { usePedidos } from '~/hooks/usePedidos';
import { CarritoResponseDto, CarritoEstado } from '~/models/carrito';

// 🛑 Constantes para el ComboBox
const ESTADO_OPTIONS = [
    { value: CarritoEstado.TODOS, label: 'Todos los Pedidos' },
    { value: CarritoEstado.PENDIENTE, label: 'Pendientes' },
    { value: CarritoEstado.TERMINADO, label: 'Finalizados' },
];

// 🛑 Reemplaza con tu lógica real para obtener el ID de la tienda
const TIENDA_ACTUAL_ID = 1; 

const CarritoSubPage = () => {
    const [estadoSeleccionado, setEstadoSeleccionado] = useState<CarritoEstado>(CarritoEstado.TODOS);
    
    const queryOptions = useMemo(() => ({
        tiendaId: TIENDA_ACTUAL_ID,
        estadoFiltro: estadoSeleccionado,
    }), [estadoSeleccionado]);

    const { 
        data: pedidos = [], 
        isLoading, 
        isError, 
        error,
        completePedidoAsync, 
        isCompleting 
    } = usePedidos(queryOptions);

    const handleEstadoChange = (valueString) => {
        setEstadoSeleccionado(valueString);
    };

    const handleCompletePedido = async (id) => {
        if (window.confirm(`¿Está seguro de finalizar el Pedido #${id}?`)) {
            try {
                await completePedidoAsync(id);
                // La alerta se maneja con una notificación real en una app grande
            } catch (e) {
                alert(`Error al finalizar el Pedido #${id}.`);
            }
        }
    };

    return (
        <div className="listadoPedidos">
            <h2>📦 Listado de Pedidos</h2>

            {/* --- CONTROLES DE FILTRO --- */}
            <div style={{ width: '300px', marginBottom: '25px' }}>
                <ComboBox1
                    label="Filtrar por Estado"
                    options={ESTADO_OPTIONS}
                    value={estadoSeleccionado}
                    onChange={handleEstadoChange}
                    width="100%"
                    disabled={isLoading}
                />
            </div>
            
            {/* --- LISTADO Y RESULTADOS --- */}
            {isLoading && <p>Cargando pedidos...</p>}
            {isError && <p style={{ color: 'red' }}>Error al cargar los pedidos: {error?.message}</p>}

            {!isLoading && pedidos.length === 0 && (
                <p style={{ padding: '20px', backgroundColor: '#fffbe6', border: '1px solid #ffe0b2', borderRadius: '6px' }}>
                    No se encontraron pedidos en este estado.
                </p>
            )}

            <div className="pedidosGrid" style={{ display: 'grid', gap: '20px' }}>
                {pedidos.map(pedido => (
                    <PedidoCard 
                        key={pedido.id} 
                        pedido={pedido} 
                        onComplete={handleCompletePedido} 
                        isCompleting={isCompleting}
                    />
                ))}
            </div>
        </div>
    );
};

// Componente PedidoCard
const PedidoCard = ({ pedido, onComplete, isCompleting }) => {
    
    const estadoMap = {
        [CarritoEstado.PENDIENTE]: { color: '#e67e22', bg: '#fef3e3', label: 'Pendiente' },
        [CarritoEstado.TERMINADO]: { color: '#27ae60', bg: '#e8f8f5', label: 'Finalizado' },
        default: { color: '#34495e', bg: '#ecf0f1', label: pedido.estado }
    };
    const style = estadoMap[pedido.estado] || estadoMap.default;
    
    return (
        <div style={{ padding: '15px', border: `1px solid ${style.bg}`, borderRadius: '8px', backgroundColor: '#ffffff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0 }}>Pedido #{pedido.id}</h4>
                <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold', color: style.color, backgroundColor: style.bg, border: `1px solid ${style.color}` }}>
                    {style.label.toUpperCase()}
                </span>
            </div>
            
            <p style={{ margin: '10px 0 5px 0' }}>
                <strong>Cliente:</strong> {pedido.cliente || 'Anónimo'}
            </p>
            <p style={{ margin: '0 0 10px 0' }}>
                <strong>Total:</strong> ${pedido.precio} | 
                <strong> Ítems:</strong> {pedido.items.length}
            </p>
            
            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between' }}>
                {pedido.estado === CarritoEstado.PENDIENTE && (
                    <Boton1 
                        variant="success" 
                        size="small" 
                        onClick={() => onComplete(pedido.id)} 
                        disabled={isCompleting} 
                    >
                        {isCompleting ? 'Finalizando...' : '✅ Finalizar Pedido'}
                    </Boton1>
                )}
                {pedido.estado === CarritoEstado.TERMINADO && (
                    <span style={{ color: '#27ae60', fontSize: '14px', fontWeight: 'bold' }}>
                        Pedido Terminado
                    </span>
                )}
                
                <Boton1 size="small" variant="secondary">Ver Detalle</Boton1>
            </div>
            
            <p style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>
                Creado: {new Date(pedido.createdAt).toLocaleString()}
            </p>
        </div>
    );
};

export default CarritoSubPage;