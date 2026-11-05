import { useCallback, useState, type FormEvent } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import {
  staffApi,
  validProfile,
  type StaffProfile,
  type StaffRequest,
} from '@/api/staff';
import type { RequestParams } from '@/api/generated/http-client';
import type { ApiUserAdminUpdateRequest } from '@/api/generated/data-contracts';
import { roleLabels } from '@/constants/staff';
import { useStaffResource } from '@/hooks/requests/queries/use-staff-resource';
import {
  invalidStaffForm,
  useStaffAction,
} from '@/hooks/requests/mutations/use-staff-action';
import { Button } from '@/components/ui/button';
import { StaffFeedback, StaffList, StaffLoad } from './staff-controls';
import { StaffConfirm } from './staff-confirm';

export function UsersWorkspace({
  request,
  profile,
  refreshProfile,
}: {
  request: StaffRequest;
  profile: StaffProfile;
  refreshProfile: () => Promise<void>;
}) {
  const [selected, setSelected] = useState<string>();
  const [search, setSearch] = useState('');
  const creating = selected === 'new';
  const recordId = selected && !creating ? selected : '';
  const users = useStaffResource(request, staffApi.users.usersList);
  const loadUser = useCallback(
    (params: RequestParams) =>
      staffApi.users.usersDetail(encodeURIComponent(recordId), params),
    [recordId],
  );
  const detail = useStaffResource(request, loadUser, Boolean(recordId));
  const action = useStaffAction();
  const user = detail.data;
  const self = user?.id === profile.id;

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    void action.run(
      async () => {
        const role = String(data.get('role') ?? user?.role ?? 'moderator');
        if (role !== 'admin' && role !== 'moderator')
          invalidStaffForm('Выберите роль сотрудника.');
        const values = {
          first_name: String(data.get('first_name') ?? '').trim(),
          last_name: String(data.get('last_name') ?? '').trim(),
          email: String(data.get('email') ?? '').trim(),
          role,
        };
        if (!values.first_name || !values.last_name || !values.email)
          invalidStaffForm('Укажите имя, фамилию и рабочую почту.');
        const password = String(data.get('password') ?? '');
        if (password && new TextEncoder().encode(password).length > 72)
          invalidStaffForm('Пароль слишком длинный. Используйте до 72 байт.');
        if (recordId) {
          const body: ApiUserAdminUpdateRequest = {};
          for (const field of ['first_name', 'last_name', 'email'] as const) {
            if (values[field] !== user?.[field]) body[field] = values[field];
          }
          if (role !== user?.role) body.role = role;
          if (password) body.password = password;
          if (!Object.keys(body).length)
            invalidStaffForm('Внесите изменения перед сохранением.');
          await request(
            staffApi.users.usersPartialUpdate(
              encodeURIComponent(recordId),
              body,
            ),
          );
          detail.reload();
          if (self) await refreshProfile();
        } else {
          const created = await request(
            staffApi.users.usersCreate({ ...values, role, password }),
          );
          setSelected(created.id);
        }
        users.reload();
      },
      creating ? 'Учётная запись создана.' : 'Изменения сохранены.',
    );
  }

  function toggleActive() {
    if (!user || !recordId || self) return;
    void action.run(
      async () => {
        await request(
          user.is_active
            ? staffApi.users.usersDelete(encodeURIComponent(recordId))
            : staffApi.users.usersPartialUpdate(encodeURIComponent(recordId), {
                is_active: true,
              }),
        );
        detail.reload();
        users.reload();
      },
      user.is_active
        ? 'Учётная запись деактивирована.'
        : 'Учётная запись активирована.',
    );
  }

  return (
    <>
      <div className="staff-workspace-heading">
        <div>
          <h2>Сотрудники</h2>
          <p>
            {users.data
              ? `Активных: ${users.data.filter((account) => account.is_active).length} из ${users.data.length}`
              : 'Учётные записи и роли'}
          </p>
        </div>
        <div className="staff-actions">
          <Button
            variant="outline"
            onClick={users.reload}
            disabled={action.pending || users.loading}
          >
            <RefreshCw /> Обновить
          </Button>
          <Button
            variant="brand"
            disabled={action.pending}
            onClick={() => setSelected('new')}
          >
            <Plus /> Добавить сотрудника
          </Button>
        </div>
      </div>
      <StaffFeedback error={action.error} notice={action.notice} />
      <div className="staff-workbench">
        <section
          className="staff-card staff-list"
          aria-label="Список сотрудников"
        >
          <StaffLoad {...users}>
            <StaffList
              rows={(users.data ?? []).filter(validProfile).map((account) => ({
                id: account.id,
                title: `${account.first_name} ${account.last_name}`,
                subtitle: `${account.email} · ${roleLabels[account.role]}`,
                status: account.is_active ? 'Активна' : 'Неактивна',
                tone: account.is_active ? 'positive' : 'neutral',
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
              Выберите сотрудника из списка или создайте учётную запись.
            </p>
          ) : (
            <StaffLoad {...detail}>
              {(user || creating) && (
                <form
                  className="staff-card staff-form"
                  key={`${selected}-${detail.revision}`}
                  onSubmit={save}
                >
                  <h3>
                    {creating
                      ? 'Новый сотрудник'
                      : `${user?.first_name} ${user?.last_name}`}
                  </h3>
                  <fieldset disabled={action.pending}>
                    <label className="staff-field">
                      Имя
                      <input
                        name="first_name"
                        defaultValue={user?.first_name}
                        required
                      />
                    </label>
                    <label className="staff-field">
                      Фамилия
                      <input
                        name="last_name"
                        defaultValue={user?.last_name}
                        required
                      />
                    </label>
                    <label className="staff-field">
                      Рабочая почта
                      <input
                        name="email"
                        type="email"
                        defaultValue={user?.email}
                        required
                        autoComplete="off"
                      />
                    </label>
                    <label className="staff-field">
                      Роль
                      <select
                        name="role"
                        defaultValue={user?.role ?? 'moderator'}
                        disabled={self}
                      >
                        <option value="moderator">Модератор</option>
                        <option value="admin">Администратор</option>
                      </select>
                    </label>
                    {!self && (
                      <label className="staff-field">
                        {creating ? 'Пароль' : 'Новый пароль'}
                        <input
                          name="password"
                          type="password"
                          minLength={8}
                          maxLength={72}
                          required={creating}
                          autoComplete="new-password"
                        />
                      </label>
                    )}
                  </fieldset>
                  {self && (
                    <p className="staff-hint">
                      Пароль своей учётной записи меняется в разделе «Мой
                      профиль».
                    </p>
                  )}
                  <div className="staff-actions">
                    <Button
                      type="submit"
                      variant="brand"
                      disabled={action.pending}
                    >
                      {creating
                        ? 'Создать учётную запись'
                        : 'Сохранить изменения'}
                    </Button>
                    {user &&
                      !self &&
                      (user.is_active ? (
                        <StaffConfirm
                          trigger={
                            <Button
                              variant="outline"
                              className="staff-danger"
                              disabled={action.pending}
                            >
                              Деактивировать
                            </Button>
                          }
                          title="Деактивировать учётную запись?"
                          description={`Доступ для ${user.email} будет приостановлен, а активные сессии завершатся.`}
                          label="Деактивировать"
                          danger
                          onConfirm={toggleActive}
                        />
                      ) : (
                        <Button
                          variant="outline"
                          disabled={action.pending}
                          onClick={toggleActive}
                        >
                          Активировать
                        </Button>
                      ))}
                  </div>
                </form>
              )}
            </StaffLoad>
          )}
        </div>
      </div>
    </>
  );
}
