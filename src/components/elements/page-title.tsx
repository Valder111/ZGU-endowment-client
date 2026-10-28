import { SiteLink } from '@/components/elements/site-link';
import {
  EditorialArtwork,
  type ArtworkScene,
} from '@/assets/svg/editorial-artwork';
export function PageTitle({
  title,
  eyebrow,
  scene = 'endowment',
}: {
  title: string;
  eyebrow: string;
  scene?: ArtworkScene;
}) {
  return (
    <section className="page-title">
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
