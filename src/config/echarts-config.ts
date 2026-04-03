import * as echarts from 'echarts/core';
import { LineChart, GaugeChart, BarChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
  TitleComponent,
  VisualMapComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  LineChart,
  GaugeChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomComponent,
  ToolboxComponent,
  TitleComponent,
  VisualMapComponent,
  CanvasRenderer,
]);

export { echarts };

export const CHART_COLORS = {
  solar: '#F59E0B',
  wind: '#93C5FD',
  price: '#10B981',
  co2Green: '#22C55E',
  co2Yellow: '#EAB308',
  co2Red: '#EF4444',
  residual: '#6366F1',
  windOffshore: '#1E40AF',
} as const;
