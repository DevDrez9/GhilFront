// En ~/componentes/reportes/ProductoPerformanceCard.tsx

import React, { useMemo, useRef } from 'react';
import { useProductoPerformance } from '~/hooks/useProductoPerformance';
import "./reportProducto.style.css"
import Boton1 from '~/componentes/Boton1';
import {  exportToPDF } from '~/utils/exportUtils'; 
import type { ProductoResponseDto } from '~/models/producto.model';
import { useOutletContext } from 'react-router';


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
    tiendaId:number,
    producto:ProductoResponseDto
}
// 🚨 Reutiliza o define la interfaz
interface LayoutContext {
    user,tienda
}

const ProductoPerformanceCard : React.FC<ReporteProducto>  = ({ productoId, tiendaId, onClose, visible, producto}) => {

  const { user, tienda } = useOutletContext<LayoutContext>();
    // 🛑 1. Crear la referencia
    const componentRef = useRef(null); 

     const fechaActual = new Date();
  const dia = String(fechaActual.getDate()).padStart(2, '0');
  const mes = String(fechaActual.getMonth() + 1).padStart(2, '0'); // Los meses son de 0-11, por eso se suma 1
  const anio = fechaActual.getFullYear();

  const fechaFormateada = `${dia}/${mes}/${anio}`;

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

    const precioProduccionUnd=Number(data.totalCosto)/Number(data.totalCantidadProducida);
    const diferenciaProdccion=Number(data.totalIngresos)-(Number(precioProduccionUnd)*Number(data.totalUnidadesVendidas))
    
    return (
        <div className={containerClasses}>
            <div className="atras">
                 <Boton1 type="button" size="medium" variant="info" onClick={onClose}>
            Atrás
          </Boton1>
            </div>
           

        <div  className="productoPerformanceCard" ref={componentRef} >

          <div className="reporteContent" style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eee', padding: '15px' }}>
                <div style={{display:"flex", alignItems:"center"}}>
<img style={{height: '150px'}} src={ "http://localhost:3000/"+tienda.configWeb.logoUrl}/>
<h3 style={{fontSize:"30px",  fontWeight:"bold",  marginLeft:"15px"} }> {tienda.nombre}</h3>
                    </div></div>
            <h2 style={{fontSize:"30px", fontWeight:"bold"}}>📈 Rendimiento de Producto: {data.nombreProducto}</h2>

            <div style={{ flexShrink: 0 }}>
                {producto.imagenes.length > 0 ? (
                  <img
                    src={"http://localhost:3000/uploads/productos/"+producto.imagenes[0].url}
                    alt={producto.nombre}
                    style={{
                      width: "200px",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "4px"
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      backgroundColor: "#f0f0f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "4px",
                      color: "#999",
                      fontSize: "12px",
                      textAlign: "center"
                    }}
                  >
                    Sin Imagen
                  </div>
                )}
              </div>

            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: "20px"}}>
                {/* Métricas de Producción/Venta */}
                <CardMétrica title="Cant. Producida" value={data.totalCantidadProducida} />
                <CardMétrica title="Cant. Vendida" value={data.totalUnidadesVendidas} />
                
                {/* Métricas Financieras */}
                <CardMétrica title="Costo Total Produccion." value={formatCurrency(data.totalCosto)} />
                <CardMétrica title="Ingresos Totales" value={formatCurrency(data.totalIngresos)} color="#0d6efd" />

                <CardMétrica title="Costo Promedio de Produccion." value={formatCurrency(precioProduccionUnd.toFixed(2))} />
                
                {/* Métricas de Performance */}
                <CardMétrica 
                    title="Diferencia (Venta - Producción)" 
                    value={diferenciaProdccion.toFixed(2)} 
                    unit="bs" 
                    color={stockColor} 
                />
                <CardMétrica 
                    title="Ganancia Bruta" 
                    value={formatCurrency(data.ingresoNetoEstimado)} 
                    color={ingresoColor} 
                />
            </div>
            
            <p style={{ marginTop: '20px', fontSize: '14px', color: '#6c757d' }}>
                * El Ingreso Neto Estimado se calcula como: Ingresos Totales - Costo Total de Producción.

                
            </p>
            <h2>Generado: {fechaFormateada}</h2>
            
             
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