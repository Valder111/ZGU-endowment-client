export type ArtworkScene =
  | 'students'
  | 'science'
  | 'campus'
  | 'alumni'
  | 'endowment'
  | 'contacts'
  | 'questions'
  | 'events'
  | 'documents'
  | 'news';

function Scene({ scene }: { scene: ArtworkScene }) {
  switch (scene) {
    case 'students':
      return (
        <>
          <path
            className="art-fill"
            d="M126 172q57-30 114 0 57-30 114 0v102q-57-30-114 0-57-30-114 0Z"
          />
          <path d="M240 172v102m-91-78q34-13 68 0m-68 22q34-13 68 0m46-22q34-13 68 0m-68 22q34-13 68 0" />
          <g className="art-float">
            <path className="art-fill" d="m126 111 114-43 114 43-114 43Z" />
            <path d="M170 128v24q70 39 140 0v-24m44-17v58" />
            <circle className="art-accent-fill" cx="354" cy="176" r="6" />
          </g>
          <path
            className="art-accent"
            d="m106 250-25 25m0-20v20h20m267-87 23-23m-23 0h23v23"
          />
        </>
      );
    case 'science':
      return (
        <>
          <g className="art-spin">
            <ellipse cx="240" cy="180" rx="119" ry="43" />
            <ellipse
              cx="240"
              cy="180"
              rx="119"
              ry="43"
              transform="rotate(60 240 180)"
            />
            <ellipse
              cx="240"
              cy="180"
              rx="119"
              ry="43"
              transform="rotate(120 240 180)"
            />
            <circle className="art-accent-fill" cx="359" cy="180" r="7" />
            <circle className="art-accent-fill" cx="180" cy="77" r="5" />
          </g>
          <circle className="art-fill" cx="240" cy="180" r="25" />
          <circle className="art-accent-fill" cx="240" cy="180" r="8" />
          <path d="M114 266h48m-24-12v24m185-177h40m-20-20v40" />
        </>
      );
    case 'campus':
      return (
        <>
          <path
            className="art-fill"
            d="M144 269V132l104-37v174Zm104 0V95l84 31v143Zm84-104 45 17v87h-45Z"
          />
          <path d="M116 269h280M165 150l14-5v20l-14 5Zm34-12 14-5v20l-14 5Zm-34 47 14-5v20l-14 5Zm34-12 14-5v20l-14 5Zm-34 47 14-5v20l-14 5Zm34-12 14-5v20l-14 5ZM270 136l16 6v22l-16-6Zm28 10 16 6v22l-16-6Zm-28 31 16 6v22l-16-6Zm28 10 16 6v22l-16-6Zm-30 82v-39l36 13v26m42-65 17 6m-17 15 17 6" />
          <g className="art-float">
            <path className="art-accent" d="M100 230v-67m-20 22 20-22 20 22" />
            <circle className="art-accent-fill" cx="100" cy="243" r="4" />
          </g>
        </>
      );
    case 'alumni':
      return (
        <>
          <g transform="translate(70 40) scale(1.7)">
            <CommunityPeople />
          </g>
          <path
            className="art-accent"
            d="M136 270q104 35 208 0m-6-9 6 9-10 3"
          />
        </>
      );
    case 'endowment':
      return (
        <>
          <circle className="art-fill" cx="240" cy="180" r="86" />
          <circle cx="240" cy="180" r="72" />
          <path
            className="art-accent"
            d="M240 224v-81m0 43c-31 0-46-16-46-39 30 0 46 14 46 39Zm0-19c0-27 17-44 46-44 0 27-17 44-46 44Z"
          />
          <path d="M210 224h60" />
          <path
            className="art-accent"
            d="M123 207a121 121 0 0 1 179-132m-5-18 5 18-18 4M357 153a121 121 0 0 1-179 132m5 18-5-18 18-4"
          />
        </>
      );
    case 'contacts':
      return (
        <>
          <path d="m72 248 51-79 29 31 39-73 31 57 31-30 59 94m-182-62 9 10 9-2m34-34 9 12 9-6" />
          <path
            className="art-fill"
            d="M130 276v-65h47v65m8 0V170h53v106m10 0v-82h64v82m0-42h39v42Z"
          />
          <path d="M104 276h275m-234-49h16m-16 16h16m39-56h22m-22 17h22m-22 17h22m-22 17h22m40-27h34m-34 18h34m-34 18h34" />
          <g className="art-float">
            <path
              className="art-fill"
              d="M350 127c0 30-35 62-35 62s-35-32-35-62a35 35 0 1 1 70 0Z"
            />
            <circle className="art-accent" cx="315" cy="127" r="12" />
          </g>
          <path className="art-flow" d="M315 200q99 65-28 97" />
        </>
      );
    case 'questions':
      return (
        <>
          <path
            className="art-fill"
            d="M137 100h154a17 17 0 0 1 17 17v95a17 17 0 0 1-17 17h-87l-48 34v-34h-19a17 17 0 0 1-17-17v-95a17 17 0 0 1 17-17Z"
          />
          <path d="M329 156h25a17 17 0 0 1 17 17v83a17 17 0 0 1-17 17h-12v25l-37-25h-69a17 17 0 0 1-17-17v-7" />
          <path
            className="art-accent"
            d="M195 145a22 22 0 1 1 37 17c-12 7-18 11-18 22"
          />
          <circle className="art-accent-fill" cx="214" cy="202" r="3" />
          <path d="M284 204h51m-51 19h51m-51 19h29" />
        </>
      );
    case 'events':
      return (
        <>
          <rect
            className="art-fill"
            x="135"
            y="103"
            width="211"
            height="172"
            rx="15"
          />
          <path d="M135 151h211m-164-67v39m116-39v39" />
          {[0, 1, 2].map((row) =>
            [0, 1, 2, 3].map((col) => (
              <rect
                key={`${row}-${col}`}
                x={167 + col * 43}
                y={173 + row * 30}
                width="12"
                height="12"
                rx="3"
                className={row === 1 && col === 2 ? 'art-accent-fill' : ''}
              />
            )),
          )}
          <g className="art-float">
            <circle className="art-fill" cx="349" cy="260" r="41" />
            <path className="art-accent" d="m331 260 12 12 25-27" />
          </g>
          <path
            className="art-accent"
            d="m92 140 18 0m-9-9v18m264-64h24m-12-12v24"
          />
        </>
      );
    case 'documents':
      return (
        <>
          <path d="m145 123-24 7 39 163 146-35-5-21m-139-137-20 2 16 177 153-14-2-21" />
          <path className="art-fill" d="M177 83h111l38 38v139H177Z" />
          <path d="M288 83v38h38m-124 35h96m-96 24h96m-96 24h57m-57-73h42" />
          <g className="art-float">
            <circle className="art-fill" cx="320" cy="254" r="37" />
            <path className="art-accent" d="m303 253 11 12 23-26" />
          </g>
        </>
      );
    case 'news':
      return (
        <>
          <path className="art-fill" d="M121 112h221v152H121Z" />
          <path d="M342 136h20v129a16 16 0 0 1-16 16H137a16 16 0 0 1-16-16" />
          <path className="art-fill" d="M143 136h84v65h-84Z" />
          <path d="m144 185 24-28 22 22 16-14 20 20m23-45h68m-68 19h68m-68 19h46m-151 44h174m-174 19h174" />
          <path className="art-accent" d="m300 79 19-19m-19 0h19v19" />
        </>
      );
  }
}

export function EditorialArtwork({ scene }: { scene: ArtworkScene }) {
  return (
    <svg
      className={`editorial-artwork artwork-${scene}`}
      viewBox="0 0 480 360"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g className="art-construction">
        <circle cx="240" cy="180" r="151" />
        <circle cx="240" cy="180" r="135" strokeDasharray="2 7" />
        <path d="M41 180h50m298 0h50M240 10v32m0 276v32m-152-22h35m-17-17v35m271-308h25m-13-13v25" />
        <ellipse
          cx="240"
          cy="180"
          rx="191"
          ry="89"
          transform="rotate(-27 240 180)"
        />
      </g>
      <g className="art-scene">
        <Scene scene={scene} />
      </g>
      <g className="art-spark">
        <path d="m365 64 4-12 4 12 12 4-12 4-4 12-4-12-12-4Z" />
        <circle cx="106" cy="286" r="4" />
      </g>
    </svg>
  );
}
import { CommunityPeople } from '@/assets/svg/community-people';
