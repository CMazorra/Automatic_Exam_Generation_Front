// components/confirm-delete-dialog.tsx
import React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"

// Define las props que recibirá el diálogo
interface ConfirmDeleteDialogProps {
  isOpen?: boolean
  onClose?: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description: string | React.ReactNode
  confirmText?: string
  cancelText?: string
  isDeleting?: boolean // Para manejar el estado de carga del botón de confirmación
  children?: React.ReactNode // Elemento trigger (botón) que abrirá el diálogo
  buttonText?: string // Alias opcional para el texto de confirmación
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Eliminar",
  cancelText = "Cancelar",
  isDeleting = false,
  children,
  buttonText,
}) => {
  const [internalOpen, setInternalOpen] = React.useState(false)

  const open = isOpen ?? internalOpen
  const handleOpenChange = (nextOpen: boolean) => {
    if (isOpen === undefined) setInternalOpen(nextOpen)
    if (!nextOpen && onClose) onClose()
  }

  const handleConfirm = async () => {
    try {
      await onConfirm()
    } finally {
      if (isOpen === undefined) setInternalOpen(false)
      if (onClose) onClose()
    }
  }

  const finalConfirmText = isDeleting
    ? "Eliminando..."
    : (buttonText ?? confirmText)

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      {children ? (
        <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      ) : null}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => handleOpenChange(false)} 
              disabled={isDeleting}
            >
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              type="button" 
              variant="destructive" 
              onClick={handleConfirm} 
              disabled={isDeleting}
            >
              {finalConfirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}