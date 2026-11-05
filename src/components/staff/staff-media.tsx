import { useCallback, useEffect, useRef, type ChangeEvent } from 'react';
import { Trash2 } from 'lucide-react';
import type { StaffRequest } from '@/api/staff';
import type { PhotoApi } from '@/api/staff-content';
import type { RequestParams } from '@/api/generated/http-client';
import { useStaffResource } from '@/hooks/requests/queries/use-staff-resource';
import {
  invalidStaffForm,
  useStaffAction,
} from '@/hooks/requests/mutations/use-staff-action';
import { Button } from '@/components/ui/button';
import { StaffFeedback, StaffLoad } from './staff-controls';
import { StaffConfirm } from './staff-confirm';
import { StaffFilePicker } from './staff-file-picker';

const mimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

function PhotoPreview({
  request,
  api,
  recordId,
  photoId,
  name,
}: {
  request: StaffRequest;
  api: PhotoApi;
  recordId: string;
  photoId: string;
  name: string;
}) {
  const load = useCallback(
    (params: RequestParams) =>
      api.mediaContentList(recordId, photoId, { ...params, format: 'blob' }),
    [api, recordId, photoId],
  );
  const photo = useStaffResource(request, load);
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const link = linkRef.current;
    const image = link?.querySelector('img');
    if (!photo.data || !link || !image) return;
    const url = URL.createObjectURL(photo.data);
    link.href = url;
    image.src = url;
    return () => URL.revokeObjectURL(url);
  }, [photo.data]);

  return (
    <StaffLoad {...photo}>
      {photo.data && (
        <a
          className="staff-photo-preview"
          ref={linkRef}
          target="_blank"
          rel="noopener"
          aria-label={`Открыть фото «${name}»`}
        >
          <img alt={name} />
        </a>
      )}
    </StaffLoad>
  );
}

export function StaffMedia({
  request,
  recordId,
  api,
}: {
  request: StaffRequest;
  recordId: string;
  api: PhotoApi;
}) {
  const load = useCallback(
    (params: RequestParams) => api.mediaList(recordId, params),
    [api, recordId],
  );
  const photos = useStaffResource(request, load);
  const action = useStaffAction();

  function upload(event: ChangeEvent<HTMLInputElement>, photoId?: string) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    void action.run(
      async () => {
        if (
          !file.size ||
          file.size > 10 * 1024 * 1024 ||
          !mimeTypes.includes(file.type)
        ) {
          invalidStaffForm(
            'Выберите файл JPEG, PNG, WebP или GIF размером до 10 МиБ.',
          );
        }
        await request(
          photoId
            ? api.mediaUpdate(recordId, photoId, { file })
            : api.mediaCreate(recordId, { file }),
        );
        photos.reload();
      },
      photoId ? 'Фотография заменена.' : 'Фотография добавлена.',
    );
  }

  function remove(photoId: string) {
    void action.run(async () => {
      await request(api.mediaDelete(recordId, photoId));
      photos.reload();
    }, 'Фотография удалена.');
  }

  return (
    <section className="staff-card staff-media">
      <h3>Фотографии</h3>
      <div className="staff-upload">
        <StaffFilePicker
          label="Прикрепить фото"
          accept={mimeTypes.join(',')}
          disabled={action.pending}
          onChange={upload}
        />
        <span className="staff-hint">JPEG, PNG, WebP или GIF, до 10 МиБ</span>
      </div>
      <StaffFeedback error={action.error} notice={action.notice} />
      <StaffLoad {...photos}>
        {photos.data?.length ? (
          <ul className="staff-photo-grid">
            {photos.data.map((photo) => {
              if (!photo.id) return null;
              const photoId = encodeURIComponent(photo.id);
              const name = photo.original_filename ?? 'Фотография';
              return (
                <li key={photo.id}>
                  <PhotoPreview
                    key={photos.revision}
                    request={request}
                    api={api}
                    recordId={recordId}
                    photoId={photoId}
                    name={name}
                  />
                  <p>{name}</p>
                  <div className="staff-actions">
                    <StaffFilePicker
                      label="Заменить"
                      accept={mimeTypes.join(',')}
                      disabled={action.pending}
                      onChange={(event) => upload(event, photoId)}
                    />
                    <StaffConfirm
                      trigger={
                        <Button
                          variant="outline"
                          className="staff-danger"
                          disabled={action.pending}
                        >
                          <Trash2 /> Удалить
                        </Button>
                      }
                      title="Удалить фотографию?"
                      description={`Файл «${name}» будет удалён из записи.`}
                      label="Удалить"
                      danger
                      onConfirm={() => remove(photoId)}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="staff-empty">У записи пока нет фотографий.</p>
        )}
      </StaffLoad>
    </section>
  );
}
