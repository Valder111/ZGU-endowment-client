import {
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type RefObject,
} from 'react';
import { staffError, type ContentRecord, type StaffRequest } from '@/api/staff';
import { collectionApi, isPublished } from '@/api/staff-content';
import { Button } from '@/components/ui/button';
import { invalidStaffForm } from '@/hooks/requests/mutations/use-staff-action';
import {
  collections,
  contentPayload,
  currencies,
  dateLabel,
  fieldRequired,
  fieldValue,
  formatTargetAmount,
  formatTargetAmountInput,
  statusLabels,
  validateDocumentFile,
  type Collection,
  type Field,
} from './content-fields';
import {
  readRecovery,
  writeRecovery,
  type FormSnapshot,
} from './content-recovery';
import { StaffConfirm } from './staff-confirm';
import { StaffFeedback } from './staff-controls';
import { StaffFilePicker } from './staff-file-picker';
import { CategoryField } from './category-field';

const autosaveDelay = 7_000;
const reportYears = Array.from({ length: 201 }, (_, index) => 2100 - index);
const emptySnapshot: FormSnapshot = { values: {} };
type SaveMode = 'auto' | 'manual' | 'publish' | 'complete' | 'delete';
export type LeaveEditor = RefObject<(() => Promise<boolean>) | undefined>;

function formatAmountChange(event: ChangeEvent<HTMLInputElement>) {
  const input = event.currentTarget;
  const raw = input.value;
  const pasted =
    event.nativeEvent instanceof InputEvent &&
    event.nativeEvent.inputType === 'insertFromPaste';
  const formatted = pasted
    ? formatTargetAmount(raw)
    : formatTargetAmountInput(raw);
  if (formatted === raw) return;
  const digitsBeforeCaret = raw
    .slice(0, input.selectionStart ?? raw.length)
    .replace(/[. \u00a0\u202f]/g, '').length;
  let offset = 0;
  let digits = 0;
  while (offset < formatted.length && digits < digitsBeforeCaret) {
    if (formatted[offset] !== '.') digits += 1;
    offset += 1;
  }
  if (
    event.nativeEvent instanceof InputEvent &&
    event.nativeEvent.inputType === 'deleteContentForward' &&
    formatted[offset] === '.'
  )
    offset += 1;
  input.value = formatted;
  input.setSelectionRange(offset, offset);
}

function EditorField({
  field,
  value,
  required,
}: {
  field: Field;
  value: string;
  required?: boolean;
}) {
  const id = useId();
  const props = {
    name: field.key,
    defaultValue: field.kind === 'amount' ? formatTargetAmount(value) : value,
    required,
    'aria-labelledby': `${id}-label`,
  };

  return (
    <label
      className="staff-field"
      data-wide={
        field.kind === 'textarea' ||
        field.key === 'title' ||
        field.key === 'name'
      }
    >
      <span id={`${id}-label`}>{field.label}</span>
      {field.kind === 'currency' ? (
        <select {...props}>
          {value && !(value in currencies) && (
            <option value={value}>{value}</option>
          )}
          {Object.entries(currencies).map(([code, label]) => (
            <option value={code} key={code}>
              {label} ({code})
            </option>
          ))}
        </select>
      ) : field.kind === 'year' ? (
        <select {...props}>
          <option value="">Выберите год отчётности</option>
          {reportYears.map((year) => (
            <option value={year} key={year}>
              {year}
            </option>
          ))}
        </select>
      ) : field.options ? (
        <select {...props}>
          {field.options.map((status) => (
            <option key={status} value={status}>
              {statusLabels[status]}
            </option>
          ))}
        </select>
      ) : field.kind === 'textarea' ? (
        <textarea {...props} rows={field.required ? 7 : 3} />
      ) : (
        <input
          {...props}
          type={field.kind === 'datetime-local' ? field.kind : 'text'}
          inputMode={field.kind === 'amount' ? 'decimal' : undefined}
          maxLength={field.maxLength}
          onChange={field.kind === 'amount' ? formatAmountChange : undefined}
          onBlur={
            field.kind === 'amount'
              ? (event) => {
                  event.currentTarget.value = formatTargetAmount(
                    event.currentTarget.value,
                  );
                }
              : undefined
          }
        />
      )}
    </label>
  );
}

type EditorProps = {
  collection: Collection;
  request: StaffRequest;
  item?: ContentRecord;
  categories: string[];
  onRememberCategory: (value: string) => void;
  recoveryKey: string;
  leaveRef: LeaveEditor;
  onSaved: (notice: string, selection?: string | null) => void;
};

export function ContentEditor(props: EditorProps) {
  const [recovered, setRecovered] = useState<FormSnapshot>();
  useEffect(() => {
    let active = true;
    readRecovery(props.recoveryKey).then(
      (snapshot) => {
        if (active) setRecovered(snapshot ?? emptySnapshot);
      },
      () => {
        if (active) setRecovered(emptySnapshot);
      },
    );
    return () => {
      active = false;
    };
  }, [props.recoveryKey]);
  if (!recovered) return <p role="status">Загрузка формы…</p>;
  return <EditorForm {...props} recovered={recovered} />;
}

function EditorForm({
  collection,
  request,
  item,
  categories,
  onRememberCategory,
  recoveryKey,
  leaveRef,
  onSaved,
  recovered,
}: EditorProps & { recovered: FormSnapshot }) {
  const config = collections[collection];
  const api = collectionApi[collection];
  const [record, setRecord] = useState(item);
  const [fileName, setFileName] = useState(recovered.file?.name);
  const [change, setChange] = useState(recovered === emptySnapshot ? 0 : 1);
  const [confirmation, setConfirmation] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [savedLocally, setSavedLocally] = useState(false);
  const snapshot = useRef(recovered);
  const dirty = useRef(recovered !== emptySnapshot);
  const cached = useRef(Promise.resolve(recovered !== emptySnapshot));
  const pending = useRef<Promise<boolean> | undefined>(undefined);
  const id = record?.id && encodeURIComponent(record.id);
  const status = record?.[config.statusKey];
  const published = record && isPublished(collection, record);
  const localOnly = !record && !api.publish;
  const fields = config.fields.filter(
    (field) => !field.mode || field.mode === (record ? 'edit' : 'create'),
  );
  const completeLabel =
    collection === 'events' ? 'Завершить событие' : 'Завершить проект';
  const canComplete =
    record &&
    ((collection === 'events' && record.event_status !== 'finished') ||
      (collection === 'projects' && status === 'published'));

  function remember(next: FormSnapshot) {
    snapshot.current = next;
    dirty.current = true;
    cached.current = writeRecovery(recoveryKey, next).then(
      () => true,
      () => false,
    );
    setChange((version) => version + 1);
    setSavedLocally(false);
    setError('');
  }

  function changeField(event: FormEvent<HTMLFormElement>) {
    const field = event.target;
    if (!(
      field instanceof HTMLInputElement ||
      field instanceof HTMLSelectElement ||
      field instanceof HTMLTextAreaElement
    ))
      return;
    if (field.name === 'file' || field.name === 'category') return;
    changeValue(field.name, field.value);
  }

  function changeValue(name: string, value: string) {
    remember({
      ...snapshot.current,
      values: { ...snapshot.current.values, [name]: value },
    });
  }

  async function clearRecovery() {
    dirty.current = false;
    snapshot.current = emptySnapshot;
    await writeRecovery(recoveryKey).catch(() => undefined);
  }

  function save(mode: SaveMode) {
    if (pending.current) return pending.current;
    if (mode === 'auto' && !dirty.current) return Promise.resolve(true);
    setChange(0);
    setError('');
    setSavedLocally(false);
    setBusy(true);

    const operation = Promise.resolve().then(async () => {
      try {
        if (mode === 'delete' && id) {
          await request(api.remove(id));
          await clearRecovery();
          onSaved('Запись удалена.', null);
          return true;
        }

        if (localOnly && mode !== 'publish') {
          if (!dirty.current) return true;
          if (!(await cached.current))
            invalidStaffForm('Браузер не смог сохранить форму.');
          if (snapshot.current.values.category)
            onRememberCategory(snapshot.current.values.category);
          setSavedLocally(true);
          return true;
        }

        const body = contentPayload(
          fields,
          snapshot.current.values,
          record,
          categories,
        );
        if (!id) {
          const file =
            collection === 'documents'
              ? validateDocumentFile(snapshot.current.file)
              : undefined;
          body[config.statusKey] = mode === 'publish' ? 'published' : 'draft';
          const created = await request(api.create(body, file));
          if (body.category)
            onRememberCategory(created.category || body.category);
          await clearRecovery();
          onSaved(
            mode === 'publish' ? 'Запись опубликована.' : 'Запись сохранена.',
            created.id,
          );
          return true;
        }

        const hasChanges = Object.keys(body).length > 0;
        if (hasChanges) {
          await request(api.update(id, body));
          if (body.category) onRememberCategory(body.category);
          const { reporting_year, ...fields } = body;
          const updated = { ...record, ...fields };
          if (reporting_year !== undefined)
            updated.reporting_year = Number(reporting_year) || undefined;
          setRecord(updated);
        }
        if (dirty.current) await clearRecovery();
        if (mode === 'publish' && api.publish) {
          await request(api.publish(id));
          onSaved('Запись опубликована.', record?.id);
        } else if (mode === 'complete' && api.complete) {
          await request(api.complete(id));
          onSaved(
            collection === 'events' ? 'Событие завершено.' : 'Проект завершён.',
            record?.id,
          );
        } else if (hasChanges || mode === 'manual') {
          onSaved(
            hasChanges
              ? 'Изменения сохранены.'
              : 'Все изменения уже сохранены.',
          );
        }
        return true;
      } catch (failure) {
        const local = dirty.current && (await cached.current);
        setSavedLocally(local);
        setError(
          failure instanceof Error && failure.name === 'FormError'
            ? failure.message
            : staffError(failure),
        );
        return !dirty.current || local;
      } finally {
        pending.current = undefined;
        setBusy(false);
      }
    });
    pending.current = operation;
    return operation;
  }

  const runAutosave = useEffectEvent(() => {
    void save('auto');
  });
  useEffect(() => {
    if (!change || confirmation) return;
    const timer = window.setTimeout(() => runAutosave(), autosaveDelay);
    return () => window.clearTimeout(timer);
  }, [change, confirmation]);

  useEffect(() => {
    const leave = () => save('auto');
    leaveRef.current = leave;
    return () => {
      if (leaveRef.current === leave) leaveRef.current = undefined;
    };
  });

  return (
    <form
      className="staff-card staff-form"
      data-collection={collection}
      noValidate
      onChange={changeField}
      onSubmit={(event) => {
        event.preventDefault();
        void save('manual');
      }}
    >
      <div className="staff-editor-heading">
        <span>{record ? 'Редактирование записи' : 'Создание записи'}</span>
        <h3>{record ? record[config.titleKey] : config.create}</h3>
        {record && (
          <div className="staff-record-meta">
            <span
              className="staff-badge"
              data-tone={published ? 'positive' : 'neutral'}
            >
              {statusLabels[status ?? ''] ?? status}
            </span>
            {record.event_status && (
              <span className="staff-badge">
                {statusLabels[record.event_status] ?? record.event_status}
              </span>
            )}
            {record.currency && <span>{record.currency}</span>}
            {record.starts_at && (
              <span>Начало {dateLabel(record.starts_at)}</span>
            )}
            {record.ends_at && (
              <span>Окончание {dateLabel(record.ends_at)}</span>
            )}
          </div>
        )}
      </div>
      {localOnly && (
        <p className="staff-hint">
          До публикации форма сохраняется в этом браузере.
        </p>
      )}
      {record && !published && !api.publish && (
        <p className="staff-hint">
          В этом разделе запись можно опубликовать при создании.
        </p>
      )}
      <p className="staff-hint" role="status">
        {busy
          ? 'Сохраняем…'
          : savedLocally
            ? 'Введённые данные сохранены в этом браузере.'
            : change
              ? 'Автосохранение через 7 секунд после последней правки.'
              : 'Правки сохраняются автоматически после паузы в 7 секунд и при переходе.'}
      </p>
      <StaffFeedback error={error} />
      <fieldset disabled={busy} className="staff-editor-fields">
        {fields.map((field) => {
          const value = recovered.values[field.key] ?? fieldValue(field, item);
          const required = fieldRequired(field, item);
          return field.kind === 'category' ? (
            <CategoryField
              key={field.key}
              value={value}
              required={required}
              disabled={busy}
              categories={categories}
              onChange={(next) => changeValue('category', next)}
              onAdd={onRememberCategory}
            />
          ) : (
            <EditorField
              key={field.key}
              field={field}
              value={value}
              required={required}
            />
          );
        })}
        {!record && collection === 'documents' && (
          <StaffFilePicker
            label="Прикрепить документ"
            accept=".pdf,.doc,.docx"
            filename={fileName}
            required
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              setFileName(file?.name);
              remember({ ...snapshot.current, file });
            }}
          />
        )}
      </fieldset>
      <div className="staff-actions staff-editor-actions">
        <Button
          type="submit"
          variant={published ? 'brand' : 'outline'}
          disabled={busy}
        >
          {record ? 'Сохранить изменения' : 'Сохранить запись'}
        </Button>
        {!published && (!record || api.publish) && (
          <Button
            type="button"
            variant="brand"
            disabled={busy}
            onClick={() => void save('publish')}
          >
            Опубликовать
          </Button>
        )}
        {canComplete && (
          <StaffConfirm
            trigger={
              <Button variant="outline" disabled={busy}>
                {completeLabel}
              </Button>
            }
            title={`${completeLabel}?`}
            description="Статус записи изменится."
            label={completeLabel}
            onOpenChange={setConfirmation}
            onConfirm={() => void save('complete')}
          />
        )}
        {record && (
          <StaffConfirm
            trigger={
              <Button
                variant="outline"
                className="staff-danger"
                disabled={busy}
              >
                Удалить запись
              </Button>
            }
            title="Удалить запись?"
            description="Запись исчезнет из редакции и публичной ленты."
            label="Удалить"
            danger
            onOpenChange={setConfirmation}
            onConfirm={() => void save('delete')}
          />
        )}
      </div>
    </form>
  );
}
