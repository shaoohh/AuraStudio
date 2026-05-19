// frontend/src/context/LoadingContext.tsx
import React, { createContext, useContext, useState } from "react";

interface LoadingContextType {
  isLoading: boolean;
  isAuthSuccess: boolean;
  isAnimDone: boolean;
  isPageReady: boolean;     // 🚀 新增：首页数据和 DOM 是否完全就绪
  text: string;
  subText: string;
  startLoading: (sub: string) => void;
  authSuccess: () => void;
  authError: () => void;
  resolvePageReady: () => void; // 🚀 真正落地：首页加载完由首页调用
  resetLoading: () => void;
  setIsAnimDone: (done: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthSuccess, setIsAuthSuccess] = useState(false);
  const [isAnimDone, setIsAnimDone] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false); // 初始为未就绪
  const [text, setText] = useState("AS");
  const [subText, setSubText] = useState("LOADING");

  const startLoading = (customSubText: string) => {
    setIsLoading(true);
    setIsAuthSuccess(false);
    setIsAnimDone(false);
    setIsPageReady(false); // 🚀 每次开始加载，重置首页就绪锁
    setText("AS");
    setSubText(customSubText);
  };

  const authSuccess = () => {
    setIsAuthSuccess(true);
  };

  const authError = () => {
    resetLoading();
  };

  // 🚀 首页数据 100% 渲染完毕后，下发解禁信号
  const resolvePageReady = () => {
    setIsPageReady(true);
  };

  const resetLoading = () => {
    setIsLoading(false);
    setIsAuthSuccess(false);
    setIsAnimDone(false);
    setIsPageReady(false);
    setText("AS");
    setSubText("LOADING");
  };

  return (
    <LoadingContext.Provider value={{
      isLoading, isAuthSuccess, isAnimDone, isPageReady, text, subText,
      startLoading, authSuccess, authError, resolvePageReady, resetLoading, setIsAnimDone
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error("useLoading 必须在 LoadingProvider 内部使用");
  return context;
};