"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useIsPWA, useInstallPWA } from "~/lib/pwa-utils";
import Link from "next/link";

const PWA_BANNER_DISMISSED_KEY = "pwa-banner-dismissed";

export function PWABanner() {
  const [isDismissed, setIsDismissed] = useState(true);
  const isPWA = useIsPWA();
  const { isInstallable, installPWA } = useInstallPWA();

  useEffect(() => {
    // Solo mostrar el banner si no es PWA y no fue previamente cerrado
    const wasDismissed = localStorage.getItem(PWA_BANNER_DISMISSED_KEY);
    
    if (!isPWA && !wasDismissed && isInstallable) {
      // Esperar un poco antes de mostrar el banner para no ser intrusivo
      const timer = setTimeout(() => {
        setIsDismissed(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isPWA, isInstallable]);

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem(PWA_BANNER_DISMISSED_KEY, "true");
  };

  const handleInstall = async () => {
    const success = await installPWA();
    if (success) {
      handleDismiss();
    }
  };

  // No mostrar el banner si:
  // - Ya está instalada como PWA
  // - No es instalable
  // - Fue cerrado por el usuario
  if (isPWA || !isInstallable || isDismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -100, opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-primary/95 to-primary/90 backdrop-blur-sm shadow-lg border-b border-primary/20"
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 py-3">
            {/* Icono y mensaje */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-foreground/20">
                <Smartphone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary-foreground mb-0.5">
                  ¡Instala Flex Calendar!
                </p>
                <p className="text-xs text-primary-foreground/80 truncate">
                  Accede más rápido y funciona sin internet.{" "}
                  <Link 
                    href="/install-app" 
                    className="underline hover:text-primary-foreground font-medium"
                  >
                    Más info
                  </Link>
                </p>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                onClick={handleInstall}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-medium"
              >
                <Download className="h-4 w-4 mr-1.5" />
                <span className="hidden sm:inline">Instalar</span>
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-primary-foreground hover:bg-primary-foreground/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
