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
import { SiteLink } from '@/components/elements/site-link';
import { siteConfig } from '@/configs/site';
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
          Поддержим будущее университета
        </DialogTitle>
        <DialogDescription className="text-[15px] leading-[1.9] text-[#5d7586]">
          Приём пожертвований ещё не открыт: платёж не производится. Выберите
          направление и&nbsp;обсудите удобный формат участия.
        </DialogDescription>
        <div className="donation-routes">
          <DialogClose asChild>
            <SiteLink href="/how-to-support/" className="button primary">
              Как поддержать ↗
            </SiteLink>
          </DialogClose>
          <DialogClose asChild>
            <SiteLink href="/project/all-project/" className="text-link">
              Выбрать целевой капитал ↗
            </SiteLink>
          </DialogClose>
          <a
            href={`mailto:${siteConfig.email}?subject=${encodeURIComponent('Хочу поддержать эндаумент-фонд ЗГУ')}`}
            className="text-link"
          >
            Обсудить участие по почте ↗
          </a>
        </div>
        <DialogClose asChild>
          <Button variant="brand">
            Понятно <span aria-hidden="true">↗</span>
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
