import { Login } from "~/models/login.model";
import "./LoginStyle.css";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "~/validation/loginSchema";
import { useState } from "react";
import InputText1 from "~/componentes/InputText1";
import Boton1 from "~/componentes/Boton1";
import { useNavigate } from "react-router";
import { useAuth } from "~/hooks/useAuth";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Validación simple
  const [errors, setErrors] = useState<Record<string, string>>({});
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email)
      newErrors.usertype = "El tipo de empresa es obligatorio";
    if (!formData.password) newErrors.passwordtype = "La industria es obligatoria";

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const { login, isLoggingIn, loginError } = useAuth();

  // Manejar submit
     const navigate = useNavigate();
      const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const success = await login(formData);
      
      console.log("Datos recibidos:", isLoggingIn, loginError);
      if(success){
         setLoginSuccess(true);
        navigate('/home');
      }
      
      //
    }else{
        console.log("no valido ")
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
          <form onSubmit={handleSubmit}>
            <InputText1
              label="Usuario"
              value={formData.email}
              onChange={(val) => handleChange("email", val)}
              errorMessage={errors.usertype}
              required
              type="text"
            />
            <InputText1
              label="Password"
              value={formData.password}
              onChange={(val) => handleChange("password", val)}
              errorMessage={errors.passwordtype}
              required
              type="password"
            />
          
          <Boton1  type="submit"  fullWidth size="medium" onClick={() => {}}>
            Ingresar
          </Boton1>
          </form>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
