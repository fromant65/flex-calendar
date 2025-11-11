"use client";

import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { Download, Loader2, Check, Info, HelpCircle } from "lucide-react";
import { useInstallPWA } from "~/lib/pwa-utils";
import { useState } from "react";
import type { InstallStatus } from "~/lib/pwa-utils";

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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button variant="default" size={size} disabled className={className}>
                <Check className="h-4 w-4 mr-2" />
                ¡Instalada!
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>La aplicación se instaló correctamente</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (!isInstallable) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="inline-block">
              <Button variant="outline" size={size} disabled className={className}>
                <HelpCircle className="h-4 w-4 mr-2" />
                {statusInfo.title}
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-semibold mb-1">{statusInfo.title}</p>
            <p className="text-xs text-muted-foreground">{statusInfo.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent>
          <p>{statusInfo.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
