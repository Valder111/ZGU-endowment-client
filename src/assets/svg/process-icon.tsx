export type ProcessStage = 'contribution' | 'capital' | 'opportunities';

export function ProcessIcon({ stage }: { stage: ProcessStage }) {
  return (
    <svg
      className="process-icon"
      viewBox="0 0 96 96"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="process-icon-backdrop" cx="48" cy="48" r="43" />
      {stage === 'contribution' && (
        <>
          <circle cx="55" cy="29" r="13" />
          <path
            className="process-icon-accent"
            d="M55 21v16m-5-13h7a4 4 0 0 1 0 8h-7m0 3h10"
          />
          <path d="M18 58h13l12-9h13a6 6 0 0 1 0 12H44m-13-3 13 16h22l16-21a5 5 0 0 0-8-6L62 61M18 54v25h12V54Z" />
          <path
            className="process-icon-accent"
            d="M28 20v10m-5-5h10m39 8h7m-3-4v8"
          />
        </>
      )}
      {stage === 'capital' && (
        <>
          <path d="m22 36 26-16 26 16H22Zm3 5v27m15-27v27m16-27v27m15-27v27M20 69h56v9H20Z" />
          <circle className="process-icon-coin" cx="67" cy="63" r="16" />
          <path
            className="process-icon-accent"
            d="M67 72V55m0 9c-7 0-10-4-10-9 7 0 10 4 10 9Zm0-3c0-7 4-10 10-10 0 6-4 10-10 10Z"
          />
          <circle className="process-icon-accent-fill" cx="48" cy="29" r="2" />
        </>
      )}
      {stage === 'opportunities' && (
        <>
          <path d="M18 40q15-8 30 0 15-8 30 0v33q-15-8-30 0-15-8-30 0V40Zm30 0v33m-22-22q7-2 14 0m-14 9q7-2 14 0m16-9q7-2 14 0m-14 9q7-2 14 0" />
          <path
            className="process-icon-accent"
            d="m38 25 10-10 10 10M48 15v18m23-8h10m-5-5v10"
          />
        </>
      )}
    </svg>
  );
}
