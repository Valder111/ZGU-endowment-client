import {
  useCallback,
  useEffect,
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
import { StaffFeedback, StaffLoad } from '@/components/staff/staff-controls';
import { ContentWorkspace } from '@/components/staff/content-workspace';
import {
  collections,
  type Collection,
} from '@/components/staff/content-fields';
import { UsersWorkspace } from '@/components/staff/users-workspace';
import { roleLabels } from '@/constants/staff';
import {
  StaffApiError,
  staffBase,
  staffBaseInvalid,
  staffFetch,
  type StaffProfile,
  type StaffRequest,
  type StaffSession,
} from '@/api/staff';
import {
  invalidStaffForm,
  useStaffAction,
} from '@/hooks/requests/mutations/use-staff-action';
import { useStaffResource } from '@/hooks/requests/queries/use-staff-resource';
import { localPath, sitePath } from '@/utils/paths';

type Panel = 'admin' | 'moderator';
const titles = { admin: 'Панель администратора', moderator: 'Панель редакции' };
const sectionIcons = {
  news: FileText,
  events: CalendarDays,
  projects: FolderKanban,
};
const sections = ['news', 'events', 'projects'] as const;

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
      await request('/me', {
        method: 'PATCH',
        body: { current_password: current, password },
      });
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
  const [{ session, status }, setAuth] = useState<{
    session: StaffSession | null;
    status: string;
  }>({ session: null, status: '' });
  const login = useStaffAction();
  const token = session?.token;

  const request: StaffRequest = useCallback(
    async <T,>(path: string, options?: Parameters<StaffRequest>[1]) => {
      try {
        return await staffFetch<T>(path, options, token);
      } catch (error) {
        if (
          error instanceof StaffApiError &&
          error.status === 401 &&
          !options?.signal?.aborted
        ) {
          setAuth((current) =>
            current.session?.token === token
              ? { session: null, status: 'Сессия завершилась. Войдите заново.' }
              : current,
          );
        }
        throw error;
      }
    },
    [token],
  );

  const profile = useStaffResource<StaffProfile>(request, token ? '/me' : null);
  const current = profile.data;
  const effectivePanel = current?.role === 'moderator' ? 'moderator' : panel;

  useEffect(() => {
    function onPopState() {
      setPanel(
        localPath(window.location.pathname) === '/moderator/'
          ? 'moderator'
          : 'admin',
      );
      setShowProfile(false);
    }
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

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
    if (
      event.button ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    event.preventDefault();
    navigate(next);
  }

  function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setAuth({ session: null, status: '' });
    void login.run(async () => {
      const staff = await staffFetch<StaffSession>('/login', {
        method: 'POST',
        body: {
          email: String(data.get('email') ?? '').trim(),
          password: String(data.get('password') ?? ''),
        },
      });
      if (!staff?.token || !['admin', 'moderator'].includes(staff.role))
        throw new StaffApiError(403);
      form.reset();
      if (staff.role === 'moderator') navigate('moderator', true);
      setCollection('news');
      setAuth({ session: staff, status: '' });
    }, '');
  }

  function signOut(message: string) {
    setAuth({ session: null, status: message });
    setShowProfile(false);
  }

  return (
    <main className="staff-shell">
      <div className="staff-top">
        <a className="staff-brand" href={sitePath('/')}>
          <span aria-hidden="true">
            <ShieldCheck />
          </span>
          <strong>
            Эндаумент-фонд ЗГУ<small>Рабочее пространство</small>
          </strong>
        </a>
        {session && (
          <div className="staff-account">
            <span>{current?.email ?? session.email}</span>
            <Button
              variant="outline"
              onClick={() => signOut('Вы вышли из панели.')}
            >
              <LogOut /> Выйти
            </Button>
          </div>
        )}
      </div>
      {!session ? (
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
                      onClick={() => setCollection(item)}
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
              onClick={() => setShowProfile(true)}
            >
              <UserRound /> Мой профиль
            </button>
            <a className="staff-site-link" href={sitePath('/')}>
              <ArrowLeft /> На сайт
            </a>
          </nav>
          <div className="staff-main">
            <h1>{titles[effectivePanel]}</h1>
            <StaffLoad {...profile}>
              {current?.is_active ? (
                showProfile ? (
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
                    refreshProfile={profile.reload}
                  />
                ) : (
                  <ContentWorkspace
                    key={collection}
                    request={request}
                    collection={collection}
                  />
                )
              ) : (
                <StaffFeedback error="Эта учётная запись неактивна." />
              )}
            </StaffLoad>
          </div>
        </div>
      )}
    </main>
  );
}
