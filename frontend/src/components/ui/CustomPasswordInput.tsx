import React from 'react';
import styled from 'styled-components';

interface PasswordInputProps {
  value: string;
  onChange: (val: string) => void;
  label?: string;
  required?: boolean;
}

const CustomPasswordInput: React.FC<PasswordInputProps> = ({ value, onChange, label = "Password", required = true }) => {
  return (
    <StyledWrapper>
      <div className="inputbox">
        <svg stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="input-lock-icon">
          <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" strokeLinejoin="round" strokeLinecap="round" fill="none" />
        </svg>

        <input 
          type="password" 
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

  .input-lock-icon {
    position: absolute; left: 10px; top: 50%; transform: translateY(-50%); width: 1.2rem; height: 1.2rem;
    color: #8f8f8f; transition: 0.5s ease; pointer-events: none;
    z-index: 10;
  }

  .inputbox input {
    position: relative; width: 100%; padding: 20px 10px 10px 36px; background: transparent;
    outline: none; box-shadow: none; border: none;
    color: #000000; /* 纯黑文字 */
    font-size: 1em; letter-spacing: 0.05em; transition: 0.5s; 
    /* 🚀 找回层级 */
    z-index: 20; 
  }

  .inputbox span {
    position: absolute; left: 0; padding: 20px 10px 10px 36px; font-size: 1em;
    color: #8f8f8f; letter-spacing: 0.05em; transition: 0.5s; pointer-events: none; 
    z-index: 10;
  }

  .inputbox input:focus ~ span,
  .inputbox input.has-value ~ span {
    color: #45f3ff; transform: translateX(-36px) translateY(-34px); font-size: 0.75em;
  }

  .inputbox input:focus ~ .input-lock-icon,
  .inputbox input.has-value ~ .input-lock-icon {
    color: #ffffff; 
  }

  .inputbox i {
    position: absolute; left: 0; bottom: 0; width: 100%; height: 2px;
    background: #45f3ff; border-radius: 4px; transition: 0.5s; pointer-events: none; 
    z-index: 1;
  }

  .inputbox input:focus ~ i,
  .inputbox input.has-value ~ i { height: 44px; }
`;

export default CustomPasswordInput;