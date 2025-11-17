import React, { useState, useRef, useMemo, type CSSProperties } from 'react';
import { useOutletContext } from 'react-router';
// 1. Importar el NUEVO hook
import { useHistorialComprasTela, type HistorialItemDto } from '~/hooks/useHistorialComprasTela'; 
import Boton1 from '~/componentes/Boton1';
import { exportToPDF } from '~/utils/exportUtils';
import { useAlert } from '~/componentes/alerts/AlertContext';
import "./HistorialCompraTelas.css"; // Reutilizamos el estilo

// --- UTILIDADES ---
const formatCurrency = (amount: number | string) => `Bs.${Number(amount).toFixed(2)}`;
const formatDate = (isoString: string) => new Date(isoString).toLocaleString('es-ES', {
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
});

// --- ESTILOS DE TABLA (Mejor para reportes) ---
const tableHeaderStyle: CSSProperties = { 
  borderBottom: '2px solid #007bff', 
  padding: '12px 8px', 
  textAlign: 'left',
  fontSize: '13px',
  color: '#333'
};
const tableCellStyle: CSSProperties = { 
  borderBottom: '1px solid #eee', 
  padding: '10px 8px',
  fontSize: '13px'
};

interface LayoutContext {
    tienda: {
        nombre: string;
        configWeb: { logoUrl: string; };
    };
}

export default function HistorialComprasTela() {
  const { historial, isLoading, isError, error } = useHistorialComprasTela();
  const { showAlert } = useAlert();
  const { tienda } = useOutletContext<LayoutContext>();
  const reporteRef = useRef(null);

  const handleDownloadPDF = () => {
    if (reporteRef.current) {
        const date = new Date().toISOString().slice(0, 10);
        exportToPDF(reporteRef.current, `historial_compras_tela_${date}.pdf`, `Historial de Compras de Tela - ${tienda?.nombre}`);
    }
  };

  // Cálculos de Totales
  const { totalImporte, totalCantidad } = useMemo(() => {
    return historial.reduce((acc, item) => {
      acc.totalImporte += Number(item.importeTotal) || 0;
      acc.totalCantidad += Number(item.cantidad) || 0;
      return acc;
    }, { totalImporte: 0, totalCantidad: 0 });
  }, [historial]);


  if (isLoading) return <div style={{ padding: '20px' }}>Cargando historial de compras...</div>;
  if (isError) return <div style={{ padding: '20px', color: 'red' }}>Error: {error?.message}</div>;

  return (
    <div className="cuerpoProveedores"> {/* Reutilizando clase principal */}
      
      <div className="titulo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>📜 Historial de Compras (Tela)</p>
        <Boton1 
            variant="primary" 
            onClick={handleDownloadPDF} 
            disabled={historial.length === 0}
        >
          Descargar PDF
        </Boton1>
      </div>

      {/* Contenedor del Reporte (para PDF) */}
      <div 
        ref={reporteRef} 
        style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: '8px', 
            border: '1px solid #eee', 
            padding: '20px' 
        }}
      >
        {/* Encabezado del PDF */}
        <div style={{display:"flex", alignItems:"center", marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '15px'}}>
            <img 
                style={{height: '80px', objectFit: 'contain', marginRight: '20px'}} 
                src={"http://localhost:3000/" + tienda.configWeb.logoUrl}
                alt={tienda.nombre}
            />
            <h3 style={{fontSize:"24px", fontWeight:"bold", margin: 0}}> {tienda.nombre}</h3>
        </div>
        <h2 style={{fontSize:"18px", fontWeight:"bold", marginBottom: '20px'}}> Reporte Histórico de Ingreso de Telas </h2>

        {/* Tabla de Historial */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr>
                    <th style={tableHeaderStyle}>Fecha</th>
                    <th style={tableHeaderStyle}>Tela</th>
                    <th style={tableHeaderStyle}>Detalles (Tipo/Color)</th>
                    <th style={{...tableHeaderStyle, textAlign: 'center'}}>Ref. Compra</th>
                    <th style={{...tableHeaderStyle, textAlign: 'right'}}>Cantidad (Kg/M)</th>
                    <th style={{...tableHeaderStyle, textAlign: 'right'}}>Precio Unit.</th>
                    <th style={{...tableHeaderStyle, textAlign: 'right'}}>Importe Total</th>
                </tr>
            </thead>
            <tbody>
                {historial.map((item) => (
                    <tr key={item.id}>
                        <td style={tableCellStyle}>{formatDate(item.createdAt)}</td>
                        <td style={{...tableCellStyle, fontWeight: 'bold'}}>{item.tela.nombreComercial}</td>
                        <td style={tableCellStyle}>{item.tela.tipoTela} - {item.tela.colores}</td>
                        <td style={{...tableCellStyle, textAlign: 'center'}}>
                            {item.compraId ? `#${item.compraId}` : <span style={{color:'#999'}}>N/A</span>}
                        </td>
                        <td style={{...tableCellStyle, textAlign: 'right'}}>{item.cantidad.toLocaleString()}</td>
                        <td style={{...tableCellStyle, textAlign: 'right'}}>{formatCurrency(item.precioKG)}</td>
                        <td style={{...tableCellStyle, textAlign: 'right', fontWeight: 'bold', color: '#00695c'}}>
                            {formatCurrency(item.importeTotal)}
                        </td>
                    </tr>
                ))}
            </tbody>
            {/* Pie de tabla con Totales */}
            <tfoot>
                <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 'bold' }}>
                    <td colSpan={4} style={{...tableCellStyle, textAlign: 'right', borderTop: '2px solid #333'}}>TOTALES:</td>
                    <td style={{...tableCellStyle, textAlign: 'right', borderTop: '2px solid #333'}}>{totalCantidad.toLocaleString()}</td>
                    <td style={{...tableCellStyle, borderTop: '2px solid #333'}}></td>
                    <td style={{...tableCellStyle, textAlign: 'right', borderTop: '2px solid #333', fontSize: '1.1em'}}>
                        {formatCurrency(totalImporte)}
                    </td>
                </tr>
            </tfoot>
        </table>

        {historial.length === 0 && !isLoading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                No se encontraron registros en el historial de compras.
            </div>
        )}
      </div>
    </div>
  );
}