// En ~/componentes/reportes/ReporteCategoria.tsx

import React, { useMemo, useRef } from 'react';
import Boton1 from '~/componentes/Boton1'; 

import { exportToPDF } from '~/utils/exportUtils'; // 🛑 Reutilizando la función genérica
import "./reporteCategoria.style.css" // Asumiendo tu archivo de estilos
import { useCategoriaEstadisticas } from '~/services/reportes/categorais/hookCategoriaReporte';
import { useOutletContext } from 'react-router';


// --- Utilidades de Presentación (Se mantienen) ---

const MetricCard = ({ title, value, unit = '', color = '#34495e' }) => (
    <div style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '6px', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{title}</p>
        <h3 style={{ margin: '5px 0 0', color: color }}>
            {value.toLocaleString()} {unit}
        </h3>
    </div>
);

interface ReporteCategoriaProps {
    visible: boolean;
    onClose: () => void;
    categoriaId: number;
}

// 🚨 Reutiliza o define la interfaz
interface LayoutContext {
    user,tienda
}

const ReporteCategoria : React.FC<ReporteCategoriaProps> = ({ categoriaId, onClose, visible }) => {

    const { user, tienda } = useOutletContext<LayoutContext>();
    
    // 🛑 1. Crear la referencia reutilizable
    const reporteRef = useRef(null); 
    
    const containerClasses = [
        "contenedorReportCategoria",
        visible ? "visible" : "noVisible",
    ].filter(Boolean).join(" ");
    
    const options = useMemo(() => ({ categoriaId }), [categoriaId]);
    
    const { data, isLoading, isError, error } = useCategoriaEstadisticas(options);

    if (!categoriaId) {
        return (
            <div className={containerClasses}>
                <p>Por favor, seleccione una categoría para generar el reporte de estadísticas.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={containerClasses}>
                <p>Cargando estadísticas de la categoría {categoriaId}...</p>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className={containerClasses}>
                <p style={{ color: 'red' }}>Error al cargar las estadísticas: {error?.message || "Datos no disponibles."}</p>
            </div>
        );
    }

    const { categoria, estadisticas } = data;
    
    // 🛑 2. Handler para la descarga de PDF
    const handleDownloadPDF = () => {
        const filename = `reporte_categoria_${categoria.nombre.replace(/\s/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
        // Ejecución de la función reutilizable
        exportToPDF(reporteRef.current, filename);
    };
    
    return (
        <div className={containerClasses}>
            <div className="atras">
                 <Boton1 type="button" size="medium" variant="info" onClick={onClose}>
                    Atrás
                 </Boton1>
            </div>
            
            <div className="reporteCategoriaContainer">
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>📊 Reporte Estadístico: {categoria.nombre}</h2>
                    <Boton1 
                        variant="primary" 
                        size="medium" 
                        onClick={handleDownloadPDF}
                        disabled={isLoading} 
                    >
                        Descargar PDF
                    </Boton1>
                </div>
                
                {/* 🛑 3. ASIGNACIÓN DE LA REFERENCIA AL CONTENIDO */}
                <div 
                    ref={reporteRef} 
                    className="reporteContent" 
                    style={{padding: '30px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eee'}}

                >   
                    
                    <div style={{display:"flex", alignItems:"center"}}>
<img style={{height: '150px'}} src={ "http://localhost:3000/"+tienda.configWeb.logoUrl}/>
<h3 style={{fontSize:"30px",  fontWeight:"bold",  marginLeft:"15px"} }> {tienda.nombre}</h3>
                    </div>
                    
                    
                    <h2 style={{fontSize:"30px", fontWeight:"bold"}}>Datos Generales</h2>
                    <p><strong>ID Categoría:</strong> {categoria.id}</p>
                    <p><strong>Nombre:</strong> {categoria.nombre}</p>
                    
                    <h3 style={{ marginTop: '20px', borderBottom: '2px solid #f0f0f0', paddingBottom: '10px' }}>Métricas Clave</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
                        
                        <MetricCard 
                            title="Total de Productos" 
                            value={estadisticas.totalProductos} 
                            unit=""
                            color="#0d6efd"
                        />
                         <MetricCard 
                            title="Total de Subcategorías" 
                            value={estadisticas.totalSubcategorias} 
                            unit="tipos"
                            color="#ffc107"
                        />
                        <MetricCard 
                            title="Productos con Stock" 
                            value={estadisticas.productosConStock} 
                            unit={`(${estadisticas.porcentajeConStock.toFixed(1)}%)`}
                            color="#198754"
                        />
                        <MetricCard 
                            title="Productos Sin Stock" 
                            value={estadisticas.productosSinStock} 
                            unit="uds"
                            color="#dc3545"
                        />
                        <MetricCard 
                            title="Productos Destacados" 
                            value={estadisticas.productosDestacados} 
                            unit="uds"
                            color="#6f42c1"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReporteCategoria;