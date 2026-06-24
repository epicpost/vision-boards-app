import { g as getAccessToken, r as requestAuthDialog, A as API_BASE_URL, h as expireAuthSession } from "./router-Bd-4THC9.mjs";
const likedTemplatesQueryKey = () => ["liked-templates", { limit: 50 }];
function getApiErrorMessage(payload) {
  if (payload.error?.message) return payload.error.message;
  if (payload.message) return payload.message;
  if (typeof payload.detail === "string") return payload.detail;
  if (Array.isArray(payload.detail)) {
    return payload.detail.map((item) => item.msg).filter(Boolean).join(". ");
  }
  return null;
}
async function throwApiError(response, fallback) {
  const payload = await response.json().catch(() => ({}));
  if (payload.error?.code === "TOKEN_EXPIRED") {
    expireAuthSession();
  }
  throw new Error(getApiErrorMessage(payload) ?? `${fallback} failed with ${response.status}`);
}
async function setLike(postTemplateId, liked) {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to like templates.");
  }
  const url = new URL(
    `/api/v1/post-templates/${encodeURIComponent(postTemplateId)}/like`,
    API_BASE_URL
  );
  const response = await fetch(url, {
    method: liked ? "POST" : "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) {
    await throwApiError(response, liked ? "Like request" : "Unlike request");
  }
  return response.json();
}
function likeTemplate(postTemplateId) {
  return setLike(postTemplateId, true);
}
function unlikeTemplate(postTemplateId) {
  return setLike(postTemplateId, false);
}
async function fetchLikedTemplates() {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error("Sign in to view your likes.");
  }
  const url = new URL("/api/v1/me/likes", API_BASE_URL);
  url.searchParams.set("limit", "50");
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) {
    await throwApiError(response, "Likes request");
  }
  return response.json();
}
export {
  likeTemplate as a,
  fetchLikedTemplates as f,
  likedTemplatesQueryKey as l,
  unlikeTemplate as u
};
