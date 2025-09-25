import React, { useState } from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset'; // Nueva prop type
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'small' | 'medium' | 'large';
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

const Boton1: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = 'button', // Valor por defecto
  variant = 'primary',
  size = 'medium',
  backgroundColor,
  textColor,
  borderColor,
  disabled = false,
  fullWidth = false,
  style,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Colores base según la variante
  const variantColors = {
    primary: { bg: '#4a90e2', text: '#ffffff', border: '#4a90e2' },
    secondary: { bg: '#6c757d', text: '#ffffff', border: '#6c757d' },
    success: { bg: '#28a745', text: '#ffffff', border: '#28a745' },
    danger: { bg: '#dc3545', text: '#ffffff', border: '#dc3545' },
    warning: { bg: '#ffc107', text: '#212529', border: '#ffc107' },
    info: { bg: '#17a2b8', text: '#ffffff', border: '#17a2b8' }
  };

  // Tamaños
  const sizes = {
    small: { padding: '6px 12px', fontSize: '12px' },
    medium: { padding: '10px 20px', fontSize: '14px' },
    large: { padding: '14px 28px', fontSize: '16px' }
  };

  // Estilos base del botón
  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    border: '2px solid',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 600,
    transition: 'all 0.2s ease',
    textDecoration: 'none',
    outline: 'none',
    width: fullWidth ? '80%' : 'auto', // Cambiado de 80% a 100% para fullWidth
    opacity: disabled ? 0.6 : 1,
    ...sizes[size],
    ...style
  };

  // Colores personalizados o por variante
  const bgColor = backgroundColor || variantColors[variant].bg;
  const txtColor = textColor || variantColors[variant].text;
  const brdColor = borderColor || variantColors[variant].border;

  // Estilo final del botón
  const buttonStyle: React.CSSProperties = {
    ...baseStyle,
    backgroundColor: isActive ? darkenColor(bgColor, 20) : 
                    isHovered ? darkenColor(bgColor, 10) : bgColor,
    color: txtColor,
    borderColor: isActive ? darkenColor(brdColor, 20) : 
                isHovered ? darkenColor(brdColor, 10) : brdColor,
    transform: isActive ? 'scale(0.98)' : 'none'
  };

  // Función para oscurecer colores (para hover y active)
  function darkenColor(color: string, amount: number): string {
    // Implementación básica para oscurecer colores HEX
    if (color.startsWith('#')) {
      let r = parseInt(color.slice(1, 3), 16);
      let g = parseInt(color.slice(3, 5), 16);
      let b = parseInt(color.slice(5, 7), 16);
      
      r = Math.max(0, r - amount);
      g = Math.max(0, g - amount);
      b = Math.max(0, b - amount);
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    return color;
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Si es tipo submit, no prevenir el comportamiento por defecto
    if (type !== 'submit' && !disabled && onClick) {
      onClick();
    }
    // Para tipo submit, el formulario se encargará del evento
  };

  return (
    <button
      type={type} // Aquí usamos la prop type
      style={buttonStyle}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsActive(false);
      }}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Boton1;