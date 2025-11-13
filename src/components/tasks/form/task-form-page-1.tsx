import { TaskBasicInfo } from "./task-basic-info"

interface TaskFormPage1Props {
  name: string
  description: string
  importance: number
  onNameChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onImportanceChange: (value: number) => void
}

export function TaskFormPage1({ 
  name,
  description,
  importance,
  onNameChange,
  onDescriptionChange,
  onImportanceChange 
}: TaskFormPage1Props) {
  return (
    <div className="space-y-6">
      {/* Basic Information Only - No dates here */}
      <TaskBasicInfo
        name={name}
        description={description}
        importance={importance}
        onNameChange={onNameChange}
        onDescriptionChange={onDescriptionChange}
        onImportanceChange={onImportanceChange}
      />
    </div>
  )
}
