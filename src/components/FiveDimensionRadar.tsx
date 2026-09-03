import React from 'react';
import { RadarScores } from '../types';

interface FiveDimensionRadarProps {
  scores: RadarScores;
  size?: number;
  className?: string;
}

export const FiveDimensionRadar: React.FC<FiveDimensionRadarProps> = ({
  scores,
  size = 220,
  className = '',
}) => {
  const center = size / 2;
  const radius = size * 0.38;

  const dimensions = [
    { key: 'rhythm', label: '音律之美', value: scores.rhythm },
    { key: 'culture', label: '文化底蕴', value: scores.culture },
    { key: 'distinction', label: '辨识清奇', value: scores.distinction },
    { key: 'wuxingFit', label: '五行契合', value: scores.wuxingFit },
    { key: 'auspicious', label: '数理吉祥', value: scores.auspicious },
  ];

  const totalPoints = dimensions.length;
  // 从正上方开始顺时针分配角度
  const getCoordinates = (index: number, val: number, maxVal = 100) => {
    const angle = (Math.PI * 2 * index) / totalPoints - Math.PI / 2;
    const r = (val / maxVal) * radius;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  };

  // 绘制同心五边形网格
  const levels = [0.25, 0.5, 0.75, 1];
  const gridPolygons = levels.map((lvl) => {
    return dimensions
      .map((_, i) => {
        const { x, y } = getCoordinates(i, lvl * 100);
        return `${x},${y}`;
      })
      .join(' ');
  });

  // 数据多边形
  const dataPolygon = dimensions
    .map((d, i) => {
      const { x, y } = getCoordinates(i, d.value);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      <svg width={size} height={size} className="overflow-visible">
        {/* 背景同心五边形 */}
        {gridPolygons.map((pts, idx) => (
          <polygon
            key={idx}
            points={pts}
            fill={idx === levels.length - 1 ? 'rgba(197, 160, 89, 0.04)' : 'transparent'}
            stroke="#E5DFD5"
            strokeWidth={idx === levels.length - 1 ? '1.5' : '1'}
            strokeDasharray={idx < levels.length - 1 ? '3 3' : 'none'}
          />
        ))}

        {/* 轴线 */}
        {dimensions.map((_, i) => {
          const { x, y } = getCoordinates(i, 100);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={x}
              y2={y}
              stroke="#D9CBB7"
              strokeWidth="1"
            />
          );
        })}

        {/* 数据区域填充 */}
        <polygon
          points={dataPolygon}
          fill="rgba(194, 53, 49, 0.22)"
          stroke="#C23531"
          strokeWidth="2"
        />

        {/* 数据圆点 */}
        {dimensions.map((d, i) => {
          const { x, y } = getCoordinates(i, d.value);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="3.5"
              fill="#C23531"
              stroke="#FFFFFF"
              strokeWidth="1.5"
            />
          );
        })}

        {/* 顶点文字标签 */}
        {dimensions.map((d, i) => {
          const labelDist = radius + 20;
          const angle = (Math.PI * 2 * i) / totalPoints - Math.PI / 2;
          const lx = center + labelDist * Math.cos(angle);
          const ly = center + labelDist * Math.sin(angle);

          return (
            <text
              key={i}
              x={lx}
              y={ly}
              textAnchor="middle"
              dominantBaseline="central"
              className="text-[11px] font-serif fill-[#6A5A4A]"
            >
              {d.label} {d.value}
            </text>
          );
        })}
      </svg>
    </div>
  );
};
