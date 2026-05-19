// frontend/src/components/LoadingCard.tsx
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface LoadingCardProps {
  isPageReady?: boolean; // 🚀 变更为首页就绪状态
  onAnimationComplete?: () => void;
  onClick?: () => void;
  text: string;
  subText: string;
}

const LoadingCard: React.FC<LoadingCardProps> = ({ 
  isPageReady,
  onAnimationComplete,
  onClick,
  text,
  subText
}) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsActive(true);
    }, 600);

    const endTimer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    }, 1800);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
    };
  }, [onAnimationComplete]);

  return (
    // 🚀 只有首页准备好了，鼠标移上去才会变成小手(pointer)，否则显示沙漏(wait)
    <OverlayWrapper onClick={onClick} className={isPageReady ? "cursor-pointer" : "cursor-wait"}>
      <StyledWrapper>
        <div className={`card ${isActive ? 'loading-active' : ''}`}>
          <div className="border" />
          <div className="content">
            <div className="logo">
              <div className="logo1"><span>AS</span></div>
              <div className="logo2"><span>tudio</span></div>
              <span className="trail" />
            </div>
            <span className="logo-bottom-text">AStudio.io</span>
          </div>
          <span className="bottom-text">personal workspace</span>
        </div>
      </StyledWrapper>

      {/* 🚀 终极修复：只有首页真的加载完了，且动画还没放完(isActive控制中)的时候，沉底的提示字才会浮现 */}
      {isPageReady && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 text-slate-500/60 text-xs tracking-widest animate-pulse pointer-events-none">
          点击任意位置跳过动画
        </div>
      )}
    </OverlayWrapper>
  );
}

// 后面原汁原味的 Styled 样式保持绝对不变...
const OverlayWrapper = styled.div`
  position: fixed; inset: 0; background-color: #0f172a; z-index: 9999; display: flex; align-items: center; justify-content: center; animation: fadeIn 0.3s ease-out;
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
`;
const StyledWrapper = styled.div`
  position: relative; display: flex; justify-content: center; align-items: center;
  .card { width: 300px; height: 200px; background: #243137; position: relative; display: grid; place-content: center; border-radius: 10px; overflow: hidden; transition: all 0.5s ease-in-out; box-shadow: 0 0 80px rgba(0, 0, 0, 0.8); }
  .border { position: absolute; inset: 0px; border: 2px solid #bd9f67; opacity: 0; transform: rotate(10deg); transition: all 0.5s ease-in-out; }
  .bottom-text { position: absolute; left: 50%; bottom: 13px; transform: translateX(-50%); font-size: 8px; text-transform: uppercase; padding: 0px 5px 0px 8px; color: #bd9f67; background: #243137; opacity: 0; letter-spacing: 7px; transition: all 0.5s ease-in-out; white-space: nowrap; font-weight: 600; }
  .content { transition: all 0.5s ease-in-out; }
  .content .logo { height: 35px; position: relative; width: 40px; overflow: hidden; transition: all 1s ease-in-out; }
  .content .logo .logo1 { height: 33px; position: absolute; left: 0; display: flex; align-items: center; justify-content: center; span { font-family: 'Arial', sans-serif; font-weight: 900; font-size: 26px; color: #bd9f67; border-bottom: 3px solid #bd9f67; line-height: 0.8; padding-bottom: 2px; letter-spacing: 1px; } }
  .content .logo .logo2 { height: 33px; position: absolute; left: 42px; display: flex; align-items: center; span { font-family: 'Arial', sans-serif; font-weight: 900; font-size: 26px; color: transparent; -webkit-text-stroke: 1.5px #bd9f67; line-height: 0.8; padding-bottom: 2px; letter-spacing: 1px; } }
  .content .logo .trail { position: absolute; right: 0; height: 100%; width: 100%; opacity: 0; }
  .content .logo-bottom-text { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); margin-top: 30px; color: #bd9f67; padding-left: 8px; font-size: 11px; opacity: 0; letter-spacing: normal; transition: all 0.5s ease-in-out 0.5s; font-weight: 600; }
  .card.loading-active { border-radius: 0; transform: scale(1.1); }
  .card.loading-active .logo { width: 135px; animation: cursor-flicker 1s ease-in-out forwards; }
  .card.loading-active .border { inset: 15px; opacity: 1; transform: rotate(0); }
  .card.loading-active .bottom-text { letter-spacing: 3px; opacity: 1; transform: translateX(-50%); }
  .card.loading-active .content .logo-bottom-text { opacity: 1; letter-spacing: 9.5px; }
  .card.loading-active .trail { animation: trail-sweep 1s ease-in-out forwards; }
  @keyframes cursor-flicker { 0% { border-right: 2px solid transparent; } 10% { border-right: 2px solid #bd9f67; } 80% { border-right: 2px solid #bd9f67; } 100% { border-right: 2px solid transparent; } }
  @keyframes trail-sweep { 0% { background: linear-gradient(90deg, rgba(189, 159, 103, 0) 90%, rgb(189, 159, 103) 100%); opacity: 0; } 30% { background: linear-gradient(90deg, rgba(189, 159, 103, 0) 70%, rgb(189, 159, 103) 100%); opacity: 1; } 70% { background: linear-gradient(90deg, rgba(189, 159, 103, 0) 70%, rgb(189, 159, 103) 100%); opacity: 1; } 95% { background: linear-gradient(90deg, rgba(189, 159, 103, 0) 90%, rgb(189, 159, 103) 100%); opacity: 0; } }
`;

export default LoadingCard;