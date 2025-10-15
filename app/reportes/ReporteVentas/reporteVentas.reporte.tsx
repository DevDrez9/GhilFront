import React, { useMemo, useRef, useState } from 'react';
// 🛑 Reemplaza estas con tus rutas reales de componentes
import Boton1 from '~/componentes/Boton1'; 
import ComboBox1 from '~/componentes/ComboBox1'; 
import { useSucursales } from '~/hooks/useSucursales'; 

import { exportToPDF } from '~/utils/exportUtils'; 

// Importa los hooks y tipos
import { useVentaEstadisticas, useVentaTendencia } from '~/services/reportes/ventas/hookVentaReporte'; 
import type { PeriodoVenta, VentaReporteOptions } from '~/models/ventaReporte'; 
import "./reporteVentas.style.css"
import { useOutletContext } from 'react-router';


// Asume que este tipo existe en tu proyecto (SucursalResponseDto)
interface SucursalResponseDto {
    id: number;
    nombre: string;
}

// --- UTILIDADES ---
export const formatCurrency = (amount: string | number | null | undefined): string => {
    if (amount === null || amount === undefined) return 'Bs.0.00';
    // Aseguramos la conversión a número con dos decimales
    const num = Number(amount);
    if (isNaN(num)) return 'Bs.0.00';
    
    const formatted = num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `Bs.${formatted}`; 
};

export const MetricCard = ({ title, value, unit = '', color = '#34495e' }) => (
    <div style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '6px', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{title}</p>
        <h3 style={{ margin: '5px 0 0', color: color }}>
            {value} {unit}
        </h3>
    </div>
);
// -------------------

interface ComboBoxOption {
    value: string;
    label: string;
    data: any; 
}

interface ReporteVentasProps {
    visible: boolean;
    onClose: () => void;
}

const DEFAULT_TIENDA_ID = 1; // ID de tienda por defecto

// 🚨 Reutiliza o define la interfaz
interface LayoutContext {
    user,tienda
}

const ReporteVentas : React.FC<ReporteVentasProps> = ({ onClose, visible }) => {

    const { user, tienda } = useOutletContext<LayoutContext>();
    
     const reporteRef = useRef<HTMLDivElement | null>(null); // Referencia al contenido a exportar
   
    const [periodoTendencia, setPeriodoTendencia] = useState<PeriodoVenta>('mes');
    // undefined = Consolidado de la Tienda
    const [selectedSucursalId, setSelectedSucursalId] = useState<number | undefined>(undefined);

    // Asume que useSucursales devuelve la lista de sucursales
    // const { sucursales = [], isLoading: isLoadingSucursales } = useSucursales(""); 
    // Usaremos un mock temporal para que el código compile:
    
    const { sucursales = [], isLoading: isLoadingSucursales } = useSucursales(""); 


     const fechaActual = new Date();
  const dia = String(fechaActual.getDate()).padStart(2, '0');
  const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Los meses son de 0-11, por eso se suma 1
  const anio = fechaActual.getFullYear();

  const fechaFormateada = `${dia}/${mes}/${anio}`;

    
    // 1. Opciones para el ComboBox (incluye la opción consolidada)
    const sucursalComboBoxOptions: ComboBoxOption[] = useMemo(() => {
        const defaultOption: ComboBoxOption = {
            value: 'tienda_consolidada',
            label: `Todas las sucursales`,
            data: { id: undefined }
        };

        const options = sucursales.map((suc) => ({
            value: suc.id.toString(),
            label: `${suc.nombre} (ID: ${suc.id})`,
            data: suc
        }));

        return [defaultOption, ...options];
    }, [sucursales]);

    // 2. Lógica de Filtro para los Hooks
    const filtroTiendaId = selectedSucursalId === undefined ? DEFAULT_TIENDA_ID : undefined;
    const filtroSucursalId = selectedSucursalId;
    
    const options: VentaReporteOptions = useMemo(() => ({ 
        tiendaId: filtroTiendaId, 
        sucursalId: filtroSucursalId, 
        periodoTendencia 
    }), [filtroTiendaId, filtroSucursalId, periodoTendencia]);
    
    // 3. Llamada a Hooks
    const { data: estadisticas, isLoading: isLoadingStats, isError: isErrorStats, error: errorStats } = useVentaEstadisticas(options);
    const { data: tendencia = [], isLoading: isLoadingTendencia, isError: isErrorTendencia } = useVentaTendencia(options);

    const isLoading = isLoadingStats || isLoadingTendencia;
    const isError = isErrorStats || isErrorTendencia;
    const error = errorStats;
    
    // 4. Manejador de cambio del ComboBox (Recibe el string del value)
    const handleSucursalChange = (value: string) => {
        if (value === 'tienda_consolidada') {
            setSelectedSucursalId(undefined); 
        } else if (value) {
            setSelectedSucursalId(Number(value)); 
        } else {
            setSelectedSucursalId(undefined); 
        }
    };

    // 5. Cálculo del valor actual para el ComboBox (Necesita el objeto completo)
    const currentSucursalOption: ComboBoxOption | null = useMemo(() => {
        const valueToFind = selectedSucursalId === undefined 
            ? 'tienda_consolidada' 
            : selectedSucursalId.toString();

        return sucursalComboBoxOptions.find(opt => opt.value === valueToFind) || null;
    }, [selectedSucursalId, sucursalComboBoxOptions]);
    
    // 6. Título dinámico
    let titleScope: string;
    if (selectedSucursalId === undefined) {
        titleScope = `Todas las Sucursales`;
    } else {
        const sucursal = sucursales.find((s) => s.id === selectedSucursalId);
        titleScope = sucursal ? `Sucursal: ${sucursal.nombre}` : `Sucursal ID: ${selectedSucursalId}`;
    }

    const containerClasses = [
        "contenedorReportVentas",
        visible ? "visible" : "noVisible",
    ].filter(Boolean).join(" ");
    
    // 7. LÓGICA DEL BOTÓN DE DESCARGA PDF 🚀
    const handleDownloadPDF = () => {
        if (reporteRef.current) {
            const date = new Date().toISOString().slice(0, 10);
            const scope = titleScope.replace(/[\s\(\)]/g, '_').toLowerCase();
            const filename = `reporte_ventas_${scope}_${date}.pdf`;
            
            // Llama a la función de utilidad (que debes implementar)
            exportToPDF(reporteRef.current, filename, `Reporte de Ventas - ${titleScope}`);
        }
    };

    if (isLoadingSucursales || isLoading) {
        return <div className={containerClasses}><p>Cargando reporte de ventas...</p></div>;
    }
    
    if (isError || !estadisticas) {
        return (
            <div className={containerClasses}>
                <p style={{ color: 'red' }}>Error al cargar las ventas: {error?.message || "Datos no disponibles."}</p>
            </div>
        );
    }

    const periodos = [{ value: 'dia', label: 'Día' }, { value: 'semana', label: 'Semana' }, { value: 'mes', label: 'Mes' }];
    
    return (
        <div className={containerClasses}>
            {/* ... Botón Atrás ... */}
            
            <div className="reporteVentasContainer">
                
                <h2 style={{fontSize:"30px", fontWeight:"bold"}}>💰 Reporte de Ventas: {titleScope}</h2>
                {/* ... Botón Descargar PDF ... */}
                
                {/* FILTRO COMBOBOX */}
                <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '4px' }}>
                    <div style={{ width: '300px' }}>
                        <ComboBox1 
                            label="Filtrar Sucursal" 
                            options={sucursalComboBoxOptions} 
                            onChange={handleSucursalChange} 
                            value={currentSucursalOption.value+""} 
                            placeholder="Seleccione la sucursal" 
                            width="100%" 
                            disabled={isLoadingSucursales || isLoading} 
                        />
                    </div>

                    <h3 style={{  paddingBottom: '10px' }}>
                        Tendencia de Ventas Agrupada por {periodoTendencia.toUpperCase()}
                    </h3>
                    
                    {/* ... Botones de Agrupación por Día/Semana/Mes ... */}
                    <div style={{ marginBottom: '15px' }}>
                         <label style={{marginRight: '10px'}}>Agrupar por:</label>
                        {periodos.map(p => (
                            <Boton1
                                key={p.value}
                                
                                size="small"
                                onClick={() => setPeriodoTendencia(p.value as PeriodoVenta)}
                                style={{ marginRight: '5px' }}
                                type="button"
                            >
                                {p.label}
                            </Boton1>
                        ))}
                    </div>

                     <Boton1 
                        variant="primary" 
                        size="medium" 
                        onClick={handleDownloadPDF}
                        disabled={isLoading} 
                    >
                        Descargar PDF
                    </Boton1>

                </div>
                  
                
                {/* Contenido del reporte */}
                <div ref={reporteRef} className="reporteContent">

                    <div ref={reporteRef} className="reporteContent" style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eee', padding: '15px' }}>
                <div style={{display:"flex", alignItems:"center"}}>
<img style={{height: '150px'}} src={ "http://localhost:3000/"+tienda.configWeb.logoUrl}/>
<h3 style={{fontSize:"30px",  fontWeight:"bold",  marginLeft:"15px"} }> {tienda.nombre}</h3>
                    </div></div>
                    <div style={{margin:"0 200px "}}>

                    
                    <h3 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>Métricas Historicas </h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                        
                        <MetricCard title="Ventas Totales" value={formatCurrency(estadisticas.ingresoTotal)} color="#0d6efd"/>
                        <MetricCard title="Total de Transacciones" value={estadisticas.totalVentas} unit="transacciones" color="#198754"/>
                        <MetricCard title="Venta Promedio" value={formatCurrency(estadisticas.promedioVenta)} color="#ffc107"/>
                        <MetricCard title="Ingreso de Hoy" value={formatCurrency(estadisticas.ingresoHoy)} color="#6f42c1"/>
                        <MetricCard title="Productos Vendidos" value={estadisticas.productosVendidos} unit="uds" color="#dc3545"/>
                    </div>

                  
                    <h3 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>Métricas de {titleScope} por {periodoTendencia.toUpperCase()} </h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px', fontSize: '14px' }}>
                        <thead>
                            {/* ... Encabezados de tabla ... */}
                            <tr style={{ backgroundColor: '#f8f9fa' }}>
                                <th style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'left' }}>Período</th>
                                <th style={{ border: '1px solid #dee2e6', padding: '10px', textAlign: 'right' }}>Total Vendido</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tendencia.map((item, index) => (
                                <tr key={index}>
                                    <td style={{ border: '1px solid #dee2e6', padding: '8px' }}>{item.fecha}</td>
                                    <td style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'right' }}>{formatCurrency(item.total)}</td>
                                </tr>
                            ))}
                            {tendencia.length === 0 && (
                                <tr>
                                    <td colSpan={2} style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'center' }}>No hay datos de ventas para este período.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <h2 style={{color:"gray", margin:"10px 0"}}>Generado: {fechaFormateada}</h2>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReporteVentas;