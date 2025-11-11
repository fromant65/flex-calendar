"use client";

import { useEffect, useState } from "react";

export type InstallStatus = 
  | "installable" 
  | "already-installed" 
  | "not-supported" 
  | "not-secure"
  | "ios-instructions-needed"
  | "criteria-not-met"
  | "unknown";

/**
 * Detecta el tipo de navegador y sistema operativo
 */
function getBrowserInfo() {
  const userAgent = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(userAgent);
  const isAndroid = /Android/.test(userAgent);
  const isChrome = /Chrome/.test(userAgent) && !/Edge|Edg/.test(userAgent);
  const isEdge = /Edg/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome|Chromium|Edg/.test(userAgent);
  const isFirefox = /Firefox/.test(userAgent);
  
  return { isIOS, isAndroid, isChrome, isEdge, isSafari, isFirefox };
}

/**
 * Hook para detectar si la aplicación se está ejecutando como PWA
 */
export function useIsPWA() {
  const [isPWA, setIsPWA] = useState(false);

  useEffect(() => {
    // Detectar si está en modo standalone (instalado como PWA)
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    
    // También verificar navigator.standalone para iOS
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    setIsPWA(isStandalone || isIOSStandalone);
  }, []);

  return isPWA;
}

/**
 * Hook para manejar el evento de instalación de PWA
 */
export function useInstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installStatus, setInstallStatus] = useState<InstallStatus>("unknown");

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    // Verificar si ya está instalada
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    if (isStandalone || isIOSStandalone) {
      setInstallStatus("already-installed");
      return;
    }

    // Obtener información del navegador
    const browserInfo = getBrowserInfo();
    console.log('[PWA Debug] Browser Info:', browserInfo);
    console.log('[PWA Debug] Location:', window.location.hostname, window.location.protocol);

    // iOS Safari requiere instrucciones manuales (no hay beforeinstallprompt)
    if (browserInfo.isIOS && browserInfo.isSafari) {
      setInstallStatus("ios-instructions-needed");
      return;
    }

    // Verificar si es HTTPS o localhost
    const isSecure = window.location.protocol === "https:" || 
                     window.location.hostname === "localhost" ||
                     window.location.hostname === "127.0.0.1";
    
    if (!isSecure) {
      setInstallStatus("not-secure");
      return;
    }

    // Verificar si el navegador soporta Service Workers (requerido para PWA)
    if (!("serviceWorker" in navigator)) {
      setInstallStatus("not-supported");
      return;
    }

    // Verificar si el navegador soporta beforeinstallprompt
    // Chrome, Edge, Samsung Internet lo soportan
    // Safari (excepto iOS), Firefox no lo soportan completamente
    if (browserInfo.isFirefox || (browserInfo.isSafari && !browserInfo.isIOS)) {
      setInstallStatus("not-supported");
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('[PWA Debug] beforeinstallprompt event fired!');
      // Prevenir que el navegador muestre su propio prompt
      e.preventDefault();
      // Guardar el evento para usarlo después
      setDeferredPrompt(e);
      setInstallStatus("installable");
      // Limpiar el timeout si el evento se dispara
      if (timeoutId) clearTimeout(timeoutId);
    };

    const handleAppInstalled = () => {
      setInstallStatus("already-installed");
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Si después de un tiempo no se dispara el evento beforeinstallprompt,
    // puede ser que:
    // 1. Ya fue instalada anteriormente y el navegador lo recuerda
    // 2. No cumple con los criterios de PWA (manifest, service worker, etc)
    // 3. El navegador no soporta instalación
    timeoutId = setTimeout(() => {
      console.log('[PWA Debug] Timeout reached, no beforeinstallprompt event');
      setInstallStatus((currentStatus) => {
        console.log('[PWA Debug] Current status:', currentStatus);
        if (currentStatus === "unknown") {
          // En desarrollo (localhost), es probable que aún no se cumplen todos los criterios
          if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
            return "criteria-not-met";
          } else {
            return "not-supported";
          }
        }
        return currentStatus;
      });
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const installPWA = async () => {
    if (!deferredPrompt) {
      return false;
    }

    // Mostrar el prompt de instalación
    deferredPrompt.prompt();

    // Esperar a que el usuario responda
    const { outcome } = await deferredPrompt.userChoice;

    // Limpiar el prompt después de usarlo
    setDeferredPrompt(null);
    
    if (outcome === "accepted") {
      setInstallStatus("already-installed");
    }

    return outcome === "accepted";
  };

  return {
    isInstallable: installStatus === "installable",
    installStatus,
    installPWA,
  };
}
