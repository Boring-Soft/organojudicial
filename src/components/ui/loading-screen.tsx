import { Loader } from "./loader";

interface LoadingScreenProps {
  message?: string;
  variant?: "default" | "overlay";
  className?: string;
}

export function LoadingScreen({
  message = "Cargando...",
  variant = "default",
  className,
}: LoadingScreenProps) {
  if (variant === "overlay") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4">
          <Loader size="lg" />
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex flex-col items-center justify-center gap-4 py-8">
        <Loader size="lg" />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  );
}
