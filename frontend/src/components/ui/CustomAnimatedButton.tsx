import React from 'react';
import styled from 'styled-components';

interface ButtonProps {
  text: string;           // 默认显示的文字
  hoverText?: string;     // (可选) Hover时显示的文字，如果不传，Hover时文字不变
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

const CustomAnimatedButton: React.FC<ButtonProps> = ({ 
  text, 
  hoverText, 
  onClick, 
  type = "button" 
}) => {
  return (
    <StyledWrapper>
      <button className="animated-button" type={type} onClick={onClick}>
        {/* 左侧飞入的箭头 */}
        <svg viewBox="0 0 24 24" className="arr-2" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
        </svg>

        {/* 🚀 核心：巧妙处理 Hover 变字的逻辑 */}
        <span className="text-container">
          {/* 默认文字：如果有 hoverText，就在 hover 时淡出；否则永远保持 */}
          <span className={`text ${hoverText ? 'fade-out' : ''}`}>{text}</span>
          {/* Hover文字：如果有，默认隐藏，hover时淡入 */}
          {hoverText && <span className="text hover-text fade-in">{hoverText}</span>}
        </span>

        {/* 扩散的光圈 */}
        <span className="circle" />

        {/* 右侧飞出的箭头 */}
        <svg viewBox="0 0 24 24" className="arr-1" xmlns="http://www.w3.org/2000/svg">
          <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
        </svg>
      </button>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  width: 100%;

  .animated-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center; /* 确保文字居中 */
    width: 100%; /* 填满父容器 */
    gap: 4px;
    padding: 14px 36px;
    border: 2px solid;
    border-color: transparent;
    font-size: 15px;
    background-color: transparent;
    border-radius: 100px;
    font-weight: 700;
    color: #45f3ff; /* 霓虹青色 */
    box-shadow: 0 0 0 2px #45f3ff;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .animated-button svg {
    position: absolute;
    width: 24px;
    fill: #45f3ff;
    z-index: 9;
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  }

  .animated-button .arr-1 {
    right: 24px;
  }

  .animated-button .arr-2 {
    left: -25%;
  }

  .animated-button .circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background-color: #45f3ff;
    border-radius: 50%;
    opacity: 0;
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  }

  /* 💡 文字容器的平移效果 */
  .animated-button .text-container {
    position: relative;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transform: translateX(-12px);
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  }

  /* 💡 处理双文字渐变交替 */
  .animated-button .text {
    white-space: nowrap;
  }
  
  .animated-button .hover-text {
    position: absolute;
    opacity: 0;
  }
  
  .animated-button .fade-out, 
  .animated-button .fade-in {
    transition: opacity 0.4s ease-in-out;
  }

  /* --- 🌈 HOVER 状态 --- */
  .animated-button:hover {
    box-shadow: 0 0 0 12px transparent;
    color: #07182E; /* 文字变成暗夜色 */
    border-radius: 12px;
  }

  .animated-button:hover .arr-1 {
    right: -25%;
  }

  .animated-button:hover .arr-2 {
    left: 24px;
  }

  .animated-button:hover .text-container {
    transform: translateX(12px);
  }

  /* Hover 文字交替 */
  .animated-button:hover .fade-out {
    opacity: 0;
  }
  .animated-button:hover .fade-in {
    opacity: 1;
  }

  .animated-button:hover svg {
    fill: #07182E; /* 箭头变成暗夜色 */
  }

  .animated-button:active {
    scale: 0.95;
    box-shadow: 0 0 0 4px #45f3ff;
  }

  .animated-button:hover .circle {
    width: 500px; /* 放足够大，盖住整个按钮 */
    height: 500px;
    opacity: 1;
  }
`;

export default CustomAnimatedButton;