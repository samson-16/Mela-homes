// Telegram Utility Functions

import crypto from "crypto";

/**
 * Check if the app is running inside Telegram Mini App
 */
export function isTelegramMiniApp(): boolean {
  if (typeof window === "undefined") return false;
  
  // Check for Telegram WebApp object
  const webApp = (window as any).Telegram?.WebApp;
  if (!webApp) return false;

  // platform is 'unknown' in standard browsers or when not initialized
  // initData is empty in standard browsers
  const isPlatformValid = webApp.platform && webApp.platform !== 'unknown';
  const hasInitData = !!webApp.initData;

  return !!(isPlatformValid || hasInitData);
}

/**
 * Get Telegram WebApp instance
 */
export function getTelegramWebApp() {
  if (typeof window === "undefined") return null;
  return (window as any).Telegram?.WebApp || null;
}

/**
 * Validate Telegram initData
 * This should be done on the server-side for security
 */
export function validateTelegramInitData(
  initData: string,
  botToken: string
): boolean {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get("hash");
    urlParams.delete("hash");

    // Sort parameters alphabetically
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join("\n");

    // Create secret key
    const secretKey = crypto
      .createHmac("sha256", "WebAppData")
      .update(botToken)
      .digest();

    // Calculate hash
    const calculatedHash = crypto
      .createHmac("sha256", secretKey)
      .update(dataCheckString)
      .digest("hex");

    return calculatedHash === hash;
  } catch (error) {
    console.error("Error validating Telegram initData:", error);
    return false;
  }
}

/**
 * Parse Telegram user from initData
 */
export function parseTelegramUser(initData: string) {
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get("user");
    
    if (!userParam) return null;
    
    return JSON.parse(decodeURIComponent(userParam));
  } catch (error) {
    console.error("Error parsing Telegram user:", error);
    return null;
  }
}

/**
 * Expand Telegram Mini App to full screen
 */
export function expandTelegramApp() {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.expand();
  }
}

/**
 * Close Telegram Mini App
 */
export function closeTelegramApp() {
  const webApp = getTelegramWebApp();
  if (webApp) {
    webApp.close();
  }
}

/**
 * Show Telegram back button
 */
export function showTelegramBackButton(onClick?: () => void) {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.BackButton) {
    webApp.BackButton.show();
    if (onClick) {
      webApp.BackButton.onClick(onClick);
    }
  }
}

/**
 * Hide Telegram back button
 */
export function hideTelegramBackButton() {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.BackButton) {
    webApp.BackButton.hide();
  }
}

/**
 * Show Telegram main button
 */
export function showTelegramMainButton(
  text: string,
  onClick?: () => void,
  options?: {
    color?: string;
    textColor?: string;
    isActive?: boolean;
    isVisible?: boolean;
  }
) {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.MainButton) {
    webApp.MainButton.setText(text);
    
    if (options?.color) webApp.MainButton.setParams({ color: options.color });
    if (options?.textColor) webApp.MainButton.setParams({ text_color: options.textColor });
    if (options?.isActive !== undefined) {
      options.isActive ? webApp.MainButton.enable() : webApp.MainButton.disable();
    }
    
    if (onClick) {
      webApp.MainButton.onClick(onClick);
    }
    
    webApp.MainButton.show();
  }
}

/**
 * Hide Telegram main button
 */
export function hideTelegramMainButton() {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.MainButton) {
    webApp.MainButton.hide();
  }
}

/**
 * Get Telegram theme colors
 */
export function getTelegramTheme() {
  const webApp = getTelegramWebApp();
  if (webApp) {
    return webApp.themeParams;
  }
  return null;
}

/**
 * Trigger haptic feedback
 */
export function triggerHapticFeedback(
  type: "impact" | "notification" | "selection" = "impact",
  style?: "light" | "medium" | "heavy" | "rigid" | "soft"
) {
  const webApp = getTelegramWebApp();
  if (webApp && webApp.HapticFeedback) {
    if (type === "impact" && style) {
      webApp.HapticFeedback.impactOccurred(style);
    } else if (type === "notification") {
      webApp.HapticFeedback.notificationOccurred(style as any);
    } else if (type === "selection") {
      webApp.HapticFeedback.selectionChanged();
    }
  }
}
