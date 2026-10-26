import { SiteLink } from '@/components/elements/site-link';
export function PageTitle({
  title,
  eyebrow,
}: {
  title: string;
  eyebrow: string;
}) {
  return (
    <section className="page-title">
      <div className="wrap">
        <SiteLink href="/" className="breadcrumb">
          Главная /
        </SiteLink>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
    </section>
  );
}
