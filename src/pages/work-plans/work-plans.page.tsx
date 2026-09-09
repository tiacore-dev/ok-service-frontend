import * as React from "react";
import dayjs from "dayjs";
import { Breadcrumb, DatePicker, Spin, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { NotificationContext } from "../../contexts/NotificationContext";
import { RoleId } from "../../interfaces/roles/IRole";
import type { IWorkPlan } from "../../interfaces/workPlans/IWorkPlan";
import { getCurrentRole } from "../../store/modules/auth";
import { formatNumber } from "../../utils/formatNumber";
import { useUsersQuery } from "../../queries/users";
import {
  useCreateWorkPlanMutation,
  useDeleteWorkPlanMutation,
  useUpdateWorkPlanMutation,
  useWorkPlansQuery,
} from "../../queries/workPlans";
import { useProjectLeadersStatsByMonthsQuery } from "../../queries/projectLeaderStats";
import "./work-plans.page.less";
import { WorkPlanCell } from "./WorkPlanCell";

interface PlanRow {
  key: string;
  name: string;
  userId?: string;
}

const months = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const getMonthDate = (year: number, month: number) =>
  `${year}-${String(month + 1).padStart(2, "0")}-01`;

const getPlanKey = (userId: string | undefined, month: number) =>
  `${userId ?? "company"}-${month}`;

export const WorkPlans = () => {
  const [year, setYear] = React.useState(dayjs().year());
  const [activeCellKey, setActiveCellKey] = React.useState<string | null>(null);
  const role = useSelector(getCurrentRole);
  const notificationApi = React.useContext(NotificationContext);
  const {
    data: plans = [],
    isPending: isPlansPending,
    isError: isPlansError,
  } = useWorkPlansQuery(year);
  const projectLeaderStatsQueries = useProjectLeadersStatsByMonthsQuery(year);
  const { data: users = [], isPending: isUsersPending } = useUsersQuery();
  const createMutation = useCreateWorkPlanMutation();
  const updateMutation = useUpdateWorkPlanMutation();
  const deleteMutation = useDeleteWorkPlanMutation();
  const canEdit = role === RoleId.ADMIN;
  const isProjectLeaderStatsError = projectLeaderStatsQueries.some(
    (query) => query.isError,
  );

  const plansMap = React.useMemo(() => {
    const result: Record<string, IWorkPlan> = {};
    plans
      .filter((plan) => !plan.deleted)
      .forEach((plan) => {
        const month = dayjs(plan.date).month();
        result[getPlanKey(plan.user_id, month)] = plan;
      });
    return result;
  }, [plans]);

  const rows = React.useMemo<PlanRow[]>(
    () => [
      { key: "company", name: "План компании" },
      ...users
        .filter(
          (user) =>
            user.role === RoleId.PROJECT_LEADER &&
            !user.deleted &&
            user.is_active,
        )
        .sort((first, second) => first.name.localeCompare(second.name))
        .map((user) => ({
          key: user.user_id,
          name: user.name,
          userId: user.user_id,
        })),
    ],
    [users],
  );

  const progressByMonth = React.useMemo(
    () =>
      projectLeaderStatsQueries.map((query) => ({
        company: query.data?.total,
        leaders: new Map(
          query.data?.project_leaders.map((leader) => [
            leader.user_id,
            leader.stats,
          ]),
        ),
        isPending: query.isPending,
      })),
    [projectLeaderStatsQueries],
  );

  const savePlan = React.useCallback(
    async (
      plan: IWorkPlan | undefined,
      payload: { date: string; summ: string; user_id?: string },
    ) => {
      try {
        if (plan) {
          await updateMutation.mutateAsync({
            workPlanId: plan.work_plan_id,
            year,
            payload,
          });
        } else {
          await createMutation.mutateAsync({ year, payload });
        }
      } catch (error) {
        notificationApi?.error({
          message: "Ошибка",
          description:
            error instanceof Error
              ? error.message
              : "Не удалось сохранить план выработки",
          placement: "bottomRight",
          duration: 2,
        });
        throw error;
      }
    },
    [createMutation, notificationApi, updateMutation, year],
  );

  const deletePlan = React.useCallback(
    async (plan: IWorkPlan) => {
      try {
        await deleteMutation.mutateAsync({
          workPlanId: plan.work_plan_id,
          year,
        });
      } catch (error) {
        notificationApi?.error({
          message: "Ошибка",
          description:
            error instanceof Error
              ? error.message
              : "Не удалось удалить план выработки",
          placement: "bottomRight",
          duration: 2,
        });
        throw error;
      }
    },
    [deleteMutation, notificationApi, year],
  );

  const handleEditStart = React.useCallback((cellKey: string) => {
    setActiveCellKey(cellKey);
  }, []);

  const handleEditEnd = React.useCallback(() => {
    setActiveCellKey(null);
  }, []);

  const columns = React.useMemo<ColumnsType<PlanRow>>(() => {
    const planColumns: ColumnsType<PlanRow> = months.map(
      (month, monthIndex) => ({
        title: month,
        key: month,
        width: 160,
        align: "right",
        render: (_, row) => {
          const key = getPlanKey(row.userId, monthIndex);
          const plan = plansMap[key];
          const monthlyProgress = progressByMonth[monthIndex];
          const stats = row.userId
            ? monthlyProgress?.leaders.get(row.userId)
            : monthlyProgress?.company;
          return (
            <WorkPlanCell
              cellKey={key}
              editing={activeCellKey === key}
              plan={plan}
              canEdit={canEdit}
              onEditStart={handleEditStart}
              onEditEnd={handleEditEnd}
              onSave={savePlan}
              onDelete={deletePlan}
              progress={
                stats
                  ? {
                      completedSumm: stats.shift_report_details_summ,
                      acceptedSumm: stats.accepted_summ,
                    }
                  : undefined
              }
              progressPending={Boolean(monthlyProgress?.isPending)}
              payload={{
                ...(row.userId ? { user_id: row.userId } : {}),
                date: getMonthDate(year, monthIndex),
                summ: "",
              }}
            />
          );
        },
      }),
    );

    return [
      {
        title: "Прораб",
        dataIndex: "name",
        key: "name",
        width: 240,
        fixed: "left",
      },
      ...planColumns,
      {
        title: "Итого за год",
        key: "total",
        width: 180,
        fixed: "right",
        align: "right",
        render: (_, row) => {
          const total = months.reduce(
            (result, __, monthIndex) => {
              const key = getPlanKey(row.userId, monthIndex);
              const planValue = Number(plansMap[key]?.summ ?? 0);
              const monthlyProgress = progressByMonth[monthIndex];
              const stats = row.userId
                ? monthlyProgress?.leaders.get(row.userId)
                : monthlyProgress?.company;
              const completedValue = Number(
                stats?.shift_report_details_summ ?? 0,
              );
              const acceptedValue = stats?.accepted_summ;

              return {
                plan:
                  result.plan + (Number.isFinite(planValue) ? planValue : 0),
                completed:
                  result.completed +
                  (Number.isFinite(completedValue) ? completedValue : 0),
                accepted:
                  typeof acceptedValue === "number"
                    ? result.accepted + acceptedValue
                    : result.accepted,
                hasAccepted:
                  result.hasAccepted || typeof acceptedValue === "number",
              };
            },
            { plan: 0, completed: 0, accepted: 0, hasAccepted: false },
          );
          const completionPercent =
            total.plan > 0 ? (total.completed / total.plan) * 100 : null;
          const isProgressPending = progressByMonth.some(
            (month) => month.isPending,
          );

          return (
            <div className="work-plans__cell">
              <span className="work-plans__cell-value">
                {formatNumber(total.plan)}
              </span>
              {isProgressPending ? (
                <span className="work-plans__progress">Загрузка…</span>
              ) : (
                <span className="work-plans__progress">
                  <span>
                    {formatNumber(total.completed)}
                    {completionPercent !== null && (
                      <> · {completionPercent.toFixed(1)}%</>
                    )}
                  </span>
                  {total.hasAccepted && (
                    <span>Принято: {formatNumber(total.accepted)}</span>
                  )}
                </span>
              )}
            </div>
          );
        },
      },
    ];
  }, [
    activeCellKey,
    canEdit,
    deletePlan,
    handleEditEnd,
    handleEditStart,
    plansMap,
    progressByMonth,
    savePlan,
    year,
  ]);

  return (
    <main className="work-plans">
      <Breadcrumb
        className="breadcrumb"
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "План выработки" },
        ]}
      />
      <div className="work-plans__header">
        <Typography.Title level={3}>План выработки</Typography.Title>
        <DatePicker
          picker="year"
          allowClear={false}
          value={dayjs().year(year)}
          onChange={(value) => value && setYear(value.year())}
        />
      </div>
      {isProjectLeaderStatsError && (
        <Typography.Text type="danger">
          Не удалось загрузить статистику выполненных работ по прорабам.
        </Typography.Text>
      )}
      {isPlansError ? (
        <Typography.Text type="danger">
          Не удалось загрузить планы выработки.
        </Typography.Text>
      ) : isPlansPending || isUsersPending ? (
        <Spin />
      ) : (
        <Table
          className="work-plans__table"
          columns={columns}
          dataSource={rows}
          pagination={false}
          scroll={{ x: 1950 }}
          rowClassName={(row) => (row.userId ? "" : "work-plans__company-row")}
        />
      )}
    </main>
  );
};
