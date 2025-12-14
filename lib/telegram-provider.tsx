"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getTelegramWebApp,
  isTelegramMiniApp,
  expandTelegramApp,
  getTelegramTheme,
} from "@/lib/telegram-utils";

interface TelegramContextType {
  webApp: any;
  user: any;
  isMiniApp: boolean;
  theme: any;
  initDataUnsafe: any;
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  isMiniApp: false,
  theme: null,
  initDataUnsafe: null,
});

export function useTelegram() {
  return useContext(TelegramContext);
}

interface TelegramProviderProps {
  children: React.ReactNode;
}

export function TelegramProvider({ children }: TelegramProviderProps) {
  const [webApp, setWebApp] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [isMiniApp, setIsMiniApp] = useState(false);
  const [theme, setTheme] = useState<any>(null);
  const [initDataUnsafe, setInitDataUnsafe] = useState<any>(null);

  useEffect(() => {
    // Check if running in Telegram
    const isInTelegram = isTelegramMiniApp();
    setIsMiniApp(isInTelegram);

    if (isInTelegram) {
      const tg = getTelegramWebApp();
      setWebApp(tg);

      if (tg) {
        // Initialize the Mini App
        tg.ready();

        // Expand to full screen
        expandTelegramApp();

        // Get user data
        if (tg.initDataUnsafe?.user) {
          setUser(tg.initDataUnsafe.user);
          setInitDataUnsafe(tg.initDataUnsafe);
        }

        // Get theme
        const themeParams = getTelegramTheme();
        setTheme(themeParams);

        // Apply theme colors to CSS variables
        if (themeParams) {
          const root = document.documentElement;
          if (themeParams.bg_color) {
            root.style.setProperty("--tg-bg-color", themeParams.bg_color);
          }
          if (themeParams.text_color) {
            root.style.setProperty("--tg-text-color", themeParams.text_color);
          }
          if (themeParams.button_color) {
            root.style.setProperty("--tg-button-color", themeParams.button_color);
          }
          if (themeParams.button_text_color) {
            root.style.setProperty("--tg-button-text-color", themeParams.button_text_color);
          }
        }

        // Listen for theme changes
        tg.onEvent("themeChanged", () => {
          const newTheme = getTelegramTheme();
          setTheme(newTheme);
        });
      }
    }
  }, []);

  const value = {
    webApp,
    user,
    isMiniApp,
    theme,
    initDataUnsafe,
  };

  return (
    <TelegramContext.Provider value={value}>
      {children}
    </TelegramContext.Provider>
  );
}
