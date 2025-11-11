"use client";

import { motion } from "framer-motion";
import { 
  Smartphone, 
  Zap, 
  Bell, 
  MonitorSmartphone,
  Home,
  Gauge,
  Star
} from "lucide-react";
import { FlexCalendarIcon } from "~/components/ui/flex-calendar-icon";
import { PWAInstallButton } from "~/components/pwa/pwa-install-button";
import { useIsPWA } from "~/lib/pwa-utils";
import { redirect } from "next/navigation";
import { Card } from "~/components/ui/card";
import { SparkleCalendarBgSubtle } from "~/components/landing/sparkle-calendar-bg-subtle";

const benefits = [
  {
    icon: Zap,
    title: "Acceso Instantáneo",
    description: "Abre la app desde tu pantalla de inicio con un solo toque, sin buscar en el navegador."
  },
  {
    icon: Home,
    title: "Ícono en tu Pantalla",
    description: "Agrega Flex Calendar a tu pantalla de inicio como cualquier otra aplicación."
  },
  {
    icon: MonitorSmartphone,
    title: "Experiencia de App Nativa",
    description: "Disfruta de pantalla completa sin la barra de dirección del navegador."
  },
  {
    icon: Gauge,
    title: "Carga Más Rápida",
    description: "Los recursos se guardan localmente para una carga inicial más rápida."
  },
  {
    icon: Bell,
    title: "Notificaciones (Próximamente)",
    description: "Pronto podrás recibir recordatorios de tus tareas importantes."
  },
  {
    icon: Star,
    title: "Sin Ocupar Espacio",
    description: "A diferencia de apps nativas, no consume el almacenamiento de tu dispositivo."
  }
];

const steps = [
  {
    number: "1",
    title: "Haz Click en Instalar",
    description: "Presiona el botón y acepta el prompt de tu navegador."
  },
  {
    number: "2",
    title: "Añade a tu Inicio",
    description: "La app se agregará automáticamente a tu pantalla de inicio."
  },
  {
    number: "3",
    title: "¡Listo!",
    description: "Ábrela como cualquier otra app en tu dispositivo."
  }
];

export default function InstallAppPage() {
  const isPWA = useIsPWA();

  // Si ya estamos en la PWA, redirigir al dashboard
  if (isPWA) {
    redirect("/dashboard");
  }

  return (
    <div className="relative min-h-full">
      {/* Fondo de grilla de calendario */}
      <div className="fixed inset-0 -z-10">
        <SparkleCalendarBgSubtle opacity={0.1} />
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Section */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
          <FlexCalendarIcon className="h-4 w-4" />
          Aplicación Web Progresiva
        </div>

        <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Instala{" "}
          <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Flex Calendar
          </span>
        </h1>

        <p className="mb-8 text-lg text-muted-foreground max-w-2xl mx-auto">
          Accede más rápido a tu calendario con la versión instalable. 
          Un ícono en tu pantalla de inicio para abrir la app al instante.
        </p>

        <PWAInstallButton size="lg" className="rounded-lg shadow-md" />
        
        <p className="mt-3 text-sm text-muted-foreground">
          Compatible con Chrome, Edge, Safari y navegadores modernos
        </p>
      </motion.div>

      {/* Benefits Grid */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 className="text-2xl font-bold text-center mb-8">¿Por qué instalar?</h2>
        
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={benefit.title}
                className="p-6 hover:shadow-lg transition-shadow"
              >
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* How to Install */}
      <motion.div
        className="mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        <h2 className="text-2xl font-bold text-center mb-8">¿Cómo instalar?</h2>
        
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <div key={step.number} className="relative text-center">
              <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold">
                {step.number}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-7 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-primary/50 to-transparent" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <PWAInstallButton size="lg" className="rounded-lg shadow-md" />
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <Card className="p-6 bg-muted/30 border-primary/20">
          <div className="flex items-start gap-4">
            <Smartphone className="h-8 w-8 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">¿Qué es una PWA?</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Una Aplicación Web Progresiva (PWA) es una versión mejorada de un sitio web que 
                se puede instalar en tu dispositivo. Combina lo mejor de las apps y la web: 
                no necesitas ir a una tienda de aplicaciones y siempre está actualizada automáticamente.
              </p>
              <p className="text-sm text-muted-foreground">
                <strong>Nota:</strong> Puedes volver a esta página desde el menú lateral en cualquier momento.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
      </div>
    </div>
  );
}
