import { g as getAccessToken, r as requestAuthDialog, A as API_BASE_URL, h as expireAuthSession } from "./router-Bd-4THC9.mjs";
const boardsQueryKey = (suggestFor) => ["boards", { limit: 50, suggestFor: suggestFor ?? null }];
function getApiErrorMessage(payload) {
  if (payload.error?.message) return payload.error.message;
  if (payload.message) return payload.message;
  if (typeof payload.detail === "string") return payload.detail;
  if (Array.isArray(payload.detail)) {
    return payload.detail.map((item) => item.msg).filter(Boolean).join(". ");
  }
  return null;
}
function isTokenExpiredError(payload) {
  return payload.error?.code === "TOKEN_EXPIRED";
}
function normalizeAsset(asset, index) {
  if (typeof asset === "string") {
    return {
      id: `${asset}-${index}`,
      url: asset,
      type: "image",
      order: index
    };
  }
  const url = asset.url ?? asset.preview ?? asset.img_preview;
  if (!url) return null;
  return {
    id: String(asset.id ?? `${url}-${index}`),
    url,
    type: asset.type ?? "image",
    order: asset.order ?? index
  };
}
function normalizeBoard(board) {
  const rawAssets = board.preview_assets ?? board.previews ?? board.thumbs ?? board.pins ?? board.last_template_previews ?? [];
  return {
    id: String(board.id ?? board.name ?? board.title ?? crypto.randomUUID()),
    name: board.name ?? board.title ?? "Untitled board",
    template_count: board.post_templates_count ?? board.template_count ?? board.pin_count ?? board.pins_count ?? board.last_template_previews?.length ?? 0,
    is_secret: board.is_secret ?? board.secret ?? board.visibility === "secret",
    is_archived: board.is_archived ?? board.archived ?? false,
    is_top_choice: board.is_top_choice ?? false,
    updated_at: board.updated_at ?? board.created_at ?? null,
    preview_assets: rawAssets.map((asset, index) => normalizeAsset(asset, index)).filter((asset) => Boolean(asset)).sort((a, b) => a.order - b.order)
  };
}
async function fetchBoards(suggestFor) {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to view your boards.");
  }
  const url = new URL("/api/v1/me/boards", API_BASE_URL);
  url.searchParams.set("view", "short");
  url.searchParams.set("limit", "50");
  if (suggestFor) {
    url.searchParams.set("suggest_for", suggestFor);
  }
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorPayload = payload;
    if (isTokenExpiredError(errorPayload)) {
      expireAuthSession();
    }
    throw new Error(
      getApiErrorMessage(errorPayload) ?? `Boards request failed with ${response.status}`
    );
  }
  const data = Array.isArray(payload) ? payload : payload.data ?? payload.boards ?? [];
  return {
    data: data.map(normalizeBoard),
    pagination: Array.isArray(payload) ? void 0 : payload.pagination
  };
}
async function saveTemplateToBoard(postTemplateId, boardId) {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to save templates.");
  }
  const url = new URL(
    `/api/v1/post-templates/${encodeURIComponent(postTemplateId)}/save`,
    API_BASE_URL
  );
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ board_id: boardId })
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    if (isTokenExpiredError(payload)) {
      expireAuthSession();
    }
    throw new Error(getApiErrorMessage(payload) ?? `Save request failed with ${response.status}`);
  }
}
async function unsaveTemplateFromBoard(postTemplateId, boardId) {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to manage saved templates.");
  }
  const url = new URL(
    `/api/v1/post-templates/${encodeURIComponent(postTemplateId)}/save`,
    API_BASE_URL
  );
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ board_id: boardId })
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    if (isTokenExpiredError(payload)) {
      expireAuthSession();
    }
    throw new Error(getApiErrorMessage(payload) ?? `Unsave request failed with ${response.status}`);
  }
}
async function deleteBoard(boardId) {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to delete boards.");
  }
  const response = await fetch(
    new URL(`/api/v1/boards/${encodeURIComponent(boardId)}`, API_BASE_URL),
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    if (isTokenExpiredError(payload)) {
      expireAuthSession();
    }
    throw new Error(getApiErrorMessage(payload) ?? `Delete request failed with ${response.status}`);
  }
}
const BOARD_FEED_CATEGORIES_CACHE_KEY = "epicpost.board-feed-categories";
function readCachedBoardFeedCategories() {
  if (typeof window === "undefined") return void 0;
  try {
    const raw = window.localStorage.getItem(BOARD_FEED_CATEGORIES_CACHE_KEY);
    if (!raw) return void 0;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return void 0;
    return parsed.filter(
      (item) => Boolean(item) && typeof item.id === "string" && typeof item.name === "string"
    ).map((item) => ({ id: item.id, name: item.name }));
  } catch {
    return void 0;
  }
}
function writeCachedBoardFeedCategories(categories) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      BOARD_FEED_CATEGORIES_CACHE_KEY,
      JSON.stringify(categories.map((category) => ({ id: category.id, name: category.name })))
    );
  } catch {
  }
}
async function fetchBoardFeedCategories() {
  const token = getAccessToken();
  if (!token) return [];
  const response = await fetchBoards();
  return response.data.map((board) => ({ id: board.id, name: board.name }));
}
export {
  fetchBoardFeedCategories as a,
  boardsQueryKey as b,
  deleteBoard as d,
  fetchBoards as f,
  readCachedBoardFeedCategories as r,
  saveTemplateToBoard as s,
  unsaveTemplateFromBoard as u,
  writeCachedBoardFeedCategories as w
};
