import * as React from "react";
import { PieChart, Pie, Cell } from "recharts";

type ShiftStatus = "notOpened" | "empty" | "notSigned" | "signed";

const STATUS_COLORS: Record<ShiftStatus, string> = {
  notOpened: "#a0a0b0", // серый
  empty: "#ffac40ff", // оранжевый
  notSigned: "#6940ffff", // фиолетовый
  signed: "#2bba23", // зелёный
};

type StatusCounts = Record<ShiftStatus, number>;

const buildLeaderCounts = (
  leaderProjects: Record<
    string,
    { statuses: Partial<Record<ShiftStatus, any[]>> }
  >,
): StatusCounts => {
  const counts: StatusCounts = {
    notOpened: 0,
    empty: 0,
    notSigned: 0,
    signed: 0,
  };

  Object.values(leaderProjects).forEach((p) => {
    counts.notOpened += p.statuses.notOpened?.length ?? 0;
    counts.empty += p.statuses.empty?.length ?? 0;
    counts.notSigned += p.statuses.notSigned?.length ?? 0;
    counts.signed += p.statuses.signed?.length ?? 0;
  });

  return counts;
};

export const LeaderStatusPie: React.FC<{
  leaderProjects: Record<
    string,
    { statuses: Partial<Record<ShiftStatus, any[]>> }
  >;
  size?: number; // px
}> = ({ leaderProjects, size = 30 }) => {
  const counts = React.useMemo(
    () => buildLeaderCounts(leaderProjects),
    [leaderProjects],
  );

  const data = (Object.keys(counts) as ShiftStatus[])
    .map((k) => ({ name: k, value: counts[k], color: STATUS_COLORS[k] }))
    .filter((x) => x.value > 0);

  // если вообще нет смен — покажем “пустой” серый круг
  const safeData = data.length
    ? data
    : [{ name: "empty", value: 1, color: "#e5e5e5" }];

  return (
    <PieChart width={size} height={size}>
      <Pie
        data={safeData}
        dataKey="value"
        cx="50%"
        cy="50%"
        outerRadius={size / 2}
        innerRadius={size / 2 - 6} // толщину можно менять
        stroke="transparent"
        isAnimationActive={false}
      >
        {safeData.map((entry, idx) => (
          <Cell key={idx} fill={entry.color} />
        ))}
      </Pie>
    </PieChart>
  );
};
