import { useEffect, useState } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import { useTrabajos } from "~/hooks/useTrabajos"; // Nuevo hook
import { EstadoTrabajo } from "~/models/trabajo";

import "./TrabajosForm.style.css";
import { useParametrosFisicosTelas } from "~/hooks/useParametrosFisicosTelas";
import { useCostureros } from "~/hooks/useCostureros";
import ComboBox1 from "~/componentes/ComboBox1";
import { useParametrosTela } from "~/hooks/useParametrosTela";


interface TrabajoFormProps {
  visible: boolean;
  onClose: () => void;
}
const TrabajoForm: React.FC<TrabajoFormProps> = ({ visible, onClose }) => {
  const { createTrabajo, isCreating, createError } = useTrabajos();
  const { parametros } = useParametrosTela() as { parametros };
  const { costureros } = useCostureros();

  // Mapeo de opciones para ComboBox1
  const parametroOptions = parametros.map((p) => ({
    value: String(p.id),
    label: `ID ${p.id} - ${p.nombreModelo}`,
  }));
  const costureroOptions = costureros.map((c) => ({
    value: String(c.id),
    label: c.nombre,
  }));
  costureroOptions.unshift({ value: "", label: "Sin asignar (Opcional)" });

  const containerClasses = [
    "contenedorFormTrabajo",
    visible ? "visible" : "noVisible",
  ]
    .filter(Boolean)
    .join(" ");

  const [formData, setFormData] = useState({
    codigoTrabajo: "",
    parametrosTelaId: "" as string,
    costureroId: "" as string | undefined,
    estado: EstadoTrabajo.EN_PROCESO,
    cantidad: 0,
    tiendaId: 0,
    fechaInicio: new Date().toISOString().substring(0, 10),
    fechaFinEstimada: "", // Se calculará
    notas: "",
  });

  // Estado para guardar el tiempo de fabricación de la tela seleccionada
  const [tiempoPorUnidad, setTiempoPorUnidad] = useState<number>(0);
  const [costoEstimado, setCostoEstimado] = useState<number>(0);
  const [costoUnitario, setCostoUnitario] = useState<number>(0);

  // ----------------------------------------------------
  // LÓGICA DE CÁLCULO DE FECHA FIN
  // ----------------------------------------------------

  const calculateFechaFin = (
    inicio: string,
    cantidad: number,
    tiempoUnidad: number
  ): string => {
    if (!inicio || cantidad <= 0 || tiempoUnidad <= 0) {
      return "";
    }

    // 1. Convertir tiempoUnidad a Milisegundos (Asumimos que tiempoUnidad está en HORAS)
    // Si tu tiempo está en minutos, usa * 60 * 1000. Si está en horas, usa * 3600 * 1000.
    const totalTiempoMs = cantidad * tiempoUnidad * 3600 * 1000; // Asumiendo que tiempoUnidad está en HORAS

    // 2. Crear objeto Date para el inicio (usamos la medianoche de la fecha de inicio)
    const startDate = new Date(inicio + "T00:00:00");

    // 3. Calcular la fecha y hora final
    const finalDate = new Date(startDate.getTime() + totalTiempoMs);

    // 4. Formatear la fecha final a YYYY-MM-DD para el input[type="date"]
    // NOTA: Esto solo considera el tiempo lineal. No excluye fines de semana/feriados.
    return finalDate.toISOString().substring(0, 10);
  };

  // ----------------------------------------------------
  // EFECTO PARA RECALCULAR
  // ----------------------------------------------------

  useEffect(() => {
    // Recalcular la fecha final cada vez que cambien los inputs relevantes
    const nuevaFechaFin = calculateFechaFin(
      formData.fechaInicio,
      Number(formData.cantidad),
      tiempoPorUnidad
    );

    // Actualizar solo si la fecha calculada ha cambiado
    if (nuevaFechaFin !== formData.fechaFinEstimada) {
      setFormData((prev) => ({
        ...prev,
        fechaFinEstimada: nuevaFechaFin,
      }));
    }
  }, [formData.fechaInicio, formData.cantidad, tiempoPorUnidad]);

   useEffect(() => {
    const cantidad = Number(formData.cantidad);
    const nuevoCostoEstimado = cantidad * costoUnitario;

    // Solo actualiza si el valor realmente ha cambiado para evitar re-render innecesarios
    if (nuevoCostoEstimado !== costoEstimado) {
      setCostoEstimado(nuevoCostoEstimado);
    }

  }, [formData.cantidad, costoUnitario]); // <--- Depende de la cantidad y el costo unitario


  // ----------------------------------------------------
  // MANEJADOR DE CAMBIOS GENERAL
  // ----------------------------------------------------

  const handleChange = (field: string, value: string | number) => {
    let finalValue = value;
    let newTiempoPorUnidad = tiempoPorUnidad;
    let newCostoUnitario = costoUnitario; 

    // Lógica especial para 'parametrosTelaId' (ID Numérico)
    if (field === "parametrosTelaId") {
      const selectedId = Number(value);
      finalValue = String(selectedId); // Mantener string en formData para ComboBox

      const parametroSeleccionado = parametros.find((p) => p.id === selectedId);

      if (parametroSeleccionado) {
        // Guardar el tiempo de fabricación para el cálculo
        newTiempoPorUnidad = parametroSeleccionado.tiempoFabricacionPorUnidad;
         newCostoUnitario = Number(parametroSeleccionado.fotoReferenciaUrl) || 0; 
        
      } else {
        newTiempoPorUnidad = 0;
        newCostoUnitario = 0;
      }
    }

    // Actualizar el estado de tiempo por unidad si ha cambiado
    if (newTiempoPorUnidad !== tiempoPorUnidad) {
      setTiempoPorUnidad(newTiempoPorUnidad);
    }
    if (newCostoUnitario !== costoUnitario) {
      setCostoUnitario(newCostoUnitario);
    }

    setFormData((prev) => ({
      ...prev,
      [field]: finalValue,
    }));
  };

  // ----------------------------------------------------
  // VALIDACIÓN Y SUBMIT (Sin cambios mayores, solo referencias a IDs)
  // ----------------------------------------------------

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.parametrosTelaId || Number(formData.parametrosTelaId) <= 0)
      newErrors.parametrosTelaIdError =
        "Debe seleccionar el parámetro de tela.";

    if (!formData.cantidad || Number(formData.cantidad) <= 0)
      newErrors.cantidadError = "La cantidad debe ser mayor a 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      try {
        const dataToSend = {
          ...formData,
          // Convertir los strings a números
          parametrosTelaId: Number(formData.parametrosTelaId),
          costureroId:
            formData.costureroId && formData.costureroId !== ""
              ? Number(formData.costureroId)
              : undefined,
          cantidad: Number(formData.cantidad),
          tiendaId: 1,
          // Convertir la cadena de fecha a objetos Date
          fechaInicio: new Date(formData.fechaInicio),
          fechaFinEstimada: formData.fechaFinEstimada
            ? new Date(formData.fechaFinEstimada)
            : undefined,
        };

        await createTrabajo(dataToSend as any);
        onClose();
      } catch (error) {
        alert("No se pudo guardar el trabajo");
        console.error("Error al guardar:", error);
      }
    }
  };

  // ----------------------------------------------------
  // RENDERIZADO
  // ----------------------------------------------------

  return (
    <>
      <div className={containerClasses}>
        <div className="cuerpoTrabajoForm">
          <h2>Nuevo Trabajo</h2>

          <Boton1 type="button" size="medium" variant="info" onClick={onClose}>
            Atrás
          </Boton1>

          <div className="formTrabajo">
            <form onSubmit={handleSubmit}>
              <h2>Datos del Trabajo</h2>

              <div className="form-row">
                <InputText1
                  label="Código de Trabajo"
                  value={formData.codigoTrabajo}
                  onChange={(val) => handleChange("codigoTrabajo", val)}
                  type="text"
                  width={220}
                />

                {/* COMBOBOX PARA PARAMETROS TELA ID */}
                <ComboBox1
                  label="Parámetros de Tela *"
                  value={formData.parametrosTelaId}
                  onChange={(val) => handleChange("parametrosTelaId", val)}
                  options={parametroOptions}
                  placeholder="Seleccione Parámetro"
                  errorMessage={errors.parametrosTelaIdError}
                  required
                  width={220}
                />
              </div>

              <div className="form-row">
                <InputText1
                  label="Cantidad *"
                  value={formData.cantidad + ""}
                  onChange={(val) => handleChange("cantidad", val)}
                  errorMessage={errors.cantidadError}
                  required
                  type="number"
                  width={220}
                />
                {/* <InputText1
                  label="ID de Tienda *"
                  value={formData.tiendaId + ""}
                  onChange={(val) => handleChange("tiendaId", val)}
                  
                  errorMessage={errors.tiendaIdError}
                  required
                  type="number"
                  width={220}
                />*/}
              </div>

              {/* COMBOBOX PARA COSTURERO ID */}
              <ComboBox1
                label="Costurero (Opcional)"
                value={formData.costureroId || ""}
                onChange={(val) => handleChange("costureroId", val)}
                options={costureroOptions}
                placeholder="Asignar Costurero"
                width={450}
              />

              <div className="linea"></div>

              <h2>Estado y Fechas</h2>

              <div className="form-row">
                <div className="estado-container" style={{ width: 220 }}>
                  <label>Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => handleChange("estado", e.target.value)}
                    className="estado-select"
                  >
                    {Object.values(EstadoTrabajo).map((estado) => (
                      <option key={estado} value={estado}>
                        {estado.charAt(0).toUpperCase() +
                          estado.slice(1).toLowerCase().replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
                {/* FECHA DE INICIO EDITABLE */}
                <InputText1
                  label="Fecha de Inicio"
                  value={formData.fechaInicio}
                  onChange={(val) => handleChange("fechaInicio", val)}
                  type="date"
                  width={220}
                />
              </div>

              {/* FECHA FIN ESTIMADA CALCULADA (SOLO LECTURA) */}
              <InputText1
                label={`Fecha Fin Estimada (Calc. | Tiempo/Unidad: ${tiempoPorUnidad} hrs)`}
                value={formData.fechaFinEstimada}
                onChange={() => {}} // Campo de solo lectura, pero requiere onChange
                type="date"
                readOnly
                width={450}
              />
              <InputText1
                label="CostoEstimado"
                value={costoEstimado + ""}
                onChange={(value) => {
                 
                }}
                readOnly
                type="text"
                width={450}
              />

              <InputText1
                label="Notas"
                value={formData.notas}
                onChange={(val) => handleChange("notas", val)}
                type="text"
                width={450}
              />

              <Boton1
                type="submit"
                fullWidth
                size="medium"
                disabled={isCreating}
              >
                {isCreating ? "Guardando..." : "Guardar Trabajo"}
              </Boton1>

              {createError && (
                <div className="error-alert">Error: {createError.message}</div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default TrabajoForm;
