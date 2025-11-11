"use client";

import { useEffect, useState } from "react";

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
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevenir que el navegador muestre su propio prompt
      e.preventDefault();
      // Guardar el evento para usarlo después
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
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
    setIsInstallable(false);

    return outcome === "accepted";
  };

  return {
    isInstallable,
    installPWA,
  };
}
