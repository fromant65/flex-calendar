"use client";

import { Button } from "~/components/ui/button";
import { Download, Loader2, Check, Info } from "lucide-react";
import { useInstallPWA } from "~/lib/pwa-utils";
import { useState } from "react";

interface PWAInstallButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function PWAInstallButton({ 
  variant = "default", 
  size = "default",
  className 
}: PWAInstallButtonProps) {
  const { isInstallable, installPWA } = useInstallPWA();
  const [isInstalling, setIsInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    const success = await installPWA();
    setIsInstalling(false);
    
    if (success) {
      setInstalled(true);
      setTimeout(() => setInstalled(false), 3000);
    }
  };

  if (installed) {
    return (
      <Button variant="default" size={size} disabled className={className}>
        <Check className="h-4 w-4 mr-2" />
        ¡Instalada!
      </Button>
    );
  }

  if (!isInstallable) {
    return (
      <Button variant="outline" size={size} disabled className={className}>
        <Info className="h-4 w-4 mr-2" />
        No disponible
      </Button>
    );
  }

  return (
    <Button 
      variant={variant} 
      size={size} 
      onClick={handleInstall}
      disabled={isInstalling}
      className={className}
    >
      {isInstalling ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Instalando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Instalar App
        </>
      )}
    </Button>
  );
}
