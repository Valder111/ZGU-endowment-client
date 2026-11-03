import { useRef, useState, useId } from 'react';
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
import {
  CapitalSelect,
  generalCapital,
} from '@/components/elements/capital-select';
import { formatNumber } from '@/utils/typography';
export function DonationDialog() {
  const { donationOpen, setDonationOpen } = useSite();
  const opener = useRef<HTMLElement | null>(null);
  const id = useId();
  const [amount, setAmount] = useState('1000');
  const [direction, setDirection] = useState(generalCapital);
  const [frequency, setFrequency] = useState('Разово');
  const validAmount = Number(amount) > 0 && Number.isFinite(Number(amount));
  const enquiryHref = `mailto:${siteConfig.email}?subject=${encodeURIComponent('Участие в Эндаумент-фонде ЗГУ')}&body=${encodeURIComponent(`Здравствуйте!\n\nХочу обсудить пожертвование в размере ${amount} рублей.\nФормат: ${frequency}.\nНаправление: ${direction}.\n\nПрошу уточнить условия, договор и реквизиты.\n\nМой вопрос: `)}`;
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
          Выберите сумму и&nbsp;близкое направление. Поможем согласовать
          условия, договор и&nbsp;реквизиты. Заявка по&nbsp;почте
          не&nbsp;списывает средства.
        </DialogDescription>
        <div
          className="donation-frequency"
          role="group"
          aria-label="Периодичность участия"
        >
          {['Разово', 'Регулярно'].map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={frequency === option}
              onClick={() => setFrequency(option)}
            >
              {option}
            </button>
          ))}
        </div>
        <div
          className="donation-amounts"
          role="group"
          aria-label="Выберите сумму"
        >
          {[300, 500, 1000, 3000, 10000].map((value) => (
            <button
              type="button"
              key={value}
              aria-pressed={Number(amount) === value}
              onClick={() => setAmount(String(value))}
            >
              {formatNumber(value)} ₽
            </button>
          ))}
        </div>
        <div className="donation-fields">
          <label htmlFor={`${id}-amount`}>Ваша сумма, рублей</label>
          <input
            id={`${id}-amount`}
            type="number"
            min="1"
            step="1"
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          <label htmlFor={`${id}-direction`}>Направление поддержки</label>
          <CapitalSelect
            id={`${id}-direction`}
            value={direction}
            onValueChange={setDirection}
          />
        </div>
        <a
          className="button primary donation-enquiry"
          href={validAmount ? enquiryHref : undefined}
          aria-disabled={!validAmount}
          onClick={(event) => {
            if (!validAmount) event.preventDefault();
          }}
        >
          Обсудить вклад <span aria-hidden="true">↗</span>
        </a>
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
