import type * as echarts from 'echarts';
import type { PlotPoint } from "../types";
import type { UmapComparison } from "../processing/umapEmbeddings";
import {useMemo} from "react";
import ReactECharts from 'echarts-for-react';
const processCluster = (data: PlotPoint[]) => {
    return data.map((point) => [point.umap_x, point.umap_y]);
}


const UMAPComparisonPlot = ({ data} : { data: UmapComparison }) => {

// 4. Build out your typed ECharts series array
    const seriesData: echarts.ScatterSeriesOption[] = useMemo(() =>
        [{
            name: `Cluster TCGA`,
            type: 'scatter',
            symbolSize: 10, // 10k points look cleaner with slightly smaller symbols
            large: true,
            largeThreshold: 2000,
            data: processCluster(data.tcga),
            dimensions: ['X', 'Y'],
            emphasis: {
                focus: 'series',
                itemStyle: {
                    borderWidth: 1,
                    borderColor: '#fff'
                }
            }
        },
            {
                name: `Cluster Input`,
                type: 'scatter',
                symbolSize: 10, // 10k points look cleaner with slightly smaller symbols
                large: true,
                largeThreshold: 2000,
                data: processCluster(data.input),
                dimensions: ['X', 'Y'],
                emphasis: {
                    focus: 'series',
                    itemStyle: {
                        borderWidth: 1,
                        borderColor: '#fff'
                    }
                }
            }
        ], [data]);


// 5. Build your configuration block using the explicit EChartsOption type
    const option: echarts.EChartsOption = {
        backgroundColor: '#ffffff',
        title: {
            text: 'UMAP Projection',
            left: 'center',
            textStyle: {color: '#000000', fontSize: 16}
        },
        tooltip: {
            trigger: 'item',
            formatter: (params: any) => {
                // params.value maps to our structured [x, y] coordinates
                const [x, y] = params.value as [number, number];
                return `
        <strong style="color:${params.color}">${params.seriesName}</strong><br/>
        X: ${x.toFixed(3)}<br/>
        Y: ${y.toFixed(3)}
      `;
            }
        },
        legend: {
            orient: 'vertical',
            right: 10,
            top: 'center',
            textStyle: {color: '#000000'},
            type: 'scroll'
        },
        xAxis: {
            type: 'value',
            scale: true, // Crucial: dynamically fits axis boundaries to data limits
            splitLine: {lineStyle: {color: '#e0e0e0'}},
            axisLabel: {color: '#000000'}
        },
        yAxis: {
            type: 'value',
            scale: true,
            splitLine: {lineStyle: {color: '#e0e0e0'}},
            axisLabel: {color: '#000000'}
        },
        toolbox: {
            right: 10,
            top: 10,
            feature: {
                dataZoom: {},
                restore: {},
                saveAsImage: {title: 'Export'}
            },
            iconStyle: {borderColor: '#000000'}
        },
        dataZoom: [
            {type: 'inside'}, // Fast wheel-scroll & pinch zooming
            {type: 'slider', show: true, bottom: 10, textStyle: {color: '#000000'}}
        ],
        series: seriesData
    };

    return (
        <div className="absolute inset-0">
        <ReactECharts
        option={option}
        notMerge={true}
        lazyUpdate={false}
        opts={{ renderer: 'canvas' }}
        style={{height: '100%', width: '100%'}}
        />
        </div>);
}

export default UMAPComparisonPlot;
