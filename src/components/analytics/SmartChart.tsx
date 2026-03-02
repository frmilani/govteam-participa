'use client';

import React, { useMemo, useCallback } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { PieChart, BarChart, LineChart, RadarChart, GaugeChart, FunnelChart, TreemapChart } from 'echarts/charts';
import {
    GridComponent,
    TooltipComponent,
    LegendComponent,
    TitleComponent,
    RadarComponent,
    PolarComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// Register ECharts modules (tree-shakeable)
echarts.use([
    PieChart, BarChart, LineChart, RadarChart, GaugeChart, FunnelChart, TreemapChart,
    GridComponent, TooltipComponent, LegendComponent, TitleComponent, RadarComponent, PolarComponent,
    CanvasRenderer,
]);

export type AnalyticsWidgetType = 'pie' | 'doughnut' | 'bar_horizontal' | 'bar_vertical' | 'line' | 'area' | 'funnel' | 'gauge' | 'radar' | 'rose' | 'polar_bar' | 'treemap' | 'word_cloud' | 'box_plot' | 'metric_card';
export type AnalyticsColorScheme = 'default' | 'traffic_light' | 'gradient' | 'monochrome';

// Color palettes
const PALETTES: Record<AnalyticsColorScheme, string[]> = {
    default: ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#EF4444', '#14B8A6', '#F97316', '#84CC16'],
    traffic_light: ['#EF4444', '#F59E0B', '#10B981'],
    gradient: ['#6366F1', '#7C3AED', '#9333EA', '#A855F7', '#C084FC', '#D8B4FE'],
    monochrome: ['#1E293B', '#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1'],
};

interface SmartChartData {
    label: string;
    value: number;
    percentage?: number;
}

interface SmartChartProps {
    data: SmartChartData[];
    widgetType: AnalyticsWidgetType;
    title: string;
    fieldName?: string;
    colorScheme?: AnalyticsColorScheme;
    showPercentage?: boolean;
    showTotal?: boolean;
    loading?: boolean;
    onSegmentClick?: (label: string) => void;
    className?: string;
}

export const SmartChart: React.FC<SmartChartProps> = ({
    data,
    widgetType,
    title,
    fieldName,
    colorScheme = 'default',
    showPercentage = false,
    showTotal = false,
    loading = false,
    onSegmentClick,
    className = '',
}) => {
    const colors = PALETTES[colorScheme] || PALETTES.default;
    const total = useMemo(() => data.reduce((acc, d) => acc + d.value, 0), [data]);

    const onEvents = useMemo(() => ({
        click: (params: any) => {
            if (onSegmentClick && params?.name) {
                onSegmentClick(params.name);
            }
        },
    }), [onSegmentClick]);

    const buildOption = useCallback((): echarts.EChartsCoreOption => {
        const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');

        const baseTooltip = {
            trigger: 'item' as const,
            backgroundColor: isDark ? 'rgba(23, 23, 23, 0.96)' : 'rgba(255,255,255,0.96)',
            borderColor: isDark ? 'rgba(64, 64, 64, 0.5)' : '#e2e8f0',
            borderWidth: 1,
            textStyle: { color: isDark ? '#e5e7eb' : '#1e293b', fontSize: 12 },
            extraCssText: 'box-shadow: 0 8px 32px rgba(0,0,0,0.24); border-radius: 12px; backdrop-filter: blur(8px); border: none;',
        };

        const labelColor = isDark ? '#94a3b8' : '#64748b';
        const axisColor = isDark ? '#404040' : '#f1f5f9';

        switch (widgetType) {
            case 'pie':
            case 'doughnut':
                return {
                    color: colors,
                    tooltip: {
                        ...baseTooltip,
                        formatter: (p: any) =>
                            `<strong>${p.name}</strong><br/>${p.value.toLocaleString('pt-BR')} <span style="color:#94a3b8">(${p.percent}%)</span>`,
                    },
                    legend: {
                        bottom: 0,
                        itemWidth: 10,
                        itemHeight: 10,
                        itemGap: 12,
                        textStyle: { fontSize: 11, color: labelColor },
                        icon: 'circle',
                    },
                    series: [{
                        type: 'pie',
                        radius: widgetType === 'doughnut' ? ['45%', '75%'] : ['0%', '75%'],
                        center: ['50%', '45%'],
                        avoidLabelOverlap: true,
                        itemStyle: {
                            borderRadius: widgetType === 'doughnut' ? 6 : 4,
                            borderColor: isDark ? '#171717' : '#fff',
                            borderWidth: 2,
                        },
                        label: {
                            show: true,
                            formatter: '{b}\n{d}%',
                            fontSize: 10,
                            color: labelColor,
                            lineHeight: 14,
                        },
                        labelLine: {
                            length: 10,
                            length2: 5,
                            smooth: true,
                        },
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 20,
                                shadowOffsetX: 0,
                                shadowColor: 'rgba(0,0,0,0.3)',
                            },
                        },
                        animationType: 'scale',
                        animationEasing: 'elasticOut',
                        data: data.map(d => ({ name: d.label, value: d.value })),
                    }],
                };

            case 'bar_horizontal':
                return {
                    color: colors,
                    tooltip: {
                        ...baseTooltip,
                        trigger: 'axis',
                        axisPointer: { type: 'shadow' },
                    },
                    grid: { left: 80, right: 30, top: 10, bottom: 30, containLabel: false },
                    xAxis: {
                        type: 'value',
                        axisLine: { show: false },
                        axisTick: { show: false },
                        splitLine: { lineStyle: { color: axisColor, type: 'dashed' } },
                        axisLabel: { fontSize: 10, color: labelColor },
                    },
                    yAxis: {
                        type: 'category',
                        data: data.map(d => d.label),
                        axisLine: { show: false },
                        axisTick: { show: false },
                        axisLabel: { fontSize: 11, color: isDark ? '#e2e8f0' : '#334155', fontWeight: 500 },
                    },
                    series: [{
                        type: 'bar',
                        data: data.map((d, i) => ({
                            value: d.value,
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                                    { offset: 0, color: colors[i % colors.length] },
                                    { offset: 1, color: colors[i % colors.length] + 'AA' },
                                ]),
                                borderRadius: [0, 6, 6, 0],
                            },
                        })),
                        barWidth: '60%',
                        emphasis: {
                            itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.2)' },
                        },
                    }],
                };

            case 'bar_vertical':
                return {
                    color: colors,
                    tooltip: {
                        ...baseTooltip,
                        trigger: 'axis',
                        axisPointer: { type: 'shadow' },
                    },
                    grid: { left: 40, right: 20, top: 10, bottom: 40, containLabel: false },
                    xAxis: {
                        type: 'category',
                        data: data.map(d => d.label),
                        axisLine: { lineStyle: { color: isDark ? '#404040' : '#e2e8f0' } },
                        axisTick: { show: false },
                        axisLabel: { fontSize: 10, color: labelColor, rotate: data.length > 5 ? 30 : 0 },
                    },
                    yAxis: {
                        type: 'value',
                        axisLine: { show: false },
                        axisTick: { show: false },
                        splitLine: { lineStyle: { color: axisColor, type: 'dashed' } },
                        axisLabel: { fontSize: 10, color: labelColor },
                    },
                    series: [{
                        type: 'bar',
                        data: data.map((d, i) => ({
                            value: d.value,
                            itemStyle: {
                                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: colors[i % colors.length] },
                                    { offset: 1, color: colors[i % colors.length] + '66' },
                                ]),
                                borderRadius: [6, 6, 0, 0],
                            },
                        })),
                        barWidth: '55%',
                    }],
                };

            case 'line':
                return {
                    color: colors,
                    tooltip: { ...baseTooltip },
                    xAxis: {
                        type: 'category',
                        data: data.map(d => d.label),
                        axisLine: { lineStyle: { color: axisColor } },
                        axisLabel: { color: labelColor, fontSize: 10, fontWeight: 700 },
                    },
                    yAxis: {
                        type: 'value',
                        splitLine: { lineStyle: { color: axisColor, type: 'dashed' } },
                        axisLabel: { color: labelColor, fontSize: 10, fontWeight: 700 },
                    },
                    series: [{
                        name: fieldName,
                        data: data.map(d => d.value),
                        type: 'line',
                        smooth: true,
                        itemStyle: { color: colors[0], borderWidth: 2, borderColor: '#fff' },
                        lineStyle: { width: 4, color: colors[0] },
                        symbolSize: 8,
                        showSymbol: data.length < 20,
                    }],
                };

            case 'area':
                return {
                    color: colors,
                    tooltip: { ...baseTooltip },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: data.map(d => d.label),
                        axisLine: { lineStyle: { color: axisColor } },
                        axisLabel: { color: labelColor, fontSize: 10, fontWeight: 700 },
                    },
                    yAxis: {
                        type: 'value',
                        splitLine: { lineStyle: { color: axisColor, type: 'dashed' } },
                        axisLabel: { color: labelColor, fontSize: 10, fontWeight: 700 },
                    },
                    series: [{
                        name: fieldName,
                        data: data.map(d => d.value),
                        type: 'line',
                        smooth: true,
                        areaStyle: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                                { offset: 0, color: colors[0] + '33' },
                                { offset: 1, color: colors[0] + '00' },
                            ]),
                        },
                        itemStyle: { color: colors[0], borderWidth: 2, borderColor: '#fff' },
                        lineStyle: { width: 4, color: colors[0] },
                        symbolSize: 8,
                        showSymbol: data.length < 20,
                    }],
                };

            case 'radar':
                return {
                    color: colors,
                    tooltip: { ...baseTooltip },
                    radar: {
                        indicator: data.map(d => ({ name: d.label, max: 5 })),
                        shape: 'polygon',
                        splitNumber: 5,
                        axisName: {
                            color: labelColor,
                            fontSize: 10,
                            fontWeight: 700,
                        },
                        splitLine: { lineStyle: { color: axisColor } },
                        splitArea: { show: false },
                        axisLine: { lineStyle: { color: axisColor } },
                    },
                    series: [{
                        type: 'radar',
                        data: [{
                            value: data.map(d => d.value),
                            name: 'Média de Avaliação',
                            areaStyle: {
                                color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                                    { offset: 0, color: colors[0] + '33' },
                                    { offset: 1, color: colors[0] + '99' },
                                ]),
                            },
                        }],
                        symbol: 'circle',
                        symbolSize: 6,
                        itemStyle: { color: colors[0] },
                        lineStyle: { width: 3, color: colors[0] },
                    }],
                };

            default:
                return {};
        }
    }, [widgetType, data, colors]);

    if (loading) {
        return (
            <div className={`bg-card/60 backdrop-blur-sm rounded-2xl border border-border/40 p-6 ${className}`}>
                <div className="h-4 w-32 bg-muted rounded-full animate-pulse mb-4" />
                <div className="h-52 bg-muted/30 rounded-xl animate-pulse" />
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className={`bg-card/60 backdrop-blur-sm rounded-2xl border border-border/40 p-6 text-center ${className}`}>
                <p className="text-xs text-muted-foreground">Sem dados para &ldquo;{title}&rdquo;</p>
            </div>
        );
    }

    const option = buildOption();

    return (
        <div className={`bg-card/60 backdrop-blur-sm rounded-2xl border border-border/40 shadow-sm hover:shadow-lg transition-all overflow-hidden ${className}`}>
            <div className="px-5 pt-5 pb-2 flex items-center justify-between">
                <div>
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/80">{title}</h4>
                    {fieldName && <p className="text-[10px] text-muted-foreground/50 mt-0.5">{fieldName}</p>}
                </div>
                <div className="flex items-center gap-2">
                    {showTotal && (
                        <span className="text-[10px] font-black bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/10">
                            {total} RESP.
                        </span>
                    )}
                </div>
            </div>
            <div className="px-2 pb-3">
                <ReactEChartsCore
                    echarts={echarts}
                    option={option}
                    style={{ height: widgetType === 'bar_horizontal' ? Math.max(220, data.length * 45) : 260 }}
                    onEvents={onEvents}
                    opts={{ renderer: 'canvas' }}
                    notMerge
                />
            </div>
        </div>
    );
};
