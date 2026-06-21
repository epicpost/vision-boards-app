import { Toaster as Sonner } from "sonner";
import { CheckCircle2, Info, XCircle } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      icons={{
        success: <CheckCircle2 className="h-5 w-5" />,
        error: <XCircle className="h-5 w-5" />,
        info: <Info className="h-5 w-5" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-[18px] group-[.toaster]:border-0 group-[.toaster]:bg-[#2d2c2a] group-[.toaster]:px-5 group-[.toaster]:py-4 group-[.toaster]:text-white group-[.toaster]:shadow-[0_12px_36px_rgba(0,0,0,0.28)]",
          title: "group-[.toast]:text-[17px] group-[.toast]:font-semibold group-[.toast]:text-white",
          description: "group-[.toast]:text-white/80",
          icon: "group-[.toast]:text-white",
          actionButton:
            "group-[.toast]:rounded-[14px] group-[.toast]:bg-white group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:font-semibold group-[.toast]:text-black hover:group-[.toast]:bg-white/90",
          cancelButton:
            "group-[.toast]:rounded-[14px] group-[.toast]:bg-white/10 group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:font-semibold group-[.toast]:text-white hover:group-[.toast]:bg-white/15",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
