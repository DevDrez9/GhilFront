import React, { useState, useEffect, useCallback } from "react";
import Boton1 from "~/componentes/Boton1";
import InputText1 from "~/componentes/InputText1";
import { useTrabajosFinalizados } from "~/hooks/useTrabajosFinalizados";
import "./TrabajosFinalizados.style.css";
import { useAlert } from "~/componentes/alerts/AlertContext";

// --- 1. DEFINICIÓN DE TIPOS PARA LA RESPUESTA DE ESTADÍSTICAS ---
interface EstadisticasCumplimiento {
  totalTrabajosCompletados: number;
  resumen: {
    aTiempo: { cantidad: number; porcentaje: number };
    conRetraso: { cantidad: number; porcentaje: number };
  };
  mensaje: string;
}

// --- 2. COMPONENTE MODAL PARA MOSTRAR LAS ESTADÍSTICAS ---
const CumplimientoModal = ({ onClose, tiendaId }: { onClose: () => void; tiendaId?: string }) => {
  const [data, setData] = useState<EstadisticasCumplimiento | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Construir URL (agregando tiendaId si existe)
        let url = (import.meta.env.VITE_API_URL + '/trabajos/estadisticas/cumplimiento');
        if (tiendaId) url += `?tiendaId=${tiendaId}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error("Error al obtener estadísticas");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [tiendaId]);

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white", padding: "25px", borderRadius: "12px",
        width: "450px", boxShadow: "0 4px 15px rgba(0,0,0,0.2)", position: "relative"
      }}>
        <button onClick={onClose} style={{
          position: "absolute", top: "10px", right: "15px", border: "none", background: "transparent", fontSize: "18px", cursor: "pointer"
        }}>✕</button>

        <h3 style={{ marginTop: 0, color: "#333", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
          📊 Rendimiento de Entregas
        </h3>

        {loading && <p>Calculando métricas...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {data && (
          <div style={{ marginTop: "20px" }}>
            <div style={{ textAlign: "center", marginBottom: "20px" }}>
              <span style={{ fontSize: "3em", fontWeight: "bold", color: data.resumen.aTiempo.porcentaje >= 80 ? "#28a745" : "#ffc107" }}>
                {data.resumen.aTiempo.porcentaje}%
              </span>
              <p style={{ margin: 0, color: "#666" }}>Entregas a Tiempo</p>
            </div>

            {/* Barra de Progreso Visual */}
            <div style={{ display: "flex", height: "20px", borderRadius: "10px", overflow: "hidden", marginBottom: "15px" }}>
              <div style={{ width: `${data.resumen.aTiempo.porcentaje}%`, background: "#28a745" }} title="A Tiempo"></div>
              <div style={{ width: `${data.resumen.conRetraso.porcentaje}%`, background: "#dc3545" }} title="Retrasado"></div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", textAlign: "center" }}>
              <div style={{ background: "#e8f5e9", padding: "10px", borderRadius: "8px" }}>
                <strong style={{ color: "#28a745", fontSize: "1.2em" }}>{data.resumen.aTiempo.cantidad}</strong>
                <div style={{ fontSize: "12px" }}>A Tiempo</div>
              </div>
              <div style={{ background: "#fce8e6", padding: "10px", borderRadius: "8px" }}>
                <strong style={{ color: "#dc3545", fontSize: "1.2em" }}>{data.resumen.conRetraso.cantidad}</strong>
                <div style={{ fontSize: "12px" }}>Retrasados</div>
              </div>
            </div>

            <p style={{ marginTop: "20px", fontSize: "13px", fontStyle: "italic", color: "#555", textAlign: "center" }}>
              "{data.mensaje}"
            </p>
            
            <div style={{textAlign: "center", marginTop: "10px", fontSize: "12px", color: "#999"}}>
               Total evaluados: {data.totalTrabajosCompletados} trabajos
            </div>
          </div>
        )}
      </div>
    </div>
  );
};


// --- 3. COMPONENTE PRINCIPAL ---
const TrabajosFinalizados = () => {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const {
    trabajos,
    total,
    isLoading,
    isError,
    error,
    deleteTrabajoFinalizado,
    isDeleting,
  } = useTrabajosFinalizados(debouncedSearch);

  const [searchTerm, setSearchTerm] = useState("");
  // Estado para mostrar el modal de estadísticas
  const [mostrarEstadisticas, setMostrarEstadisticas] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setTimeout(() => {
      setDebouncedSearch(value);
    }, 500);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setDebouncedSearch("");
  };

  // 1. Asegúrate de tener el hook
  const { showAlert } = useAlert();

  // ...

  const handleDelete = async (id: number) => {
    // Mantenemos la confirmación nativa
    if (window.confirm("¿Estás seguro de eliminar este trabajo terminado?")) {
      try {
        // 1. Ejecutar eliminación
        await deleteTrabajoFinalizado(id);

        

        // 2. ÉXITO
        await showAlert("Trabajo terminado eliminado correctamente.", "success");

      } catch (error: any) {
        console.error("Error al eliminar:", error);
        
        // 3. ERROR
        const msg = error?.message || "Error al eliminar el trabajo terminado.";
        showAlert(msg, "error");
      }
    }
  };

  if (isLoading) {
    return <p>Cargando trabajos terminados...</p>;
  }

  if (isError) {
    return <p>Error al cargar los datos: {error?.message}</p>;
  }

  return (
    <>
      <div className="cuerpoTrabajosFinalizados">
        
        {/* TITULO Y BOTÓN DE ESTADÍSTICAS */}
        <div className="titulo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{margin: 0}}>Trabajos Terminados</p>
          
          <div style={{ display: 'flex', gap: '10px' }}>
             {/* Botón para abrir estadísticas */}
             <Boton1 
                variant="secondary" 
                onClick={() => setMostrarEstadisticas(true)}
                style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
             >
                📊 Ver Eficiencia
             </Boton1>
             
             {/* <Boton1 variant="info" onClick={() => handleNuevo()}> + Registrar </Boton1> */}
          </div>
        </div>

        {/* BUSCADOR (Comentado en tu código original, lo dejo igual) */}
        {/* <div className="buscador"> ... </div> */}

        <div style={{ display: "grid", gap: "15px", marginTop: "30px" }}>
          {trabajos.map((trabajo) => {
            // Construcción de URL de imagen
            const imagenPath = trabajo.trabajoEnProceso?.parametrosTela?.producto?.imagenes?.[0]?.url;
            const imageUrl = imagenPath 
              ? `${import.meta.env.VITE_API_URL}/uploads/productos/${imagenPath}` 
              : null;

            return (
              <div
                key={trabajo.id}
                style={{
                  padding: "20px",
                  border: "1px solid #e0e0e0",
                  borderRadius: "8px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
                  
                  {/* IMAGEN */}
                  {imageUrl && (
                    <div style={{ flexShrink: 0 }}>
                      <img
                        src={imageUrl}
                        alt={`Imagen de ${trabajo.trabajoEnProceso?.parametrosTela?.nombreModelo}`}
                        style={{
                          width: "100px", height: "100px", borderRadius: "8px", objectFit: "cover", border: "1px solid #eee",
                        }}
                      />
                    </div>
                  )}

                  {/* INFORMACIÓN */}
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: "0 0 12px 0", color: "#333" }}>
                          {trabajo.trabajoEnProceso?.codigoTrabajo}
                        </h3>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "8px" }}>
                          <div><strong>Modelo:</strong> {trabajo.trabajoEnProceso?.parametrosTela?.nombreModelo}</div>
                          <div><strong>Cantidad Producida:</strong> {trabajo.cantidadProducida}</div>
                          <div><strong>Calidad:</strong> {trabajo.calidad}</div>
                          <div><strong>Costurero:</strong> {trabajo.trabajoEnProceso?.costurero ? `${trabajo.trabajoEnProceso.costurero.nombre} ${trabajo.trabajoEnProceso.costurero.apellido}` : 'Sin asignar'}</div>
                          <div><strong>Costo Total:</strong> {trabajo.costo ? `${trabajo.costo}` : 'Sin datos'}</div>
                        </div>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "100px" }}>
                        <button
                          onClick={() => handleDelete(trabajo.id)}
                          disabled={isDeleting}
                          style={{
                            padding: "8px 12px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px", cursor: isDeleting ? "not-allowed" : "pointer", fontSize: "14px",
                          }}
                        >
                          {isDeleting ? "Eliminando..." : "Eliminar"}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #eee", fontSize: "12px", color: "#666", display: "flex", gap: "15px" }}>
                      <span><strong>Fecha de Finalización:</strong> {new Date(trabajo.fechaFinalizacion).toLocaleDateString()}</span>
                      <span><strong>Creado:</strong> {new Date(trabajo.createdAt).toLocaleDateString()}</span>
                      <span><strong>Actualizado:</strong> {new Date(trabajo.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MENSAJE SI NO HAY DATOS */}
        {trabajos.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "#666", backgroundColor: "#f8f9fa", borderRadius: "8px", marginTop: "20px" }}>
             <h3>No se encontraron trabajos terminados</h3>
          </div>
        )}

        {/* RENDERIZADO DEL MODAL */}
        {mostrarEstadisticas && (
          <CumplimientoModal onClose={() => setMostrarEstadisticas(false)} />
        )}

      </div>
    </>
  );
};

export default TrabajosFinalizados;