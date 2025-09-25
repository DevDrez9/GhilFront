import React, { useState } from 'react';

interface SwitchProps {
  label?: string;
  checked?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  width?: string | number;
  size?: 'small' | 'medium' | 'large';
}

const Switch1: React.FC<SwitchProps> = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  width = '80%',
  size = 'medium'
}) => {
  const [isChecked, setIsChecked] = useState(checked);

  const handleToggle = () => {
    if (!disabled) {
      const newValue = !isChecked;
      setIsChecked(newValue);
      onChange(newValue);
    }
  };

  // Tamaños del switch
  const sizeStyles = {
    small: {
      width: 40,
      height: 20,
      translate: 16,
    },
    medium: {
      width: 50,
      height: 26,
      translate: 24,
    },
    large: {
      width: 60,
      height: 32,
      translate: 30,
    }
  };

  const containerStyle = {
    ...styles.container,
    width: width
  };

  const switchStyle = {
    ...styles.switch,
    width: sizeStyles[size].width,
    height: sizeStyles[size].height,
    backgroundColor: isChecked ? '#4a90e2' : '#ccc',
    opacity: disabled ? 0.6 : 1,
    cursor: disabled ? 'not-allowed' : 'pointer'
  };

  const sliderStyle = {
    ...styles.slider,
    transform: isChecked ? `translateX(${sizeStyles[size].translate}px)` : 'translateX(2px)',
    width: sizeStyles[size].height - 4,
    height: sizeStyles[size].height - 4
  };

  return (
    <div style={containerStyle}>
      <div style={styles.switchContainer}>
        {label && (
          <label 
            style={{
              ...styles.label,
              opacity: disabled ? 0.6 : 1
            }}
          >
            {label}
          </label>
        )}
        
        <div 
          style={switchStyle}
          onClick={handleToggle}
          role="switch"
          aria-checked={isChecked}
        >
          <div style={sliderStyle} />
        </div>
        
        <span style={{
          ...styles.statusText,
          opacity: disabled ? 0.6 : 1
        }}>
          {isChecked ? 'Activado' : 'Desactivado'}
        </span>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    marginBottom: '20px',
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
  },
  switchContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#333',
    marginRight: 'auto'
  },
  switch: {
    position: 'relative' as 'relative',
    borderRadius: '34px',
    transition: 'all 0.3s ease',
    flexShrink: 0
  },
  slider: {
    position: 'absolute' as 'absolute',
    borderRadius: '50%',
    backgroundColor: 'white',
    transition: 'all 0.3s ease',
    top: '2px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
  },
  statusText: {
    fontSize: '12px',
    color: '#666',
    fontWeight: 500,
    minWidth: '80px'
  }
};

export default Switch1;