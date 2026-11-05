import { useState, type FormEvent } from 'react';
import { staffApi, type StaffRequest } from '@/api/staff';
import { useStaffAction } from '@/hooks/requests/mutations/use-staff-action';
import { Button } from '@/components/ui/button';
import { downloadBlob } from '@/utils/download-blob';
import { documentFile } from './content-fields';
import { StaffFeedback } from './staff-controls';
import { StaffFilePicker } from './staff-file-picker';

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
  const [chosenName, setChosenName] = useState('');
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
      setChosenName('');
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
        <StaffFilePicker
          label="Выбрать новый файл"
          accept=".pdf,.doc,.docx"
          filename={chosenName}
          required
          disabled={action.pending}
          onChange={(event) =>
            setChosenName(event.currentTarget.files?.[0]?.name ?? '')
          }
        />
        <Button type="submit" variant="outline" disabled={action.pending}>
          Заменить файл
        </Button>
      </form>
      <StaffFeedback error={action.error} notice={action.notice} />
    </section>
  );
}
