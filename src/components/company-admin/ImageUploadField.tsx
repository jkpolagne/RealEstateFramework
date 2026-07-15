function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface ImageUploadFieldProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export function ImageUploadField({ images, onChange }: ImageUploadFieldProps) {
  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const dataUrls = await Promise.all(Array.from(fileList).map(readAsDataUrl));
    onChange([...images, ...dataUrls]);
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="field">
      <label htmlFor="property-images">Property images</label>
      <input
        id="property-images"
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFiles(e.target.files)}
      />
      {images.length === 0 ? (
        <p className="text-muted">No images selected — a placeholder image set will be used.</p>
      ) : (
        <div className="image-upload-preview">
          {images.map((src, i) => (
            <div key={i} className="image-upload-thumb">
              <img src={src} alt={`Upload ${i + 1}`} />
              <button type="button" className="image-upload-remove" onClick={() => removeImage(i)} aria-label="Remove image">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
