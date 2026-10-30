import { useId } from 'react';

export function CommunityGlobe({ active }: { active: number }) {
  const orbitId = useId();
  const orbitPath = 'M506 260a246 119 0 1 1-492 0 246 119 0 1 1 492 0';
  return (
    <div className="community-globe" data-active={active} aria-hidden="true">
      <svg className="globe-grid" viewBox="0 0 520 520" fill="none">
        <circle className="globe-halo" cx="260" cy="260" r="247" />
        <circle cx="260" cy="260" r="209" />
        <g className="globe-meridians">
          <circle cx="260" cy="260" r="177" />
          <ellipse cx="260" cy="260" rx="120" ry="177" />
          <ellipse cx="260" cy="260" rx="50" ry="177" />
          <ellipse cx="260" cy="260" rx="177" ry="58" />
          <path d="M107 172c84 38 222 38 306 0M107 348c84-38 222-38 306 0M83 260h354" />
        </g>
        <g className="globe-orbit-plane" transform="rotate(-34 260 260)">
          <path id={orbitId} className="globe-orbit" d={orbitPath} />
          <g className="globe-satellite globe-satellite-motion">
            <circle r="5" />
            <circle className="globe-satellite-ring" r="12" />
            <animateMotion dur="28s" repeatCount="indefinite" calcMode="paced">
              <mpath href={`#${orbitId}`} />
            </animateMotion>
          </g>
          <g
            className="globe-satellite globe-satellite-still"
            transform="translate(506 260)"
          >
            <circle r="5" />
            <circle className="globe-satellite-ring" r="12" />
          </g>
        </g>
        <path
          className={`globe-connection ${active === 0 ? 'is-active' : ''}`}
          d="M83 260Q172 82 354 108"
        />
        <path
          className={`globe-connection ${active === 1 ? 'is-active' : ''}`}
          d="M354 108Q482 270 366 402"
        />
        <path
          className={`globe-connection ${active === 2 ? 'is-active' : ''}`}
          d="M366 402Q142 452 83 260"
        />
        <circle className="globe-node" cx="83" cy="260" r="6" />
        <circle className="globe-node" cx="354" cy="108" r="6" />
        <circle className="globe-node" cx="366" cy="402" r="6" />
      </svg>
      <div className="community-mark">
        <span>
          69<sup>°</sup>
        </span>
        <small>СЕВЕРНОЙ ШИРОТЫ</small>
      </div>
      <span className="globe-tag globe-tag-top">ЗНАНИЯ</span>
      <span className="globe-tag globe-tag-left">ЛЮДИ</span>
      <span className="globe-tag globe-tag-bottom">ВОЗМОЖНОСТИ</span>
    </div>
  );
}
