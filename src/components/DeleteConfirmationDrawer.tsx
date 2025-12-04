import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Trash2 } from 'lucide-react';

interface DeleteConfirmationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

export function DeleteConfirmationDrawer({
  open,
  onOpenChange,
  onConfirm,
  title = 'Deletar item?',
  description = 'Esta ação não pode ser desfeita.',
}: DeleteConfirmationDrawerProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="text-center">
          <div className="mx-auto mb-2 p-3 rounded-full bg-destructive/10 w-fit">
            <Trash2 className="h-6 w-6 text-destructive" />
          </div>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>{description}</DrawerDescription>
        </DrawerHeader>
        <DrawerFooter className="flex-row gap-3 pb-8">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleConfirm}>
            Deletar
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
