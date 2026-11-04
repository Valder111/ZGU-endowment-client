import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { generalCapital, projects } from '@/constants/projects';
import {
  apiBase,
  apiMisconfigured,
  StaffApiError,
  staffRequest,
} from '@/utils/admin-api';
import {
  loadDraft,
  saveDraft,
  type NewsDraft,
  type PaymentDraft,
} from '@/utils/admin-drafts';

type StaffSession = { token: string; email: string; role: string };
const blankNews: NewsDraft = { title: '', summary: '', body: '', photo: null };
const blankPayment: PaymentDraft = {
  amount: '',
  date: '',
  direction: generalCapital,
};
const photoTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function actionError(error: unknown, fallback: string) {
  if (error instanceof StaffApiError) {
    if (error.status === 401)
      return 'Проверьте данные входа или войдите заново.';
    if (error.status === 403)
      return 'Для этого действия нужны права сотрудника фонда.';
  }
  return fallback;
}

function PhotoPreview({ file }: { file: File }) {
  const preview = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const image = preview.current;
    if (!image) return;
    const url = URL.createObjectURL(file);
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);
  return (
    <img
      className="admin-preview"
      ref={preview}
      alt="Предпросмотр фотографии новости"
    />
  );
}

function NewsEditor({ session }: { session: StaffSession | null }) {
  const photoInput = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState(blankNews);
  const [record, setRecord] = useState<{
    id: string;
    owner: string;
    hasPhoto: boolean;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const blocked = Boolean(record && session && record.owner !== session.email);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || blocked || (apiBase && !session)) return;
    const form = event.currentTarget;
    const fields = {
      title: draft.title.trim(),
      summary: draft.summary.trim(),
      body: draft.body.trim(),
    };
    if (!fields.title || !fields.body) {
      setStatus('Укажите заголовок и текст новости.');
      return;
    }
    setBusy(true);
    setStatus('');
    try {
      if (!session) {
        await saveDraft('news', { ...fields, photo: draft.photo });
        setStatus('Черновик новости сохранён в этом браузере.');
        return;
      }
      let current = record;
      if (!current) {
        const response = await staffRequest(
          '/news',
          { ...fields, status: 'draft' },
          session.token,
        );
        const { id } = await response.json();
        if (typeof id !== 'string' || !id) throw new Error('Missing news id');
        current = { id, owner: session.email, hasPhoto: false };
        setRecord(current);
      }
      const path = `/news/${encodeURIComponent(current.id)}`;
      if (draft.photo && !current.hasPhoto) {
        const upload = new FormData();
        upload.set('file', draft.photo);
        await staffRequest(`${path}/media`, upload, session.token);
        setRecord({ ...current, hasPhoto: true });
      }
      await staffRequest(`${path}/publish`, undefined, session.token);
      setRecord(null);
      setDraft(blankNews);
      form.reset();
      setStatus('Новость опубликована в API фонда.');
    } catch (error) {
      setStatus(
        actionError(
          error,
          session
            ? 'Публикация не завершилась. Если черновик был создан, повторите отправку из этой формы.'
            : 'Браузер не смог сохранить черновик новости.',
        ),
      );
    } finally {
      setBusy(false);
    }
  }

  async function restore() {
    setBusy(true);
    try {
      const saved = await loadDraft('news');
      if (saved) {
        if (photoInput.current) photoInput.current.value = '';
        setDraft(saved);
      }
      setStatus(
        saved ? 'Черновик загружен.' : 'Сохранённого черновика пока нет.',
      );
    } catch {
      setStatus('Браузер не смог загрузить черновик.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="admin-card" onSubmit={submit}>
      <h2>Новая новость</h2>
      <p>
        {session
          ? 'После публикации запись появится в API фонда. Публичная лента этого сайта обновляется при сборке.'
          : 'Текст и фотография сохраняются в черновике этого браузера.'}
      </p>
      <label>
        Заголовок
        <input
          required
          maxLength={255}
          readOnly={!!record || busy}
          value={draft.title}
          onChange={(event) =>
            setDraft({ ...draft, title: event.target.value })
          }
        />
      </label>
      <label>
        Краткое описание
        <input
          readOnly={!!record || busy}
          value={draft.summary}
          onChange={(event) =>
            setDraft({ ...draft, summary: event.target.value })
          }
        />
      </label>
      <label>
        Текст новости
        <textarea
          rows={7}
          required
          readOnly={!!record || busy}
          value={draft.body}
          onChange={(event) => setDraft({ ...draft, body: event.target.value })}
        />
      </label>
      <label>
        Фотография
        <input
          type="file"
          ref={photoInput}
          accept={photoTypes.join(',')}
          disabled={busy || record?.hasPhoto}
          onChange={(event) => {
            const photo = event.target.files?.[0] ?? null;
            if (
              photo &&
              (!photoTypes.includes(photo.type) ||
                photo.size > 10 * 1024 * 1024 ||
                !photo.size)
            ) {
              event.target.value = '';
              setDraft({ ...draft, photo: null });
              setStatus(
                'Выберите фото JPEG, PNG, WebP или GIF размером до 10 МБ.',
              );
              return;
            }
            setDraft({ ...draft, photo });
            setStatus('');
          }}
        />
      </label>
      {draft.photo && (
        <figure>
          <PhotoPreview file={draft.photo} />
          <figcaption>{draft.photo.name}</figcaption>
          <Button
            variant="ghost"
            disabled={busy || record?.hasPhoto}
            onClick={() => {
              if (photoInput.current) photoInput.current.value = '';
              setDraft({ ...draft, photo: null });
            }}
          >
            Убрать фото
          </Button>
        </figure>
      )}
      <div className="admin-actions">
        <Button type="submit" variant="brand" disabled={busy || blocked}>
          {busy
            ? 'Подождите…'
            : record
              ? 'Завершить публикацию'
              : session
                ? 'Опубликовать новость'
                : 'Сохранить черновик новости'}
        </Button>
        {!session && (
          <Button variant="outline" onClick={restore} disabled={busy}>
            Открыть черновик
          </Button>
        )}
      </div>
      <p role="status">
        {blocked
          ? 'Войдите под учётной записью, создавшей этот черновик.'
          : status}
      </p>
    </form>
  );
}

function PaymentEditor() {
  const [draft, setDraft] = useState(blankPayment);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function changeStorage(save: boolean) {
    setBusy(true);
    try {
      if (save) {
        await saveDraft('payment', draft);
        setStatus('Черновик платежа сохранён в этом браузере.');
      } else {
        const saved = await loadDraft('payment');
        if (saved) setDraft(saved);
        setStatus(
          saved
            ? 'Черновик платежа загружен.'
            : 'Сохранённого черновика пока нет.',
        );
      }
    } catch {
      setStatus('Хранилище браузера недоступно.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="admin-card"
      onSubmit={(event) => {
        event.preventDefault();
        if (!busy) void changeStorage(true);
      }}
    >
      <h2>Новый платёж</h2>
      <p>
        Локальная заготовка для учёта. Сохранение черновика не проводит оплату.
      </p>
      <label>
        Сумма, ₽
        <input
          type="number"
          inputMode="decimal"
          min="0.01"
          max="999999999.99"
          step="0.01"
          required
          value={draft.amount}
          onChange={(event) =>
            setDraft({ ...draft, amount: event.target.value })
          }
        />
      </label>
      <label>
        Направление поддержки
        <select
          value={draft.direction}
          onChange={(event) =>
            setDraft({ ...draft, direction: event.target.value })
          }
        >
          {[generalCapital, ...projects.map(({ title }) => title)].map(
            (title) => (
              <option key={title}>{title}</option>
            ),
          )}
        </select>
      </label>
      <label>
        Дата
        <input
          type="date"
          required
          value={draft.date}
          onChange={(event) => setDraft({ ...draft, date: event.target.value })}
        />
      </label>
      <div className="admin-actions">
        <Button type="submit" variant="brand" disabled={busy}>
          Сохранить черновик платежа
        </Button>
        <Button
          variant="outline"
          onClick={() => void changeStorage(false)}
          disabled={busy}
        >
          Открыть черновик платежа
        </Button>
      </div>
      <p role="status">{status}</p>
    </form>
  );
}

export function AdminContent() {
  const [session, setSession] = useState<StaffSession | null>(null);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setBusy(true);
    setStatus('');
    try {
      const response = await staffRequest('/login', {
        email: String(data.get('email') ?? '').trim(),
        password: String(data.get('password') ?? ''),
      });
      const staff: StaffSession = await response.json();
      if (
        !staff.token ||
        !staff.email ||
        !['admin', 'moderator'].includes(staff.role)
      ) {
        throw new StaffApiError(403);
      }
      form.reset();
      setSession(staff);
    } catch (error) {
      setStatus(actionError(error, 'Не удалось связаться с API фонда.'));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap admin-content">
      {apiBase && !session && (
        <form className="admin-card admin-login" onSubmit={signIn}>
          <h2>Вход для сотрудников</h2>
          <label>
            Рабочая почта
            <input type="email" name="email" autoComplete="username" required />
          </label>
          <label>
            Пароль
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              required
              minLength={8}
            />
          </label>
          <Button type="submit" variant="brand" disabled={busy}>
            {busy ? 'Вход…' : 'Войти'}
          </Button>
          <p role="status">{status}</p>
        </form>
      )}
      {session ? (
        <div className="admin-session">
          <p>Вы вошли как {session.email}</p>
          <Button variant="outline" onClick={() => setSession(null)}>
            Выйти
          </Button>
        </div>
      ) : (
        !apiBase && (
          <p className="admin-mode">
            {apiMisconfigured
              ? 'Адрес API задан неверно. Доступны локальные черновики.'
              : 'Режим локальных черновиков. Подключите API фонда для публикации новостей.'}
          </p>
        )
      )}
      <div className="admin-grid" hidden={!!apiBase && !session}>
        <NewsEditor session={session} />
        <PaymentEditor />
      </div>
    </div>
  );
}
