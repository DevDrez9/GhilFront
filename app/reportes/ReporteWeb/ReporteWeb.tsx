import React, { useRef, useState, useEffect, type CSSProperties } from 'react';
import { useOutletContext } from 'react-router';
import Boton1 from '~/componentes/Boton1'; 
import InputText1 from '~/componentes/InputText1'; 
import { exportToPDF } from '~/utils/exportUtils'; 

const formatCurrency = (amount: number | string) => `Bs.${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`; 

interface LayoutContext {
    user: any;
    tienda: {
        id: number;
        nombre: string;
        configWeb: {
            logoUrl: string;
        };
    };
}

interface VentasStatsResponse {
    anio: number;
    resumenAnual: {
        total: { cantidad: number; monto: number };
        web: { cantidad: number; monto: number; porcentajeCantidad: number; porcentajeMonto: number };
        local: { cantidad: number; monto: number; porcentajeCantidad: number; porcentajeMonto: number };
    };
    desgloseMensual: {
        mes: number;
        nombreMes: string;
        total: { cantidad: number; monto: number };
        web: { cantidad: number; monto: number };
        local: { cantidad: number; monto: number };
        porcentajeWeb: number;
        porcentajeLocal: number;
    }[];
}

// Estilos
const tableHeaderStyle: CSSProperties = { border: '1px solid #dee2e6', padding: '10px', textAlign: 'center', background: '#f8f9fa', verticalAlign: 'middle' };
const tableCellStyle: CSSProperties = { border: '1px solid #dee2e6', padding: '8px', textAlign: 'center' };
const kpiCardStyle: CSSProperties = { border: '1px solid #e0e0e0', borderRadius: '12px', padding: '20px', backgroundColor: '#fff', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center' };
const kpiTitleStyle: CSSProperties = { margin: 0, color: '#666', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' };
const kpiValueStyle: CSSProperties = { fontSize: '1.8em', fontWeight: 'bold', color: '#333', margin: '10px 0' };
const kpiPercentStyle: CSSProperties = { fontSize: '2.5em', fontWeight: '900', color: '#007bff', display: 'block', lineHeight: '1' };

const ReporteWeb: React.FC = () => {
    const { user, tienda } = useOutletContext<LayoutContext>();
    const reporteRef = useRef(null); 
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [statsData, setStatsData] = useState<VentasStatsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const fechaActual = new Date();
    const fechaFormateada = fechaActual.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    useEffect(() => {
        if (!tienda?.id) { setIsLoading(false); return; }
        const fetchStats = async () => {
            setIsLoading(true); setError(null);
            try {
                const url = `${import.meta.env.VITE_API_URL}/ventas/estadisticas/canales?year=${selectedYear}&tiendaId=${tienda.id}`;
                const response = await fetch(url);
                if (!response.ok) throw new Error(`Error ${response.status}`);
                const data: VentasStatsResponse = await response.json();
                setStatsData(data);
            } catch (err: any) { setError(err.message); } finally { setIsLoading(false); }
        };
        fetchStats();
    }, [selectedYear, tienda?.id]);

    const handleDownloadPDF = () => {
        if (reporteRef.current) {
            const filename = `reporte_ventas_canal_${selectedYear}.pdf`;
            exportToPDF(reporteRef.current, filename, `Reporte de Ventas por Canal - ${tienda.nombre} (${selectedYear})`);
        }
    };

    const handleYearChange = (value: string) => {
        const year = parseInt(value);
        if (year > 2000 && year < 2100) setSelectedYear(year);
    };
    
    const resumen = statsData?.resumenAnual;

    return (
        <div className="contenedorReporteVentas" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{fontSize:"30px", fontWeight:"bold"}}>📊 Reporte de Ventas por Canal</h2>
                <Boton1 variant="primary" size="medium" onClick={handleDownloadPDF} disabled={isLoading || !statsData}>Descargar PDF</Boton1>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '4px' }}>
                <InputText1 label="Año del Reporte" type="number" value={String(selectedYear)} onChange={handleYearChange} width={200} />
            </div>
            
            <div ref={reporteRef} className="reporteContent" style={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #eee', padding: '30px' }}>
                {isLoading && <p>Cargando estadísticas...</p>}
                {error && <p style={{ color: 'red' }}>Error al cargar: {error}</p>}
                {!isLoading && !statsData && <p>No se encontraron datos.</p>}

                {statsData && resumen && (
                    <div> 
                        <div style={{display:"flex", alignItems:"center"}}>
                            <img style={{height: '150px'}} src={(import.meta.env.VITE_API_URL + '/')+tienda.configWeb.logoUrl} alt={tienda.nombre}/>
                            <h3 style={{fontSize:"30px", fontWeight:"bold", marginLeft:"15px"} }> {tienda.nombre}</h3>
                        </div>
                        <h2 style={{fontSize:"18px", fontWeight:"bold", textAlign:'center', margin:'20px 0'}}> ANÁLISIS DE CANALES DE VENTA: {statsData.anio} </h2>
                        
                        {/* --- 1. RESUMEN ANUAL DESTACADO --- */}
                        <div style={{ margin: '30px 0' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px' }}>
                                
                                <div style={kpiCardStyle}>
                                    <h4 style={kpiTitleStyle}>Ventas Web (Online)</h4>
                                    <span style={kpiPercentStyle}>{resumen.web.porcentajeMonto.toFixed(1)}%</span>
                                    <div style={kpiValueStyle}>{formatCurrency(resumen.web.monto)}</div>
                                    <div style={{color:'#888', fontSize:'0.9em'}}>{resumen.web.cantidad} transacciones</div>
                                </div>

                                <div style={kpiCardStyle}>
                                    <h4 style={kpiTitleStyle}>Ventas Locales (Físicas)</h4>
                                    <span style={{...kpiPercentStyle, color: '#28a745'}}>{resumen.local.porcentajeMonto.toFixed(1)}%</span>
                                    <div style={kpiValueStyle}>{formatCurrency(resumen.local.monto)}</div>
                                    <div style={{color:'#888', fontSize:'0.9em'}}>{resumen.local.cantidad} transacciones</div>
                                </div>
                                
                                <div style={{...kpiCardStyle, background:'#f8f9fa', border:'1px dashed #ccc'}}>
                                    <h4 style={kpiTitleStyle}>Total General</h4>
                                    <span style={{...kpiPercentStyle, color: '#333', fontSize:'2em'}}>100%</span>
                                    <div style={kpiValueStyle}>{formatCurrency(resumen.total.monto)}</div>
                                    <div style={{color:'#888', fontSize:'0.9em'}}>{resumen.total.cantidad} transacciones</div>
                                </div>

                            </div>
                        </div>

                        {/* --- 2. TABLA DE DESGLOSE MENSUAL --- */}
                        <div style={{ marginTop: '40px' }}>
                            <h3 style={{ borderBottom: '2px solid #007bff', paddingBottom: '5px', marginBottom: '15px' }}>Detalle Mensual</h3>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f1f3f5' }}>
                                        <th rowSpan={2} style={{...tableHeaderStyle, textAlign:'left'}}>Mes</th>
                                        <th colSpan={3} style={{...tableHeaderStyle, borderBottom:'2px solid #007bff', color:'#007bff'}}>WEB (Online)</th>
                                        <th colSpan={3} style={{...tableHeaderStyle, borderBottom:'2px solid #28a745', color:'#28a745'}}>LOCAL (Físico)</th>
                                        <th rowSpan={2} style={tableHeaderStyle}>Total</th>
                                    </tr>
                                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                                        <th style={tableHeaderStyle}>Monto</th>
                                        <th style={tableHeaderStyle}>Cant.</th>
                                        <th style={{...tableHeaderStyle, background:'#e7f5ff'}}>% Part.</th>
                                        <th style={tableHeaderStyle}>Monto</th>
                                        <th style={tableHeaderStyle}>Cant.</th>
                                        <th style={{...tableHeaderStyle, background:'#e6fffa'}}>% Part.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {statsData.desgloseMensual.map((mes) => (
                                        <tr key={mes.mes}>
                                            <td style={{...tableCellStyle, textAlign:'left'}}><strong>{mes.nombreMes}</strong></td>
                                            
                                            {/* Web */}
                                            <td style={tableCellStyle}>{formatCurrency(mes.web.monto)}</td>
                                            <td style={tableCellStyle}>{mes.web.cantidad}</td>
                                            <td style={{...tableCellStyle, fontWeight:'bold', color:'#007bff', background:'#f0f8ff'}}>
                                                {mes.porcentajeWeb.toFixed(1)}%
                                            </td>
                                            
                                            {/* Local */}
                                            <td style={tableCellStyle}>{formatCurrency(mes.local.monto)}</td>
                                            <td style={tableCellStyle}>{mes.local.cantidad}</td>
                                            <td style={{...tableCellStyle, fontWeight:'bold', color:'#28a745', background:'#f0fff4'}}>
                                                {mes.porcentajeLocal.toFixed(1)}%
                                            </td>
                                            
                                            {/* Total */}
                                            <td style={{...tableCellStyle, fontWeight:'bold'}}>{formatCurrency(mes.total.monto)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr style={{ backgroundColor: '#343a40', color:'white', fontWeight: 'bold' }}>
                                        <td style={{...tableCellStyle, textAlign:'left', border:'none'}}>ANUAL</td>
                                        <td style={{...tableCellStyle, border:'none'}}>{formatCurrency(resumen.web.monto)}</td>
                                        <td style={{...tableCellStyle, border:'none'}}>{resumen.web.cantidad}</td>
                                        <td style={{...tableCellStyle, border:'none', background:'#495057'}}>{resumen.web.porcentajeCantidad.toFixed(1)}%</td>
                                        <td style={{...tableCellStyle, border:'none'}}>{formatCurrency(resumen.local.monto)}</td>
                                        <td style={{...tableCellStyle, border:'none'}}>{resumen.local.cantidad}</td>
                                        <td style={{...tableCellStyle, border:'none', background:'#495057'}}>{resumen.local.porcentajeCantidad.toFixed(1)}%</td>
                                        <td style={{...tableCellStyle, border:'none'}}>{formatCurrency(resumen.total.monto)}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>

                        <h2 style={{color:"gray", margin:"10px 0", fontSize: "12px", borderTop: "1px solid #eee", paddingTop: "15px", marginTop: "30px"}}>
                            Generado: {fechaFormateada}
                        </h2>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReporteWeb;