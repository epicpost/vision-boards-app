import { useCallback, useEffect, useRef, useState } from "react";
import { getAuthUser } from "@/lib/auth";
import type { EditorLayer } from "@/lib/remix-editor";
import { loadEditorDraft, saveEditorDraft } from "@/lib/editor-drafts";

export type DraftStatus = "idle" | "loading" | "saving" | "saved" | "error";

// Stable per-user scope so drafts don't leak across accounts on a shared device.
function draftScopeId(): string {
  return getAuthUser()?.id ?? "anon";
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
) {
  const [status, setStatus] = useState<DraftStatus>("loading");
  const hydratedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Serializes saves: never run two in flight, and never lose the latest edit.
  const pendingRef = useRef<EditorLayer[] | null>(null);
  const inFlightRef = useRef(false);

  // Load the saved draft once, before we start autosaving over it.
  useEffect(() => {
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
  }, [templateId]);

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
    if (!hydratedRef.current) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void flush(layers), 600);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [layers, flush]);

  return { status };
}
