import { Upload } from 'lucide-react';
import type { ChangeEvent } from 'react';

export function StaffFilePicker({
  label,
  accept,
  filename,
  disabled,
  required,
  onChange,
}: {
  label: string;
  accept: string;
  filename?: string;
  disabled?: boolean;
  required?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="staff-file">
      <label className="staff-file-picker">
        <Upload aria-hidden="true" size={17} />
        {label}
        <input
          type="file"
          name="file"
          accept={accept}
          disabled={disabled}
          required={required}
          onChange={onChange}
        />
      </label>
      {filename && <span className="staff-hint">{filename}</span>}
    </div>
  );
}
