import styled from 'styled-components'

export const Wrapper = styled.div`
  position: absolute;
  bottom: 24px;
  left: 14px;
  z-index: 100;
`

export const Card = styled.div`
  position: relative;
  width: 52px;
  height: 52px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  background: #243137;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  cursor: pointer;

  &:hover {
    width: 200px;
    height: 200px;
    border-color: rgba(189, 159, 103, 0.3);
    border-radius: 30px;
    box-shadow: rgba(0, 0, 0, 0.4) 0 20px 40px -10px;
  }
`

export const Background = styled.div`
  position: absolute;
  inset: 0;
  opacity: 0;
  background: radial-gradient(circle at 100% 107%, #ff89cc 0%, #9cb8ec 30%, #00ffee 60%, #62c2fe 100%);
  transition: opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1);

  ${Card}:hover & {
    opacity: 1;
  }
`

export const Logo = styled.div`
  position: absolute;
  right: 50%;
  bottom: 50%;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  transform: translate(50%, 50%);
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);

  ${Card}:hover & {
    right: 20px;
    bottom: 20px;
    transform: translate(0, 0);
  }
`

export const LogoMark = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0;
  color: white;
  transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);

  ${Card}:hover & {
    transform: scale(1.08);
  }
`

export const MenuBox = styled.button<{ $size: string; $delay: string; $gradient: string }>`
  position: absolute;
  bottom: ${(props) => `-${props.$size}`};
  left: ${(props) => `-${props.$size}`};
  width: ${(props) => props.$size};
  height: ${(props) => props.$size};
  padding: 12px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  background: rgba(255, 255, 255, 0.18);
  border: 0;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  border-right: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10% 13% 42% 0% / 10% 12% 75% 0%;
  box-shadow: rgba(100, 100, 111, 0.22) -7px 7px 29px 0;
  opacity: 0;
  transform-origin: bottom left;
  transition: all 0.7s cubic-bezier(0.23, 1, 0.32, 1);
  transition-delay: ${(props) => props.$delay};

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: ${(props) => props.$gradient};
    opacity: 0;
    transition: opacity 0.45s cubic-bezier(0.23, 1, 0.32, 1);
  }

  &:hover::before {
    opacity: 1;
  }

  ${Card}:hover & {
    bottom: -1px;
    left: -1px;
    opacity: 1;
  }
`

export const IconWrap = styled.span`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.45s cubic-bezier(0.23, 1, 0.32, 1);

  ${MenuBox}:hover & {
    color: white;
    filter: drop-shadow(0 0 5px white);
  }
`

// 品牌扇形菜单的共享样式。
