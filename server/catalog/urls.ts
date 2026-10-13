import "server-only";
import { isIP } from "node:net";
export function httpsUrl(
  value: unknown,
  allowedHosts?: readonly string[],
): string {
  if (typeof value !== "string" || value.length > 2048)
    throw new Error("Invalid product URL");
  const url = new URL(value);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !url.hostname.includes(".") ||
    isIP(url.hostname) ||
    url.hostname.endsWith(".local") ||
    url.hostname.endsWith(".localhost")
  )
    throw new Error("Invalid product URL");
  if (allowedHosts && !allowedHosts.includes(url.hostname))
    throw new Error("Unapproved product URL host");
  return url.href;
}
export function safePublicUrl(value: unknown): string | null {
  if (value === null) return null;
  try {
    return httpsUrl(value);
  } catch {
    return null;
  }
}
