import React from "react";
import {
  CheckCircleFilled,
  ClockCircleFilled,
  PlusCircleFilled,
} from "@ant-design/icons";
import "./statusIcon.less";

export type ShiftStatus = "empty" | "not-signed" | "signed";

export const StatusIcon: React.FC<{ status: ShiftStatus }> = ({ status }) => {
  switch (status) {
    case "empty":
      return (
        <PlusCircleFilled className="status-icon status-icon--empty" />
      );
    case "not-signed":
      return (
        <ClockCircleFilled className="status-icon status-icon--not-signed" />
      );
    case "signed":
      return (
        <CheckCircleFilled className="status-icon status-icon--signed" />
      );
    default:
      return null;
  }
};
