"use client";

import { useRef } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUploadAvatarMutation } from "@/hooks/use-upload-avatar-mutation";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentUrl: string | null;
  initials: string;
}

export function AvatarUpload({ currentUrl, initials }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { upload, remove } = useUploadAvatarMutation();

  const isPending = upload.isPending || remove.isPending;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    upload.mutate(file, {
      onSuccess: () => toast.success("Avatar updated!"),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Upload failed"),
    });
  };

  const handleRemove = () => {
    remove.mutate(undefined, {
      onSuccess: () => toast.success("Avatar removed"),
      onError: (err) =>
        toast.error(
          err instanceof Error ? err.message : "Failed to remove avatar",
        ),
    });
  };

  return (
    <div className="flex flex-col items-center gap-2 shrink-0">
      {/* Avatar with upload overlay */}
      <div className="relative group/avatar">
        <Avatar className="h-20 w-20">
          <AvatarImage src={currentUrl ?? undefined} className="object-cover" />
          <AvatarFallback className="text-2xl bg-primary/10 text-primary font-medium font-serif">
            {initials}
          </AvatarFallback>
        </Avatar>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isPending}
          aria-label="Upload avatar"
          className={cn(
            "absolute inset-0 rounded-full flex flex-col items-center justify-center gap-0.5",
            "bg-black/50 opacity-0 group-hover/avatar:opacity-100 transition-opacity",
            "disabled:cursor-not-allowed",
          )}
        >
          {upload.isPending ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-5 w-5 text-white" />
              <span className="text-[10px] text-white font-medium leading-none">
                Upload
              </span>
            </>
          )}
        </button>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* Remove button — only shown when an avatar exists */}
      {currentUrl && (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={handleRemove}
          disabled={isPending}
          className="gap-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-6 text-xs"
        >
          {remove.isPending ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Trash2 className="h-3 w-3" />
          )}
          Remove
        </Button>
      )}
    </div>
  );
}
