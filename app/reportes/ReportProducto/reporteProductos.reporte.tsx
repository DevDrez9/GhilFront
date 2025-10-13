// En ~/componentes/reportes/ProductoPerformanceCard.tsx

import React, { useMemo, useRef } from 'react';
import { useProductoPerformance } from '~/hooks/useProductoPerformance';
import "./reportProducto.style.css"
import Boton1 from '~/componentes/Boton1';
import {  exportToPDF } from '~/utils/exportUtils'; 


const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return 'Bs. 0.00';
    return `Bs. ${Number(amount).toFixed(2)}`;
};

const CardMétrica = ({ title, value, unit = '', color = '#333' }) => (
    <div style={{ padding: '15px', border: '1px solid #e0e0e0', borderRadius: '6px', textAlign: 'center', backgroundColor: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>{title}</p>
        <h4 style={{ margin: '5px 0 0', color: color }}>
            {value} {unit}
        </h4>
    </div>
);


/**
 * Componente que muestra la performance (producción vs. venta) de un producto.
 * @param {number} productoId - ID del producto a analizar.
 * @param {number} [tiendaId] - ID de la tienda para filtrar los datos (opcional).
 */

interface ReporteProducto {
    visible: boolean;
    onClose: () => void;
    productoId:number,
    tiendaId:number
}
const ProductoPerformanceCard : React.FC<ReporteProducto>  = ({ productoId, tiendaId, onClose, visible}) => {

    // 🛑 1. Crear la referencia
    const componentRef = useRef(null); 

     const containerClasses = [
    "contenedorReportProducto",
    visible ? "visible" : "noVisible",
  ]
    .filter(Boolean)
    .join(" ");

    const options = useMemo(() => ({ productoId, tiendaId }), [productoId, tiendaId]);
    
    const { data, isLoading, isError, error } = useProductoPerformance(options);
   
 if (!productoId) {
        return <p>Seleccione un producto para ver su rendimiento.</p>;
    }

    if (isLoading) {
        return <p>Cargando rendimiento de producto...</p>;
    }

    if (isError) {
        return <p style={{ color: 'red' }}>Error al cargar los datos del producto: {error?.message}</p>;
    }

    if (!data) {
        return <p>No se encontraron datos para el producto seleccionado.</p>;
    }

         const handleDownloadPDF = () => {
        const filename = `reporte_rendimiento_${data.productoId}_${new Date().toISOString().slice(0, 10)}.pdf`;
        // 🛑 2. Llamar a la utilidad con componentRef.current
        exportToPDF(componentRef.current, filename);
    };
   
    
    // Lógica para determinar el color de la diferencia de stock
    const stockColor = data.diferenciaStock > 0 ? '#198754' : data.diferenciaStock < 0 ? '#dc3545' : '#6c757d';
    const ingresoColor = data.ingresoNetoEstimado >= 0 ? '#198754' : '#dc3545';
    
    return (
        <div className={containerClasses}>
            <div className="atras">
                 <Boton1 type="button" size="medium" variant="info" onClick={onClose}>
            Atrás
          </Boton1>
            </div>
           

        <div  className="productoPerformanceCard" ref={componentRef} >
            <h2>📈 Rendimiento de Producto: {data.nombreProducto}</h2>

            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: "20px"}}>
                {/* Métricas de Producción/Venta */}
                <CardMétrica title="Cant. Producida" value={data.totalCantidadProducida} />
                <CardMétrica title="Cant. Vendida" value={data.totalUnidadesVendidas} />
                
                {/* Métricas Financieras */}
                <CardMétrica title="Costo Total Prod." value={formatCurrency(data.totalCosto)} />
                <CardMétrica title="Ingresos Totales" value={formatCurrency(data.totalIngresos)} color="#0d6efd" />
                
                {/* Métricas de Performance */}
                <CardMétrica 
                    title="Diferencia Stock (Prod. - Venta)" 
                    value={data.diferenciaStock} 
                    unit="bs" 
                    color={stockColor} 
                />
                <CardMétrica 
                    title="Ingreso Neto Estimado" 
                    value={formatCurrency(data.ingresoNetoEstimado)} 
                    color={ingresoColor} 
                />
            </div>
            
            <p style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
                * El Ingreso Neto Estimado se calcula como: Ingresos Totales - Costo Total de Producción.

                
            </p>
            
             
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
    );
};

export default ProductoPerformanceCard;