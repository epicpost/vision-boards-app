import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Sidebar } from "@/components/epicpost/Sidebar";
import { TopBar } from "@/components/epicpost/TopBar";
import { MobileNav } from "@/components/epicpost/MobileNav";
import { AvatarCropDialog } from "@/components/epicpost/AvatarCropDialog";
import { getAuthUser, updateAuthUser } from "@/lib/auth";
import { updateMyProfile, uploadAvatar } from "@/lib/profile";

const MAX_AVATAR_BYTES = 10 * 1024 * 1024;

export const Route = createFileRoute("/settings")({
  component: SettingsPage,
});

const sections = [
  "Edit profile",
  "Account management",
  "Profile visibility",
  "Refine your recommendations",
  "Link to Pinterest",
  "Social permissions",
  "Notifications",
  "Privacy and data",
  "Security",
  "Branded Content",
] as const;

function SettingsPage() {
  const [active, setActive] = useState<(typeof sections)[number]>("Edit profile");
  const user = getAuthUser();

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="md:pl-[72px] pb-16 md:pb-0">
        <TopBar showTabs={false} />
        <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-8 md:flex-row md:gap-16 md:py-12">
          <nav className="md:w-64 md:shrink-0">
            <ul className="flex flex-col gap-2">
              {sections.map((s) => (
                <li key={s}>
                  <button
                    onClick={() => setActive(s)}
                    className={`block w-full text-left text-[17px] font-bold leading-snug transition ${
                      active === s
                        ? "text-foreground border-b-2 border-foreground pb-1 inline-block w-auto"
                        : "text-foreground/80 hover:text-foreground"
                    }`}
                  >
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <section className="flex-1 max-w-2xl">
            {active === "Edit profile" ? (
              <EditProfileForm user={user} />
            ) : (
              <div>
                <h1 className="text-3xl font-bold text-foreground">{active}</h1>
                <p className="mt-3 text-base text-muted-foreground">This section is coming soon.</p>
              </div>
            )}
          </section>
        </main>
      </div>
      <MobileNav />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block rounded-[16px] border border-border px-4 py-3">
      <div className="text-[13px] font-semibold text-foreground">{label}</div>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function EditProfileForm({ user }: { user: ReturnType<typeof getAuthUser> }) {
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [about, setAbout] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url ?? null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initial = (firstName || user?.username || "U").charAt(0).toUpperCase();

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same file
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setStatus({ type: "error", message: "Please choose an image file." });
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setStatus({ type: "error", message: "Image must be 10 MB or smaller." });
      return;
    }
    setStatus(null);
    setCropFile(file);
  };

  const handleCropped = async (blob: Blob) => {
    const profile = await uploadAvatar(blob);
    setAvatarUrl(profile.avatar_url ?? null);
    updateAuthUser({ avatar_url: profile.avatar_url });
    setCropFile(null);
    setStatus({ type: "success", message: "Photo updated." });
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const profile = await updateMyProfile({
        first_name: firstName.trim() || null,
        last_name: lastName.trim() || null,
        about: about.trim() || null,
      });
      updateAuthUser({ first_name: profile.first_name, last_name: profile.last_name });
      setStatus({ type: "success", message: "Profile saved." });
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Failed to save." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-foreground">Edit profile</h1>
      <p className="mt-2 text-base text-muted-foreground">
        Keep your personal details private. Information you add here is visible to anyone who can
        view your profile.
      </p>

      <div className="mt-8">
        <div className="text-sm font-semibold text-foreground">Photo</div>
        <div className="mt-2 flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-pink-300 via-rose-300 to-amber-200 text-2xl font-bold text-foreground">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              initial
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFilePicked}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 rounded-full bg-secondary px-4 text-[15px] font-semibold text-foreground hover:bg-accent"
          >
            Change
          </button>
        </div>
      </div>

      <AvatarCropDialog
        file={cropFile}
        onClose={() => setCropFile(null)}
        onCropped={handleCropped}
      />

      <div className="mt-6 flex flex-col gap-4">
        <Field label="First name">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full bg-transparent text-base text-foreground outline-none"
          />
        </Field>
        <Field label="Last name">
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full bg-transparent text-base text-foreground outline-none"
          />
        </Field>
        <Field label="About">
          <textarea
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            placeholder="Tell your story"
            rows={3}
            className="w-full resize-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
        </Field>
        <Field label="Pronouns">
          <input
            value={pronouns}
            onChange={(e) => setPronouns(e.target.value)}
            placeholder="Add your pronouns"
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
          <p className="mt-2 text-sm text-muted-foreground">
            Choose up to 2 sets of pronouns to appear on your profile so others know how to refer to
            you. You can edit or remove these any time.
          </p>
        </Field>
        <Field label="Website">
          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Add a link"
            className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
        </Field>
      </div>

      <div className="sticky bottom-0 mt-10 -mx-6 flex items-center justify-end gap-3 border-t border-border bg-background px-6 py-4">
        {status ? (
          <p
            className={`mr-auto text-sm font-medium ${
              status.type === "error" ? "text-destructive" : "text-muted-foreground"
            }`}
          >
            {status.message}
          </p>
        ) : null}
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="h-11 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
