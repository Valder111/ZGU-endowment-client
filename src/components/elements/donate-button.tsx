import { Button } from '@/components/ui/button';
import { useSite } from '@/hooks/use-site';
export function DonateButton() {
  const { setDonationOpen } = useSite();
  return (
    <Button
      variant="brand"
      onClick={(event) => {
        event.currentTarget.focus({ preventScroll: true });
        setDonationOpen(true);
      }}
      aria-haspopup="dialog"
    >
      Сделать вклад <span aria-hidden="true">↗</span>
    </Button>
  );
}
