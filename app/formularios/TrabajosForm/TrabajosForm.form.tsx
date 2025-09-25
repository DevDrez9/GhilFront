import { useState } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import { useTrabajos } from "~/hooks/useTrabajos"; // Nuevo hook
import { EstadoTrabajo } from "~/models/trabajo";

import "./TrabajosForm.style.css"

interface TrabajoFormProps {
  visible: boolean;
  onClose: () => void;
}

const TrabajoForm: React.FC<TrabajoFormProps> = ({ visible, onClose }) => {
  const { createTrabajo, isCreating, createError } = useTrabajos();

  const containerClasses = [
    "contenedorFormTrabajo",
    visible ? "visible" : "noVisible",
  ]
    .filter(Boolean)
    .join(" ");

  const [formData, setFormData] = useState({
    codigoTrabajo: "",
    parametrosTelaId: 0,
    costureroId: undefined,
    estado: EstadoTrabajo.EN_PROCESO,
    cantidad: 0,
    tiendaId: 0,
    fechaInicio: new Date().toISOString().substring(0, 10), // Formato YYYY-MM-DD para input date
    fechaFinEstimada: "",
    notas: "",
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.parametrosTelaId || Number(formData.parametrosTelaId) <= 0)
      newErrors.parametrosTelaIdError =
        "El ID de parámetros de tela es obligatorio";

    if (!formData.cantidad || Number(formData.cantidad) <= 0)
      newErrors.cantidadError = "La cantidad debe ser mayor a 0";

    if (!formData.tiendaId || Number(formData.tiendaId) <= 0)
      newErrors.tiendaIdError = "El ID de la tienda es obligatorio";

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
        costureroId: formData.costureroId !== "" ? Number(formData.costureroId) : undefined,
        cantidad: Number(formData.cantidad),
        tiendaId: Number(formData.tiendaId),
        // Convertir la cadena de fecha a un objeto Date
        fechaInicio: new Date(formData.fechaInicio),
        // Convertir la fecha opcional si existe
        fechaFinEstimada: formData.fechaFinEstimada ? new Date(formData.fechaFinEstimada) : undefined,
      };
      
      await createTrabajo(dataToSend);
      onClose();
    } catch (error) {
      alert("No se pudo guardar el trabajo");
      console.error("Error al guardar:", error);
    }
  } else {
    console.log("Formulario no válido");
  }
};
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
                <InputText1
                  label="ID de Parámetros de Tela *"
                  value={formData.parametrosTelaId + ""}
                  onChange={(val) => handleChange("parametrosTelaId", val)}
                  errorMessage={errors.parametrosTelaIdError}
                  required
                  type="number"
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
                <InputText1
                  label="ID de Tienda *"
                  value={formData.tiendaId + ""}
                  onChange={(val) => handleChange("tiendaId", val)}
                  errorMessage={errors.tiendaIdError}
                  required
                  type="number"
                  width={220}
                />
              </div>

              <InputText1
                label="ID de Costurero"
                value={formData.costureroId}
                onChange={(val) => handleChange("costureroId", val)}
                type="number"
                width={450}
              />

              <div className="linea"></div>

              <h2>Estado y Fechas</h2>

              <div className="form-row">
                <div className="estado-container">
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
                <InputText1
                  label="Fecha de Inicio"
                  value={formData.fechaInicio}
                  onChange={(val) => handleChange("fechaInicio", val)}
                  type="date"
                  width={220}
                />
              </div>

              <InputText1
                label="Fecha Fin Estimada"
                value={formData.fechaFinEstimada}
                onChange={(val) => handleChange("fechaFinEstimada", val)}
                type="date"
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
