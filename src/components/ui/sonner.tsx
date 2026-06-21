import { Toaster as Sonner } from "sonner";
import { CheckCircle2, Info, XCircle } from "lucide-react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ className, style, ...props }: ToasterProps) => {
  return (
    <Sonner
      className={`toaster group [--toast-center-offset:0px] md:[--toast-center-offset:36px] ${className ?? ""}`}
      style={{
        ...style,
        left: "calc(50% + var(--toast-center-offset))",
        transform: "translateX(-50%)",
      }}
      icons={{
        success: <CheckCircle2 className="h-5 w-5" />,
        error: <XCircle className="h-5 w-5" />,
        info: <Info className="h-5 w-5" />,
      }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "group toast flex items-center gap-3 rounded-[18px] border-0 bg-[#2d2c2a] px-5 py-4 text-white shadow-[0_12px_36px_rgba(0,0,0,0.28)]",
          title: "text-[17px] font-semibold leading-tight text-white",
          description: "text-white/80",
          icon: "text-white",
          actionButton:
            "rounded-[14px] bg-white px-4 py-2 font-semibold text-black hover:bg-white/90",
          cancelButton:
            "rounded-[14px] bg-white/10 px-4 py-2 font-semibold text-white hover:bg-white/15",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
