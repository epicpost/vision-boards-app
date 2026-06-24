import { j as jsxRuntimeExports, r as reactExports } from "./react.mjs";
import { c as createContextScope } from "./radix-ui__react-context.mjs";
import { u as useComposedRefs } from "./radix-ui__react-compose-refs.mjs";
import { D as Dialog, a as DialogTrigger, c as createDialogScope, b as DialogPortal, d as DialogContent, e as DialogTitle, f as DialogDescription, g as DialogClose, h as DialogOverlay } from "./radix-ui__react-dialog.mjs";
import { c as composeEventHandlers } from "./radix-ui__primitive.mjs";
var ROOT_NAME = "AlertDialog";
var [createAlertDialogContext] = createContextScope(ROOT_NAME, [
  createDialogScope
]);
var useDialogScope = createDialogScope();
var AlertDialog = (props) => {
  const { __scopeAlertDialog, ...alertDialogProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Dialog, { ...dialogScope, ...alertDialogProps, modal: true });
};
AlertDialog.displayName = ROOT_NAME;
var TRIGGER_NAME = "AlertDialogTrigger";
var AlertDialogTrigger = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...triggerProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTrigger, { ...dialogScope, ...triggerProps, ref: forwardedRef });
  }
);
AlertDialogTrigger.displayName = TRIGGER_NAME;
var PORTAL_NAME = "AlertDialogPortal";
var AlertDialogPortal = (props) => {
  const { __scopeAlertDialog, ...portalProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogPortal, { ...dialogScope, ...portalProps });
};
AlertDialogPortal.displayName = PORTAL_NAME;
var OVERLAY_NAME = "AlertDialogOverlay";
var AlertDialogOverlay = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...overlayProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogOverlay, { ...dialogScope, ...overlayProps, ref: forwardedRef });
  }
);
AlertDialogOverlay.displayName = OVERLAY_NAME;
var CONTENT_NAME = "AlertDialogContent";
var [AlertDialogContentProvider, useAlertDialogContentContext] = createAlertDialogContext(CONTENT_NAME);
var AlertDialogContent = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, children, ...contentProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const contentRef = reactExports.useRef(null);
    const composedRefs = useComposedRefs(forwardedRef, contentRef);
    const cancelRef = reactExports.useRef(null);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(AlertDialogContentProvider, { scope: __scopeAlertDialog, cancelRef, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
      DialogContent,
      {
        role: "alertdialog",
        ...dialogScope,
        ...contentProps,
        ref: composedRefs,
        onOpenAutoFocus: composeEventHandlers(contentProps.onOpenAutoFocus, (event) => {
          event.preventDefault();
          cancelRef.current?.focus({ preventScroll: true });
        }),
        onPointerDownOutside: (event) => event.preventDefault(),
        onInteractOutside: (event) => event.preventDefault(),
        children
      }
    ) });
  }
);
AlertDialogContent.displayName = CONTENT_NAME;
var TITLE_NAME = "AlertDialogTitle";
var AlertDialogTitle = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...titleProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogTitle, { ...dialogScope, ...titleProps, ref: forwardedRef });
  }
);
AlertDialogTitle.displayName = TITLE_NAME;
var DESCRIPTION_NAME = "AlertDialogDescription";
var AlertDialogDescription = reactExports.forwardRef((props, forwardedRef) => {
  const { __scopeAlertDialog, ...descriptionProps } = props;
  const dialogScope = useDialogScope(__scopeAlertDialog);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogDescription, { ...dialogScope, ...descriptionProps, ref: forwardedRef });
});
AlertDialogDescription.displayName = DESCRIPTION_NAME;
var ACTION_NAME = "AlertDialogAction";
var AlertDialogAction = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...actionProps } = props;
    const dialogScope = useDialogScope(__scopeAlertDialog);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogClose, { ...dialogScope, ...actionProps, ref: forwardedRef });
  }
);
AlertDialogAction.displayName = ACTION_NAME;
var CANCEL_NAME = "AlertDialogCancel";
var AlertDialogCancel = reactExports.forwardRef(
  (props, forwardedRef) => {
    const { __scopeAlertDialog, ...cancelProps } = props;
    const { cancelRef } = useAlertDialogContentContext(CANCEL_NAME, __scopeAlertDialog);
    const dialogScope = useDialogScope(__scopeAlertDialog);
    const ref = useComposedRefs(forwardedRef, cancelRef);
    return /* @__PURE__ */ jsxRuntimeExports.jsx(DialogClose, { ...dialogScope, ...cancelProps, ref });
  }
);
AlertDialogCancel.displayName = CANCEL_NAME;
var Root2 = AlertDialog;
var Trigger2 = AlertDialogTrigger;
var Portal2 = AlertDialogPortal;
var Overlay2 = AlertDialogOverlay;
var Content2 = AlertDialogContent;
var Action = AlertDialogAction;
var Cancel = AlertDialogCancel;
var Title2 = AlertDialogTitle;
var Description2 = AlertDialogDescription;
export {
  Action as A,
  Content2 as C,
  Description2 as D,
  Overlay2 as O,
  Portal2 as P,
  Root2 as R,
  Trigger2 as T,
  Title2 as a,
  Cancel as b
};
