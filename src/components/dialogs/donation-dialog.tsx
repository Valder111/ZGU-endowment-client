import { useRef, useState, useId, type ChangeEvent } from 'react';
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
import { LegalLinks } from '@/components/elements/legal-links';
import { CapitalSelect } from '@/components/elements/capital-select';
import { formatNumber } from '@/utils/typography';
import {
  donationHref,
  parseDonationAmount,
  validPaymentTarget,
} from '@/api/payments';
import {
  donationProjectOptions,
  loadDonationProjects,
} from '@/api/donation-projects';
import { staffBase, staffResult } from '@/api/staff';
import { useStaffResource } from '@/hooks/requests/queries/use-staff-resource';
import { projects } from '@/constants/projects';
import { sitePath } from '@/utils/paths';
import {
  formatGroupedAmountChange,
  groupAmountDigits,
} from '@/utils/grouped-amount';

function focusCustomAmount(input: HTMLInputElement | null) {
  input?.focus();
}

const wholeRubles = /^(?:\d+|\d{1,3}(?:\.\d{3})+)$/;

function formatDonationInput(raw: string, requireCompleteGroups: boolean) {
  const spaced = raw.trim().replace(/[ \u00a0\u202f]/g, '.');
  if (requireCompleteGroups && !wholeRubles.test(spaced)) return raw;
  const digits = spaced.replace(/\./g, '');
  return /^\d*$/.test(digits) ? groupAmountDigits(digits) : raw;
}

export function DonationDialog() {
  const {
    donationOpen,
    setDonationOpen,
    donationDirection: direction,
    setDonationDirection: setDirection,
  } = useSite();
  const opener = useRef<HTMLElement | null>(null);
  const id = useId();
  const [preset, setPreset] = useState<number | null>(1000);
  const [customAmount, setCustomAmount] = useState('1.000');
  const [frequency, setFrequency] = useState('Разово');
  const { data: publishedProjects } = useStaffResource(
    staffResult,
    loadDonationProjects,
    Boolean(staffBase && donationOpen),
  );
  const projectOptions = donationProjectOptions(publishedProjects);
  const isDatabaseProject =
    direction.startsWith('project:') && validPaymentTarget(direction);
  const directionLabel = isDatabaseProject
    ? (projectOptions.find(({ value }) => value === direction)?.label ??
      'Проект фонда')
    : direction;
  const amount = preset ?? Number(customAmount.replace(/\./g, ''));
  const amountMinor = parseDonationAmount(
    preset !== null ? String(preset) : customAmount,
  );
  const validAmount =
    (preset !== null || wholeRubles.test(customAmount)) && amountMinor !== null;
  const project = projects.find(({ title }) => title === direction);
  const paymentHref = donationHref(
    isDatabaseProject
      ? direction
      : project
        ? `direction:${project.id}`
        : 'fund',
    validAmount ? amountMinor : undefined,
    frequency === 'Регулярно',
  );
  const enquiryHref = `mailto:${siteConfig.email}?subject=${encodeURIComponent('Участие в Эндаумент-фонде ЗГУ')}&body=${encodeURIComponent(`Здравствуйте!\n\nХочу обсудить пожертвование в размере ${amount} рублей.\nФормат: ${frequency}.\nНаправление: ${directionLabel}.\n\nПрошу уточнить условия, договор и реквизиты.\n\nМой вопрос: `)}`;

  function changeCustomAmount(event: ChangeEvent<HTMLInputElement>) {
    const typedSeparator =
      event.nativeEvent instanceof InputEvent && event.nativeEvent.data === '.';
    const unfinishedGroup =
      customAmount.includes('.') && !wholeRubles.test(customAmount);
    setCustomAmount(
      formatGroupedAmountChange(event, (raw, pasted) =>
        formatDonationInput(raw, pasted || typedSeparator || unfinishedGroup),
      ),
    );
  }

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
        <div className="donation-heading">
          <span className="eyebrow">ВАШ ВКЛАД В БУДУЩЕЕ</span>
          <DialogTitle className="donation-title text-[clamp(24px,2.5vw,34px)] leading-[1.16] font-medium tracking-[-.035em]">
            Поддержим будущее университета
          </DialogTitle>
          <DialogClose className="donation-close" aria-label="Закрыть">
            ×
          </DialogClose>
        </div>
        <div className="donation-body">
          <DialogDescription className="donation-description text-[15px] leading-[1.7] text-[#486779]">
            Выберите сумму и&nbsp;направление поддержки. На&nbsp;следующем шаге
            можно проверить данные и&nbsp;перейти к&nbsp;оплате.
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
                aria-pressed={preset === value}
                onClick={() => setPreset(value)}
              >
                {formatNumber(value)} ₽
              </button>
            ))}
            <button
              type="button"
              aria-pressed={preset === null}
              aria-expanded={preset === null}
              aria-controls={`${id}-custom-amount`}
              onClick={() => setPreset(null)}
            >
              Другая сумма
            </button>
          </div>
          <div className="donation-fields">
            <div
              id={`${id}-custom-amount`}
              className="donation-custom"
              hidden={preset !== null}
            >
              <label htmlFor={`${id}-amount`}>Другая сумма, рублей</label>
              {preset === null && (
                <input
                  id={`${id}-amount`}
                  ref={focusCustomAmount}
                  type="text"
                  inputMode="numeric"
                  value={customAmount}
                  aria-invalid={Boolean(customAmount) && !validAmount}
                  aria-describedby={
                    !validAmount && customAmount
                      ? `${id}-amount-error`
                      : undefined
                  }
                  onChange={changeCustomAmount}
                />
              )}
              {preset === null && customAmount && !validAmount && (
                <small
                  id={`${id}-amount-error`}
                  className="donation-amount-error"
                >
                  Укажите целую сумму от 100 ₽.
                </small>
              )}
            </div>
            <label htmlFor={`${id}-direction`}>Направление поддержки</label>
            <CapitalSelect
              id={`${id}-direction`}
              value={direction}
              onValueChange={setDirection}
              additionalOptions={projectOptions}
            />
          </div>
          <div className="donation-submit">
            <a
              className="button primary donation-checkout"
              href={validAmount ? sitePath(paymentHref) : undefined}
              aria-disabled={!validAmount}
              onClick={(event) => {
                if (!validAmount) event.preventDefault();
              }}
            >
              Перейти к оформлению <span aria-hidden="true">↗</span>
            </a>
            <div className="donation-documents">
              <span>Документы для жертвователя</span>
              <LegalLinks newTab />
            </div>
          </div>
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
              href={validAmount ? enquiryHref : undefined}
              className="text-link"
              aria-disabled={!validAmount}
              onClick={(event) => {
                if (!validAmount) event.preventDefault();
              }}
            >
              Обсудить участие по почте <span aria-hidden="true">↗</span>
            </a>
          </div>
          <DialogClose asChild>
            <Button variant="brand" className="donation-dismiss">
              Понятно <span aria-hidden="true">↗</span>
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}
