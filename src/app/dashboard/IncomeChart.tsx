"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function IncomeChart({
  data,
}: {
  data: { month: string; income: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
        <Tooltip
          formatter={(value) => {
            const num = typeof value === "number" ? value : Number(value ?? 0);
            return [`$${num.toFixed(2)}`, "Income"] as [string, string];
          }}
        />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#000000"
          strokeWidth={2}
          dot={{ r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
