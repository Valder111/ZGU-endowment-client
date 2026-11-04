import { Button } from '@/components/ui/button';
import { useSite } from '@/hooks/use-site';
export function DonateButton({ label = 'Сделать вклад' }: { label?: string }) {
  const { openDonation } = useSite();
  return (
    <Button
      variant="brand"
      onClick={(event) => {
        event.currentTarget.focus({ preventScroll: true });
        openDonation();
      }}
      aria-haspopup="dialog"
    >
      {label} <span aria-hidden="true">↗</span>
    </Button>
  );
}
