import { useCallback, useEffect, useRef, useState } from "react";
import { getAuthUser } from "@/lib/auth";
import {
  assetIdsFromLayers,
  remixStateFromLayers,
  type EditorLayer,
  type RemixEditorTemplate,
} from "@/lib/remix-editor";
import { loadEditorDraft, saveEditorDraft } from "@/lib/editor-drafts";
import { uploadRemixThumbnail } from "@/lib/generations";
import { updateRemix } from "@/lib/remixes";

export type DraftStatus = "idle" | "loading" | "saving" | "saved" | "error";

// Stable per-user scope so drafts don't leak across accounts on a shared device.
function draftScopeId(): string {
  return getAuthUser()?.id ?? "anon";
}

function hasTemporaryImagePreview(layers: EditorLayer[]): boolean {
  return layers.some((layer) => layer.kind === "image" && layer.src.startsWith("blob:"));
}

/**
 * Autosaves the editor's layer state to the backend on every change (debounced)
 * and loads the last saved draft on mount. Returns the hydrated layers (once),
 * a save-status indicator, and a `clearDraft` for "reset to defaults".
 */
export function useEditorDraft(
  templateId: string,
  layers: EditorLayer[],
  onHydrate: (layers: EditorLayer[]) => void,
  options?: { enabled?: boolean },
) {
  // Disabled when the editor is bound to a remix — the remix is the source of
  // truth then, so the per-template file draft must not load over it or save.
  const enabled = options?.enabled ?? true;
  const [status, setStatus] = useState<DraftStatus>(enabled ? "loading" : "idle");
  const hydratedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Serializes saves: never run two in flight, and never lose the latest edit.
  const pendingRef = useRef<EditorLayer[] | null>(null);
  const inFlightRef = useRef(false);

  // Load the saved draft once, before we start autosaving over it.
  useEffect(() => {
    if (!enabled) {
      hydratedRef.current = true;
      setStatus("idle");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    loadEditorDraft({ data: { templateId, scopeId: draftScopeId() } })
      .then((draft) => {
        if (cancelled) return;
        if (draft?.layers?.length) onHydrate(draft.layers);
        hydratedRef.current = true;
        setStatus("idle");
      })
      .catch(() => {
        if (cancelled) return;
        hydratedRef.current = true;
        setStatus("idle");
      });
    return () => {
      cancelled = true;
    };
    // Only re-run if the edited template changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId, enabled]);

  const flush = useCallback(
    async (next: EditorLayer[]) => {
      if (inFlightRef.current) {
        pendingRef.current = next;
        return;
      }
      inFlightRef.current = true;
      setStatus("saving");
      try {
        await saveEditorDraft({ data: { templateId, scopeId: draftScopeId(), layers: next } });
        setStatus("saved");
      } catch {
        setStatus("error");
      } finally {
        inFlightRef.current = false;
        const queued = pendingRef.current;
        pendingRef.current = null;
        if (queued) void flush(queued);
      }
    },
    [templateId],
  );

  // Debounced autosave on every layer change (after the initial hydrate).
  useEffect(() => {
    if (!enabled || !hydratedRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void flush(layers), 600);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [layers, flush, enabled]);

  return { status };
}

/**
 * Autosaves the editor's layer state to a DB-backed remix (debounced). Unlike
 * `useEditorDraft` it doesn't hydrate — the editor page loads the remix and
 * seeds the layers before mounting this. `asset_ids` are only re-synced when the
 * attached images actually changed (e.g. the user replaced a photo).
 */
export function useRemixDraft(
  remixId: string | undefined,
  layers: EditorLayer[],
  template: RemixEditorTemplate,
) {
  const [status, setStatus] = useState<DraftStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<EditorLayer[] | null>(null);
  const inFlightRef = useRef(false);
  const templateRef = useRef(template);
  // Skip saving the freshly-loaded remix back immediately; just record its
  // attachment baseline so the first real edit can detect asset changes.
  const firstRef = useRef(true);
  const lastAssetKeyRef = useRef<string>("");

  useEffect(() => {
    templateRef.current = template;
  }, [template]);

  const flush = useCallback(
    async (next: EditorLayer[]) => {
      if (!remixId) return;
      if (hasTemporaryImagePreview(next)) return;
      if (inFlightRef.current) {
        pendingRef.current = next;
        return;
      }
      inFlightRef.current = true;
      setStatus("saving");
      try {
        const currentTemplate = templateRef.current;
        const assetIds = assetIdsFromLayers(next);
        const assetKey = assetIds.join(",");
        const assetsChanged = assetKey !== lastAssetKeyRef.current;
        // Re-render the creative and upload it so the remixes-list thumbnail
        // reflects this edit. Best-effort (resolves to undefined on failure), so
        // a thumbnail hiccup never blocks persisting the layer state.
        const thumbnail = await uploadRemixThumbnail(currentTemplate, next);
        await updateRemix(remixId, {
          state: remixStateFromLayers(next, { aspectRatio: currentTemplate.aspectRatio }),
          assetIds: assetsChanged ? assetIds : undefined,
          thumbnailAssetId: thumbnail?.assetId,
          thumbnailUrl: thumbnail?.url,
        });
        lastAssetKeyRef.current = assetKey;
        setStatus("saved");
      } catch {
        setStatus("error");
      } finally {
        inFlightRef.current = false;
        const queued = pendingRef.current;
        pendingRef.current = null;
        if (queued) void flush(queued);
      }
    },
    [remixId],
  );

  useEffect(() => {
    if (!remixId) return;
    if (firstRef.current) {
      firstRef.current = false;
      lastAssetKeyRef.current = assetIdsFromLayers(layers).join(",");
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    if (hasTemporaryImagePreview(layers)) return;
    timerRef.current = setTimeout(() => void flush(layers), 600);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [layers, remixId, flush, template.aspectRatio]);

  return { status };
}
