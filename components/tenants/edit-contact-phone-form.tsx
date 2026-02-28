"use client";

import { useTransition, useState } from "react";
import { toast } from "sonner";
import { Pencil, Check, X, Loader2, Phone } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { updateContactPhone } from "@/app/actions/listing-actions";

interface EditContactPhoneFormProps {
  listingId: string;
  currentPhone: string;
}

export function EditContactPhoneForm({
  listingId,
  currentPhone,
}: EditContactPhoneFormProps) {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(currentPhone);
  const [draft, setDraft] = useState(currentPhone);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("listing_id", listingId);
      formData.set("contact_phone", draft.trim());
      const result = await updateContactPhone(formData);
      if (result.error) {
        toast.error(result.error);
      } else {
        setSaved(draft.trim());
        setEditing(false);
        toast.success("Contact phone updated");
      }
    });
  };

  const handleCancel = () => {
    setDraft(saved);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
          {saved ? (
            <span className="text-sm font-medium text-foreground">{saved}</span>
          ) : (
            <span className="text-sm text-muted-foreground italic">
              No contact phone set
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 text-xs shrink-0"
          onClick={() => setEditing(true)}
        >
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="tel"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="+44 7700 900000"
        className="h-9 flex-1 text-sm"
        disabled={isPending}
        autoFocus
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") handleCancel();
        }}
      />
      <Button
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={handleSave}
        disabled={isPending}
        aria-label="Save phone number"
      >
        {isPending ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Check className="h-3.5 w-3.5" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={handleCancel}
        disabled={isPending}
        aria-label="Cancel edit"
      >
        <X className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
