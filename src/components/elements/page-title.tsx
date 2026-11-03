import { SiteLink } from '@/components/elements/site-link';
import {
  EditorialArtwork,
  type ArtworkScene,
} from '@/assets/svg/editorial-artwork';
export function PageTitle({
  title,
  eyebrow,
  scene = 'endowment',
  className,
}: {
  title: string;
  eyebrow: string;
  scene?: ArtworkScene;
  className?: string;
}) {
  return (
    <section className={className ? `page-title ${className}` : 'page-title'}>
      <div className="wrap">
        <div className="page-title-art">
          <EditorialArtwork scene={scene} />
        </div>
        <SiteLink href="/" className="breadcrumb">
          Главная /
        </SiteLink>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
      </div>
    </section>
  );
}
