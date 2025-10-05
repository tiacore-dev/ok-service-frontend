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
      return <PlusCircleFilled style={{ fontSize: 20, color: "#ffd940" }} />;
    case "not-signed":
      return <ClockCircleFilled style={{ fontSize: 20, color: "#2bba23" }} />;
    case "signed":
      return <CheckCircleFilled style={{ fontSize: 20, color: "#4090ff" }} />;
    default:
      return null;
  }
};
