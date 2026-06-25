import { useEffect, useState } from "react";
import { Check, Search } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Collaborator {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
}

// Demo collaborator suggestions — replace with a search request when the API is ready.
const COLLABORATORS: Collaborator[] = [
  { id: "ella", name: "ELLA", handle: "ella_contentclub" },
  {
    id: "global-travel",
    name: "Global Travel Inspiration Collection",
    handle: "GlobalTravelCollection2",
  },
  { id: "uae", name: "UAE", handle: "uaestories" },
];

const PREVIEW_SRC = "https://picsum.photos/seed/sunset/600/600";

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase() || "?";
}

export function CreateBoardDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate?: (board: { name: string; isSecret: boolean; collaboratorIds: string[] }) => void;
}) {
  const [name, setName] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  // Reset the form whenever the dialog is dismissed.
  useEffect(() => {
    if (!open) {
      setName("");
      setIsSecret(false);
      setSearch("");
      setSelected([]);
    }
  }, [open]);

  const canCreate = name.trim().length > 0;

  const query = search.trim().toLowerCase();
  const filteredCollaborators = query
    ? COLLABORATORS.filter(
        (person) =>
          person.name.toLowerCase().includes(query) || person.handle.toLowerCase().includes(query),
      )
    : COLLABORATORS;

  function toggleCollaborator(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id],
    );
  }

  function handleCreate() {
    if (!canCreate) return;
    onCreate?.({ name: name.trim(), isSecret, collaboratorIds: selected });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[860px] rounded-[28px] border-none p-0 shadow-2xl gap-0 overflow-hidden"
      >
        <div className="px-8 pt-8 pb-4">
          <DialogTitle className="text-center text-[28px] font-bold tracking-tight">
            Create board
          </DialogTitle>
        </div>

        <div className="grid gap-8 px-8 pb-6 md:grid-cols-[300px_1fr]">
          {/* Cover preview */}
          <div className="relative aspect-square overflow-hidden rounded-[20px] bg-secondary">
            <img src={PREVIEW_SRC} alt="" className="h-full w-full object-cover" />
          </div>

          {/* Form */}
          <div className="flex flex-col">
            <label className="mb-2 text-sm font-semibold text-foreground" htmlFor="board-name">
              Name
            </label>
            <input
              id="board-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={`Like "Places to Go" or "Recipes to Make"`}
              className="h-12 rounded-[14px] border border-border bg-background px-4 text-[15px] text-foreground outline-none transition focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            />

            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Secret</p>
                <p className="text-xs text-muted-foreground">
                  Only you and collaborators can see this board.
                </p>
              </div>
              <Switch
                checked={isSecret}
                onCheckedChange={setIsSecret}
                aria-label="Make board secret"
                className="h-6 w-11 [&>span]:h-5 [&>span]:w-5 [&>span]:data-[state=checked]:translate-x-5"
              />
            </div>

            <p className="mt-6 mb-2 text-sm font-semibold text-foreground">
              Add collaborators{" "}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </p>
            <label className="flex h-12 items-center gap-2 rounded-[14px] border border-border bg-background px-4 transition focus-within:ring-2 focus-within:ring-ring">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email"
                className="min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </label>

            <div className="mt-3 space-y-1">
              {filteredCollaborators.length === 0 ? (
                <p className="px-1 py-4 text-sm text-muted-foreground">No people found.</p>
              ) : (
                filteredCollaborators.map((person) => {
                  const isSelected = selected.includes(person.id);
                  return (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => toggleCollaborator(person.id)}
                      aria-pressed={isSelected}
                      className="flex w-full items-center gap-3 rounded-[14px] px-1 py-2 text-left transition hover:bg-secondary"
                    >
                      <Avatar className="h-11 w-11">
                        {person.avatar ? <AvatarImage src={person.avatar} alt="" /> : null}
                        <AvatarFallback className="bg-foreground text-sm font-bold text-background">
                          {initials(person.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[15px] font-bold text-foreground">
                          {person.name}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">{person.handle}</p>
                      </div>
                      <span
                        className={cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition",
                          isSelected
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background",
                        )}
                      >
                        {isSelected ? <Check className="h-4 w-4" strokeWidth={3} /> : null}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-border px-8 py-5">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-full bg-secondary px-5 text-[15px] font-semibold text-foreground transition hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={!canCreate}
            className="h-11 rounded-full bg-[#e60023] px-6 text-[15px] font-semibold text-white transition hover:bg-[#ad081b] disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground"
          >
            Create
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
