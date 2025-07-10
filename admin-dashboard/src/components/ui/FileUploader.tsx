import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PhotoIcon, XMarkIcon, ArrowsUpDownIcon } from '@heroicons/react/24/outline'
import { cn } from '@/lib/utils'

export interface FileItem {
  id: string
  file?: File
  url: string
  name: string
  size?: number
  type?: string
}

interface FileUploaderProps {
  value?: FileItem[]
  onChange?: (files: FileItem[]) => void
  maxFiles?: number
  accept?: Record<string, string[]>
  maxSize?: number
  label?: string
  error?: string
  disabled?: boolean
  className?: string
}

interface SortableFileItemProps {
  file: FileItem
  onRemove: (id: string) => void
}

const SortableFileItem: React.FC<SortableFileItemProps> = ({ file, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: file.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isImage = file.type?.startsWith('image/') || file.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border-2 border-dashed border-gray-300 p-3",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {isImage ? (
            <img
              src={file.url}
              alt={file.name}
              className="h-16 w-16 rounded-md object-cover"
            />
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gray-100">
              <PhotoIcon className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
          {file.size && (
            <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            {...attributes}
            {...listeners}
            className="p-1 text-gray-400 hover:text-gray-600"
          >
            <ArrowsUpDownIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onRemove(file.id)}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export const FileUploader: React.FC<FileUploaderProps> = ({
  value = [],
  onChange,
  maxFiles = 10,
  accept = { 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] },
  maxSize = 5 * 1024 * 1024, // 5MB
  label,
  error,
  disabled,
  className,
}) => {
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled) return

    setUploading(true)
    try {
      const newFiles: FileItem[] = acceptedFiles.map((file) => ({
        id: Math.random().toString(36).substring(7),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        type: file.type,
      }))

      const updatedFiles = [...value, ...newFiles].slice(0, maxFiles)
      onChange?.(updatedFiles)
    } finally {
      setUploading(false)
    }
  }, [value, onChange, maxFiles, disabled])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    disabled: disabled || uploading,
    maxFiles: maxFiles - value.length,
  })

  const removeFile = (id: string) => {
    const updatedFiles = value.filter((file) => file.id !== id)
    onChange?.(updatedFiles)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((file) => file.id === active.id)
      const newIndex = value.findIndex((file) => file.id === over.id)
      
      const reorderedFiles = arrayMove(value, oldIndex, newIndex)
      onChange?.(reorderedFiles)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-blue-400 bg-blue-50"
            : error
            ? "border-red-300 bg-red-50"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {isDragActive
              ? "Přetáhněte soubory sem..."
              : "Klikněte nebo přetáhněte soubory sem"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Podporované formáty: PNG, JPG, GIF až {Math.round(maxSize / 1024 / 1024)}MB
          </p>
          {maxFiles > 1 && (
            <p className="text-xs text-gray-500">
              Můžete nahrát až {maxFiles} souborů ({value.length}/{maxFiles})
            </p>
          )}
        </div>
      </div>

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={value.map(f => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {value.map((file) => (
                <SortableFileItem
                  key={file.id}
                  file={file}
                  onRemove={removeFile}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {uploading && (
        <p className="text-sm text-blue-600">Nahrávání souborů...</p>
      )}
    </div>
  )
} 