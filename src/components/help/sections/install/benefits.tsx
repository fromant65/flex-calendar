"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Zap, Smartphone, Eye, Wifi, BatteryCharging, HardDrive } from "lucide-react"

export function InstallBenefitsContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Ventajas de Instalar la App
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border rounded-lg">
            <h4 className="font-semibold mb-2">¿Por qué instalar Flex Calendar?</h4>
            <p className="text-sm text-muted-foreground">
              Instalar Flex Calendar como una <strong>Progressive Web App (PWA)</strong> te ofrece 
              una experiencia más cercana a una aplicación nativa, con beneficios significativos 
              de rendimiento y usabilidad.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Ventajas Principales</h4>
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3 mb-2">
                  <Smartphone className="h-6 w-6 text-blue-600 dark:text-blue-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-1">Acceso Directo</h5>
                    <p className="text-xs text-muted-foreground">
                      Ícono en la pantalla de inicio de tu dispositivo (escritorio, dock o home screen). 
                      Abre la app con un solo clic o toque, sin tener que abrir el navegador primero.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-start gap-3 mb-2">
                  <Zap className="h-6 w-6 text-yellow-600 dark:text-yellow-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-medium text-sm text-green-900 dark:text-green-100 mb-1">Carga Instantánea</h5>
                    <p className="text-xs text-muted-foreground mb-2">
                      Los recursos (HTML, CSS, JavaScript, imágenes) se almacenan en caché local. 
                      La app carga en milisegundos, incluso con conexión lenta.
                    </p>
                    <Badge variant="outline" className="text-xs bg-green-100 dark:bg-green-900/30">
                      Hasta 10x más rápido que web tradicional
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-start gap-3 mb-2">
                  <Eye className="h-6 w-6 text-purple-600 dark:text-purple-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-medium text-sm text-purple-900 dark:text-purple-100 mb-1">Modo Pantalla Completa</h5>
                    <p className="text-xs text-muted-foreground">
                      La app se abre en ventana independiente sin barra de direcciones, pestañas ni 
                      controles del navegador. Más espacio para tu contenido y experiencia inmersiva.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800">
                <div className="flex items-start gap-3 mb-2">
                  <Wifi className="h-6 w-6 text-cyan-600 dark:text-cyan-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-medium text-sm text-cyan-900 dark:text-cyan-100 mb-1">Funciona Offline (Parcial)</h5>
                    <p className="text-xs text-muted-foreground mb-2">
                      Aunque Flex Calendar requiere conexión para sincronizar datos, la interfaz 
                      se carga offline. Puedes ver la estructura de la app incluso sin internet.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>Próximamente:</strong> Funcionalidad offline completa con sincronización automática.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-start gap-3 mb-2">
                  <BatteryCharging className="h-6 w-6 text-orange-600 dark:text-orange-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-medium text-sm text-orange-900 dark:text-orange-100 mb-1">Menor Consumo de Recursos</h5>
                    <p className="text-xs text-muted-foreground">
                      Las PWA son más eficientes que las pestañas del navegador. Menor uso de RAM, 
                      CPU y batería. Ideal para laptops y dispositivos móviles.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800">
                <div className="flex items-start gap-3 mb-2">
                  <HardDrive className="h-6 w-6 text-pink-600 dark:text-pink-500 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <h5 className="font-medium text-sm text-pink-900 dark:text-pink-100 mb-1">Instalación Ligera</h5>
                    <p className="text-xs text-muted-foreground">
                      No ocupa apenas espacio en disco (~5-10 MB). Mucho más ligero que apps nativas 
                      tradicionales que pueden pesar 50-200 MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Ventajas Adicionales</h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/20 border">
                <h5 className="font-medium text-sm mb-1">🔔 Notificaciones Push (Próximamente)</h5>
                <p className="text-xs text-muted-foreground">
                  Recibe recordatorios de tareas y eventos directamente en tu dispositivo.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border">
                <h5 className="font-medium text-sm mb-1">📲 Instalación Sin Tiendas</h5>
                <p className="text-xs text-muted-foreground">
                  No necesitas App Store ni Google Play. Instala directamente desde el navegador.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border">
                <h5 className="font-medium text-sm mb-1">🔄 Actualizaciones Automáticas</h5>
                <p className="text-xs text-muted-foreground">
                  La app se actualiza automáticamente sin intervención manual.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border">
                <h5 className="font-medium text-sm mb-1">🖥️ Multidispositivo</h5>
                <p className="text-xs text-muted-foreground">
                  Instala en PC, Mac, Android, iOS. Tus datos se sincronizan en todos.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border">
                <h5 className="font-medium text-sm mb-1">🔒 Misma Seguridad Web</h5>
                <p className="text-xs text-muted-foreground">
                  Usa HTTPS y las mismas medidas de seguridad que la versión web.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-muted/20 border">
                <h5 className="font-medium text-sm mb-1">🗑️ Desinstalación Fácil</h5>
                <p className="text-xs text-muted-foreground">
                  Desinstala como cualquier app. No deja archivos residuales.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Comparación: Web vs PWA Instalada</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border rounded-lg">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-2 text-left border-b">Característica</th>
                    <th className="p-2 text-center border-b">Web Normal</th>
                    <th className="p-2 text-center border-b bg-green-50 dark:bg-green-950/30">PWA Instalada</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-b">Velocidad de carga</td>
                    <td className="p-2 text-center border-b">⚡</td>
                    <td className="p-2 text-center border-b bg-green-50 dark:bg-green-950/20">⚡⚡⚡</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">Ícono en pantalla inicio</td>
                    <td className="p-2 text-center border-b">❌</td>
                    <td className="p-2 text-center border-b bg-green-50 dark:bg-green-950/20">✅</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">Pantalla completa</td>
                    <td className="p-2 text-center border-b">❌</td>
                    <td className="p-2 text-center border-b bg-green-50 dark:bg-green-950/20">✅</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">Trabajo offline</td>
                    <td className="p-2 text-center border-b">❌</td>
                    <td className="p-2 text-center border-b bg-green-50 dark:bg-green-950/20">✅ (Parcial)</td>
                  </tr>
                  <tr>
                    <td className="p-2 border-b">Consumo de recursos</td>
                    <td className="p-2 text-center border-b">Alto</td>
                    <td className="p-2 text-center border-b bg-green-50 dark:bg-green-950/20">Bajo</td>
                  </tr>
                  <tr>
                    <td className="p-2">Actualizaciones automáticas</td>
                    <td className="p-2 text-center">✅</td>
                    <td className="p-2 text-center bg-green-50 dark:bg-green-950/20">✅</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border rounded-lg">
            <h5 className="font-semibold text-sm mb-2">💡 Recomendación</h5>
            <p className="text-xs text-muted-foreground">
              Si usas Flex Calendar regularmente (especialmente en dispositivos móviles), 
              <strong> instalar la PWA mejorará significativamente tu experiencia</strong>. 
              La instalación toma solo unos segundos y puedes desinstalarla en cualquier momento.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
