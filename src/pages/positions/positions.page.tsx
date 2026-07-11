import React from "react";
import { Breadcrumb, Layout, Space, Table } from "antd";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getCurrentRole } from "../../store/modules/auth";
import { RoleId } from "../../interfaces/roles/IRole";
import { isMobile } from "../../utils/isMobile";
import {
  useDeletePositionMutation,
  usePositionsQuery,
} from "../../queries/positions";
import { useUsersMap } from "../../queries/users";
import type { IPositionsListColumn } from "../../interfaces/positions/IPositionsList";
import { EditablePositionDialog } from "../../components/ActionDialogs/EditablePositionDialog/EditablePositionDialog";
import { positionsDesktopColumns } from "./components/desktop.columns";
import { positionsMobileColumns } from "./components/mobile.columns";
import "./positions.page.less";

export const Positions = () => {
  const { Content } = Layout;
  const { data: positionsList, isFetching } = usePositionsQuery();
  const { usersMap } = useUsersMap();
  const currentRole = useSelector(getCurrentRole);
  const canManage = currentRole === RoleId.ADMIN;
  const { mutate: deletePosition } = useDeletePositionMutation();
  const positionsData = React.useMemo<IPositionsListColumn[]>(
    () =>
      (positionsList ?? []).map((position) => ({
        ...position,
        key: position.position_id,
      })),
    [positionsList],
  );
  const columns = React.useMemo(
    () =>
      isMobile()
        ? positionsMobileColumns(usersMap, deletePosition, canManage)
        : positionsDesktopColumns(usersMap, deletePosition, canManage),
    [usersMap, deletePosition, canManage],
  );

  return (
    <>
      <Breadcrumb
        className="breadcrumb"
        items={[
          { title: <Link to="/home">Главная</Link> },
          { title: "Должности" },
        ]}
      />
      <Content className="positions">
        {canManage && (
          <Space className="positions_filters">
            <EditablePositionDialog />
          </Space>
        )}
        <Table
          dataSource={positionsData}
          columns={columns}
          loading={isFetching}
        />
      </Content>
    </>
  );
};
