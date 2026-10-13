import "server-only";
export interface ImageAttributes {
  category?: string;
  colors: string[];
  materials: string[];
  style: string[];
  // Attribute extraction only. Models must not generate products, prices or savings.
}
export interface ImageRecognitionProvider {
  recognize(input: {
    bytes: Uint8Array;
    mime: string;
  }): Promise<ImageAttributes>;
}
export function validateImageInput(bytes: Uint8Array, mime: string) {
  if (!bytes.length || bytes.length > 5 * 1024 * 1024)
    throw new Error("Invalid image size");
  const matches =
    mime === "image/png"
      ? [137, 80, 78, 71, 13, 10, 26, 10].every((b, i) => bytes[i] === b)
      : mime === "image/jpeg"
        ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
        : mime === "image/webp"
          ? String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
            String.fromCharCode(...bytes.slice(8, 12)) === "WEBP"
          : false;
  if (!matches) throw new Error("Invalid image format");
  // Before an actual provider is enabled, add decoded dimension/pixel limits and metadata stripping.
}
export class UnavailableImageRecognizer implements ImageRecognitionProvider {
  async recognize(): Promise<ImageAttributes> {
    throw new Error("Image recognition is not implemented.");
  }
}
