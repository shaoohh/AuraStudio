import React, { useEffect } from 'react';
import styled from 'styled-components';

interface ErrorToastProps {
  message: string;
  onClose: () => void;
}

const CustomErrorToast: React.FC<ErrorToastProps> = ({ message, onClose }) => {
  // 💡 自动销毁机制：展示 3.5 秒后自动关闭，体验更平滑
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <StyledWrapper>
      <div className="error slide-in">
        <div className="error__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width={24} viewBox="0 0 24 24" height={24} fill="none"><path fill="#393a37" d="m13 13h-2v-6h2zm0 4h-2v-2h2zm-1-15c-1.3132 0-2.61358.25866-3.82683.7612-1.21326.50255-2.31565 1.23915-3.24424 2.16773-1.87536 1.87537-2.92893 4.41891-2.92893 7.07107 0 2.6522 1.05357 5.1957 2.92893 7.0711.92859.9286 2.03098 1.6651 3.24424 2.1677 1.21325.5025 2.51363.7612 3.82683.7612 2.6522 0 5.1957-1.0536 7.0711-2.9289 1.8753-1.8754 2.9289-4.4189 2.9289-7.0711 0-1.3132-.2587-2.61358-.7612-3.82683-.5026-1.21326-1.2391-2.31565-2.1677-3.24424-.9286-.92858-2.031-1.66518-3.2443-2.16773-1.2132-.50254-2.5136-.7612-3.8268-.7612z" /></svg>
        </div>
        {/* 🚀 动态插入错误信息 */}
        <div className="error__title">{message}</div>
        {/* 🚀 绑定关闭事件 */}
        <div className="error__close" onClick={onClose}><svg xmlns="http://www.w3.org/2000/svg" width={20} viewBox="0 0 20 20" height={20}><path fill="#393a37" d="m15.8333 5.34166-1.175-1.175-4.6583 4.65834-4.65833-4.65834-1.175 1.175 4.65833 4.65834-4.65833 4.6583 1.175 1.175 4.65833-4.6583 4.6583 4.6583 1.175-1.175-4.6583-4.6583z" /></svg></div>
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  /* 💡 绝对定位到屏幕正上方，带有极高的层级 */
  position: fixed;
  top: 32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 99999; 

  /* 💡 优雅的下拉入场动画 */
  .slide-in {
    animation: slideDown 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .error {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    width: 320px;
    padding: 12px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    background: #EF665B;
    border-radius: 8px;
    box-shadow: 0px 10px 25px -5px rgba(239, 102, 91, 0.4); /* 加了一点同色系的弥散阴影，更高级 */
  }

  .error__icon {
    width: 20px;
    height: 20px;
    transform: translateY(-2px);
    margin-right: 12px; /* 稍微拉开一点间距 */
    flex-shrink: 0;
  }

  .error__icon path { fill: #fff; }

  .error__title {
    font-weight: 500;
    font-size: 13px; /* 略微调小一点，防止长报错文字溢出 */
    color: #fff;
    line-height: 1.4;
  }

  .error__close {
    width: 20px;
    height: 20px;
    cursor: pointer;
    margin-left: auto;
    flex-shrink: 0;
    padding-left: 8px;
    transition: opacity 0.2s;
  }
  
  .error__close:hover { opacity: 0.7; }

  .error__close path { fill: #fff; }
`;

export default CustomErrorToast;