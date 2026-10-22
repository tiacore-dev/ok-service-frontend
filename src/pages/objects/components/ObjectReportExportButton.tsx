import { DatePicker, Form, Select } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import * as React from "react";
import { TemplateExportButton } from "../../../components/TemplateExport/TemplateExportButton";
import { useProjectsMap } from "../../../queries/projects";
import { useUsersMap } from "../../../queries/users";
import { formatDate } from "../../../utils/dateConverter";

interface ObjectReportFormValues {
  period?: [Dayjs, Dayjs];
  users?: string[];
  projects?: string[];
}

export const ObjectReportExportButton = () => {
  const { usersMap } = useUsersMap();
  const { projects } = useProjectsMap();

  return (
    <TemplateExportButton
      templateType="object_report"
      title="Отчёт по объектам"
      getParameters={(values) => {
        const {
          period,
          users = [],
          projects = [],
        } = values as ObjectReportFormValues;
        return {
          date_from: period ? formatDate(period[0].toDate()) : "",
          date_to: period ? formatDate(period[1].toDate()) : "",
          users,
          projects,
        };
      }}
      parameterFields={
        <>
          <Form.Item
            label="Период"
            name="period"
            rules={[{ required: true, message: "Выберите период" }]}
          >
            <DatePicker.RangePicker
              format="DD.MM.YYYY"
              placeholder={["Дата с", "Дата по"]}
              disabledDate={(date) => date.isAfter(dayjs("9999-12-30"), "day")}
            />
          </Form.Item>
          <Form.Item label="Исполнители" name="users">
            <Select
              mode="multiple"
              allowClear
              placeholder="Все исполнители"
              options={Object.values(usersMap).map((user) => ({
                value: user.user_id,
                label: user.name,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item label="Спецификации" name="projects">
            <Select
              mode="multiple"
              allowClear
              placeholder="Все спецификации"
              options={projects.map((project) => ({
                value: project.project_id,
                label: project.name,
              }))}
              showSearch
              optionFilterProp="label"
            />
          </Form.Item>
        </>
      }
    />
  );
};
