import type { FormEvent } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { staffBase, type StaffPhoto, type StaffRequest } from '@/api/staff';
import { useStaffResource } from '@/hooks/requests/queries/use-staff-resource';
import {
  invalidStaffForm,
  useStaffAction,
} from '@/hooks/requests/mutations/use-staff-action';
import { Button } from '@/components/ui/button';
import { StaffFeedback, StaffLoad } from './staff-controls';

const mimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export function StaffMedia({
  request,
  recordPath,
}: {
  request: StaffRequest;
  recordPath: string;
}) {
  const path = `${recordPath}/media`;
  const photos = useStaffResource<StaffPhoto[]>(request, path);
  const action = useStaffAction();

  function upload(event: FormEvent<HTMLFormElement>, photoPath?: string) {
    event.preventDefault();
    const form = event.currentTarget;
    const body = new FormData(form);
    const file = body.get('file');
    void action.run(
      async () => {
        if (
          !(file instanceof File) ||
          !file.size ||
          file.size > 10 * 1024 * 1024 ||
          !mimeTypes.includes(file.type)
        ) {
          invalidStaffForm(
            'Выберите файл JPEG, PNG, WebP или GIF размером до 10 МиБ.',
          );
        }
        await request(photoPath ?? path, {
          method: photoPath ? 'PUT' : 'POST',
          body,
        });
        form.reset();
        photos.reload();
      },
      photoPath ? 'Фотография заменена.' : 'Фотография добавлена.',
    );
  }

  function remove(photoPath: string) {
    if (!window.confirm('Удалить эту фотографию из записи?')) return;
    void action.run(async () => {
      await request(photoPath, { method: 'DELETE' });
      photos.reload();
    }, 'Фотография удалена.');
  }

  return (
    <section className="staff-card staff-media">
      <h3>Фотографии</h3>
      <form className="staff-upload" onSubmit={upload}>
        <label className="staff-field">
          Новая фотография
          <input
            type="file"
            name="file"
            accept={mimeTypes.join(',')}
            required
            disabled={action.pending}
          />
        </label>
        <Button type="submit" variant="outline" disabled={action.pending}>
          <ImagePlus /> Добавить фото
        </Button>
      </form>
      <StaffFeedback error={action.error} notice={action.notice} />
      <StaffLoad {...photos}>
        {photos.data?.length ? (
          <ul className="staff-photo-grid">
            {photos.data.map((photo) => {
              const photoPath = `${path}/${encodeURIComponent(photo.id)}`;
              const image = `${staffBase}${photoPath}/content`;
              return (
                <li key={photo.id}>
                  <a href={image} target="_blank" rel="noopener">
                    <img
                      src={image}
                      loading="lazy"
                      alt={photo.original_filename}
                    />
                  </a>
                  <p>{photo.original_filename}</p>
                  <form onSubmit={(event) => upload(event, photoPath)}>
                    <label className="staff-field">
                      Новый файл
                      <input
                        type="file"
                        name="file"
                        accept={mimeTypes.join(',')}
                        required
                        disabled={action.pending}
                      />
                    </label>
                    <div className="staff-actions">
                      <Button
                        type="submit"
                        variant="outline"
                        disabled={action.pending}
                      >
                        Заменить
                      </Button>
                      <Button
                        variant="outline"
                        disabled={action.pending}
                        onClick={() => remove(photoPath)}
                      >
                        <Trash2 /> Удалить
                      </Button>
                    </div>
                  </form>
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
