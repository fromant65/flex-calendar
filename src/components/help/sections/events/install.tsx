"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "~/components/ui/card"
import { HelpTip } from "~/components/ui/help-tip"
import { PWAInstallButton } from "~/components/pwa/pwa-install-button"
import { Download, Zap, Eye, Smartphone } from "lucide-react"

export function InstallContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Instalar Flex Calendar como App
          </CardTitle>
          <CardDescription>
            Convierte Flex Calendar en una aplicación instalable (PWA)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border rounded-lg">
            <h4 className="font-semibold mb-2">¿Qué es una PWA?</h4>
            <p className="text-sm text-muted-foreground">
              Una <strong>Progressive Web App (PWA)</strong> es una aplicación web que puedes instalar en tu dispositivo
              como si fuera una app nativa. Funciona sin conexión y ofrece una experiencia más rápida.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-500" />
              Ventajas de Instalar
            </h4>
            <div className="grid gap-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border">
                <Smartphone className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-sm">Acceso Directo</div>
                  <div className="text-xs text-muted-foreground">
                    Ícono en tu pantalla de inicio. Abre la app con un toque.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border">
                <Zap className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-sm">Carga Más Rápida</div>
                  <div className="text-xs text-muted-foreground">
                    Los recursos se guardan localmente. Carga instantánea.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border">
                <Eye className="h-5 w-5 text-purple-600 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-sm">Pantalla Completa</div>
                  <div className="text-xs text-muted-foreground">
                    Sin barra de direcciones ni pestañas del navegador.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Cómo Instalar</h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-muted/20 border">
                <div className="font-medium text-sm mb-2 flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</div>
                  En Desktop (Chrome, Edge)
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Busca el ícono de instalación en la barra de direcciones</p>
                  <p>• Haz clic en "Instalar Flex Calendar"</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border">
                <div className="font-medium text-sm mb-2 flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</div>
                  En iPhone/iPad (Safari)
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Toca el botón de compartir ⬆️</p>
                  <p>• Selecciona "Añadir a la pantalla de inicio"</p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border">
                <div className="font-medium text-sm mb-2 flex items-center gap-2">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</div>
                  En Android (Chrome)
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Toca el menú ⋮ (tres puntos)</p>
                  <p>• Selecciona "Instalar aplicación"</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col items-center gap-3">
            <PWAInstallButton size="lg" />
            <p className="text-xs text-muted-foreground text-center">
              Haz clic en el botón para instalar ahora
            </p>
          </div>

          <HelpTip title="Compatibilidad">
            Funciona en Chrome, Edge, Safari (iOS 11.3+), Firefox y otros navegadores modernos.
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
