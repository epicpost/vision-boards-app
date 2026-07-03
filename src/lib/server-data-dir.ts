// Resolve a writable base directory for the file-backed server stores
// (editor drafts, local remixes). On a long-lived Node host (local dev, a VM,
// a container) this is `<cwd>/.data`. On ephemeral serverless hosts the
// deployment root — `process.cwd()` === `/var/task` on Vercel/AWS Lambda — is
// read-only, so `mkdir('/var/task/.data')` throws ENOENT/EROFS and every save
// crashes. There, the OS temp dir (`/tmp`, ~512 MB, writable and shared across
// invocations of a warm instance) is the only writable path, so we fall back to
// it. `EPICPOST_DATA_DIR` overrides both (e.g. a mounted persistent volume).
//
// This keeps the stores as a best-effort cache on serverless (a cold instance
// starts empty) — swap in a real store (D1/KV/S3) for durable persistence.

import { tmpdir } from "node:os";
import { join } from "node:path";

function resolveBase(): string {
  const override = process.env.EPICPOST_DATA_DIR?.trim();
  if (override) return override;
  // Serverless indicators: Vercel, AWS Lambda (also used by Vercel functions),
  // and Netlify. Any of these means `process.cwd()` is read-only.
  const serverless =
    process.env.VERCEL ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.NETLIFY;
  if (serverless) return join(tmpdir(), "epicpost-data");
  return join(process.cwd(), ".data");
}

const DATA_ROOT = resolveBase();

// Join path segments under the resolved writable data root.
export function serverDataDir(...segments: string[]): string {
  return join(DATA_ROOT, ...segments);
}
