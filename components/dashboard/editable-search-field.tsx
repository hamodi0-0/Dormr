"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface SearchOption {
  label: string;
  sublabel?: string;
}

interface EditableSearchFieldProps {
  label: string;
  displayValue: string;
  currentValue: string;
  /** Static options to filter locally — mutually exclusive with onSearch */
  options?: string[];
  /** Async search results — mutually exclusive with options */
  searchResults?: SearchOption[];
  /** Called as the user types when using async search */
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  onSave: (value: string) => void;
  isSaving?: boolean;
}

export function EditableSearchField({
  label,
  displayValue,
  currentValue,
  options,
  searchResults,
  onSearch,
  isSearching = false,
  onSave,
  isSaving = false,
}: EditableSearchFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(currentValue);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const enter = () => {
    setDraft(currentValue);
    setIsEditing(true);
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  const cancel = () => {
    setIsEditing(false);
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  const commit = () => {
    onSave(draft);
    setIsEditing(false);
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  const handleInputChange = (value: string) => {
    setDraft(value);
    setActiveIndex(-1);
    if (options) {
      setShowDropdown(value.length >= 1);
    } else if (onSearch) {
      onSearch(value);
      setShowDropdown(value.length >= 2);
    }
  };

  const selectOption = (value: string) => {
    setDraft(value);
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  // Local filtering for static options
  const filteredOptions = options
    ? options
        .filter((o) => o.toLowerCase().includes(draft.toLowerCase()))
        .slice(0, 10)
    : [];

  const dropdownItems: { label: string; sublabel?: string }[] = options
    ? filteredOptions.map((o) => ({ label: o }))
    : (searchResults ?? []);

  useEffect(() => {
    if (!showDropdown || dropdownItems.length === 0) {
      setActiveIndex(-1);
      return;
    }

    setActiveIndex((prev) => (prev >= dropdownItems.length ? -1 : prev));
  }, [showDropdown, dropdownItems.length]);

  return (
    <div className="flex items-start gap-4 py-3.5 border-b border-border/50 last:border-0 min-h-13">
      <span className="text-sm text-muted-foreground shrink-0 w-36 pt-1">
        {label}
      </span>

      {isEditing ? (
        <div className="flex flex-1 items-start gap-2">
          <div className="flex-1 relative" ref={containerRef}>
            <div className="relative">
              <Input
                value={draft}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={`Search ${label.toLowerCase()}…`}
                className="h-8 text-sm pr-8"
                autoFocus
                onFocus={() => {
                  if (options && draft.length >= 1) setShowDropdown(true);
                  if (onSearch && draft.length >= 2) setShowDropdown(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    if (!showDropdown && dropdownItems.length > 0) {
                      setShowDropdown(true);
                    }
                    setActiveIndex((prev) =>
                      Math.min(prev + 1, dropdownItems.length - 1),
                    );
                  }

                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActiveIndex((prev) => Math.max(prev - 1, -1));
                  }

                  if (e.key === "Enter") {
                    if (
                      showDropdown &&
                      activeIndex >= 0 &&
                      activeIndex < dropdownItems.length
                    ) {
                      e.preventDefault();
                      selectOption(dropdownItems[activeIndex].label);
                    } else {
                      commit();
                    }
                  }

                  if (e.key === "Escape") {
                    e.preventDefault();
                    if (showDropdown) {
                      setShowDropdown(false);
                      setActiveIndex(-1);
                    } else {
                      cancel();
                    }
                  }
                }}
              />
              {isSearching && (
                <Loader2 className="absolute right-2.5 top-2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>

            {showDropdown && dropdownItems.length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-56 overflow-auto p-1">
                {dropdownItems.map((item, idx) => (
                  <div
                    key={idx}
                    className={`px-3 py-2 rounded-sm cursor-pointer ${
                      idx === activeIndex ? "bg-accent" : "hover:bg-accent"
                    }`}
                    onMouseEnter={() => setActiveIndex(idx)}
                    onMouseDown={(e) => {
                      // prevent input blur before click registers
                      e.preventDefault();
                      selectOption(item.label);
                    }}
                  >
                    <div className="text-sm font-medium">{item.label}</div>
                    {item.sublabel && (
                      <div className="text-xs text-muted-foreground">
                        {item.sublabel}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 pt-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={commit}
              disabled={isSaving}
              aria-label="Save"
              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/40"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={cancel}
              disabled={isSaving}
              aria-label="Cancel"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={enter}
          className="group/value flex flex-1 items-start justify-between gap-2 text-left"
          aria-label={`Edit ${label}`}
        >
          <span
            className={cn(
              "text-sm font-medium flex-1 text-right",
              !displayValue && "text-muted-foreground italic",
            )}
          >
            {displayValue || "Not set"}
          </span>
          <Pencil className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0 opacity-0 transition-opacity group-hover/value:opacity-100" />
        </button>
      )}
    </div>
  );
}
