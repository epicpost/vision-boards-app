// File-backed remix store for legacy local remix ids. Current templates save
// through `/api/v1/post-templates/{id}/remixes`; this remains so older saved
// `local-...` remixes can still be opened, updated and deleted.
//
// A local remix's id is prefixed (`local-…`) so `lib/remixes.ts` can route
// fetch/update/delete calls here purely from the id, without needing to know
// which template it belongs to.

import { createServerFn } from "@tanstack/react-start";
import { createHash, randomUUID } from "node:crypto";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { serverDataDir } from "@/lib/server-data-dir";
import { assetsFromLayers, type RemixEditorAsset, type RemixEditorState } from "@/lib/remix-editor";

export const LOCAL_REMIX_ID_PREFIX = "local-";

export function isLocalRemixId(id: string): boolean {
  return id.startsWith(LOCAL_REMIX_ID_PREFIX);
}

interface LocalRemixRecord {
  remix_id: string;
  post_template_id: string;
  template_title: string;
  created_at: string;
  updated_at: string;
  state: RemixEditorState;
  thumbnail_url: string | null;
}

export interface LocalRemixDetail {
  remix_id: string;
  post_template_id: string;
  is_public: boolean;
  created_at: string;
  state: RemixEditorState;
  assets: RemixEditorAsset[];
}

export interface LocalRemixSummary {
  remix_id: string;
  post_template_id: string;
  template_title: string;
  created_at: string;
  thumbnail_url: string | null;
  caption: string | null;
}

const STORE_DIR = serverDataDir("local-remixes");

// One subdirectory per user scope (hashed, so an arbitrary scope id can't
// escape the store dir) — lets `list` enumerate a user's remixes with a single
// `readdir` instead of scanning every file and filtering by scope.
function scopeDir(scopeId: string): string {
  const hash = createHash("sha256").update(scopeId).digest("hex");
  return join(STORE_DIR, hash);
}

function recordPath(scopeId: string, remixId: string): string {
  return join(scopeDir(scopeId), `${remixId}.json`);
}

async function readRecord(scopeId: string, remixId: string): Promise<LocalRemixRecord | null> {
  try {
    const raw = await readFile(recordPath(scopeId, remixId), "utf8");
    return JSON.parse(raw) as LocalRemixRecord;
  } catch {
    return null;
  }
}

async function writeRecord(scopeId: string, record: LocalRemixRecord): Promise<void> {
  await mkdir(scopeDir(scopeId), { recursive: true });
  await writeFile(recordPath(scopeId, record.remix_id), JSON.stringify(record), "utf8");
}

function toDetail(record: LocalRemixRecord): LocalRemixDetail {
  return {
    remix_id: record.remix_id,
    post_template_id: record.post_template_id,
    is_public: false,
    created_at: record.created_at,
    state: record.state,
    // Rebuilt from the saved layers rather than stored separately, so it can
    // never drift from what the layers actually reference.
    assets: assetsFromLayers(record.state.layers ?? []),
  };
}

function normalizeScope(scopeId: unknown): string {
  return typeof scopeId === "string" && scopeId.trim() ? scopeId.trim() : "anon";
}

function normalizeRemixId(remixId: unknown): string {
  if (typeof remixId !== "string" || !isLocalRemixId(remixId)) {
    throw new Error("remixId must be a local remix id");
  }
  return remixId;
}

export const createLocalRemix = createServerFn({ method: "POST" })
  .validator(
    (data: {
      scopeId?: string;
      templateId: string;
      templateTitle: string;
      state: RemixEditorState;
      thumbnailUrl?: string | null;
    }) => ({
      scopeId: normalizeScope(data?.scopeId),
      templateId: data.templateId,
      templateTitle: data.templateTitle,
      state: data.state,
      thumbnailUrl: data.thumbnailUrl ?? null,
    }),
  )
  .handler(async ({ data }): Promise<{ remix_id: string }> => {
    const remixId = `${LOCAL_REMIX_ID_PREFIX}${randomUUID()}`;
    const now = new Date().toISOString();
    await writeRecord(data.scopeId, {
      remix_id: remixId,
      post_template_id: data.templateId,
      template_title: data.templateTitle,
      created_at: now,
      updated_at: now,
      state: data.state,
      thumbnail_url: data.thumbnailUrl,
    });
    return { remix_id: remixId };
  });

export const fetchLocalRemix = createServerFn({ method: "GET" })
  .validator((data: { remixId: string; scopeId?: string }) => ({
    remixId: normalizeRemixId(data?.remixId),
    scopeId: normalizeScope(data?.scopeId),
  }))
  .handler(async ({ data }): Promise<LocalRemixDetail | null> => {
    const record = await readRecord(data.scopeId, data.remixId);
    return record ? toDetail(record) : null;
  });

export const updateLocalRemix = createServerFn({ method: "POST" })
  .validator(
    (data: {
      remixId: string;
      scopeId?: string;
      state: RemixEditorState;
      thumbnailUrl?: string | null;
    }) => ({
      remixId: normalizeRemixId(data?.remixId),
      scopeId: normalizeScope(data?.scopeId),
      state: data.state,
      thumbnailUrl: data.thumbnailUrl,
    }),
  )
  .handler(async ({ data }): Promise<LocalRemixDetail> => {
    const existing = await readRecord(data.scopeId, data.remixId);
    if (!existing) throw new Error("Remix not found.");
    const next: LocalRemixRecord = {
      ...existing,
      state: data.state,
      updated_at: new Date().toISOString(),
      thumbnail_url: data.thumbnailUrl !== undefined ? data.thumbnailUrl : existing.thumbnail_url,
    };
    await writeRecord(data.scopeId, next);
    return toDetail(next);
  });

export const deleteLocalRemix = createServerFn({ method: "POST" })
  .validator((data: { remixId: string; scopeId?: string }) => ({
    remixId: normalizeRemixId(data?.remixId),
    scopeId: normalizeScope(data?.scopeId),
  }))
  .handler(async ({ data }): Promise<void> => {
    await rm(recordPath(data.scopeId, data.remixId), { force: true });
  });

export const listLocalRemixes = createServerFn({ method: "GET" })
  .validator((data: { scopeId?: string }) => ({ scopeId: normalizeScope(data?.scopeId) }))
  .handler(async ({ data }): Promise<LocalRemixSummary[]> => {
    let filenames: string[];
    try {
      filenames = await readdir(scopeDir(data.scopeId));
    } catch {
      return [];
    }
    const records = await Promise.all(
      filenames
        .filter((name) => name.endsWith(".json"))
        .map(async (name) => {
          try {
            const raw = await readFile(join(scopeDir(data.scopeId), name), "utf8");
            return JSON.parse(raw) as LocalRemixRecord;
          } catch {
            return null;
          }
        }),
    );
    return records
      .filter((record): record is LocalRemixRecord => record !== null)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))
      .map((record) => ({
        remix_id: record.remix_id,
        post_template_id: record.post_template_id,
        template_title: record.template_title,
        created_at: record.created_at,
        thumbnail_url: record.thumbnail_url,
        caption: record.state.caption ?? null,
      }));
  });
