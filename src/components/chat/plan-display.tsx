import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Layout, FileCode, Component } from "lucide-react";

// Plan display
const PlanDisplay = ({
  plan,
}: {
  plan: { screens: string[]; widgets: string[]; category: string };
}) => (
  <div className="mb-6">
    {/* Modern Header */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-2 h-8 rounded-full bg-gradient-to-b from-primary to-primary/40"></div>
        <div>
          <h4 className="text-sm font-semibold font-mono text-foreground">Generation Plan</h4>
          <p className="text-xs font-mono text-muted-foreground/70 mt-0.5">
            {plan.category}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground/60">
        <span>{plan.screens.length} screens</span>
        <span>•</span>
        <span>{plan.widgets.length} widgets</span>
      </div>
    </div>
  </div>
);

// File streaming status - removed for cleaner UI
const FileStreamingStatus = () => null;

export { PlanDisplay, FileStreamingStatus };