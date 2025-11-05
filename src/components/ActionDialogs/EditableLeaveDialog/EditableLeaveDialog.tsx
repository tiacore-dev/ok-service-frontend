import React, { useCallback, useContext, useState } from "react";
import { ActionDialog } from "../ActionDialog";
import { EditTwoTone, PlusCircleTwoTone } from "@ant-design/icons";
import { DatePicker, Form, Input, Select, Space } from "antd";
import { ILeave } from "../../../interfaces/leaves/ILeave";

import "./EditableLeaveDialog.less";
import { getModalContentWidth } from "../../../utils/pageSettings";
import { RoleId } from "../../../interfaces/roles/IRole";
import { useUsersMap } from "../../../queries/users";
import { useNavigate } from "react-router-dom";
import {
  useCreateLeaveMutation,
  useUpdateLeaveMutation,
  type EditableLeavePayload,
} from "../../../queries/leaves";
import { NotificationContext } from "../../../contexts/NotificationContext";
import { useSelector } from "react-redux";
import { getCurrentUserId } from "../../../store/modules/auth";
import { LeaveReasonId } from "../../../interfaces/leaveReasones/ILeaveReason";
import { leaveReasonOptions } from "../../../queries/leaveReasons";
import { dateFormat } from "../../../utils/dateConverter";
import dayjs from "dayjs";
import { selectFilterHandler } from "../../../utils/selectFilterHandler";

const modalContentWidth = getModalContentWidth();

interface IEditableLeaveDialogProps {
  leave?: ILeave;
  iconOnly?: boolean;
}

export interface IEditableLeave extends Partial<ILeave> {
  sent: boolean;
}

export const EditableLeaveDialog = (props: IEditableLeaveDialogProps) => {
  const { leave, iconOnly } = props;
  const buttonText = leave ? "Редактировать" : "Создать";
  const popoverText = leave ? "Редактировать объект" : "Создать объект";
  const buttonIcon = leave ? (
    <EditTwoTone twoToneColor="#ff1616" />
  ) : (
    <PlusCircleTwoTone twoToneColor="#ff1616" />
  );
  const modalTitle = leave ? "Редактирование объекта" : "Создание объекта";

  const userId = useSelector(getCurrentUserId);

  const [data, setData] = useState<IEditableLeave>({
    responsible: userId,
    comment: "",
    deleted: false,
    sent: false,
  });

  const { sent, leave_id, ...leaveData } = data;
  const navigate = useNavigate();
  const notificationApi = useContext(NotificationContext);
  const createLeaveMutation = useCreateLeaveMutation();
  const updateLeaveMutation = useUpdateLeaveMutation();

  const handleConfirm = useCallback(async () => {
    setData((data) => ({ ...data, sent: true }));

    try {
      if (leave?.leave_id ?? leave_id) {
        const targetId = leave?.leave_id ?? leave_id;
        await updateLeaveMutation.mutateAsync({
          leaveId: targetId!,
          payload: leaveData as EditableLeavePayload,
        });
        notificationApi?.success({
          message: "Успешно",
          description: "Лист отсутствия изменен",
          placement: "bottomRight",
          duration: 2,
        });
      } else {
        await createLeaveMutation.mutateAsync(
          leaveData as EditableLeavePayload,
        );
        notificationApi?.success({
          message: "Успешно",
          description: "Лист отсутствия создан",
          placement: "bottomRight",
          duration: 2,
        });
      }
      navigate("/leaves");
    } catch (error) {
      setData((data) => ({ ...data, sent: false }));
      const description =
        error instanceof Error
          ? error.message
          : "Возникла ошибка при сохранении объекта";
      notificationApi?.error({
        message: "Ошибка",
        description,
        placement: "bottomRight",
        duration: 2,
      });
    }
  }, [
    leave,
    leaveData,
    updateLeaveMutation,
    notificationApi,
    createLeaveMutation,
    navigate,
    setData,
  ]);

  const handeOpen = useCallback(() => {
    if (leave) {
      setData({ ...leave, sent: false });
    }
  }, [leave, setData]);

  const { users } = useUsersMap();
  const userOptions = users.map((el) => ({
    label: el.name,
    value: el.user_id,
  }));

  return (
    <ActionDialog
      modalOkText="Сохранить"
      onConfirm={handleConfirm}
      onOpen={handeOpen}
      buttonText={iconOnly ? "" : buttonText}
      popoverText={iconOnly && popoverText}
      buttonType="primary"
      buttonIcon={buttonIcon}
      modalTitle={modalTitle}
      modalText={
        <Space className="editable_leave_dialog">
          <Form layout="horizontal" style={{ width: modalContentWidth }}>
            <Form.Item
              label="Сотрудник"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              <Select
                showSearch
                value={data.user}
                filterOption={selectFilterHandler}
                onChange={(value: string) =>
                  setData((data) => ({ ...data, user: value }))
                }
                options={userOptions}
                disabled={sent}
              />
            </Form.Item>
            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Причина"
            >
              <Select
                value={data.reason}
                onChange={(value: LeaveReasonId) =>
                  setData((data) => ({ ...data, reason: value }))
                }
                options={leaveReasonOptions}
                allowClear
                placeholder="Выберите город"
              />
            </Form.Item>
            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Дата"
            >
              <DatePicker
                value={data.start_date ? dayjs(data.start_date) : null}
                onChange={(value: dayjs.Dayjs) =>
                  setData((data) => ({
                    ...data,
                    start_date: value ? value.valueOf() : null,
                  }))
                }
                format={dateFormat}
                onFocus={(e) => e.target.blur()}
              />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Дата"
            >
              <DatePicker
                value={data.end_date ? dayjs(data.end_date) : null}
                onChange={(value: dayjs.Dayjs) =>
                  setData((data) => ({
                    ...data,
                    end_date: value ? value.valueOf() : null,
                  }))
                }
                format={dateFormat}
                onFocus={(e) => e.target.blur()}
              />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
              label="Комментарий"
            >
              <Input
                value={data.comment}
                onChange={(event) =>
                  setData((data) => ({ ...data, comment: event.target.value }))
                }
                disabled={sent}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Ответственный"
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 18 }}
            >
              {
                userOptions.find((user) => user.value === data.responsible)
                  ?.label
              }
            </Form.Item>
          </Form>
        </Space>
      }
    />
  );
};
