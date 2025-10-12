// En ~/componentes/VentasDashboard.tsx

import React, { useState, useMemo } from 'react';

import { useSucursales } from '~/hooks/useSucursales'; 

import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// 🛑 Componente ComboBox1 (Importación crucial)
import ComboBox1 from '~/componentes/ComboBox1'; 
import type { VentaResponseDto } from '~/models/ventas';
import { useVentas } from '~/hooks/useVentas';

// Componentes simulados (debes tenerlos definidos)
const KpiCard = ({ title, value, color }: { title: string, value: string | number, color: string }) => (
    <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', borderLeft: `5px solid ${color}` }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>{title}</p>
        <h3 style={{ margin: '5px 0 0', fontSize: '20px', color: '#333' }}>{value}</h3>
    </div>
);

// Registrar elementos de Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

// --- Lógica de Procesamiento Central: Agregación Diaria ---
const aggregateVentasByDate = (ventas: VentaResponseDto[]) => {
    const dailyData = new Map<string, { count: number, income: number }>();

    for (const venta of ventas) {
        // Asegurarse de que sea una fecha y formatearla
        const dateKey = venta.fechaVenta instanceof Date 
            ? venta.fechaVenta.toISOString().split('T')[0] 
            : new Date(venta.fechaVenta).toISOString().split('T')[0]; 

        const current = dailyData.get(dateKey) || { count: 0, income: 0 };
        
        dailyData.set(dateKey, {
            count: current.count + 1,
            income: current.income + venta.total,
        });
    }

    const sortedKeys = Array.from(dailyData.keys()).sort();
    
    return {
        labels: sortedKeys.map(date => new Date(date).toLocaleDateString()),
        ventasCount: sortedKeys.map(key => dailyData.get(key)!.count),
        ingresosSum: sortedKeys.map(key => dailyData.get(key)!.income),
    };
};
const aggregateVentasByMonth = (ventas: VentaResponseDto[]) => {
    const monthlyData = new Map<string, { count: number, income: number }>();

    for (const venta of ventas) {
        const fecha = venta.fechaVenta;
        const fechaValida = fecha instanceof Date && !isNaN(fecha.getTime());
        
        if (!fechaValida) continue;

        // Clave del mes: YYYY-MM
        const monthKey = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`; 
        
        const current = monthlyData.get(monthKey) || { count: 0, income: 0 };
        
        monthlyData.set(monthKey, {
            count: current.count + 1,
            income: current.income + venta.total,
        });
    }

    const sortedKeys = Array.from(monthlyData.keys()).sort();
    
    // Formato de etiqueta: ej. 'Oct 2025'
    const labels = sortedKeys.map(key => {
        const [year, month] = key.split('-');
        return new Date(Number(year), Number(month) - 1).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
    });

    return {
        labels,
        ventasCount: sortedKeys.map(key => monthlyData.get(key)!.count),
        ingresosSum: sortedKeys.map(key => monthlyData.get(key)!.income),
    };
};
const VentasDashboard = () => {
    
    const { sucursales = [], isLoading: isLoadingSucursales } = useSucursales(""); 
    const [selectedSucursalId, setSelectedSucursalId] = useState<number | undefined>(undefined);
    
    // 🛑 NUEVOS ESTADOS
    const [dailyRange, setDailyRange] = useState<number>(10); // Rango diario (3-10)
    const [monthRange, setMonthRange] = useState<number>(6);  // Rango mensual (3-12)

    const options = useMemo(() => ({ sucursalId: selectedSucursalId }), [selectedSucursalId]);
    
    const { estadisticas, ventasUltimos3Meses, ventasUltimos12Meses, isLoading, isError, error } = useVentas(options);
    
    // --- LÓGICA GRÁFICOS DIARIOS (Se mantiene, usa dailyRange) ---
    const chartDailyData = useMemo(() => {
        if (!ventasUltimos3Meses || ventasUltimos3Meses.length === 0) return null;
        
        const aggregated = aggregateVentasByDate(ventasUltimos3Meses);
        const startIndex = Math.max(0, aggregated.labels.length - dailyRange); // 🛑 Usa dailyRange

        return {
            labels: aggregated.labels.slice(startIndex),
            ventasCount: aggregated.ventasCount.slice(startIndex),
            ingresosSum: aggregated.ingresosSum.slice(startIndex),
        };
    }, [ventasUltimos3Meses, dailyRange]); // 🛑 Dependencia de dailyRange

    // --- LÓGICA GRÁFICOS MENSUALES (NUEVO) ---
    const chartMonthlyData = useMemo(() => {
        if (!ventasUltimos12Meses || ventasUltimos12Meses.length === 0) return null;
        
        const aggregated = aggregateVentasByMonth(ventasUltimos12Meses);

        const startIndex = Math.max(0, aggregated.labels.length - monthRange); // 🛑 Usa monthRange

        return {
            labels: aggregated.labels.slice(startIndex),
            ventasCount: aggregated.ventasCount.slice(startIndex),
            ingresosSum: aggregated.ingresosSum.slice(startIndex),
        };
    }, [ventasUltimos12Meses, monthRange]); // 🛑 Dependencia de monthRange

    // --- Configuración de ComboBox1 y Handlers (Se mantiene) ---
    const SUCRURSAL_TODAS_OPTION = { value: '0', label: 'Todas las Sucursales' }; 
    const sucursalComboBoxOptions = useMemo(() => {
        const sucursalesMapped = sucursales.map(s => ({
            value: String(s.id), 
            label: s.nombre
        }));
        
        return [
            SUCRURSAL_TODAS_OPTION,
            ...sucursalesMapped
        ];
    }, [sucursales]);
    // 🛑 HANDLER MODIFICADO: Ahora espera un string (el 'value' de la opción)
    const handleSucursalChange = (valueString: string) => {
        // valueString será '0', '1', '2', etc.
        const id = valueString ? Number(valueString) : undefined;
        
        // Si el valor es '0' (Todas) o null/undefined, establecemos el filtro como undefined
        setSelectedSucursalId((id === 0 || id == null || isNaN(id)) ? undefined : id);
    };
    const currentSucursalValue = selectedSucursalId === undefined ? SUCRURSAL_TODAS_OPTION.value : String(selectedSucursalId);
    
    // --- Opciones de Rangos ---
    const dailyOptions = Array.from({ length: 8 }, (_, i) => i + 3); // [3, 4, ..., 10]
    const monthlyOptions = Array.from({ length: 10 }, (_, i) => i + 3); // [3, 4, ..., 12]

    if (isLoading || isLoadingSucursales) {
        return <p style={{ padding: '30px', textAlign: 'center' }}>Cargando datos...</p>;
    }

    if (isError) {
        return <p style={{ padding: '30px', color: 'red', textAlign: 'center' }}>Error al obtener datos: {error?.message}</p>;
    }

    // --- Gráfico de Datos (DATA SETS) ---
    // Diarios
    const lineDailyData = chartDailyData ? { labels: chartDailyData.labels, datasets: [{ label: 'Ventas (Unidades)', data: chartDailyData.ventasCount, borderColor: '#007bff', backgroundColor: 'rgba(0, 123, 255, 0.1)', fill: true, tension: 0.2 }] } : { labels: [], datasets: [] };
    const barDailyData = chartDailyData ? { labels: chartDailyData.labels, datasets: [{ label: 'Ingresos (Bs)', data: chartDailyData.ingresosSum, backgroundColor: '#28a745', borderColor: '#28a745', borderWidth: 1 }] } : { labels: [], datasets: [] };
    
    // Mensuales
    const lineMonthlyData = chartMonthlyData ? { labels: chartMonthlyData.labels, datasets: [{ label: 'Ventas (Unidades)', data: chartMonthlyData.ventasCount, borderColor: '#007bff', backgroundColor: 'rgba(0, 123, 255, 0.1)', fill: true, tension: 0.2 }] } : { labels: [], datasets: [] };
    const barMonthlyData = chartMonthlyData ? { labels: chartMonthlyData.labels, datasets: [{ label: 'Ingresos (Bs)', data: chartMonthlyData.ingresosSum, backgroundColor: '#28a745', borderColor: '#28a745', borderWidth: 1 }] } : { labels: [], datasets: [] };

    // Opciones de barra (para formato de moneda)
    const barChartOptions = { responsive: true, scales: { y: { beginAtZero: true, title: { display: true, text: 'Valor' }, ticks: { callback: (value: any) => value > 1000 ? `Bs${(value / 1000).toFixed(1)}K` : `Bs${value.toLocaleString()}` } } }, maintainAspectRatio: false };


    return (
        <div style={{ padding: '30px', backgroundColor: '#f4f7f9' }}>
            <h2>Dashboard de Ventas 📈</h2>
            
            {/* --- 🛑 1. KPIs SUPERIORES (Día y Mes Actual) --- */}
            {estadisticas && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
                    <KpiCard title="Ventas Hoy (Unidades)" value={estadisticas.ventasHoy} color="#007bff" />
                    <KpiCard title="Ingresos Hoy (Bs)" value={`Bs${(estadisticas.totalIngresos || 0)}`} color="#20c997" /> {/* Suponiendo que el backend te da ingresosHoy */}
                    <KpiCard title="Ventas Este Mes (Unidades)" value={estadisticas.ventasEsteMes} color="#17a2b8" />
                    <KpiCard title="Ingresos Este Mes (Bs)" value={`Bs${estadisticas.ingresosEsteMes}`} color="#ffc107" />
                </div>
            )}
            
            <hr/>
            
            {/* ----------------------------------------------------------- */}
            {/* --- 2. GRÁFICOS DE TENDENCIA DIARIA (3-10 DÍAS) --- */}
            {/* ----------------------------------------------------------- */}
            
            <h3>Tendencia Diaria</h3>

            <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', alignItems: 'flex-end' }}>
                
                {/* Selector de Sucursal */}
                <div style={{ width: '300px' }}>
                    <ComboBox1 label="Filtrar Sucursal" options={sucursalComboBoxOptions} value={currentSucursalValue} onChange={handleSucursalChange} placeholder="Seleccione la sucursal" width="100%" disabled={isLoadingSucursales} />
                </div>

                {/* 🛑 Control de Rango DIARIO */}
                <div style={{ width: '150px' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
                        Rango Diario
                    </label>
                    <select value={dailyRange} onChange={(e) => setDailyRange(Number(e.target.value))} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', height: '38px' }}>
                        {dailyOptions.map((day) => (<option key={day} value={day}>Últimos {day} días</option>))}
                    </select>
                </div>
            </div>

            {chartDailyData && chartDailyData.labels.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h4>Ventas Diarias (Unidades) - Últimos {dailyRange} Días</h4>
                        <div style={{ height: '350px' }}><Line data={lineDailyData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h4>Ingresos Diarios (Bs) - Últimos {dailyRange} Días</h4>
                        <div style={{ height: '350px' }}><Bar data={barDailyData} options={barChartOptions} /></div>
                    </div>
                </div>
            ) : (<p style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '8px' }}>No hay datos suficientes para la tendencia diaria.</p>)}
            
            <hr style={{ marginTop: '40px' }}/>

            {/* ----------------------------------------------------------- */}
            {/* --- 3. 🛑 GRÁFICOS DE TENDENCIA MENSUAL (3-12 MESES) --- */}
            {/* ----------------------------------------------------------- */}
            
            <h3>Tendencia Mensual</h3>

            <div style={{ width: '150px', marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', color: '#333' }}>
                    Rango Mensual
                </label>
                <select value={monthRange} onChange={(e) => setMonthRange(Number(e.target.value))} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '100%', height: '38px' }}>
                    {monthlyOptions.map((month) => (<option key={month} value={month}>Últimos {month} meses</option>))}
                </select>
            </div>


            {chartMonthlyData && chartMonthlyData.labels.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h4>Ventas Mensuales (Unidades) - Últimos {monthRange} Meses</h4>
                        <div style={{ height: '350px' }}><Line data={lineMonthlyData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                        <h4>Ingresos Mensuales (Bs) - Últimos {monthRange} Meses</h4>
                        <div style={{ height: '350px' }}><Bar data={barMonthlyData} options={barChartOptions} /></div>
                    </div>
                </div>
            ) : (<p style={{ textAlign: 'center', padding: '40px', backgroundColor: '#fff', borderRadius: '8px' }}>No hay datos suficientes para la tendencia mensual.</p>)}

        </div>
    );
};

export default VentasDashboard;