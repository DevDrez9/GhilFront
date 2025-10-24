// En ~/componentes/Costurero/Costurero.subpage.tsx

import { useState } from "react";
import Boton1 from "~/componentes/Boton1";
import "./Costurero.subpage.css";
import type { CostureroResponseDto } from "~/models/costureros";
import { useCostureros } from "~/hooks/useCostureros";
import { useCostureroEstadisticas } from "~/hooks/useCostureroEstadisticas"; // <-- NUEVO: Importar el hook
import CostureroForm from "~/formularios/CosturerosForm/CosturerosForm.form";
import CostureroFormEdit from "~/formularios/CosturerosForm/ConstureroEditForm.form";
import type { CostureroConEstadisticasResponse } from "~/services/costurerosService";


// --- NUEVO: Componente para el Modal de Estadísticas ---
const EstadisticasModal = ({
  data,
  isLoading,
  onClose,
}: {
  data: CostureroConEstadisticasResponse | undefined;
  isLoading: boolean;
  onClose: () => void;
}) => {
  if (!data && !isLoading) return null; // No mostrar nada si no hay datos y no está cargando

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <div className="modal-header">
          {isLoading ? (
            <h2>Cargando Estadísticas...</h2>
          ) : (
            <h2>Estadísticas de {data?.costurero.nombre} {data?.costurero.apellido}</h2>
          )}
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <div className="modal-body">
          {isLoading ? (
            <p>Por favor, espere...</p>
          ) : data ? (
            <ul className="stats-list">
              <li><strong>Total de Trabajos Asignados:</strong> <span>{data.estadisticas.totalTrabajos}</span></li>
              <li><strong>Trabajos Completados:</strong> <span className="stat-completed">{data.estadisticas.trabajosCompletados}</span></li>
              <li><strong>Trabajos en Proceso:</strong> <span className="stat-in-progress">{data.estadisticas.trabajosEnProceso}</span></li>
              <li><strong>Trabajos Pendientes:</strong> <span className="stat-pending">{data.estadisticas.trabajosPendientes}</span></li>
              <li><strong>Trabajos Realizados este Mes:</strong> <span>{data.estadisticas.trabajosEsteMes}</span></li>
              <li><strong>Promedio de Calidad (1-5):</strong> <span>⭐ {data.estadisticas.promedioCalidad.toFixed(1)}</span></li>
            </ul>
          ) : (
            <p>No se pudieron cargar las estadísticas.</p>
          )}
        </div>
      </div>
    </div>
  );
};


const Costurero = () => {
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { costureros, isLoading, isError, error, deleteCosturero, isDeleting, deleteError } = useCostureros(debouncedSearch);

  const [mostrarForm, setMostrarForm] = useState(false);
  const [mostrarFormUpDate, setMostrarFormUpDate] = useState(false);
  const [costureroEdit, setCostureroEdit] = useState<CostureroResponseDto | null>(null);
  
  // --- NUEVO: Estado para manejar el costurero seleccionado para ver estadísticas ---
  const [costureroParaEstadisticas, setCostureroParaEstadisticas] = useState<CostureroResponseDto | null>(null);

  // --- NUEVO: Hook para obtener los datos del modal ---
  const { 
    data: estadisticasData, 
    isLoading: isLoadingEstadisticas 
  } = useCostureroEstadisticas(costureroParaEstadisticas?.id);

  // ... (tus funciones handleSearch, clearSearch, etc. no cambian)

   const handleDelete = async (id: number) => {

    if (window.confirm("¿Estás seguro de eliminar este costurero?")) {

      try {

        await deleteCosturero(id);

        if(deleteError){

         alert( deleteError.message)



        }else {

            alert("Costurero eliminado correctamente");

        }

     

      } catch (error) {

        alert("Error al eliminar costurero");

      }

    }

  };

  const handleNuevo = () => setMostrarForm(!mostrarForm);
  const handleCloseEdit = () => {
    setMostrarFormUpDate(false);
    setCostureroEdit(null);
  };
  const handleEdit = (costurero: CostureroResponseDto) => {
    setCostureroEdit(costurero);
    setMostrarFormUpDate(true);
  };
  
  if (isLoading) return <p>Cargando costureros...</p>;
  if (isError) return <p>Error al cargar los datos: {error?.message}</p>;

  return (
    <>
      {/* --- NUEVO: Renderizar el Modal de Estadísticas --- */}
      <EstadisticasModal 
        data={estadisticasData}
        isLoading={isLoadingEstadisticas}
        onClose={() => setCostureroParaEstadisticas(null)} 
      />

      <div className="cuerpoParametroTelas">
        <CostureroFormEdit onClose={handleCloseEdit} visible={mostrarFormUpDate} initialData={costureroEdit} />
        <CostureroForm onClose={handleNuevo} visible={mostrarForm} />

        <div className="titulo">
          <p>Costureros</p>
          <Boton1 variant="info" onClick={handleNuevo}>+ Agregar</Boton1>
        </div>

        <div style={{ display: "grid", gap: "15px", marginTop: "50px" }}>
          {costureros.map((costurero) => (
            <div key={costurero.id} className="costurero-card">
              <div className="card-main-content">
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: "0 0 12px 0" }}>
                    {costurero.nombre} {costurero.apellido}
                    {costurero.estado === 'INACTIVO' && <span className="inactive-badge">(Inactivo)</span>}
                  </h3>
                  <div className="card-details-grid">
                    {costurero.telefono && <div><strong>Teléfono:</strong> {costurero.telefono}</div>}
                    {costurero.email && <div><strong>Email:</strong> {costurero.email}</div>}
                    <div><strong>Estado:</strong> {costurero.estado}</div>
                  </div>
                  {costurero.direccion && <div style={{ marginTop: "8px" }}><strong>Dirección:</strong> {costurero.direccion}</div>}
                </div>

                <div className="card-actions">
                  {/* --- NUEVO: Botón para ver estadísticas --- */}
                  <button onClick={() => setCostureroParaEstadisticas(costurero)} className="btn-stats">
                    Estadísticas
                  </button>
                  <button onClick={() => handleEdit(costurero)} className="btn-edit">Editar</button>
                  <button onClick={() => handleDelete(costurero.id)} disabled={isDeleting} className="btn-delete">
                    {isDeleting ? "Elim..." : "Eliminar"}
                  </button>
                </div>
              </div>
              <div className="card-footer">
                <span><strong>Creado:</strong> {new Date(costurero.createdAt).toLocaleDateString()}</span>
                <span><strong>Actualizado:</strong> {new Date(costurero.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* ... (Tu código para mostrar mensajes de "no encontrados" y el total) ... */}
      </div>

      {/* --- NUEVO: Estilos para el modal y los botones. Idealmente, esto va en tu archivo CSS. --- */}
      <style>{`
        .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background-color: rgba(0, 0, 0, 0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal-content { background-color: white; padding: 25px; border-radius: 8px; width: 90%; max-width: 500px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
        .modal-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 15px; margin-bottom: 15px; }
        .modal-header h2 { margin: 0; font-size: 1.25rem; }
        .modal-close-btn { background: none; border: none; font-size: 1.8rem; cursor: pointer; color: #888; }
        .stats-list { list-style-type: none; padding: 0; }
        .stats-list li { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
        .stats-list li:last-child { border-bottom: none; }
        .stats-list span { font-weight: bold; }
        .stat-completed { color: #28a745; }
        .stat-in-progress { color: #007bff; }
        .stat-pending { color: #ffc107; }

        .costurero-card { padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .card-main-content { display: flex; justify-content: space-between; align-items: flex-start; }
        .card-details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 8px; }
        .card-actions { display: flex; flex-direction: column; gap: 8px; min-width: 100px; }
        .card-footer { margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee; font-size: 12px; color: #666; display: flex; gap: 15px; }
        
        .card-actions button { padding: 8px 12px; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 14px; transition: background-color 0.2s; }
        .btn-stats { background-color: #17a2b8; }
        .btn-edit { background-color: #007bff; }
        .btn-delete { background-color: #dc3545; }
      `}</style>
    </>
  );
};

export default Costurero;