// Lightweight loader + wrapper around Google Identity Services (GIS).
// Renders an official "Sign in with Google" button into a container; the
// resulting credential is a Google ID token suitable for /api/v1/auth/google.

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

const GSI_SRC = "https://accounts.google.com/gsi/client";

interface CredentialResponse {
  credential?: string;
}

interface GoogleIdAccounts {
  initialize: (config: {
    client_id: string;
    callback: (response: CredentialResponse) => void;
    use_fedcm_for_prompt?: boolean;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      type?: "standard" | "icon";
      theme?: "outline" | "filled_blue" | "filled_black";
      size?: "large" | "medium" | "small";
      text?: "signin_with" | "signup_with" | "continue_with" | "signin";
      shape?: "rectangular" | "pill" | "circle" | "square";
      width?: number;
      logo_alignment?: "left" | "center";
    },
  ) => void;
  prompt: () => void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdAccounts;
      };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

export function loadGoogleIdentity(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Identity is only available in the browser."));
  }
  if (window.google?.accounts?.id) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GSI_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Identity.")));
      return;
    }

    const script = document.createElement("script");
    script.src = GSI_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Failed to load Google Identity."));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

export async function promptGoogleOneTap(
  onCredential: (idToken: string) => void,
  onError: (error: Error) => void,
) {
  if (!GOOGLE_CLIENT_ID) {
    onError(new Error("Google sign-in is not configured."));
    return;
  }

  try {
    await loadGoogleIdentity();
  } catch (error) {
    onError(error instanceof Error ? error : new Error("Failed to load Google Identity."));
    return;
  }

  const accounts = window.google?.accounts?.id;
  if (!accounts) {
    onError(new Error("Google Identity unavailable."));
    return;
  }

  accounts.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response) => {
      if (response.credential) {
        onCredential(response.credential);
      } else {
        onError(new Error("Google sign-in was cancelled."));
      }
    },
    use_fedcm_for_prompt: true,
  });

  accounts.prompt();
}

export async function renderGoogleButton(
  container: HTMLElement,
  onCredential: (idToken: string) => void,
  onError: (error: Error) => void,
) {
  if (!GOOGLE_CLIENT_ID) {
    onError(new Error("Google sign-in is not configured."));
    return;
  }

  try {
    await loadGoogleIdentity();
  } catch (error) {
    onError(error instanceof Error ? error : new Error("Failed to load Google Identity."));
    return;
  }

  const accounts = window.google?.accounts?.id;
  if (!accounts) {
    onError(new Error("Google Identity unavailable."));
    return;
  }

  accounts.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: (response) => {
      if (response.credential) {
        onCredential(response.credential);
      } else {
        onError(new Error("Google sign-in was cancelled."));
      }
    },
    use_fedcm_for_prompt: true,
  });

  accounts.renderButton(container, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "continue_with",
    shape: "pill",
    width: 380,
    logo_alignment: "center",
  });

  // GIS renders nothing (and only logs to console) when the client ID is wrong
  // or the current origin isn't an authorized JavaScript origin. Detect that so
  // the UI can fall back instead of showing an empty gap.
  await new Promise((resolve) => setTimeout(resolve, 600));
  if (container.childElementCount === 0) {
    onError(
      new Error(
        `Google button failed to render for origin ${window.location.origin}. ` +
          "Check that this exact origin is an Authorized JavaScript origin and the client ID is correct.",
      ),
    );
  }
}
