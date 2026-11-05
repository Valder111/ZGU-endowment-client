import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from 'react';
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  FolderKanban,
  LogOut,
  ShieldCheck,
  UserRound,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StaffFeedback } from '@/components/staff/staff-controls';
import { ContentWorkspace } from '@/components/staff/content-workspace';
import type { LeaveEditor } from '@/components/staff/content-editor';
import {
  collections,
  type Collection,
} from '@/components/staff/content-fields';
import { UsersWorkspace } from '@/components/staff/users-workspace';
import { roleLabels } from '@/constants/staff';
import {
  StaffApiError,
  staffApi,
  staffBase,
  staffBaseInvalid,
  staffResult,
  validProfile,
  type StaffProfile,
  type StaffRequest,
} from '@/api/staff';
import type { AxiosResponse } from 'axios';
import {
  invalidStaffForm,
  useStaffAction,
} from '@/hooks/requests/mutations/use-staff-action';
import { localPath, sitePath } from '@/utils/paths';

type Panel = 'admin' | 'moderator';
const titles = { admin: 'Панель администратора', moderator: 'Панель редакции' };
const sectionIcons = {
  news: FileText,
  events: CalendarDays,
  projects: FolderKanban,
  documents: FileText,
};
const sections = ['news', 'events', 'projects', 'documents'] as const;
const sessionMarker = `zgu:staff-session:${staffBase}`;

function rememberSession(active: boolean) {
  try {
    if (active) sessionStorage.setItem(sessionMarker, 'active');
    else sessionStorage.removeItem(sessionMarker);
  } catch {
    // The panel can still work in memory when session storage is unavailable.
  }
}

function regularClick(event: MouseEvent<HTMLAnchorElement>) {
  return (
    !event.button &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function StaffProfileForm({
  request,
  profile,
  onPasswordChange,
}: {
  request: StaffRequest;
  profile: StaffProfile;
  onPasswordChange: () => void;
}) {
  const action = useStaffAction();
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const current = String(data.get('current_password') ?? '');
    const password = String(data.get('password') ?? '');
    void action.run(async () => {
      if (password !== data.get('confirmation'))
        invalidStaffForm('Новые пароли не совпадают.');
      if (new TextEncoder().encode(password).length > 72)
        invalidStaffForm('Пароль слишком длинный. Используйте до 72 байт.');
      await request(
        staffApi.auth.patchAuth({ current_password: current, password }),
      );
      onPasswordChange();
    }, '');
  }
  return (
    <div className="staff-profile">
      <div className="staff-workspace-heading">
        <div>
          <h2>Мой профиль</h2>
          <p>
            {profile.first_name} {profile.last_name} ·{' '}
            {roleLabels[profile.role]}
          </p>
        </div>
      </div>
      <form className="staff-card staff-form" onSubmit={save}>
        <h3>Сменить пароль</h3>
        <p className="staff-hint">После смены пароля нужно войти заново.</p>
        <fieldset disabled={action.pending}>
          <label className="staff-field">
            Текущий пароль
            <input
              name="current_password"
              type="password"
              required
              autoComplete="current-password"
            />
          </label>
          <label className="staff-field">
            Новый пароль
            <input
              name="password"
              type="password"
              minLength={8}
              maxLength={72}
              required
              autoComplete="new-password"
            />
          </label>
          <label className="staff-field">
            Повторите новый пароль
            <input
              name="confirmation"
              type="password"
              minLength={8}
              maxLength={72}
              required
              autoComplete="new-password"
            />
          </label>
        </fieldset>
        <StaffFeedback error={action.error} />
        <div className="staff-actions">
          <Button type="submit" variant="brand" disabled={action.pending}>
            Изменить пароль
          </Button>
        </div>
      </form>
    </div>
  );
}

export function AdminContent({ initialPanel }: { initialPanel: Panel }) {
  const [panel, setPanel] = useState(initialPanel);
  const [collection, setCollection] = useState<Collection>('news');
  const [showProfile, setShowProfile] = useState(false);
  const [{ profile, status }, setAuth] = useState<{
    profile: StaffProfile | null;
    status: string;
  }>({ profile: null, status: '' });
  const login = useStaffAction();
  const sessionVersion = useRef(0);
  const leaveRef: LeaveEditor = useRef(undefined);
  const leaving = useRef(false);

  const afterSave = useCallback(async (next: () => void) => {
    if (leaving.current) return;
    leaving.current = true;
    try {
      if (!leaveRef.current || (await leaveRef.current())) next();
    } finally {
      leaving.current = false;
    }
  }, []);

  const signOut = useCallback((message: string) => {
    sessionVersion.current += 1;
    rememberSession(false);
    setAuth({ profile: null, status: message });
    setShowProfile(false);
  }, []);

  const request: StaffRequest = useCallback(
    async <T,>(operation: Promise<AxiosResponse<T>>) => {
      const version = sessionVersion.current;
      try {
        return await staffResult(operation);
      } catch (error) {
        if (
          error instanceof StaffApiError &&
          error.status === 401 &&
          version === sessionVersion.current
        ) {
          signOut('Сессия завершилась. Войдите заново.');
        }
        throw error;
      }
    },
    [signOut],
  );

  const current = profile;
  const effectivePanel = current?.role === 'moderator' ? 'moderator' : panel;

  useEffect(() => {
    if (!staffBase) return;
    try {
      if (!sessionStorage.getItem(sessionMarker)) return;
    } catch {
      return;
    }
    const controller = new AbortController();
    const version = sessionVersion.current;
    staffResult(staffApi.auth.getAuth({ signal: controller.signal })).then(
      (user) => {
        if (controller.signal.aborted || version !== sessionVersion.current)
          return;
        if (validProfile(user) && user.is_active)
          setAuth({ profile: user, status: '' });
        else signOut('Учётная запись недоступна. Войдите заново.');
      },
      (error: unknown) => {
        if (controller.signal.aborted || version !== sessionVersion.current)
          return;
        if (error instanceof StaffApiError && [401, 403].includes(error.status))
          signOut('Сессия завершилась. Войдите заново.');
      },
    );
    return () => controller.abort();
  }, [signOut]);

  useEffect(() => {
    function onPopState() {
      void afterSave(() => {
        const next =
          localPath(window.location.pathname) === '/moderator/'
            ? 'moderator'
            : 'admin';
        setPanel(next);
        setShowProfile(false);
        document.title = `${titles[next]} – Эндаумент-фонд ЗГУ`;
      });
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [afterSave]);

  function navigate(next: Panel, replace = false) {
    if (next !== panel) {
      const href = sitePath(`/${next}/`);
      if (replace) window.history.replaceState(null, '', href);
      else window.history.pushState(null, '', href);
    }
    setPanel(next);
    setShowProfile(false);
    document.title = `${titles[next]} – Эндаумент-фонд ЗГУ`;
  }

  function panelLink(event: MouseEvent<HTMLAnchorElement>, next: Panel) {
    if (!regularClick(event)) return;
    event.preventDefault();
    void afterSave(() => navigate(next));
  }

  function siteLink(event: MouseEvent<HTMLAnchorElement>) {
    if (!leaveRef.current || !regularClick(event)) return;
    event.preventDefault();
    const href = event.currentTarget.href;
    void afterSave(() => window.location.assign(href));
  }

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setAuth({ profile: null, status: '' });
    void login.run(async () => {
      const version = ++sessionVersion.current;
      await staffResult(
        staffApi.auth.loginCreate({
          email: String(data.get('email') ?? '').trim(),
          password: String(data.get('password') ?? ''),
        }),
      );
      const staff = await staffResult(staffApi.auth.getAuth());
      if (version !== sessionVersion.current) return;
      if (!validProfile(staff) || !staff.is_active)
        throw new StaffApiError(403);
      form.reset();
      if (staff.role === 'moderator') navigate('moderator', true);
      setCollection('news');
      rememberSession(true);
      setAuth({ profile: staff, status: '' });
    }, '');
  }

  async function refreshProfile() {
    const version = sessionVersion.current;
    const user = await request(staffApi.auth.getAuth());
    if (version === sessionVersion.current && validProfile(user))
      setAuth({ profile: user, status: '' });
  }

  return (
    <main className="staff-shell">
      <div className="staff-top">
        <a className="staff-brand" href={sitePath('/')} onClick={siteLink}>
          <span aria-hidden="true">
            <ShieldCheck />
          </span>
          <strong>
            Эндаумент-фонд ЗГУ<small>Рабочее пространство</small>
          </strong>
        </a>
        {current && (
          <div className="staff-account">
            <span>{current.email}</span>
            <Button
              variant="outline"
              onClick={() =>
                void afterSave(() => signOut('Панель закрыта в этой вкладке.'))
              }
            >
              <LogOut /> Выйти
            </Button>
          </div>
        )}
      </div>
      {!current ? (
        <div className="staff-login-layout">
          <div className="staff-login-intro">
            <span className="staff-kicker">ДЛЯ СОТРУДНИКОВ ФОНДА</span>
            <h1>{titles[panel]}</h1>
            <p>
              {panel === 'admin'
                ? 'Управляйте учётными записями и доступом сотрудников.'
                : 'Управляйте новостями, событиями, проектами и фотографиями.'}
            </p>
            <a
              href={sitePath(`/${panel === 'admin' ? 'moderator' : 'admin'}/`)}
              className="staff-panel-link"
              onClick={(event) =>
                panelLink(event, panel === 'admin' ? 'moderator' : 'admin')
              }
            >
              {titles[panel === 'admin' ? 'moderator' : 'admin']} ↗
            </a>
          </div>
          <form
            className="staff-card staff-form staff-login-form"
            method="post"
            action={staffBase ? `${staffBase}/login` : undefined}
            onSubmit={signIn}
          >
            <h2>Вход в панель</h2>
            {staffBase ? (
              <>
                <fieldset disabled={login.pending}>
                  <label className="staff-field">
                    Рабочая почта
                    <input
                      name="email"
                      type="email"
                      autoComplete="username"
                      required
                    />
                  </label>
                  <label className="staff-field">
                    Пароль
                    <input
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      minLength={8}
                    />
                  </label>
                </fieldset>
                <StaffFeedback error={login.error} notice={status} />
                <Button type="submit" variant="brand" disabled={login.pending}>
                  {login.pending ? 'Вход…' : 'Войти'}
                </Button>
              </>
            ) : (
              <p className="staff-hint">
                {staffBaseInvalid
                  ? 'Адрес API фонда задан неверно.'
                  : 'Для входа настройте адрес API фонда.'}
              </p>
            )}
          </form>
        </div>
      ) : (
        <div className="staff-layout">
          <nav className="staff-nav" aria-label="Разделы рабочей панели">
            {current?.role === 'admin' && (
              <a
                href={sitePath('/admin/')}
                aria-current={
                  effectivePanel === 'admin' && !showProfile
                    ? 'page'
                    : undefined
                }
                onClick={(event) => panelLink(event, 'admin')}
              >
                <Users /> Сотрудники
              </a>
            )}
            <a
              href={sitePath('/moderator/')}
              aria-current={
                effectivePanel === 'moderator' && !showProfile
                  ? 'page'
                  : undefined
              }
              onClick={(event) => panelLink(event, 'moderator')}
            >
              <FileText /> Редакция
            </a>
            {effectivePanel === 'moderator' && !showProfile && (
              <div className="staff-nav-sections">
                {sections.map((item) => {
                  const Icon = sectionIcons[item];
                  return (
                    <button
                      key={item}
                      type="button"
                      aria-pressed={collection === item}
                      onClick={() => {
                        if (item !== collection)
                          void afterSave(() => setCollection(item));
                      }}
                    >
                      <Icon /> {collections[item].label}
                    </button>
                  );
                })}
              </div>
            )}
            <button
              type="button"
              aria-pressed={showProfile}
              onClick={() => void afterSave(() => setShowProfile(true))}
            >
              <UserRound /> Мой профиль
            </button>
            <a
              className="staff-site-link"
              href={sitePath('/')}
              onClick={siteLink}
            >
              <ArrowLeft /> На сайт
            </a>
          </nav>
          <div className="staff-main">
            <h1>{titles[effectivePanel]}</h1>
            {showProfile ? (
              <StaffProfileForm
                request={request}
                profile={current}
                onPasswordChange={() =>
                  signOut('Пароль изменён. Войдите с новым паролем.')
                }
              />
            ) : effectivePanel === 'admin' ? (
              <UsersWorkspace
                request={request}
                profile={current}
                refreshProfile={refreshProfile}
              />
            ) : (
              <ContentWorkspace
                key={collection}
                request={request}
                collection={collection}
                userId={current.id}
                leaveRef={leaveRef}
              />
            )}
          </div>
        </div>
      )}
    </main>
  );
}
