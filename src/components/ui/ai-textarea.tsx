import * as React from "react"
import { cn } from "@/lib/utils"
import { BorderBeam } from "./border-beam"

export interface AITextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  showBeam?: boolean;
  beamColor?: string;
  beamColorTo?: string;
  beamDuration?: number;
  beamDelay?: number;
}

const AITextarea = React.forwardRef<HTMLTextAreaElement, AITextareaProps>(
  ({ className, showBeam = true, beamColor, beamColorTo, beamDuration, beamDelay, ...props }, ref) => {
    return (
      <div className="relative">
        <textarea
          className={cn(
            "flex px-3 py-2 w-full text-sm rounded-md border min-h-[80px] border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        {showBeam && (
          <BorderBeam
            size={100}
            duration={beamDuration || 8}
            delay={beamDelay || 0}
            colorFrom={beamColor || "#8b5cf6"}
            colorTo={beamColorTo || "#06b6d4"}
            borderWidth={2}
          />
        )}
      </div>
    )
  }
)
AITextarea.displayName = "AITextarea"

export { AITextarea }

