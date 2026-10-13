export const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
export const imageTypes = ["image/jpeg", "image/png", "image/webp"];
export function validateImage(
  file: Pick<File, "type" | "size">,
): string | null {
  if (!imageTypes.includes(file.type))
    return "Bitte wähle ein JPG-, PNG- oder WebP-Bild.";
  if (!file.size) return "Diese Datei ist leer. Bitte wähle ein anderes Bild.";
  if (file.size > MAX_IMAGE_SIZE)
    return "Das Bild ist zu groß. Erlaubt sind maximal 5 MB.";
  return null;
}
