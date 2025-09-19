import React from 'react';
import { ResponsiveContainer } from 'recharts';

interface CandlestickData {
  name: string;
  open: number;
  high: number;
  low: number;
  close: number;
  type: 'link' | 'file';
}

interface CandlestickChartProps {
  data: CandlestickData[];
  width?: string | number;
  height?: number;
}

const CandlestickChart: React.FC<CandlestickChartProps> = ({ 
  data, 
  width = "100%", 
  height = 400 
}) => {
  const maxValue = Math.max(...data.map(d => d.high));
  const minValue = Math.min(...data.map(d => d.low));
  const range = maxValue - minValue;
  const padding = range * 0.1;
  const chartMax = maxValue + padding;
  const chartMin = Math.max(0, minValue - padding);
  const chartRange = chartMax - chartMin;

  const getY = (value: number) => {
    return ((chartMax - value) / chartRange) * 100;
  };

  const candleWidth = 80 / data.length; // Percentage width for each candle
  const candleSpacing = 100 / data.length; // Spacing between candles

  return (
    <div className="w-full" style={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
            <path d="M 10 0 L 0 0 0 10" fill="none" stroke="hsl(var(--muted))" strokeWidth="0.1"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" opacity="0.3" />
        
        {/* Y-axis labels */}
        {[0, 25, 50, 75, 100].map(percent => {
          const value = chartMax - (percent / 100) * chartRange;
          return (
            <g key={percent}>
              <line 
                x1="0" 
                y1={percent} 
                x2="100" 
                y2={percent} 
                stroke="hsl(var(--muted))" 
                strokeWidth="0.1"
                opacity="0.5"
              />
              <text 
                x="-2" 
                y={percent} 
                fontSize="2" 
                fill="hsl(var(--muted-foreground))" 
                textAnchor="end"
                dominantBaseline="middle"
              >
                {value.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* Candlesticks */}
        {data.map((candle, index) => {
          const x = (index * candleSpacing) + (candleSpacing - candleWidth) / 2;
          const centerX = x + candleWidth / 2;
          
          const openY = getY(candle.open);
          const closeY = getY(candle.close);
          const highY = getY(candle.high);
          const lowY = getY(candle.low);
          
          const isGreen = candle.close >= candle.open;
          const bodyTop = Math.min(openY, closeY);
          const bodyHeight = Math.abs(closeY - openY);
          
          // Colors based on type and direction
          let fillColor, strokeColor;
          if (candle.type === 'link') {
            fillColor = isGreen ? '#22c55e' : '#ef4444';
            strokeColor = isGreen ? '#16a34a' : '#dc2626';
          } else {
            fillColor = isGreen ? '#22c55e' : '#ef4444';
            strokeColor = isGreen ? '#16a34a' : '#dc2626';
          }

          return (
            <g key={index}>
              {/* High-Low line (wick) */}
              <line
                x1={centerX}
                y1={highY}
                x2={centerX}
                y2={lowY}
                stroke={strokeColor}
                strokeWidth="0.2"
              />
              
              {/* Candle body */}
              <rect
                x={x}
                y={bodyTop}
                width={candleWidth}
                height={Math.max(bodyHeight, 0.5)} // Minimum height for doji candles
                fill={isGreen ? fillColor : 'transparent'}
                stroke={strokeColor}
                strokeWidth="0.2"
              />
              
              {/* X-axis label */}
              <text
                x={centerX}
                y="105"
                fontSize="2.5"
                fill="hsl(var(--muted-foreground))"
                textAnchor="middle"
              >
                {candle.name}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default CandlestickChart;
