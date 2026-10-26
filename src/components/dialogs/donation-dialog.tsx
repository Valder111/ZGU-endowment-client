import { useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogClose,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useSite } from '@/hooks/use-site';
export function DonationDialog() {
  const { donationOpen, setDonationOpen } = useSite();
  const opener = useRef<HTMLElement | null>(null);
  return (
    <Dialog open={donationOpen} onOpenChange={setDonationOpen}>
      <DialogContent
        variant="brand"
        showCloseButton={false}
        onOpenAutoFocus={() => {
          opener.current =
            document.activeElement instanceof HTMLElement
              ? document.activeElement
              : null;
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault();
          opener.current?.focus();
        }}
      >
        <DialogClose className="close" aria-label="Закрыть">
          ×
        </DialogClose>
        <span className="eyebrow">ВАШ ВКЛАД В БУДУЩЕЕ</span>
        <DialogTitle className="text-[35px] leading-[1.12] font-medium tracking-[-.05em] max-[760px]:text-[29px]">
          Спасибо за желание поддержать!
        </DialogTitle>
        <DialogDescription className="text-[15px] leading-[1.9] text-[#5d7586]">
          Форма пожертвования скоро появится. Сейчас это заглушка — платёж не
          производится.
        </DialogDescription>
        <DialogClose asChild>
          <Button variant="brand">
            Понятно <span aria-hidden="true">↗</span>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
