import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
} from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import type { StaffRequest } from '@/api/staff';
import { collectionApi } from '@/api/staff-content';
import type { RequestParams } from '@/api/generated/http-client';
import { useStaffResource } from '@/hooks/requests/queries/use-staff-resource';
import { useStaffAction } from '@/hooks/requests/mutations/use-staff-action';
import { Button } from '@/components/ui/button';
import {
  collections,
  contentPayload,
  currencies,
  documentFile,
  statusLabels,
  type Collection,
} from './content-fields';
import { StaffFeedback, StaffList, StaffLoad } from './staff-controls';
import { StaffMedia } from './staff-media';
import { StaffDocumentFile } from './staff-document-file';
import { StaffConfirm } from './staff-confirm';
import { StaffFilePicker } from './staff-file-picker';

const draftDelay = 7000;
const reportYears = Array.from({ length: 201 }, (_, index) => 2100 - index);

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
  const formId = useId();
  const api = collectionApi[collection];
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | 'new'>();
  const [fileName, setFileName] = useState('');
  const [draftQueued, setDraftQueued] = useState(false);
  const draftTimer = useRef<number>(undefined);
  const pausedDraft = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const recordId =
    selected && selected !== 'new' ? encodeURIComponent(selected) : '';
  const list = useStaffResource(request, api.list);
  const loadRecord = useCallback(
    (params: RequestParams) => api.detail(recordId, params),
    [api, recordId],
  );
  const detail = useStaffResource(request, loadRecord, Boolean(recordId));
  const action = useStaffAction();
  const item = detail.data;
  const creating = selected === 'new';
  const fields = config.fields.filter(
    (field) => !field.mode || field.mode === (creating ? 'create' : 'edit'),
  );
  const recordStatus = item?.[config.statusKey];
  const transitionStatus =
    collection === 'events' ? item?.event_status : recordStatus;
  const publishOnCreation =
    collection === 'events' || collection === 'projects';
  const autosave = creating || recordStatus === 'draft';

  const cancelAutosave = useCallback(() => {
    window.clearTimeout(draftTimer.current);
    setDraftQueued(false);
  }, []);
  useEffect(() => () => window.clearTimeout(draftTimer.current), []);

  function select(next?: string) {
    if (next !== undefined && next === selected) return;
    cancelAutosave();
    setFileName('');
    setSelected(next);
  }

  function saveDraftAfterChange(form: HTMLFormElement) {
    cancelAutosave();
    if (!autosave) return;
    const data = new FormData(form);
    const status = data.get(config.statusKey);
    if (creating && status !== 'draft') return;
    setDraftQueued(true);
    draftTimer.current = window.setTimeout(() => {
      setDraftQueued(false);
      if (form.isConnected) persist(form, true);
    }, draftDelay);
  }

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    cancelAutosave();
    persist(event.currentTarget, false);
  }

  function onConfirmation(open: boolean) {
    if (open) {
      pausedDraft.current = draftQueued;
      cancelAutosave();
    } else if (pausedDraft.current && formRef.current) {
      pausedDraft.current = false;
      saveDraftAfterChange(formRef.current);
    }
  }

  function persist(form: HTMLFormElement, automatic: boolean) {
    const data = new FormData(form);
    let body: Record<string, string>;
    let file: File | undefined;
    try {
      body = contentPayload(fields, data, item, automatic);
      if (!Object.keys(body).length) return;
      if (creating && collection === 'documents') file = documentFile(data);
    } catch (error) {
      if (!automatic || form.checkValidity()) {
        void action.run(async () => {
          throw error;
        }, '');
      }
      return;
    }
    void action.run(
      async () => {
        if (recordId) {
          await request(api.update(recordId, body));
          detail.reload();
        } else {
          if (automatic) body[config.statusKey] = 'draft';
          const created = await request(api.create(body, file));
          select(created.id);
        }
        list.reload();
      },
      automatic
        ? 'Черновик сохранён в базе.'
        : creating
          ? 'Запись создана.'
          : 'Изменения сохранены.',
    );
  }

  function perform(operation: 'transition' | 'delete') {
    if (!recordId) return;
    const remove = operation === 'delete';
    pausedDraft.current = false;
    cancelAutosave();
    void action.run(
      async () => {
        if (!remove && formRef.current) {
          const changes = contentPayload(
            fields,
            new FormData(formRef.current),
            item,
            true,
          );
          if (Object.keys(changes).length)
            await request(api.update(recordId, changes));
        }
        await request(remove ? api.remove(recordId) : api.transition(recordId));
        if (remove) select();
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
            onClick={() => select('new')}
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
              rows={(list.data ?? []).flatMap((row) =>
                row.id
                  ? [
                      {
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
                      },
                    ]
                  : [],
              )}
              search={search}
              onSearch={setSearch}
              activeId={selected}
              onSelect={select}
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
                  ref={formRef}
                  className="staff-card staff-form"
                  key={`${selected}-${detail.revision}`}
                  onSubmit={save}
                  onChange={(event) =>
                    saveDraftAfterChange(event.currentTarget)
                  }
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
                  {creating && publishOnCreation && (
                    <p className="staff-hint">
                      {collection === 'projects'
                        ? 'Даты, валюта и статус публикации задаются при создании.'
                        : 'Даты и статус публикации задаются при создании.'}{' '}
                      Автосохранение доступно со статусом «Черновик». Для
                      публикации выберите «Опубликовано» перед созданием
                      карточки.
                    </p>
                  )}
                  {creating && collection === 'events' && (
                    <p className="staff-callout">
                      Место проведения можно указать после создания карточки
                      события.
                    </p>
                  )}
                  {!creating &&
                    recordStatus === 'draft' &&
                    publishOnCreation && (
                      <p className="staff-callout">
                        Этот черновик можно редактировать. Сервер принимает
                        статус «Опубликовано» только при создании новой
                        карточки.
                      </p>
                    )}
                  {autosave && (
                    <p className="staff-hint" role="status">
                      {action.pending
                        ? 'Сохраняем…'
                        : draftQueued
                          ? 'Проверим и сохраним черновик через 7 секунд.'
                          : 'Со статусом «Черновик» заполненная форма сохраняется после паузы в 7 секунд.'}
                    </p>
                  )}
                  <fieldset disabled={action.pending}>
                    {fields.map((field) => {
                      const labelId = `${formId}-${field.key}`;
                      const defaults = String(
                        item?.[field.key] ??
                          field.defaultValue ??
                          field.options?.[0] ??
                          '',
                      );
                      const required =
                        field.required && (creating || field.key !== 'type');
                      return (
                        <label className="staff-field" key={field.key}>
                          <span id={labelId}>{field.label}</span>
                          {field.kind === 'currency' ? (
                            <select
                              name={field.key}
                              aria-labelledby={labelId}
                              defaultValue={defaults}
                              required
                            >
                              {Object.entries(currencies).map(
                                ([code, label]) => (
                                  <option value={code} key={code}>
                                    {label} ({code})
                                  </option>
                                ),
                              )}
                            </select>
                          ) : field.kind === 'year' ? (
                            <select
                              name={field.key}
                              defaultValue={defaults}
                              aria-labelledby={labelId}
                            >
                              <option
                                value=""
                                disabled={Boolean(item?.reporting_year)}
                              >
                                Выберите год отчётности
                              </option>
                              {reportYears.map((year) => (
                                <option value={year} key={year}>
                                  {year}
                                </option>
                              ))}
                            </select>
                          ) : field.options ? (
                            <select
                              name={field.key}
                              aria-labelledby={labelId}
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
                              placeholder={
                                field.kind === 'amount'
                                  ? '150 000,50'
                                  : undefined
                              }
                              maxLength={field.maxLength}
                              defaultValue={defaults}
                              required={required}
                            />
                          )}
                        </label>
                      );
                    })}
                    {creating && collection === 'documents' && (
                      <StaffFilePicker
                        label="Прикрепить документ"
                        accept=".pdf,.doc,.docx"
                        filename={fileName}
                        required
                        onChange={(event) =>
                          setFileName(
                            event.currentTarget.files?.[0]?.name ?? '',
                          )
                        }
                      />
                    )}
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
                        <StaffConfirm
                          trigger={
                            <Button variant="outline" disabled={action.pending}>
                              {config.transition.label}
                            </Button>
                          }
                          title={config.transition.label + '?'}
                          description={
                            publishOnCreation
                              ? 'Статус записи изменится.'
                              : 'Запись станет видна на сайте.'
                          }
                          label={config.transition.label}
                          onOpenChange={onConfirmation}
                          onConfirm={() => perform('transition')}
                        />
                      )}
                    {item && (
                      <StaffConfirm
                        trigger={
                          <Button
                            variant="outline"
                            className="staff-danger"
                            disabled={action.pending}
                          >
                            Удалить запись
                          </Button>
                        }
                        title="Удалить запись?"
                        description="Запись исчезнет из редакции и публичной ленты."
                        label="Удалить"
                        danger
                        onOpenChange={onConfirmation}
                        onConfirm={() => perform('delete')}
                      />
                    )}
                  </div>
                </form>
              )}
            </StaffLoad>
          )}
          {recordId && item && api.photos && (
            <StaffMedia
              key={recordId}
              request={request}
              recordId={recordId}
              api={api.photos}
            />
          )}
          {recordId && item && collection === 'documents' && (
            <StaffDocumentFile
              key={recordId}
              request={request}
              recordId={recordId}
              filename={item.original_filename}
            />
          )}
        </div>
      </div>
    </>
  );
}
