import { useCallback, useRef, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { staffBase, type StaffRequest } from '@/api/staff';
import { collectionApi, isPublished } from '@/api/staff-content';
import type { RequestParams } from '@/api/generated/http-client';
import { useStaffResource } from '@/hooks/requests/queries/use-staff-resource';
import { documentCategories } from '@/constants/transparency';
import { Button } from '@/components/ui/button';
import {
  collections,
  dateLabel,
  statusLabels,
  type Collection,
} from './content-fields';
import { ContentEditor, type LeaveEditor } from './content-editor';
import { StaffFeedback, StaffList, StaffLoad } from './staff-controls';
import { StaffMedia } from './staff-media';
import { StaffDocumentFile } from './staff-document-file';

function readCategories(key: string): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? '[]');
    return Array.isArray(value)
      ? value.filter((entry): entry is string => typeof entry === 'string')
      : [];
  } catch {
    return [];
  }
}

export function ContentWorkspace({
  collection,
  request,
  userId,
  leaveRef,
}: {
  collection: Collection;
  request: StaffRequest;
  userId: string;
  leaveRef: LeaveEditor;
}) {
  const config = collections[collection];
  const api = collectionApi[collection];
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string>();
  const [notice, setNotice] = useState('');
  const categoryKey = `zgu:categories:${JSON.stringify([staffBase, userId, collection])}`;
  const [savedCategories, setSavedCategories] = useState(() =>
    readCategories(categoryKey),
  );
  const recentCategories = useRef(savedCategories);
  const recordId =
    selected && selected !== 'new' ? encodeURIComponent(selected) : '';
  const list = useStaffResource(request, api.list);
  const loadRecord = useCallback(
    (params: RequestParams) => api.detail(recordId, params),
    [api, recordId],
  );
  const detail = useStaffResource(request, loadRecord, Boolean(recordId));
  const records = list.data ?? [];
  const names = new Map<string, string>();
  for (const entry of [
    ...(collection === 'documents' ? documentCategories : []),
    detail.data?.category,
    ...records.map(({ category }) => category),
    ...savedCategories,
  ]) {
    const value = entry?.trim();
    if (value && !names.has(value.toLocaleLowerCase('ru')))
      names.set(value.toLocaleLowerCase('ru'), value);
  }
  const categories = [...names.values()].sort((first, second) =>
    first.localeCompare(second, 'ru'),
  );

  function rememberCategory(raw: string) {
    const value = raw.trim();
    if (!value || [...value].length > 100) return;
    const key = value.toLocaleLowerCase('ru');
    const previous = recentCategories.current;
    if (previous.some((name) => name.toLocaleLowerCase('ru') === key)) return;
    const next = [...previous, value];
    recentCategories.current = next;
    setSavedCategories(next);
    try {
      localStorage.setItem(categoryKey, JSON.stringify(next));
    } catch {
      // The current editor still keeps the category list in memory.
    }
  }

  async function select(next: string) {
    if (next === selected) return;
    if (leaveRef.current && !(await leaveRef.current())) return;
    setNotice('');
    setSelected(next);
  }

  function onSaved(message: string, selection?: string | null) {
    setNotice(message);
    if (selection !== undefined) {
      if (selection === selected) detail.reload();
      else setSelected(selection ?? undefined);
    }
    list.reload();
  }

  return (
    <>
      <div className="staff-workspace-heading">
        <div>
          <h2>{config.label}</h2>
          <p>{list.data ? `Записей: ${records.length}` : 'Материалы фонда'}</p>
        </div>
        <div className="staff-actions">
          <Button
            variant="outline"
            disabled={list.loading}
            onClick={list.reload}
          >
            <RefreshCw /> Обновить
          </Button>
          <Button variant="brand" onClick={() => void select('new')}>
            <Plus /> {config.create}
          </Button>
        </div>
      </div>
      <StaffFeedback notice={notice} />
      <div className="staff-workbench">
        <section
          className="staff-card staff-list"
          aria-label={`Список: ${config.label.toLowerCase()}`}
        >
          <h3 className="staff-list-title">Записи раздела</h3>
          <StaffLoad {...list}>
            <StaffList
              rows={records.flatMap((row) => {
                if (!row.id) return [];
                const status = row[config.statusKey] ?? '';
                return [
                  {
                    id: row.id,
                    title: row[config.titleKey] ?? row.id,
                    subtitle: dateLabel(
                      row.starts_at ?? row.published_at ?? row.created_at,
                    ),
                    category: row.category,
                    status: statusLabels[status] ?? status,
                    tone: isPublished(collection, row) ? 'positive' : 'neutral',
                  },
                ];
              })}
              search={search}
              onSearch={setSearch}
              activeId={selected}
              onSelect={(id) => void select(id)}
              disabled={false}
            />
          </StaffLoad>
        </section>
        <div className="staff-editor">
          {!selected ? (
            <p className="staff-card staff-empty">
              Выберите запись из списка или создайте новую.
            </p>
          ) : (
            <StaffLoad {...detail}>
              {(detail.data || selected === 'new') && (
                <ContentEditor
                  key={selected}
                  collection={collection}
                  request={request}
                  item={detail.data}
                  categories={categories}
                  onRememberCategory={rememberCategory}
                  recoveryKey={JSON.stringify([
                    staffBase,
                    userId,
                    collection,
                    selected,
                  ])}
                  leaveRef={leaveRef}
                  onSaved={onSaved}
                />
              )}
            </StaffLoad>
          )}
          {recordId && detail.data && api.photos && (
            <StaffMedia
              key={recordId}
              request={request}
              recordId={recordId}
              api={api.photos}
            />
          )}
          {recordId && detail.data && collection === 'documents' && (
            <StaffDocumentFile
              key={recordId}
              request={request}
              recordId={recordId}
              filename={detail.data.original_filename}
            />
          )}
        </div>
      </div>
    </>
  );
}
