import { r as reactExports, j as jsxRuntimeExports } from "../_libs/react.mjs";
import { D as Dialog, a as DialogContent, d as DialogTitle, c as cn } from "./router-Bd-4THC9.mjs";
import { S as Switch$1, a as SwitchThumb } from "../_libs/radix-ui__react-switch.mjs";
import { A as Avatar, c as AvatarImage, d as AvatarFallback } from "./MobileNav-JTGfX7W-.mjs";
import { S as Search, e as Check } from "../_libs/lucide-react.mjs";
const Switch = reactExports.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsxRuntimeExports.jsx(
  Switch$1,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      SwitchThumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = Switch$1.displayName;
const COLLABORATORS = [
  { id: "ella", name: "ELLA", handle: "ella_contentclub" },
  {
    id: "global-travel",
    name: "Global Travel Inspiration Collection",
    handle: "GlobalTravelCollection2"
  },
  { id: "uae", name: "UAE", handle: "uaestories" }
];
const PREVIEW_SRC = "https://picsum.photos/seed/sunset/600/600";
function initials(name) {
  return name.trim().charAt(0).toUpperCase() || "?";
}
function CreateBoardDialog({
  open,
  onOpenChange,
  onCreate
}) {
  const [name, setName] = reactExports.useState("");
  const [isSecret, setIsSecret] = reactExports.useState(false);
  const [search, setSearch] = reactExports.useState("");
  const [selected, setSelected] = reactExports.useState([]);
  reactExports.useEffect(() => {
    if (!open) {
      setName("");
      setIsSecret(false);
      setSearch("");
      setSelected([]);
    }
  }, [open]);
  const canCreate = name.trim().length > 0;
  const query = search.trim().toLowerCase();
  const filteredCollaborators = query ? COLLABORATORS.filter(
    (person) => person.name.toLowerCase().includes(query) || person.handle.toLowerCase().includes(query)
  ) : COLLABORATORS;
  function toggleCollaborator(id) {
    setSelected(
      (prev) => prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    );
  }
  function handleCreate() {
    if (!canCreate) return;
    onCreate?.({ name: name.trim(), isSecret, collaboratorIds: selected });
    onOpenChange(false);
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { open, onOpenChange, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
    DialogContent,
    {
      showCloseButton: false,
      className: "max-w-[860px] rounded-[28px] border-none p-0 shadow-2xl gap-0 overflow-hidden",
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-8 pt-8 pb-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { className: "text-center text-[28px] font-bold tracking-tight", children: "Create board" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid gap-8 px-8 pb-6 md:grid-cols-[300px_1fr]", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "relative aspect-square overflow-hidden rounded-[20px] bg-secondary", children: /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: PREVIEW_SRC, alt: "", className: "h-full w-full object-cover" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "mb-2 text-sm font-semibold text-foreground", htmlFor: "board-name", children: "Name" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                id: "board-name",
                type: "text",
                value: name,
                onChange: (event) => setName(event.target.value),
                placeholder: `Like "Places to Go" or "Recipes to Make"`,
                className: "h-12 rounded-[14px] border border-border bg-background px-4 text-[15px] text-foreground outline-none transition focus:border-foreground placeholder:text-muted-foreground"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-6 flex items-center justify-between", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "Secret" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "Only you and collaborators can see this board." })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                Switch,
                {
                  checked: isSecret,
                  onCheckedChange: setIsSecret,
                  "aria-label": "Make board secret",
                  className: "h-6 w-11 [&>span]:h-5 [&>span]:w-5 [&>span]:data-[state=checked]:translate-x-5"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "mt-6 mb-2 text-sm font-semibold text-foreground", children: [
              "Add collaborators",
              " ",
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-normal text-muted-foreground", children: "(optional)" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex h-12 items-center gap-2 rounded-[14px] border border-border bg-background px-4 transition focus-within:border-foreground", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "h-5 w-5 shrink-0 text-muted-foreground" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "search",
                  value: search,
                  onChange: (event) => setSearch(event.target.value),
                  placeholder: "Search by name or email",
                  className: "min-w-0 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 space-y-1", children: filteredCollaborators.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "px-1 py-4 text-sm text-muted-foreground", children: "No people found." }) : filteredCollaborators.map((person) => {
              const isSelected = selected.includes(person.id);
              return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  type: "button",
                  onClick: () => toggleCollaborator(person.id),
                  "aria-pressed": isSelected,
                  className: "flex w-full items-center gap-3 rounded-[14px] px-1 py-2 text-left transition hover:bg-secondary",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsxs(Avatar, { className: "h-11 w-11", children: [
                      person.avatar ? /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarImage, { src: person.avatar, alt: "" }) : null,
                      /* @__PURE__ */ jsxRuntimeExports.jsx(AvatarFallback, { className: "bg-foreground text-sm font-bold text-background", children: initials(person.name) })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 flex-1", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-[15px] font-bold text-foreground", children: person.name }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "truncate text-sm text-muted-foreground", children: person.handle })
                    ] }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "span",
                      {
                        className: cn(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition",
                          isSelected ? "border-foreground bg-foreground text-background" : "border-border bg-background"
                        ),
                        children: isSelected ? /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "h-4 w-4", strokeWidth: 3 }) : null
                      }
                    )
                  ]
                },
                person.id
              );
            }) })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-t border-border px-8 py-5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => onOpenChange(false),
              className: "h-11 rounded-full bg-secondary px-5 text-[15px] font-semibold text-foreground transition hover:bg-accent",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: handleCreate,
              disabled: !canCreate,
              className: "h-11 rounded-full bg-[#e60023] px-6 text-[15px] font-semibold text-white transition hover:bg-[#ad081b] disabled:cursor-not-allowed disabled:bg-secondary disabled:text-muted-foreground",
              children: "Create"
            }
          )
        ] })
      ]
    }
  ) });
}
export {
  CreateBoardDialog as C
};
