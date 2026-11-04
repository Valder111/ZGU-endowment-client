import { useState, type FormEvent } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import {
  staffRecordPath,
  type ContentRecord,
  type StaffRequest,
} from '@/api/staff';
import { useStaffResource } from '@/hooks/requests/queries/use-staff-resource';
import { useStaffAction } from '@/hooks/requests/mutations/use-staff-action';
import { Button } from '@/components/ui/button';
import {
  collections,
  contentPayload,
  statusLabels,
  type Collection,
} from './content-fields';
import { StaffFeedback, StaffList, StaffLoad } from './staff-controls';
import { StaffMedia } from './staff-media';

function dateLabel(value?: string) {
  return value
    ? new Date(value).toLocaleString('ru-RU', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';
}

export function ContentWorkspace({
  collection,
  request,
}: {
  collection: Collection;
  request: StaffRequest;
}) {
  const config = collections[collection];
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | 'new'>();
  const recordPath =
    selected && selected !== 'new'
      ? staffRecordPath(collection, selected)
      : null;
  const list = useStaffResource<ContentRecord[]>(request, `/${collection}`);
  const detail = useStaffResource<ContentRecord>(request, recordPath);
  const action = useStaffAction();
  const item = detail.data;
  const creating = selected === 'new';
  const fields = config.fields.filter(
    (field) => !field.mode || field.mode === (creating ? 'create' : 'edit'),
  );
  const recordStatus = item?.[config.statusKey];
  const transitionStatus =
    collection === 'events' ? item?.event_status : recordStatus;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void action.run(
      async () => {
        const body = contentPayload(fields, data, item);
        if (recordPath) {
          await request(recordPath, { method: 'PATCH', body });
          detail.reload();
        } else {
          const created = await request<ContentRecord>(`/${collection}`, {
            method: 'POST',
            body,
          });
          setSelected(created.id);
        }
        list.reload();
      },
      creating
        ? 'Запись создана. Фотографии можно добавить ниже.'
        : 'Изменения сохранены.',
    );
  }

  function perform(operation: 'transition' | 'delete') {
    if (!recordPath) return;
    const remove = operation === 'delete';
    if (
      !window.confirm(
        remove
          ? 'Удалить запись? Она исчезнет из списка.'
          : `${config.transition.label} эту запись?`,
      )
    )
      return;
    void action.run(
      async () => {
        await request(
          remove ? recordPath : `${recordPath}/${config.transition.path}`,
          {
            method: remove ? 'DELETE' : 'POST',
          },
        );
        if (remove) setSelected(undefined);
        else detail.reload();
        list.reload();
      },
      remove ? 'Запись удалена.' : 'Статус обновлён.',
    );
  }

  return (
    <>
      <div className="staff-workspace-heading">
        <div>
          <h2>{config.label}</h2>
          <p>
            {list.data
              ? `Записей в API: ${list.data.length}`
              : 'Материалы фонда'}
          </p>
        </div>
        <div className="staff-actions">
          <Button
            variant="outline"
            disabled={action.pending || list.loading}
            onClick={list.reload}
          >
            <RefreshCw /> Обновить
          </Button>
          <Button
            variant="brand"
            disabled={action.pending}
            onClick={() => setSelected('new')}
          >
            <Plus /> {config.create}
          </Button>
        </div>
      </div>
      <StaffFeedback error={action.error} notice={action.notice} />
      <div className="staff-workbench">
        <section
          className="staff-card staff-list"
          aria-label={`Список: ${config.label.toLowerCase()}`}
        >
          <StaffLoad {...list}>
            <StaffList
              rows={(list.data ?? []).map((row) => ({
                id: row.id,
                title: row[config.titleKey] ?? row.id,
                subtitle: dateLabel(
                  row.starts_at ?? row.published_at ?? row.created_at,
                ),
                status:
                  statusLabels[row[config.statusKey] ?? ''] ??
                  row[config.statusKey] ??
                  '',
                tone:
                  row[config.statusKey] === 'published'
                    ? 'positive'
                    : 'neutral',
              }))}
              search={search}
              onSearch={setSearch}
              activeId={selected}
              onSelect={setSelected}
              disabled={action.pending}
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
              {(item || creating) && (
                <form
                  className="staff-card staff-form"
                  key={`${selected}-${detail.revision}`}
                  onSubmit={save}
                >
                  <h3>{creating ? config.create : item?.[config.titleKey]}</h3>
                  {item && (
                    <div className="staff-record-meta">
                      <span className="staff-badge">
                        {statusLabels[recordStatus ?? ''] ?? recordStatus}
                      </span>
                      {item.event_status && (
                        <span className="staff-badge">
                          {statusLabels[item.event_status] ?? item.event_status}
                        </span>
                      )}
                      {item.currency && <span>{item.currency}</span>}
                      {item.starts_at && (
                        <span>Начало {dateLabel(item.starts_at)}</span>
                      )}
                      {item.ends_at && (
                        <span>Окончание {dateLabel(item.ends_at)}</span>
                      )}
                    </div>
                  )}
                  {creating && collection !== 'news' && (
                    <p className="staff-hint">
                      Укажите даты в часовом поясе устройства. Даты и статус
                      публикации задаются при создании.
                    </p>
                  )}
                  <fieldset disabled={action.pending}>
                    {fields.map((field) => {
                      const defaults =
                        item?.[field.key] ??
                        field.defaultValue ??
                        field.options?.[0] ??
                        '';
                      const required =
                        field.required && (creating || field.key !== 'type');
                      return (
                        <label className="staff-field" key={field.key}>
                          {field.label}
                          {field.options ? (
                            <select
                              name={field.key}
                              defaultValue={defaults}
                              required={required}
                            >
                              {field.options.map((status) => (
                                <option key={status} value={status}>
                                  {statusLabels[status]}
                                </option>
                              ))}
                            </select>
                          ) : field.kind === 'textarea' ? (
                            <textarea
                              name={field.key}
                              defaultValue={defaults}
                              rows={field.required ? 7 : 3}
                              required={required}
                            />
                          ) : (
                            <input
                              name={field.key}
                              type={
                                field.kind === 'datetime-local'
                                  ? field.kind
                                  : 'text'
                              }
                              inputMode={
                                field.kind === 'amount' ? 'decimal' : undefined
                              }
                              pattern={
                                field.kind === 'currency'
                                  ? '[A-Za-z]{3}'
                                  : undefined
                              }
                              maxLength={
                                field.kind === 'currency' ? 3 : field.maxLength
                              }
                              defaultValue={defaults}
                              required={required}
                            />
                          )}
                        </label>
                      );
                    })}
                  </fieldset>
                  <div className="staff-actions">
                    <Button
                      type="submit"
                      variant="brand"
                      disabled={action.pending}
                    >
                      {creating ? 'Создать запись' : 'Сохранить изменения'}
                    </Button>
                    {item &&
                      transitionStatus !== config.transition.completed && (
                        <Button
                          variant="outline"
                          disabled={action.pending}
                          onClick={() => perform('transition')}
                        >
                          {config.transition.label}
                        </Button>
                      )}
                    {item && (
                      <Button
                        variant="outline"
                        className="staff-danger"
                        disabled={action.pending}
                        onClick={() => perform('delete')}
                      >
                        Удалить запись
                      </Button>
                    )}
                  </div>
                </form>
              )}
            </StaffLoad>
          )}
          {recordPath && item && (
            <StaffMedia
              key={recordPath}
              request={request}
              recordPath={recordPath}
            />
          )}
        </div>
      </div>
    </>
  );
}
