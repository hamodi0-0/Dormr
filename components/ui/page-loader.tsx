import { BeatLoader } from "react-spinners";
import { cn } from "@/lib/utils";

type PageLoaderProps = {
  className?: string;
};

export function PageLoader({ className }: PageLoaderProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen w-full items-center justify-center bg-background p-6",
        className,
      )}
    >
      <div className="flex flex-col items-center gap-3 text-primary">
        <BeatLoader
          color="currentColor"
          size={20}
          margin={4}
          speedMultiplier={0.85}
        />
      </div>
    </div>
  );
}
