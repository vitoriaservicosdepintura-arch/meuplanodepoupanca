"use client";

import { eur } from "@/lib/plan";

type Point = { week: number; value: number };

export default function SavingsChart({
  points,
  goal,
}: {
  points: Point[];
  goal: number;
}) {
  const width = 320;
  const height = 180;
  const padLeft = 38;
  const padRight = 10;
  const padTop = 14;
  const padBottom = 24;

  const maxValue = Math.max(goal, ...points.map((p) => p.value), 1);
  const innerW = width - padLeft - padRight;
  const innerH = height - padTop - padBottom;

  const x = (index: number) =>
    padLeft + (points.length <= 1 ? 0 : (index / (points.length - 1)) * innerW);
  const y = (value: number) => padTop + innerH - (value / maxValue) * innerH;

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p.value)}`).join(" ");
  const area =
    points.length > 0
      ? `${line} L${x(points.length - 1)},${padTop + innerH} L${x(0)},${padTop + innerH} Z`
      : "";
  const goalY = y(goal);

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-auto w-full"
        role="img"
        aria-label="Evolução da poupança"
      >
        <defs>
          <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.5, 1].map((fraction) => {
          const value = maxValue * (1 - fraction);
          const lineY = padTop + innerH * fraction;
          return (
            <g key={fraction}>
              <line
                x1={padLeft}
                x2={width - padRight}
                y1={lineY}
                y2={lineY}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
              <text x={2} y={lineY + 3} fill="#64748b" fontSize="8">
                {Math.round(value)}
              </text>
            </g>
          );
        })}

        <line
          x1={padLeft}
          x2={width - padRight}
          y1={goalY}
          y2={goalY}
          stroke="#fbbf24"
          strokeDasharray="4 4"
          strokeWidth="1.2"
        />
        <text x={width - padRight} y={goalY - 4} fill="#fbbf24" fontSize="8" textAnchor="end">
          Meta {eur(goal)}
        </text>

        {area ? <path d={area} fill="url(#fill)" /> : null}
        {line ? (
          <path d={line} fill="none" stroke="#34d399" strokeWidth="2.4" strokeLinejoin="round" />
        ) : null}

        {points.map((point, index) => (
          <circle
            key={point.week}
            cx={x(index)}
            cy={y(point.value)}
            r="2.6"
            fill="#0b1120"
            stroke="#34d399"
            strokeWidth="1.6"
          />
        ))}

        {points.map((point, index) =>
          index % 2 === 0 || index === points.length - 1 ? (
            <text
              key={`label-${point.week}`}
              x={x(index)}
              y={height - 6}
              fill="#64748b"
              fontSize="8"
              textAnchor="middle"
            >
              S{point.week}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}
