import { useId, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

const stars = [
  [55, 49],
  [119, 86],
  [161, 38],
  [220, 71],
  [294, 43],
  [362, 79],
  [404, 29],
  [481, 65],
  [538, 37],
];
const windows = [
  [122, 202],
  [144, 202],
  [122, 225],
  [144, 225],
  [203, 171],
  [226, 171],
  [203, 195],
  [226, 195],
  [203, 219],
  [226, 219],
  [305, 194],
  [329, 194],
  [305, 218],
  [329, 218],
  [399, 215],
  [420, 215],
];

export function PolarPostcard() {
  const [night, setNight] = useState(false);
  const instanceId = useId();
  return (
    <figure className="polar-postcard" data-night={night}>
      <div
        className="polar-picture"
        id={`${instanceId}-picture`}
        role="img"
        aria-label={
          night
            ? 'Условная панорама северного города: полярная ночь, звёзды и северное сияние'
            : 'Условная панорама северного города: полярный день, солнце и горы'
        }
      >
        <svg
          viewBox="0 0 600 340"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <rect className="polar-sky" width="600" height="340" rx="18" />
          <g className="polar-stars">
            {stars.map(([x, y], index) => (
              <g key={index}>
                <path d={`M${x} ${y! - 3}v6m-3-3h6`} />
                <circle cx={x} cy={y} r="1" />
              </g>
            ))}
          </g>
          <g className="polar-aurora">
            <path d="M25 117C140 3 211 161 322 62s192 7 257-29" />
            <path d="M13 144C140 28 216 190 326 86s180 24 262-23" />
            <path d="M18 166C160 48 207 211 338 112s176 22 250-13" />
          </g>
          <g className="polar-sun">
            <circle cx="470" cy="92" r="30" />
            <circle cx="470" cy="92" r="44" />
            <path d="M470 31v-9m0 140v-9m-61-61h-9m140 0h-9m-104-43-7-7m100 100-7-7m0-86 7-7m-100 100 7-7" />
          </g>
          <g className="polar-moon">
            <path d="M479 62a31 31 0 1 0 29 45 28 28 0 0 1-29-45Z" />
          </g>
          <path
            className="polar-mountains-far"
            d="m0 243 90-122 58 68 85-103 90 117 58-59 100 101 65-82 54 67v110H0Z"
          />
          <path
            className="polar-mountains-near"
            d="m0 266 79-68 55 49 79-100 73 77 60-38 99 83 83-42 72 47v66H0Z"
          />
          <g className="polar-snowcaps">
            <path d="m187 116 46-30 45 59-45-23-19 8-15-12Zm-120 36 23-31 25 29-18-9-7 4-10-4Z" />
          </g>
          <g className="polar-city">
            <path d="M103 273V184h61v89m16 0V151h72v122m-56-122v-13h40v13m44 122V176h72v97m24 0v-69h66v69m0-38h40v38" />
            <path d="M97 274h402m-247-53h28m-28 23h28m74-28h22m-22 24h22" />
            {windows.map(([x, y], index) => (
              <rect
                className={`polar-window window-${index % 3}`}
                key={index}
                x={x}
                y={y}
                width="8"
                height="11"
                rx="1"
              />
            ))}
            <path d="M211 273v-20h18v20m79 0v-21h18v21" />
          </g>
          <path className="polar-ground" d="M0 298q150-21 300 0t300 0v42H0Z" />
          <path
            className="polar-ground-line"
            d="M65 300q85-10 170-2m135 3q80 10 160-2"
          />
        </svg>
        <span className="polar-picture-label">СЕВЕР В ДВУХ НАСТРОЕНИЯХ</span>
      </div>
      <figcaption>
        <span className="polar-state" role="status">
          {night ? 'Время северного сияния' : 'Свет, который остаётся'}
        </span>
        <div
          className="polar-controls"
          role="group"
          aria-label="Настроение северной иллюстрации"
        >
          <button
            type="button"
            aria-pressed={!night}
            aria-controls={`${instanceId}-picture`}
            onClick={() => setNight(false)}
          >
            <Sun size={16} aria-hidden="true" /> Полярный день
          </button>
          <button
            type="button"
            aria-pressed={night}
            aria-controls={`${instanceId}-picture`}
            onClick={() => setNight(true)}
          >
            <Moon size={16} aria-hidden="true" /> Полярная ночь
          </button>
        </div>
      </figcaption>
    </figure>
  );
}
