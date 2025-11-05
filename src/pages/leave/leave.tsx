import * as React from "react";
import { Breadcrumb, Card, Layout, Space, Spin } from "antd";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { minPageHeight } from "../../utils/pageSettings";
import { isMobile } from "../../utils/isMobile";
import { EditableLeaveDialog } from "../../components/ActionDialogs/EditableLeaveDialog/EditableLeaveDialog";
import { DeleteLeaveDialog } from "../../components/ActionDialogs/DeleteLeaveDialog";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import { useUsersMap } from "../../queries/users";
import { useDeleteLeaveMutation, useLeaveQuery } from "../../queries/leaves";
import { NotificationContext } from "../../contexts/NotificationContext";
import { useContext, useMemo } from "react";
import { leaveReasonesMap } from "../../queries/leaveReasons";

export const Leave = () => {
  const { Content } = Layout;
  const routeParams = useParams();
  const navigate = useNavigate();
  const { usersMap } = useUsersMap();
  const notificationApi = useContext(NotificationContext);
  const leaveId = routeParams.leaveId;
  const {
    data: leaveData,
    isPending,
    isFetching,
  } = useLeaveQuery(leaveId, {
    enabled: Boolean(leaveId),
  });
  const { mutateAsync: deleteLeaveMutation } = useDeleteLeaveMutation();
  const currentRole = useSelector(getCurrentRole);

  const isLoaded = useMemo(
    () => Boolean(leaveData && leaveId === leaveData.leave_id),
    [leaveData, leaveId],
  );

  const handleDelete = React.useCallback(async () => {
    if (!leaveData?.leave_id) return;
    try {
      await deleteLeaveMutation(leaveData.leave_id);
      notificationApi?.success({
        message: "Успешно",
        description: "Лист отсутствия удалён",
        placement: "bottomRight",
        duration: 2,
      });
      navigate("/leaves");
    } catch (error) {
      const description =
        error instanceof Error
          ? error.message
          : "Возникла ошибка при удалении листа отсутствия";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  }, [deleteLeaveMutation, notificationApi, leaveData, navigate]);

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        style={isMobile() && { backgroundColor: "#F8F8F8" }}
        items={[
          { title: <Link to="/home">Главная</Link> },
          {
            title: <Link to="/leaves">Листы отсутствия</Link>,
          },
          { title: "Лист отсутствия" },
        ]}
      />
      {isLoaded && leaveData && leaveId === leaveData.leave_id ? (
        <Content
          style={{
            padding: "0 24px",
            margin: 0,
            minHeight: minPageHeight(),
            background: "#FFF",
          }}
        >
          <Space
            direction={isMobile() ? "vertical" : "horizontal"}
            size="small"
          >
            {currentRole !== RoleId.USER && (
              <EditableLeaveDialog leave={leaveData} />
            )}
            {currentRole !== RoleId.USER && (
              <DeleteLeaveDialog onDelete={handleDelete} />
            )}
          </Space>
          <Card style={{ margin: "8px 0" }}>
            <p>
              Причина:{" "}
              {leaveData.reason
                ? leaveReasonesMap[leaveData.reason]?.name
                : "—"}
            </p>
            <p>Сотрудник: {usersMap[leaveData.user]?.name}</p>
            <p>Дата начала: {leaveData.start_date}</p>
            <p>Дата окончания: {leaveData.end_date}</p>

            <p>Ответственный: {usersMap[leaveData.responsible]?.name}</p>
            <p>Комментарий: {leaveData.comment}</p>
          </Card>
        </Content>
      ) : (
        <Spin spinning={isPending || isFetching} />
      )}
    </>
  );
};
