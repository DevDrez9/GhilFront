import { useState, useRef, useEffect } from "react"; // Agregamos useEffect
import { useNavigate } from "react-router";
// 1. CAMBIO EN EL IMPORT: Le ponemos un guion bajo o nombre temporal
import ReCAPTCHA_ from "react-google-recaptcha";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import { useAuth } from "~/hooks/useAuth";
import "./LoginStyle.css";
import { useAlert } from "~/componentes/alerts/AlertContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  // 2. Estado para saber si estamos en el navegador (Cliente)
  const [isMounted, setIsMounted] = useState(false);

  // 3. Referencia al componente con la corrección de importación
  // Esto arregla el error: "got: object"
  const ReCAPTCHA = (ReCAPTCHA_ as any).default ?? ReCAPTCHA_;

  const captchaRef = useRef<any>(null); // Tipado any para evitar conflictos con la librería

  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  // 4. Efecto para marcar que el componente ya se montó en el cliente
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onChangeCaptcha = (token: string | null) => {
    setCaptchaToken(token);
    if (token) {
      setErrors((prev) => ({ ...prev, captcha: "" }));
    }
  };

  const validate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.usertype = "El email es obligatorio";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.usertype = "El formato del Email no es válido";
    }

    if (!formData.password) {
      newErrors.passwordtype = "El password es obligatorio";
    }

    if (!captchaToken) {
      newErrors.captcha = "Por favor, verifica que no eres un robot";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 1. Asegúrate de tener el hook al inicio del componente
  const { showAlert } = useAlert();

  // ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      const success = await login(formData);

      if (success) {
        // Login exitoso: Redirigir
        // (Opcional: podrías poner un showAlert("Bienvenido", "success") antes del navigate si quieres)
        navigate('/home');
      } else {
        // Login fallido



        showAlert("Usuario o contraseña incorrecta.", "error");

        // Resetear Captcha
        setCaptchaToken(null);
        if (captchaRef.current) {
          captchaRef.current.reset();
        }
      }
    } else {
      // Validación fallida (ej: falta captcha o email mal formado)
      showAlert("Formulario no válido. Verifica el email, contraseña y el Captcha.", "warning");
    }
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  return (
    <>
      <div className="cuerpoLogin">
        <div className="formularioLogin">
          <img src="logo.jpg" alt="" />

          <form onSubmit={handleSubmit}>
            <InputText1
              label="Usuario"
              value={formData.email}
              onChange={(val) => handleChange("email", val as string)}
              errorMessage={errors.usertype}
              required
              type="text"
              width="100%"
            />
            <InputText1
              label="Password"
              value={formData.password}
              onChange={(val) => handleChange("password", val as string)}
              errorMessage={errors.passwordtype}
              required
              type="password"
              width="100%"
            />

            <div style={{ marginTop: "15px", marginBottom: "15px", display: "flex", flexDirection: "column", alignItems: "center", minHeight: "78px" }}>
              {/* 5. Renderizado Condicional: Solo mostrar si está montado en el cliente */}
              {isMounted ? (
                <ReCAPTCHA
                  ref={captchaRef}
                  sitekey="6LeP9g4sAAAAAN6ktTMEdbZ6qgqm9utzoPQc_7oG"
                  onChange={onChangeCaptcha}
                />
              ) : (
                <p>Cargando captcha...</p>
              )}

              {errors.captcha && (
                <span style={{ color: "red", fontSize: "12px", marginTop: "5px" }}>
                  {errors.captcha}
                </span>
              )}
            </div>

            <Boton1
              type="submit"
              fullWidth
              size="medium"
              disabled={isLoggingIn}
              style={{ width: "100%" }}
            >
              {isLoggingIn ? "Ingresando..." : "Ingresar"}
            </Boton1>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;