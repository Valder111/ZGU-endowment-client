import type { ReactElement } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export function StaffConfirm({
  trigger,
  title,
  description,
  label,
  onConfirm,
  danger = false,
  onOpenChange,
}: {
  trigger: ReactElement;
  title: string;
  description: string;
  label: string;
  onConfirm: () => void;
  danger?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <Dialog onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="staff-confirm" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Отмена</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant={danger ? 'destructive' : 'brand'}
              onClick={onConfirm}
            >
              {label}
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
