"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "../lib/utils";

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
>;

interface ChartContextProps {
  config: ChartConfig;
}

const ChartContext = React.createContext<ChartContextProps | null>(null);

type ChartValueType = number | string | (number | string)[];
type ChartNameType = string | number;

interface ChartTooltipItem {
  color?: string;
  dataKey?: string | number;
  name?: ChartNameType;
  value?: ChartValueType;
  payload?: Record<string, unknown>;
  [key: string]: unknown;
}

type ChartTooltipPayload = ChartTooltipItem[];

type ChartTooltipLabel = string | number | React.ReactNode;
type ChartTooltipLabelFormatter = (
  label: string,
  payload: ChartTooltipPayload,
) => React.ReactNode;
type ChartTooltipFormatter = (
  value: ChartValueType,
  name: ChartNameType,
  item: ChartTooltipItem,
  index: number,
  payload: ChartTooltipPayload,
) => React.ReactNode;

interface ChartLegendItem {
  color?: string;
  dataKey?: string | number;
  value?: string;
  payload?: Record<string, unknown>;
  [key: string]: unknown;
}

function useChart(): ChartContextProps {
  const context = React.useContext(ChartContext);

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }

  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}): React.JSX.Element {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  const contextValue = React.useMemo(() => ({ config }), [config]);

  return (
    <ChartContext.Provider value={contextValue}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border flex aspect-video justify-center text-xs [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-surface]:outline-hidden",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({
  id,
  config,
}: {
  readonly id: string;
  readonly config: ChartConfig;
}): React.JSX.Element | null {
  const colorConfig = Object.entries(config).filter(
    ([, conf]) => conf.theme ?? conf.color,
  );

  if (!colorConfig.length) {
    return null;
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ??
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

interface ChartTooltipContentProps extends React.ComponentProps<"div"> {
  active?: boolean;
  payload?: ChartTooltipPayload;
  label?: ChartTooltipLabel;
  labelFormatter?: ChartTooltipLabelFormatter;
  labelClassName?: string;
  formatter?: ChartTooltipFormatter;
  color?: string;
  hideLabel?: boolean;
  hideIndicator?: boolean;
  indicator?: "line" | "dot" | "dashed";
  nameKey?: string;
  labelKey?: string;
}

function ChartTooltipContent({
  active,
  payload,
  className,
  indicator = "dot",
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps): React.JSX.Element | null {
  const { config } = useChart();
  const currentPayload = React.useMemo<ChartTooltipItem[]>(
    () => (payload ? [...payload] : []),
    [payload],
  );

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || currentPayload.length === 0) {
      return null;
    }

    const [item] = currentPayload;
    const key = labelKey ?? String(item.dataKey ?? item.name ?? "value");
    const itemConfig = getPayloadConfigFromPayload(config, item, key);
    const configLabel =
      !labelKey && typeof label === "string"
        ? getChartConfigEntry(config, label)
        : undefined;
    const derivedValue =
      !labelKey && typeof label === "string"
        ? (configLabel?.label ?? label)
        : itemConfig?.label;

    if (labelFormatter) {
      const formatterLabel =
        typeof derivedValue === "string" ? derivedValue : key;
      const formattedLabel = labelFormatter(formatterLabel, currentPayload);
      return (
        <div className={cn("font-medium", labelClassName)}>
          {formattedLabel}
        </div>
      );
    }

    if (!derivedValue) {
      return null;
    }

    return (
      <div className={cn("font-medium", labelClassName)}>{derivedValue}</div>
    );
  }, [
    hideLabel,
    currentPayload,
    labelKey,
    config,
    label,
    labelFormatter,
    labelClassName,
  ]);

  if (!active || currentPayload.length === 0) {
    return null;
  }

  const nestLabel = currentPayload.length === 1 && indicator !== "dot";

  return (
    <div
      className={cn(
        "border-border/50 bg-background grid min-w-[8rem] items-start gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs shadow-xl",
        className,
      )}
    >
      {!nestLabel ? tooltipLabel : null}
      <div className="grid gap-1.5">
        {currentPayload.map((item, index) => {
          const key = nameKey ?? String(item.name ?? item.dataKey ?? "value");
          const itemConfig = getPayloadConfigFromPayload(config, item, key);
          const itemPayload = getNestedPayload(item.payload);
          const indicatorColor =
            color ??
            getStringFromRecord(itemPayload, "fill") ??
            (typeof item.color === "string" ? item.color : undefined);

          const elementKey = item.dataKey ?? key;

          return (
            <div
              key={String(elementKey)}
              className={cn(
                "[&>svg]:text-muted-foreground flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5",
                indicator === "dot" && "items-center",
              )}
            >
              {formatter &&
              item.value !== undefined &&
              item.name !== undefined ? (
                formatter(item.value, item.name, item, index, currentPayload)
              ) : (
                <>
                  {itemConfig?.icon ? (
                    <itemConfig.icon />
                  ) : (
                    !hideIndicator && (
                      <div
                        className={cn(
                          "shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)",
                          {
                            "h-2.5 w-2.5": indicator === "dot",
                            "w-1": indicator === "line",
                            "w-0 border-[1.5px] border-dashed bg-transparent":
                              indicator === "dashed",
                            "my-0.5": nestLabel && indicator === "dashed",
                          },
                        )}
                        style={
                          {
                            "--color-bg": indicatorColor,
                            "--color-border": indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )
                  )}
                  <div
                    className={cn(
                      "flex flex-1 justify-between leading-none",
                      nestLabel ? "items-end" : "items-center",
                    )}
                  >
                    <div className="grid gap-1.5">
                      {nestLabel ? tooltipLabel : null}
                      <span className="text-muted-foreground">
                        {itemConfig?.label ?? item.name}
                      </span>
                    </div>
                    {item.value !== undefined ? (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {item.value.toLocaleString()}
                      </span>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const ChartLegend = RechartsPrimitive.Legend;

interface ChartLegendContentProps extends React.ComponentProps<"div"> {
  hideIcon?: boolean;
  nameKey?: string;
  payload?: ChartLegendItem[];
  verticalAlign?: "top" | "bottom";
}

function ChartLegendContent({
  className,
  hideIcon = false,
  payload,
  verticalAlign = "bottom",
  nameKey,
}: ChartLegendContentProps): React.JSX.Element | null {
  const { config } = useChart();

  if (!payload?.length) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center gap-4",
        verticalAlign === "top" ? "pb-3" : "pt-3",
        className,
      )}
    >
      {payload.map((item, index) => {
        const key = nameKey ?? String(item.dataKey ?? "value");
        const itemConfig = getPayloadConfigFromPayload(config, item, key);

        return (
          <div
            key={item.value ?? String(item.dataKey ?? index)}
            className={cn(
              "[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3",
            )}
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor:
                    typeof item.color === "string" ? item.color : undefined,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        );
      })}
    </div>
  );
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: ChartTooltipItem | ChartLegendItem | undefined,
  key: string,
): ChartConfig[string] | undefined {
  if (!payload) {
    return config[key];
  }

  const payloadRecord = isRecord(payload) ? payload : undefined;
  const nestedPayloadCandidate =
    payloadRecord && "payload" in payloadRecord
      ? (payloadRecord as { payload?: unknown }).payload
      : undefined;
  const nestedPayload = getNestedPayload(nestedPayloadCandidate);

  const directKey =
    (payloadRecord ? getStringFromRecord(payloadRecord, key) : undefined) ??
    (nestedPayload ? getStringFromRecord(nestedPayload, key) : undefined);

  if (directKey) {
    const entry = getChartConfigEntry(config, directKey);
    if (entry) {
      return entry;
    }
  }

  return getChartConfigEntry(config, key);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getNestedPayload(value: unknown): Record<string, unknown> | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  return value;
}

function getStringFromRecord(
  record: Record<string, unknown> | undefined,
  key: string,
): string | undefined {
  const candidate = record?.[key];
  return typeof candidate === "string" ? candidate : undefined;
}

function getChartConfigEntry(
  config: ChartConfig,
  key: string,
): ChartConfig[string] | undefined {
  return Object.prototype.hasOwnProperty.call(config, key)
    ? config[key]
    : undefined;
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
