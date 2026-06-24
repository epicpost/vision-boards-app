import { A as API_BASE_URL, g as getAccessToken, r as requestAuthDialog, h as expireAuthSession } from "./router-Bd-4THC9.mjs";
function getApiErrorMessage(payload) {
  if (payload.error?.message) return payload.error.message;
  if (payload.message) return payload.message;
  if (typeof payload.detail === "string") return payload.detail;
  if (Array.isArray(payload.detail)) {
    return payload.detail.map((item) => item.msg).filter(Boolean).join(". ");
  }
  return null;
}
function requireToken(action) {
  const token = getAccessToken();
  if (!token) {
    requestAuthDialog();
    throw new Error(`Sign in to ${action}.`);
  }
  return token;
}
async function throwApiError(response, fallback) {
  const payload = await response.json().catch(() => ({}));
  if (payload.error?.code === "TOKEN_EXPIRED") {
    expireAuthSession();
  }
  throw new Error(getApiErrorMessage(payload) ?? `${fallback} failed with ${response.status}`);
}
const remixesQueryKey = () => ["remixes", { limit: 50 }];
async function fetchRemixes({
  cursor,
  limit = 50
} = {}) {
  const token = requireToken("view your remixes");
  const url = new URL("/api/v1/generations/remixes", API_BASE_URL);
  url.searchParams.set("limit", String(limit));
  if (cursor) url.searchParams.set("cursor", cursor);
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  if (!response.ok) {
    await throwApiError(response, "Remixes request");
  }
  return response.json();
}
async function deleteRemix(generationId) {
  const token = requireToken("delete this remix");
  const response = await fetch(
    new URL(`/api/v1/generations/${encodeURIComponent(generationId)}`, API_BASE_URL),
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  if (!response.ok) {
    await throwApiError(response, "Delete remix");
  }
}
async function uploadAssetFiles(files) {
  const token = requireToken("upload images");
  const form = new FormData();
  files.forEach((file) => form.append("files", file, file.name));
  const response = await fetch(new URL("/api/v1/me/assets/upload", API_BASE_URL), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });
  if (!response.ok) {
    await throwApiError(response, "Image upload");
  }
  const payload = await response.json();
  return payload.assets;
}
async function remixTemplate(params) {
  const token = requireToken("remix templates");
  const response = await fetch(new URL("/api/v1/generations/remix", API_BASE_URL), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      template_id: params.templateId,
      asset_ids: params.assetIds,
      caption: params.caption || null,
      aspect_ratio: params.aspectRatio || null,
      font_id: params.fontId || null,
      caption_color: params.captionColor || null
    })
  });
  if (!response.ok) {
    await throwApiError(response, "Remix request");
  }
  return response.json();
}
async function remixTemplateUpload(params) {
  const token = requireToken("remix templates");
  const form = new FormData();
  form.append("template_id", params.templateId);
  if (params.caption) form.append("caption", params.caption);
  if (params.aspectRatio) form.append("aspect_ratio", params.aspectRatio);
  if (params.fontId) form.append("font_id", params.fontId);
  if (params.captionColor) form.append("caption_color", params.captionColor);
  params.files.forEach((file) => form.append("images", file, file.name));
  const response = await fetch(new URL("/api/v1/generations/remix-upload", API_BASE_URL), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: form
  });
  if (!response.ok) {
    await throwApiError(response, "Remix request");
  }
  return response.json();
}
async function fetchGenerationResult(generationId) {
  const token = requireToken("view generations");
  const response = await fetch(
    new URL(`/api/v1/generations/${encodeURIComponent(generationId)}`, API_BASE_URL),
    {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }
  );
  if (!response.ok) {
    await throwApiError(response, "Generation status request");
  }
  return response.json();
}
async function waitForGeneration(initial, { intervalMs = 1500, timeoutMs = 9e4 } = {}) {
  let result = initial;
  const deadline = Date.now() + timeoutMs;
  while (result.status === "queued" || result.status === "processing") {
    if (Date.now() >= deadline) {
      throw new Error("The remix is taking longer than expected. Please try again.");
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
    result = await fetchGenerationResult(result.generation_id);
  }
  return result;
}
export {
  remixTemplate as a,
  remixTemplateUpload as b,
  deleteRemix as d,
  fetchRemixes as f,
  remixesQueryKey as r,
  uploadAssetFiles as u,
  waitForGeneration as w
};
