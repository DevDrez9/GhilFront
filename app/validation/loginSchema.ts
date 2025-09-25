import * as yup from "yup";

export const loginSchema = yup.object({
  user: yup.string().required("El user es obligatorio"),
  password: yup.string().min(6, "La contraseña debe tener al menos 6 caracteres").required("La contraseña es obligatoria"),
});