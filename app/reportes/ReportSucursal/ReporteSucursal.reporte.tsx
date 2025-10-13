// En ~/componentes/reportes/ReporteSucursal.tsx

import React, { useMemo, useRef } from 'react';

import Boton1 from '~/componentes/Boton1'; 
import { useSucursalEstadisticas } from '~/services/reportes/sucursales/hookSucursalReport';
import { exportToPDF } from '~/utils/exportUtils'; // 🛑 Función de exportación a PDF reutilizable
import "./ReporteSucursal.style.css"


const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'Bs.0.00';
    return `Bs.${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
};

const MetricCard = ({ title, value, unit = '', color = '#34495e' }) => (
    <div style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '6px', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{title}</p>
        <h3 style={{ margin: '5px 0 0', color: color }}>
            {value.toLocaleString()} {unit}
        </h3>
    </div>
);
interface ReporteSucursalProps {
    visible: boolean;
    onClose: () => void;
    sucursalId:number,
    
}

const ReporteSucursal  : React.FC<ReporteSucursalProps> = ({ sucursalId,onClose, visible }) => {
    // 🛑 1. Crear la referencia para el contenido del PDF

    
     const containerClasses = [
    "contenedorReportSucursal",
    visible ? "visible" : "noVisible",
  ]
    .filter(Boolean)
    .join(" ");
    const reporteRef = useRef(null); 
    
    const options = useMemo(() => ({ sucursalId }), [sucursalId]);
    
    const { data, isLoading, isError, error } = useSucursalEstadisticas(options);

    if (!sucursalId) {
        return <p>Por favor, seleccione una sucursal para generar el reporte de estadísticas.</p>;
    }

    if (isLoading) {
        return <p>Cargando estadísticas de la sucursal {sucursalId}...</p>;
    }

    if (isError) {
        return <p style={{ color: 'red' }}>Error al cargar las estadísticas: {error?.message}</p>;
    }

    const { sucursal, estadisticas } = data;
    
    // 🛑 2. Handler para la descarga de PDF
    const handleDownloadPDF = () => {
        const filename = `reporte_sucursal_${sucursal.nombre.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
        // Usamos la función reutilizable, pasándole la referencia
        exportToPDF(reporteRef.current, filename);
    };
    
    return (
         <div className={containerClasses}>
            <div className="atras">
                 <Boton1 type="button" size="medium" variant="info" onClick={onClose}>
            Atrás
          </Boton1>
            </div>
        <div className="reporteSucursalContainer">
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>📊 Reporte Estadístico: {sucursal.nombre}</h2>
                <Boton1 
                    variant="primary" 
                    size="medium" 
                    onClick={handleDownloadPDF}
                    disabled={isLoading} 
                >
                    Descargar PDF
                </Boton1>
            </div>
            
            {/* 🛑 3. Asignar la referencia al div que contiene el contenido del reporte */}
            <div 
                ref={reporteRef} 
                className="reporteContent" 
                style={{padding: '30px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eee'}}
            >
                
                <h3 style={{ borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>Datos Generales</h3>
                <p><strong>ID Sucursal:</strong> {sucursal.id}</p>
                <p><strong>Dirección:</strong> {sucursal.direccion}</p>
                
                <h3 style={{ marginTop: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>Métricas Clave</h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                    
                    <MetricCard 
                        title="Ventas Últimos 30 Días" 
                        value={formatCurrency(estadisticas.ventasMensuales)} 
                        color="#0d6efd"
                    />
                    <MetricCard 
                        title="Total de Ventas (Histórico)" 
                        value={estadisticas.totalVentas} 
                        unit="transacciones"
                        color="#198754"
                    />
                    <MetricCard 
                        title="Stock Total de Inventario" 
                        value={estadisticas.stockTotal} 
                        unit="und"
                        color="#ffc107"
                    />
                    <MetricCard 
                        title="Productos Diferentes" 
                        value={estadisticas.totalProductos} 
                        unit="tipos"
                        color="#6f42c1"
                    />
                    <MetricCard 
                        title="Usuarios/Empleados Activos" 
                        value={estadisticas.totalUsuarios} 
                        unit="usuarios"
                        color="#dc3545"
                    />
                    
                </div>
            </div>
        </div>
        </div>
    );
};

export default ReporteSucursal;