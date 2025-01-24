import * as React from "react"
import { ResponsiveContainer, Tooltip } from "recharts"

import { cn } from "../../lib/utils"

const ChartContainer = React.forwardRef(
  ({ className, config, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("", className)} {...props}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    )
  }
)
ChartContainer.displayName = "ChartContainer"

const ChartTooltip = React.forwardRef(({ children, ...props }, ref) => {
  return <Tooltip ref={ref} content={children} {...props} />
})
ChartTooltip.displayName = "ChartTooltip"

const ChartTooltipContent = React.forwardRef(
  ({ className, payload, hideLabel = false, ...props }, ref) => {
    const data = payload?.[0]?.payload

    if (!data) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-background p-2 shadow-sm",
          className
        )}
        {...props}
      >
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {hideLabel ? "Value" : data.name}
            </span>
            <span className="font-bold text-muted-foreground">
              {data.value}
            </span>
          </div>
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

export { ChartContainer, ChartTooltip, ChartTooltipContent }
