import { Label } from "~/components/ui/label"
import { Input } from "~/components/ui/input"
import { Textarea } from "~/components/ui/textarea"
import { Slider } from "~/components/ui/slider"
import { Badge } from "~/components/ui/badge"

interface TaskBasicInfoProps {
  name: string
  description: string
  importance: number
  targetTimeConsumption: number | undefined
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onImportanceChange: (value: number) => void
  onTargetTimeChange: (value: number | undefined) => void
}

export function TaskBasicInfo({
  name,
  description,
  importance,
  targetTimeConsumption,
  onNameChange,
  onDescriptionChange,
  onImportanceChange,
  onTargetTimeChange,
}: TaskBasicInfoProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name" className="text-foreground">
          Nombre *
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="Nombre de la tarea"
          required
          className="mt-1.5"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-foreground">
          Descripción
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Descripción opcional"
          rows={3}
          className="mt-1.5"
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <Label className="text-foreground">Importancia</Label>
          <Badge variant="outline" className="font-mono">
            {importance}/10
          </Badge>
        </div>
        <Slider
          value={[importance]}
          onValueChange={([value]) => onImportanceChange(value!)}
          min={1}
          max={10}
          step={1}
          className="mt-2 cursor-pointer"
        />
      </div>

      <div>
        <Label htmlFor="targetTimeConsumption" className="text-foreground">
          Tiempo Objetivo (horas) - Opcional
        </Label>
        <Input
          id="targetTimeConsumption"
          type="number"
          min="0.5"
          step="0.5"
          value={targetTimeConsumption || ""}
          onChange={(e) =>
            onTargetTimeChange(e.target.value ? Number.parseFloat(e.target.value) : undefined)
          }
          placeholder="Ej: 2.5 horas"
          className="mt-1.5"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Tiempo estimado que debería tomar completar esta tarea
        </p>
      </div>
    </div>
  )
}
