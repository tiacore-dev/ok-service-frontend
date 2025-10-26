import React from "react";
import {
  CheckCircleFilled,
  ClockCircleFilled,
  PlusCircleFilled,
} from "@ant-design/icons";

export type ShiftStatus = "empty" | "not-signed" | "signed";

export const StatusIcon: React.FC<{ status: ShiftStatus }> = ({ status }) => {
  switch (status) {
    case "empty":
      return <PlusCircleFilled style={{ fontSize: 20, color: "#ffac40" }} />;
    case "not-signed":
      return <ClockCircleFilled style={{ fontSize: 20, color: "#6940ff" }} />;
    case "signed":
      return <CheckCircleFilled style={{ fontSize: 20, color: "#2bba23" }} />;
    default:
      return null;
  }
};
