
import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Sector
} from 'recharts';
import { ChartDataItem, ChartType } from '../../types';

interface ChartComponentProps {
  data: ChartDataItem[];
  type: ChartType;
  xAxisKey?: string;
  yAxisKey?: string; // Only for Bar/Line if single Y axis
  dataKeys: { key: string; color: string | string[] }[]; // For multiple lines/bars or pie slices
  height?: number;
}

const ActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="font-semibold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`Value ${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};


const ChartComponent: React.FC<ChartComponentProps> = ({ data, type, xAxisKey, yAxisKey, dataKeys, height = 300 }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const renderChart = () => {
    switch (type) {
      case ChartType.LINE:
        return (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xAxisKey} stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip wrapperClassName="rounded-md shadow-lg bg-white border border-gray-200" />
            <Legend />
            {dataKeys.map(dk => (
              <Line key={dk.key} type="monotone" dataKey={dk.key} stroke={typeof dk.color === 'string' ? dk.color : dk.color[0]} strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            ))}
          </LineChart>
        );
      case ChartType.BAR:
        return (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey={xAxisKey} stroke="#6b7280" />
            <YAxis stroke="#6b7280" />
            <Tooltip wrapperClassName="rounded-md shadow-lg bg-white border border-gray-200" />
            <Legend />
            {dataKeys.map(dk => (
              <Bar key={dk.key} dataKey={dk.key} fill={typeof dk.color === 'string' ? dk.color : dk.color[0]} />
            ))}
          </BarChart>
        );
      case ChartType.PIE:
        return (
          <PieChart>
            <Tooltip wrapperClassName="rounded-md shadow-lg bg-white border border-gray-200" />
            <Pie
              activeIndex={activeIndex}
              activeShape={ActiveShape}
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              fill="#8884d8" // Default fill, overridden by Cells
              dataKey={dataKeys[0].key} // Pie chart usually has one primary data key for values
              onMouseEnter={onPieEnter}
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={Array.isArray(dataKeys[0].color) ? dataKeys[0].color[index % dataKeys[0].color.length] : dataKeys[0].color} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        );
      default:
        return <p>Unsupported chart type</p>;
    }
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      {renderChart()}
    </ResponsiveContainer>
  );
};

export default ChartComponent;

    