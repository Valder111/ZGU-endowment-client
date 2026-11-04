import { useState, type FormEvent } from 'react';
import { staffApi, type StaffRequest } from '@/api/staff';
import { useStaffAction } from '@/hooks/requests/mutations/use-staff-action';
import { Button } from '@/components/ui/button';
import { downloadBlob } from '@/utils/download-blob';
import { documentFile } from './content-fields';
import { StaffFeedback } from './staff-controls';

export function StaffDocumentFile({
  request,
  recordId,
  filename,
}: {
  request: StaffRequest;
  recordId: string;
  filename?: string;
}) {
  const action = useStaffAction();
  const [replacementName, setReplacementName] = useState<string>();
  const currentName = replacementName ?? filename;

  function download() {
    void action.run(async () => {
      const file = await request(
        staffApi.documents.contentList(recordId, { format: 'blob' }),
      );
      downloadBlob(file, currentName ?? 'document');
    }, '');
  }

  function replace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    void action.run(async () => {
      const file = documentFile(new FormData(form));
      const updated = await request(
        staffApi.documents.fileUpdate(recordId, { file }),
      );
      setReplacementName(updated.original_filename ?? file.name);
      form.reset();
    }, 'Файл заменён.');
  }

  return (
    <section className="staff-card staff-form">
      <h3>Файл документа</h3>
      <p>{currentName}</p>
      <div className="staff-actions">
        <Button variant="outline" disabled={action.pending} onClick={download}>
          Скачать файл
        </Button>
      </div>
      <form className="staff-upload" onSubmit={replace}>
        <label className="staff-field">
          Новый файл
          <input
            name="file"
            type="file"
            accept=".pdf,.doc,.docx"
            required
            disabled={action.pending}
          />
        </label>
        <Button type="submit" variant="outline" disabled={action.pending}>
          Заменить файл
        </Button>
      </form>
      <StaffFeedback error={action.error} notice={action.notice} />
    </section>
  );
}
