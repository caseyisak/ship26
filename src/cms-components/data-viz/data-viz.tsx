'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  Scatter,
  ScatterChart,
  Tooltip,
  Treemap,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

import type { DataVizFragment } from '@/block-renderer/types';
import { BlockProps } from '@/block-renderer/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  useContentfulInspectorModeProps,
  useLiveUpdates,
} from '@/lib/live-preview';
import { cn } from '@/lib/utils';

type ChartRow = Record<string, string | number>;

const COLOR_SCHEMES: Record<string, string[]> = {
  default: [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
  ],
  blue: ['#0088FE', '#00C49F', '#4FC3F7', '#29B6F6', '#0288D1'],
  green: ['#00C49F', '#82ca9d', '#8dd1e1', '#a4de6c', '#d0ed57'],
  purple: ['#8884d8', '#a78bfa', '#c084fc', '#e879f9', '#f0abfc'],
  warm: ['#E65C41', '#F4A261', '#E9C46A', '#ff6b6b', '#ffa07a'],
};

const DataViz = ({
  data,
  className,
  ...props
}: BlockProps<DataVizFragment>) => {
  const liveData = useLiveUpdates(data);
  const getProps = useContentfulInspectorModeProps(data.sys.id);

  const title = liveData.title ?? null;
  const description = liveData.description ?? null;
  const chartType = liveData.chartType ?? 'groupedBar';
  const csvUrl = liveData.csvData?.url ?? null;
  const colorScheme = liveData.colorScheme ?? 'default';
  const showLegend = liveData.showLegend ?? true;

  const [chartData, setChartData] = useState<ChartRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const colors = COLOR_SCHEMES[colorScheme] ?? COLOR_SCHEMES.default;

  useEffect(() => {
    if (!csvUrl) {
      setError('No CSV data provided');
      setIsLoading(false);
      return;
    }

    const fullUrl = csvUrl.startsWith('//') ? `https:${csvUrl}` : csvUrl;
    setIsLoading(true);
    setError(null);

    Papa.parse<ChartRow>(fullUrl, {
      download: true,
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError(`CSV parsing error: ${results.errors[0].message}`);
          setIsLoading(false);
          return;
        }
        setHeaders(results.meta.fields ?? []);
        setChartData(results.data);
        setIsLoading(false);
      },
      error: (err: Error) => {
        setError(`Failed to load CSV: ${err.message}`);
        setIsLoading(false);
      },
    });
  }, [csvUrl]);

  // Build chart config from headers (numeric columns become series)
  const { categoryKey, seriesKeys, chartConfig } = useMemo(() => {
    if (headers.length === 0 || chartData.length === 0) {
      return { categoryKey: '', seriesKeys: [] as string[], chartConfig: {} as ChartConfig };
    }

    const catKey = headers[0];
    const numericKeys = headers.filter((h, i) => {
      if (i === 0) return false;
      // Only include columns that are numeric in the first data row
      const val = chartData[0][h];
      return typeof val === 'number';
    });

    const config: ChartConfig = {};
    numericKeys.forEach((key, i) => {
      config[key] = {
        label: key.charAt(0).toUpperCase() + key.slice(1),
        color: colors[i % colors.length],
      };
    });

    return { categoryKey: catKey, seriesKeys: numericKeys, chartConfig: config };
  }, [headers, chartData, colors]);

  const renderGroupedBar = () => {
    if (chartData.length === 0 || seriesKeys.length === 0) return null;

    return (
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <BarChart data={chartData} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={categoryKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
          />
          <YAxis tickLine={false} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          {showLegend && (
            <ChartLegend content={<ChartLegendContent />} />
          )}
          {seriesKeys.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[i % colors.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ChartContainer>
    );
  };

  const renderTreemap = () => {
    if (chartData.length === 0) return null;

    // Helper to determine if a color is light or dark
    const getContrastColor = (bgColor: string | undefined): string => {
      // Default to white text if no color provided
      if (!bgColor || typeof bgColor !== 'string') {
        return '#fff';
      }

      // Handle CSS variables
      if (bgColor.startsWith('var(')) {
        // For chart colors, use dark text since they're generally bright
        return '#000';
      }

      // Convert hex to RGB
      const hex = bgColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);

      // Calculate relative luminance
      const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Return black for light backgrounds, white for dark
      return luminance > 0.5 ? '#000' : '#fff';
    };

    // Treemap expects: name, size, (optional) fill
    // Use first numeric column as size
    const sizeKey = seriesKeys[0] ?? 'series1';
    const treemapData = chartData.map((row, i) => ({
      name: String(row[categoryKey] ?? `Item ${i + 1}`),
      size: Number(row[sizeKey] ?? 0),
      fill: colors[i % colors.length],
    }));

    const CustomContent = (props: any) => {
      const { x, y, width, height, name, size } = props;
      const xNum = Number(x);
      const yNum = Number(y);
      const widthNum = Number(width);
      const heightNum = Number(height);
      const nameStr = String(name);
      const sizeStr = String(size);

      if (widthNum < 40 || heightNum < 30) return null;

      const textColor = getContrastColor(props.fill);

      return (
        <g>
          <rect
            x={xNum}
            y={yNum}
            width={widthNum}
            height={heightNum}
            fill={props.fill}
            stroke="#fff"
            strokeWidth={2}
            rx={4}
          />
          <text
            x={xNum + widthNum / 2}
            y={yNum + heightNum / 2 - 6}
            textAnchor="middle"
            fill={textColor}
            fontSize={18}
            fontWeight="bold"
          >
            {nameStr}
          </text>
          <text
            x={xNum + widthNum / 2}
            y={yNum + heightNum / 2 + 10}
            textAnchor="middle"
            fill={textColor}
            fontSize={15}
          >
            {sizeStr}
          </text>
        </g>
      );
    };

    return (
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <Treemap
          data={treemapData}
          dataKey="size"
          aspectRatio={4 / 3}
          stroke="#fff"
          content={<CustomContent />}
        >
          <Tooltip content={<ChartTooltipContent />} />
        </Treemap>
      </ChartContainer>
    );
  };

  const renderBubble = () => {
    if (chartData.length === 0 || seriesKeys.length < 2) return null;

    // Bubble: x, y, z (size)
    const xKey = seriesKeys[0];
    const yKey = seriesKeys[1];
    const zKey = seriesKeys[2] ?? seriesKeys[0];

    return (
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <ScatterChart accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            type="number"
            dataKey={xKey}
            name={chartConfig[xKey]?.label ?? xKey}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="number"
            dataKey={yKey}
            name={chartConfig[yKey]?.label ?? yKey}
            tickLine={false}
            axisLine={false}
          />
          <ZAxis
            type="number"
            dataKey={zKey}
            range={[60, 400]}
            name={chartConfig[zKey]?.label ?? zKey}
          />
          <ChartTooltip
            content={<ChartTooltipContent />}
            cursor={{ strokeDasharray: '3 3' }}
          />
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          <Scatter name="Data" data={chartData} fill={colors[0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Scatter>
        </ScatterChart>
      </ChartContainer>
    );
  };

  const renderRadar = () => {
    if (chartData.length === 0 || seriesKeys.length === 0) return null;

    return (
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <RadarChart data={chartData} accessibilityLayer>
          <PolarGrid />
          <PolarAngleAxis dataKey={categoryKey} />
          <PolarRadiusAxis />
          <ChartTooltip content={<ChartTooltipContent />} />
          {showLegend && <ChartLegend content={<ChartLegendContent />} />}
          {seriesKeys.map((key, i) => (
            <Radar
              key={key}
              name={chartConfig[key]?.label ?? key}
              dataKey={key}
              stroke={colors[i % colors.length]}
              fill={colors[i % colors.length]}
              fillOpacity={0.5}
            />
          ))}
        </RadarChart>
      </ChartContainer>
    );
  };

  const renderFunnel = () => {
    if (chartData.length === 0 || seriesKeys.length === 0) return null;

    // Funnel: stacked bars showing progression
    const valueKey = seriesKeys[0];
    const funnelData = chartData
      .map((row) => ({
        name: String(row[categoryKey]),
        value: Number(row[valueKey] ?? 0),
      }))
      .sort((a, b) => b.value - a.value); // Sort descending for funnel effect

    return (
      <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
        <BarChart
          data={funnelData}
          layout="vertical"
          margin={{ left: 0, right: 30 }}
          accessibilityLayer
        >
          <CartesianGrid horizontal={false} />
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey="name"
            tickLine={false}
            axisLine={false}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {funnelData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
            <LabelList
              dataKey="value"
              position="right"
              fill="hsl(var(--foreground))"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ChartContainer>
    );
  };

  const renderChart = () => {
    switch (chartType) {
      case 'groupedBar':
        return renderGroupedBar();
      case 'treemap':
        return renderTreemap();
      case 'bubble':
        return renderBubble();
      case 'radar':
        return renderRadar();
      case 'funnel':
        return renderFunnel();
      default:
        return (
          <div className="text-muted-foreground flex h-[300px] items-center justify-center">
            Chart type &ldquo;{chartType}&rdquo; not supported
          </div>
        );
    }
  };

  return (
    <section
      id="data-viz"
      className={cn('py-16 md:py-24', className ?? '')}
      {...props}
    >
      <div className="container px-6">
        <Card>
          <CardHeader>
            {title && (
              <CardTitle
                className="text-lg font-semibold"
                {...getProps({ fieldId: 'title' })}
              >
                {title}
              </CardTitle>
            )}
            {description && (
              <CardDescription {...getProps({ fieldId: 'description' })}>
                {description}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent {...getProps({ fieldId: 'csvData' })}>
            {isLoading && (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-muted-foreground">Loading chart data...</p>
              </div>
            )}
            {error && (
              <div className="flex h-[300px] items-center justify-center">
                <p className="text-destructive">{error}</p>
              </div>
            )}
            {!isLoading && !error && renderChart()}
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export { DataViz };
