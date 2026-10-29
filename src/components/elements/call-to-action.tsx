import { DonateButton } from '@/components/elements/donate-button';
export function CallToAction() {
  return (
    <section className="cta">
      <div className="wrap cta-inner">
        <div>
          <span className="eyebrow">ВМЕСТЕ С&nbsp;УНИВЕРСИТЕТОМ</span>
          <h2>
            Будущее ближе,
            <br />
            <em>когда мы&nbsp;вместе</em>
          </h2>
        </div>
        <DonateButton />
      </div>
    </section>
  );
}
