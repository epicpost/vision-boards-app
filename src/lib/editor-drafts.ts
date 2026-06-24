import { createServerFn } from "@tanstack/react-start";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { EditorLayer } from "@/lib/remix-editor";

// File-backed draft store for the creative editor. Every canvas change the
// client makes is autosaved here, keyed by (scope, template), so reopening the
// editor restores the last saved state. The dev server (Nitro on Node) and any
// long-lived Node host persist to disk; on ephemeral serverless hosts this acts
// as a best-effort cache and should be swapped for D1/KV by binding a real store
// in `loadDraftFile`/`saveDraftFile`.

export interface EditorDraft {
  templateId: string;
  layers: EditorLayer[];
  updatedAt: string;
}

interface DraftKey {
  // Per-user scope so two people editing the same template don't clobber each
  // other. Falls back to "anon" for signed-out sessions.
  scopeId: string;
  templateId: string;
}

const DRAFT_DIR = join(process.cwd(), ".data", "editor-drafts");

// Hash the key into a flat, filesystem-safe filename so arbitrary template/user
// ids can't escape the draft directory.
function draftPath({ scopeId, templateId }: DraftKey): string {
  const hash = createHash("sha256").update(`${scopeId}::${templateId}`).digest("hex");
  return join(DRAFT_DIR, `${hash}.json`);
}

async function loadDraftFile(key: DraftKey): Promise<EditorDraft | null> {
  try {
    const raw = await readFile(draftPath(key), "utf8");
    return JSON.parse(raw) as EditorDraft;
  } catch {
    return null;
  }
}

async function saveDraftFile(key: DraftKey, draft: EditorDraft): Promise<void> {
  await mkdir(DRAFT_DIR, { recursive: true });
  await writeFile(draftPath(key), JSON.stringify(draft), "utf8");
}

function normalizeScope(scopeId: unknown): string {
  return typeof scopeId === "string" && scopeId.trim() ? scopeId.trim() : "anon";
}

function normalizeTemplateId(templateId: unknown): string {
  if (typeof templateId !== "string" || !templateId.trim()) {
    throw new Error("templateId is required");
  }
  return templateId.trim();
}

export const loadEditorDraft = createServerFn({ method: "GET" })
  .validator((data: { templateId: string; scopeId?: string }) => ({
    templateId: normalizeTemplateId(data?.templateId),
    scopeId: normalizeScope(data?.scopeId),
  }))
  .handler(async ({ data }): Promise<EditorDraft | null> => {
    return loadDraftFile(data);
  });

export const saveEditorDraft = createServerFn({ method: "POST" })
  .validator((data: { templateId: string; scopeId?: string; layers: EditorLayer[] }) => {
    if (!Array.isArray(data?.layers)) throw new Error("layers must be an array");
    return {
      templateId: normalizeTemplateId(data?.templateId),
      scopeId: normalizeScope(data?.scopeId),
      layers: data.layers,
    };
  })
  .handler(async ({ data }): Promise<EditorDraft> => {
    const draft: EditorDraft = {
      templateId: data.templateId,
      layers: data.layers,
      updatedAt: new Date().toISOString(),
    };
    await saveDraftFile({ scopeId: data.scopeId, templateId: data.templateId }, draft);
    return draft;
  });
