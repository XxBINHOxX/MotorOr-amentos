import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  showDropdown?: boolean;
  dropdownValue?: string;
  rightAction?: React.ReactNode;
  compact?: boolean;
}

export function SectionCard({
  title,
  children,
  className,
  showDropdown = false,
  dropdownValue = "Este mês",
  rightAction,
  compact = false,
}: SectionCardProps) {
  return (
    <div className={cn("surface-card", compact ? "p-4" : "p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-semibold text-foreground">
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {rightAction}
          {showDropdown && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-input/40 border-border/40 hover:bg-secondary"
            >
              {dropdownValue}
              <ChevronDown className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
