export type Preview = FileReader["result"];

export function generatePreview({
  file,
  onSuccess,
}: {
  file: File;
  onSuccess: (preview: Preview) => void;
}): void {
  const reader = new FileReader();
  reader.onloadend = () => {
    onSuccess(reader.result);
  };
  reader.readAsDataURL(file);
}
