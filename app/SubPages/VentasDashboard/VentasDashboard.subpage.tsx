// En ~/componentes/VentasDashboard.tsx

import React from 'react';
import { useVentas } from '~/hooks/useVentas';
import {EstadoVenta, type EstadisticasVentaResponse } from '~/models/estadisticas';

// Importaciones de Chart.js
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// 🛑 IMPORTANTE: Registrar los elementos de Chart.js
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);


// --- Componente simulado de Card para KPI (Se mantiene igual) ---
const KpiCard = ({ title, value, color }: { title: string, value: string | number, color: string }) => (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: `5px solid ${color}` }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{title}</p>
        <h3 style={{ margin: '8px 0 0', fontSize: '24px', color: '#333' }}>{value}</h3>
    </div>
);

// --- Funciones de Formateo de Datos (Sin cambios, pero cruciales) ---

// Prepara datos para el gráfico de Tarta/Donut (Ventas por Estado)
const formatEstadoData = (data: EstadisticasVentaResponse) => {
    return data.ventasPorEstado.map(item => ({
        name: item.estado,
        value: item._count._all,
    }));
};

// Prepara datos para el gráfico de Barras (Ingresos por Método de Pago)
const formatPagoData = (data: EstadisticasVentaResponse) => {
    return data.ventasPorMetodoPago.map(item => ({
        name: item.metodoPago,
        ingresos: item._sum.total || 0,
    }));
};


const VentasDashboard = () => {
    const { data, isLoading, isError, error } = useVentas();

    if (isLoading) {
        return <p style={{ padding: '20px', textAlign: 'center' }}>Cargando estadísticas de ventas...</p>;
    }

    if (isError || !data) {
        return <p style={{ padding: '20px', color: 'red', textAlign: 'center' }}>Error al obtener las estadísticas: {error?.message || 'Datos no disponibles'}</p>;
    }
    
    const estadoData = formatEstadoData(data);
    const pagoData = formatPagoData(data);


    // ----------------------------------------------------
    // 🛑 DATA PARA DOUGHNUT (Ventas por Estado)
    // ----------------------------------------------------

    // Mapeo de estados a colores fijos para consistencia visual
    const ESTADO_COLORES = {
        [EstadoVenta.CONFIRMADA]: '#28a745', // Verde
        [EstadoVenta.PENDIENTE]: '#ffc107',  // Amarillo/Naranja
        [EstadoVenta.CANCELADA]: '#dc3545',  // Rojo
        // Añade más estados si los tienes
    };

    const doughnutData = {
        labels: estadoData.map(item => item.name),
        datasets: [{
            data: estadoData.map(item => item.value),
            backgroundColor: estadoData.map(item => ESTADO_COLORES[item.name as EstadoVenta] || '#6c757d'),
            hoverBackgroundColor: estadoData.map(item => ESTADO_COLORES[item.name as EstadoVenta] || '#6c757d'),
            borderWidth: 1,
        }]
    };

    // ----------------------------------------------------
    // 🛑 DATA PARA BAR (Ingresos por Método de Pago)
    // ----------------------------------------------------

    const barData = {
        labels: pagoData.map(item => item.name), // EFECTIVO, TARJETA, TRANSFERENCIA
        datasets: [{
            label: 'Ingresos Totales ($)',
            data: pagoData.map(item => item.ingresos),
            backgroundColor: '#007bff', // Azul
            borderColor: '#007bff',
            borderWidth: 1,
        }]
    };
    
    // Opciones del gráfico de barras para formato de moneda
    const barOptions = {
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: { display: true, text: 'Ingresos ($)' },
                ticks: {
                    callback: function(value: any) {
                        return `$${value.toLocaleString()}`;
                    }
                }
            }
        }
    };

    return (
        <div style={{ padding: '30px', backgroundColor: '#f4f7f9' }}>
            <h2>Dashboard de Ventas 📊</h2>
            
            {/* --- 1. KPIs --- (Mantenemos la estructura visual) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                <KpiCard title="Total Ventas (Histórico)" value={data.totalVentas} color="#007bff" />
                <KpiCard title="Ventas Hoy" value={data.ventasHoy} color="#28a745" />
                <KpiCard title="Total Ingresos (Histórico)" value={`$${data.totalIngresos}`} color="#17a2b8" />
                <KpiCard title="Ingresos Este Mes" value={`$${data.ingresosEsteMes}`} color="#ffc107" />
            </div>

            {/* --- 2. Gráficos --- */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                
                {/* Gráfico 1: Ventas por Estado (Doughnut) */}
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3>Ventas por Estado (Unidades)</h3>
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                {/* Gráfico 2: Ingresos por Método de Pago (Barras) */}
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <h3>Ingresos por Método de Pago</h3>
                    <div style={{ height: '300px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Bar data={barData} options={barOptions} />
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default VentasDashboard;