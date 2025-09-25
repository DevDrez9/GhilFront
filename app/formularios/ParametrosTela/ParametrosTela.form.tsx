import "./ParametrosTela.style.css";

import { useState } from "react";

import Switch1 from "~/componentes/switch1";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import { useParametrosTela } from "~/hooks/useParametrosTela"; // Nuevo hook
import { EstadoPrenda } from "~/models/ParametrosTela";


interface ParametrosTelaFormProps {
  visible: boolean;
  onClose: () => void;
}

const ParametrosTelaForm: React.FC<ParametrosTelaFormProps> = ({
  visible,
  onClose,
}) => {
  const { createParametroTela, isCreating, createError } =
    useParametrosTela(); // Nuevo hook

  const containerClasses = [
    "contenedorFormParametrosTela",
    visible ? "visible" : "noVisible",
  ]
    .filter(Boolean)
    .join(" ");

  const [formData, setFormData] = useState({
    codigoReferencia: "",
    nombreModelo: "",
    tipoTelaRecomendada: "",
    estadoPrenda: EstadoPrenda.PENDIENTE,
    fotoReferenciaUrl: "",
    cantidadEstandarPorLote: 0,
    tabla: "",
    tallasDisponibles: "",
    consumoTelaPorTalla: "{}", // Inicialmente como JSON string vacío
    consumoTelaPorLote: 0,
    tiempoFabricacionPorUnidad: 0,
    tiempoTotalPorLote: 0,
    productoId: undefined,
    telaId: undefined,
  });

  const handleChange = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.codigoReferencia.trim())
      newErrors.codigoReferenciaError = "El código de referencia es obligatorio";

    if (!formData.nombreModelo.trim())
      newErrors.nombreModeloError = "El nombre del modelo es obligatorio";

    if (!formData.tipoTelaRecomendada.trim())
      newErrors.tipoTelaRecomendadaError =
        "El tipo de tela recomendada es obligatorio";

    if (!formData.cantidadEstandarPorLote || formData.cantidadEstandarPorLote <= 0)
      newErrors.cantidadEstandarPorLoteError = "La cantidad por lote debe ser mayor a 0";

    if (!formData.tallasDisponibles.trim())
      newErrors.tallasDisponiblesError = "Las tallas disponibles son obligatorias";

    try {
      if (formData.consumoTelaPorTalla.trim()) {
        const parsed = JSON.parse(formData.consumoTelaPorTalla);
        if (typeof parsed !== 'object' || Array.isArray(parsed)) {
          newErrors.consumoTelaPorTallaError = "El formato de consumo por talla no es válido (debe ser un JSON de objeto)";
        }
      } else {
         newErrors.consumoTelaPorTallaError = "El consumo por talla es obligatorio";
      }
    } catch (e) {
      newErrors.consumoTelaPorTallaError = "El formato de consumo por talla no es un JSON válido";
    }

    if (!formData.consumoTelaPorLote || formData.consumoTelaPorLote <= 0)
      newErrors.consumoTelaPorLoteError = "El consumo por lote debe ser mayor a 0";

    if (!formData.tiempoFabricacionPorUnidad || formData.tiempoFabricacionPorUnidad <= 0)
      newErrors.tiempoFabricacionPorUnidadError = "El tiempo de fabricación debe ser mayor a 0";

    if (!formData.tiempoTotalPorLote || formData.tiempoTotalPorLote <= 0)
      newErrors.tiempoTotalPorLoteError = "El tiempo total por lote debe ser mayor a 0";

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
          cantidadEstandarPorLote: Number(formData.cantidadEstandarPorLote),
          consumoTelaPorLote: Number(formData.consumoTelaPorLote),
          tiempoFabricacionPorUnidad: Number(formData.tiempoFabricacionPorUnidad),
          tiempoTotalPorLote: Number(formData.tiempoTotalPorLote),
          // Convertir el string JSON a un objeto
         consumoTelaPorTalla: formData.consumoTelaPorTalla,
          // Convertir los opcionales si tienen valor
          productoId: formData.productoId ? Number(formData.productoId) : undefined,
          telaId: formData.telaId ? Number(formData.telaId) : undefined,
        };

        await createParametroTela(dataToSend);
        onClose();
      } catch (error) {
        alert("No se pudo guardar los parámetros de la tela");
        console.error("Error al guardar:", error);
      }
    } else {
      console.log("Formulario no válido");
    }
  };

  return (
    <>
      <div className={containerClasses}>
        <div className="cuerpoParametrosTelaForm">
          <h2>Nuevo Parámetro de Tela</h2>

          <Boton1
            type="button"
            size="medium"
            variant="info"
            onClick={() => {
              onClose();
            }}
          >
            Atrás
          </Boton1>

          <div className="formParametrosTela">
            <form onSubmit={handleSubmit}>
              <h2>Datos de la Prenda</h2>

              <div className="form-row">
                <InputText1
                  label="Código de Referencia *"
                  value={formData.codigoReferencia}
                  onChange={(val) => handleChange("codigoReferencia", val)}
                  errorMessage={errors.codigoReferenciaError}
                  required
                  type="text"
                  width={220}
                />
                <InputText1
                  label="Nombre del Modelo *"
                  value={formData.nombreModelo}
                  onChange={(val) => handleChange("nombreModelo", val)}
                  errorMessage={errors.nombreModeloError}
                  required
                  type="text"
                  width={220}
                />
              </div>

              <div className="form-row">
                <InputText1
                  label="Tipo de Tela Recomendada *"
                  value={formData.tipoTelaRecomendada}
                  onChange={(val) => handleChange("tipoTelaRecomendada", val)}
                  errorMessage={errors.tipoTelaRecomendadaError}
                  required
                  type="text"
                  width={220}
                />
                <div className="estado-container">
                  <label>Estado de la Prenda *</label>
                  <select
                    value={formData.estadoPrenda}
                    onChange={(e) => handleChange("estadoPrenda", e.target.value)}
                    className="estado-select"
                  >
                    <option value={EstadoPrenda.PENDIENTE}>Pendiente</option>
                    <option value={EstadoPrenda.APROBADO}>Aprobado</option>
                    <option value={EstadoPrenda.OBSERVADO}>Observado</option>
                  </select>
                </div>
              </div>

              <InputText1
                label="Foto de Referencia URL"
                value={formData.fotoReferenciaUrl}
                onChange={(val) => handleChange("fotoReferenciaUrl", val)}
                type="text"
                width={450}
              />
              <InputText1
                label="Tallas Disponibles *"
                value={formData.tallasDisponibles}
                onChange={(val) => handleChange("tallasDisponibles", val)}
                errorMessage={errors.tallasDisponiblesError}
                required
                type="text"
                width={450}
               
              />

              <div className="linea"></div>

              <h2>Consumo y Tiempos de Producción</h2>

              <div className="form-row">
                <InputText1
                  label="Cantidad por Lote *"
                  value={formData.cantidadEstandarPorLote+""}
                  onChange={(val) => handleChange("cantidadEstandarPorLote", val)}
                  errorMessage={errors.cantidadEstandarPorLoteError}
                  required
                  type="number"
                  width={220}
                />
                <InputText1
                  label="Consumo de Tela por Lote *"
                  value={formData.consumoTelaPorLote+""}
                  onChange={(val) => handleChange("consumoTelaPorLote", val)}
                  errorMessage={errors.consumoTelaPorLoteError}
                  required
                  type="number"
                  width={220}
                />
              </div>

              <InputText1
                label="Consumo de Tela por Talla (JSON) *"
                value={formData.consumoTelaPorTalla}
                onChange={(val) => handleChange("consumoTelaPorTalla", val)}
                errorMessage={errors.consumoTelaPorTallaError}
                required
                type="text"
                width={450}
               
              />

              <div className="form-row">
                <InputText1
                  label="Tiempo Fabricación por Unidad (horas) *"
                  value={formData.tiempoFabricacionPorUnidad+""}
                  onChange={(val) => handleChange("tiempoFabricacionPorUnidad", val)}
                  errorMessage={errors.tiempoFabricacionPorUnidadError}
                  required
                  type="number"
                  width={220}
                />
                <InputText1
                  label="Tiempo Total por Lote (horas) *"
                  value={formData.tiempoTotalPorLote+""}
                  onChange={(val) => handleChange("tiempoTotalPorLote", val)}
                  errorMessage={errors.tiempoTotalPorLoteError}
                  required
                  type="number"
                  width={220}
                />
              </div>

              <div className="linea"></div>

              <h2>Relaciones (opcional)</h2>

              <div className="form-row">
                <InputText1
                  label="ID de Producto"
                  value={formData.productoId}
                  onChange={(val) => handleChange("productoId", val)}
                  type="number"
                  width={220}
                />
                <InputText1
                  label="ID de Tela"
                  value={formData.telaId}
                  onChange={(val) => handleChange("telaId", val)}
                  type="number"
                  width={220}
                />
              </div>

              <Boton1
                type="submit"
                fullWidth
                size="medium"
                disabled={isCreating}
              >
                {isCreating ? "Guardando..." : "Guardar Parámetros"}
              </Boton1>

              {createError && (
                <div className="error-alert">
                  Error: {createError.message}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ParametrosTelaForm;