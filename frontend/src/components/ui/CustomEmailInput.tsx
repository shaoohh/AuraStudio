import React from 'react';
import styled from 'styled-components';

interface EmailInputProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
}

const CustomEmailInput: React.FC<EmailInputProps> = ({ value, onChange, label = "Username", required = true }) => {
  return (
    <StyledWrapper>
      <div className="inputbox">
        <input 
          type="email" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          required={required} 
          className={value ? 'has-value' : ''} 
        />
        <span>{label}</span>
        <i />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  .inputbox { position: relative; width: 100%; }

  .inputbox input {
    position: relative; width: 100%; padding: 20px 10px 10px; background: transparent;
    outline: none; box-shadow: none; border: none;
    color: #000000;
    font-size: 1em; letter-spacing: 0.05em; transition: 0.5s; 
    z-index: 20; 

    /* 🚀 这里的写法最稳健：直接绑定在 input 自身上 */
    &::selection {
      background-color: #45f3ff !important;
      color: #07182E !important;
    }
    &::-moz-selection {
      background-color: #45f3ff !important;
      color: #07182E !important;
    }
  }

  .inputbox span {
    position: absolute; left: 0; padding: 20px 10px 10px; font-size: 1em;
    color: #8f8f8f; letter-spacing: 0.05em; transition: 0.5s; pointer-events: none; 
    z-index: 10; 
  }

  .inputbox input:focus ~ span,
  .inputbox input.has-value ~ span {
    color: #45f3ff; transform: translateX(-10px) translateY(-34px); font-size: 0.75em;
  }

  .inputbox i {
    position: absolute; left: 0; bottom: 0; width: 100%; height: 2px;
    background: #45f3ff; border-radius: 4px; transition: 0.5s; pointer-events: none; 
    z-index: 1; 
  }

  .inputbox input:focus ~ i,
  .inputbox input.has-value ~ i { height: 44px; }
`;

export default CustomEmailInput;