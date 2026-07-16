function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface FloorPlanUploadFieldProps {
  id: string;
  label: string;
  image: string | null;
  onChange: (image: string | null) => void;
}

export function FloorPlanUploadField({ id, label, image, onChange }: FloorPlanUploadFieldProps) {
  async function handleFile(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    onChange(await readAsDataUrl(file));
  }

  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type="file" accept="image/*" onChange={(e) => handleFile(e.target.files)} />
      {image ? (
        <div className="image-upload-preview">
          <div className="image-upload-thumb">
            <img src={image} alt={label} />
            <button type="button" className="image-upload-remove" onClick={() => onChange(null)} aria-label={`Remove ${label}`}>
              ✕
            </button>
          </div>
        </div>
      ) : (
        <p className="text-muted field-help">No {label.toLowerCase()} uploaded.</p>
      )}
    </div>
  );
}
