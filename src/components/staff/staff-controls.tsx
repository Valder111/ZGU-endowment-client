import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

export function StaffFeedback({
  error,
  notice,
}: {
  error?: string;
  notice?: string;
}) {
  return (
    <>
      {error && (
        <p className="staff-error" role="alert">
          {error}
        </p>
      )}
      <p className="staff-notice" role="status">
        {notice}
      </p>
    </>
  );
}

export function StaffLoad({
  loading,
  error,
  reload,
  children,
}: {
  loading: boolean;
  error?: string;
  reload: () => void;
  children: ReactNode;
}) {
  if (loading) return <p role="status">Загрузка…</p>;
  if (error) {
    return (
      <div className="staff-load">
        <StaffFeedback error={error} />
        <Button variant="outline" onClick={reload}>
          Повторить
        </Button>
      </div>
    );
  }
  return children;
}

export type StaffListRow = {
  id: string;
  title: string;
  subtitle?: string;
  category?: string;
  status: string;
  tone?: 'positive' | 'neutral';
};

export function StaffList({
  rows,
  search,
  onSearch,
  activeId,
  onSelect,
  disabled,
}: {
  rows: StaffListRow[];
  search: string;
  onSearch: (value: string) => void;
  activeId?: string;
  onSelect: (id: string) => void;
  disabled: boolean;
}) {
  const term = search.trim().toLocaleLowerCase('ru');
  const visible = rows.filter((row) =>
    [row.title, row.subtitle, row.category, row.status]
      .join(' ')
      .toLocaleLowerCase('ru')
      .includes(term),
  );
  return (
    <>
      <label className="staff-field">
        Поиск по списку
        <input
          type="search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
        />
      </label>
      {visible.length ? (
        <ul className="staff-records">
          {visible.map((row) => (
            <li key={row.id}>
              <button
                type="button"
                aria-current={row.id === activeId ? 'true' : undefined}
                disabled={disabled}
                onClick={() => onSelect(row.id)}
              >
                <span>
                  <strong>{row.title}</strong>
                  {row.category && <small>{row.category}</small>}
                  {row.subtitle && <small>{row.subtitle}</small>}
                </span>
                <span className="staff-badge" data-tone={row.tone}>
                  {row.status}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="staff-empty">
          {rows.length
            ? 'По вашему запросу ничего не найдено.'
            : 'В этом разделе пока нет записей.'}
        </p>
      )}
    </>
  );
}
