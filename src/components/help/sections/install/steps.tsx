"use client"

import React from "react"
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { HelpTip } from "~/components/ui/help-tip"
import { PWAInstallButton } from "~/components/pwa/pwa-install-button"
import { Smartphone, Monitor, Tablet, Chrome, Apple, Navigation } from "lucide-react"

export function InstallStepsContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Pasos de Instalación por Dispositivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border rounded-lg">
            <p className="text-sm text-muted-foreground">
              El proceso de instalación varía según tu dispositivo y navegador. 
              Selecciona tu plataforma para ver instrucciones específicas.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Escritorio (Windows, Mac, Linux)
            </h4>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-3">
                  <Chrome className="h-6 w-6 text-blue-600 dark:text-blue-500" />
                  <h5 className="font-medium text-blue-900 dark:text-blue-100">Google Chrome / Microsoft Edge</h5>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-blue-600 dark:bg-blue-700 shrink-0">1</Badge>
                    <p className="text-xs text-muted-foreground">
                      Busca el <strong>ícono de instalación</strong> en la barra de direcciones (extremo derecho). 
                      Parece un monitor con una flecha hacia abajo ⬇️
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-blue-600 dark:bg-blue-700 shrink-0">2</Badge>
                    <p className="text-xs text-muted-foreground">
                      Haz clic en el ícono. Aparecerá un diálogo que dice "¿Instalar Flex Calendar?"
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-blue-600 dark:bg-blue-700 shrink-0">3</Badge>
                    <p className="text-xs text-muted-foreground">
                      Haz clic en <strong>"Instalar"</strong>. La app se descargará e instalará automáticamente.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-blue-600 dark:bg-blue-700 shrink-0">4</Badge>
                    <p className="text-xs text-muted-foreground">
                      Se abrirá una ventana nueva con Flex Calendar. También aparecerá un ícono en tu escritorio o menú de aplicaciones.
                    </p>
                  </div>
                </div>
                <div className="mt-3 p-3 rounded bg-blue-100 dark:bg-blue-900/30">
                  <p className="text-xs text-muted-foreground">
                    <strong>Método alternativo:</strong> Haz clic en el menú ⋮ (tres puntos) → "Guardar y compartir" → "Instalar Flex Calendar"
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <div className="flex items-center gap-3 mb-3">
                  <Navigation className="h-6 w-6 text-purple-600 dark:text-purple-500" />
                  <h5 className="font-medium text-purple-900 dark:text-purple-100">Otros Navegadores (Firefox, Brave, Opera)</h5>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  El soporte puede variar. En general:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Busca opciones como "Agregar a la pantalla de inicio" en el menú del navegador</li>
                  <li>• Algunos navegadores crearán un marcador especial en lugar de instalación completa</li>
                  <li>• Para mejor experiencia, recomendamos Chrome o Edge en escritorio</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Apple className="h-5 w-5" />
              iPhone / iPad (iOS / iPadOS)
            </h4>
            
            <div className="p-4 rounded-lg bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-800">
              <div className="flex items-center gap-3 mb-3">
                <Apple className="h-6 w-6 text-pink-600 dark:text-pink-500" />
                <h5 className="font-medium text-pink-900 dark:text-pink-100">Safari (Predeterminado en iOS)</h5>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge className="bg-pink-600 dark:bg-pink-700 shrink-0">1</Badge>
                  <p className="text-xs text-muted-foreground">
                    Abre Flex Calendar en <strong>Safari</strong> (no en Chrome u otros navegadores, no funcionará)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-pink-600 dark:bg-pink-700 shrink-0">2</Badge>
                  <p className="text-xs text-muted-foreground">
                    Toca el botón <strong>Compartir</strong> ⬆️ (en la barra inferior, centro o abajo a la izquierda según el dispositivo)
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-pink-600 dark:bg-pink-700 shrink-0">3</Badge>
                  <p className="text-xs text-muted-foreground">
                    Desplázate en el menú emergente y selecciona <strong>"Añadir a la pantalla de inicio"</strong> 📱
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-pink-600 dark:bg-pink-700 shrink-0">4</Badge>
                  <p className="text-xs text-muted-foreground">
                    Aparecerá una ventana para confirmar. Puedes editar el nombre si quieres. Toca <strong>"Agregar"</strong> en la esquina superior derecha.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Badge className="bg-pink-600 dark:bg-pink-700 shrink-0">5</Badge>
                  <p className="text-xs text-muted-foreground">
                    El ícono de Flex Calendar aparecerá en tu pantalla de inicio. Tócalo para abrir la app.
                  </p>
                </div>
              </div>
              <div className="mt-3 p-3 rounded bg-pink-100 dark:bg-pink-900/30">
                <p className="text-xs text-muted-foreground">
                  <strong>Importante:</strong> iOS requiere Safari. Chrome y Firefox en iOS no soportan instalación de PWAs.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Android (Teléfono / Tablet)
            </h4>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3 mb-3">
                  <Chrome className="h-6 w-6 text-green-600 dark:text-green-500" />
                  <h5 className="font-medium text-green-900 dark:text-green-100">Chrome (Recomendado)</h5>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Badge className="bg-green-600 dark:bg-green-700 shrink-0">1</Badge>
                    <p className="text-xs text-muted-foreground">
                      Abre Flex Calendar en <strong>Chrome</strong>. Aparecerá automáticamente un banner en la parte inferior que dice "Añadir Flex Calendar a la pantalla de inicio".
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-green-600 dark:bg-green-700 shrink-0">2</Badge>
                    <p className="text-xs text-muted-foreground">
                      Toca <strong>"Instalar"</strong> o <strong>"Añadir"</strong> en el banner.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-green-600 dark:bg-green-700 shrink-0">3</Badge>
                    <p className="text-xs text-muted-foreground">
                      Si no ves el banner, toca el menú ⋮ (tres puntos verticales) en la esquina superior derecha.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-green-600 dark:bg-green-700 shrink-0">4</Badge>
                    <p className="text-xs text-muted-foreground">
                      Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a la pantalla de inicio"</strong>.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="bg-green-600 dark:bg-green-700 shrink-0">5</Badge>
                    <p className="text-xs text-muted-foreground">
                      Confirma la instalación. El ícono aparecerá en tu pantalla de inicio o cajón de aplicaciones.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-3 mb-3">
                  <Navigation className="h-6 w-6 text-orange-600 dark:text-orange-500" />
                  <h5 className="font-medium text-orange-900 dark:text-orange-100">Firefox, Samsung Internet, Edge</h5>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Proceso similar a Chrome:
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• Busca el menú del navegador (usualmente ⋮ o ☰)</li>
                  <li>• Selecciona "Añadir a la pantalla de inicio" o "Instalar"</li>
                  <li>• Algunos navegadores pueden mostrar un banner automático</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3 flex items-center gap-2">
              <Tablet className="h-5 w-5" />
              Tablets (iPad, Android Tablet)
            </h4>
            <div className="p-4 rounded-lg bg-cyan-50 dark:bg-cyan-950/20 border border-cyan-200 dark:border-cyan-800">
              <p className="text-sm text-muted-foreground mb-2">
                El proceso en tablets es idéntico al de teléfonos:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                <li>• <strong>iPad:</strong> Usa Safari y sigue los pasos de iOS</li>
                <li>• <strong>Android Tablet:</strong> Usa Chrome y sigue los pasos de Android</li>
                <li>• Las tablets ofrecen una experiencia aún mejor gracias a la pantalla más grande</li>
              </ul>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Botón de Instalación Rápida</h4>
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border">
              <p className="text-sm text-muted-foreground mb-4">
                Si tu navegador lo soporta, puedes instalar directamente usando este botón:
              </p>
              <div className="flex flex-col items-center gap-3">
                <PWAInstallButton size="lg" />
                <p className="text-xs text-muted-foreground text-center">
                  El botón aparece solo si la instalación es posible en tu dispositivo
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Cómo Verificar que está Instalada</h4>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
                <h5 className="font-medium text-sm mb-2 text-green-900 dark:text-green-100">Ícono Visible</h5>
                <p className="text-xs text-muted-foreground">
                  Deberías ver el ícono de Flex Calendar en tu pantalla de inicio, escritorio o lista de aplicaciones.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                <h5 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">Ventana Independiente</h5>
                <p className="text-xs text-muted-foreground">
                  Al abrir, la app se ejecuta en ventana propia sin barra de direcciones del navegador.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                <h5 className="font-medium text-sm mb-2 text-purple-900 dark:text-purple-100">Carga Rápida</h5>
                <p className="text-xs text-muted-foreground">
                  La app carga casi instantáneamente, incluso con conexión lenta.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
                <h5 className="font-medium text-sm mb-2 text-yellow-900 dark:text-yellow-100">Lista de Apps</h5>
                <p className="text-xs text-muted-foreground">
                  En la lista de aplicaciones instaladas de tu sistema (Alt+Tab en Windows, Cmd+Tab en Mac).
                </p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Desinstalar la App</h4>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <h5 className="font-medium text-sm mb-2 text-red-900 dark:text-red-100">En Escritorio</h5>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• <strong>Windows:</strong> Configuración → Apps → Busca "Flex Calendar" → Desinstalar</li>
                  <li>• <strong>Mac:</strong> Busca el ícono → Click derecho → Eliminar</li>
                  <li>• <strong>Chrome/Edge:</strong> chrome://apps → Click derecho en Flex Calendar → Eliminar</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                <h5 className="font-medium text-sm mb-2 text-red-900 dark:text-red-100">En Móvil</h5>
                <ul className="text-xs text-muted-foreground space-y-1 ml-4">
                  <li>• <strong>iOS:</strong> Mantén presionado el ícono → "Eliminar app"</li>
                  <li>• <strong>Android:</strong> Mantén presionado → Arrastrar a "Desinstalar" o ve a Configuración → Apps</li>
                </ul>
              </div>
            </div>
          </div>

          <HelpTip title="Compatibilidad de Navegadores">
            <strong>Mejor soporte:</strong> Chrome, Edge (Chromium), Safari 11.3+<br/>
            <strong>Soporte parcial:</strong> Firefox, Samsung Internet, Opera<br/>
            <strong>No soportado:</strong> Internet Explorer, versiones antiguas de navegadores
          </HelpTip>
        </CardContent>
      </Card>
    </div>
  )
}
