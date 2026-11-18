import { useId, type ReactNode } from 'react';
import type { donationTargetOptions } from '@/api/donation-projects';

export function DonationTargetSelect({
  value,
  onChange,
  options,
  disabled = false,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  options: ReturnType<typeof donationTargetOptions>;
  disabled?: boolean;
  children?: ReactNode;
}) {
  const id = useId();
  const selected = options.find((option) => option.value === value);
  const hasProjects = options.length > 1 || value !== 'fund';
  return (
    <div
      className="donation-recipient"
      role="group"
      aria-label="Цель пожертвования"
    >
      {hasProjects ? (
        <>
          <label htmlFor={id}>Проект пожертвования</label>
          <select
            id={id}
            className="donation-project-select"
            value={value}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
          >
            <option value="fund">{options[0]?.label}</option>
            {!selected && (
              <option value={value} disabled>
                Выбранный проект недоступен
              </option>
            )}
            {options.length > 1 && (
              <optgroup label="Опубликованные проекты">
                {options.slice(1).map((option) => (
                  <option key={option.id} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </>
      ) : (
        <>
          <span>Цель пожертвования</span>
          <strong>{options[0]?.label}</strong>
        </>
      )}
      {children}
    </div>
  );
}
