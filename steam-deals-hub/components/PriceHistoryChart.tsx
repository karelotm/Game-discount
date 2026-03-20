'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface PricePoint {
  date: string;
  price: number;
}

interface PriceHistoryChartProps {
  data: PricePoint[];
  cheapestEver?: { price: number; date: string };
}

export default function PriceHistoryChart({ data, cheapestEver }: PriceHistoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted text-sm">
        No price history available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <XAxis
            dataKey="date"
            stroke="#8888AA"
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke="#8888AA"
            fontSize={11}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <Tooltip
            contentStyle={{
              background: '#12121A',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: '#8888AA' }}
            formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Price']}
          />
          {cheapestEver && (
            <ReferenceLine
              y={cheapestEver.price}
              stroke="#39FF14"
              strokeDasharray="3 3"
              label={{ value: `Lowest: $${cheapestEver.price}`, fill: '#39FF14', fontSize: 11 }}
            />
          )}
          <Line
            type="stepAfter"
            dataKey="price"
            stroke="#00F0FF"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#00F0FF' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
