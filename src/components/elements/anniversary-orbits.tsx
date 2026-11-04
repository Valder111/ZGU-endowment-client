import { useEffect, useId, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import fieldPhoto from '@/assets/images/editorial/anniversary-orbit-field.webp';
import geomechanicsPhoto from '@/assets/images/editorial/anniversary-orbit-geomechanics.webp';
import engineeringPhoto from '@/assets/images/editorial/anniversary-orbit-engineering.webp';

const orbits = [
  {
    label: 'Люди',
    caption: 'Летняя полевая школа',
    image: fieldPhoto,
    alt: 'Участники полевой школы с инструментами на практике',
    dimensions: [960, 640],
    radius: [221, 91],
    angle: -26,
  },
  {
    label: 'Наука',
    caption: 'Лаборатория геомеханики',
    image: geomechanicsPhoto,
    alt: 'Исследовательница работает с оборудованием в лаборатории геомеханики',
    dimensions: [960, 639],
    radius: [219, 106],
    angle: 27,
  },
  {
    label: 'Инженерия',
    caption: 'Инженерная практика',
    image: engineeringPhoto,
    alt: 'Студент работает с механической деталью в мастерской',
    dimensions: [800, 533],
    radius: [166, 130],
    angle: -69,
  },
] as const;

export function AnniversaryOrbits() {
  const id = useId();
  const [pinned, setPinned] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  const active = pinned;
  const photo = active === null ? null : orbits[active];

  useEffect(() => {
    if (active === null) return;
    function dismiss(event: KeyboardEvent) {
      if (event.key !== 'Escape') return;
      setPinned(null);
    }
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [active]);

  function selectOrbit(index: number) {
    setPinned((previous) => (previous === index ? null : index));
  }

  return (
    <div
      className="anniversary-orbits"
      aria-label="Созвездие ЗГУ – юбилейная фотогалерея"
      role="group"
    >
      <div
        className="orbit-sky"
        data-preview={photo !== null}
        data-paused={paused}
      >
        <span className="orbit-masthead" aria-hidden="true">
          СОЗВЕЗДИЕ ЗГУ / 69°20′ С. Ш.
        </span>
        <button
          className="orbit-motion"
          type="button"
          aria-label={
            paused ? 'Запустить движение орбит' : 'Остановить движение орбит'
          }
          onClick={() => setPaused((previous) => !previous)}
        >
          {paused ? (
            <Play size={16} aria-hidden="true" />
          ) : (
            <Pause size={16} aria-hidden="true" />
          )}
        </button>
        <div className="orbit-numeral" aria-hidden="true">
          <span>65</span>
          <small>ЛЕТ ОТКРЫТИЙ</small>
        </div>
        <svg className="orbit-map" viewBox="0 0 540 340" aria-hidden="true">
          <circle cx="270" cy="170" r="151" className="orbit-grid" />
          <path d="M270 26v288M56 170h428" className="orbit-grid" />
          {orbits.map(({ label, radius, angle }, index) => {
            const [rx, ry] = radius;
            return (
              <g className="orbit-tilt" data-orbit={index} key={label}>
                <g
                  transform={`rotate(${angle} 270 170)`}
                  data-active={active === index}
                  className="orbit-track"
                >
                  <ellipse
                    cx="270"
                    cy="170"
                    rx={rx}
                    ry={ry}
                    className="orbit-line"
                  />
                  <ellipse
                    cx="270"
                    cy="170"
                    rx={rx}
                    ry={ry}
                    pathLength="100"
                    className="orbit-light"
                  />
                  <ellipse
                    cx="270"
                    cy="170"
                    rx={rx}
                    ry={ry}
                    pathLength="100"
                    className="orbit-satellite"
                  />
                </g>
              </g>
            );
          })}
        </svg>
        <div className="orbit-photo-slot" id={`${id}-photo`} aria-live="polite">
          {photo && (
            <figure className="orbit-photo" key={photo.label}>
              <img
                src={photo.image}
                alt={photo.alt}
                width={photo.dimensions[0]}
                height={photo.dimensions[1]}
              />
              <figcaption>{photo.caption}</figcaption>
            </figure>
          )}
        </div>
        <span className="orbit-yearline" aria-hidden="true">
          1961 <i /> 2026
        </span>
      </div>
      <div className="orbit-controls">
        {orbits.map(({ label }, index) => (
          <button
            type="button"
            key={label}
            data-orbit={index}
            data-active={active === index}
            aria-pressed={pinned === index}
            aria-controls={`${id}-photo`}
            onClick={() => selectOrbit(index)}
          >
            <span className="orbit-control-dot" aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
