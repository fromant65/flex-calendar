"use client";

import { Button } from "~/components/ui/button";
import { Download, Loader2, Check } from "lucide-react";
import { useInstallPWA } from "~/lib/pwa-utils";
import { useState } from "react";
import type { InstallStatus } from "~/lib/pwa-utils";
import { HelpTip } from "~/components/ui/help-tip";

interface PWAInstallButtonProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

const getStatusMessage = (status: InstallStatus): { title: string; description: string } => {
  switch (status) {
    case "already-installed":
      return {
        title: "Ya instalada",
        description: "La aplicación ya está instalada en este dispositivo. Puedes acceder desde tu pantalla de inicio."
      };
    case "not-supported":
      return {
        title: "No compatible",
        description: "Este navegador no soporta la instalación automática de PWAs. Para instalar, usa Chrome o Edge en escritorio, o Chrome/Samsung Internet en Android."
      };
    case "not-secure":
      return {
        title: "Requiere HTTPS",
        description: "Las PWAs solo funcionan con conexiones seguras (HTTPS). Esta función estará disponible cuando la app se despliegue en producción con certificado SSL."
      };
    case "ios-instructions-needed":
      return {
        title: "Instrucciones iOS",
        description: "En Safari iOS: Toca el botón de compartir (cuadrado con flecha) y selecciona 'Añadir a pantalla de inicio'."
      };
    case "criteria-not-met":
      return {
        title: "En desarrollo",
        description: "Estás en localhost. La instalación estará disponible cuando: 1) El service worker esté registrado correctamente, 2) Todos los criterios de PWA se cumplan. Verifica la consola para más detalles."
      };
    case "unknown":
      return {
        title: "Verificando...",
        description: "Comprobando si la aplicación se puede instalar en este dispositivo y navegador."
      };
    case "installable":
      return {
        title: "Instalar App",
        description: "Haz clic para instalar Flex Calendar en tu dispositivo y acceder más rápido desde tu pantalla de inicio."
      };
    default:
      return {
        title: "Instalar App",
        description: "Haz clic para instalar Flex Calendar en tu dispositivo."
      };
  }
};

export function PWAInstallButton({ 
  variant = "default", 
  size = "default",
  className 
}: PWAInstallButtonProps) {
  const { isInstallable, installStatus, installPWA } = useInstallPWA();
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

  const statusInfo = getStatusMessage(installStatus);

  if (installed) {
    return (
      <div className="inline-flex items-center gap-2">
        <Button variant="default" size={size} disabled className={className}>
          <Check className="h-4 w-4 mr-2" />
          ¡Instalada!
        </Button>
        <HelpTip title="Instalación exitosa" side="bottom">
          La aplicación se instaló correctamente
        </HelpTip>
      </div>
    );
  }

  if (!isInstallable) {
    return (
      <div className="inline-flex items-center gap-2">
        <Button variant="outline" size={size} disabled className={className}>
          <Download className="h-4 w-4 mr-2" />
          {statusInfo.title}
        </Button>
        <HelpTip title={statusInfo.title} side="bottom">
          {statusInfo.description}
        </HelpTip>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
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
      <HelpTip title={statusInfo.title} side="bottom">
        {statusInfo.description}
      </HelpTip>
    </div>
  );
}
